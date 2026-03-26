---
id: ENV
title: 环境信息
version: 2.0.0
updated: 2026-03-20
status: active
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
| **规格** | 4C8G (99G 磁盘) | 4C8G (99G 磁盘) |
| **公网 IP** | 8.163.50.32 | 8.138.133.16 |
| **内网 IP** | 192.168.0.13 | 192.168.0.14 |
| **操作系统** | CentOS 7 | CentOS 7 |
| **SSH 端口** | 22 | 22 |
| **SSH 用户** | root | root |
| **SSH 密码** | [CREDENTIAL:ecs-password] | [CREDENTIAL:ecs-password] |
| **Docker** | 26.1.4 + Compose v2.27.1 | 26.1.4 + Compose v2.27.1 |
| **部署状态** | Running (HTTP mode) | Running |

### 1.2 安全组规则

| 方向 | ECS-1 | ECS-2 |
|------|-------|-------|
| **入方向** | 80/tcp (0.0.0.0/0), 443/tcp (0.0.0.0/0), 22/tcp (办公IP) | 1337/tcp (192.168.0.13), 22/tcp (ECS-1内网IP) |
| **出方向** | 全部放行 | 全部放行 |
| **内网互通** | ↔ ECS-2 全端口 (192.168.0.0/24) | ↔ ECS-1 全端口 |

> **注意**: ECS-2 的 1337 端口当前对公网开放，建议后续通过安全组限制为仅 ECS-1 内网 IP 可访问。

---

## 二、域名与 DNS

| 项目 | 值 |
|------|-----|
| **主域名** | xhmxb.com |
| **DNS 托管** | [TODO - 阿里云 DNS / CloudFlare?] |
| **A 记录** | xhmxb.com → 8.163.50.32 |
| **A 记录** | www.xhmxb.com → 8.163.50.32 |
| **ICP 备案号** | [TODO] |
| **备案主体** | [TODO - 需确认是否需变更] |
| **当前状态** | 域名未配置，使用 http://8.163.50.32 直接访问 |

### SSL 证书

| 项目 | 值 |
|------|-----|
| **方案** | [TODO - 阿里云免费证书 / Let's Encrypt] |
| **证书路径 (ECS-1)** | /opt/xhkj/deploy/nginx/ssl/xhmxb.com.pem |
| **私钥路径 (ECS-1)** | /opt/xhkj/deploy/nginx/ssl/xhmxb.com.key |
| **自动续签** | [TODO] |

---

## 三、数据库

| 项目 | 值 |
|------|-----|
| **类型** | PostgreSQL 16 (Alpine) |
| **部署位置** | ECS-2 Docker 容器 (deploy-postgres-1) |
| **端口** | 5432 (仅 127.0.0.1) |
| **数据库名** | xinghui_cms |
| **用户名** | xinghui |
| **密码** | [CREDENTIAL:pg-password] → 见 ECS-2 /opt/xhkj/deploy/.env.ecs2 |
| **数据卷** | Docker volume: deploy_pgdata |
| **备份路径** | /opt/backups/postgres/ |
| **备份策略** | 每日 03:00 全量备份，保留 30 天 |

---

## 四、缓存

| 项目 | 值 |
|------|-----|
| **类型** | Redis 7 (Alpine) |
| **部署位置** | ECS-2 Docker 容器 (deploy-redis-1) |
| **端口** | 6379 (仅 127.0.0.1) |
| **密码** | [CREDENTIAL:redis-password] → 见 ECS-2 /opt/xhkj/deploy/.env.ecs2 |
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
| **IP 白名单** | 8.163.50.32 |
| **管理后台** | https://mp.weixin.qq.com |

---

## 七、代码仓库

| 项目 | 值 |
|------|-----|
| **平台** | GitHub |
| **仓库地址** | https://github.com/lnO4X/XHKJ |
| **默认分支** | main |
| **部署分支** | main (生产) |
| **CI/CD** | GitHub Actions (`.github/workflows/deploy.yml`) |
| **Secrets** | `ECS_SSH_PASSWORD` — 两台 ECS 的 SSH 密码 |

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

### xinghui-cms/.env (ECS-2: /opt/xhkj/deploy/.env.ecs2)

```bash
# 服务器
HOST=0.0.0.0
PORT=1337

# Strapi 密钥 (已自动生成)
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

### xinghui-web/.env (ECS-1: /opt/xhkj/deploy/.env.ecs1)

```bash
# Strapi API 地址
STRAPI_URL=                  # 本地: http://localhost:1337 / 生产: http://192.168.0.14:1337
SITE_URL=                    # 本地: http://localhost:3000 / 生产: http://8.163.50.32
NUXT_PUBLIC_STRAPI_URL=      # 本地: http://localhost:1337 / 生产: http://8.163.50.32

# 微信 (可选，用于分享)
WECHAT_APP_ID=               # [TODO]
WECHAT_APP_SECRET=           # [CREDENTIAL:wechat-app-secret]
```
