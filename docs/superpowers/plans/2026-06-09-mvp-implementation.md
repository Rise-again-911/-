# 「100种不可思议旅行」MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目从"文档 + 数据库初始化完成"推进到"可运行 MVP Web App"。

**Architecture:** Next.js 15 全栈单体应用。App Router 承载页面和 API，Prisma 访问 SQLite，Auth.js v5 做认证，Tailwind CSS + shadcn/ui 做样式，Zod 做输入校验。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Auth.js v5, Prisma 6, SQLite, Zod 3, bcryptjs

**当前状态:** prisma/schema.prisma 已定义 7 个模型 + 3 个枚举，seed.ts 已写入 12 条数据并通过 check-seed 验证。但 `src/` 目录完全为空——所有页面、API、组件、服务层、中间件均待开发。

**设计文档参考:** docs/PRD.md (产品需求), docs/ERD.md (数据模型), docs/API_CONTRACT.md (33 个端点), docs/SAD.md (架构和目录结构)

**UI 风格:** 全局暗色、沉浸、克制。参考 PRD 的品牌调性和 SAD 中 Tailwind CSS 4 暗色主题配置，不参考已删除的旧 demo HTML 文件。

---

## 实施阶段概览

| 阶段 | 范围 | 任务数 | 产出 |
|------|------|--------|------|
| 1. 基础设施 | Prisma 单例、常量、Zod、搜索引擎、布局、首页占位、Header 静态导航 | 8 | 可运行的 Next.js 空壳 |
| 2. 标签系统 | Tag API + TagChip + FilterCloud + EmptyState | 4 | 标签云可查询可展示 |
| 3. 内容浏览 | Trips 列表/详情 API + 盲盒 API + TripCard + SearchBar + 首页卡片流 | 7 | 首页卡片流 + 详情页可浏览 |
| 4. 详情页 | 详情页 + 出行须知折叠组件 | 2 | 完整详情体验 |
| 5. 认证系统 | Auth.js 配置 + 注册/登录 API + 页面 + middleware | 7 | 用户可注册登录，路由守卫生效 |
| 6. UGC 投稿与评论 | 发帖 API + 页面 + 评论 API + CommentSection + 评论删除 | 5 | 用户可发帖和评论 |
| 7. 社交互动 | 点赞 + 收藏 API + LikeButton/FavoriteButton + 集成详情页 | 4 | 点赞收藏功能完整 |
| 8. 个人中心 | Profile API + Profile 页面 + Header 导航升级 | 3 | 用户可查看个人数据 |
| 9. 后台管理 | 权限工具 + API（拆为 7 个小任务） + 4 个管理页面 | 12 | 管理员可审核和管理 |
| 10. 首页完整集成 | 搜索 + 筛选 + 盲盒 + Hero 组装 | 3 | 完整首页体验 |
| 11. E2E 验证 | Playwright 配置 + E2E 测试 + 最终修复 | 3 | 全流程绿通 |

---

### 阶段 1：基础设施（不依赖认证）

#### Task 1.1: 创建 Prisma 客户端单例

**文件:**
- Create: `src/lib/prisma.ts`

**实现内容:**
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**验证:** `npx tsx -e "import { prisma } from './src/lib/prisma'; prisma.$connect().then(() => console.log('OK'))"` 输出 OK

**推荐 commit:** `feat(infra): add Prisma client singleton`

---

#### Task 1.2: 创建常量文件

**文件:**
- Create: `src/lib/constants.ts`

**实现内容:** 导出 3 组标签枚举值数组、关键词映射表（完整 7 组）、默认 emoji 列表。

```typescript
export const THEME_VALUES = ["限时仪式感", "废墟美学", "反向小城", "暗夜星旅", "野性轻探"] as const;

export const MOOD_VALUES = ["孤独", "末日感", "荒凉", "狂野", "原始", "浪漫", "松弛", "震撼", "猎奇", "怀旧"] as const;

export const LEVEL_VALUES = ["只有当地人才知道", "圈内人才懂", "需要当地向导", "需要特殊技能"] as const;

export const KEYWORD_MAP = [
  { keywords: ["没人", "人少", "清静", "冷门", "小众"], mapToThemes: ["反向小城"], mapToMoods: ["孤独", "松弛", "怀旧"], mapToLevels: ["只有当地人才知道", "圈内人才懂"] },
  { keywords: ["拍照", "出片", "大片", "拍", "摄影"], mapToThemes: ["废墟美学", "暗夜星旅"], mapToMoods: ["震撼", "浪漫", "孤独"] },
  { keywords: ["放松", "发呆", "逃离", "治愈", "躺平", "摆烂"], mapToThemes: ["反向小城"], mapToMoods: ["松弛", "孤独", "浪漫"] },
  { keywords: ["星空", "银河", "夜晚", "星星", "观星", "暗夜"], mapToThemes: ["暗夜星旅"], mapToMoods: ["浪漫", "震撼", "孤独"] },
  { keywords: ["刺激", "冒险", "野", "探险", "极限"], mapToThemes: ["野性轻探"], mapToMoods: ["狂野", "荒凉", "猎奇"] },
  { keywords: ["废墟", "破旧", "末日", "废弃", "矿坑", "厂房"], mapToThemes: ["废墟美学"], mapToMoods: ["末日感", "怀旧", "孤独"] },
  { keywords: ["节日", "仪式", "传统", "少数民族", "部落", "祭祀"], mapToThemes: ["限时仪式感"], mapToMoods: ["狂野", "猎奇", "怀旧"] },
] as const;
```

