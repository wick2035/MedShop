# MedPay - 医疗商城支付系统

基于 Spring Boot 3 的医疗商城支付系统，面向医院、医生、患者三类用户，提供挂号、问诊、药品购买、支付、医保报销、对账等完整业务流程。

## 技术栈

**后端：** Java 17 + Spring Boot 3.3.7 + PostgreSQL + Flyway + JWT + Spring Security

**前端：** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + TanStack React Query

## 项目结构

项目采用 Maven 多模块架构，共 15 个子模块：

| 模块 | 说明 |
|---|---|
| `medpay-common` | 公共模块（实体基类、异常处理、工具类、事件、安全） |
| `medpay-user` | 用户认证与管理（JWT + Spring Security） |
| `medpay-hospital` | 医院与科室管理（多租户） |
| `medpay-catalog` | 服务目录、药品、处方、排班、健康套餐 |
| `medpay-order` | 订单管理（状态机驱动） |
| `medpay-payment` | 支付核心（支付处理、退款、结算、幂等） |
| `medpay-insurance` | 医保报销与理赔 |
| `medpay-reconciliation` | 对账与报表 |
| `medpay-audit` | 审计日志（AOP 自动拦截） |
| `medpay-notification` | 消息通知（站内信、短信模拟） |
| `medpay-admin` | 后台管理界面（Thymeleaf 模板） |
| `medpay-open` | 开放平台 API（API Key 鉴权、Webhook 推送、外部实体映射） |
| `medpay-open-sdk` | 开放平台 Java SDK（`MedPayClient`） |
| `medpay-app` | 主启动模块（入口、安全配置、Swagger 配置） |
| `medpay-migration` | Flyway 数据库迁移脚本 |

**前端项目：**

| 目录 | 说明 |
|---|---|
| `medpay-web` | React 前端，包含患者端、医生端、管理端三个门户 |

## 环境准备

- JDK 17+
- Maven 3.6+
- PostgreSQL 12+（运行在 localhost:5432）
- Node.js 18+（前端开发）

## 快速开始

### 1. 初始化数据库

```sql
CREATE DATABASE medpay OWNER postgres;
```

> 表结构和种子数据由 Flyway 在应用启动时自动执行，无需手动导入 SQL。

### 2. 构建后端

```bash
mvn clean package -DskipTests
```

### 3. 启动后端

```bash
java -jar medpay-app/target/medpay-app-1.0.0-SNAPSHOT.jar
```

后端运行在 http://localhost:8080

### 4. 启动前端

```bash
cd medpay-web
npm install
npm run dev
```

前端运行在 http://localhost:3000，自动代理 API 请求到后端 8080 端口。

## 测试账号

所有测试账号密码均为 `admin123`

| 角色 | 用户名 | 说明 |
|---|---|---|
| 超级管理员 | `superadmin` | 系统最高权限，可切换医院 |
| 医院管理员 | `admin_pumch` | 北京协和医院管理员 |
| 医院管理员 | `admin_huashan` | 上海华山医院管理员 |
| 医生 | `dr_zhang` | 张明 - 心血管内科主任医师 |
| 医生 | `dr_li` | 李华 - 普通外科副主任医师 |
| 医生 | `dr_wang` | 王芳 - 神经内科主任医师 |
| 患者 | `patient_test` | 测试患者 |

登录后根据角色自动跳转到对应门户：
- `patient_test` → 患者端 `/patient`
- `dr_zhang` → 医生端 `/doctor`
- `admin_pumch` → 管理端 `/admin`

## 前端门户

- **患者端** (`/patient`)：浏览医生、服务、药品、套餐，预约挂号，下单支付，查看处方，医保计算
- **医生端** (`/doctor`)：管理排班，开具处方，患者签到
- **管理端** (`/admin`)：KPI 仪表盘，医院/科室/服务/药品 CRUD，订单管理，退款审批，对账管理，报表结算，审计日志

## 主要配置

主配置文件：`medpay-app/src/main/resources/application.yml`

| 配置项 | 说明 | 默认值 |
|---|---|---|
| `server.port` | 服务端口 | 8080 |
| `spring.datasource.url` | 数据库连接 | `jdbc:postgresql://localhost:5432/medpay` |
| `spring.datasource.username` | 数据库用户 | postgres |
| `spring.datasource.password` | 数据库密码 | postgres |
| `medpay.jwt.secret` | JWT 签名密钥 | - |
| `medpay.tenant.enabled` | 多租户开关 | true |
| `medpay.payment.channel` | 支付渠道 | mock |
| `medpay.payment.expire-minutes` | 支付超时 | 30 分钟 |

## API 文档

Swagger UI：http://localhost:8080/swagger-ui.html
