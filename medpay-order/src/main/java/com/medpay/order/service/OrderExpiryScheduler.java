package com.medpay.order.service;

import com.medpay.order.domain.Order;
import com.medpay.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpiryScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    /**
     * Periodically scan for expired orders (PENDING_PAYMENT past their expireAt)
     * and cancel them automatically.
     */
    @Scheduled(fixedDelay = 60000)
    public void cancelExpiredOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> expiredOrders = orderRepository.findExpiredOrders(now, PageRequest.of(0, 100));

        if (expiredOrders.isEmpty()) {
            return;
        }

        int successCount = 0;
        for (Order order : expiredOrders) {
            try {
                orderService.cancelOrder(order.getId(), "订单超时自动取消");
                successCount++;
            } catch (Exception e) {
                log.error("Failed to cancel expired order: orderNo={}, error={}",
                        order.getOrderNo(), e.getMessage(), e);
            }
        }

        log.info("Expired order cleanup completed: total={}, cancelled={}",
                expiredOrders.size(), successCount);
    }
}