**验证:** `npx tsx -e "import { KEYWORD_MAP } from './src/lib/constants'; console.log(KEYWORD_MAP.length)"` 输出 7

**推荐 commit:** `feat(infra): add tag constants and keyword mapping table`

---

#### Task 1.3: 创建 Zod 校验 Schema

**文件:**
- Create: `src/lib/validations.ts`

**实现内容:** 定义 5 个 Zod Schema：

```typescript
import { z } from "zod";
import { THEME_VALUES } from "./constants";

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const tripCreateSchema = z.object({
  title: z.string().min(1).max(60),
  summary: z.string().min(1).max(200),
  story: z.string().min(1).max(500),
  theme: z.enum(THEME_VALUES),
  tagIds: z.array(z.string()).min(1).max(6),
  location: z.string().min(1),
  bestTime: z.string().min(1),
  difficulty: z.string().min(1),
  budget: z.string().min(1),
  safety: z.string().min(1),
  highlights: z.array(z.string().min(1).max(100)).min(3).max(5),
  emoji: z.string().optional().default("📍"),
  imageUrl: z.string().optional().default(""),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const profileUpdateSchema = z.object({
  bio: z.string().max(200).optional(),
  avatar: z.string().optional(),
});
```

**验证:** `npx tsx -e "import { registerSchema } from './src/lib/validations'; console.log(registerSchema.safeParse({username:'a',password:'123456'}).success ? 'PASS' : 'FAIL')"` 输出 FAIL（用户名太短），正常。

**推荐 commit:** `feat(infra): add Zod validation schemas`

---

#### Task 1.4: 创建 Route Handler 公共工具

**文件:**
- Create: `src/lib/api-utils.ts`

**实现内容:**
```typescript
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess(data: unknown, message = "ok", status = 200) {
  return NextResponse.json({ data, message }, { status });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function handleZodError(error: ZodError) {
  return apiError("VALIDATION_ERROR", error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; "), 422);
}
```

**验证:** 无需独立验证，后续任务中引用

**推荐 commit:** `feat(infra): add API utility functions`

---

#### Task 1.5: 创建搜索引擎

**文件:**
- Create: `src/lib/search.ts`

**实现内容:**
- 导出 `mapKeyword(query: string)` 函数：遍历 KEYWORD_MAP，如果 query 命中某组关键词，返回映射后的标签名称集合
- 导出 `searchTrips(query: string, page: number, pageSize: number)` 函数：调用 mapKeyword，然后通过 Prisma 查询 TripTag → Tag 匹配 + 文本 LIKE 搜索 title/summary/location/highlights，仅返回 status=APPROVED，按相关性排序

**验证:** `npx tsx -e "import { mapKeyword } from './src/lib/search'; console.log(JSON.stringify(mapKeyword('没人')))"` 应输出包含 "反向小城"、"孤独" 等标签名

**推荐 commit:** `feat(infra): add search engine with keyword mapping`

---

#### Task 1.6: 创建根布局

**文件:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

**实现内容:**

`src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "100种不可思议旅行",
  description: "找到一种属于你的感觉",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">{children}</body>
    </html>
  );
}
```

`src/app/globals.css`:
```css
@import "tailwindcss";
```

**验证:** `npm run dev` → 访问 `http://localhost:3000`，页面空白但不报错

**推荐 commit:** `feat(infra): add root layout and Tailwind CSS setup`

---

#### Task 1.7: 创建首页基础占位页

**文件:**
- Create: `src/app/page.tsx`

**实现内容:** 最小 Server Component，显示标题文字作为占位。不包含 Hero、搜索框、盲盒、标签筛选——阶段 3 替换为卡片流，阶段 10 完整集成。

```typescript
export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold">100种不可思议旅行</h1>
      <p className="text-gray-400 mt-2">找到一种属于你的感觉</p>
    </main>
  );
}
```

**验证:** 访问 `http://localhost:3000`，显示标题文字

**推荐 commit:** `feat(home): add placeholder home page`

---

#### Task 1.8: 创建 Header 静态导航

**文件:**
- Create: `src/components/layout/Header.tsx`

**实现内容:** 静态链接导航条。不依赖 `useSession`（Auth.js 阶段 5 才创建）。左侧 Logo 链接 `/`，右侧固定链接：首页、发帖、登录、个人中心、后台。

```typescript
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-lg font-semibold text-white">100种不可思议旅行</Link>
      <nav className="flex gap-4 text-sm text-gray-400">
        <Link href="/" className="hover:text-white transition">首页</Link>
        <Link href="/create" className="hover:text-white transition">发帖</Link>
        <Link href="/login" className="hover:text-white transition">登录</Link>
        <Link href="/profile" className="hover:text-white transition">个人中心</Link>
        <Link href="/admin" className="hover:text-white transition">后台</Link>
      </nav>
    </header>
  );
}
```

**验证:** 访问 `http://localhost:3000`，顶部导航栏显示正常

**推荐 commit:** `feat(layout): add static Header navigation`

---

### 阶段 2：标签系统

