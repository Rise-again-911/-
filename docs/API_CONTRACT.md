# API 接口契约文档 (API Contract)

**版本**：v1.0 — MVP  
**日期**：2026-06-09  
**来源**：docs/PRD.md · docs/ERD.md · prisma/schema.prisma

---

## 目录

1. [通用规范](#1-通用规范)
2. [认证模块](#2-认证模块)
3. [旅行灵感模块](#3-旅行灵感模块)
4. [标签与筛选模块](#4-标签与筛选模块)
5. [评论模块](#5-评论模块)
6. [点赞模块](#6-点赞模块)
7. [收藏模块](#7-收藏模块)
8. [个人中心模块](#8-个人中心模块)
9. [后台管理模块](#9-后台管理模块)
10. [错误码参考](#10-错误码参考)

---

## 1. 通用规范

### 1.1 基础约定

| 项 | 约定 |
|----|------|
| Base URL | `http://localhost:3000` |
| 路径前缀 | `/api/*` |
| 请求格式 | `application/json` |
| 响应格式 | `application/json` |
| 字符编码 | UTF-8 |
| 日期格式 | ISO 8601 (`2026-06-09T12:00:00.000Z`) |
| 命名风格 | camelCase |
| 收藏命名 | `favorite` / `favoriteCount`（不使用 bookmark） |
| 角色枚举 | `USER` / `ADMIN` |
| 状态枚举 | `PENDING` / `APPROVED` / `REJECTED` |

### 1.2 通用响应格式

**成功响应**：

```json
{
  "data": { ... },
  "message": "ok"
}
```

**列表响应**：

```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

**错误响应**：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误描述"
  }
}
```

### 1.3 分页参数规范

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码，从 1 开始 |
| `pageSize` | number | 20 | 每页条数，最大 100 |

适用分页的接口以 `{ page, pageSize }` 作为 Query 参数，响应体包含 `{ total, page, pageSize }`。

### 1.4 鉴权说明

- 认证方式：**Auth.js v5 Credentials Provider**，基于 JWT 的 HTTP-only Cookie
- 客户端登录使用 `signIn("credentials", { username, password })`
- 客户端退出使用 `signOut()`
- 服务端通过 `auth()` 获取当前 session
- 需登录的接口：请求必须携带有效 session cookie
- 需 ADMIN 权限的接口：额外检查 `session.user.role === "ADMIN"`

### 1.5 权限边界

| 操作 | 未登录 | USER | ADMIN |
|------|--------|------|-------|
| 浏览/搜索/筛选/盲盒 | ✅ | ✅ | ✅ |
| 查看详情/评论 | ✅ | ✅ | ✅ |
| 注册 | ✅ | — | — |
| 登录 | ✅ | — | — |
| 发帖 | ❌ | ✅ | ✅ |
| 编辑自己的帖子 | ❌ | ✅ | ✅ |
| 删除自己的帖子 | ❌ | ✅ | ✅ |
| 评论 | ❌ | ✅ | ✅ |
| 点赞/收藏 | ❌ | ✅ | ✅ |
| 修改个人资料 | ❌ | ✅ | ✅ |
| 审核帖子 | ❌ | ❌ | ✅ |
| 管理用户角色 | ❌ | ❌ | ✅ |
| 删除他人评论 | ❌ | ❌ | ✅ |
| 删除他人帖子 | ❌ | ❌ | ✅ |

### 1.6 API 命名约定

| 约定 | 示例 |
|------|------|
| 资源路径用复数名词 | `/api/trips`, `/api/tags` |
| 子资源嵌套 | `/api/trips/:id/comments` |
| 动作用 HTTP Method 表达 | POST 创建, PATCH 修改, DELETE 删除 |
| 仅 RPC 风格动作用动词路径 | `/api/blindbox`, `/api/trips/search` |
| 路径参数用 kebab-case | `:tripId`, `:commentId` |
| 查询参数用 camelCase | `?pageSize=20&sortBy=createdAt` |

---

## 2. 认证模块

### 2.1 POST /api/auth/register

**用途**：注册新用户。注册成功后自动登录（设置 session cookie）。

**是否需要登录**：否  
**权限要求**：无

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 3-30 字符，仅字母数字下划线 |
| `password` | string | 是 | 6-100 字符 |

**请求示例**：

```json
{
  "username": "lvxingzhe",
  "password": "mypassword123"
}
```

**成功响应** `201 Created`：

```json
{
  "data": {
    "id": "cmx123abc...",
    "username": "lvxingzhe",
    "role": "USER",
    "createdAt": "2026-06-09T12:00:00.000Z"
  },
  "message": "注册成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 400 | `USERNAME_TAKEN` | 用户名已被注册 |
| 422 | `VALIDATION_ERROR` | 用户名或密码格式不合法 |

---

### 2.2 POST /api/auth/login

**用途**：用户登录。成功后在响应 Set-Cookie 中设置 session token。

**是否需要登录**：否  
**权限要求**：无

> **注意**：此端点由 Auth.js `[...nextauth]` 路由处理。客户端使用 `signIn("credentials", {...})` 方法。此处描述等效 HTTP 行为。

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `password` | string | 是 | 密码 |

**请求示例**：

```json
{
  "username": "lvxingzhe",
  "password": "mypassword123"
}
```

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx123abc...",
    "username": "lvxingzhe",
    "role": "USER"
  },
  "message": "登录成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `INVALID_CREDENTIALS` | 用户名或密码错误 |

---

### 2.3 POST /api/auth/logout

**用途**：退出登录，清除 session cookie。

**是否需要登录**：是  
**权限要求**：无

> **注意**：客户端使用 `signOut()` 方法。此处描述等效 HTTP 行为。

**成功响应** `200 OK`：

```json
{
  "message": "已退出登录"
}
```

---

### 2.4 GET /api/auth/me

**用途**：获取当前登录用户的个人信息。

**是否需要登录**：是  
**权限要求**：无

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx123abc...",
    "username": "lvxingzhe",
    "role": "USER",
    "avatar": "",
    "bio": "热爱探索世界的旅行者",
    "createdAt": "2026-06-09T12:00:00.000Z"
  },
  "message": "ok"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |

---

## 3. 旅行灵感模块

### 3.1 GET /api/trips

**用途**：分页获取旅行灵感列表。仅返回状态为 APPROVED 的内容。

**是否需要登录**：否  
**权限要求**：无

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页条数，默认 20，最大 100 |
| `theme` | string | 否 | 按主题筛选 |
| `sortBy` | string | 否 | 排序字段，默认 `createdAt`，可选 `likeCount` / `favoriteCount` |

**请求示例**：

```
GET /api/trips?page=1&pageSize=20&theme=废墟美学&sortBy=createdAt
```

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx456def...",
      "title": "在搁浅巨轮下拍末日大片",
      "summary": "台风留在海岸的钢铁巨兽，是最孤独的取景框。",
      "theme": "废墟美学",
      "emoji": "🚢",
      "imageUrl": "",
      "likeCount": 23,
      "favoriteCount": 8,
      "isOfficial": true,
      "tags": [
        { "id": "cmx_tag_1", "name": "孤独", "type": "MOOD" },
        { "id": "cmx_tag_2", "name": "末日感", "type": "MOOD" },
        { "id": "cmx_tag_3", "name": "圈内人才懂", "type": "LEVEL" }
      ],
      "author": {
        "id": "cmx_author_1",
        "username": "official"
      },
      "createdAt": "2026-06-09T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 3.2 GET /api/trips/:id

**用途**：获取单条旅行灵感的完整详情。

**是否需要登录**：否（但已登录用户会额外返回 `isLiked` / `isFavorited` 字段）  
**权限要求**：无

> **注意**：如果 Trip 状态为 PENDING / REJECTED 且请求者不是作者本人，返回 404。

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx456def...",
    "title": "在搁浅巨轮下拍末日大片",
    "summary": "台风留在海岸的钢铁巨兽，是最孤独的取景框。",
    "story": "这艘巴拿马籍货轮搁浅在荣成海岸已经两年。锈迹爬满船身...清晨起雾时走到沙滩尽头，巨轮从白雾中缓缓浮现——整个海岸线只有你和它。",
    "theme": "废墟美学",
    "location": "山东荣成沿海区域",
    "bestTime": "清晨或黄昏 · 阴天晨雾氛围最强",
    "difficulty": "免费开放，自驾可至，步行约5分钟。注意潮汐——涨潮时船体周围会被淹没。沙滩湿滑，冬季海风强劲。",
    "budget": "无门票 · 渔村民宿约120-180元/晚",
    "safety": "出发前查潮汐表，退潮时段前往。勿攀爬船体，锈蚀结构不稳定。冬季海风可达6-7级。建议结伴。",
    "highlights": [
      "日出时船体呈金色，逆光拍出末日感大片",
      "退潮时可走到船底，近距离触摸锈蚀船身",
      "非节假日几乎无人，独享整片海岸线",
      "适合：摄影爱好者、废墟美学沉迷者、想独自待着的人"
    ],
    "emoji": "🚢",
    "imageUrl": "",
    "isOfficial": true,
    "status": "APPROVED",
    "likeCount": 23,
    "favoriteCount": 8,
    "isLiked": false,
    "isFavorited": true,
    "tags": [
      { "id": "cmx_tag_1", "name": "孤独", "type": "MOOD" },
      { "id": "cmx_tag_2", "name": "末日感", "type": "MOOD" },
      { "id": "cmx_tag_3", "name": "圈内人才懂", "type": "LEVEL" }
    ],
    "author": {
      "id": "cmx_author_1",
      "username": "official"
    },
    "createdAt": "2026-06-09T10:00:00.000Z",
    "updatedAt": "2026-06-09T10:00:00.000Z"
  },
  "message": "ok"
}
```

> `isLiked` 和 `isFavorited` 仅在用户已登录时有实际值；未登录时始终为 `false`。

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 404 | `NOT_FOUND` | Trip 不存在或不可见 |

---

### 3.3 POST /api/trips

**用途**：创建一条新的旅行灵感（用户投稿）。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 1-60 字符 |
| `summary` | string | 是 | 1-200 字符 |
| `story` | string | 是 | 1-500 字符 |
| `theme` | string | 是 | 限时仪式感 / 废墟美学 / 反向小城 / 暗夜星旅 / 野性轻探 |
| `tagIds` | string[] | 是 | 情绪标签 + 小众等级标签的 Tag ID 列表（1-6 个） |
| `location` | string | 是 | 大致区域描述 |
| `bestTime` | string | 是 | 推荐时段/天气 |
| `difficulty` | string | 是 | 难度与风险 |
| `budget` | string | 是 | 大致花销 |
| `safety` | string | 是 | 安全提示 |
| `highlights` | string[] | 是 | 3-5 条亮点，每条 1-100 字符 |
| `emoji` | string | 否 | 默认 📍 |
| `imageUrl` | string | 否 | 默认空 |

**请求示例**：

```json
{
  "title": "我在火山脚下等银河升起",
  "summary": "一座沉睡的火山，一片无人打扰的星空。",
  "story": "车开到土路尽头，剩下的三公里只能徒步。火山口就在前方，像大地的呼吸孔...",
  "theme": "暗夜星旅",
  "tagIds": ["cmx_tag_1", "cmx_tag_4", "cmx_tag_3"],
  "location": "内蒙古乌兰察布 · 乌兰哈达火山群",
  "bestTime": "每年6-9月，避开满月期",
  "difficulty": "需自驾，最后3公里需徒步。海拔约1500m，无高反风险。",
  "budget": "无门票 · 自带帐篷露营免费 · 乌兰察布市区住宿约150元/晚",
  "safety": "火山口边缘注意脚下，夜间气温低注意保暖。建议结伴。",
  "highlights": [
    "在休眠火山口旁露营",
    "银河从火山锥后升起",
    "几乎无人，独享整片草原星空"
  ],
  "emoji": "🌋"
}
```

**成功响应** `201 Created`：

```json
{
  "data": {
    "id": "cmx789ghi...",
    "title": "我在火山脚下等银河升起",
    "status": "PENDING"
  },
  "message": "投稿成功，等待审核"
}
```

> 新创建的 Trip 默认 `status: PENDING`, `isOfficial: false`。

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 422 | `VALIDATION_ERROR` | 字段校验失败 |

---

### 3.4 PATCH /api/trips/:id

**用途**：编辑自己的旅行帖子。仅作者本人可编辑。仅可编辑状态为 PENDING 或 APPROVED 的帖子。

**是否需要登录**：是  
**权限要求**：帖子作者（或 ADMIN）

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**请求参数**：同 POST /api/trips，所有字段可选（仅更新传入的字段）。

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx789ghi...",
    "title": "我在火山脚下等银河升起（修订版）",
    "updatedAt": "2026-06-09T14:00:00.000Z"
  },
  "message": "更新成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 403 | `FORBIDDEN` | 非作者本人 |
| 404 | `NOT_FOUND` | Trip 不存在 |

---

### 3.5 DELETE /api/trips/:id

**用途**：删除自己的旅行帖子。仅作者本人可删除。ADMIN 可删除任何帖子。删除后级联删除关联的 TripTag、Comment、Like、Favorite。

**是否需要登录**：是  
**权限要求**：帖子作者（或 ADMIN）

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "message": "删除成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 403 | `FORBIDDEN` | 非作者本人且非 ADMIN |
| 404 | `NOT_FOUND` | Trip 不存在 |

---

## 4. 标签与筛选模块

### 4.1 GET /api/tags

**用途**：获取全部标签列表，按类型分组。

**是否需要登录**：否  
**权限要求**：无

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 否 | 按类型筛选，可选 `THEME` / `MOOD` / `LEVEL`。不传返回全部 |

**请求示例**：

```
GET /api/tags?type=MOOD
```

**成功响应** `200 OK`：

```json
{
  "data": {
    "THEME": [
      { "id": "cmx_tag_t1", "name": "限时仪式感" },
      { "id": "cmx_tag_t2", "name": "废墟美学" },
      { "id": "cmx_tag_t3", "name": "反向小城" },
      { "id": "cmx_tag_t4", "name": "暗夜星旅" },
      { "id": "cmx_tag_t5", "name": "野性轻探" }
    ],
    "MOOD": [
      { "id": "cmx_tag_m1", "name": "孤独" },
      { "id": "cmx_tag_m2", "name": "末日感" },
      { "id": "cmx_tag_m3", "name": "荒凉" },
      { "id": "cmx_tag_m4", "name": "狂野" },
      { "id": "cmx_tag_m5", "name": "原始" },
      { "id": "cmx_tag_m6", "name": "浪漫" },
      { "id": "cmx_tag_m7", "name": "松弛" },
      { "id": "cmx_tag_m8", "name": "震撼" },
      { "id": "cmx_tag_m9", "name": "猎奇" },
      { "id": "cmx_tag_m10", "name": "怀旧" }
    ],
    "LEVEL": [
      { "id": "cmx_tag_l1", "name": "只有当地人才知道" },
      { "id": "cmx_tag_l2", "name": "圈内人才懂" },
      { "id": "cmx_tag_l3", "name": "需要当地向导" },
      { "id": "cmx_tag_l4", "name": "需要特殊技能" }
    ]
  },
  "message": "ok"
}
```

---

### 4.2 GET /api/trips/filter

**用途**：按标签多维筛选旅行灵感。同类型标签 OR 逻辑，跨类型标签 AND 逻辑。

**是否需要登录**：否  
**权限要求**：无

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `theme` | string | 否 | 主题标签名称（单个） |
| `moods` | string | 否 | 情绪标签名称，逗号分隔。如 `moods=孤独,末日感` |
| `levels` | string | 否 | 等级标签名称，逗号分隔。如 `levels=圈内人才懂` |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**筛选逻辑**：
- `theme`（单个）：精确匹配
- `moods`（多个）：Trip 拥有任一指定情绪标签即匹配（OR）
- `levels`（多个）：Trip 拥有任一指定等级标签即匹配（OR）
- theme AND moods AND levels → 三个维度同时满足（AND）
- 仅返回 `status=APPROVED` 的内容

**请求示例**：

```
GET /api/trips/filter?theme=废墟美学&moods=孤独,末日感&levels=圈内人才懂&page=1&pageSize=20
```

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx456def...",
      "title": "在搁浅巨轮下拍末日大片",
      "summary": "台风留在海岸的钢铁巨兽，是最孤独的取景框。",
      "theme": "废墟美学",
      "emoji": "🚢",
      "likeCount": 23,
      "favoriteCount": 8,
      "tags": [
        { "id": "cmx_tag_m1", "name": "孤独", "type": "MOOD" },
        { "id": "cmx_tag_m2", "name": "末日感", "type": "MOOD" },
        { "id": "cmx_tag_l2", "name": "圈内人才懂", "type": "LEVEL" }
      ],
      "author": {
        "id": "cmx_author_1",
        "username": "official"
      },
      "createdAt": "2026-06-09T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 4.3 GET /api/trips/search

**用途**：关键词搜索旅行灵感。先触发关键词映射，再进行文本匹配。

**是否需要登录**：否  
**权限要求**：无

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 搜索关键词 |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**搜索逻辑**：

1. 将 `q` 与关键词映射表匹配，若命中则将映射标签加入筛选条件
2. 文本匹配：搜索 title、summary、location、highlights（JSON 字符串 LIKE 匹配）
3. 标签匹配：搜索 TripTag 关联的 Tag.name
4. 仅返回 `status=APPROVED` 的内容
5. 按相关性（标签命中 > 文本命中）+ 时间降序排列

**关键词映射表**：

| 用户输入 | 映射标签 |
|---------|---------|
| 没人 / 人少 / 清静 / 冷门 / 小众 | 主题:反向小城 + 情绪:孤独,松弛,怀旧 + 等级:只有当地人才知道,圈内人才懂 |
| 拍照 / 出片 / 大片 / 摄影 | 主题:废墟美学,暗夜星旅 + 情绪:震撼,浪漫,孤独 |
| 放松 / 发呆 / 逃离 / 治愈 | 情绪:松弛,孤独,浪漫 + 主题:反向小城 |
| 星空 / 银河 / 夜晚 / 观星 | 主题:暗夜星旅 + 情绪:浪漫,震撼,孤独 |
| 刺激 / 冒险 / 野 / 探险 | 情绪:狂野,荒凉,猎奇 + 主题:野性轻探 |
| 废墟 / 破旧 / 末日 / 废弃 | 主题:废墟美学 + 情绪:末日感,怀旧,孤独 |
| 节日 / 仪式 / 传统 / 少数民族 | 主题:限时仪式感 + 情绪:狂野,猎奇,怀旧 |

**请求示例**：

```
GET /api/trips/search?q=没人&page=1&pageSize=20
```

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx_search_001",
      "title": "中国西极最后一缕落日——乌恰县",
      "summary": "在祖国最西端看中国最后一缕阳光消失于帕米尔高原。",
      "theme": "反向小城",
      "emoji": "⛰️",
      "likeCount": 15,
      "favoriteCount": 6,
      "tags": [
        { "id": "cmx_tag_m1", "name": "孤独", "type": "MOOD" },
        { "id": "cmx_tag_m7", "name": "松弛", "type": "MOOD" },
        { "id": "cmx_tag_l1", "name": "只有当地人才知道", "type": "LEVEL" }
      ],
      "author": { "id": "cmx_author_1", "username": "official" },
      "matchedTerms": ["#孤独", "#松弛", "#反向小城"],
      "createdAt": "2026-06-09T10:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

> `matchedTerms`：标注哪些标签是通过关键词映射匹配到的。

**空结果响应** `200 OK`：

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "suggestions": ["孤独", "星空", "废墟", "没人", "刺激", "节日"],
  "message": "没有找到相关内容，试试以下关键词"
}
```

---

### 4.4 GET /api/blindbox

**用途**：随机获取一个旅行灵感（灵感盲盒）。

**是否需要登录**：否  
**权限要求**：无

**逻辑**：服务端从所有 `status=APPROVED` 的 Trip 中随机选取一个。

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx_random_001",
    "title": "在雅丹火星地貌看银河——冷湖",
    "theme": "暗夜星旅",
    "emoji": "🪐",
    "tags": [
      { "id": "cmx_tag_m8", "name": "震撼", "type": "MOOD" },
      { "id": "cmx_tag_m3", "name": "荒凉", "type": "MOOD" },
      { "id": "cmx_tag_l4", "name": "需要特殊技能", "type": "LEVEL" }
    ]
  },
  "message": "ok"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 404 | `NOT_FOUND` | 无可用 Trip（数据库为空） |

---

## 5. 评论模块

### 5.1 GET /api/trips/:id/comments

**用途**：获取某条 Trip 的评论列表。

**是否需要登录**：否  
**权限要求**：无

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx_cmt_001",
      "content": "上周刚去了，真的一个人都没有！阴天拍的照片氛围感绝了。",
      "user": {
        "id": "cmx_user_001",
        "username": "旅行者小张",
        "avatar": ""
      },
      "createdAt": "2026-06-09T12:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 5.2 POST /api/trips/:id/comments

**用途**：发表评论。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | string | 是 | 1-500 字符 |

**请求示例**：

```json
{
  "content": "上周刚去了，真的一个人都没有！"
}
```

**成功响应** `201 Created`：

```json
{
  "data": {
    "id": "cmx_cmt_002",
    "content": "上周刚去了，真的一个人都没有！",
    "user": {
      "id": "cmx_user_002",
      "username": "lvxingzhe",
      "avatar": ""
    },
    "createdAt": "2026-06-09T13:00:00.000Z"
  },
  "message": "评论发表成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 404 | `NOT_FOUND` | Trip 不存在 |
| 422 | `VALIDATION_ERROR` | 内容为空或超长 |

---

### 5.3 DELETE /api/comments/:id

**用途**：删除评论。评论作者可删除自己的评论。ADMIN 可删除任何评论。

**是否需要登录**：是  
**权限要求**：评论作者（或 ADMIN）

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Comment ID |

**成功响应** `200 OK`：

```json
{
  "message": "评论已删除"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 403 | `FORBIDDEN` | 非评论作者且非 ADMIN |
| 404 | `NOT_FOUND` | 评论不存在 |

---

## 6. 点赞模块

### 6.1 POST /api/trips/:id/like

**用途**：点赞一条旅行灵感。使用 Prisma Transaction 原子更新 likeCount。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**请求体**：无

**成功响应** `200 OK`：

```json
{
  "data": {
    "liked": true,
    "likeCount": 24
  },
  "message": "点赞成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 404 | `NOT_FOUND` | Trip 不存在 |
| 409 | `ALREADY_LIKED` | 已经点赞过此内容 |

---

### 6.2 DELETE /api/trips/:id/like

**用途**：取消点赞。使用 Prisma Transaction 原子更新 likeCount。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "data": {
    "liked": false,
    "likeCount": 23
  },
  "message": "已取消点赞"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 404 | `NOT_FOUND` | 未点赞过此内容 |

---

## 7. 收藏模块

### 7.1 POST /api/trips/:id/favorite

**用途**：收藏一条旅行灵感。使用 Prisma Transaction 原子更新 favoriteCount。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**请求体**：无

**成功响应** `200 OK`：

```json
{
  "data": {
    "favorited": true,
    "favoriteCount": 9
  },
  "message": "收藏成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 404 | `NOT_FOUND` | Trip 不存在 |
| 409 | `ALREADY_FAVORITED` | 已经收藏过此内容 |

---

### 7.2 DELETE /api/trips/:id/favorite

**用途**：取消收藏。使用 Prisma Transaction 原子更新 favoriteCount。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "data": {
    "favorited": false,
    "favoriteCount": 8
  },
  "message": "已取消收藏"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 401 | `UNAUTHORIZED` | 未登录 |
| 404 | `NOT_FOUND` | 未收藏过此内容 |

---

## 8. 个人中心模块

### 8.1 GET /api/profile

**用途**：获取当前登录用户的个人资料。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx123abc...",
    "username": "lvxingzhe",
    "role": "USER",
    "avatar": "",
    "bio": "热爱探索世界的旅行者",
    "tripCount": 3,
    "createdAt": "2026-06-09T12:00:00.000Z"
  },
  "message": "ok"
}
```

---

### 8.2 PATCH /api/profile

**用途**：修改个人资料。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**请求参数**（所有字段可选）：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `bio` | string | 否 | 个人简介，≤200 字符 |
| `avatar` | string | 否 | 头像 URL |

**请求示例**：

```json
{
  "bio": "徒步爱好者 | 星空摄影师 | 正在收集100种不可思议旅行"
}
```

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx123abc...",
    "bio": "徒步爱好者 | 星空摄影师 | 正在收集100种不可思议旅行"
  },
  "message": "资料更新成功"
}
```

---

### 8.3 GET /api/profile/trips

**用途**：获取当前用户发布的所有旅行灵感（包括 PENDING / APPROVED / REJECTED）。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 按状态筛选。不传返回全部 |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx789ghi...",
      "title": "我在火山脚下等银河升起",
      "theme": "暗夜星旅",
      "status": "PENDING",
      "likeCount": 0,
      "favoriteCount": 0,
      "createdAt": "2026-06-09T14:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 8.4 GET /api/profile/favorites

**用途**：获取当前用户的收藏列表。

**是否需要登录**：是  
**权限要求**：USER 或 ADMIN

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx_fav_001",
      "trip": {
        "id": "cmx456def...",
        "title": "在搁浅巨轮下拍末日大片",
        "theme": "废墟美学",
        "emoji": "🚢",
        "likeCount": 23,
        "favoriteCount": 8
      },
      "createdAt": "2026-06-09T13:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

## 9. 后台管理模块

> **全部后台接口要求**：需登录 + ADMIN 角色。

### 9.1 GET /api/admin/stats

**用途**：获取管理端数据概览。

**是否需要登录**：是  
**权限要求**：ADMIN

**成功响应** `200 OK`：

```json
{
  "data": {
    "trips": {
      "total": 12,
      "approved": 9,
      "pending": 2,
      "rejected": 1
    },
    "users": {
      "total": 45,
      "admin": 1
    },
    "comments": {
      "total": 128
    }
  },
  "message": "ok"
}
```

---

### 9.2 GET /api/admin/trips

**用途**：获取所有帖子列表（含 PENDING / APPROVED / REJECTED），用于审核管理。

**是否需要登录**：是  
**权限要求**：ADMIN

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 按状态筛选。不传返回全部 |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx789ghi...",
      "title": "我在火山脚下等银河升起",
      "status": "PENDING",
      "author": {
        "id": "cmx_user_002",
        "username": "lvxingzhe"
      },
      "createdAt": "2026-06-09T14:00:00.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 9.3 PATCH /api/admin/trips/:id/approve

**用途**：审核通过一条帖子。

**是否需要登录**：是  
**权限要求**：ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx789ghi...",
    "status": "APPROVED"
  },
  "message": "审核通过"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 403 | `FORBIDDEN` | 非 ADMIN |
| 404 | `NOT_FOUND` | Trip 不存在 |

---

### 9.4 PATCH /api/admin/trips/:id/reject

**用途**：拒绝一条帖子。

**是否需要登录**：是  
**权限要求**：ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx789ghi...",
    "status": "REJECTED"
  },
  "message": "已拒绝"
}
```

---

### 9.5 DELETE /api/admin/trips/:id

**用途**：管理员强制删除任何帖子并级联删除关联数据（TripTag / Comment / Like / Favorite）。

**是否需要登录**：是  
**权限要求**：ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Trip ID |

**成功响应** `200 OK`：

```json
{
  "message": "帖子已删除"
}
```

---

### 9.6 GET /api/admin/users

**用途**：获取用户列表。

**是否需要登录**：是  
**权限要求**：ADMIN

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `role` | string | 否 | 按角色筛选。不传返回全部 |
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx_user_002",
      "username": "lvxingzhe",
      "role": "USER",
      "createdAt": "2026-06-09T12:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 9.7 PATCH /api/admin/users/:id/role

**用途**：修改用户角色（USER ↔ ADMIN）。

**是否需要登录**：是  
**权限要求**：ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | User ID |

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `role` | string | 是 | `USER` 或 `ADMIN` |

**请求示例**：

```json
{
  "role": "ADMIN"
}
```

**成功响应** `200 OK`：

```json
{
  "data": {
    "id": "cmx_user_002",
    "username": "lvxingzhe",
    "role": "ADMIN"
  },
  "message": "角色修改成功"
}
```

**常见错误**：

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 403 | `FORBIDDEN` | 非 ADMIN |
| 404 | `NOT_FOUND` | 用户不存在 |
| 422 | `VALIDATION_ERROR` | role 值不合法 |

---

### 9.8 GET /api/admin/comments

**用途**：获取全站评论列表（管理端）。

**是否需要登录**：是  
**权限要求**：ADMIN

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 默认 1 |
| `pageSize` | number | 否 | 默认 20 |

**成功响应** `200 OK`：

```json
{
  "data": [
    {
      "id": "cmx_cmt_001",
      "content": "上周刚去了，真的一个人都没有！",
      "user": {
        "id": "cmx_user_003",
        "username": "someuser"
      },
      "trip": {
        "id": "cmx456def...",
        "title": "在搁浅巨轮下拍末日大片"
      },
      "createdAt": "2026-06-09T12:30:00.000Z"
    }
  ],
  "total": 128,
  "page": 1,
  "pageSize": 20,
  "message": "ok"
}
```

---

### 9.9 DELETE /api/admin/comments/:id

**用途**：管理员删除任何评论。

**是否需要登录**：是  
**权限要求**：ADMIN

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Comment ID |

**成功响应** `200 OK`：

```json
{
  "message": "评论已删除"
}
```

---

## 10. 错误码参考

### 10.1 HTTP 状态码

| 状态码 | 含义 | 触发场景 |
|--------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功（注册、发帖、评论） |
| 400 | Bad Request | 请求参数格式错误 |
| 401 | Unauthorized | 未登录或登录已过期 |
| 403 | Forbidden | 权限不足（非 ADMIN 访问管理接口，非作者编辑他人帖子） |
| 404 | Not Found | 资源不存在或不可见（PENDING/REJECTED 内容对非作者隐藏） |
| 409 | Conflict | 资源冲突（重复点赞、重复收藏、用户名已存在） |
| 422 | Validation Error | 字段校验失败（Zod 校验） |
| 500 | Internal Server Error | 服务器内部错误 |

### 10.2 错误码速查表

| 接口 | 可能返回的错误码 |
|------|----------------|
| POST /api/auth/register | 400, 409, 422 |
| POST /api/auth/login | 401 |
| GET /api/auth/me | 401 |
| GET /api/trips | — |
| GET /api/trips/:id | 404 |
| POST /api/trips | 401, 422 |
| PATCH /api/trips/:id | 401, 403, 404, 422 |
| DELETE /api/trips/:id | 401, 403, 404 |
| GET /api/tags | — |
| GET /api/trips/filter | — |
| GET /api/trips/search | — |
| GET /api/blindbox | 404 |
| GET /api/trips/:id/comments | 404 |
| POST /api/trips/:id/comments | 401, 404, 422 |
| DELETE /api/comments/:id | 401, 403, 404 |
| POST /api/trips/:id/like | 401, 404, 409 |
| DELETE /api/trips/:id/like | 401, 404 |
| POST /api/trips/:id/favorite | 401, 404, 409 |
| DELETE /api/trips/:id/favorite | 401, 404 |
| GET /api/profile | 401 |
| PATCH /api/profile | 401, 422 |
| GET /api/profile/trips | 401 |
| GET /api/profile/favorites | 401 |
| GET /api/admin/stats | 401, 403 |
| GET /api/admin/trips | 401, 403 |
| PATCH /api/admin/trips/:id/approve | 401, 403, 404 |
| PATCH /api/admin/trips/:id/reject | 401, 403, 404 |
| DELETE /api/admin/trips/:id | 401, 403, 404 |
| GET /api/admin/users | 401, 403 |
| PATCH /api/admin/users/:id/role | 401, 403, 404, 422 |
| GET /api/admin/comments | 401, 403 |
| DELETE /api/admin/comments/:id | 401, 403, 404 |

### 10.3 端点汇总

| 模块 | 端点 | Method | 认证 | 权限 |
|------|------|--------|------|------|
| 认证 | `/api/auth/register` | POST | 否 | — |
| 认证 | `/api/auth/login` | POST | 否 | — |
| 认证 | `/api/auth/logout` | POST | 是 | — |
| 认证 | `/api/auth/me` | GET | 是 | — |
| 灵感 | `/api/trips` | GET | 否 | — |
| 灵感 | `/api/trips` | POST | 是 | USER+ |
| 灵感 | `/api/trips/:id` | GET | 否 | — |
| 灵感 | `/api/trips/:id` | PATCH | 是 | 作者/ADMIN |
| 灵感 | `/api/trips/:id` | DELETE | 是 | 作者/ADMIN |
| 标签 | `/api/tags` | GET | 否 | — |
| 标签 | `/api/trips/filter` | GET | 否 | — |
| 标签 | `/api/trips/search` | GET | 否 | — |
| 盲盒 | `/api/blindbox` | GET | 否 | — |
| 评论 | `/api/trips/:id/comments` | GET | 否 | — |
| 评论 | `/api/trips/:id/comments` | POST | 是 | USER+ |
| 评论 | `/api/comments/:id` | DELETE | 是 | 作者/ADMIN |
| 点赞 | `/api/trips/:id/like` | POST | 是 | USER+ |
| 点赞 | `/api/trips/:id/like` | DELETE | 是 | USER+ |
| 收藏 | `/api/trips/:id/favorite` | POST | 是 | USER+ |
| 收藏 | `/api/trips/:id/favorite` | DELETE | 是 | USER+ |
| 个人 | `/api/profile` | GET | 是 | USER+ |
| 个人 | `/api/profile` | PATCH | 是 | USER+ |
| 个人 | `/api/profile/trips` | GET | 是 | USER+ |
| 个人 | `/api/profile/favorites` | GET | 是 | USER+ |
| 管理 | `/api/admin/stats` | GET | 是 | ADMIN |
| 管理 | `/api/admin/trips` | GET | 是 | ADMIN |
| 管理 | `/api/admin/trips/:id/approve` | PATCH | 是 | ADMIN |
| 管理 | `/api/admin/trips/:id/reject` | PATCH | 是 | ADMIN |
| 管理 | `/api/admin/trips/:id` | DELETE | 是 | ADMIN |
| 管理 | `/api/admin/users` | GET | 是 | ADMIN |
| 管理 | `/api/admin/users/:id/role` | PATCH | 是 | ADMIN |
| 管理 | `/api/admin/comments` | GET | 是 | ADMIN |
| 管理 | `/api/admin/comments/:id` | DELETE | 是 | ADMIN |

---

> **配套文档**：[PRD](./PRD.md) | [ERD](./ERD.md) | [Prisma Schema](../prisma/schema.prisma)
