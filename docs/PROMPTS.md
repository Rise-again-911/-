# 核心 Prompt 记录文档

**项目名称**：《100种不可思议旅行》MVP

**文档目的**：本文档记录本项目在 72 小时 AI 辅助开发过程中的核心 Prompt。项目开发过程采用多范式融合工程流程，按照 SDD、DDD、TDD、E2E 逐步推进，并结合 Debug、Code Review 与 Delivery 完成交付闭环。本文档重点记录引导 AI 开发的关键原始 Prompt，以及每段 Prompt 当时的意图、遇到的挑战和后续如何引导 AI 修正。

---

## 1. 【项目启动阶段】总开发流程规划 Prompt

**对应范式**：项目启动阶段 / 多范式总控规划

**核心 Prompt**：

```
我正在进行一个 72 小时 AI 辅助开发面试考核项目。

项目名称：
"100种不可思议旅行 - 轻量级内容展示 Web App MVP"

你是一个高级产品经理和全栈开发工程师，此身份将贯穿始终。

现在是项目启动阶段，请不要直接写业务代码，不要一次性生成完整项目，不要直接进入 UI 或功能开发。

请先完成以下事情：

1. 使用 Superpowers 的 brainstorming，帮我建立完整开发流程；

2. 将项目拆成以下阶段：
   - SDD：产品需求、数据模型、SQLite Schema、API 契约；
   - DDD：UI/UX、页面结构、组件拆分、状态流转；
   - TDD：先写核心逻辑测试，再补实现；
   - E2E：端到端用户流程测试；
   - Debug：系统化问题定位；
   - Code Review：最终质量审查；
   - Delivery：README、Prompt 记录、工作流文档、Git 提交检查。

3. 每个阶段必须说明：
   - 阶段目标；
   - 输入上下文；
   - 产出文件；
   - 禁止事项；
   - 验收标准；
   - 建议 Git commit message。

4. 后续每完成一个阶段后，请停止继续开发，先告诉我：
   - 修改了哪些文件；
   - 为什么修改；
   - 如何验证；
   - 推荐执行的 git add 命令；
   - 推荐的 git commit message；
   - 下一阶段应该做什么。

5. MVP 阶段禁止加入：
   - 支付；
   - Supabase；
   - MapboxGL；
   - GSAP；
   - Howler.js；
   - PWA；
   - Zustand。

6. 产品核心功能限定为：
   - 首页旅行灵感展示；
   - 旅行卡片列表；
   - 标签筛选；
   - 关键词搜索；
   - 旅行详情页；
   - 灵感盲盒随机推荐。

7. 目标用户：
   以 95 后-00 后为主，追求小众玩法、视觉审美、个性表达、社交分享和反同质化旅行体验的年轻用户。

8. 产品定位：
   一个以"小众玩法"和"情绪体验"为核心的旅行灵感发现平台。

9. 请先输出项目总开发计划，不要写代码。

10. 输出后等待我确认，再进入 SDD 阶段。
```

**当时意图**：项目一开始先要求 AI 建立完整开发流程，而不是直接生成代码。这样做是为了让整个项目具备阶段边界、验收标准和 Git 提交节奏，避免 AI 一次性生成大量不可控代码。

**遇到的挑战与修正**：最初 MVP 范围比较保守，后续根据交付要求和项目完整性，逐步加入认证、投稿、评论、点赞收藏、个人中心和后台管理等能力。后续通过阶段化 Prompt 继续约束 AI：每完成一个阶段必须停止汇报，不允许自动进入下一阶段。

---

## 2. 【SDD 阶段】产品需求、ER 图、数据模型与 API 契约生成

**对应范式**：SDD：Spec / Schema-Driven Development，契约/模型驱动。

**核心 Prompt**：

