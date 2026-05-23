# Mini Paint Studio — 微缩模型涂装配色工作站

## 1. 项目概述

### 1.1 问题陈述

微缩模型涂装玩家（战锤、高达、D&D 微缩模型）面临三个核心痛点：

1. **照抄教程偏色**：视频/照片中漆色受灯光和底色影响，买了同款漆涂完发现颜色不对
2. **自混代换翻车**：不想为某个颜色买新漆，用手头已有漆混色替代，凭感觉混不准、容易"发灰"
3. **光影预判困难**：NMM（非金属金属质感）技法严重依赖光影理解，涂装前缺乏参考工具

### 1.2 解决方案

一个 Web 工具，帮助涂装玩家：

- 录入手头已有漆料的真实颜色（拍照取色，消除卖家秀色差）
- 从任意图片取目标色，计算用手头漆混合出目标色的整数份数方案
- 在 3D 材质球和 STL 模型上预览颜色在不同光泽度、金属度、多光源下的效果
- 保存混色配方和打光方案，供涂装时回看

### 1.3 目标用户

微缩模型涂装玩家，有一定涂装经验，正在追求进阶技法（渐变、光影变化、NMM）。非美术专业背景，需要工具辅助色彩决策。

### 1.4 UI 语言

所有前端文案、提示、错误信息使用简体中文。

### 1.5 用户故事

以下用户故事遵循 INVEST 原则（Independent、Negotiable、Valuable、Estimable、Small、Testable），从涂装玩家角度描述核心使用场景：

| # | 用户故事 | 验收条件 |
|---|---------|---------|
| US1 | **作为涂装玩家，我希望录入我手头漆料的真实颜色**，通过拍照取色而非依赖卖家商品图，这样我库存里的颜色数据才是我实际操作中真正看到的颜色。 | 上传漆料照片 → Canvas 点击取色 → 填写品牌色号 → 保存后在漆料列表中看到色块预览。 |
| US2 | **作为涂装玩家，我希望从参考图中取色后，计算用手头漆混合出目标色的方案**，用整数份数（滴/刷量）而非百分比呈现，这样我可以在涂装台上直接操作。 | 上传参考图取色（或手动输 RGB）→ 点击计算 → 返回至多 10 个候选方案，按偏差排序，每个方案显示份数比例。 |
| US3 | **作为涂装玩家，我希望在 3D 材质球上预览配色的实际效果**，调节粗糙度和金属度来模拟消光/光泽/金属漆，并设置多个不同色温光源，这样我能预判 NMM 技法的高光表现。 | 选择几何体 → 设置颜色/粗糙度/金属度 → 添加调节光源 → 球体实时反映材质和光照变化。 |
| US4 | **作为涂装玩家，我希望上传 STL 模型并在上面预览涂装效果**，独立旋转模型来修正不同建模工具的坐标系差异，这样我能在我实际要涂的模型上做光影参考。 | 上传 STL → 包围盒自动居中 → 用旋转/高度滑条调整模型朝向 → 模型显示正确的材质和光照。 |
| US5 | **作为涂装玩家，我希望保存混色配方和打光方案**，附上名称和标签方便日后查找，这样涂装时不用重新计算。 | 混色结果页点击保存 → 填入名称/标签 → 配方出现在列表中可搜索筛选。3D 预览页保存打光方案 → 下次打开一键恢复。 |
| US6 | **作为涂装玩家，我希望通过色轮工具选择互补色和邻近色**，弥补我非美术背景的色彩理论短板，帮我发现更有层次感的配色组合。 | 色轮上选色 → 自动显示互补色/三等分色/邻近色 → 可传入 3D 预览染色或混色引擎计算。 |
| US7 | **作为涂装玩家，我希望在 3D 预览中直接取色**，点击模型表面即可取到高光或阴影区域的 RGB，送入混色引擎算配方。 | 点取色按钮进入取色模式 → 点击 Canvas 上的像素 → 获取 RGB → 可送混色引擎或入库。 |

---

## 2. 功能模块

### 2.1 漆料库

**数据模型**：

| 字段 | 类型 | 说明 |
|------|------|------|
| 品牌 | 枚举 | GW / AV / AK / GSW / Scale75 / Army Painter / 其他 |
| 色号 | 字符串 | 品牌官方编号，如 "70.950 Black" |
| 名称 | 字符串 | 用户自定义名称 |
| 颜色 | 3 个整数 | RGB，从上传照片取色获得 |
| 创建/更新时间 | 时间戳 | |

**交互**：

- **列表页** /paints：每款漆显示色块预览 + 品牌/色号/名称。支持按品牌、录入时间、色系筛选。分页。
- **添加入口**：上传图片 → Canvas eyedropper 在图片上点击取色 → 预览 RGB 色块 → 填入品牌/色号/名称 → 保存
- **编辑**：点击列表项进入详情编辑页，可修改除 RGB 外的字段
- **删除**：软确认弹窗。关联了配方的漆提示"X 个配方正在使用此漆"
- **空列表**：引导文案"还没有录入漆料，点击添加第一瓶"

