-- ============================================================
-- V7: Open Platform - API Client, External Entity Mapping, Webhook
-- ============================================================

-- 1. API Client (开放平台客户端)
CREATE TABLE api_client (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name     VARCHAR(100) NOT NULL,
    client_id       VARCHAR(64)  NOT NULL UNIQUE,
    client_secret   VARCHAR(128) NOT NULL,
    hospital_id     UUID         NOT NULL REFERENCES hospital(id),
    callback_url    VARCHAR(500),
    callback_secret VARCHAR(128),
    permissions     VARCHAR(500) DEFAULT 'ORDER,PAYMENT,INSURANCE',
    status          VARCHAR(20)  DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2. External Entity Mapping (外部ID映射)
CREATE TABLE external_entity_mapping (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       VARCHAR(64)  NOT NULL,
    entity_type     VARCHAR(30)  NOT NULL,
    external_id     VARCHAR(100) NOT NULL,
    medpay_id       UUID         NOT NULL,
    hospital_id     UUID         NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, entity_type, external_id)
);

CREATE INDEX idx_mapping_lookup ON external_entity_mapping(client_id, entity_type, external_id);
CREATE INDEX idx_mapping_medpay ON external_entity_mapping(medpay_id);

-- 3. Webhook Delivery Log (Webhook投递日志)
CREATE TABLE webhook_delivery_log (
    id              BIGSERIAL PRIMARY KEY,
    client_id       VARCHAR(64)   NOT NULL,
    event_type      VARCHAR(50)   NOT NULL,
    payload         JSONB         NOT NULL,
    status          VARCHAR(20)   DEFAULT 'PENDING',
    http_status     INT,
    retry_count     INT           DEFAULT 0,
    next_retry_at   TIMESTAMP,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_pending ON webhook_delivery_log(status, next_retry_at) WHERE status IN ('PENDING', 'FAILED');

-- 4. Add webhook_sent column to event_outbox for webhook poller
ALTER TABLE event_outbox ADD COLUMN IF NOT EXISTS webhook_sent BOOLEAN DEFAULT false;

-- 5. Test data: API Client for 协和医院
INSERT INTO api_client (id, client_name, client_id, client_secret, hospital_id, callback_url, callback_secret, permissions, status)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    '外部HIS系统',
    'ext-his-001',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- BCrypt of 'test-secret-001'
    'c0000000-0000-0000-0000-000000000001',  -- 协和医院
    'http://localhost:9090/medpay/callback',
    'webhook-sign-key-001',
    'ORDER,PAYMENT,INSURANCE',
    'ACTIVE'
);
