# SPEC_PROCESS.md — 规约生成过程记录

## 基本信息

- **项目名称**：Mini Paint Studio（微缩模型涂装配色工作站）
- **主开发智能体**：Claude Code (deepseek-v4-pro)
- **Superpowers 版本**：5.1.0
- **Open Design 设计系统**：Discord
- **brainstorming 日期**：2026-05-23

---

## 1. Brainstorming 关键节点

### 1.1 初始设想确认

用户在第一轮迭代中已经走过一遍完整流程，因准备不充分导致后续补丁严重。本轮从零开始，重新严格按 Superpowers 7 步工作流推进。

用户给出了非常清晰的初始设想：
- Web 工具，帮助微缩模型涂装玩家
- 四大核心模块：漆料库、混色引擎、3D 预览、配方管理
- 整数份数混色（非百分比）、STL 模型预览、多光源系统
- 邮箱注册登录

**用户已有的明确立场**：
- 后端用 Spring Boot（熟悉的技术栈）
- 前端用 Open Design
- 数据库必须持久化（第一轮用 H2 内存库踩过坑）

### 1.2 智能体追问与用户修正

以下是 brainstorming 中关键的追问和修正节点：

| # | 智能体问题 | 用户回答/修正 | 对 SPEC 的影响 |
|---|-----------|-------------|---------------|
| Q1 | 使用场景？涂装前备课 / 涂装中查配方 / 漆料管理？ | 涂装前预先配色 + 涂装时光影参考，两者都重要 | 确立了 3D 预览和混色引擎同等重要的设计基调 |
| Q2 | 使用什么设备？ | 电脑，手机不方便 | 桌面优先，不需要移动端适配 |
| Q3 | K-M 模型 vs RGB 线性混合？ | RGB 穷举做 MVP，架构留 K-M 接口 | 确定 MixService 单一入口 + 可替换实现 |
| Q4 | 取色方式？ | 上传图片 + eyedropper 取色 | 催生了 ColorPicker 复用组件设计 |
| Q5 | 3D 渲染库？ | Three.js（第一轮已验证过） | 直接确定 R3F + drei + three-stdlib |
| Q6 | 配方管理粒度？命名+标签 vs 项目关联？ | 命名+标签即可，不做项目关联 | MVP 范围确定 |
| Q7 | 多用户 vs 单用户？ | 多用户，完善的表单验证 | 确定了 auth 模块的完整度要求 |

### 1.3 用户主动提出的关键修正

以下不是智能体追问，而是用户在审阅过程中主动提出的：

| # | 用户提出的修正 | 理由 | 对 SPEC 的影响 |
|---|--------------|------|---------------|
| U1 | 架构讨论前先逐个打磨模块 | 智能体跳太快，应模块级别一个一个来 | 调整了 brainstorming 节奏 |
| U2 | 库里漆不足时不显示候选，直接给三原色兜底 | 没意义的候选展示不如不给 | 修改了混色引擎的边界条件 |
| U3 | 三原色兜底要含黑白配比，不只是 CMY | 灰度调整靠黑白 | CMY → CMY+黑+白 |
| U4 | "少量"阈值明确为 ≤ 1/10 | 避免模糊判断 | 确定了"少量"的计算标准 |
| U5 | 总份数 5 → 6 | 实际操作中更灵活 | 更新约束条件 |
| U6 | 系统内置纯黑纯白兜底色 | 即使用户一瓶漆都没录也能跑 | 大规模修改了混色引擎边界条件 |
| U7 | STL 旋转和光源拖拽的具体技术方案 | 第一轮的 bug 经验 | 写入 SPEC 的 3D 预览部分 |
| U8 | 漆料库去掉原图和备注 | 太复杂，没必要 | 数据模型大幅简化 |
| U9 | 去掉取色坐标 | 不存原图，坐标无意义 | 进一步精简 |
| U10 | 密码规则简化 | 8 位 + 字母数字即可，不要大小写复杂度 | 降低注册门槛 |
| U11 | 打光方案独立页面 | 需要列表管理，不能只是下拉框 | 新增 /lighting-presets 路由和验收标准 |