**取色组件**：复用组件，支持多个入口（漆料库新增、混色引擎目标色、3D 截图取色）。上传图片 → Canvas 渲染 → click 事件取像素 RGB。前端限制 1920px 宽，后端限制 5MB，非图片格式前后端双重校验。点击图片外区域阻止事件。

**边界情况**：
- 上传非图片文件 → 提示"请上传 JPG/PNG/WebP 格式"
- 图片过大 → 前端裁剪压缩至 1920px 宽再上传
- 同品牌同色号不可重复入库 → 唯一性校验

### 2.2 混色引擎

**输入**：用户从取色组件获取目标色 RGB，或手动输入 RGB / 十六进制色值，或从色轮/色谱直接取色。

**算法（MVP）**：

- 候选漆池：当前用户库中所有漆 + 系统内置纯黑 `(0,0,0)` + 纯白 `(255,255,255)`（两个兜底色不受用户录入影响，始终可用）
- 整数份数枚举：1 种漆 × N 份、2 种漆 × 所有整数分配、3 种漆 × 所有整数分配
- 约束：组合中的漆 ≤ 3 种，总份数 ≤ 6
- 混合色 = 各漆 RGB 按份数加权线性平均
- 偏差 = 与目标色的欧几里得距离 √(ΔR² + ΔG² + ΔB²)
- 按偏差升序排列，返回 TOP 10 候选
- 分量 ≤ 总份数 1/10 时自动标注为"少量"

**三原色兜底**：

- 始终展示 CMY + 黑 + 白理论混合方案作为参考基线
- 用户漆 < 1 款（仅剩黑白兜底）：正常计算但候选均为灰度混合，提示"录入更多漆料可获得更准确的结果"
- TOP 10 偏差全部 > 阈值（ΔE > 15）：标记"偏差较大，仅供参考"，同时提升三原色方案为兜底建议

**架构预留**：`MixService` 只暴露 `mix(userId, r, g, b)` 方法。MVP 用 `MixServiceRgbImpl`（RGB 线性穷举），后续实现 `MixServiceKmImpl`（Kubelka-Munk 光谱模型）时仅替换实现类。

**结果展示**：

- 候选列表：每项显示各漆品牌色号 + 份数比例 + 混合色块预览 + 偏差数值
- 可点击候选送入 3D 预览
- 可保存到配方库

**边界情况**：
- 用户漆 = 0 → 纯黑纯白兜底混合，提示"录入更多漆料可获得更准确的结果"
- 库里漆 > 50 款 → 约 12 万组合，单次计算可接受

### 2.3 3D 预览

#### 2.3.1 场景基础

- **默认几何体**：球体（默认）、立方体、圆柱体。顶部 Tab 切换
- **地面参考**：Three.js `GridHelper` 灰色半透明网格。不加 Plane（无全局光照反弹，Plane 反而破坏视觉）
- **场景背景**：中性灰 #808080。预留切换纯白/纯黑背景选项
- **相机**：OrbitControls + 透视相机。滚轮缩放（未选中光源时）

#### 2.3.2 材质参数

使用 `MeshStandardMaterial`：

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| 颜色 | RGB 拾色器 | #808080 中性灰 | 手动输入 / 色轮回传 / 混色结果传入 |
| 粗糙度 roughness | 0–1 | 0.5 | 0=镜面光泽 / 0.5=半消光 / 1=完全消光 |
| 金属度 metalness | 0–1 | 0 | 0=非金属漆 / 1=金属漆 |
| 透明度 | 0–1 | — | MVP 预留，不实现 |

#### 2.3.3 多光源系统

- **默认**：1 个环境光 + 2 个方向光（顶光 + 侧光）
- **数量**：最少 1 个，最多 6 个。按钮增删
- **定位**：
  - 粗调：自定义 `pointerdown/move/up` + `Raycaster` hit-test + 相机平面投影（**废弃 DragControls**，否则与 OrbitControls 冲突）
  - 精调：选中光源后 XYZ 滑条
  - 两者联动：拖球体时滑条实时更新，拖滑条时光源球体实时移动
- **滚轮分离**：选中光源时，Canvas 上 `addEventListener('wheel', handler, { capture: true })` 并 `stopPropagation()`，滚轮 = 光源沿相机视线推拉。未选中时滚轮 = 场景缩放
- **光源属性**：
  - 位置 XYZ：默认 (2,3,2)、(0,3,-2)，分别位于模型右前上、后上
  - 颜色：色温滑块（2000K–10000K，默认 5500K 日光）+ HEX 取色器（默认 #FFFFFF）
  - 强度：滑块 0–10，默认 1.0
  - 独立开关：每个光源可开/关，默认开启