```
现在进入 SDD 阶段。

请基于《100种不可思议旅行》的产品定位，先生成开发文档和数据契约，不要写业务代码。

本阶段需要产出：

1. PRD.md
   - 产品背景
   - 产品定位
   - 目标用户
   - 用户痛点
   - MVP 范围
   - 核心功能清单
   - 用户流程
   - 页面结构
   - 角色权限
   - 非功能需求
   - MVP 不做什么

2. ERD.md
   - 使用 Mermaid erDiagram
   - 包含 User、Trip、Tag、TripTag、Comment、Like、Favorite
   - 表达用户、旅行灵感、标签、评论、点赞、收藏之间的关系
   - 标注唯一约束和级联删除关系

3. schema.prisma
   - 严格按照 ERD 实现 Prisma Schema
   - 使用 SQLite
   - 使用 UserRole、TripStatus、TagType 枚举
   - Like 和 Favorite 必须有 userId + tripId 唯一约束
   - TripTag 使用 tripId + tagId 联合主键

4. API_CONTRACT.md
   - 认证 API
   - 旅行灵感 API
   - 搜索筛选 API
   - 评论 API
   - 点赞 API
   - 收藏 API
   - 个人中心 API
   - 后台管理 API
   - 每个接口写清 method、path、权限、请求体、响应体和错误码

5. SAD.md
   - 系统目标
   - 整体架构
   - 技术选型
   - 项目目录结构
   - 数据流设计
   - 权限设计
   - 数据库架构
   - 部署边界

要求：
- 所有文档使用 Markdown。
- Mermaid 图必须可渲染。
- 不要进入 UI 或业务功能开发。
- 每份文档完成后说明是否与上一份文档保持一致。
```

**当时意图**：SDD 阶段的核心目标是先明确"做什么"和"怎么建模"。PRD 用来约束产品方向，ERD 和 schema.prisma 用来约束数据结构，API_CONTRACT 用来约束前后端接口，SAD 用来约束系统架构。

**遇到的挑战与修正**：最初 AI 容易遗漏 PRD 或 ER 图，也出现过 Bookmark / Favorite、Trip / TravelInspiration 等命名不一致的问题。后续通过补充指令要求：PRD 和 ERD 不能省略，所有文档必须统一模型命名，后续代码必须严格跟随 ERD 和 schema.prisma。

---

## 3. 【SDD 阶段】数据库初始化与 Seed 数据验证

**对应范式**：SDD：Schema / Seed 驱动。

**核心 Prompt**：

```
请继续 SDD 阶段，基于 schema.prisma 生成数据库初始化脚本和高质量样例数据。

要求：

1. 创建 prisma/seed.ts。
2. 至少生成 10 条高质量官方旅行灵感数据。
3. 生成 1 个 admin 用户和 2 个普通用户。
4. 生成评论、点赞、收藏等基础互动数据。
5. 所有字段必须与 schema.prisma 保持一致。
6. 统一使用 Favorite / favoriteCount，不使用 Bookmark / bookmarkCount。
7. 创建 scripts/check-seed.ts，用于验证种子数据完整性。

验证脚本需要检查：
- User 总数 >= 3
- admin 用户存在，role = ADMIN
- Tag 总数满足 MVP 需求
- Official Trip 数量 >= 9
- Pending 投稿数量 >= 2
- Comment / Like / Favorite 数量 > 0
- 每条官方 Trip 至少包含必要字段和标签关系

请运行：
- npm install
- npx prisma generate
- npx prisma migrate dev --name init
- npx prisma db seed
- npx tsx scripts/check-seed.ts

完成后汇报：
- 创建/修改了哪些文件
- 数据库初始化是否成功
- seed 是否成功
- check-seed 是否通过
- 是否可以提交
```

**当时意图**：为了让 MVP 打开后立即有内容可展示，需要先准备稳定的种子数据。Seed 数据不仅服务首页和详情页展示，也服务后续测试、个人中心、后台审核和 E2E 验证。

**遇到的挑战与修正**：最开始运行验证脚本时报错 `Cannot find module '@prisma/client'`，说明项目运行环境还没有初始化。后来补齐 package.json、tsconfig.json、next.config.ts，并重新执行 Prisma generate、migrate、seed，最终 `Seed data check passed`，验证了数据库初始化流程可复现。

---

## 4. 【DDD 阶段】首页、详情页和核心 UI 生成

**对应范式**：DDD：Design-Driven Development，设计驱动。

**核心 Prompt**：

```
请进入 DDD 阶段：前端组件与页面生成。

要求：
1. 所有页面、组件、视觉层级、交互状态必须调用 UI UX Pro Max。
2. 保持暗色、克制、沉浸、小众旅行灵感平台的视觉方向。
3. 不要大面积紫色渐变。
4. 不要过度发光。
5. 不要俗套 AI 风格。

本阶段实现：
- 首页
- 旅行灵感卡片
- 搜索框
- 标签筛选
- 灵感盲盒随机发现入口
- 详情页
- 评论区占位
- loading / empty / error 状态

首页要求：
- 展示旅行灵感卡片流
- 支持关键词搜索
- 支持标签筛选
- 点击卡片进入详情页
- 盲盒入口可以随机跳转详情页

详情页要求：
- 展示标题、摘要、正文、标签、作者、创建时间等信息
- 支持展开更多内容
- 保持移动端和桌面端布局稳定

本阶段不要写后台管理，不要写测试，不要进入 TDD / E2E。
完成后运行 npx tsc --noEmit，并汇报页面预览效果。
```

