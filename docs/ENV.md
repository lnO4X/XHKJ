---
id: ENV
title: 环境信息
version: 1.0.0
updated: 2026-03-05
status: draft
owner: Eason
depends_on: []
---

# 环境信息

> 记录所有基础设施、账号、网络、第三方服务配置。
> **敏感信息用占位符**，实际值存放 `.env` 文件。

---

## 一、服务器

### 1.1 阿里云 ECS

| 标识 | ECS-1 (Web 网关) | ECS-2 (数据服务) |
|------|-------------------|-------------------|
| **用途** | Nginx + Nuxt 3 SSR | Strapi v5 + PostgreSQL + Redis |
| **规格** | 4C8G | 4C8G |
| **公网 IP** | [TODO] | 不暴露公网 |
| **内网 IP** | [TODO] | [TODO] |
| **操作系统** | [TODO - 建议 Ubuntu 22.04] | [TODO - 建议 Ubuntu 22.04] |
| **SSH 端口** | 22 | 22 (仅内网) |
| **SSH 用户** | [TODO] | [TODO] |
| **地域** | [TODO] | [TODO - 与 ECS-1 同可用区] |

### 1.2 安全组规则

| 方向 | ECS-1 | ECS-2 |
|------|-------|-------|
| **入方向** | 80/tcp (0.0.0.0/0), 443/tcp (0.0.0.0/0), 22/tcp (办公IP) | 1337/tcp (ECS-1内网IP), 22/tcp (ECS-1内网IP) |
| **出方向** | 全部放行 | 全部放行 |
| **内网互通** | ↔ ECS-2 全端口 | ↔ ECS-1 全端口 |

---

## 二、域名与 DNS

| 项目 | 值 |
|------|-----|
| **主域名** | xhmxb.com |
| **DNS 托管** | [TODO - 阿里云 DNS / CloudFlare?] |
| **A 记录** | xhmxb.com → ECS-1 公网 IP |
| **A 记录** | www.xhmxb.com → ECS-1 公网 IP |
| **ICP 备案号** | [TODO] |
| **备案主体** | [TODO - 需确认是否需变更] |

### SSL 证书

| 项目 | 值 |
|------|-----|
| **方案** | [TODO - 阿里云免费证书 / Let's Encrypt] |
| **证书路径 (ECS-1)** | /etc/nginx/ssl/xhmxb.com.pem |
| **私钥路径 (ECS-1)** | /etc/nginx/ssl/xhmxb.com.key |
| **自动续签** | [TODO] |

---

## 三、数据库

| 项目 | 值 |
|------|-----|
| **类型** | PostgreSQL 16 |
| **部署位置** | ECS-2 Docker 容器 |
| **端口** | 5432 (仅 127.0.0.1) |
| **数据库名** | xinghui_cms |
| **用户名** | xinghui |
| **密码** | [CREDENTIAL:pg-password] |
| **数据卷** | /var/lib/docker/volumes/pgdata |
| **备份路径** | /opt/backups/postgres/ |
| **备份策略** | 每日 03:00 全量备份，保留 30 天 |

---

## 四、缓存

| 项目 | 值 |
|------|-----|
| **类型** | Redis 7 |
| **部署位置** | ECS-2 Docker 容器 |
| **端口** | 6379 (仅 127.0.0.1) |
| **密码** | [CREDENTIAL:redis-password] |
| **用途** | 邮箱验证码 (TTL 5min)、API 响应缓存 |

---

## 五、邮件服务 (SMTP)

| 项目 | 值 |
|------|-----|
| **SMTP 主机** | [TODO - smtp.minxinhui.com?] |
| **端口** | [TODO - 465 (SSL) / 587 (TLS)?] |
| **发件账号** | [TODO - noreply@minxinhui.com?] |
| **密码** | [CREDENTIAL:smtp-password] |
| **用途** | 管理员登录验证码 |
| **邮箱域名限制** | @minxinhui.com |

---

## 六、微信公众号

| 项目 | 值 |
|------|-----|
| **公众号类型** | 服务号 |
| **公众号名称** | [TODO] |
| **AppID** | [TODO] |
| **AppSecret** | [CREDENTIAL:wechat-app-secret] |
| **JS 安全域名** | xhmxb.com |
| **业务域名** | xhmxb.com |
| **IP 白名单** | ECS-1 公网 IP |
| **管理后台** | https://mp.weixin.qq.com |

---

## 七、代码仓库

| 项目 | 值 |
|------|-----|
| **平台** | GitHub |
| **仓库地址** | https://github.com/lnO4X/XHKJ |
| **默认分支** | main |
| **部署分支** | main (生产) |
| **CI/CD** | [TODO - GitHub Actions / 手动部署?] |

---

## 八、本地开发环境

| 依赖 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | v20+ | 推荐 v22 LTS |
| npm | v10+ | — |
| Docker | v24+ | 本地运行 PostgreSQL + Redis |
| Docker Compose | v2+ | — |
| Git | v2.30+ | — |

### 本地端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| Nuxt 3 Dev | 3000 | 前台开发 |
| Strapi Dev | 1337 | CMS 后台 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

---

## 九、环境变量清单

> 完整变量列表。每个子项目有自己的 `.env.example` 文件。

### xinghui-cms/.env

```bash
# 服务器
HOST=0.0.0.0
PORT=1337

# Strapi 密钥
APP_KEYS=                    # 逗号分隔的随机字符串
API_TOKEN_SALT=              # 随机字符串
ADMIN_JWT_SECRET=            # 随机字符串
JWT_SECRET=                  # 随机字符串
TRANSFER_TOKEN_SALT=         # 随机字符串

# 数据库
DATABASE_CLIENT=postgres
DATABASE_HOST=               # 本地: 127.0.0.1 / 生产: postgres
DATABASE_PORT=5432
DATABASE_NAME=xinghui_cms
DATABASE_USERNAME=xinghui
DATABASE_PASSWORD=           # [CREDENTIAL:pg-password]

# Redis
REDIS_HOST=                  # 本地: 127.0.0.1 / 生产: redis
REDIS_PORT=6379
REDIS_PASSWORD=              # [CREDENTIAL:redis-password]

# 邮件
SMTP_HOST=                   # [TODO]
SMTP_PORT=                   # [TODO]
SMTP_USER=                   # [TODO]
SMTP_PASS=                   # [CREDENTIAL:smtp-password]
```

### xinghui-web/.env

```bash
# Strapi API 地址
NUXT_PUBLIC_STRAPI_URL=      # 本地: http://localhost:1337 / 生产: http://ECS-2内网IP:1337
NUXT_PUBLIC_SITE_URL=        # 本地: http://localhost:3000 / 生产: https://xhmxb.com

# 微信 (可选，用于分享)
NUXT_WECHAT_APP_ID=          # [TODO]
NUXT_WECHAT_APP_SECRET=      # [CREDENTIAL:wechat-app-secret]
```