- **可视化**：每个光源显示发光小球体标记位置。选中高亮，点击空白取消选中
- **光源颜色重要性**：NMM 技法中不同色温打在模型上高光颜色截然不同，光源颜色是刚需

#### 2.3.4 STL 模型

- **上传**：STL 文件（二进制/ASCII，`STLLoader` 自动识别）
- **持久化**：上传后存储在服务器本地文件系统。数据库存元数据（文件名、显示名称、文件路径、大小、上传时间、关联用户）
- **管理**：上传后的 STL 以文件名出现在几何体下拉选择框中，与默认几何体并列。上传后自动选中该 STL 并在选择框中高亮。点击内置几何体时清除 STL 选择并切回默认几何体。支持重命名、删除（确认弹窗）
- **独立变换**（STL 建模坐标系不统一，必须支持；对内置几何体同样生效）：
  - 旋转：X/Y/Z 滑条，各 ±180°，默认 0°
  - 高度偏移：-3 ~ +3 滑条，默认 0
  - OrbitControls 旋转的是相机，不是模型，所以必须独立控制
  - 切换几何体时变换参数重置为默认；STL 的变换参数持久化到 stl_files 表
- **加载**：包围盒自动居中 + 归一化缩放到场景尺寸
- **兜底**：`@react-three/fiber` 的 `Suspense` + React `ErrorBoundary` 两层兜底。大文件解析失败不炸整个 Canvas
- **注意**：`useEffect` 做包围盒变换时，依赖数组包含 `heightOffset`，否则高度滑条拖动后模型不动

#### 2.3.5 取色

- 3D 预览页"取色"按钮 → 进入取色模式（光标变为吸管）
- 点击 Canvas 上的模型表面 → 直接从渲染帧读取该像素 RGB
- 取到的 RGB 可送入混色引擎或直接入库（复用取色组件的结果分发逻辑）
- `preserveDrawingBuffer: true` 保证随时可读

#### 2.3.6 打光方案

**数据模型**：

```
LightingPreset
├── 名称（用户命名，如"顶光+侧光_暖色_NMM参考"）
├── 几何体引用（默认球体/立方体/圆柱体，或 STL 文件 ID）
├── 材质快照：颜色 RGB、粗糙度、金属度
├── 光源列表（JSONB 数组）：每个光源保存
│   ├── 类型（directional / point）
│   ├── 位置 {x, y, z}
│   ├── 颜色 HEX
│   ├── 色温（K，通过色温滑块设置时有效，HEX 取色时为 null）
│   ├── 强度（0–10）
│   └── 开关状态（boolean）
├── 封面截图（保存时自动 renderer.domElement.toDataURL()）
├── 创建/更新时间
└── 用户 ID
```

**页面与交互**：

- **独立列表页** `/lighting-presets`：每个方案显示封面缩略图 + 名称 + 几何体类型 + 日期。支持搜索。
- **3D 预览页内快捷操作**：保存（弹窗命名 + 自动截图）、下拉选方案快速加载、删除
- **应用方案**：在列表页点击"应用" → 跳转 `/preview?preset=<id>` → 几何体 + 材质 + 所有光源一键恢复
- 方案可重命名、删除（确认弹窗）

### 2.4 色轮工具

**独立页面** /color-wheel，同时可作为浮动面板在漆料库、混色引擎、3D 预览三页中打开。

**功能**：
- 色轮可视化（HSL 色相环）
- 选中颜色 → 自动计算互补色、三等分色、邻近色、分裂互补色
- HEX / RGB 显示

**三页联动协议**：

| 页面 | 打开色轮做什么 | 选色后行为 |
|------|---------------|-----------|
| 漆料库 | 分析已有漆的色相覆盖，找到色相缺口 | 在色轮上标记已有漆的色相位置（小圆点），不赋值 |
| 混色引擎 | 通过色轮理论选目标色 | 回传 RGB → 填入目标色 → 触发混色计算 |
| 3D 预览 | 直观拖拽选色，实时染色参考 | 回传 RGB → 应用到当前几何体材质颜色 |

#### 2.4.1 色域三角（Gamut Triangle）

**定位**：色轮工具的子页面 / Tab。帮助用户直观理解"我手头这三款漆能混合出哪些颜色"。

**功能**：
- 用户从漆料库选 3 款漆 → Canvas 绘制实心色域图
- 三个顶点 = 三款漆的真实 RGB，连线形成三角形
- 三角形内部用重心坐标（barycentric）渐变填充，显示这三款漆按不同比例能混出的所有颜色
- 鼠标在三角形内移动 → 实时显示该像素的 RGB + 三款漆的整数份数比例
- 点击三角形内任意点 → 取色 → RGB 送入混色引擎（与色轮取色相同流程）
- 目标色落在三角形外 → 提示"该颜色无法由这三款漆混合得出"

