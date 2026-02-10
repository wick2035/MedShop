-- ============================================================
-- MedPay 医疗商城支付系统 - 初始化数据库
-- V1: 全部核心表
-- ============================================================

-- =========================
-- 1. 医院/租户
-- =========================
CREATE TABLE hospital (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(50) UNIQUE NOT NULL,
    license_number      VARCHAR(100),
    address             TEXT,
    city                VARCHAR(100),
    province            VARCHAR(100),
    contact_phone       VARCHAR(30),
    contact_email       VARCHAR(200),
    logo_url            VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    subscription_tier   VARCHAR(30) DEFAULT 'STANDARD',
    config_json         JSONB DEFAULT '{}',
    timezone            VARCHAR(50) DEFAULT 'Asia/Shanghai',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by          UUID,
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_hospital_status ON hospital(status);

-- =========================
-- 2. 科室
-- =========================
CREATE TABLE department (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(50) NOT NULL,
    parent_id           UUID REFERENCES department(id),
    description         TEXT,
    sort_order          INT DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE(hospital_id, code)
);
CREATE INDEX idx_department_hospital ON department(hospital_id);

-- =========================
-- 3. 统一用户账户
-- =========================
CREATE TABLE user_account (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(100) UNIQUE,
    phone               VARCHAR(30) UNIQUE,
    email               VARCHAR(200) UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(30) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    avatar_url          VARCHAR(500),
    last_login_at       TIMESTAMP,
    last_login_ip       VARCHAR(50),
    failed_login_count  INT DEFAULT 0,
    locked_until        TIMESTAMP,
    mfa_enabled         BOOLEAN DEFAULT FALSE,
    mfa_secret          VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_user_account_phone ON user_account(phone);
CREATE INDEX idx_user_account_role ON user_account(role);

-- =========================
-- 4. 患者档案
-- =========================
CREATE TABLE patient (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES user_account(id),
    full_name           VARCHAR(100) NOT NULL,
    gender              VARCHAR(10),
    date_of_birth       DATE,
    id_card_number_enc  VARCHAR(500),
    id_card_number_hash VARCHAR(64),
    blood_type          VARCHAR(5),
    allergy_info        TEXT,
    emergency_contact   VARCHAR(100),
    emergency_phone     VARCHAR(30),
    medical_card_number VARCHAR(50),
    insurance_type      VARCHAR(50),
    insurance_number_enc VARCHAR(500),
    default_hospital_id UUID REFERENCES hospital(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_patient_user ON patient(user_id);
CREATE INDEX idx_patient_id_card_hash ON patient(id_card_number_hash);

-- =========================
-- 5. 医生档案
-- =========================
CREATE TABLE doctor (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES user_account(id),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    department_id       UUID REFERENCES department(id),
    full_name           VARCHAR(100) NOT NULL,
    title               VARCHAR(50),
    specialty           VARCHAR(200),
    license_number      VARCHAR(100),
    bio                 TEXT,
    consultation_fee    NUMERIC(12,2),
    is_accepting_patients BOOLEAN DEFAULT TRUE,
    rating_score        NUMERIC(3,2) DEFAULT 0.00,
    total_ratings       INT DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_doctor_hospital ON doctor(hospital_id);
CREATE INDEX idx_doctor_department ON doctor(department_id);

-- =========================
-- 6. 管理员
-- =========================
CREATE TABLE admin (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES user_account(id),
    hospital_id         UUID REFERENCES hospital(id),
    full_name           VARCHAR(100) NOT NULL,
    admin_level         VARCHAR(30) NOT NULL,
    permissions_json    JSONB DEFAULT '[]',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_admin_hospital ON admin(hospital_id);

-- =========================
-- 7. 服务分类
-- =========================
CREATE TABLE service_category (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(50) NOT NULL,
    parent_id           UUID REFERENCES service_category(id),
    icon_url            VARCHAR(500),
    sort_order          INT DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(hospital_id, code)
);
CREATE INDEX idx_service_category_hospital ON service_category(hospital_id);

-- =========================
-- 8. 医疗服务
-- =========================
CREATE TABLE medical_service (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    category_id         UUID REFERENCES service_category(id),
    department_id       UUID REFERENCES department(id),
    name                VARCHAR(300) NOT NULL,
    code                VARCHAR(50) NOT NULL,
    service_type        VARCHAR(50) NOT NULL,
    description         TEXT,
    price               NUMERIC(12,2) NOT NULL,
    original_price      NUMERIC(12,2),
    insurance_covered   BOOLEAN DEFAULT FALSE,
    insurance_category  VARCHAR(50),
    insurance_ratio     NUMERIC(5,4) DEFAULT 0.0000,
    max_daily_quota     INT,
    duration_minutes    INT,
    requires_prescription BOOLEAN DEFAULT FALSE,
    image_urls          JSONB DEFAULT '[]',
    tags                JSONB DEFAULT '[]',
    sort_order          INT DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE(hospital_id, code)
);
CREATE INDEX idx_medical_service_hospital ON medical_service(hospital_id);
CREATE INDEX idx_medical_service_type ON medical_service(service_type);

-- =========================
-- 9. 产品（药品/器械）
-- =========================
CREATE TABLE product (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    category_id         UUID REFERENCES service_category(id),
    name                VARCHAR(300) NOT NULL,
    code                VARCHAR(50) NOT NULL,
    product_type        VARCHAR(50) NOT NULL,
    generic_name        VARCHAR(200),
    manufacturer        VARCHAR(200),
    specification       VARCHAR(200),
    unit                VARCHAR(30),
    price               NUMERIC(12,2) NOT NULL,
    cost_price          NUMERIC(12,2),
    stock_quantity      INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT DEFAULT 10,
    requires_prescription BOOLEAN DEFAULT FALSE,
    insurance_covered   BOOLEAN DEFAULT FALSE,
    insurance_category  VARCHAR(50),
    insurance_ratio     NUMERIC(5,4) DEFAULT 0.0000,
    contraindications   TEXT,
    side_effects        TEXT,
    storage_conditions  VARCHAR(200),
    expiry_warning_days INT DEFAULT 90,
    image_urls          JSONB DEFAULT '[]',
    barcode             VARCHAR(50),
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE(hospital_id, code)
);
CREATE INDEX idx_product_hospital ON product(hospital_id);
CREATE INDEX idx_product_type ON product(product_type);
CREATE INDEX idx_product_barcode ON product(barcode);

-- =========================
-- 10. 医生排班
-- =========================
CREATE TABLE doctor_schedule (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    doctor_id           UUID NOT NULL REFERENCES doctor(id),
    service_id          UUID REFERENCES medical_service(id),
    schedule_date       DATE NOT NULL,
    time_slot_start     TIME NOT NULL,
    time_slot_end       TIME NOT NULL,
    max_patients        INT NOT NULL DEFAULT 30,
    booked_count        INT NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
    status              VARCHAR(20) DEFAULT 'AVAILABLE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE(doctor_id, schedule_date, time_slot_start)
);
CREATE INDEX idx_schedule_hospital_date ON doctor_schedule(hospital_id, schedule_date);

-- =========================
-- 11. 处方单
-- =========================
CREATE TABLE prescription (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    prescription_no     VARCHAR(50) NOT NULL UNIQUE,
    doctor_id           UUID NOT NULL REFERENCES doctor(id),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    appointment_id      UUID,
    diagnosis           TEXT NOT NULL,
    diagnosis_code      VARCHAR(20),
    notes               TEXT,
    total_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    insurance_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    self_pay_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'PENDING',
    valid_until         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_prescription_hospital ON prescription(hospital_id);
CREATE INDEX idx_prescription_doctor ON prescription(doctor_id);
CREATE INDEX idx_prescription_patient ON prescription(patient_id);

-- =========================
-- 12. 处方明细
-- =========================
CREATE TABLE prescription_item (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id     UUID NOT NULL REFERENCES prescription(id),
    product_id          UUID NOT NULL REFERENCES product(id),
    product_name        VARCHAR(300) NOT NULL,
    specification       VARCHAR(200),
    quantity            INT NOT NULL,
    unit_price          NUMERIC(12,2) NOT NULL,
    subtotal            NUMERIC(12,2) NOT NULL,
    dosage_instruction  VARCHAR(500),
    frequency           VARCHAR(100),
    duration_days       INT,
    insurance_covered   BOOLEAN DEFAULT FALSE,
    insurance_ratio     NUMERIC(5,4) DEFAULT 0.0000,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prescription_item_prescription ON prescription_item(prescription_id);

-- =========================
-- 13. 健康套餐
-- =========================
CREATE TABLE health_package (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(50) NOT NULL,
    description         TEXT,
    package_type        VARCHAR(30) NOT NULL,
    price               NUMERIC(12,2) NOT NULL,
    original_price      NUMERIC(12,2),
    validity_days       INT,
    max_usage           INT DEFAULT 1,
    included_items      JSONB NOT NULL DEFAULT '[]',
    image_url           VARCHAR(500),
    sort_order          INT DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(hospital_id, code)
);
CREATE INDEX idx_health_package_hospital ON health_package(hospital_id);

-- =========================
-- 14. 患者套餐订阅
-- =========================
CREATE TABLE patient_package (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    package_id          UUID NOT NULL REFERENCES health_package(id),
    order_id            UUID,
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    activated_at        TIMESTAMP,
    expires_at          TIMESTAMP,
    remaining_usage     INT,
    usage_log           JSONB DEFAULT '[]',
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_patient_package_patient ON patient_package(patient_id, status);

-- =========================
-- 15. 订单主表
-- =========================
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    order_no            VARCHAR(50) NOT NULL UNIQUE,
    patient_id          UUID NOT NULL REFERENCES patient(id),
    doctor_id           UUID REFERENCES doctor(id),
    prescription_id     UUID REFERENCES prescription(id),
    order_type          VARCHAR(30) NOT NULL,
    order_source        VARCHAR(30) DEFAULT 'ONLINE',
    total_amount        NUMERIC(12,2) NOT NULL,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    insurance_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    self_pay_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    paid_at             TIMESTAMP,
    completed_at        TIMESTAMP,
    cancelled_at        TIMESTAMP,
    cancel_reason       TEXT,
    appointment_date    DATE,
    appointment_time_start TIME,
    appointment_time_end TIME,
    schedule_id         UUID REFERENCES doctor_schedule(id),
    delivery_type       VARCHAR(20),
    delivery_address    TEXT,
    delivery_status     VARCHAR(20),
    remark              TEXT,
    expire_at           TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_orders_hospital ON orders(hospital_id);
CREATE INDEX idx_orders_patient ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_expire ON orders(expire_at) WHERE status = 'PENDING_PAYMENT';

-- =========================
-- 16. 订单明细
-- =========================
CREATE TABLE order_item (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id),
    item_type           VARCHAR(20) NOT NULL,
    reference_id        UUID NOT NULL,
    name                VARCHAR(300) NOT NULL,
    specification       VARCHAR(200),
    quantity            INT NOT NULL DEFAULT 1,
    unit_price          NUMERIC(12,2) NOT NULL,
    subtotal            NUMERIC(12,2) NOT NULL,
    discount_amount     NUMERIC(12,2) DEFAULT 0,
    insurance_covered   BOOLEAN DEFAULT FALSE,
    insurance_ratio     NUMERIC(5,4) DEFAULT 0.0000,
    insurance_amount    NUMERIC(12,2) DEFAULT 0,
    self_pay_amount     NUMERIC(12,2) DEFAULT 0,
    remark              TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_item_order ON order_item(order_id);

-- =========================
-- 17. 支付流水
-- =========================
CREATE TABLE payment_transaction (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    transaction_no      VARCHAR(50) NOT NULL UNIQUE,
    order_id            UUID NOT NULL REFERENCES orders(id),
    order_no            VARCHAR(50) NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient(id),
    payment_type        VARCHAR(30) NOT NULL,
    payment_channel     VARCHAR(30),
    payment_method      VARCHAR(30),
    total_amount        NUMERIC(12,2) NOT NULL,
    insurance_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    self_pay_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    channel_transaction_id VARCHAR(100),
    channel_response    JSONB,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    paid_at             TIMESTAMP,
    expired_at          TIMESTAMP,
    settled_at          TIMESTAMP,
    idempotency_key     VARCHAR(100) NOT NULL UNIQUE,
    retry_count         INT DEFAULT 0,
    last_error          TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_payment_hospital ON payment_transaction(hospital_id);
CREATE INDEX idx_payment_order ON payment_transaction(order_id);
CREATE INDEX idx_payment_status ON payment_transaction(status);
CREATE INDEX idx_payment_channel_tx ON payment_transaction(channel_transaction_id);

-- =========================
-- 18. 退款记录
-- =========================
CREATE TABLE refund_record (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    refund_no           VARCHAR(50) NOT NULL UNIQUE,
    order_id            UUID NOT NULL REFERENCES orders(id),
    order_no            VARCHAR(50) NOT NULL,
    payment_transaction_id UUID NOT NULL REFERENCES payment_transaction(id),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    refund_type         VARCHAR(20) NOT NULL,
    refund_reason       TEXT NOT NULL,
    refund_amount       NUMERIC(12,2) NOT NULL,
    insurance_refund_amount NUMERIC(12,2) DEFAULT 0,
    self_pay_refund_amount NUMERIC(12,2) DEFAULT 0,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_by        UUID NOT NULL REFERENCES user_account(id),
    reviewed_by         UUID REFERENCES user_account(id),
    reviewed_at         TIMESTAMP,
    review_comment      TEXT,
    channel_refund_id   VARCHAR(100),
    channel_response    JSONB,
    idempotency_key     VARCHAR(100) NOT NULL UNIQUE,
    refunded_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_refund_hospital ON refund_record(hospital_id);
CREATE INDEX idx_refund_order ON refund_record(order_id);
CREATE INDEX idx_refund_status ON refund_record(status);

-- =========================
-- 19. 结算记录
-- =========================
CREATE TABLE settlement_record (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    settlement_no       VARCHAR(50) NOT NULL UNIQUE,
    settlement_period_start DATE NOT NULL,
    settlement_period_end   DATE NOT NULL,
    total_transactions  INT NOT NULL DEFAULT 0,
    gross_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    refund_amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
    platform_fee        NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    settled_at          TIMESTAMP,
    bank_account_info   JSONB,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_settlement_hospital ON settlement_record(hospital_id);

-- =========================
-- 20. 资金流水账本
-- =========================
CREATE TABLE payment_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    ledger_no           VARCHAR(50) NOT NULL UNIQUE,
    transaction_type    VARCHAR(30) NOT NULL,
    direction           VARCHAR(10) NOT NULL,
    reference_type      VARCHAR(30) NOT NULL,
    reference_id        UUID NOT NULL,
    amount              NUMERIC(14,2) NOT NULL,
    balance_before      NUMERIC(14,2),
    balance_after       NUMERIC(14,2),
    description         TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_hospital ON payment_ledger(hospital_id);
CREATE INDEX idx_ledger_reference ON payment_ledger(reference_type, reference_id);

-- =========================
-- 21. 医保理赔
-- =========================
CREATE TABLE insurance_claim (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    claim_no            VARCHAR(50) NOT NULL UNIQUE,
    order_id            UUID NOT NULL REFERENCES orders(id),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    insurance_type      VARCHAR(50) NOT NULL,
    insurance_number    VARCHAR(100) NOT NULL,
    insurance_region    VARCHAR(100),
    total_amount        NUMERIC(12,2) NOT NULL,
    eligible_amount     NUMERIC(12,2) NOT NULL,
    deductible_amount   NUMERIC(12,2) DEFAULT 0,
    coverage_ratio      NUMERIC(5,4) NOT NULL,
    insurance_pays      NUMERIC(12,2) NOT NULL,
    patient_copay       NUMERIC(12,2) NOT NULL,
    item_breakdown      JSONB NOT NULL DEFAULT '[]',
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    submitted_at        TIMESTAMP,
    approved_at         TIMESTAMP,
    settled_at          TIMESTAMP,
    rejection_reason    TEXT,
    external_claim_id   VARCHAR(100),
    external_response   JSONB,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_insurance_claim_hospital ON insurance_claim(hospital_id);
CREATE INDEX idx_insurance_claim_order ON insurance_claim(order_id);
CREATE INDEX idx_insurance_claim_patient ON insurance_claim(patient_id);

-- =========================
-- 22. 分账记录
-- =========================
CREATE TABLE split_payment (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    payer_type          VARCHAR(30) NOT NULL,
    payer_reference     VARCHAR(200),
    amount              NUMERIC(12,2) NOT NULL,
    payment_transaction_id UUID REFERENCES payment_transaction(id),
    insurance_claim_id  UUID REFERENCES insurance_claim(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_split_payment_order ON split_payment(order_id);

-- =========================
-- 23. 报销追踪
-- =========================
CREATE TABLE reimbursement (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    order_id            UUID NOT NULL REFERENCES orders(id),
    claim_id            UUID REFERENCES insurance_claim(id),
    original_paid       NUMERIC(12,2) NOT NULL,
    reimbursed_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_at        TIMESTAMP,
    completed_at        TIMESTAMP,
    rejection_reason    TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reimbursement_patient ON reimbursement(patient_id);

-- =========================
-- 24. 幂等键
-- =========================
CREATE TABLE idempotency_key (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key     VARCHAR(100) NOT NULL UNIQUE,
    request_hash        VARCHAR(64),
    response_status     INT,
    response_body       TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMP NOT NULL
);
CREATE INDEX idx_idempotency_expires ON idempotency_key(expires_at);

-- =========================
-- 25. 审计日志
-- =========================
CREATE TABLE audit_log (
    id                  BIGSERIAL PRIMARY KEY,
    hospital_id         UUID,
    user_id             UUID,
    user_role           VARCHAR(30),
    action              VARCHAR(50) NOT NULL,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           VARCHAR(100),
    old_value           JSONB,
    new_value           JSONB,
    ip_address          VARCHAR(50),
    user_agent          TEXT,
    request_uri         VARCHAR(500),
    request_method      VARCHAR(10),
    description         TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_hospital ON audit_log(hospital_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- =========================
-- 26. 敏感数据变更日志
-- =========================
CREATE TABLE data_change_log (
    id                  BIGSERIAL PRIMARY KEY,
    audit_log_id        BIGINT REFERENCES audit_log(id),
    field_name          VARCHAR(100) NOT NULL,
    old_value_encrypted TEXT,
    new_value_encrypted TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- 27. 事务发件箱
-- =========================
CREATE TABLE event_outbox (
    id                  BIGSERIAL PRIMARY KEY,
    aggregate_type      VARCHAR(50) NOT NULL,
    aggregate_id        UUID NOT NULL,
    event_type          VARCHAR(100) NOT NULL,
    payload             JSONB NOT NULL,
    status              VARCHAR(20) DEFAULT 'PENDING',
    retry_count         INT DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at        TIMESTAMP
);
CREATE INDEX idx_outbox_pending ON event_outbox(status, created_at) WHERE status = 'PENDING';

-- =========================
-- 28. 对账批次
-- =========================
CREATE TABLE reconciliation_batch (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID REFERENCES hospital(id),
    batch_no            VARCHAR(50) NOT NULL UNIQUE,
    reconciliation_date DATE NOT NULL,
    channel             VARCHAR(30),
    system_transaction_count INT NOT NULL DEFAULT 0,
    channel_transaction_count INT NOT NULL DEFAULT 0,
    matched_count       INT NOT NULL DEFAULT 0,
    mismatched_count    INT NOT NULL DEFAULT 0,
    missing_in_system   INT NOT NULL DEFAULT 0,
    missing_in_channel  INT NOT NULL DEFAULT 0,
    system_total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    channel_total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    difference_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    exception_details   JSONB,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recon_date ON reconciliation_batch(reconciliation_date);

-- =========================
-- 29. 对账明细
-- =========================
CREATE TABLE reconciliation_detail (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id            UUID NOT NULL REFERENCES reconciliation_batch(id),
    payment_transaction_id UUID REFERENCES payment_transaction(id),
    channel_transaction_id VARCHAR(100),
    system_amount       NUMERIC(12,2),
    channel_amount      NUMERIC(12,2),
    match_status        VARCHAR(20) NOT NULL,
    resolution_status   VARCHAR(20) DEFAULT 'UNRESOLVED',
    resolution_note     TEXT,
    resolved_by         UUID REFERENCES user_account(id),
    resolved_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recon_detail_batch ON reconciliation_detail(batch_id);

-- =========================
-- 30. 通知
-- =========================
CREATE TABLE notification (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID REFERENCES hospital(id),
    user_id             UUID NOT NULL REFERENCES user_account(id),
    type                VARCHAR(30) NOT NULL,
    channel             VARCHAR(20) NOT NULL,
    title               VARCHAR(200),
    content             TEXT NOT NULL,
    reference_type      VARCHAR(30),
    reference_id        UUID,
    status              VARCHAR(20) DEFAULT 'PENDING',
    sent_at             TIMESTAMP,
    read_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_user ON notification(user_id, status);

-- =========================
-- 31. 优惠券
-- =========================
CREATE TABLE coupon (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    code                VARCHAR(30) NOT NULL UNIQUE,
    name                VARCHAR(200) NOT NULL,
    coupon_type         VARCHAR(20) NOT NULL,
    discount_value      NUMERIC(12,2) NOT NULL,
    min_order_amount    NUMERIC(12,2) DEFAULT 0,
    max_discount_amount NUMERIC(12,2),
    applicable_types    JSONB DEFAULT '[]',
    total_quantity      INT,
    used_quantity       INT DEFAULT 0,
    per_user_limit      INT DEFAULT 1,
    valid_from          TIMESTAMP NOT NULL,
    valid_until         TIMESTAMP NOT NULL,
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_coupon (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id           UUID NOT NULL REFERENCES coupon(id),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    order_id            UUID REFERENCES orders(id),
    status              VARCHAR(20) DEFAULT 'AVAILABLE',
    used_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_patient_coupon_patient ON patient_coupon(patient_id, status);

-- =========================
-- 32. 预约记录
-- =========================
CREATE TABLE appointment (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    appointment_no      VARCHAR(50) NOT NULL UNIQUE,
    patient_id          UUID NOT NULL REFERENCES patient(id),
    doctor_id           UUID NOT NULL REFERENCES doctor(id),
    schedule_id         UUID NOT NULL REFERENCES doctor_schedule(id),
    order_id            UUID REFERENCES orders(id),
    department_id       UUID REFERENCES department(id),
    appointment_date    DATE NOT NULL,
    time_slot_start     TIME NOT NULL,
    time_slot_end       TIME NOT NULL,
    queue_number        INT,
    check_in_time       TIMESTAMP,
    status              VARCHAR(20) DEFAULT 'BOOKED',
    cancel_reason       TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_appointment_hospital_date ON appointment(hospital_id, appointment_date);
CREATE INDEX idx_appointment_patient ON appointment(patient_id);

-- =========================
-- 33. 候补队列
-- =========================
CREATE TABLE waitlist_entry (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    doctor_id           UUID NOT NULL REFERENCES doctor(id),
    schedule_id         UUID NOT NULL REFERENCES doctor_schedule(id),
    patient_id          UUID NOT NULL REFERENCES patient(id),
    priority_score      NUMERIC(8,2) DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'WAITING',
    notified_at         TIMESTAMP,
    expires_at          TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- 34. 医院健康评分
-- =========================
CREATE TABLE hospital_health_metrics (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id         UUID NOT NULL REFERENCES hospital(id),
    metric_date         DATE NOT NULL,
    payment_success_rate NUMERIC(5,4),
    avg_payment_time_ms BIGINT,
    refund_rate         NUMERIC(5,4),
    reconciliation_accuracy NUMERIC(5,4),
    total_revenue       NUMERIC(14,2),
    active_orders       INT,
    health_score        NUMERIC(5,2),
    anomaly_flags       JSONB DEFAULT '[]',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(hospital_id, metric_date)
);

-- =========================
-- 35. 家庭成员
-- =========================
CREATE TABLE patient_dependent (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_patient_id  UUID NOT NULL REFERENCES patient(id),
    dependent_name      VARCHAR(100) NOT NULL,
    relationship        VARCHAR(30) NOT NULL,
    gender              VARCHAR(10),
    date_of_birth       DATE,
    id_card_number_enc  VARCHAR(500),
    insurance_type      VARCHAR(50),
    insurance_number_enc VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_patient_dependent_primary ON patient_dependent(primary_patient_id);
