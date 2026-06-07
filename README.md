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

### 云部署

项目已部署至校园网云主机：**http://172.29.5.106**

GitHub 仓库：**[github.com/Airport233/mini-paint-studio](https://github.com/Airport233/mini-paint-studio)**

测试账号：`cc24a_24@126.com` / `12345678`

部署步骤：

```bash
# 1. 安装 Docker（Ubuntu 24.04 snap）
sudo snap install docker

# 2. 配置国内镜像源（校园网访问 Docker Hub 需代理）
sudo mkdir -p /var/snap/docker/current/config
sudo tee /var/snap/docker/current/config/daemon.json << EOF
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF
sudo snap restart docker

# 3. 克隆并启动
git clone https://github.com/Airport233/mini-paint-studio.git
cd mini-paint-studio

# 4. 修改 CORS 和安全配置
#   - SecurityConfig.java: 添加云主机 IP 到 allowedOriginPatterns
#   - docker-compose.yml: 设置 JWT_SECRET（>= 256 bits）
#   - docker-compose.yml: 首次部署添加 SPRING_JPA_HIBERNATE_DDL_AUTO=update

# 5. 启动
docker compose up -d --build
```

数据持久化：PostgreSQL 使用 Docker 命名卷 `pgdata`，容器删除或重启不会丢失数据。`docker compose down -v` 会删除卷。

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
| GET/POST | /api/paints | 漆料列表/新增 |
| PUT/DELETE | /api/paints/:id | 编辑/删除漆料 |
| POST | /api/mix | 混色计算（r,g,b → 整数份数配方） |
| GET/POST | /api/recipes | 配方列表/保存 |
| GET/PUT/DELETE | /api/recipes/:id | 配方详情/编辑/删除 |
| GET/POST | /api/stl | STL 文件列表/上传 |
| GET | /api/stl/:id/download | STL 文件下载 |
| PUT/DELETE | /api/stl/:id | STL 重命名/删除（级联删除灯光方案） |
| GET/POST | /api/lighting-presets | 灯光方案列表/保存 |
| GET/PUT/DELETE | /api/lighting-presets/:id | 方案详情/编辑/删除 |
| GET | /api/lighting-presets/:id/cover | 方案封面图片 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DB_USERNAME | minipaint | PostgreSQL 用户名 |
| DB_PASSWORD | minipaint | PostgreSQL 密码 |
| JWT_SECRET | (内置默认) | JWT 签名密钥，生产环境必改 |
| FILE_STORAGE_PATH | ./uploads | 图片存储路径 |
| STL_STORAGE_PATH | ./stl-files | STL 文件存储路径 |