#### Task 2.1: 创建 GET /api/tags Route Handler

**文件:**
- Create: `src/app/api/tags/route.ts`

**实现内容:** 查询所有 Tag，按 type 分组返回 `{ THEME: [...], MOOD: [...], LEVEL: [...] }`。支持可选 Query 参数 `?type=MOOD` 过滤。

**验证:** 启动 `npm run dev`，`curl http://localhost:3000/api/tags | jq '.data.THEME | length'` 输出 5

**推荐 commit:** `feat(tags): add GET /api/tags endpoint`

---

#### Task 2.2: 创建 TagChip 组件

**文件:**
- Create: `src/components/ui/TagChip.tsx`

**实现内容:** 一个 span 标签，根据 `type` prop（theme/mood/level）展示不同的颜色样式。props: `{ name: string; type: "THEME" | "MOOD" | "LEVEL"; active?: boolean; onClick?: () => void }`。主题标签蓝灰色调，情绪标签暖橙色调，等级标签绿色调。整体暗色风格。

**验证:** 在后续页面中渲染使用

**推荐 commit:** `feat(ui): add TagChip component`

---

#### Task 2.3: 创建 FilterCloud 组件

**文件:**
- Create: `src/components/ui/FilterCloud.tsx`

**实现内容:** 'use client' 组件。接收 `tags: { id: string; name: string; type: string }[]`、`activeTags: Set<string>`、`onToggle: (tagName: string) => void`。按 type 分组渲染三组标签云（主题/情绪/等级），选中标签高亮其对应颜色。同维度标签平铺，支持多选。暗色风格。

**验证:** 在阶段 10 首页集成中实际渲染

**推荐 commit:** `feat(ui): add FilterCloud component`

---

#### Task 2.4: 创建 EmptyState 组件

**文件:**
- Create: `src/components/ui/EmptyState.tsx`

**实现内容:** 'use client' 组件。接收 `{ icon?: string; message: string; suggestions?: string[]; onSuggestionClick?: (s: string) => void }`。渲染居中空状态提示 + 推荐关键词可点击。暗色风格。

**验证:** 在后续搜索空结果中使用

**推荐 commit:** `feat(ui): add EmptyState component`

---

### 阶段 3：内容浏览

#### Task 3.1: 创建 GET /api/trips Route Handler（列表）

**文件:**
- Create: `src/app/api/trips/route.ts`

**实现内容:**
- `GET`: 查询 `status=APPROVED` 的 Trip，支持 `?page=1&pageSize=20&theme=废墟美学&sortBy=createdAt`。include tags（via TripTag → Tag）和 author basic info。返回 `{ data, total, page, pageSize }` 格式。
- `POST`: 暂时返回 501（阶段 6 实现）

**验证:** `curl http://localhost:3000/api/trips | jq '.total'` 输出 10

**推荐 commit:** `feat(trips): add GET /api/trips list endpoint`

---

#### Task 3.2: 创建 GET /api/trips/[id] Route Handler（详情）

**文件:**
- Create: `src/app/api/trips/[id]/route.ts`

**实现内容:**
- `GET`: 查询单条 Trip by id，include tags + author。如果 status 非 APPROVED 且请求者不是作者 → 404。已登录用户额外查询 `isLiked` 和 `isFavorited` 布尔值（via auth() session）。
- `PATCH` 和 `DELETE` 暂返回 501。

**验证:** `curl http://localhost:3000/api/trips/<any-id>` 返回完整 JSON

**推荐 commit:** `feat(trips): add GET /api/trips/[id] detail endpoint`

---

#### Task 3.3: 创建 GET /api/blindbox Route Handler（灵感盲盒）

**文件:**
- Create: `src/app/api/blindbox/route.ts`

**实现内容:** 查询所有 `status=APPROVED` 的 Trip IDs，`Math.random()` 选一个，返回该 Trip 的 id/title/theme/emoji/tags。无数据返回 404。对应 API_CONTRACT 中的 `GET /api/blindbox`。

**验证:** `curl http://localhost:3000/api/blindbox` 两次，返回不同结果

**推荐 commit:** `feat(trips): add GET /api/blindbox endpoint`

---

#### Task 3.4: 创建 TripCard 组件

**文件:**
- Create: `src/components/ui/TripCard.tsx`

**实现内容:** 水平卡片布局（emoji 占位图 + 标题 + 主题 TagChip + 情绪 TagChip + 小众等级文字）。整个卡片是 `next/link` Link 到 `/trips/[id]`。暗色风格，PRD 定义的卡片信息：氛围占位图 + 玩法名称 + 主题标签 + 情绪标签 + 小众等级。

**验证:** 在阶段 3.6 首页中渲染使用

**推荐 commit:** `feat(ui): add TripCard component`

---

#### Task 3.5: 创建 SearchBar 组件

**文件:**
- Create: `src/components/ui/SearchBar.tsx`

**实现内容:** 'use client' 组件。一个带搜索图标的 input，输入时防抖 300ms，调用 `onSearch(query: string)`。支持受控 value prop 和 placeholder prop。暗色风格，圆角搜索框。

**验证:** 在阶段 10 首页中渲染使用

**推荐 commit:** `feat(ui): add SearchBar component`

---

#### Task 3.6: 更新首页为卡片流