**与混色引擎的区别**：
- 混色引擎：给定目标色 → 从全部库漆中穷举最优配方
- 色域三角：指定 3 款漆 → 可视化这 3 款漆的覆盖范围 → 在范围内选色 → 送混色引擎

### 2.5 配方管理

**数据模型**：

```
Recipe
├── 名称（用户自定义，如"极限战士蓝甲高光"）
├── 标签（字符串数组，如"蓝色系"/"高光"/"金属"）
├── 目标色 RGB
├── 混色快照（JSONB）：TOP 候选列表（漆 ID + 份数 + 偏差 + 混合色）
├── 三原色参考（JSONB）：CMY + 黑 + 白份数
├── 备注（自由文本）
├── 色域三角来源（可选）：三款漆的 paintId 数组，记录本次配色是从哪三款漆的色域三角形出发
├── 创建/更新时间
└── 用户 ID
```

**交互**：
- **列表页** /recipes：每个配方显示名称 + 标签 + 目标色色块 + 日期。按标签筛选 + 搜索
- **详情**：展开完整混色方案 + 目标色 vs 混合色色块对比 + 三原色参考
- **保存**：混色引擎结果页 → 弹窗填名称/标签/备注 → 保存 → 跳转配方列表
- **编辑**：可修改名称/标签/备注。混色方案本身只读（是计算结果快照）
- **删除**：确认弹窗

**边界情况**：
- 空列表 → "还没有保存配方，去混色引擎试试"
- 配方引用已删除的漆 → 保留漆品牌色号和 RGB（快照），标记"已删除"
- 同一目标色可多次保存（不做去重拦截）

### 2.6 账户系统

- **注册**：邮箱 + 密码。密码最少 8 位，由字母和数字组成
- **登录**：邮箱 + 密码
- **忘记密码**：输入邮箱 → 发送重置链接（JavaMailSender + Gmail SMTP，免费 tier 每天 500 封）
- **用户数据**：`users` 表只存 `id, email, password_hash, created_at`，无昵称、无头像
- **登录/注册页** /auth：独立页面，Tab 切换登录/注册/忘记密码。不嵌套在侧边导航中
- **表单验证**：
  - 所有输入框有 `placeholder` 预置提示文字
  - 后端返回具体失败原因（如"密码长度不足 8 位"）
  - 前端逐字段展示错误，而非笼统的"注册失败"

---

## 3. 页面结构与路由

```
/auth              — 登录/注册/忘记密码（Tab 切换，独立页，不在侧边导航）
/paints            — 漆料库（列表 + 筛选 + 增删改 + 上传取色）
/mix               — 混色引擎（目标色输入 + 候选列表 + 保存配方）
/preview           — 3D 预览（几何体 + 材质 + 多光源 + STL + 截图 + 打光方案快捷存取）
/recipes           — 配方库（列表 + 标签筛选 + 详情）
/lighting-presets  — 打光方案（列表 + 搜索 + 应用跳转 + 删除）
/color-wheel       — 色轮工具（独立页 + 浮动面板，内含色域三角 Tab）
```

全局侧边导航栏（登录后可见），每个页面独立路由。色轮从漆料库/混色引擎/3D预览页作为浮动面板打开。

**核心用户流程**：

- **流程 A — 配色规划（涂装前）**：漆料库录入 → 色轮查看色相缺口 → 上传参考图取目标色（或色轮选目标色）→ 混色引擎计算 → 3D 预览验证 → 保存配方
- **流程 B — 光影参考（涂装中）**：3D 预览 → 加载几何体/STL → 色轮实时染色 → 调材质 + 多光源 → 取色 → 混色引擎 → 保存打光方案
- **流程 C — 美术决策**：色轮选主色 → 自动计算互补/邻近色 → 主色送 3D 染色 → 互补色送混色引擎算高光配方

---

## 4. 技术架构

### 4.1 系统架构

