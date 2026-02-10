package com.medpay.insurance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.insurance.domain.InsuranceClaim;
import com.medpay.insurance.domain.SplitPayment;
import com.medpay.insurance.dto.InsuranceCoverageResult;
import com.medpay.insurance.dto.SplitPayRequest;
import com.medpay.insurance.dto.SplitPayResponse;
import com.medpay.insurance.repository.InsuranceClaimRepository;
import com.medpay.insurance.repository.SplitPaymentRepository;
import com.medpay.order.domain.Order;
import com.medpay.order.service.OrderService;
import com.medpay.payment.dto.PaymentInitiateRequest;
import com.medpay.payment.dto.PaymentInitiateResponse;
import com.medpay.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SplitPaymentService {

    private final InsuranceCalculationService calculationService;
    private final InsuranceClaimRepository claimRepository;
    private final SplitPaymentRepository splitPaymentRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final SnowflakeIdGenerator idGenerator;
    private final ObjectMapper objectMapper;

    @Transactional
    public SplitPayResponse splitPay(SplitPayRequest request) {
        Order order = orderService.findOrderById(request.getOrderId());

        InsuranceCoverageResult coverage = calculationService.calculate(request.getOrderId());

        List<SplitPayResponse.SplitDetail> splits = new ArrayList<>();
        String selfPayTxNo = null;

        // Create insurance claim (mock auto-approve)
        if (request.isUseInsurance() && coverage.getInsurancePays().compareTo(BigDecimal.ZERO) > 0) {
            InsuranceClaim claim = new InsuranceClaim();
            claim.setHospitalId(order.getHospitalId());
            claim.setClaimNo(idGenerator.generateClaimNo());
            claim.setOrderId(order.getId());
            claim.setPatientId(order.getPatientId());
            claim.setInsuranceType(request.getInsuranceType());
            claim.setInsuranceNumber(request.getInsuranceNumber());
            claim.setInsuranceRegion(request.getInsuranceRegion());
            claim.setTotalAmount(coverage.getTotalAmount());
            claim.setEligibleAmount(coverage.getEligibleAmount());
            claim.setDeductibleAmount(coverage.getDeductibleAmount());
            claim.setCoverageRatio(coverage.getCoverageRatio());
            claim.setInsurancePays(coverage.getInsurancePays());
            claim.setPatientCopay(coverage.getPatientCopay());
            claim.setStatus("APPROVED"); // Mock auto-approve
            claim.setSubmittedAt(LocalDateTime.now());
            claim.setApprovedAt(LocalDateTime.now());

            try {
                claim.setItemBreakdown(objectMapper.writeValueAsString(coverage.getItemDetails()));
            } catch (Exception e) {
                claim.setItemBreakdown("[]");
            }
            claimRepository.save(claim);

            // Insurance split - auto paid
            SplitPayment insuranceSplit = new SplitPayment();
            insuranceSplit.setOrderId(order.getId());
            insuranceSplit.setHospitalId(order.getHospitalId());
            insuranceSplit.setPayerType("INSURANCE");
            insuranceSplit.setPayerReference(request.getInsuranceNumber());
            insuranceSplit.setAmount(coverage.getInsurancePays());
            insuranceSplit.setInsuranceClaimId(claim.getId());
            insuranceSplit.setStatus("PAID");
            insuranceSplit.setPaidAt(LocalDateTime.now());
            splitPaymentRepository.save(insuranceSplit);

            splits.add(SplitPayResponse.SplitDetail.builder()
                    .payerType("INSURANCE")
                    .amount(coverage.getInsurancePays())
                    .status("PAID")
                    .build());

            // Update order insurance amounts
            order.setInsuranceAmount(coverage.getInsurancePays());
            order.setSelfPayAmount(coverage.getPatientCopay());

            log.info("Insurance split created: claimNo={}, pays={}", claim.getClaimNo(), coverage.getInsurancePays());
        }

        // Self-pay split
        BigDecimal selfPayAmount = coverage.getPatientCopay();
        if (selfPayAmount.compareTo(BigDecimal.ZERO) > 0) {
            // Create self-pay split
            SplitPayment selfPaySplit = new SplitPayment();
            selfPaySplit.setOrderId(order.getId());
            selfPaySplit.setHospitalId(order.getHospitalId());
            selfPaySplit.setPayerType("SELF_PAY");
            selfPaySplit.setAmount(selfPayAmount);
            selfPaySplit.setStatus("PENDING");
            splitPaymentRepository.save(selfPaySplit);

            // Initiate payment for self-pay portion
            PaymentInitiateRequest payRequest = new PaymentInitiateRequest();
            payRequest.setOrderId(order.getId());
            payRequest.setPaymentChannel(request.getPaymentChannel());
            String idempotencyKey = "split-" + order.getId() + "-selfpay";
            PaymentInitiateResponse payResponse = paymentService.initiatePayment(payRequest, idempotencyKey);
            selfPayTxNo = payResponse.getTransactionNo();

            splits.add(SplitPayResponse.SplitDetail.builder()
                    .payerType("SELF_PAY")
                    .amount(selfPayAmount)
                    .status("PENDING")
                    .build());

            log.info("Self-pay split created: txNo={}, amount={}", selfPayTxNo, selfPayAmount);
        }

        return SplitPayResponse.builder()
                .splits(splits)
                .selfPayTransactionNo(selfPayTxNo)
                .build();
    }

    public List<SplitPayResponse.SplitDetail> getSplits(UUID orderId) {
        List<SplitPayment> splits = splitPaymentRepository.findByOrderId(orderId);
        return splits.stream()
                .map(s -> SplitPayResponse.SplitDetail.builder()
                        .payerType(s.getPayerType())
                        .amount(s.getAmount())
                        .status(s.getStatus())
                        .build())
                .toList();
    }
}