**当时意图**：DDD 阶段的目标是先把页面结构、视觉风格和交互状态做出来，让产品从文档进入可感知的 Web App 形态。UI UX Pro Max 用于约束视觉和交互，避免页面只是功能堆叠。

**遇到的挑战与修正**：首页集成后出现中文输入法 IME 问题、标签筛选失败、盲盒按钮不清晰等问题。后续通过修复 Prompt 要求 SearchBar 增加 onCompositionStart / onCompositionEnd，标签筛选改为前端本地筛选，盲盒按钮从单独 `#` 图标改为"随机发现"文字按钮，并增加 loading 状态。

---

## 5. 【DDD 阶段】认证、投稿、个人中心与后台页面生成

**对应范式**：DDD：Design-Driven Development，设计驱动。

**核心 Prompt**：

```
请继续 DDD 阶段，生成认证、投稿、个人中心和后台管理相关页面。

要求：
1. 必须调用 UI UX Pro Max。
2. 保持现有暗色设计系统，不要重新发明 UI 风格。
3. 页面必须有 loading / empty / error 状态。
4. Header 需要根据登录状态动态变化。

需要实现的页面：
- /login 登录页
- /register 注册页
- /create 发帖页
- /profile 个人中心
- /admin 后台首页
- /admin/posts 内容审核页
- /admin/users 用户管理页
- /admin/comments 评论管理页

Header 规则：
- 未登录：显示首页、登录、注册
- 普通用户：显示首页、发帖、个人中心、退出
- 管理员：显示首页、发帖、个人中心、后台、退出

后台要求：
- 需要 AdminSidebar
- 包含统计面板
- 包含帖子、用户、评论等管理入口
- 普通用户不能看到后台内容

本阶段重点是页面和组件结构，不要进入 E2E。
完成后运行 npx tsc --noEmit。
```

**当时意图**：这一阶段补齐用户闭环和管理闭环所需的页面承载，包括登录注册、发帖、个人中心和后台。这样后续 API 接入、权限判断和测试都有页面基础。

**遇到的挑战与修正**：阶段 9 后发现管理员登录后 Header 没有"后台"入口，只能手动输入 URL 访问。后续要求 AI 只修改 Header.tsx，从 session 中读取 role，当 role 为 ADMIN 时显示 `/admin` 后台入口，不改认证逻辑和后台页面。修复后管理员导航入口恢复。

---

## 6. 【TDD 阶段】核心逻辑单元测试

**对应范式**：TDD：Test-Driven Development，测试驱动。

**核心 Prompt**：

```
请进入 TDD 阶段：核心逻辑测试与业务验证。

目标：
将前面阶段的核心验收标准转化为自动化测试代码，覆盖搜索映射、表单校验、权限判断和核心业务逻辑。

要求：
1. 使用 Vitest。
2. 创建 vitest.config.ts。
3. 创建 tests/unit/search.test.ts。
4. 创建 tests/unit/validations.test.ts。
5. 不新增业务功能。
6. 除非测试暴露真实 bug，否则不要修改业务代码。

search.test.ts 覆盖：
- mapKeyword("没人") 应映射到"反向小城"
- mapKeyword("星空") 应映射到"暗夜星旅"
- mapKeyword("废墟") 应映射到"废墟美学"
- mapKeyword("完全无关词") 应返回空结果，不应抛错

validations.test.ts 覆盖：
- registerSchema 用户名少于 3 位应失败
- registerSchema 合法 username/password 应通过
- loginSchema 空 username 应失败
- tripCreateSchema highlights 少于 3 个应失败
- tripCreateSchema 合法投稿数据应通过
- commentSchema 空评论应失败
- profileUpdateSchema bio 超过 200 字应失败

运行：
- npx vitest run
- npx tsc --noEmit

完成后汇报：
- 创建/修改了哪些文件
- 单元测试覆盖了哪些验收标准
- npx vitest run 是否通过
- npx tsc --noEmit 是否通过
- 是否可以提交
```

