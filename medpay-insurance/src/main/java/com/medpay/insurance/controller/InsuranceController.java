package com.medpay.insurance.controller;

import com.medpay.common.domain.ApiResponse;
import com.medpay.insurance.domain.InsuranceClaim;
import com.medpay.insurance.domain.Reimbursement;
import com.medpay.insurance.dto.InsuranceCalculateRequest;
import com.medpay.insurance.dto.InsuranceCoverageResult;
import com.medpay.insurance.repository.InsuranceClaimRepository;
import com.medpay.insurance.repository.ReimbursementRepository;
import com.medpay.insurance.service.InsuranceCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/insurance")
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceCalculationService calculationService;
    private final InsuranceClaimRepository claimRepository;
    private final ReimbursementRepository reimbursementRepository;

    @PostMapping("/calculate")
    public ApiResponse<InsuranceCoverageResult> calculate(@Valid @RequestBody InsuranceCalculateRequest request) {
        InsuranceCoverageResult result = calculationService.calculate(request.getOrderId());
        return ApiResponse.success(result);
    }

    @GetMapping("/claims")
    public ApiResponse<Page<InsuranceClaim>> getClaims(
            @RequestParam UUID hospitalId, Pageable pageable) {
        return ApiResponse.success(claimRepository.findByHospitalId(hospitalId, pageable));
    }

    @GetMapping("/reimbursements")
    public ApiResponse<Page<Reimbursement>> getReimbursements(
            @RequestParam UUID hospitalId, Pageable pageable) {
        return ApiResponse.success(reimbursementRepository.findByHospitalId(hospitalId, pageable));
    }
}
