package com.medpay.payment.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKeyEntity, UUID> {

    @Modifying
    @Query(value = "INSERT INTO idempotency_key (id, idempotency_key, request_hash, status, created_at, expires_at) " +
            "VALUES (gen_random_uuid(), :key, :hash, 'PROCESSING', NOW(), :expiresAt) " +
            "ON CONFLICT (idempotency_key) DO NOTHING", nativeQuery = true)
    int tryInsert(@Param("key") String key, @Param("hash") String hash, @Param("expiresAt") LocalDateTime expiresAt);

    Optional<IdempotencyKeyEntity> findByIdempotencyKey(String idempotencyKey);

    @Modifying
    @Query("UPDATE IdempotencyKeyEntity e SET e.status = 'COMPLETED', e.responseStatus = :status, " +
            "e.responseBody = :body WHERE e.idempotencyKey = :key")
    int updateCompleted(@Param("key") String key, @Param("status") int status, @Param("body") String body);

    @Modifying
    @Query("DELETE FROM IdempotencyKeyEntity e WHERE e.expiresAt < :now")
    int deleteExpired(@Param("now") LocalDateTime now);
}
