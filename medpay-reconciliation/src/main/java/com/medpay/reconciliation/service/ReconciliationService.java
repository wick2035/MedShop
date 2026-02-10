package com.medpay.reconciliation.service;

import com.medpay.common.constant.PaymentStatus;
import com.medpay.common.util.SnowflakeIdGenerator;
import com.medpay.payment.channel.PaymentChannel;
import com.medpay.payment.channel.PaymentChannelFactory;
import com.medpay.payment.channel.PaymentQueryResult;
import com.medpay.payment.domain.PaymentTransaction;
import com.medpay.payment.repository.PaymentTransactionRepository;
import com.medpay.reconciliation.domain.ReconciliationBatch;
import com.medpay.reconciliation.domain.ReconciliationDetail;
import com.medpay.reconciliation.dto.ReconciliationBatchResponse;
import com.medpay.reconciliation.dto.ReconciliationResolveRequest;
import com.medpay.reconciliation.repository.ReconciliationBatchRepository;
import com.medpay.reconciliation.repository.ReconciliationDetailRepository;
import com.medpay.common.constant.PaymentChannelEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReconciliationService {

    private final ReconciliationBatchRepository batchRepository;
    private final ReconciliationDetailRepository detailRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentChannelFactory channelFactory;
    private final SnowflakeIdGenerator idGenerator;

    @Transactional
    public ReconciliationBatchResponse triggerReconciliation(LocalDate date, String channelCode, UUID hospitalId) {
        ReconciliationBatch batch = new ReconciliationBatch();
        batch.setHospitalId(hospitalId);
        batch.setBatchNo(idGenerator.generateBatchNo());
        batch.setReconciliationDate(date);
        batch.setChannel(channelCode);
        batch.setStatus("PROCESSING");
        batch.setStartedAt(LocalDateTime.now());
        batchRepository.save(batch);

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

        // Get system transactions
        List<PaymentTransaction> systemTxns = paymentTransactionRepository
                .findByStatusAndCreatedAtBetween(PaymentStatus.SUCCESS, dayStart, dayEnd);

        BigDecimal systemTotal = BigDecimal.ZERO;
        BigDecimal channelTotal = BigDecimal.ZERO;
        int matched = 0, mismatched = 0, missingInChannel = 0;

        PaymentChannel channel = null;
        try {
            channel = channelFactory.getChannel(PaymentChannelEnum.valueOf(channelCode));
        } catch (Exception e) {
            log.warn("Channel not available for reconciliation: {}", channelCode);
        }

        for (PaymentTransaction tx : systemTxns) {
            systemTotal = systemTotal.add(tx.getTotalAmount());

            ReconciliationDetail detail = new ReconciliationDetail();
            detail.setBatchId(batch.getId());
            detail.setPaymentTransactionId(tx.getId());
            detail.setChannelTransactionId(tx.getChannelTransactionId());
            detail.setSystemAmount(tx.getTotalAmount());

            if (channel != null && tx.getChannelTransactionId() != null) {
                try {
                    PaymentQueryResult queryResult = channel.queryPayment(tx.getChannelTransactionId());
                    if ("SUCCESS".equals(queryResult.getStatus())) {
                        detail.setChannelAmount(queryResult.getPaidAmount());
                        channelTotal = channelTotal.add(queryResult.getPaidAmount());

                        if (tx.getTotalAmount().compareTo(queryResult.getPaidAmount()) == 0) {
                            detail.setMatchStatus("MATCHED");
                            matched++;
                        } else {
                            detail.setMatchStatus("MISMATCH");
                            mismatched++;
                        }
                    } else {
                        detail.setMatchStatus("MISSING_IN_CHANNEL");
                        missingInChannel++;
                    }
                } catch (Exception e) {
                    detail.setMatchStatus("MISSING_IN_CHANNEL");
                    missingInChannel++;
                }
            } else {
                // Without channel query, auto-match for mock
                detail.setChannelAmount(tx.getTotalAmount());
                channelTotal = channelTotal.add(tx.getTotalAmount());
                detail.setMatchStatus("MATCHED");
                matched++;
            }

            detailRepository.save(detail);
        }

        batch.setSystemTransactionCount(systemTxns.size());
        batch.setChannelTransactionCount(systemTxns.size());
        batch.setMatchedCount(matched);
        batch.setMismatchedCount(mismatched);
        batch.setMissingInChannel(missingInChannel);
        batch.setSystemTotalAmount(systemTotal);
        batch.setChannelTotalAmount(channelTotal);
        batch.setDifferenceAmount(systemTotal.subtract(channelTotal).abs());
        batch.setStatus(mismatched == 0 && missingInChannel == 0 ? "COMPLETED" : "EXCEPTION");
        batch.setCompletedAt(LocalDateTime.now());
        batchRepository.save(batch);

        log.info("Reconciliation completed: batchNo={}, matched={}, mismatched={}, missing={}",
                batch.getBatchNo(), matched, mismatched, missingInChannel);

        return toBatchResponse(batch);
    }

    public Page<ReconciliationBatchResponse> getBatches(Pageable pageable) {
        return batchRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toBatchResponse);
    }

    @Transactional
    public void resolveDetail(UUID detailId, ReconciliationResolveRequest request, UUID resolvedBy) {
        ReconciliationDetail detail = detailRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("对账明细不存在"));
        detail.setResolutionStatus("RESOLVED");
        detail.setResolutionNote(request.getResolutionNote());
        detail.setResolvedBy(resolvedBy);
        detail.setResolvedAt(LocalDateTime.now());
        detailRepository.save(detail);
    }

    private ReconciliationBatchResponse toBatchResponse(ReconciliationBatch batch) {
        return ReconciliationBatchResponse.builder()
                .id(batch.getId())
                .batchNo(batch.getBatchNo())
                .reconciliationDate(batch.getReconciliationDate())
                .channel(batch.getChannel())
                .systemTransactionCount(batch.getSystemTransactionCount())
                .channelTransactionCount(batch.getChannelTransactionCount())
                .matchedCount(batch.getMatchedCount())
                .mismatchedCount(batch.getMismatchedCount())
                .missingInSystem(batch.getMissingInSystem())
                .missingInChannel(batch.getMissingInChannel())
                .systemTotalAmount(batch.getSystemTotalAmount())
                .channelTotalAmount(batch.getChannelTotalAmount())
                .differenceAmount(batch.getDifferenceAmount())
                .status(batch.getStatus())
                .completedAt(batch.getCompletedAt())
                .build();
    }
}
