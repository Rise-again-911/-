# 实体关系设计文档 (ERD)

## 概述

本文档描述「100种不可思议旅行」的数据库实体关系设计，覆盖 6 个核心实体和 1 个关联表。

---

## 实体关系图

```mermaid
erDiagram
    User ||--o{ Trip : "创建"
    User ||--o{ Comment : "发表"
    User ||--o{ Like : "点赞"
    User ||--o{ Favorite : "收藏"
    Trip ||--o{ Comment : "包含"
    Trip ||--o{ Like : "被点赞"
    Trip ||--o{ Favorite : "被收藏"
    Trip ||--o{ TripTag : "关联"
    Tag ||--o{ TripTag : "被引用"

    User {
        string id PK "cuid() 生成"
        string username UK "3-30字符, 字母数字下划线"
        string passwordHash "bcryptjs 哈希"
        string avatar "头像URL, 默认空"
        string bio "个人简介, 默认空"
        string role "user | admin, 默认 user"
        datetime createdAt "注册时间"
        datetime updatedAt "更新时间"
    }

    Trip {
        string id PK "cuid() 生成"
        string title "≤60字符"
        string summary "≤200字符, 一句话钩子"
        string story "150-220字, 情绪化叙事"
        string theme "限时仪式感|废墟美学|反向小城|暗夜星旅|野性轻探"
        string location "大致区域描述"
        string bestTime "推荐时段/天气"
        string difficulty "难度与风险"
        string budget "大致花销"
        string safety "安全提示"
        string highlights "JSON数组, 3-5条亮点"
        string emoji "卡片占位, 默认📍"
        string imageUrl "氛围图URL, 默认空"
        string authorId FK "作者ID → User.id"
        boolean isOfficial "是否官方内容, 默认false"
        string status "pending|approved|rejected, 默认pending"
        int likeCount "冗余计数, 默认0"
        int favoriteCount "冗余计数, 默认0"
        datetime createdAt "创建时间"
        datetime updatedAt "更新时间"
    }

    Tag {
        string id PK "cuid() 生成"
        string name UK "标签名称, 唯一"
        string type "theme|mood|level"
        datetime createdAt "创建时间"
    }

    TripTag {
        string tripId PK_FK "Trip.id"
        string tagId PK_FK "Tag.id"
    }

    Comment {
        string id PK "cuid() 生成"
        string content "≤500字符"
        string userId FK "评论者ID → User.id"
        string tripId FK "所属Trip → Trip.id, CASCADE"
        datetime createdAt "评论时间"
    }

    Like {
        string id PK "cuid() 生成"
        string userId FK "点赞者ID → User.id"
        string tripId FK "所属Trip → Trip.id, CASCADE"
        datetime createdAt "点赞时间"
    }

    Favorite {
        string id PK "cuid() 生成"
        string userId FK "收藏者ID → User.id"
        string tripId FK "所属Trip → Trip.id, CASCADE"
        datetime createdAt "收藏时间"
    }
```

---

## 表说明

### 1. User — 用户

**作用**：存储所有注册用户的信息，包括普通用户和管理员。

**关键设计**：
- `role` 仅分两级（`user` / `admin`），不做细粒度 RBAC，MVP 足够
- `passwordHash` 由 bcryptjs 生成，不存储明文密码
- `avatar` 和 `bio` 在 MVP 阶段为预留字段，默认空
- `username` 唯一约束，防止重复注册

### 2. Trip — 旅行灵感

**作用**：核心内容实体，存储每一条旅行灵感的完整信息。

**关键设计**：
- `theme` 为单选自带字段（5 选 1），直接存字符串。因为主题标签是 Trip 的核心分类维度，每条 Trip 只有一个主题，无需 M2M
- `moodTags`（情绪标签）和 `rarityTag`（小众等级）通过 `Tag` + `TripTag` 多对多关联，支持灵活组合查询
- `highlights` 存 JSON 数组字符串（如 `'["亮点1","亮点2","亮点3"]'`），因为 SQLite 不支持原生数组类型
- `status` 默认 `pending`，用户投稿需审核通过后才在公开页面展示
- `likeCount` 和 `favoriteCount` 为冗余计数字段，通过 Prisma Transaction 与 Like/Favorite 操作原子更新，避免列表查询时额外 COUNT
- `authorId` 外键关联 User；Trip 删除时级联删除关联的 TripTag、Comment、Like、Favorite

### 3. Tag — 标签

**作用**：存储所有可用标签，按 `type` 区分维度。

**标签数据**：

| type | 值 |
|------|----|
| `theme` | 限时仪式感、废墟美学、反向小城、暗夜星旅、野性轻探 |
| `mood` | 孤独、末日感、荒凉、狂野、原始、浪漫、松弛、震撼、猎奇、怀旧 |
| `level` | 只有当地人才知道、圈内人才懂、需要当地向导、需要特殊技能 |

**关键设计**：
- `name` 唯一约束，保证标签不重复
- `type` 区分维度（theme / mood / level），方便前端分组展示和查询
- 标签由 seed 脚本预置，MVP 不支持用户自定义标签
- 虽然 `theme` 字段也在 Trip 表中（单值），但 Tag 表中仍然存储 theme 类标签，用于统一的标签体系管理和展示

### 4. TripTag — Trip 与 Tag 多对多关联

**作用**：连接 Trip 和 Tag，实现多对多关系。

