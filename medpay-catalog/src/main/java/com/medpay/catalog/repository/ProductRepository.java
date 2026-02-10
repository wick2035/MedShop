package com.medpay.catalog.repository;

import com.medpay.catalog.domain.Product;
import com.medpay.catalog.domain.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity + :quantity WHERE p.id = :productId")
    int releaseStock(@Param("productId") UUID productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :productId AND p.stockQuantity >= :quantity")
    int deductStock(@Param("productId") UUID productId, @Param("quantity") int quantity);

    @Query("SELECT p FROM Product p WHERE p.hospitalId = :hid " +
            "AND (:keyword IS NULL OR p.name LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:type IS NULL OR p.productType = :type) " +
            "AND p.status = 'ACTIVE'")
    Page<Product> search(@Param("hid") UUID hospitalId,
                         @Param("keyword") String keyword,
                         @Param("type") ProductType type,
                         Pageable pageable);
}
