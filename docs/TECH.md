---
id: TECH
title: 技术方案
version: 1.0.0
updated: 2026-03-05
status: draft
owner: Eason
depends_on: [DESIGN, ENV]
---

# 技术方案 — 薪汇科技官网

> 面向开发者。技术选型、数据模型、API 契约、代码结构、编码规范。
> 需求背景 → 见 [DESIGN.md](./DESIGN.md) | 环境信息 → 见 [ENV.md](./ENV.md)

---

## 一、技术选型

### 1.1 选型决策

| 层级 | 选型 | 版本 | 决策理由 |
|------|------|------|----------|
| **前台框架** | Nuxt 3 | ^3.14 | Vue 3 SSR，SEO 友好，团队有 Vue 经验 |
| **UI 框架** | Tailwind CSS | ^3.4 | 移动优先 utility CSS |
| **后台 CMS** | Strapi v5 | ^5.x | 开源 Headless CMS，Admin Panel 开箱即用 |
| **数据库** | PostgreSQL | 16+ | JSONB + 全文搜索，见下方评审 |
| **缓存** | Redis | 7+ | 验证码 TTL + API 缓存 |
| **部署** | Docker Compose | v2 | 容器化，一键部署 |
| **反向代理** | Nginx | alpine | SSL 终止 + 路由 |

### 1.2 数据库选型评审

**结论：PostgreSQL 16+**

| 候选 | 结论 | 关键原因 |
|------|------|----------|
| SQLite | ❌ 排除 | 单写者锁，不适合 Web 并发 |
| MySQL 5.7 | ❌ 排除 | 历史包袱，全新设计无需兼容；JSONB 支持弱于 PG |
| **PostgreSQL** | ✅ 选用 | 强类型、JSONB 原生索引、内置全文搜索、主流 CMS 首选 |

---

## 二、项目结构

```
XHKJ/
├── xinghui-web/             # Nuxt 3 官网前台
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── pages/               # 文件路由
│   │   ├── index.vue
│   │   ├── products.vue
│   │   ├── news/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   ├── about.vue
│   │   └── contact.vue
│   ├── components/
│   │   ├── layout/          # AppHeader, AppFooter
│   │   ├── home/            # HeroBanner, CoreAbility, StatsCounter, ProductPreview, NewsPreview
│   │   └── common/          # ContactForm, Pagination
│   ├── composables/
│   │   ├── useStrapi.ts     # Strapi API 封装
│   │   └── useWechat.ts     # 微信 JSSDK
│   ├── assets/css/main.css  # Tailwind 入口
│   ├── server/api/          # BFF 层（微信签名等）
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── xinghui-cms/             # Strapi v5 CMS
│   ├── config/              # database.ts, server.ts, middlewares.ts, plugins.ts
│   ├── src/
│   │   ├── api/             # Content Type API（Strapi 自动生成 + 自定义）
│   │   │   ├── banner/
│   │   │   ├── product/
│   │   │   ├── article/
│   │   │   ├── category/
│   │   │   ├── company-info/
│   │   │   ├── homepage/
│   │   │   ├── message/
│   │   │   └── email-auth/  # ★ 自定义：邮箱验证码登录
│   │   ├── components/      # Shared components (product-feature, stat-item)
│   │   └── index.ts         # Redis 初始化
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── deploy/                  # → 见 DEPLOY.md
├── docs/                    # → 见 INDEX.md
├── .gitignore
└── README.md
```

---

## 三、数据模型

### 3.1 Strapi Content Types

> Strapi 自动管理数据库表结构，以下是逻辑模型。物理表名由 Strapi 生成。

#### Collection Types

**Banner (api::banner.banner)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | String (255) | ✅ | — | 标题 |
| subtitle | String (500) | ❌ | — | 副标题 |
| image | Media (Single) | ✅ | — | 轮播图片 |
| linkUrl | String (500) | ❌ | — | 点击跳转 |
| sortOrder | Integer | ✅ | 0 | 排序 (ASC) |

**Product (api::product.product)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| name | String (255) | ✅ | — | 产品名 |
| slug | UID (from name) | ✅ | — | URL 标识 |
| summary | Text | ✅ | — | 简介 |
| description | Blocks | ❌ | — | 富文本详情 |
| icon | Media (Single) | ❌ | — | 图标 |
| cover | Media (Single) | ❌ | — | 封面 |
| features | Component[ProductFeature] | ❌ | — | 特性列表 |
| sortOrder | Integer | ✅ | 0 | 排序 |

