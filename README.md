# HobbyMix — 微缩模型涂装配色工作站

微缩模型涂装玩家的 Web 工具：录入漆料真实颜色、计算混色配方、3D 材质预览、保存配色方案。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | 纯 HTML + CSS + 原生 JS（Open Design / Discord 设计系统），Vite 静态服务 |
| 后端 | Spring Boot 3.2 + JPA + PostgreSQL（开发用 H2） |
| 认证 | JWT（jjwt 0.12） |
| 容器化 | Docker Compose（前端 Nginx + 后端 Spring Boot + PostgreSQL） |

## 快速开始

```bash
# 1. 启动全部服务
docker compose up -d

# 2. 打开浏览器
# http://localhost
```

## 开发环境

### 后端

```bash
cd backend
# 使用 H2 内存数据库（无需安装 PostgreSQL）
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
# → http://localhost:8080
```

### 前端

```bash
cd frontend
npm install && npm run dev
# → http://localhost:5175
```

Vite 自动代理 `/api` 到后端 8080。

### 一键测试

```bash
make test
# 或手动：
cd backend && ./mvnw test -Dspring.profiles.active=dev
cd frontend && npm run build
```

## 项目结构

```
├── backend/                  # Spring Boot
│   ├── src/main/java/com/minipaint/
│   │   ├── config/           # Security, CORS, FileStorage
│   │   ├── controller/       # REST 控制器
│   │   ├── model/entity/     # JPA 实体
│   │   ├── model/dto/        # Request/Response DTO
│   │   ├── repository/       # JPA Repository
│   │   ├── security/         # JWT Provider + Filter
│   │   └── service/          # 业务逻辑接口 + 实现
│   └── src/test/             # 测试
├── frontend/                 # 纯前端（HTML + CSS + JS）
│   ├── *.html                # 8 个页面
│   ├── js/                   # 共享 JS 模块
│   └── css/                  # 共享 CSS
├── docs/                     # 过程文档 & 提示词
├── SPEC.md                   # 设计规约
├── PLAN.md                   # 实现计划
├── SPEC_PROCESS.md           # 规约生成过程
├── AGENT_LOG.md              # 智能体使用记录
├── docker-compose.yml        # 容器编排
└── .github/workflows/ci.yml  # CI 流水线
```

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| POST | /api/auth/forgot-password | 忘记密码 |
| GET | /api/paints | 漆料列表（?brand=&sort=） |
| POST | /api/paints | 新增漆料 |
| PUT | /api/paints/:id | 编辑漆料 |
| DELETE | /api/paints/:id | 删除漆料 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DB_USERNAME | minipaint | PostgreSQL 用户名 |
| DB_PASSWORD | minipaint | PostgreSQL 密码 |
| JWT_SECRET | (内置默认) | JWT 签名密钥，生产环境必改 |
| FILE_STORAGE_PATH | ./uploads | 图片存储路径 |
| STL_STORAGE_PATH | ./stl-files | STL 文件存储路径 |
