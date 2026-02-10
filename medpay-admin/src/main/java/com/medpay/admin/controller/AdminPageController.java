package com.medpay.admin.controller;

import com.medpay.reconciliation.dto.DashboardKpiResponse;
import com.medpay.reconciliation.service.ReportService;
import com.medpay.reconciliation.service.ReconciliationService;
import com.medpay.reconciliation.service.SettlementService;
import com.medpay.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminPageController {

    private final ReportService reportService;
    private final ReconciliationService reconciliationService;
    private final RefundService refundService;

    @GetMapping("/dashboard")
    public String dashboard(Model model,
            @RequestParam(required = false) UUID hospitalId) {
        if (hospitalId != null) {
            DashboardKpiResponse kpi = reportService.getDashboardKpi(hospitalId);
            model.addAttribute("kpi", kpi);
        }
        model.addAttribute("hospitalId", hospitalId);
        return "admin/dashboard";
    }

    @GetMapping("/orders")
    public String orders(Model model) {
        return "admin/orders/list";
    }

    @GetMapping("/refunds")
    public String refunds(Model model,
            @RequestParam(required = false) UUID hospitalId) {
        if (hospitalId != null) {
            model.addAttribute("refunds", refundService.getRefundsByHospital(hospitalId, null, PageRequest.of(0, 20)));
        }
        model.addAttribute("hospitalId", hospitalId);
        return "admin/refunds/list";
    }

    @GetMapping("/reconciliation")
    public String reconciliation(Model model) {
        model.addAttribute("batches", reconciliationService.getBatches(PageRequest.of(0, 20)));
        return "admin/reconciliation/list";
    }

    @GetMapping("/reports")
    public String reports(Model model) {
        return "admin/reports/revenue";
    }

    @GetMapping("/login")
    public String login() {
        return "admin/login";
    }
}
