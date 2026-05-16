# 个人知识库 Blog 系统 - 实施计划

## Context

从零构建一个以技术博客为核心的个人知识库系统，集成知识管理（双向链接、知识图谱）和社交互动（评论、点赞、订阅）功能。选择 Next.js 15 + Local PostgreSQL + Next.js 技术栈，实现全栈应用，支持亮/暗双主题切换。

---

## 技术选型

| 层级 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | RSC + Server Actions + Vercel 原生 |
| 数据库 | Local PostgreSQL | Auth + Storage + Realtime 一体化 |
| UI 组件 | shadcn/ui + Tailwind CSS | 可定制、无依赖锁定 |
| 主题 | next-themes | 亮/暗切换，CSS 变量方案 |
| MDX | next-mdx-remote/rsc | 服务端渲染，零客户端 JS |
| 代码高亮 | rehype-pretty-code (Shiki) | 主题一致、行高亮支持 |
| 图谱 | D3.js force-directed | 轻量、可定制 |
| 搜索 | Local PostgreSQL tsvector + pg_trgm | 全文 + 模糊，无额外服务 |
| 编辑器 | CodeMirror 6 | 可扩展、MDX 友好 |

---

## 项目结构

```
wiki-platform/
├── src/
│   ├── app/
│   │   ├── (main)/              # 公开页面路由组
│   │   │   ├── page.tsx                  # 首页
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx              # 文章列表
│   │   │   │   └── [slug]/page.tsx       # 文章详情
│   │   │   ├── tags/page.tsx             # 标签页
│   │   │   ├── categories/page.tsx       # 分类页
│   │   │   ├── graph/page.tsx            # 知识图谱
│   │   │   ├── search/page.tsx           # 搜索页
│   │   │   ├── bookmarks/page.tsx        # 书签收藏
│   │   │   ├── about/page.tsx            # 关于
│   │   │   └── layout.tsx
│   │   ├── (auth)/              # 认证路由组
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── admin/               # 管理后台
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── posts/
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── tags/page.tsx
│   │   │   ├── subscribers/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── rss/route.ts              # RSS feed
│   │   │   ├── og/route.ts               # 动态 OG 图片
│   │   │   └── subscribe/route.ts        # 邮件订阅
│   │   ├── layout.tsx                    # 根布局
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   ├── blog/                # 文章卡片、列表、分页
│   │   ├── mdx/                 # MDX 渲染、代码块、自定义组件
│   │   ├── editor/              # CodeMirror 编辑器
│   │   ├── knowledge/           # 知识图谱、反向链接
│   │   ├── search/              # 搜索命令面板
│   │   ├── social/              # 评论、点赞、分享
│   │   ├── theme/               # 主题切换
│   │   └── layout/              # Header、Footer、Sidebar
│   ├── lib/
│   │   ├── postgres/
│   │   │   ├── client.ts        # 浏览器客户端
│   │   │   ├── server.ts        # 服务端客户端（cookie 认证）
│   │   │   └── admin.ts         # 管理端客户端（service role）
│   │   ├── mdx/
│   │   │   ├── plugins.ts       # MDX 插件链配置
│   │   │   └── remark-wiki-links.ts  # [[slug]] 解析插件
│   │   └── utils.ts
│   ├── actions/                  # Server Actions
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   ├── likes.ts
│   │   ├── bookmarks.ts
│   │   ├── auth.ts
│   │   └── subscriptions.ts
│   ├── queries/                  # 数据查询函数
│   │   ├── posts.ts
│   │   ├── tags.ts
│   │   ├── categories.ts
│   │   ├── comments.ts
│   │   ├── bookmarks.ts
│   │   ├── search.ts
│   │   ├── graph.ts
│   │   └── subscribers.ts
│   ├── types/
│   │   └── index.ts
│   ├── hooks/
│   └── config/
│       └── site.ts              # 站点配置
├── postgres/
│   └── migrations/              # 数据库迁移
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 数据库设计 (11 张表)

### 核心表

**profiles** - 用户扩展表
- id: uuid (FK auth.users), username: text, display_name: text
- avatar_url: text, bio: text, role: text (admin/reader)
- created_at: timestamptz
- 自动创建触发器：新用户注册时自动创建 profile

**posts** - 文章表（核心）
- id: uuid, slug: text (unique), title: text, excerpt: text
- content: text (raw markdown), published: boolean (default false)
- category_id: uuid (FK categories), author_id: uuid (FK profiles)
- cover_image: text, reading_time: int, view_count: int (default 0)
- created_at: timestamptz, updated_at: timestamptz, published_at: timestamptz
- fts: tsvector (generated column, title A权重 + excerpt B权重 + content C权重)
- GIN 索引 on fts，用于全文搜索

**post_tags** - 文章-标签关联表
- post_id: uuid (FK posts), tag_id: uuid (FK tags)
- 复合主键

**post_links** - 双向链接关联表（知识图谱核心）
- id: uuid, source_post_id: uuid (FK posts)
- target_post_id: uuid (FK posts, nullable) — nullable 支持悬空链接
- target_slug: text — [[slug]] 中的 slug
- created_at: timestamptz
- target_post_id 为 null 时表示链接到尚未创建的文章

**categories** - 分类表
- id: uuid, name: text, slug: text (unique)
- description: text, sort_order: int

**tags** - 标签表
- id: uuid, name: text, slug: text (unique)
- color: text, description: text

### 社交表

**comments** - 评论表
- id: uuid, post_id: uuid (FK posts), author_id: uuid (FK profiles, nullable)
- guest_name: text, guest_email: text — 匿名访客评论
- content: text, parent_id: uuid (FK comments, self-ref) — 嵌套回复
- is_approved: boolean (default false), created_at: timestamptz

**likes** - 点赞表（多态设计）
- id: uuid, user_id: uuid (FK profiles)
- target_type: text (post/comment), target_id: uuid
- created_at: timestamptz
- 唯一约束 (user_id, target_type, target_id)

**post_views** - 浏览量表
- post_id: uuid (FK posts, unique), view_count: int (default 0)
- 通过 SECURITY DEFINER RPC 函数 increment_post_view() 原子递增

### 用户表

**bookmarks** - 书签收藏
- id: uuid, user_id: uuid (FK profiles), post_id: uuid (FK posts)
- created_at: timestamptz
- 唯一约束 (user_id, post_id)

**subscriptions** - 邮件订阅
- id: uuid, email: text (unique), is_active: boolean (default true)
- subscribed_at: timestamptz, unsubscribed_at: timestamptz

---

## 认证架构

三层用户体系：
- **admin** - 手动创建，全站管理权限
- **reader** - 自注册，可收藏/点赞/评论
- **anonymous** - 可阅读公开内容、提交游客评论

三个 Local PostgreSQL 客户端实例：
- `client.ts` - 浏览器端，anon key，受 RLS 保护
- `server.ts` - 服务端，anon key + cookie 传递，受 RLS 保护
- `admin.ts` - 管理端，service role key，绕过 RLS

Middleware 刷新 auth session 并保护 `/admin/*` 和 `/bookmarks` 路由。

---

## 核心功能实现策略

### 1. Markdown + MDX 渲染
- `next-mdx-remote/rsc` 服务端渲染，零客户端 JS
- 插件链：`remark-gfm` -> `remark-wiki-links` (自定义) -> `rehype-pretty-code` (Shiki)
- 自定义 MDX 组件：Callout、CodeBlock、ImageCard 等

### 2. 双向链接系统
- 自定义 remark 插件解析 `[[slug]]` 和 `[[slug|显示文本]]`
- 保存文章时提取所有 `[[]]` 链接写入 `post_links` 表
- `target_post_id` 可为 null（悬空链接，目标文章尚未创建）
- 反向链接：查询 `post_links WHERE target_post_id = 当前文章id`

### 3. 知识图谱
- D3.js force-directed 图，客户端组件，`ssr: false` 动态导入
- Server Component 查询所有 posts + post_links，传递 `{ nodes, edges }` JSON
- 节点大小 = 文章连接数，已发布/草稿用不同颜色区分
- 点击节点跳转文章页

### 4. 全文搜索
- 双引擎：GIN 索引 tsvector（结构化关键词）+ pg_trgm（模糊/子串匹配）
- `search_posts()` RPC 函数：0.6 * ts_rank + 0.4 * trigram similarity
- 前端：cmdk 命令面板，Cmd+K 快捷键，300ms 防抖

### 5. 评论系统
- local PostgreSQL-backed updates 订阅 `comments` 表，按 `post_id` 过滤
- INSERT/UPDATE 事件实时更新评论列表
- 嵌套回复（parent_id 自引用），审核机制（is_approved）

### 6. RSS / SEO / 社交
- Route Handler 生成 RSS XML
- `generateMetadata()` 动态 SEO 元数据
- `next/og` ImageResponse 生成动态 OG 图片
- `sitemap.ts` 自动站点地图
- JSON-LD 结构化数据

---

## UI/UX 架构

- **组件库**：shadcn/ui（Radix UI + Tailwind CSS，copy-paste 模式）
- **主题**：next-themes + CSS 变量（`:root` 亮 / `.dark` 暗）
- **字体**：Inter（正文）+ JetBrains Mono（代码）
- **内容宽度**：最大 720px，保证可读性
- **响应式**：Tailwind 默认断点，移动优先

---

## 分阶段实施计划

### Phase 1: 基础博客 (第 1-3 周)
**交付物：可工作的博客**

1. 项目脚手架：Next.js 15 + TypeScript + Tailwind + shadcn/ui
2. Local PostgreSQL 项目创建 + 数据库迁移（profiles, categories, tags, posts, post_tags）
3. 认证系统：登录/注册页 + middleware + 三客户端实例
4. 文章 CRUD：Server Actions + 管理后台编辑器（CodeMirror）
5. MDX 渲染管线：next-mdx-remote + rehype-pretty-code
6. 前台页面：首页、文章列表、文章详情、标签页、分类页
7. 基础 SEO：metadata + sitemap
8. 主题切换

### Phase 2: 知识管理 (第 4-5 周)
**交付物：知识库**

1. 双向链接：remark-wiki-links 插件 + post_links 表
2. 反向链接组件（文章底部显示）
3. 知识图谱：D3.js 力导向图 + 数据查询
4. 全文搜索：search_posts() RPC + cmdk 命令面板
5. 书签收藏：bookmarks 表 + Server Actions
6. 浏览量计数

### Phase 3: 社交互动 (第 6-7 周)
**交付物：社交博客**

1. 评论系统：comments 表 + Realtime 订阅 + 嵌套回复
2. 点赞：likes 表（多态设计）
3. RSS feed
4. 邮件订阅 + 通知
5. 文章分享（复制链接、社交平台）
6. 动态 OG 图片

### Phase 4: 生产优化 (第 8 周)
**交付物：生产就绪**

1. ISR 缓存策略 + revalidatePath
2. Bundle 优化（动态导入、tree-shaking）
3. 错误处理 + loading/error 边界
4. 无障碍（a11y）检查
5. Rate limiting
6. 分析集成（Vercel Analytics）

---

## 验证方式

每个 Phase 结束后：
1. `npm run build` 无错误
2. Vercel 部署成功
3. 核心流程手动测试通过
4. Lighthouse 分数 > 90（性能、SEO、a11y）