### 1.4 第一轮 Agent 反馈的问题

用户将第一轮迭代中 subagent 的发现反馈给了本次 brainstorming：

| # | 问题 | 解决方案 |
|---|------|---------|
| F1 | Vite 代理 /uploads 未配置，STL 加载 404 | 补充到 SPEC §4.7 CORS 配置 |
| F2 | STL 上传后缺少自动选中交互说明 | 补充上传后自动选中 + 点击内置几何体清除选择 |
| F3 | ΔE 阈值 30 太高，肉眼可见偏差 | 降至 15 |

---

## 2. 至少 3 轮关键迭代

### 迭代 1：模块粒度打磨

**初始状态**：用户给出了四个核心模块的粗略描述。
**对话过程**：智能体逐一展开每个模块——漆料库、混色引擎、3D 预览、配方管理，每个模块用表格形式呈现数据模型和交互设计。
**用户反馈**："你别急，我们应该先梳理一下当前的模块，然后逐个打磨其功能"
**处理决策**：接受。放慢节奏，逐模块通过后再进入架构设计。

### 迭代 2：3D 预览详化

**初始状态**：3D 预览是最大最复杂的模块。
**对话过程**：智能体给出了场景基础、材质参数、多光源系统、STL 模型、截图取色、打光方案六个子模块的完整规约。用户连续补充了多个第一轮的技术教训（DragControls 冲突、滚轮分离、heightOffset 依赖、Suspense+ErrorBoundary 两层兜底）。
**处理决策**：全部采纳。这些都是第一轮中实际踩过的坑，具有高度可信性。

### 迭代 3：色轮工具 + 跨页面联动

**初始状态**：色轮不存在于用户的原始设想中，是智能体在页面结构讨论后用户提出的补充。
**对话过程**：用户提出需要色轮工具，且"虽然是独立的页面，但是三个页面的功能是有交互联系的"。智能体设计了"独立页 + 浮动面板 + 三页联动协议"的三层架构。
**处理决策**：采纳并完善。通过 visual companion 展示了完整的页面结构和交互协议。

---

## 3. AI 建议采纳与推翻

### 采纳的 AI 建议

1. **Service 层拆分为接口+实现**：用户原来的设计没有区分 interface 和 impl。AI 提出后用户立即采纳。
2. **DTO 分层（Request/Response/Entity）**：AI 说明了为什么需要 DTO 以及它如何防止 Mass Assignment 攻击。
3. **Three.js 技术方案**：AI 推荐 R3F+drei+three-stdlib 组合，和用户第一轮的技术选型一致。
4. **Vite 代理配置**：AI 注意到开发环境需要代理 /uploads，补充进了 CORS 配置。
5. **打光方案独立页面**：AI 同意用户提出的独立页面需求，并设计了 /lighting-presets 路由和应用跳转流程。

### 推翻或修正的 AI 建议

1. **架构过早呈现**：AI 在模块细化完成前就试图呈现完整的架构设计方案，被用户制止——"你别急，我们应该先梳理一下当前的模块"。
2. **漆料库字段冗余**：AI 初始包含了取色原图、取色坐标、备注三个字段。用户认为全部不需要，AI 接受并简化。
3. **密码复杂度**：AI 初始设置了"大写+小写+数字"的密码规则。用户要求简化为"8位+字母数字"，AI 接受。
4. **光源默认位置**：AI 给出的默认光源位置 (2,3,2) 和 (0,3,-2) 是基于惯例的估算值，用户质疑"你确定吗？还是臆测的"。AI 承认是估算，未强制修改。

---

## 4. Superpowers Brainstorming 反思

### 做得好的地方

1. **逐个模块验证**：skill 要求的"Present design — in sections, get user approval after each section"非常有效。用户可以在每个模块级别签字确认，而不是面对一整份 700 行的 SPEC 无处下手。
2. **Visual companion**：在页面结构和跨页面联动展示时，浏览器端的渲染比纯文本描述直观得多。
3. **规格自审**：写完后 AI 自动检查占位符、一致性、范围，发现并修复了多个问题（如章节编号错位、验收标准遗漏）。
4. **用户故事 + 验收标准强制**：这两个要求来自作业本身而非 skill，但它们补齐了 SPEC 中最容易缺失的部分——可测试的完成标准。

