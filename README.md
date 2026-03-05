# XHKJ - 薪汇科技官网

> 数据服务商官网 | Data Service Provider Website

## 项目简介

将 xhmxb.com 从原有的 HR SaaS 网站改版为现代科技数据服务商官网，支持 PC / 平板 / 手机三端自适应，并通过微信服务号菜单直接跳转 M-WEB。

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 前台 | Nuxt 3 + Tailwind CSS | Vue 3 SSR，移动优先 |
| 后台 CMS | Strapi v5 | 开源 Headless CMS |
| 数据库 | PostgreSQL 16+ | JSONB + 全文搜索 |
| 缓存 | Redis 7 | 验证码 + API 缓存 |
| 部署 | Docker Compose + Nginx | 阿里云 ECS 双机部署 |

## 项目结构

```
XHKJ/
├── docs/                    # 设计文档
├── xinghui-web/             # Nuxt 3 官网前台
├── xinghui-cms/             # Strapi v5 后台 CMS
├── deploy/                  # 部署配置
│   ├── docker-compose.yml
│   ├── nginx/
│   └── scripts/
├── .gitignore
└── README.md
```

## 部署架构

- **ECS-1 (4C8G)**：Nuxt 3 SSR + Nginx 反向代理
- **ECS-2 (4C8G)**：Strapi v5 + PostgreSQL + Redis

## 快速开始

```bash
# 克隆项目
git clone https://github.com/lnO4X/XHKJ.git
cd XHKJ

# 前台开发
cd xinghui-web
npm install
npm run dev

# CMS 开发
cd xinghui-cms
npm install
npm run develop
```

## 文档

- [全新设计方案](docs/薪汇科技官网_全新设计方案.md)
- [部署指南](docs/部署指南.md) *(待完善)*

## License

Private - 深圳市民信惠集团