**文件:**
- Modify: `src/app/page.tsx`

**实现内容:** Server Component 替换占位页。服务端通过 Prisma 直接查询 `status=APPROVED` 的 Trip（前 20 条，按 createdAt 降序），渲染 TripCard 列表。暂时不包含 Hero、搜索框、盲盒、标签筛选——阶段 10 完整集成。

**验证:** 访问 `http://localhost:3000`，看到 10 张卡片

**推荐 commit:** `feat(home): add trip card stream to home page`

---

#### Task 3.7: 创建 GET /api/trips/search Route Handler

**文件:**
- Create: `src/app/api/trips/search/route.ts`

**实现内容:** 调用 `src/lib/search.ts` 的 `searchTrips` 函数。接收 `?q=xxx&page=1&pageSize=20`。空结果返回 `{ data: [], suggestions: ["孤独","星空","废墟","没人","刺激","节日"] }`。

**验证:** `curl "http://localhost:3000/api/trips/search?q=没人" | jq '.total'` 输出 >=1

**推荐 commit:** `feat(search): add GET /api/trips/search endpoint`

---

### 阶段 4：详情页

#### Task 4.1: 创建详情页

**文件:**
- Create: `src/app/trips/[id]/page.tsx`

**实现内容:** Server Component。通过 params.id Prisma 查询 Trip 详情（include tags + author）。按 PRD 定义的层级渲染：
1. Hero 区（emoji 大图背景 + 主题标签 + 标题 + 情绪标签 + summary 钩子）
2. Story 区（"关于这份体验" + story 段落）
3. Highlights 列表（解析 JSON 数组）
4. 类似推荐（同 theme 的其他 Trip 横向卡片，2-3 个）
5. 出行须知折叠区域（使用 Task 4.2 的 TravelInfo 组件）

暗色、沉浸风格，出行须知默认折叠。

**验证:** 访问 `http://localhost:3000/trips/<any-id>`，看到完整详情页

**推荐 commit:** `feat(detail): add trip detail page`

---

#### Task 4.2: 创建出行须知折叠组件

**文件:**
- Create: `src/components/ui/TravelInfo.tsx`

**实现内容:** 'use client' 组件。接收 `{ location: string; bestTime: string; difficulty: string; budget: string; safety: string }`。默认折叠，点击展开/收起。包含 5 个信息行（大致区域、推荐时段/天气、难度与风险、大致花销、安全提示），每行带对应图标。暗色风格。

**验证:** 在详情页中渲染，点击展开出行须知

**推荐 commit:** `feat(ui): add TravelInfo collapsible component`

---

### 阶段 5：认证系统

#### Task 5.1: 创建 Auth.js 配置

**文件:**
- Create: `src/lib/auth.config.ts`
- Create: `src/lib/auth.ts`

**实现内容:**

`auth.config.ts`:
```typescript
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./validations";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { username, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;
        return { id: user.id, name: user.username, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};
```

`auth.ts`:
```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

**验证:** 编译通过，无报错

**推荐 commit:** `feat(auth): add Auth.js v5 configuration with Credentials provider`

---

#### Task 5.2: 创建 [...nextauth] Route Handler

**文件:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`

**实现内容:**
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

**验证:** `curl http://localhost:3000/api/auth/providers` 返回 `{}`（成功响应）

**推荐 commit:** `feat(auth): add [...nextauth] route handler`

---

#### Task 5.3: 创建 POST /api/auth/register Route Handler

**文件:**
- Create: `src/app/api/auth/register/route.ts`

**实现内容:** Zod 校验 request body → 检查 username 唯一性 → bcryptjs.hash(password, 10) → Prisma create User（role=USER）→ 返回 201 `{ data: { id, username, role }, message: "注册成功" }`

**验证:** `curl -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{"username":"test123","password":"123456"}'` → 201

**推荐 commit:** `feat(auth): add POST /api/auth/register endpoint`

---

#### Task 5.4: 创建 GET /api/auth/me Route Handler

**文件:**
- Create: `src/app/api/auth/me/route.ts`

**实现内容:** `auth()` 获取 session → 未登录返回 401 → Prisma 查询 User → 返回 `{ id, username, role, avatar, bio, createdAt }`

**验证:** 登录后 `curl http://localhost:3000/api/auth/me` 返回用户信息

**推荐 commit:** `feat(auth): add GET /api/auth/me endpoint`

---

#### Task 5.5: 创建登录页

**文件:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/forms/LoginForm.tsx`

**实现内容:**
- `LoginForm.tsx`: 'use client' 组件。username + password 输入框 + 提交按钮。调用 `signIn("credentials", { username, password, redirectTo: "/" })`。错误显示提示信息。暗色风格。
- `login/page.tsx`: 渲染 LoginForm + 指向 `/register` 的注册链接。

**验证:** 访问 `http://localhost:3000/login`，用 admin/password123 登录 → 跳转首页

**推荐 commit:** `feat(auth): add login page and form`

---

#### Task 5.6: 创建注册页

**文件:**
- Create: `src/app/register/page.tsx`
- Create: `src/components/forms/RegisterForm.tsx`

**实现内容:**
- `RegisterForm.tsx`: 'use client' 组件。username + password + confirmPassword 输入框。前端 Zod 校验 → fetch POST /api/auth/register → 成功自动 signIn → 跳转首页。
- `register/page.tsx`: 渲染 RegisterForm + 指向 `/login` 的链接。

