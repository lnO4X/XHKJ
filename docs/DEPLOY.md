---
id: DEPLOY
title: 部署方案
version: 2.0.0
updated: 2026-03-20
status: active
owner: Eason
depends_on: [ENV, TECH]
---

# 部署方案 — 薪汇科技官网

> Docker 编排、Nginx 配置、服务器初始化、备份策略、CI/CD。
> 服务器信息 → 见 [ENV.md](./ENV.md) | 技术细节 → 见 [TECH.md](./TECH.md)

---

## 一、架构总览

```
                     ┌──────────────┐
                     │   CDN / DNS  │
                     │  xhmxb.com   │
                     └──────┬───────┘
                            │
                     ┌──────▼───────────────┐
                     │   ECS-1              │
                     │   8.163.50.32        │
                     │   4C8G CentOS 7      │
                     │                      │
                     │  Nginx :80/:443      │ ← SSL 终止
                     │      │               │
                     │  Nuxt :3000          │ ← SSR 渲染
                     └──────┬───────────────┘
                            │ 内网 192.168.0.x
                     ┌──────▼───────────────┐
                     │   ECS-2              │
                     │   8.138.133.16       │
                     │   4C8G CentOS 7      │
                     │                      │
                     │ Strapi :1337         │ ← CMS API
                     │ PG     :5432         │ ← 数据库
                     │ Redis  :6379         │ ← 缓存
                     └──────────────────────┘
```

### 职责分离

| 服务器 | 角色 | 公网 | 理由 |
|--------|------|------|------|
| ECS-1 (192.168.0.13) | Web 网关 + SSR | ✅ 开放 80/443 | 承受公网流量 |
| ECS-2 (192.168.0.14) | 数据 + CMS | ⚠️ 待限制 | 数据库安全隔离 |

---

## 二、服务器初始化

> 已于 2026-03-20 完成初始化。以下记录操作步骤供参考。

### 2.1 初始化脚本 (CentOS 7)

```bash
# 在两台 ECS 上都执行 (实际脚本: deploy/scripts/init-server.sh)
bash /opt/xhkj/deploy/scripts/init-server.sh
```

安装内容: Docker CE 26.1.4 + Compose v2.27.1 + git + 项目目录

### 2.2 Docker 镜像加速

由于 Docker Hub 在中国不可直接访问，需配置镜像加速：

```json
// /etc/docker/daemon.json (已配置)
{
  "registry-mirrors": ["https://docker.m.daocloud.io", "https://mirror.ccs.tencentyun.com"]
}
```

**首次拉取基础镜像**需手动 tag：
```bash
docker pull docker.m.daocloud.io/library/node:22-alpine
docker tag docker.m.daocloud.io/library/node:22-alpine node:22-alpine
# postgres, redis, nginx 同理
```

### 2.3 Dockerfile 中国镜像

所有 Dockerfile 必须添加 Alpine 和 npm 镜像加速：
```dockerfile
# Alpine 包
RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories
# npm 包
RUN npm install --registry=https://registry.npmmirror.com
```

---

## 三、ECS-2 部署 (数据服务)

### 3.1 目录结构

```
/opt/xhkj/                   # git clone from GitHub
├── deploy/
│   ├── docker-compose.ecs2.yml
│   ├── .env.ecs2             # 生产环境变量 (不入 git)
│   └── scripts/
│       └── backup-pg.sh
├── xinghui-cms/              # Strapi 源码
│   └── Dockerfile
└── ...
```

### 3.2 启动命令

```bash
cd /opt/xhkj/deploy
docker compose --env-file .env.ecs2 -f docker-compose.ecs2.yml up -d --build
```

### 3.3 容器状态

| 容器 | 镜像 | 端口 | 状态 |
|------|------|------|------|
| deploy-strapi-1 | deploy-strapi | 0.0.0.0:1337 | Running |
| deploy-postgres-1 | postgres:16-alpine | 127.0.0.1:5432 | Running (healthy) |
| deploy-redis-1 | redis:7-alpine | 127.0.0.1:6379 | Running |

### 3.4 重要: Strapi config 文件格式

生产环境 Strapi v5 不支持 TypeScript config 文件。所有 `config/*.ts` 已转换为 `config/*.js` (CommonJS `module.exports`)。

---

## 四、ECS-1 部署 (Web 网关)

### 4.1 目录结构

```
/opt/xhkj/
├── deploy/
│   ├── docker-compose.ecs1.yml
│   ├── .env.ecs1
│   └── nginx/
│       └── conf.d/
│           └── xhmxb.conf
├── xinghui-web/
│   └── Dockerfile
└── ...
```

### 4.2 启动命令

```bash
cd /opt/xhkj/deploy
docker compose --env-file .env.ecs1 -f docker-compose.ecs1.yml up -d --build
```

### 4.3 容器状态

| 容器 | 镜像 | 端口 | 状态 |
|------|------|------|------|
| deploy-nginx-1 | nginx:alpine | 80, 443 | Running |
| deploy-nuxt-1 | deploy-nuxt | 3000 (internal) | Running |

### 4.4 Nginx 配置

当前: HTTP 模式 (`server_name _`)，无 SSL。
域名就绪后: 取消注释 `xhmxb.conf` 中的 HTTPS 配置块，上传 SSL 证书到 `nginx/ssl/`。

---

## 五、CI/CD

### 5.1 GitHub Actions

文件: `.github/workflows/deploy.yml`

**触发条件:**
- `push` to `main` 分支 (自动检测变更路径)
- `workflow_dispatch` 手动触发 (可选 all/ecs1/ecs2)

**流程:**
1. 检测变更 (xinghui-cms/ → deploy ECS-2, xinghui-web/ → deploy ECS-1)
2. SSH 到对应 ECS 执行 `git pull` + `docker compose up -d --build`
3. 健康检查

**配置 GitHub Secrets:**
```
ECS_SSH_PASSWORD = <两台 ECS 的 SSH 密码>
```

### 5.2 手动部署

```bash
# ECS-2
ssh root@8.138.133.16
cd /opt/xhkj && git pull origin main
cd deploy && docker compose --env-file .env.ecs2 -f docker-compose.ecs2.yml up -d --build

# ECS-1
ssh root@8.163.50.32
cd /opt/xhkj && git pull origin main
cd deploy && docker compose --env-file .env.ecs1 -f docker-compose.ecs1.yml up -d --build
```

---

## 六、备份策略

### 6.1 PostgreSQL 每日备份

```bash
# crontab -l (ECS-2)
0 3 * * * /bin/bash /opt/xhkj/deploy/scripts/backup-pg.sh >> /opt/backups/postgres/backup.log 2>&1
```

脚本: `deploy/scripts/backup-pg.sh` — 使用 `docker exec deploy-postgres-1 pg_dump` 备份，gzip 压缩，保留 30 天。

---

## 七、访问地址

| 服务 | URL | 说明 |
|------|-----|------|
| 前台首页 | http://8.163.50.32/ | Nuxt SSR |
| CMS 管理后台 | http://8.163.50.32/admin/ | Strapi Admin (首次需创建管理员) |
| Strapi API | http://8.163.50.32/api/ | 需配置 Public 权限 |

---

## 八、待办 (域名相关)

- [ ] 配置域名 DNS A 记录 → 8.163.50.32
- [ ] ICP 备案
- [ ] 申请 SSL 证书
- [ ] 更新 nginx 配置为 HTTPS 模式
- [ ] 更新 .env.ecs1 中 SITE_URL 和 NUXT_PUBLIC_STRAPI_URL
- [ ] 配置安全组: 限制 ECS-2 仅允许 ECS-1 内网 IP 访问
