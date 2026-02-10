package com.medpay.common.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostgresAdvisoryLock {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Acquires a PostgreSQL transaction-level advisory lock.
     * The lock is automatically released when the current transaction ends.
     * Must be called within a @Transactional method.
     */
    public boolean tryLock(String lockKey) {
        long hash = hashToLong(lockKey);
        Boolean acquired = jdbcTemplate.queryForObject(
                "SELECT pg_try_advisory_xact_lock(?)", Boolean.class, hash);
        if (Boolean.TRUE.equals(acquired)) {
            log.debug("Advisory lock acquired: key={}, hash={}", lockKey, hash);
        } else {
            log.warn("Advisory lock NOT acquired (held by another): key={}, hash={}", lockKey, hash);
        }
        return Boolean.TRUE.equals(acquired);
    }

    private long hashToLong(String key) {
        // Simple hash to convert string to long for advisory lock
        long hash = 0;
        for (char c : key.toCharArray()) {
            hash = 31 * hash + c;
        }
        return hash;
    }
}