**验证:** 访问 `http://localhost:3000/register`，注册新用户 → 自动跳转首页

**推荐 commit:** `feat(auth): add register page and form`

---

#### Task 5.7: 创建 middleware 路由守卫

**文件:**
- Create: `src/middleware.ts`

**实现内容:** Auth.js 完成后，创建 middleware 做路由守卫：
```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/create", "/profile", "/admin/:path*"],
};
```
未登录访问 `/create` `/profile` → 重定向 `/login`。非 admin 访问 `/admin/*` → 重定向 `/`。

**验证:** 未登录访问 `http://localhost:3000/create` → 重定向到 `/login`

**推荐 commit:** `feat(auth): add middleware for route protection`

---

### 阶段 6：UGC 投稿与评论

#### Task 6.1: 实现 POST /api/trips（创建帖子）

**文件:**
- Modify: `src/app/api/trips/route.ts` (补全 POST handler)

**实现内容:**
- `auth()` 检查登录 → Zod 校验 `tripCreateSchema` → Prisma 创建 Trip（status=PENDING, isOfficial=false, authorId=session.user.id）→ 创建 TripTag 关联 → 返回 201

**验证:** `curl -X POST http://localhost:3000/api/trips -H 'Content-Type: application/json' -d '{...}'` → 201

**推荐 commit:** `feat(ugc): add POST /api/trips for user submission`

---

#### Task 6.2: 创建发帖页

**文件:**
- Create: `src/app/create/page.tsx`
- Create: `src/components/forms/CreateTripForm.tsx`

**实现内容:**
- `CreateTripForm.tsx`: 'use client' 组件。结构化表单：title、summary、story(textarea)、theme(select 5 选 1)、情绪标签(multiselect from Tag 表查询 MOOD 类型)、小众等级(select 4 选 1 from Tag 表查询 LEVEL 类型)、3-5 个 highlights 输入（动态添加/删除）、location、bestTime、difficulty、budget、safety、emoji 选择器。所有字段有 Zod 前端校验。
- `create/page.tsx`: 渲染 CreateTripForm。需登录（middleware 守卫）。

**验证:** 登录后访问 `/create`，填写表单提交 → 提示"投稿成功，等待审核"

**推荐 commit:** `feat(ugc): add create trip page and form`

---

#### Task 6.3: 创建 GET + POST /api/trips/[id]/comments

**文件:**
- Create: `src/app/api/trips/[id]/comments/route.ts`

**实现内容:**
- `GET`: 查询 Comment by tripId，include user basic info（id, username, avatar），按 createdAt 升序，分页
- `POST`: auth() 检查登录 → Zod 校验 commentSchema → Prisma 创建 Comment → 返回 201

**验证:** `curl http://localhost:3000/api/trips/<id>/comments` 返回评论列表

**推荐 commit:** `feat(comments): add GET/POST /api/trips/[id]/comments`

---

#### Task 6.4: 创建 CommentSection 组件

**文件:**
- Create: `src/components/ui/CommentSection.tsx`

**实现内容:** 'use client' 组件。接收 `tripId: string` prop。展示评论列表（调用 GET 接口）+ 发表评论的 textarea + 提交按钮（调用 POST 接口）。未登录时 textarea disabled + 提示"请先登录"。暗色风格。

**验证:** 在阶段 6.5 详情页中集成测试

**推荐 commit:** `feat(ui): add CommentSection component`

---

#### Task 6.5: 将 CommentSection 集成到详情页 & DELETE /api/comments/[id]

**文件:**
- Modify: `src/app/trips/[id]/page.tsx` (集成 CommentSection)
- Create: `src/app/api/comments/[id]/route.ts`

**实现内容:**
- 在详情页底部添加 CommentSection 组件
- `DELETE /api/comments/[id]`: auth() 检查登录 → 查询 Comment 确认 authorId 或 role=ADMIN → Prisma 删除 Comment → 返回 200

**验证:** 访问详情页，评论区正常展示，登录后可发表评论；评论作者或 admin 可删除评论

**推荐 commit:** `feat(detail): integrate comments and add comment delete endpoint`

---

### 阶段 7：社交互动

#### Task 7.1: 创建 POST + DELETE /api/trips/[id]/like

**文件:**
- Create: `src/app/api/trips/[id]/like/route.ts`

**实现内容:**
- `POST`: auth() 检查登录 → Prisma `$transaction`：create Like + update Trip likeCount increment → 捕获 unique 冲突返回 409 → 返回 `{ liked: true, likeCount }`
- `DELETE`: auth() → Prisma `$transaction`：delete Like + update Trip likeCount decrement → Like 不存在返回 404 → 返回 `{ liked: false, likeCount }`

**验证:** 登录后 `curl -X POST http://localhost:3000/api/trips/<id>/like` → 200；再次请求 → 409

**推荐 commit:** `feat(social): add POST/DELETE /api/trips/[id]/like`

---

#### Task 7.2: 创建 POST + DELETE /api/trips/[id]/favorite

**文件:**
- Create: `src/app/api/trips/[id]/favorite/route.ts`

**实现内容:** 同 Like 逻辑，操作 Favorite 表和 favoriteCount 字段。

