-- Fix remaining entity-vs-schema mismatches

-- 1. notification table: add is_read column (Notification entity has boolean isRead field)
ALTER TABLE notification ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. notification table: add related_entity_type column (entity maps @Column(name="related_entity_type"))
ALTER TABLE notification ADD COLUMN related_entity_type VARCHAR(30);

-- 3. notification table: add related_entity_id column (entity maps @Column(name="related_entity_id") as String)
ALTER TABLE notification ADD COLUMN related_entity_id VARCHAR(100);

-- 4. prescription_item table: add updated_at column (entity extends BaseEntity which has updatedAt)
ALTER TABLE prescription_item ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