**当时意图**：TDD 阶段用于把人工验收标准转化为可执行测试。虽然项目并非从第一行代码开始完全遵循"先测试再实现"，但通过后期补齐单元测试，将核心逻辑固定下来，避免后续修改破坏搜索、表单校验和权限逻辑。

**遇到的挑战与修正**：一开始对"写完程序再补测试是否还算 TDD"存在疑问。后来明确：验收标准是人类语言版测试，测试代码是可自动执行的验收标准。最终将搜索映射、表单校验、评论校验、个人资料校验等核心验收标准沉淀为 Vitest 单元测试，结果为 25 个单元测试全部通过。

---

## 7. 【E2E 阶段】系统级端到端测试

**对应范式**：E2E：系统级端到端测试与质量闭环。

**核心 Prompt**：

```
请进入 E2E 阶段：系统级端到端测试与质量闭环。

目标：
使用 Playwright 验证完整用户路径。

创建：
- playwright.config.ts
- tests/e2e/home.spec.ts
- tests/e2e/auth.spec.ts
- tests/e2e/admin.spec.ts
- docs/TEST_REPORT.md

home.spec.ts 覆盖：
- 首页可打开
- 能看到标题"找到一种属于你的感觉"
- 能看到搜索框
- 输入"没人"并搜索，应出现结果，不白屏
- 点击标签筛选，应出现结果
- 点击清除全部后恢复默认列表
- 点击"随机发现"应跳转到 /trips/[id]

auth.spec.ts 覆盖：
- 登录页可打开
- admin / password123 可以登录
- 登录后 Header 显示"后台"
- 未登录访问 /create 应跳转 /login
- 注册页可打开

admin.spec.ts 覆盖：
- admin 登录后访问 /admin 能看到后台布局
- 能看到后台统计面板
- 能看到 AdminSidebar
- 非 admin 访问后台应显示 Access Denied 或被拦截

要求：
1. 使用 Playwright 推荐的用户可见定位方式。
2. 不依赖截图。
3. 不使用不稳定 CSS 选择器。
4. 不开发新业务功能。
5. 如果测试需要给输入框补 name 属性，可以最小化修改。
6. 运行：
   - npx tsc --noEmit
   - npx vitest run
   - npx playwright test
7. 完成后生成 docs/TEST_REPORT.md。
```

**当时意图**：E2E 阶段用于证明系统级流程可用，而不是只证明单个函数或 API 能运行。重点验证首页搜索筛选、登录流程、路由守卫、后台访问等关键链路。

**遇到的挑战与修正**：Playwright 测试登录表单时需要稳定选择器，但 LoginForm 最初缺少 name 属性。后续允许最小化修改 LoginForm.tsx，只给 username/password 输入框补 name 属性，不改变 UI 和业务逻辑。最终 E2E 测试 13 个用例全部通过。

---

## 8. 【Debug 阶段】首页搜索、筛选与盲盒问题修复

**对应范式**：Debug：系统化问题定位与修复。

**核心 Prompt**：

```
请修复阶段 10 首页体验问题。

问题：
1. 搜索框使用中文输入法时页面抽动严重。
2. 输入拼音过程中会直接触发搜索，把拼音也带进结果。
3. 标签可以选中，但筛选后页面加载失败。
4. 盲盒按钮外观与验收标准不一致，只有一个 # 图标，不清楚其含义。
5. 盲盒按钮没有明显点击反馈和 loading 状态。

要求：
1. SearchBar 增加 IME 中文输入处理：
   - onCompositionStart
   - onCompositionEnd
   - composingRef.current = true / false
   - 拼音组合期间不触发搜索
2. 首页不要调用不存在的 /api/trips/filter。
3. 首页初始加载数据，然后在前端本地筛选。
4. THEME 标签按 trip.theme 筛选。
5. MOOD / LEVEL 标签按 trip.tags 筛选。
6. 盲盒按钮改成"随机发现"文字按钮，保留 SVG 图标。
7. 点击盲盒后显示 loading spinner 和"寻找中..."状态。
8. 搜索框和盲盒按钮同一行布局稳定，不因 loading/error/empty 抽动。
9. 空状态显示 EmptyState，并给出建议关键词。
10. 保持原有暗色设计系统。
11. 运行 npx tsc --noEmit。
```

**当时意图**：该阶段针对人工预览中发现的真实体验问题进行集中修复。首页是评委最先看到的页面，搜索、筛选和盲盒入口如果不稳定，会直接影响演示质量。