**验证:** 登录后 `curl -X POST http://localhost:3000/api/trips/<id>/favorite` → 200；再次 → 409

**推荐 commit:** `feat(social): add POST/DELETE /api/trips/[id]/favorite`

---

#### Task 7.3: 创建 LikeButton 和 FavoriteButton 组件

**文件:**
- Create: `src/components/ui/LikeButton.tsx`
- Create: `src/components/ui/FavoriteButton.tsx`

**实现内容:**
- `LikeButton.tsx`: 'use client' 组件。props: `{ tripId: string; initialLiked: boolean; initialCount: number }`。乐观更新 UI（点击即时 +1/-1，失败回滚）。未登录时点击跳转 `/login`。
- `FavoriteButton.tsx`: 同理，操作收藏。调用 `/api/trips/[id]/favorite`。

**验证:** 在阶段 7.4 详情页中集成测试

**推荐 commit:** `feat(ui): add LikeButton and FavoriteButton components`

---

#### Task 7.4: 将点赞收藏按钮集成到详情页

**文件:**
- Modify: `src/app/trips/[id]/page.tsx`

**实现内容:** 在详情页 Hero 区下方添加 LikeButton + FavoriteButton。传递初始 liked/favorited 状态和 count。

**验证:** 登录后访问详情页，点击点赞/收藏按钮，计数即时更新

**推荐 commit:** `feat(detail): integrate like and favorite buttons`

---

### 阶段 8：个人中心

#### Task 8.1: 创建个人中心 API

**文件:**
- Create: `src/app/api/profile/route.ts` (GET + PATCH)
- Create: `src/app/api/profile/trips/route.ts` (GET)
- Create: `src/app/api/profile/favorites/route.ts` (GET)

**实现内容:**
- `GET /api/profile`: 返回当前用户 info + tripCount
- `PATCH /api/profile`: Zod 校验 profileUpdateSchema → 更新 bio/avatar
- `GET /api/profile/trips`: 查询当前用户所有 Trip（含 PENDING/REJECTED），支持 `?status=PENDING` 过滤
- `GET /api/profile/favorites`: 查询当前用户收藏列表，include trip basic info

**验证:** 登录后 `curl http://localhost:3000/api/profile` 返回用户数据

**推荐 commit:** `feat(profile): add profile API endpoints`

---

#### Task 8.2: 创建个人中心页面

**文件:**
- Create: `src/app/profile/page.tsx`

**实现内容:** 'use client' 页面。两个 Tab："我的帖子"(调用 GET /api/profile/trips，按 status 分组展示) 和 "我的收藏"(调用 GET /api/profile/favorites)。每项渲染为简化版 TripCard（可点击跳转详情页）。

**验证:** 登录后访问 `/profile`，看到自己的帖子和收藏

**推荐 commit:** `feat(profile): add profile page with tabs`

---

#### Task 8.3: 升级 Header 为动态导航

**文件:**
- Modify: `src/components/layout/Header.tsx`

**实现内容:** 将阶段 1 的静态 Header 升级为 'use client' 组件，使用 `useSession` hook。已登录时显示用户名 + "发帖" + "个人中心" + "退出"按钮；未登录时显示"登录" + "注册"。退出调用 `signOut()`。

**验证:** 登录前后 Header 导航项正确切换

**推荐 commit:** `feat(layout): upgrade Header to dynamic auth-aware navigation`

---

### 阶段 9：后台管理

#### Task 9.1: 创建后台权限校验工具

**文件:**
- Create: `src/lib/admin.ts`

**实现内容:** 导出 `requireAdmin()` 辅助函数，供所有 admin Route Handler 复用：
```typescript
import { auth } from "./auth";
import { apiError } from "./api-utils";

export async function requireAdmin() {
  const session = await auth();
  if (!session) return { error: apiError("UNAUTHORIZED", "请先登录", 401) };
  if ((session.user as any).role !== "ADMIN") return { error: apiError("FORBIDDEN", "需要管理员权限", 403) };
  return { session };
}
```

**验证:** 编译通过

**推荐 commit:** `feat(admin): add requireAdmin utility`

---

#### Task 9.2: 创建 GET /api/admin/stats

**文件:**
- Create: `src/app/api/admin/stats/route.ts`

**实现内容:** `requireAdmin()` 检查 → Prisma 查询 trips 按 status 分组计数 + users total + admin count + comments total → 返回 stats 对象。

**验证:** admin 登录后 `curl http://localhost:3000/api/admin/stats` 返回统计数据

**推荐 commit:** `feat(admin): add GET /api/admin/stats endpoint`

---

#### Task 9.3: 创建 GET /api/admin/trips

**文件:**
- Create: `src/app/api/admin/trips/route.ts`

**实现内容:** `requireAdmin()` 检查 → 分页查询所有 Trip（不限 status），include author basic info，支持 `?status=PENDING&page=1&pageSize=20` 过滤。

**验证:** `curl http://localhost:3000/api/admin/trips?status=PENDING | jq '.total'` 输出 >=2

**推荐 commit:** `feat(admin): add GET /api/admin/trips endpoint`

---

#### Task 9.4: 创建审核接口 approve + reject

**文件:**
- Create: `src/app/api/admin/trips/[id]/approve/route.ts`
- Create: `src/app/api/admin/trips/[id]/reject/route.ts`