#### 4.1.1 组件图

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser                                    │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 漆料库    │ │ 混色引擎  │ │ 3D 预览   │ │ 配方库    │ │ 打光方案  │ │
│  │ /paints  │ │ /mix     │ │ /preview │ │ /recipes │ │ /lighting│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│  ┌────┴─────────────┐           │                              │    │
│  │ 色轮工具 /color- │           │              ┌───────────────┘    │
│  │ wheel (浮动面板)  │           │              │                    │
│  └────────┬─────────┘           │              │                    │
│           └──────────┬──────────┴──────────────┘                    │
│                      │                                              │
│  ┌───────────────────┴────────────────────────────────────┐         │
│  │              共享组件层                                │         │
│  │  ColorPicker / ColorWheelPanel / Sidebar / Zustand     │         │
│  └──────────────────────┬───────────────────────────────┘          │
│                         │ REST / multipart                          │
│                    ┌────┴────┐                                       │
│                    │  Nginx  │ (生产环境，开发直连)                    │
│                    └────┬────┘                                       │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────────┐
│                      Docker Network                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐       │
│  │  Frontend        │  │  Backend         │  │  PostgreSQL  │       │
│  │  Nginx :80       │→ │  Spring Boot     │→ │  :5432       │       │
│  │  (Vite build)    │  │  :8080           │  │              │       │
│  └──────────────────┘  └───────┬──────────┘  └──────────────┘       │
│                                │                                     │
│                         ┌──────┴──────┐                              │
│                         │ 本地文件系统  │                             │
│                         │ /uploads    │                              │
│                         │ /stl-files  │                              │
│                         └─────────────┘                              │
└──────────────────────────────────────────────────────────────────────┘
```

#### 4.1.2 数据流

**取色 → 混色 → 预览 → 保存 主流程**：

```
用户上传图片 → Canvas eyedropper → RGB
                                       │
                    ┌──────────────────┤
                    ▼                  ▼
              漆料库入库           混色引擎输入
              POST /api/paints     POST /api/mix {r,g,b}
                    │                  │
                    │         MixService.mix(userId, r, g, b)
                    │         ├─ 查库漆列表 (PaintService)
                    │         ├─ RGB 穷举
                    │         └─ 三原色参考
                    │                  │
                    │                  ▼
                    │         候选列表 (TOP 10 + 偏差 + 三原色)
                    │                  │
                    │         ┌───────┬┴───────┐
                    │         ▼       ▼        ▼
                    │     保存配方  3D预览  色轮染色
                    │     POST     GET参数  回传RGB
                    │     /recipes  /preview?r=&g=&b=
                    │         │       │
                    │         │  ┌────┴────┐
                    │         │  │ Three.js│
                    │         │  │ R3F渲染 │
                    │         │  │ Canvas取色│──→ 回到混色引擎
                    │         │  │ 打光方案 │──→ POST /api/lighting-presets
                    │         │  └─────────┘
                    ▼         ▼
              持久化到 PostgreSQL + 本地文件系统

打光方案回放：列表页 /lighting-presets → 点击"应用" → /preview?preset=<id> → 恢复光源+材质+几何体
```

**跨页面数据传递协议**：

```
色轮选色 ──RGB────→ 3D预览 (直接染色)
        ──RGB────→ 混色引擎 (填入目标色)
3D取色   ──RGB────→ 混色引擎 (填入目标色)
混色结果 ──RGB────→ 3D预览 (填入材质)
        ──快照───→ 配方库 (保存)
打光方案 ──preset─→ 3D预览 (/preview?preset=<id> 恢复全部光源/材质/几何体)
```

#### 4.1.3 外部依赖

| 依赖 | 用途 | 备注 |
|------|------|------|
| PostgreSQL 16 | 持久化存储 | Docker Compose 内置，非外部服务 |
| Gmail SMTP | 忘记密码发邮件 | 仅生产使用，开发环境 Mock |
| 本地文件系统 | 图片 / STL 存储 | 接口抽象，后续可换 MinIO |
| Three.js (CDN/npm) | 3D 渲染 | npm 包，构建时打包 |
| STLLoader (three-stdlib) | STL 文件解析 | npm 包 |

**无外部 SaaS 依赖**：MVP 零外部服务，`docker-compose up` 即可完整运行。

### 4.2 技术选型

| 层 | 选型 | 理由 |
|----|------|------|
| 前端框架 | React 18 + Vite + TypeScript | HMR 开发效率高，Three.js 调参数需频繁刷新 |
| 3D 渲染 | @react-three/fiber + drei + three-stdlib | 声明式 Three.js，drei 内置 OrbitControls/GridHelper，three-stdlib 有 STLLoader |
| UI 设计系统 | [Open Design](https://github.com/nexu-io/open-design) — **Discord** | 见下方详述 |
| 后端框架 | Spring Boot 3 + JPA | 用户熟悉的技术栈 |
| 数据库 | PostgreSQL | 持久化存储，JPA 原生支持 |
| 文件存储 | 本地文件系统（接口层预留 MinIO） | MVP 零成本，部署时替换 |
| 邮件 | JavaMailSender + Gmail SMTP | 忘记密码，免费 tier 每天 500 封 |
| 容器化 | Docker Compose（前端 + 后端 + PostgreSQL） | 作业要求 |

#### 4.2.1 Open Design 设计系统选择

**所选设计系统**：**Discord**

**选择理由**（与目标用户、品牌调性的匹配度）：

1. **暗色基调匹配使用场景**：涂装玩家在涂装台旁使用电脑，环境多为台灯照射下的工作台，暗色界面不刺眼，减少视觉疲劳。Discord 的深灰底色（#36393F）比纯黑更柔和
2. **侧边栏导航**：Discord 的左侧服务器列表天然映射为工具的功能导航，用户对"左侧图标导航"有肌肉记忆
3. **工具感 > 营销感**：Discord 的 UI 语言偏向功能工具（频道列表、角色标签），而非营销落地页。本项目是工具而非宣传站
4. **品牌色点缀**：紫色（#5865F2）在深灰底上作为交互高亮色足够醒目，同时不像亮蓝/亮绿那样在暗光环境中刺眼

**适用的 Open Design skill**：本项目为工具型 Web 应用，非 marketing page / documentation / blog。Open Design 的 `dashboard` skill 与该类工具面板应用最为接近——数据列表、筛选栏、侧边导航、卡片布局是其核心组件。如 `dashboard` skill 不适用，则使用通用的基础设计令牌（颜色、间距、字体、圆角），自定义页面布局。

### 4.3 后端分层架构

```
controller/                  ← REST 入口，参数校验 + HTTP 相关
  PaintController.java
  MixController.java
  RecipeController.java
  StlController.java
  LightingPresetController.java
  AuthController.java
  ColorWheelController.java  ← 无状态纯计算

