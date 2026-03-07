---
id: CHANGELOG
title: 变更日志
version: 1.0.0
updated: 2026-03-05
status: active
owner: Eason
depends_on: []
---

# 变更日志

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

---

## [0.2.0] - 2026-03-07

### Added
- **Strapi v5 CMS 完整实现**
  - 7 个 Content Type：Banner, Product, Article, Category, Message, CompanyInfo, Homepage
  - 2 个 Shared Component：ProductFeature, StatItem
  - 自定义邮箱验证码登录 API (send-code + login)
  - Redis 集成（验证码 TTL + 限流）
  - 初始数据 Seed（分类、公司信息、首页配置）
  - PostgreSQL 数据库配置 + Nodemailer 邮件配置
- **Nuxt 3 前台完整实现**
  - 5 个页面：首页、产品服务、新闻列表、新闻详情、关于我们、联系我们
  - 响应式布局组件：AppHeader（移动端汉堡菜单）、AppFooter
  - 首页组件：HeroBanner 轮播、StatsCounter、CoreAbility、ProductPreview、NewsPreview
  - 通用组件：Pagination 分页
  - Composables：useStrapi API 封装、useWechat JSSDK、useSeo SEO 优化
  - Strapi Blocks 富文本渲染器
  - WeChat 签名 BFF (server/api/wechat/signature)
  - Tailwind CSS 品牌主题配置
- **部署配置**
  - Docker Compose：ECS-1 (Nginx + Nuxt)、ECS-2 (Strapi + PG + Redis)、本地开发
  - Nginx 配置：SSL 终止、反代、安全头、静态缓存
  - 服务器初始化脚本、PG 备份脚本、部署脚本
- **测试用例**
  - CMS 测试：邮箱验证码流程、留言接口
  - 前台测试：SEO、日期格式化、分页逻辑

---

## [0.1.0] - 2026-03-05

### Added
- 文档体系初始化：INDEX.md, ENV.md, DESIGN.md, TECH.md, DEPLOY.md
- GitHub 仓库创建：https://github.com/lnO4X/XHKJ
- 数据库选型评审：决定使用 PostgreSQL 16+
- 技术选型确定：Strapi v5 + Nuxt 3 + Tailwind CSS
- 双 ECS (4C8G) 部署架构设计
- 项目 .gitignore 配置

### Decisions
- 数据库：PostgreSQL 16+（淘汰 SQLite 和 MySQL）
- CMS：Strapi v5 Headless CMS（避免重复造轮子）
- 前端：Nuxt 3 SSR（SEO + 移动优先）
- 部署：Docker Compose 容器化