### 可以改进的地方

1. **Skill 未见"冷启动验证"步骤**：Superpowers brainstorming skill 的流程终点是 writing-plans，中间没有"停下来做冷启动验证"的关卡。但作业要求必须做，这意味着需要在 brainstorming 和 writing-plans 之间手动插入这个步骤。
2. **SPEC 模板与作业要求的差异**：Superpowers 产出的 SPEC 自然偏向"功能规约 + 架构"，但作业 §4.2 要求的 10 项内容（用户故事、验收标准、风险等）需要人工补充。第一次写出的 SPEC 漏了 6 项，用户指出后才补齐。
3. **节奏控制**：Skill 要求流程性追问，但当用户有自己的明确设想时，逐条追问显得琐碎。用户可以一次性给出更多内容，AI 应该灵活适应。

---

## 5. 冷启动验证记录

**验证方式**：将 SPEC.md + PLAN.md 投喂给一个不同的编码 agent（全新 session，无对话历史），要求其从 PLAN Task 0.1 开始实现。

**验证 agent**：Cold-start agent（用户自行选择的不同 agent 类型）

### 5.1 Agent 提出的疑问

| # | Agent 疑问 | 暴露的 SPEC/PLAN 缺陷 | 修订措施 |
|---|-----------|----------------------|---------|
| 1 | 是否需要在仓库根目录创建 backend/ 和 frontend/？路径确认 | 路径约定在 PLAN 中隐式存在但没有显式声明 | 维持不变（PATH 在 File Map 中已清晰），建议冷启动时直接回复"确认根目录" |
| 2 | 是否需要修改 PLAN.md 记录 commit hash？如何协调和主 agent 的 PLAN 修改？ | PLAN 追踪规则未说明冷启动场景下谁负责更新 | 明确分工：冷启动 agent 只做代码 commit，不修改 PLAN.md。commit hash 由人工收集后反馈给主 agent 更新 |

### 5.2 对 SPEC.md / PLAN.md 的修订

**PLAN.md 修订（唯一的 spec 缺陷修复）**：

冷启动 agent 的第一条疑问暴露了 PLAN.md 头部描述的环境假设问题。修订如下：

```diff
-# Mini Paint Studio Implementation Plan
-
-> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.
+# Mini Paint Studio Implementation Plan
+
+> **For agentic workers:** If running inside Superpowers, use `subagent-driven-development` or `executing-plans` skill. If running standalone (no Superpowers), implement tasks directly in this session — TDD steps and code are self-contained; skip skill invocations but follow the same red-green-refactor flow.
```

**修订理由**：原始措辞 `REQUIRED SUB-SKILL` 对非 Superpowers 环境的 agent 是死胡同——它没有这个工具入口，会停下来问。新的措辞同时兼容 Superpowers 和 standalone 两种执行模式。

**SPEC.md**：无需修订。冷启动 agent 未对功能规约、API 定义、数据模型提出任何疑问，说明 SPEC 内容足够自包含。

### 5.3 冷启动总结

- PLAN.md 中的"REQUIRED SUB-SKILL"是一种隐式的环境假设——假定执行 plan 的 agent 一定在 Superpowers 框架内运行。冷启动 agent 没有这个入口，会产生困惑。**这是 Superpowers 方法论的一个内在假设：plan 是在 Superpowers 环境内被消费的。当跨环境使用时，需要在 plan 中额外说明兼容方式。**
- 除此之外，task 的技术内容（文件路径、代码片段、TDD 步骤）足够自包含，一个陌生 agent 可以直接执行。
- 路径约定通过 File Map ASCII 图和每个 task 的 "Files: Create/Modify" 头部可以推断，但一个显式的"所有路径相对于仓库根目录"声明会更好。