service/                     ← 接口层
  PaintService.java
  MixService.java            ← mix(userId, r, g, b)，内部算法可替换
  RecipeService.java
  StlService.java
  LightingPresetService.java
  UserService.java
  FileStorageService.java    ← 统一文件存取接口

service/impl/                ← 实现层
  PaintServiceImpl.java
  MixServiceRgbImpl.java     ← MVP 实现（RGB 穷举）
  RecipeServiceImpl.java
  StlServiceImpl.java
  LightingPresetServiceImpl.java
  UserServiceImpl.java
  FileStorageServiceImpl.java

repository/                  ← JPA Repository
model/
  entity/                    ← JPA Entity（PO）
  dto/request/               ← 前端请求体
  dto/response/              ← 响应体（VO）
config/                      ← Security, CORS, FileStorageConfig
```

**关键约束**：
- Controller 之间不互相调用
- Service 之间可互相调用
- Entity 不与前端直接交互，Request DTO / Response DTO 做隔离
- `MixService.mix(userId, r, g, b)` 只暴露一个方法入口

### 4.4 前端分层架构

```
src/
  pages/
    PaintLibrary/
    MixEngine/
    Preview3D/
    LightingPresets/
    RecipeList/
    RecipeDetail/
    ColorWheel/
    Auth/
  components/                ← 共享组件
    ColorPicker/             ← 取色器（eyedropper），各页面复用
    ColorWheelPanel/         ← 色轮浮动面板
    Sidebar/
    UploadImage/
    PaintCard/
    RecipeCard/
  hooks/
    useLightDrag.ts          ← 光源拖拽逻辑
    useScreenshot.ts         ← 3D 截图逻辑
    useColorPicker.ts        ← 取色组件共享状态
  services/                  ← API 调用封装（axios / fetch）
  store/                     ← 全局状态（Zustand）
  types/                     ← TypeScript 类型定义
```

### 4.5 数据库核心表

```sql
users (
  id UUID PK,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP
)

paints (
  id UUID PK,
  user_id UUID FK → users,
  brand ENUM('GW','AV','AK','GSW','Scale75','ArmyPainter','Other'),
  code VARCHAR(100),
  name VARCHAR(255),
  r INT, g INT, b INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, brand, code)
)

