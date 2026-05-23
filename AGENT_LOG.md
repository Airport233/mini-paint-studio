# AGENT_LOG.md — Mini Paint Studio 智能体使用过程记录

## 2026-05-23 — Brainstorming & 规约阶段

### Brainstorming

- **技能**: `superpowers:brainstorming`
- **智能体**: Claude Code (deepseek-v4-pro)
- **过程**: 用户从第一轮迭代的经验出发，携带明确的模块设想（漆料库、混色引擎、3D预览、配方管理、账户系统）。智能体逐模块追问打磨，用户主动修正了多项设计决策（密码简化、漆料库字段精简、总份数5→6、系统内置黑白兜底色、STL旋转等）。
- **关键人工干预**:
  - 智能体过早进入架构设计，被用户制止 → 先打磨模块再讨论架构
  - 密码规则从"大小写+数字"简化为"≥8位字母或数字"
  - 总份数上限从5改为6
  - 系统内置纯黑(0,0,0)和纯白(255,255,255)兜底色
  - 3D 取色从"截图→取色"改为 Canvas 直接取色
  - 色域工具从"漆料关联三角形"改为"实心圆形色盘+锚点"
- **产出**: SPEC.md v1

### Writing Plans

- **技能**: `superpowers:writing-plans`
- **产出**: PLAN.md（9 Phases, 33 Tasks）
- **关键人工干预**: Commit message 格式规范（Subagent + Human-Edit 标注）、冷启动验证 diff 记录

### 冷启动验证

- **验证 agent**: 用户选择的非 Claude Code agent（全新 session）
- **发现**: PLAN 顶部 "REQUIRED SUB-SKILL" 对非 Superpowers 环境 agent 是死胡同
- **修订**: PLAN 改为兼容 standalone 和 Superpowers 的措辞
- **记录**: SPEC_PROCESS.md §5

---

## 2026-05-23 — Phase 0: 项目脚手架

| Task | Commit | 说明 |
|------|--------|------|
| 0.1 | `12343ba` | Spring Boot 3.2.5 + Maven + H2 dev profile + CorsConfig |
| 0.2 | `3cb5cd3` | React 18 + Vite + TypeScript + Discord CSS + 类型定义 |

- **智能体**: Claude Code（直接执行，未使用 subagent 分派）
- **人工干预**: H2 依赖范围从 `test` 改为 `runtime`（`fe14e04`）

---

## 2026-05-23 — Phase 1: 用户账户

| Task | Commit | 说明 |
|------|--------|------|
| 1.1 | `516a483` | JWT Token Provider（生成/验证/提取）+ 5 tests |
| 1.2 | `5f5c4aa` | User Entity + UserRepository + 4 tests |
| 1.3 | `9c7229a` | Auth DTOs（Register/Login/ForgotPassword/ResetPassword）+ 验证测试 |
| 1.4 | `9c7229a` | UserService + AuthController（注册/登录/忘记密码/重置密码） |
| 1.5 | `9c7229a` | JWT Filter + SecurityConfig（无状态会话 + BCrypt） |
| 1.6 | `4860b03` | 前端 Auth Store + API 拦截器 + AuthPage（登录/注册/忘记密码 Tab） |

- **智能体**: Claude Code（直接执行）
- **TDD**: 所有后端 task 遵循红→绿→重构
- **测试**: 后端 15 tests PASS，前端 1 test PASS
- **人工干预**:
  - 前端密码校验移除"必须同时含字母和数字" → 仅 ≥8 位（`14ed349`）
  - 后端密码规则简化 → `@Size(min=8)` 无字符类型要求

---

## 2026-05-23 — Phase 2: 漆料库

| Task | Commit | 说明 |
|------|--------|------|
| 2.1 | `65bf30b` (worktree) | Brand 枚举 + Paint 实体 + PaintRepository + 3 tests |
| 2.2 | `b6d82ed` (worktree) | PaintService + PaintController + DTOs（CRUD + 列表+筛选） |

- **Worktree**: `feature/paint-library`（`c:/Users/cc24a/Desktop/paint-library-backend`）
- **智能体**: Claude Code（直接执行）
- **TDD**: Repository 测试 → 实现 → Service 测试 → 实现 → Controller
- **测试**: 后端 18 tests PASS
- **人工干预**: CORS 预检被 Spring Security 拦截 → SecurityConfig 添加 `.cors()` + `OPTIONS permitAll`（`18d61c5`）

---

## 2026-05-23 — 前端集成 & 调试

### React → HTML 原型切换

- **决策**: Open Design 生成的 React 代码 TS 错误多、与原型不一致 → 改为直接使用 HTML 原型 + 原生 JS
- **Commit**: `01985cc`

### 关键人工干预

| 问题 | 修复 Commit | 说明 |
|------|-----------|------|
| ProtectedRoute 未生效 → 首页可绕过登录 | `336dc34` | 直接读 localStorage 替代 Zustand |
| HTML 原型被 Vite 当作静态文件 serve | `336dc34` | 删除前端目录下的 .html 原型文件 |
| Vite proxy 返回 404 | `225942d` | 改用 object 形式 + `changeOrigin: true` |
| index.html 被原型覆盖 | `eeb824d` | 重建 React 入口 index.html |
| 注册页 "返回首页" 绕过登录 | `ed03253` | 删除 back-link |
| 密码校验前后端不一致 | `14ed349` | 移除前端字符类型要求 |
| 添加漆料按钮无反应 | `0e2c0a6` | Brand 类型 enum→string union |
| 上传图片后布局错乱 | `9c9b7db` `5664fd6` | 上传替换 drop-zone + X 重传按钮 |
| 每页缺少 auth guard | `9af2864` | 新增 auth-guard.js + clean URL 映射 |
| 侧边栏未共享 | `b33ff8b` `7168f11` | 提取 layout.js + layout.css 共享组件 |
| 共享侧边栏图标不显示 | `28bbbd0` | layout.js 注入后调用 lucide.createIcons() |

### URL 映射（`.html` 后缀隐藏）

- `/` → `index.html`
- `/auth` → `auth.html`
- `/paints` → `paints.html`
- `/mix` → `mix.html`
- `/preview` → `preview.html`
- `/recipes` → `recipes.html`
- `/presets` → `presets.html`
- `/color-wheel` → `color-wheel.html`

Vite 中间件 `spaFallback()` + MPA `rollupOptions.input`

---

## 学到的教训

1. **HTML 原型直出 > React 重写**: Open Design 的 HTML 原型格式完整、CSS 精确，转换为 React 会引入格式偏差。直接用原型 + 原生 JS 调用后端 API 更高效
2. **Vite MPA 模式**: SPA 的 `appType` 默认不适合多页面应用，需显式设置 `appType: 'mpa'` 并结合自定义中间件做 clean URL
3. **Lucide CDN vs npm**: CDN 版 lucide 用 `data-lucide` 属性 + `lucide.createIcons()` 批量替换，适合原生 HTML；npm 版 lucide-react 适合 React
4. **共享组件**: 原生 JS 通过 IIFE + `document.getElementById` 注入 HTML 可实现跨页面组件共享，关键是脚本要在 DOM 就绪后执行
5. **CORS + Spring Security**: WebMvcConfigurer 的 CORS 配置在 Spring Security filter 之后，必须在 SecurityFilterChain 中显式 `.cors()` + `CorsConfigurationSource`
6. **auth guard 顺序**: `<script>` 标签位置决定执行顺序——auth guard 要在 DOM 就绪后执行，layout.js 要在 body 底部执行