**实现内容:**
- `PATCH /api/admin/trips/[id]/approve`: `requireAdmin()` → Prisma update Trip status=APPROVED → 返回 `{ id, status: "APPROVED" }`
- `PATCH /api/admin/trips/[id]/reject`: `requireAdmin()` → Prisma update Trip status=REJECTED → 返回 `{ id, status: "REJECTED" }`

**验证:** admin 登录后 curl PATCH approve → 200；查询确认 status 已变更

**推荐 commit:** `feat(admin): add approve/reject endpoints`

---

#### Task 9.5: 创建 DELETE /api/admin/trips/[id]

**文件:**
- Create: `src/app/api/admin/trips/[id]/route.ts`

**实现内容:** `DELETE`: `requireAdmin()` → Prisma 查询 Trip 确认存在 → 删除 Trip（CASCADE 删除关联 TripTag/Comment/Like/Favorite）→ 返回 200

**验证:** admin 强制删除一条 trip → 关联数据也被清理

**推荐 commit:** `feat(admin): add DELETE /api/admin/trips/[id] endpoint`

---

#### Task 9.6: 创建用户列表与角色修改接口

**文件:**
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/[id]/role/route.ts`

**实现内容:**
- `GET /api/admin/users`: `requireAdmin()` → 分页查询 User，支持 `?role=USER` 过滤
- `PATCH /api/admin/users/[id]/role`: `requireAdmin()` → Zod 校验 role 为 USER/ADMIN → Prisma update role → 返回 updated user

**验证:** admin 修改用户角色 → 确认变更生效

**推荐 commit:** `feat(admin): add user list and role management endpoints`

---

#### Task 9.7: 创建评论列表与删除接口

**文件:**
- Create: `src/app/api/admin/comments/route.ts`
- Create: `src/app/api/admin/comments/[id]/route.ts`

**实现内容:**
- `GET /api/admin/comments`: `requireAdmin()` → 分页查询 Comment，include user + trip 信息
- `DELETE /api/admin/comments/[id]`: `requireAdmin()` → Prisma 删除 Comment → 返回 200

**验证:** admin 删除一条评论 → 确认已删除

**推荐 commit:** `feat(admin): add comment list and delete endpoints`

---

#### Task 9.8: 创建管理端布局 + AdminSidebar

**文件:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/layout/AdminSidebar.tsx`

**实现内容:**
- `admin/layout.tsx`: Server Component。`auth()` 获取 session → role !== 'ADMIN' → 显示 "Access Denied" 提示页（不静默重定向）。通过则渲染左侧 AdminSidebar + 右侧 `{children}`。
- `AdminSidebar.tsx`: 'use client' 组件。导航链接：数据概览 / 帖子审核 / 用户管理 / 评论管理。使用 `usePathname` 高亮当前页。

**验证:** admin 访问 `/admin` 正常显示；普通用户看到 Access Denied

**推荐 commit:** `feat(admin): add admin layout and sidebar`

---

#### Task 9.9: 创建数据概览页面

**文件:**
- Create: `src/app/admin/page.tsx`

**实现内容:** 'use client' 页面。fetch GET /api/admin/stats → 渲染 3 个统计卡片（帖子：total/approved/pending/rejected，用户：total/admin，评论：total）。

**验证:** admin 访问 `/admin`，看到统计数据

**推荐 commit:** `feat(admin): add dashboard page`

---

#### Task 9.10: 创建帖子审核页面

**文件:**
- Create: `src/app/admin/posts/page.tsx`

**实现内容:** 'use client' 页面。列表展示所有帖子（默认筛选 PENDING）。每行显示标题/作者/时间/状态 + 通过/拒绝按钮。操作后即时更新 UI 状态。

**验证:** admin 在 `/admin/posts` 审核一条 pending 帖子 → 状态变化，首页可见

**推荐 commit:** `feat(admin): add post review page`

---

#### Task 9.11: 创建用户管理页面

**文件:**
- Create: `src/app/admin/users/page.tsx`

**实现内容:** 'use client' 页面。分页列表，每行显示用户名/角色/注册时间 + "提升为 ADMIN"/"降级为 USER" 按钮。调用 PATCH /api/admin/users/[id]/role。

**验证:** admin 修改用户角色，页面即时更新

**推荐 commit:** `feat(admin): add user management page`

---

#### Task 9.12: 创建评论管理页面

**文件:**
- Create: `src/app/admin/comments/page.tsx`

**实现内容:** 'use client' 页面。分页列表，每行显示内容片段/评论者/所属帖子标题/时间 + 删除按钮。调用 DELETE /api/admin/comments/[id]。

**验证:** admin 删除一条评论，页面即时更新

**推荐 commit:** `feat(admin): add comment management page`

---

### 阶段 10：首页完整集成

#### Task 10.1: 集成搜索到首页

**文件:**
- Modify: `src/app/page.tsx`

**实现内容:** 将首页升级为 'use client' 交互页面（或 Client Component wrapper）。在卡片流上方添加 SearchBar。输入关键词后调用 `/api/trips/search?q=xxx` 更新卡片列表。显示"找到 X 个与「xxx」相关的结果"标题栏。空结果展示 EmptyState + 推荐关键词。"清除搜索"按钮恢复全部卡片。