recipes (
  id UUID PK,
  user_id UUID FK → users,
  name VARCHAR(255),
  tags TEXT[],
  target_r INT, target_g INT, target_b INT,
  mix_snapshots JSONB,
  cmy_ref JSONB,
  notes TEXT,
  gamut_refs UUID[],               -- 色域三角三款漆的 paintId，可为空
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

stl_files (
  id UUID PK,
  user_id UUID FK → users,
  original_name VARCHAR(255),
  display_name VARCHAR(255),
  file_path VARCHAR(500),
  rotation_x FLOAT DEFAULT 0,
  rotation_y FLOAT DEFAULT 0,
  rotation_z FLOAT DEFAULT 0,
  height_offset FLOAT DEFAULT 0,
  file_size BIGINT,
  created_at TIMESTAMP
)

lighting_presets (
  id UUID PK,
  user_id UUID FK → users,
  name VARCHAR(255),
  geometry_type VARCHAR(20),       -- 'sphere'/'cube'/'cylinder'/'stl'
  geometry_ref_id UUID,            -- FK → stl_files（STL 时非空）
  material_snapshot JSONB,         -- {r,g,b,roughness,metalness}
  lights_snapshot JSONB,           -- [{type,pos:{x,y,z},hex,colorTemp,intensity,enabled}]
  cover_image_path VARCHAR(500),   -- 自动截图
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 4.6 API 概览

```
GET    /api/paints?brand=&sort=&page=      # 漆料列表
POST   /api/paints                          # 新增漆料（含图片上传）
PUT    /api/paints/:id                      # 编辑漆料
DELETE /api/paints/:id                      # 删除漆料（检查配方引用）

POST   /api/mix                             # 计算混色方案 {r, g, b} → 候选+三原色

POST   /api/stl/upload                      # 上传 STL（multipart/form-data）
GET    /api/stl                              # STL 列表
PUT    /api/stl/:id                          # 重命名 / 更新变换参数
DELETE /api/stl/:id                          # 删除 STL

POST   /api/lighting-presets                # 保存打光方案
GET    /api/lighting-presets                # 列表
PUT    /api/lighting-presets/:id            # 更新
DELETE /api/lighting-presets/:id            # 删除

GET    /api/recipes                          # 配方列表（?tag=&search=）
GET    /api/recipes/:id                      # 配方详情
PUT    /api/recipes/:id                      # 编辑名称/标签/备注
DELETE /api/recipes/:id                      # 删除

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/color-wheel/complementary?r=&g=&b=    # 互补色
GET    /api/color-wheel/triadic?r=&g=&b=          # 三等分色
GET    /api/color-wheel/analogous?r=&g=&b=        # 邻近色
```

### 4.7 CORS 配置

**开发环境**：

Spring Boot 全局 CORS：
```java
registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("*")
        .allowedHeaders("*");
```

Vite 代理配置（`vite.config.ts`）：开发时转发 `/api` 和 `/uploads` 到后端，否则 STL 和图片加载 404：
```ts
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/uploads': 'http://localhost:8080',
  }
}
```

**生产环境**：Nginx 统一 serve 前端静态文件 + 反向代理 `/api/` 到后端，同源直连，天然无跨域：
```nginx
location / { root /usr/share/nginx/html; }
location /api/ { proxy_pass http://backend:8080; }
```

---

## 5. 容器化与 CI

### 5.1 Docker Compose

三个服务：前端 Nginx 容器、后端 Spring Boot 容器、PostgreSQL 容器。

```yaml
services:
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
  backend:
    build: ./backend
    depends_on: [db]
    volumes: [uploads:/app/uploads, stl_files:/app/stl-files]
  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["80:80"]
```

### 5.2 CI 流水线

每个 PR 合并后：构建前端镜像 + 后端镜像 → `docker-compose up` → 冒烟测试（关键 API 健康检查 + 前端页面可达）

### 5.3 开发工作流

- 前后端并行开发，各自独立 worktree
- 前端 worktree：React + Vite + Three.js
- 后端 worktree：Spring Boot + JPA + PostgreSQL
- 共享契约：API 接口定义（SPEC.md 中定死的路径、请求体、响应体）
- CI 在合并后自动集成验证

---

## 6. 非功能性需求

- **性能**：混色引擎 50 款漆穷举 < 2 秒；3D 预览 60fps（不含大 STL）；STL 上传限制 20MB
- **安全**：JWT 认证；密码 BCrypt 哈希；SQL 注入防护（JPA 参数化查询）；文件上传类型+大小校验；Request DTO 防止 Mass Assignment
- **可靠性**：STL 解析失败不崩 Canvas（ErrorBoundary）；大图片压缩后上传；配方快照引用的漆被删不丢数据
- **UI**：全中文；所有输入框 placeholder 提示；表单错误逐字段展示；空列表引导文案

---

## 7. 验收标准

每个功能模块"完成"的客观判定标准：

### 7.1 漆料库

- [ ] 可从 JPG/PNG/WebP 图片取色，取色点 RGB 误差 < 5（Canvas 像素读取为精确值）
- [ ] 列表页按品牌 / 录入时间 / 色系筛选均返回正确结果
- [ ] 按品牌 + 色号唯一性约束拒绝重复录入
- [ ] 删除关联配方的漆时弹出引用警告
- [ ] 非图片文件上传被阻止（前后端双重校验）

### 7.2 混色引擎

- [ ] 给定已知 RGB 和 3 款漆，穷举结果包含理论上正确的最优解（偏差 < 5）
- [ ] 用户漆 = 0 时正常返回灰度候选（黑白兜底），提示录入更多漆料
- [ ] 份数占比 ≤ 1/10 自动标注为"少量"
- [ ] TOP 10 全部 ΔE > 15 时显示兜底提示
- [ ] 50 款漆穷举在 2 秒内完成

### 7.3 3D 预览

- [ ] 球体 / 立方体 / 圆柱体可切换，渲染正常
- [ ] roughness 和 metalness 滑块实时反映到材质
- [ ] 光源拖拽不触发相机旋转（OrbitControls 隔离）
- [ ] 选中光源时滚轮推拉光源位置而非缩放场景
- [ ] XYZ 光源滑条与拖拽位置双向联动
- [ ] STL 上传后包围盒居中 + 归一化缩放
- [ ] STL 独立旋转（±180°）和高度偏移（-3~+3）生效
- [ ] STL 解析失败不崩 Canvas（ErrorBoundary 捕获）
- [ ] 取色模式下点击 Canvas 可直接读取像素 RGB

### 7.4 色轮工具

- [ ] 色轮 HSL 色相环正确渲染
- [ ] 互补色（180°）、三等分色（±120°）、邻近色（±30°）、分裂互补色计算结果正确
- [ ] 选色可传入 3D 预览（染色）和混色引擎（填充目标色）

### 7.5 打光方案

- [ ] 保存方案时自动截图作为封面
- [ ] 列表页显示封面缩略图 + 名称 + 几何体类型
- [ ] 从列表页点击"应用"跳转 `/preview?preset=<id>` 并恢复全部光源/材质/几何体
- [ ] 3D 预览页内下拉可快速切换方案

### 7.6 配方管理

- [ ] 混色结果保存后出现在配方列表，包含名称 / 标签 / 目标色
- [ ] 标签筛选和搜索返回正确结果
- [ ] 配方引用的漆被删后配方仍可查看（显示"已删除"标记）

### 7.7 账户系统

- [ ] 注册时密码 < 8 位被拒绝，返回具体原因
- [ ] 重复邮箱注册被拒绝，返回"该邮箱已注册"
- [ ] JWT 过期后请求被拒绝（401）
- [ ] 忘记密码发送邮件（开发环境 Mock 验证 Token 生成即可）

### 7.8 容器化

- [ ] `docker compose up` 在全新环境一键启动，无需手动配置数据库
- [ ] 前端页面、后端 API、PostgreSQL 均正常运行

---

## 8. 风险与未决问题

预见到的可能让智能体翻车的地方：

### 8.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| **光源拖拽与 OrbitControls 冲突** | 拖光源时相机乱转，影响 3D 预览核心体验 | 废弃 DragControls，自定义 pointer 事件 + Raycaster + camera-plane 投影。已在 SPEC 中明确技术方案 |
| **STL 坐标系不一致** | 模型加载后方向错误（竖墙变平躺），用户体验崩溃 | 独立旋转滑条 + 高度偏移。`useEffect` 依赖数组正确配置 |
| **RGB 线性混合偏差大** | 计算出的混色与实际油漆混合结果差异明显 | 架构预留 K-M 接口，MVP 阶段接受该偏差，标注"仅供配色参考"。三原色方案作为补充 |
| **组合爆炸** | 漆料 > 50 款时穷举组合量过大 | 50 款约 12 万组合可接受。> 100 款加缓存或剪枝策略 |
| **STL 大文件** | 解析超时或内存溢出，崩掉整个 Canvas | Suspense + ErrorBoundary 兜底；后端限制 20MB |
| **Open Design 设计系统集成** | Discord 设计系统的 CSS 变量如何注入 Vite 项目（开发时是 Vite dev server，不是 Open Design serve） | 从 Open Design 导出 CSS 变量文件，作为全局样式引入；或直接用 Discord 色值手写 CSS 变量 |
| **Spring Boot + JPA 复杂查询** | STL/配方的 JSONB 字段查询可能性能差 | JSONB 查询量小（单用户数据），无需特殊优化。必要时加 GIN 索引 |

### 8.2 流程风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| **前后端 API 契约不一致** | subagent 各自实现，前端期望的字段和后端返回的不一致 | SPEC 中 API 路径/请求体/响应体写死。开发前双方确认 DTO 类型定义 |
| **subagent 忽视已定义的 UI 约束** | 如忘记 `preserveDrawingBuffer: true`、忘记 `heightOffset` 依赖 | PLAN 中每个 task 显式标注"必须遵守的 SPEC 约束"，code review 专项检查 |
| **TDD 形式化** | subagent 写弱断言测试（`assert(true)` 之类）蒙混过关 | code review 中检查测试是否真正验证了行为，而非仅验证返回值非 null |

### 8.3 未决问题

- **Open Design `dashboard` skill 的具体组件是否满足本项目需求**：若`dashboard` skill 的布局组件（数据表格、筛选栏）可直接使用则采纳；若不匹配则只用 Discord 设计令牌，页面布局手写
- **混色引擎 ΔE 阈值**：当前暂定 15（RGB 欧几里得距离）。第一轮实测中 30 已是肉眼可见明显偏差，15 仍需观察。不同色域感知偏差可能不同，后续酌情调整
- **Gmail SMTP 配置**：国内网络环境 Gmail SMTP 可能不可达，备选 Resend（免费 tier 100 封/天）或网易邮箱 SMTP
