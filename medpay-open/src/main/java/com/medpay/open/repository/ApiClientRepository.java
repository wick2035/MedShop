package com.medpay.open.repository;

import com.medpay.open.domain.ApiClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiClientRepository extends JpaRepository<ApiClient, UUID> {

    Optional<ApiClient> findByClientId(String clientId);

    Optional<ApiClient> findByClientIdAndStatus(String clientId, String status);
}
