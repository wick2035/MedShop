package com.medpay.catalog.service;

import com.medpay.catalog.domain.Product;
import com.medpay.catalog.domain.ProductType;
import com.medpay.catalog.dto.ProductRequest;
import com.medpay.catalog.dto.ProductResponse;
import com.medpay.catalog.repository.ProductRepository;
import com.medpay.common.exception.BusinessException;
import com.medpay.common.exception.ErrorCode;
import com.medpay.common.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Product findByIdOrThrow(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    @Transactional
    public void releaseStock(UUID productId, int quantity) {
        int updated = productRepository.releaseStock(productId, quantity);
        if (updated > 0) {
            log.info("Released stock: productId={}, quantity={}", productId, quantity);
        } else {
            log.warn("Failed to release stock: productId={} not found", productId);
        }
    }

    @Transactional
    public boolean deductStock(UUID productId, int quantity) {
        int updated = productRepository.deductStock(productId, quantity);
        if (updated > 0) {
            log.info("Deducted stock: productId={}, quantity={}", productId, quantity);
            return true;
        }
        log.warn("Insufficient stock: productId={}, requested={}", productId, quantity);
        return false;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(UUID hospitalIdParam, String keyword, ProductType type, Pageable pageable) {
        UUID hospitalId = hospitalIdParam != null ? hospitalIdParam : TenantContext.getCurrentHospitalId();
        if (hospitalId == null) {
            return Page.empty(pageable);
        }
        Page<Product> page = productRepository.search(hospitalId, keyword, type, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        UUID hospitalId = TenantContext.requireCurrentHospitalId();

        Product product = new Product();
        product.setHospitalId(hospitalId);
        mapRequestToEntity(request, product);

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        Product product = findByIdOrThrow(id);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = findByIdOrThrow(id);
        mapRequestToEntity(request, product);

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse updateStock(UUID id, int quantity) {
        Product product = findByIdOrThrow(id);
        product.setStockQuantity(quantity);
        product = productRepository.save(product);
        return toResponse(product);
    }

    private void mapRequestToEntity(ProductRequest request, Product entity) {
        entity.setCategoryId(request.categoryId());
        entity.setName(request.name());
        entity.setCode(request.code());
        entity.setProductType(request.productType());
        entity.setGenericName(request.genericName());
        entity.setManufacturer(request.manufacturer());
        entity.setSpecification(request.specification());
        entity.setUnit(request.unit());
        entity.setPrice(request.price());
        entity.setCostPrice(request.costPrice());
        if (request.stockQuantity() != null) {
            entity.setStockQuantity(request.stockQuantity());
        }
        entity.setLowStockThreshold(request.lowStockThreshold());
        entity.setRequiresPrescription(request.requiresPrescription());
        entity.setInsuranceCovered(request.insuranceCovered());
        entity.setInsuranceCategory(request.insuranceCategory());
        entity.setInsuranceRatio(request.insuranceRatio());
        entity.setContraindications(request.contraindications());
        entity.setSideEffects(request.sideEffects());
        entity.setStorageConditions(request.storageConditions());
        entity.setExpiryWarningDays(request.expiryWarningDays());
        entity.setImageUrls(request.imageUrls());
        entity.setBarcode(request.barcode());
    }

    private ProductResponse toResponse(Product entity) {
        return new ProductResponse(
                entity.getId(),
                entity.getHospitalId(),
                entity.getCategoryId(),
                entity.getName(),
                entity.getCode(),
                entity.getProductType(),
                entity.getGenericName(),
                entity.getManufacturer(),
                entity.getSpecification(),
                entity.getUnit(),
                entity.getPrice(),
                entity.getCostPrice(),
                entity.getStockQuantity(),
                entity.getLowStockThreshold(),
                Boolean.TRUE.equals(entity.getRequiresPrescription()),
                Boolean.TRUE.equals(entity.getInsuranceCovered()),
                entity.getInsuranceCategory(),
                entity.getInsuranceRatio(),
                entity.getContraindications(),
                entity.getSideEffects(),
                entity.getStorageConditions(),
                entity.getExpiryWarningDays(),
                entity.getImageUrls(),
                entity.getBarcode(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
