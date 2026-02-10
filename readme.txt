================================================================================
                    MedPay - 医疗商城支付系统
                         使用说明文档
================================================================================

一、项目简介
--------------------------------------------------------------------------------
MedPay 是一套基于 Spring Boot 3 的医疗商城支付系统，面向医院、医生、患者
三类用户，提供挂号、问诊、药品购买、支付、医保报销、对账等完整业务流程。

技术栈：Java 17 + Spring Boot 3.3.7 + PostgreSQL + Flyway + JWT + Thymeleaf

项目采用 Maven 多模块架构，共 13 个子模块：
  medpay-common          公共模块（实体、异常、工具、事件、安全）
  medpay-user            用户认证与管理（JWT + Spring Security）
  medpay-hospital        医院与科室管理（多租户）
  medpay-catalog         服务目录、药品、处方、排班、健康套餐
  medpay-order           订单管理（状态机驱动）
  medpay-payment         支付核心（支付处理、退款、结算、幂等）
  medpay-insurance       医保报销与理赔
  medpay-reconciliation  对账与报表
  medpay-audit           审计日志（AOP 自动拦截）
  medpay-notification    消息通知（站内信、短信模拟）
  medpay-admin           后台管理界面（Thymeleaf 模板）
  medpay-app             主启动模块（入口、安全配置、Swagger 配置）
  medpay-migration       Flyway 数据库迁移脚本


二、环境准备
--------------------------------------------------------------------------------
1. JDK 17 或以上版本
2. Maven 3.6 或以上版本
3. PostgreSQL 12 或以上版本（运行在 localhost:5432）


三、数据库初始化
--------------------------------------------------------------------------------
连接 PostgreSQL，创建数据库：

  CREATE DATABASE medpay OWNER postgres;

注意：表结构和种子数据由 Flyway 在应用启动时自动执行，无需手动导入 SQL。
  - V1__init_schema.sql  创建 35 张表及索引
  - V2__seed_data.sql    插入测试数据（医院、科室、医生、患者等）

默认数据库连接配置（见 medpay-app/src/main/resources/application.yml）：
  地址：jdbc:postgresql://localhost:5432/medpay
  用户：postgres
  密码：postgres

如需修改，请编辑 application.yml 中的 spring.datasource 部分。


四、构建项目
--------------------------------------------------------------------------------
在项目根目录执行：

  mvn clean package

如果只需编译不跑测试：

  mvn clean package -DskipTests


五、启动应用（后台服务）
--------------------------------------------------------------------------------
方式一：通过 Maven 插件启动

  cd medpay-app
  mvn spring-boot:run

方式二：直接运行 JAR 包

  java -jar medpay-app/target/medpay-app-1.0.0-SNAPSHOT.jar

启动成功后，服务运行在 http://localhost:8080


六、后台管理界面（Admin）
--------------------------------------------------------------------------------
后台管理界面基于 Thymeleaf 服务端渲染，集成在应用内部，无需单独启动。

访问地址：http://localhost:8080/admin

后台功能包括：
  - 医院管理：医院信息、科室管理
  - 用户管理：医生、患者、管理员账号管理
  - 订单管理：查看和处理订单
  - 支付管理：支付记录、退款处理
  - 对账报表：对账批次、明细查看
  - 审计日志：操作记录查询
  - 系统设置：全局配置管理


七、前台 React 项目（medpay-web）
--------------------------------------------------------------------------------
前台基于 React 18 + TypeScript + Vite 构建，包含三个门户：

  患者端（/patient）：浏览医生、服务、药品、套餐，预约挂号，下单支付，查看处方，医保计算
  医生端（/doctor）：管理排班，开具处方，患者签到
  管理端（/admin）：KPI 仪表盘，医院/科室/服务/药品 CRUD，订单管理，退款审批，
                    对账管理，报表结算，审计日志，通知管理

启动前台：

  cd medpay-web
  npm install          （首次运行需安装依赖）
  npm run dev          （启动开发服务器）

前台运行在 http://localhost:3000，自动代理 API 请求到后端 8080 端口。

登录后根据账号角色自动跳转到对应门户：
  patient_test  -> 患者端 /patient
  dr_zhang      -> 医生端 /doctor
  admin_pumch   -> 管理端 /admin
  superadmin    -> 管理端 /admin（可切换医院）

技术栈：React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Recharts
        + React Router 7 + Zustand + TanStack React Query + React Hook Form + Zod

API 文档（Swagger UI）：http://localhost:8080/swagger-ui.html


八、测试账号
--------------------------------------------------------------------------------
所有测试账号密码均为：admin123

  角色          用户名           说明
  ----------    --------------   ----------------
  超级管理员    superadmin       系统最高权限
  医院管理员    admin_pumch      北京协和医院管理员
  医院管理员    admin_huashan    上海华山医院管理员
  医生          dr_zhang         张明 - 心血管内科主任医师
  医生          dr_li            李华 - 普通外科副主任医师
  医生          dr_wang          王芳 - 神经内科主任医师
  患者          patient_test     测试患者

登录示例（使用 curl）：

  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"superadmin\",\"password\":\"admin123\"}"

返回的 accessToken 用于后续接口认证。


九、项目配置说明
--------------------------------------------------------------------------------
主配置文件：medpay-app/src/main/resources/application.yml

关键配置项：
  server.port                          服务端口，默认 8080
  spring.datasource.url                数据库连接地址
  spring.datasource.username           数据库用户名
  spring.datasource.password           数据库密码
  medpay.jwt.secret                    JWT 签名密钥
  medpay.jwt.access-token-expiration   访问令牌有效期（毫秒），默认 2 小时
  medpay.jwt.refresh-token-expiration  刷新令牌有效期（毫秒），默认 7 天
  medpay.tenant.enabled                多租户开关，默认 true
  medpay.payment.channel               支付渠道，默认 mock（模拟支付）
  medpay.payment.expire-minutes        支付超时时间，默认 30 分钟
  medpay.payment.platform-fee-rate     平台手续费率，默认 0.6%


十、常见问题
--------------------------------------------------------------------------------
Q: 启动报错 "relation xxx does not exist"
A: 确认 PostgreSQL 已创建 medpay 数据库，且 Flyway 迁移已成功执行。
   检查 application.yml 中数据库连接信息是否正确。

Q: 启动报错端口被占用
A: 修改 application.yml 中 server.port 为其他端口，或关闭占用 8080 的进程。

Q: 如何切换到真实支付渠道？
A: 修改 application.yml 中 medpay.payment.channel 为对应支付渠道标识，
   并配置相应的支付渠道参数。

Q: 如何在生产环境部署？
A: 1. 修改数据库连接为生产环境地址和凭证
   2. 修改 JWT 密钥和 AES 密钥为安全的随机值
   3. 将 medpay.payment.channel 切换为真实支付渠道
   4. 关闭 Hibernate SQL 日志（设置 logging.level 为 INFO）
   5. 执行 mvn clean package -DskipTests 构建 JAR
   6. 使用 java -jar medpay-app-1.0.0-SNAPSHOT.jar 启动

================================================================================
