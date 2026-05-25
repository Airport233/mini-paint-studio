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

## 2026-05-25 — Phase 3: 混色引擎

| Task | Commit | 说明 |
|------|--------|------|
| 3.1 | `bcbf3d2` (worktree) | MixService 接口 + MixServiceRgbImpl（RGB 穷举，≤3漆，≤6份）|
| 3.2 | `406310a` (worktree) | MixController + MixRequest DTO |

- **Worktree**: `feature/mix-engine`（`c:/Users/cc24a/Desktop/mix-engine-backend`）
- **PR**: [#1](https://github.com/Airport233/mini-paint-studio/pull/1)
- **TDD**: MixService 6 tests → compile error → implementation → 6 PASS
- **测试**: 后端 24 tests PASS
- **算法核心**:
  - 候选漆池 = 用户库漆 + 内置纯黑(0,0,0) + 纯白(255,255,255)
  - 1-paint / 2-paint / 3-paint 整数份数枚举（总份数 ≤ 6）
  - 偏差 = 欧几里得距离 √(ΔR²+ΔG²+ΔB²)，按升序 TOP 5
  - GCD 比例去重（1:1 和 2:2 合并为一份）
  - 份数 ≤ 总份数 1/10 标记"少量"
  - CMY 理论参考始终在最上方展示（含色块预览）
  - ΔE > 15 时标注"偏差较大"

### Phase 3 人工验证与修复（2026-05-25）

用户手动启动前后端验证混色引擎，发现以下问题并逐一修复：

| # | 发现 | 修复 Commit | 说明 |
|---|------|-----------|------|
| 1 | 前端 mix 页显示 mock 数据，未接入 API | `121a57f` | 替换为真实 fetch 调用 |
| 2 | "计算混色方案"后一直显示"计算中"，无反应 | `1c74e94` `5ae7d0f` | api.js 函数作用域问题 → window.xxx 挂载 |
| 3 | 即使改完后仍然"postMix 未加载" | `9693e0b` | 放弃 postMix，compute() 内直接 fetch |
| 4 | CMY 方案显示在底部，"兜底"定位不对 | `40d59f1` | CMY 移到最上方，蓝色边框高亮 |
| 5 | 单漆 1-6 份重复显示 | `af90384` | 单漆只保留 1 份 |
| 6 | 相同比例重复（1:1, 2:2, 3:3） | `27b3feb` | GCD 归一化去重 + TOP 10→5 |
| 7 | 重复录入漆料时显示 raw SQL 错误 | `d5d1876` | 后端捕获 DataIntegrityViolation → 中文提示 |
| 8 | 403 时显示"HTTP 403"而非跳转登录 | `521d2e0` `1c74e94` | api.js + mix.html 双重处理 401/403 |
| 9 | CMY 参考无颜色预览 | `25119b3` | 加圆形色块 |
| 10 | 品红、青色颜色不标准 | `bfeb7b1` `95d6a2d` | 品红#E5007F 青色#00B0E8 |

- **人工干预关键发现**: `async function` 声明在普通 `<script>` 标签中的作用域不可靠，改用 `window.xxx = async function()` 显式挂载全局
- **智能体**: Claude Code（所有补丁直接执行）

---

## 学到的教训

1. **Agent 有时很轴，不知道变通**：把 Open Design 的 HTML 原型转成 React 组件时，格式一再错位、图标丢失、布局塌陷。我们反复修了七八轮，Agent 始终没提出"既然原型已经是完整 HTML，为什么不直接用原生 JS 调用后端 API"。直到我主动质疑"就没有能直接加载 HTML 的技术栈吗"，它才立刻切换方案——十几分钟搞定，格式 100% 匹配。教训：Agent 会沿着一个方向死磕，你作为人类需要识别"这条路本身可能不对"，而不是跟着它在细节里打转。

2. **不能过分相信 Agent，即使它是专门做这件事的**：我把 SPEC.md 和 PLAN.md 投喂给 Open Design 让它做前端。它的设计系统（Discord 令牌）和 HTML 原型本来设计得很好，可视化编辑也是它的优势。但在我让它"生成前端"后，默认他是生成前端原型，但它:
   - 完全放弃了可视化预览，输出了一个无法直接预览的 React 工程
   - 自作主张安装了全套 React + TypeScript + Three.js 依赖（node_modules 超过 200MB）
   - 消耗了大量 Token，产出的代码有多处 TS 错误和与 SPEC 不一致的地方
   - 我本可以用 Open Design 的 Web 界面逐页设计、预览、调整，再导出 HTML 给我集成——这才是它的正确用法。教训：专业工具也要在它的能力边界内使用。让设计工具做设计，让编码 Agent 写逻辑，不要越界。

