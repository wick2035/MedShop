-- ============================================================
-- V6: 补充 medical_service 表的 insurance_category 字段
-- V2 和 V5 插入的医疗服务均缺少 insurance_category，导致
-- 保险计算时所有服务被当作丙类(0%报销)处理
-- ============================================================

-- V2 医疗服务 (协和医院)
UPDATE medical_service SET insurance_category = '甲类' WHERE id = '10000000-0000-0000-0000-000000000001' AND insurance_covered = TRUE;
UPDATE medical_service SET insurance_category = '乙类' WHERE id = '10000000-0000-0000-0000-000000000002' AND insurance_covered = TRUE;
UPDATE medical_service SET insurance_category = '甲类' WHERE id = '10000000-0000-0000-0000-000000000003' AND insurance_covered = TRUE;
UPDATE medical_service SET insurance_category = '乙类' WHERE id = '10000000-0000-0000-0000-000000000004' AND insurance_covered = TRUE;

-- V5 医疗服务 (北京天坛医院)
UPDATE medical_service SET insurance_category = '甲类' WHERE id = '10000000-0000-0000-0000-000000000010' AND insurance_covered = TRUE;  -- 神经内科普通门诊挂号
UPDATE medical_service SET insurance_category = '乙类' WHERE id = '10000000-0000-0000-0000-000000000011' AND insurance_covered = TRUE;  -- 神经内科专家门诊挂号
UPDATE medical_service SET insurance_category = '甲类' WHERE id = '10000000-0000-0000-0000-000000000012' AND insurance_covered = TRUE;  -- 皮肤科普通门诊挂号
UPDATE medical_service SET insurance_category = '甲类' WHERE id = '10000000-0000-0000-0000-000000000013' AND insurance_covered = TRUE;  -- 脑电图检查
UPDATE medical_service SET insurance_category = '乙类' WHERE id = '10000000-0000-0000-0000-000000000014' AND insurance_covered = TRUE;  -- 头颅MRI
-- 10000000-...-000000000015 远程视频问诊 insurance_covered=FALSE，不需要设置
