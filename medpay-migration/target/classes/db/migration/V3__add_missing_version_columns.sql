-- Add missing version columns for optimistic locking (BaseEntity @Version)

ALTER TABLE health_package ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE service_category ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE prescription_item ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE patient_package ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