**遇到的挑战与修正**：问题主要来自中文输入法组合态没有处理、筛选依赖不存在的接口、盲盒按钮表达不清楚。后续通过 IME composition 事件、本地筛选逻辑和盲盒按钮视觉重构解决。修复后搜索输入稳定，标签筛选不再加载失败，盲盒入口具备明确文案和点击反馈。

---

## 9. 【Code Review 阶段】测试结果与阶段质量检查

**对应范式**：Code Review：最终质量审查。

**核心 Prompt**：

```
请对当前项目做最终代码审查。

要求：
1. 不新增功能。
2. 检查是否满足交付要求：
   - 完整项目源码
   - 数据库初始化脚本
   - 至少 5 条高质量样例数据
   - PRD / ERD / API 文档 / SAD
   - 测试代码
   - README
   - 后台账号
   - Git Commit 演进历史
   - 核心 Prompt 记录文档
3. 检查命名是否一致：
   - Trip / Favorite / Tag / TripTag
   - 不混用 Bookmark / TravelInspiration
4. 检查是否有不该提交的文件：
   - .env
   - dev.db
   - node_modules
   - test-results
   - playwright-report
   - coverage
5. 运行：
   - npx tsc --noEmit
   - npx vitest run
   - npx playwright test
6. 输出最终问题清单和是否可以交付。
```

**当时意图**：Code Review 阶段用于在提交前做最后一次质量检查，重点不是新增功能，而是排查交付缺口、命名不一致、测试失败和不该提交的文件。

**遇到的挑战与修正**：开发过程中多次出现 `.claude/launch.json`、`tsconfig.tsbuildinfo`、`.env`、`dev.db` 等不应提交文件。后续通过精确 `git add` 和 `.gitignore` 规则控制提交范围，避免把本地缓存或敏感配置提交到仓库。

---

## 10. 【Delivery 阶段】最终交付文档与 Git 提交检查

**对应范式**：Delivery：交付文档与最终提交。

**核心 Prompt**：

```
请进入最终交付收尾阶段。

目标：
补齐比赛交付文档，不再新增业务功能。

要求：
1. 创建 docs/PROMPTS.md。
2. 校准 README.md。
3. 检查 docs/TEST_REPORT.md。
4. 不修改业务代码。
5. 不进入新功能阶段。

docs/PROMPTS.md 要求：
- 至少 5 段核心 Prompt。
- 必须标注 SDD / DDD / TDD / E2E / Debug / Code Review / Delivery。
- 每段包含：
  1. 阶段名称
  2. Prompt 原文或核心 Prompt
  3. 当时意图
  4. 遇到的问题
  5. 如何引导 AI 修正

README.md 要求：
- 项目简介
- 技术栈
- 本地运行步骤
- 数据库初始化
- 测试命令
- 默认账号
- 后台入口
- 项目结构
- 交付说明

最终验证：
- npx tsc --noEmit
- npx vitest run
- npx playwright test
- git status
```

**当时意图**：Delivery 阶段用于将开发过程、测试结果和运行方式整理成可被评委阅读和复现的交付材料。Prompt 记录文档用于证明项目不是一次性生成，而是经过 SDD、DDD、TDD、E2E、Debug、Code Review 的阶段化 AI 协作过程。

**遇到的挑战与修正**：比赛明确要求核心 Prompt 记录不少于 5 段，并且必须体现多范式阶段性。因此最终将项目启动、SDD、DDD、TDD、E2E、Debug、Code Review、Delivery 等关键阶段全部整理进 docs/PROMPTS.md，并附上每段意图、挑战和修正方式。

---

## 阶段流程总结

本项目实际开发过程按以下阶段推进：

```
项目启动规划
    ↓
SDD：PRD / ERD / 数据模型 / Prisma Schema / API 契约 / SAD
    ↓
DDD：UI/UX、页面结构、组件拆分、状态流转
    ↓
TDD：核心逻辑单元测试与业务验证
    ↓
E2E：Playwright 系统级端到端测试
    ↓
Debug：搜索、筛选、盲盒、后台入口等问题修复
    ↓
Code Review：测试结果、文件提交范围、交付项检查
    ↓
Delivery：README、TEST_REPORT、PROMPTS、Git 提交历史收尾
```

**最终验证结果**：

```
npx tsc --noEmit      → 通过
npx vitest run        → 25 tests passed
npx playwright test   → 13 tests passed
```

该流程体现了多范式融合的 AI 辅助开发方式，并通过文档、测试和 Git 提交记录保证项目可追溯、可复现、可验收。
