# 100种不可思议旅行

以"小众玩法"和"情绪体验"为核心的旅行灵感发现平台。

---

## 目录

1. [项目简介](#1-项目简介)
2. [核心功能](#2-核心功能)
3. [技术选型说明](#3-技术选型说明)
4. [项目结构](#4-项目结构)
5. [运行指南](#5-运行指南)
6. [环境变量](#6-环境变量)
7. [数据库初始化](#7-数据库初始化)
8. [默认测试账号](#8-默认测试账号)
9. [开发文档](#9-开发文档)
10. [MVP 边界](#10-mvp-边界)
11. [部署说明](#11-部署说明)
12. [黑客松交付说明](#12-黑客松交付说明)

---

## 1. 项目简介

《100种不可思议旅行》是一个旅行灵感发现平台。与传统 OTA（交易导向）和小红书（泛内容社区）不同，本产品通过**情绪标签 + 主题分类 + 小众等级**三维筛选体系，帮助 95 后-00 后年轻用户以"感觉"为入口发现小众旅行体验。

**产品口号**：找到一种属于你的感觉。

---

## 2. 核心功能

**用户端（共 11 项）：**

| 功能 | 说明 |
|------|------|
| 首页卡片流 | 按时间展示已审核通过的旅行灵感卡片 |
| 标签筛选 | 主题 × 情绪 × 小众等级 三维度多选 AND 叠加 |
| 关键词搜索 | 7 组自然语言到标签的轻量映射 + 文本匹配 |
| 灵感盲盒 | 动画开箱式随机推荐旅行灵感 |
| 详情页 | Hero → 故事 → 亮点 → 类似推荐 → 出行须知（折叠） |
| 注册登录 | 用户名 + 密码注册和登录 |
| 发帖投稿 | 结构化表单提交旅行灵感，提交后默认待审核 |
| 评论 | 详情页发表和查看评论 |
| 点赞 | 乐观更新点赞/取消点赞 |
| 收藏 | 收藏到个人收藏夹，在个人中心查看 |
| 个人中心 | 我的收藏 + 我的帖子 |

**管理端（共 4 项）：**

| 功能 | 说明 |
|------|------|
| 数据概览 | 帖子/用户/评论统计面板 |
| 帖子审核 | PENDING → APPROVED / REJECTED |
| 用户管理 | 修改用户角色 USER ↔ ADMIN |
| 评论管理 | 查看全站评论 + 删除违规评论 |

---

## 3. 技术选型说明

### Next.js 15（全栈框架）

选择 Next.js 15 作为全栈单体框架，因其 App Router 同时承载页面渲染和 API 路由，避免前后端分离带来的项目管理复杂度。React Server Components 让首页和详情页的服务端渲染（SSR）开箱即用，SEO 友好且首屏加载快。Route Handlers 替代传统 Express API，与项目结构统一。

### React 19（UI 框架）

Next.js 15 内置 React 19，使用 Server Components 处理数据查询和静态渲染，Client Components 处理交互（筛选、搜索、盲盒、点赞、收藏）。

### TypeScript（类型安全）

全链路类型安全：Prisma Schema 自动生成数据库类型 → Zod 校验 API 入参 → TypeScript 编译期发现错误。减少运行时 bug，提升开发效率。

### Tailwind CSS 4（样式方案）

原子化 CSS，与 Next.js 和 shadcn/ui 深度集成。暗色主题通过 Tailwind 的 class 策略实现，无需额外 CSS 文件。响应式设计适配 375px-1920px。

### shadcn/ui（组件库）

基于 Radix UI 的无头组件 + Tailwind 样式。按需复制源码到项目中，不引入额外依赖包袱。MVP 使用 Button、Input、Card、Dialog、Dropdown Menu 等基础组件。

### Auth.js v5（认证）

Credentials Provider 实现用户名+密码登录。JWT 策略无需数据库 Session 表。`auth()` 函数在 Server Component 和 Route Handler 中直接调用。`middleware.ts` 实现路由级别的认证守卫。

### Prisma（ORM）

类型安全的数据库访问层。Schema 文件作为数据库的单一事实来源，自动生成迁移脚本和 TypeScript 类型。`include` / `select` 语法简洁替代手写 JOIN。

### SQLite（数据库）

零配置本地数据库，一个文件即数据库。MVP 阶段数据量小、并发低，SQLite 完全满足需求。后续可平滑迁移至 Turso（SQLite 兼容云服务）或 PostgreSQL。

---

## 4. 项目结构

```
xiyouji/
├── docs/                          # 项目文档
│   ├── PRD.md                     #   产品需求文档
│   ├── ERD.md                     #   实体关系设计（Mermaid ER 图）
│   ├── API_CONTRACT.md            #   API 接口契约（33 个端点）
│   └── SAD.md                     #   软件架构设计文档
├── prisma/                        # 数据库层
│   ├── schema.prisma              #   数据模型（7 个模型，3 个枚举）
│   └── seed.ts                    #   种子数据脚本（幂等）
├── src/
│   ├── app/                       # Next.js App Router（页面 + API）
│   ├── components/                # UI 组件（ui / layout / forms）
│   ├── lib/                       # 服务层（Prisma / Auth / Zod / 搜索引擎）
│   └── middleware.ts              # 路由守卫
├── .env.local                     # 环境变量（不提交 Git）
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

| 目录 | 职责 |
|------|------|
| `docs/` | 产品需求、实体关系、API 契约、架构设计 |
| `prisma/` | 数据库 Schema + 迁移 + 种子脚本 |
| `src/app/` | 页面路由（`/page.tsx`）和 API 端点（`/api/*/route.ts`） |
| `src/components/` | 可复用 UI 组件，按 `ui/` / `layout/` / `forms/` 分组 |
| `src/lib/` | 纯逻辑服务：Prisma 客户端、Auth.js 配置、Zod Schema、搜索引擎 |

---

## 5. 运行指南

**前置要求**：Node.js ≥ 20, pnpm ≥ 9

```bash
# 1. 安装依赖
pnpm install

# 2. 创建数据库并执行迁移
npx prisma migrate dev --name init

# 3. 写入种子数据
npx prisma db seed

# 4. 启动开发服务器
pnpm dev
```

启动后访问：**http://localhost:3000**

---

## 6. 环境变量

创建 `.env.local` 文件：

```bash
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="replace-with-your-secret"
AUTH_URL="http://localhost:3000"
```

**生成 AUTH_SECRET**：

```bash
openssl rand -base64 32
```

---

## 7. 数据库初始化

- **`prisma/schema.prisma`**：数据模型定义。包含 User、Trip、Tag、TripTag、Comment、Like、Favorite 共 7 个模型和 3 个枚举（UserRole、TripStatus、TagType）。
- **`prisma/seed.ts`**：种子数据脚本，**幂等**（重复执行安全）。执行后会生成：
  - 3 个用户（1 admin + 2 user）
  - 19 个标签（5 主题 + 10 情绪 + 4 等级）
  - 10 条官方 Trip（覆盖全部 5 个内容方向，含 150-250 字真实叙事故事）
  - 2 条用户投稿（status=PENDING，用于测试审核流程）
  - 7 条评论 + 13 条点赞 + 9 条收藏

---

## 8. 默认测试账号

> **以下账号信息来自 `prisma/seed.ts`，密码统一为 `password123`。**

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | `admin` | `password123` | 可访问 `/admin` 后台 |
| 普通用户 | `lvxingzhe_xiaomi` | `password123` | 已发帖+已评论+已点赞+已收藏 |
| 普通用户 | `shanhai_lurker` | `password123` | 已投稿 pending + 已评论+已点赞+已收藏 |

**后台入口**：http://localhost:3000/admin

---

## 9. 开发文档

| 文档 | 路径 | 内容 |
|------|------|------|
| PRD | `docs/PRD.md` | 产品需求文档：背景、定位、用户画像、痛点、功能清单、用户流程 Mermaid 图、优先级、MVP 边界 |
| ERD | `docs/ERD.md` | 实体关系设计：7 个实体的 Mermaid ER 图 + 中文表说明 + 关系总结 + 设计原理 |
| API Contract | `docs/API_CONTRACT.md` | API 接口契约：33 个端点的 Method/URL/鉴权/参数/请求示例/响应示例/错误码 |
| SAD | `docs/SAD.md` | 软件架构设计：系统目标、整体架构 Mermaid 图、技术选型理由、数据流 Sequence Diagram、权限设计、安全设计、部署架构 |

---

## 10. MVP 边界

**包含（14 项）：**

- ✅ 首页旅行灵感卡片流
- ✅ 标签筛选（主题 × 情绪 × 小众等级）
- ✅ 关键词搜索 + 轻量关键词映射
- ✅ 灵感盲盒随机推荐
- ✅ 旅行详情页（Hero → 故事 → 亮点 → 类似推荐 → 出行须知折叠）
- ✅ 注册 + 登录 + 登出
- ✅ UGC 发帖投稿（默认待审核）
- ✅ 评论
- ✅ 点赞 / 取消点赞
- ✅ 收藏 / 取消收藏
- ✅ 个人中心
- ✅ 管理员帖子审核
- ✅ 管理员用户角色管理
- ✅ 管理员评论管理

**不包含：**

- ❌ 第三方 OAuth 登录（微信/Apple/Google）
- ❌ 本地图片上传
- ❌ 个性化推荐算法
- ❌ 用户间关注/粉丝
- ❌ 私信/即时通讯
- ❌ 消息通知系统
- ❌ 支付/电商/商业化
- ❌ PWA / 离线模式
- ❌ 多语言/国际化
- ❌ 地图模式
- ❌ 全文语义搜索

---

## 11. 部署说明

### 本地开发（完整功能）

```bash
pnpm dev
# → http://localhost:3000
# 完整读写 SQLite，所有 API 可用
```

### Vercel 部署（界面展示）

连接 GitHub 仓库 → Vercel 自动部署。

> **注意**：Vercel 的 Serverless 环境不保证 SQLite 文件系统持久化。注册、发帖、评论、点赞、收藏、审核等写入操作可能失败或数据丢失。Vercel 部署适用于界面展示和前端交互验证，**不作为正式生产环境**。

### 生产环境持久化方案

| 方案 | 说明 |
|------|------|
| **Turso** | SQLite 兼容云服务，Prisma 适配器 |
| **PostgreSQL** | 改 Prisma `datasource.provider`，迁移成本低 |
| **Docker** | Next.js standalone + SQLite Volume 挂载 |

---

## 12. 黑客松交付说明

本项目已包含以下交付物：

| 交付物 | 状态 |
|--------|------|
| 完整项目源码结构 | ✅ |
| 数据库 Schema（Prisma + SQLite） | ✅ |
| 数据库种子脚本（10 条高质量 Trip + 完整测试数据） | ✅ |
| PRD 产品需求文档 | ✅ |
| ERD 实体关系文档（Mermaid 图） | ✅ |
| API 接口契约文档（33 个端点） | ✅ |
| SAD 软件架构设计文档 | ✅ |
| README 运行说明 | ✅ |
| 后台管理测试账号 | ✅ |
| 幂等 seed 脚本（可重复执行） | ✅ |