**Article (api::article.article)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | String (300) | ✅ | — | 标题 |
| slug | UID (from title) | ✅ | — | URL 标识 |
| category | Relation → Category | ✅ | — | 分类 |
| content | Blocks | ✅ | — | 正文 |
| summary | Text | ✅ | — | 摘要 |
| cover | Media (Single) | ❌ | — | 封面 |
| isTop | Boolean | ❌ | false | 置顶 |

**Category (api::category.category)**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String (100) | ✅ | 分类名 |
| slug | UID (from name) | ✅ | URL 标识 |
| articles | Relation ← Article[] | — | 反向关联 |

**Message (api::message.message)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| name | String (100) | ✅ | — | 姓名 |
| phone | String (20) | ❌ | — | 电话 |
| email | Email | ✅ | — | 邮箱 |
| content | Text | ✅ | — | 留言 |
| isRead | Boolean | ❌ | false | 已读 |

#### Single Types

**CompanyInfo (api::company-info.company-info)**

| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 公司名 |
| slogan | String | 标语 |
| about | Blocks | 关于我们 |
| address | String | 地址 |
| phone | String | 电话 |
| email | Email | 联系邮箱 |
| icpNumber | String | 备案号 |
| wechatQr | Media | 二维码 |

**Homepage (api::homepage.homepage)**

| 字段 | 类型 | 说明 |
|------|------|------|
| heroTitle | String | 首屏标题 |
| heroSubtitle | String | 首屏副标题 |
| stats | Component[StatItem][] | 数字亮点 |
| seoTitle | String | SEO 标题 |
| seoDescription | Text | SEO 描述 |

#### Components

**shared.product-feature**：`{ title: String, content: Text }`
**shared.stat-item**：`{ number: String, label: String }`

### 3.2 初始数据

```
Category:
  - { name: "公司新闻", slug: "company-news" }
  - { name: "行业资讯", slug: "industry-news" }
  - { name: "公告通知", slug: "announcements" }

CompanyInfo:
  - { name: "薪汇科技", slogan: "让数据创造价值" }

Homepage:
  - { heroTitle: "让数据创造价值", heroSubtitle: "专业数据服务商" }
```

---

## 四、API 契约

### 4.1 公开接口（Strapi REST API）

> Strapi 自动生成，遵循其 REST API 规范。返回格式：`{ data, meta }`

| 方法 | 路径 | 参数 | 说明 |
|------|------|------|------|
| GET | `/api/banners` | `sort=sortOrder:asc`, `populate=image`, `publicationState=live` | 轮播图 |
| GET | `/api/products` | `sort=sortOrder:asc`, `populate=icon,cover,features` | 产品列表 |
| GET | `/api/articles` | `sort=isTop:desc,publishedAt:desc`, `populate=cover,category`, `pagination[page]`, `pagination[pageSize]`, `filters[category][slug][$eq]` | 文章列表 |
| GET | `/api/articles/:id` | `populate=cover,category` | 文章详情（也可用 slug 过滤） |
| GET | `/api/categories` | — | 分类列表 |
| GET | `/api/company-info` | `populate=wechatQr` | 公司信息（单例） |
| GET | `/api/homepage` | `populate=stats` | 首页配置（单例） |
| POST | `/api/messages` | body: `{ data: { name, email, phone?, content } }` | 提交留言 |

### 4.2 自定义接口

#### POST /api/email-auth/send-code

```
Request:  { email: "admin@minxinhui.com" }
Response: { message: "验证码已发送" }
Errors:   400 "仅限 @minxinhui.com 域名邮箱"
          429 "请60秒后再试"
```

#### POST /api/email-auth/login

```
Request:  { email: "admin@minxinhui.com", code: "123456" }
Response: { data: { token: "jwt...", user: { id, email, firstname, lastname } } }
Errors:   401 "验证码错误或已过期"
          401 "账号不存在或已禁用"
```

### 4.3 限流策略

| 接口 | 限制 |
|------|------|
| POST /api/email-auth/send-code | 同一邮箱 60 秒 1 次，同一 IP 10 分钟 5 次 |
| POST /api/messages | 同一 IP 1 分钟 3 次 |

---

## 五、前端实现

### 5.1 Strapi API 封装