**关键设计**：
- 联合主键 `(tripId, tagId)`，保证同一 Trip 不会重复关联同一 Tag
- `tripId` 外键 → Trip.id（CASCADE 删除）
- `tagId` 外键 → Tag.id（CASCADE 删除）
- 查询示例：查找所有带"孤独"标签的 Trip → `JOIN TripTag ON Trip.id = TripTag.tripId JOIN Tag ON TripTag.tagId = Tag.id WHERE Tag.name = '孤独'`
- MVP 中情绪标签（moodTags）和小众等级（rarityTag）都通过此关联表实现

### 5. Comment — 评论

**作用**：存储用户在详情页发表的评论。

**关键设计**：
- `tripId` 外键 Cascade：Trip 删除时自动清除所有评论
- `userId` 外键：关联评论者
- 不设评论的审核状态（MVP 简化），管理员通过后台直接删除违规评论
- 不设评论的编辑/回复/点赞（MVP 简化）

### 6. Like — 点赞

**作用**：记录用户对 Trip 的点赞关系。

**关键设计**：
- `@@unique([userId, tripId])` — 数据库层保证同一用户对同一 Trip 只能点赞一次
- 点赞操作使用 Prisma `$transaction`：创建 Like + `Trip.likeCount += 1`，保证计数一致性
- 取消点赞同样使用 Transaction：删除 Like + `Trip.likeCount -= 1`
- 重复点赞由唯一约束在数据库层拦截，返回 409

### 7. Favorite — 收藏

**作用**：记录用户对 Trip 的收藏关系。

**关键设计**：
- `@@unique([userId, tripId])` — 数据库层保证同一用户对同一 Trip 只能收藏一次
- 收藏/取消收藏操作使用 Prisma `$transaction`，与点赞的设计模式一致
- 收藏列表通过 `/profile` 页面展示

---

## 表关系总结

```
User  1 ──── N Trip        (一个用户可创建多条旅行灵感)
User  1 ──── N Comment     (一个用户可发表多条评论)
User  1 ──── N Like        (一个用户可点赞多条旅行灵感)
User  1 ──── N Favorite    (一个用户可收藏多条旅行灵感)
Trip  1 ──── N Comment     (一条旅行灵感可有多条评论)
Trip  1 ──── N Like        (一条旅行灵感可被多次点赞)
Trip  1 ──── N Favorite    (一条旅行灵感可被多次收藏)
Trip  N ──── M Tag         (通过 TripTag 多对多关联)
```

**删除级联链路**：

```
删除 Trip
  → CASCADE 删除 TripTag (清理标签关联)
  → CASCADE 删除 Comment (清理评论)
  → CASCADE 删除 Like    (清理点赞)
  → CASCADE 删除 Favorite (清理收藏)

删除 User
  → RESTRICT (如果用户有 Trip/Comment/Like/Favorite, 拒绝删除)
  → 或: CASCADE 删除该用户的 Trip/Comment/Like/Favorite

删除 Tag
  → CASCADE 删除 TripTag (清理关联, 不删除 Trip)
```

**查询路径**：

```
获取带标签的 Trip 列表:
  Trip ← TripTag → Tag
  查询所有 mood=孤独 的 Trip:
    Tag.name = '孤独' AND Tag.type = 'mood'
    → TripTag → Trip (status=approved)

获取 Trip 详情 + 点赞/收藏状态:
  Trip + COUNT(Like) + COUNT(Favorite)
  + 当前用户是否已点赞 (EXISTS Like WHERE userId=X AND tripId=Y)
  + 当前用户是否已收藏 (EXISTS Favorite WHERE userId=X AND tripId=Y)

获取用户收藏列表:
  User → Favorite → Trip (status=approved)
```

---

## 为什么这样设计

### 1. Tag 独立实体 + M2M 而非 JSON 字符串

- **查询效率**：`WHERE Tag.name = '孤独'` 比 `WHERE moodTags LIKE '%孤独%'` 更精确、可索引
- **数据完整性**：标签值集中在 Tag 表管理，避免 Trip 表中出现拼写错误或不一致的标签
- **扩展性**：未来新增标签类型无需改 Trip 表结构，只需在 Tag 表中插入新记录
- **标签复用**：同一标签可被多个 Trip 引用，Tag 表作为标签字典

### 2. theme 同时存在于 Trip 字段和 Tag 表中

- Trip.theme 是单值必选字段，直接存储在最常查询的 Trip 表中，避免 JOIN
- Tag 表中同时存储 theme 标签，用于统一的标签云渲染和管理
- 查询时可直接用 `WHERE Trip.theme = '废墟美学'`，无需 JOIN

### 3. likeCount / favoriteCount 冗余计数

- 首页卡片流需要展示点赞数和收藏数，如果每次查询都做 COUNT(Like) 会产生 N 次额外查询（N+1 问题）
- 冗余计数 + Transaction 原子更新保证了读取性能和写入一致性的平衡
- 这是读多写少场景的常见优化模式

### 4. highlights 用 JSON 字符串存 TEXT

- SQLite 不支持原生 JSON 数组列类型
- highlights 只在详情页展示，不参与搜索和筛选（由 summary 和标签覆盖），无需作为结构化字段查询
- 应用层 `JSON.stringify` / `JSON.parse` 序列化/反序列化即可

---

> **配套文档**：[PRD](./PRD.md) | [数据模型规格](./specs/data-model.md) | [Prisma Schema](../../prisma/schema.prisma)
