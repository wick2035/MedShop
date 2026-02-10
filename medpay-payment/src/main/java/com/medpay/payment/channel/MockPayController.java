package com.medpay.payment.channel;

import com.medpay.common.util.CryptoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/mock-pay")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "medpay.payment.channel", havingValue = "mock")
public class MockPayController {

    private final MockPaymentChannel mockPaymentChannel;

    @Value("${medpay.payment.mock-secret:mock-secret-key}")
    private String mockSecret;

    @GetMapping("/{transactionNo}")
    public ResponseEntity<String> showPayPage(@PathVariable String transactionNo) {
        MockPaymentChannel.MockTransaction tx = mockPaymentChannel.getMockTransaction(transactionNo);
        if (tx == null) {
            return ResponseEntity.notFound().build();
        }
        String html = "<html><body style='text-align:center;padding:50px;font-family:Arial'>"
                + "<h2>Mock Payment</h2>"
                + "<p>Transaction: " + transactionNo + "</p>"
                + "<p>Amount: ¥" + tx.amount + "</p>"
                + "<form method='POST' action='/mock-pay/" + transactionNo + "/pay'>"
                + "<button type='submit' style='padding:10px 30px;font-size:18px;background:#4CAF50;color:white;border:none;cursor:pointer'>Pay Now</button>"
                + "</form></body></html>";
        return ResponseEntity.ok().header("Content-Type", "text/html;charset=UTF-8").body(html);
    }

    @PostMapping("/{transactionNo}/pay")
    public ResponseEntity<String> simulatePay(@PathVariable String transactionNo) {
        MockPaymentChannel.MockTransaction tx = mockPaymentChannel.getMockTransaction(transactionNo);
        if (tx == null) {
            return ResponseEntity.notFound().build();
        }
        mockPaymentChannel.markAsPaid(transactionNo);
        log.info("Mock payment completed: txNo={}", transactionNo);

        // Async callback to system
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(500);
                String callbackBody = transactionNo + "|" + tx.amount + "|SUCCESS";
                String signature = CryptoUtil.hmacSha256(callbackBody, mockSecret);
                RestTemplate restTemplate = new RestTemplate();
                restTemplate.postForEntity(
                        "http://localhost:8080/api/v1/payments/callback/MOCK?signature=" + signature,
                        callbackBody, String.class);
                log.info("Mock callback sent for: {}", transactionNo);
            } catch (Exception e) {
                log.error("Mock callback failed for: {}", transactionNo, e);
            }
        });

        String html = "<html><body style='text-align:center;padding:50px;font-family:Arial'>"
                + "<h2>Payment Successful!</h2>"
                + "<p>Transaction: " + transactionNo + "</p>"
                + "<p>Amount: ¥" + tx.amount + "</p>"
                + "</body></html>";
        return ResponseEntity.ok().header("Content-Type", "text/html;charset=UTF-8").body(html);
    }
}
