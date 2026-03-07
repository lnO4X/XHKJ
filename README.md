# XHKJ — 薪汇科技官网

> 数据服务商官网 · Mobile-First · Headless CMS

## 概述

将 [xhmxb.com](https://xhmxb.com) 从 HR SaaS 改版为现代科技数据服务商官网。支持 PC / 平板 / 手机三端响应式，通过微信服务号菜单直接跳转 M-WEB。

## 技术栈

| 层级 | 选型 |
|------|------|
| 前台 | Nuxt 3 + Tailwind CSS (Vue 3 SSR) |
| CMS | Strapi v5 (Headless CMS) |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |
| 部署 | Docker Compose · Nginx · 阿里云 ECS × 2 (4C8G) |

## 项目结构

```
XHKJ/
├── xinghui-web/        Nuxt 3 官网前台
├── xinghui-cms/        Strapi v5 后台 CMS
├── deploy/             部署配置 (Docker, Nginx, 脚本)
├── docs/               项目文档
│   ├── INDEX.md        文档索引 (入口)
│   ├── ENV.md          环境信息 (服务器/网络/账号)
│   ├── DESIGN.md       设计文档 (需求/UI/流程)
│   ├── TECH.md         技术方案 (选型/模型/API/规范)
│   ├── DEPLOY.md       部署方案 (Docker/Nginx/备份)
│   └── CHANGELOG.md    变更日志
└── README.md
```

## 快速开始

```bash
# 克隆
git clone https://github.com/lnO4X/XHKJ.git && cd XHKJ

# 启动数据库 (需要 Docker)
cd deploy && docker compose up -d

# 启动 CMS
cd ../xinghui-cms && cp .env.example .env && npm i && npm run develop
# → http://localhost:1337/admin

# 启动前台
cd ../xinghui-web && cp .env.example .env && npm i && npm run dev
# → http://localhost:3000
```

## 文档

所有文档入口：[docs/INDEX.md](docs/INDEX.md)

## License

Private — 深圳市民信惠集团