**验证:** 首页搜索"没人"，卡片过滤并显示结果计数

**推荐 commit:** `feat(home): integrate search bar with result display`

---

#### Task 10.2: 集成标签筛选到首页

**文件:**
- Modify: `src/app/page.tsx`

**实现内容:** 添加 FilterCloud 组件。页面加载时 fetch GET /api/tags 获取标签。用户选择标签后调用 `/api/trips/filter` 更新卡片流。已选标签栏：显示已选标签 chip + × 移除 + "清除全部"。搜索关键词和标签筛选同时存在时 AND 叠加。

**验证:** 首页选择"废墟美学"+ "孤独"，卡片过滤到匹配结果；清除筛选恢复全部

**推荐 commit:** `feat(home): integrate tag filter with active filter bar`

---

#### Task 10.3: 集成盲盒和 Hero 到首页

**文件:**
- Modify: `src/app/page.tsx`
- Create: `src/components/ui/BlindBox.tsx`

**实现内容:**
- Hero 区：品牌标语"找到一种属于你的感觉" + 副文案"不是找景点，是找一种还没被发现的体验"
- `BlindBox.tsx`: 'use client' 组件。点击触发开箱动画（CSS animation: shake → flash → pop-in），调用 `GET /api/blindbox`，动画结束后跳转 `/trips/[id]`。使用方案 A 动画开箱式：点击盒子/按钮 → 抖动 → 闪光 → 揭开卡片。

**验证:** 首页完整：Hero → 搜索框 → 盲盒 → 标签筛选 → 已选标签栏 → 卡片流。盲盒点击后跳转随机详情页。

**推荐 commit:** `feat(home): integrate blind box and hero section`

---

### 阶段 11：E2E 验证

#### Task 11.1: 创建 Playwright 配置

**文件:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/` 目录

**实现内容:**
```typescript
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
  use: { baseURL: "http://localhost:3000" },
});
```

**验证:** `npx playwright install` → 配置就绪

**推荐 commit:** `test(e2e): add Playwright configuration`

---

#### Task 11.2: 编写核心 E2E 测试

**文件:**
- Create: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/admin.spec.ts`

**实现内容:**
- `home.spec.ts`: 访问首页 → 验证至少 10 张卡片 → 搜索"没人" → 验证过滤结果 → 点击标签 → 验证过滤 → 点击盲盒 → 验证跳转详情页
- `auth.spec.ts`: 访问 /login → 用 admin/password123 登录 → 验证跳转首页 → 访问 /create → 验证发帖表单存在
- `admin.spec.ts`: admin 登录后访问 /admin → 验证统计 → /admin/posts → 审核一条 pending 帖子 → 验证 status 变化

**验证:** `npx playwright test` 全部通过

**推荐 commit:** `test(e2e): add core E2E tests`

---

#### Task 11.3: 最终验证与修复

**内容:**
- 运行 `npx tsx scripts/check-seed.ts` 确认数据库完整性
- 运行 `npx playwright test` 确认 E2E 全绿
- 修复测试中发现的问题
- 最终 `git status` 确认无遗漏文件

**推荐 commit:** `chore: final verification and fixes`

---

## 计划自审

### 任务粒度
- ✅ 没有一次性实现所有页面——首页分阶段迭代（占位 → 卡片流 → 完整集成）
- ✅ 没有一次性实现所有 API——每个端点独立 task
- ✅ 后台 API 已拆为 7 个独立可提交的小任务（requireAdmin → stats → trips list → approve/reject → delete → users → comments）

### 技术边界
- ✅ 没有引入额外技术栈（仅使用 SAD 定义的 Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / shadcn/ui / Auth.js v5 / Prisma 6 / SQLite / Zod 3 / bcryptjs）
- ✅ 不包含 Supabase / MongoDB / Zustand / Mapbox / OAuth / GSAP / Howler.js / PWA
- ✅ 没有把图片上传作为 MVP——仅保留 emoji 和 imageUrl 字符串字段

### 架构依赖
- ✅ middleware 已后移至阶段 5（Auth.js 配置完成后），不再引用尚未创建的 `src/lib/auth.ts`
- ✅ 阶段 1 基础设施不再包含任何需要 Auth.js 的模块

### 接口一致性
- ✅ 盲盒接口已统一为 `GET /api/blindbox`（对应 API_CONTRACT），使用 `src/app/api/blindbox/route.ts`
- ✅ 不再使用 `GET /api/trips/random` 路径

### 文档引用
- ✅ 已删除所有对旧 demo HTML 文件（app-demo.html / tag-demo.html / detail-demo.html / blindbox-demo.html）的引用
- ✅ UI 风格统一为"参考 PRD 品牌调性 + SAD Tailwind CSS 4 暗色主题"

### 测试完整性
- ✅ 保留种子数据验证脚本 `scripts/check-seed.ts`
- ✅ 保留 Playwright E2E 测试阶段（含 webServer 配置自动启动本地开发服务器）
- ✅ 没有跳过测试

### Spec 覆盖
- ✅ PRD 功能清单 F1-F13 全部覆盖
- ✅ API_CONTRACT 33 个端点均有对应 task
- ✅ SAD 目录结构 src/ 下所有目录均在 plan 中创建
- ✅ MVP 边界未突破