```typescript
// xinghui-web/composables/useStrapi.ts
export const useStrapi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.strapiUrl + '/api';

  async function find<T = any>(endpoint: string, params?: object): Promise<T> {
    return $fetch(`${baseURL}/${endpoint}`, { params });
  }

  async function findOne<T = any>(endpoint: string, id: string | number, params?: object): Promise<T> {
    return $fetch(`${baseURL}/${endpoint}/${id}`, { params });
  }

  async function create<T = any>(endpoint: string, data: object): Promise<T> {
    return $fetch(`${baseURL}/${endpoint}`, { method: 'POST', body: { data } });
  }

  return { find, findOne, create };
};
```

### 5.2 页面数据加载模式

所有页面使用 `useAsyncData` 实现 SSR 数据预取：

```typescript
// pages/index.vue
const { data: pageData } = await useAsyncData('homepage', async () => {
  const [banners, products, articles, homepage, companyInfo] = await Promise.all([
    find('banners', { sort: 'sortOrder:asc', populate: 'image', 'pagination[limit]': 5 }),
    find('products', { sort: 'sortOrder:asc', populate: ['icon', 'cover'], 'pagination[limit]': 4 }),
    find('articles', { sort: ['isTop:desc', 'publishedAt:desc'], populate: ['cover', 'category'], 'pagination[limit]': 3 }),
    find('homepage', { populate: 'stats' }),
    find('company-info', { populate: 'wechatQr' }),
  ]);
  return { banners, products, articles, homepage, companyInfo };
});
```

### 5.3 SEO

```typescript
// 每个页面设置 useHead + useSeoMeta
useSeoMeta({
  title: '薪汇科技 - 让数据创造价值',
  ogTitle: '薪汇科技',
  description: '专业数据服务商...',
  ogDescription: '专业数据服务商...',
  ogImage: 'https://xhmxb.com/og-cover.jpg',
});
```

---

## 六、邮箱验证码实现

### 6.1 Redis 集成

```typescript
// xinghui-cms/src/index.ts
import Redis from 'ioredis';

export default {
  register({ strapi }) {
    strapi.redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  },
  destroy({ strapi }) {
    strapi.redis?.disconnect();
  },
};
```

### 6.2 send-code 伪代码

```
1. 校验 email 格式 → 400
2. 校验 @minxinhui.com 域名 → 400
3. 检查 Redis rate_limit:send_code:{email} 存在 → 429
4. 生成 6 位随机数字 code
5. Redis SET email_code:{email} = code, EX 300
6. Redis SET rate_limit:send_code:{email} = 1, EX 60
7. 调用 Strapi Email plugin 发送邮件
8. 返回 200
```

### 6.3 login 伪代码

```
1. 校验 email + code 非空 → 400
2. Redis GET email_code:{email} → 不存在或不匹配 → 401
3. Redis DEL email_code:{email} （一次性消耗）
4. 查询 admin user → 不存在或禁用 → 401
5. 签发 JWT token
6. 返回 { token, user }
```

---

## 七、测试策略

### 7.1 测试工具

| 层级 | 工具 | 位置 |
|------|------|------|
| 单元/组件测试 | Vitest + @vue/test-utils | xinghui-web/tests/ |
| API 测试 | Vitest + Strapi test utils | xinghui-cms/tests/ |
| E2E（后续） | Playwright | 根目录 e2e/ |

### 7.2 关键用例清单

→ 见实现阶段的 test 文件

---

## 八、编码规范

| 规则 | 说明 |
|------|------|
| 语言 | TypeScript strict |
| 格式化 | Prettier (2 空格, 单引号, 无分号) |
| Lint | ESLint (Nuxt preset / Strapi preset) |
| 提交 | Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:` |
| 组件 | `<script setup lang="ts">`, PascalCase 文件名 |
| composables | `use` 前缀 |
| 文件行数 | 单文件 ≤ 300 行，超过则拆分 |
| CSS | Tailwind utility-first，颜色统一用 CSS 变量 |

---

## 九、性能目标

| 指标 | 目标 | 手段 |
|------|------|------|
| LCP | < 2.5s | SSR + 关键 CSS 内联 |
| FID | < 100ms | 最小化 JS bundle |
| CLS | < 0.1 | 图片占位 + 字体优化 |
| 首屏体积 | < 200KB | Tailwind purge + WebP |
| TTFB | < 500ms | SSR + Redis 缓存 |
