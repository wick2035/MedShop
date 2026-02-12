package com.medpay.insurance.service;

import com.medpay.catalog.domain.MedicalService;
import com.medpay.catalog.domain.Product;
import com.medpay.catalog.repository.MedicalServiceRepository;
import com.medpay.catalog.repository.ProductRepository;
import com.medpay.insurance.dto.InsuranceCoverageResult;
import com.medpay.order.domain.Order;
import com.medpay.order.domain.OrderItem;
import com.medpay.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsuranceCalculationService {

    private final OrderService orderService;
    private final ProductRepository productRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    @Value("${medpay.insurance.deductible:500.00}")
    private BigDecimal deductible;

    @Value("${medpay.insurance.ceiling:50000.00}")
    private BigDecimal ceiling;

    @Value("${medpay.insurance.base-ratio:0.70}")
    private BigDecimal baseRatio;

    @Transactional(readOnly = true)
    public InsuranceCoverageResult calculate(UUID orderId) {
        Order order = orderService.findOrderById(orderId);
        List<InsuranceCoverageResult.ItemDetail> itemDetails = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal eligibleAmount = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            BigDecimal itemAmount = item.getSubtotal();
            totalAmount = totalAmount.add(itemAmount);

            String category = getInsuranceCategory(item);
            BigDecimal itemEligible;
            BigDecimal itemInsurancePays;

            if ("甲类".equals(category)) {
                // Category A: 100% eligible
                itemEligible = itemAmount;
            } else if ("乙类".equals(category)) {
                // Category B: 90% eligible (10% self-pay first)
                itemEligible = itemAmount.multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP);
            } else {
                // Category C or not covered: 0% eligible
                itemEligible = BigDecimal.ZERO;
            }

            eligibleAmount = eligibleAmount.add(itemEligible);

            itemDetails.add(InsuranceCoverageResult.ItemDetail.builder()
                    .itemName(item.getName())
                    .category(category != null ? category : "丙类")
                    .amount(itemAmount)
                    .eligibleAmount(itemEligible)
                    .insurancePays(BigDecimal.ZERO) // calculated after deductible
                    .patientPays(itemAmount)
                    .build());
        }

        // Apply deductible
        BigDecimal afterDeductible = eligibleAmount.subtract(deductible).max(BigDecimal.ZERO);

        // Apply coverage ratio
        BigDecimal insurancePays = afterDeductible.multiply(baseRatio).setScale(2, RoundingMode.HALF_UP);

        // Apply ceiling
        insurancePays = insurancePays.min(ceiling);

        BigDecimal patientCopay = totalAmount.subtract(insurancePays);
        BigDecimal coverageRatio = totalAmount.compareTo(BigDecimal.ZERO) > 0
                ? insurancePays.divide(totalAmount, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Distribute insurance pays back to items proportionally
        if (insurancePays.compareTo(BigDecimal.ZERO) > 0 && eligibleAmount.compareTo(BigDecimal.ZERO) > 0) {
            for (InsuranceCoverageResult.ItemDetail detail : itemDetails) {
                if (detail.getEligibleAmount().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal ratio = detail.getEligibleAmount().divide(eligibleAmount, 6, RoundingMode.HALF_UP);
                    BigDecimal itemInsurance = insurancePays.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                    detail.setInsurancePays(itemInsurance);
                    detail.setPatientPays(detail.getAmount().subtract(itemInsurance));
                }
            }
        }

        log.info("Insurance calculated: orderId={}, total={}, eligible={}, insurancePays={}, copay={}",
                orderId, totalAmount, eligibleAmount, insurancePays, patientCopay);

        return InsuranceCoverageResult.builder()
                .totalAmount(totalAmount)
                .eligibleAmount(eligibleAmount)
                .deductibleAmount(deductible)
                .insurancePays(insurancePays)
                .patientCopay(patientCopay)
                .coverageRatio(coverageRatio)
                .itemDetails(itemDetails)
                .build();
    }

    @Transactional
    public InsuranceCoverageResult calculateAndApply(UUID orderId) {
        InsuranceCoverageResult result = calculate(orderId);
        BigDecimal selfPay = result.getTotalAmount().subtract(result.getInsurancePays());
        orderService.updateInsuranceAmounts(orderId, result.getInsurancePays(), selfPay);
        log.info("Insurance applied to order: orderId={}, insurancePays={}, selfPay={}",
                orderId, result.getInsurancePays(), selfPay);
        return result;
    }

    private String getInsuranceCategory(OrderItem item) {
        try {
            if ("PRODUCT".equals(item.getItemType())) {
                return productRepository.findById(item.getReferenceId())
                        .filter(Product::getInsuranceCovered)
                        .map(Product::getInsuranceCategory)
                        .orElse(null);
            } else if ("SERVICE".equals(item.getItemType())) {
                return medicalServiceRepository.findById(item.getReferenceId())
                        .filter(MedicalService::getInsuranceCovered)
                        .map(MedicalService::getInsuranceCategory)
                        .orElse(null);
            }
        } catch (Exception e) {
            log.warn("Failed to get insurance category for item: {}", item.getReferenceId(), e);
        }
        return null;
    }
}
