---
id: DEPLOY
title: 部署方案
version: 1.0.0
updated: 2026-03-05
status: draft
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
                     ┌──────▼───────┐
                     │   ECS-1      │
                     │   4C8G       │
                     │              │
                     │  Nginx :443  │ ← SSL 终止
                     │      │       │
                     │  Nuxt :3000  │ ← SSR 渲染
                     └──────┬───────┘
                            │ 内网
                     ┌──────▼───────┐
                     │   ECS-2      │
                     │   4C8G       │
                     │              │
                     │ Strapi :1337 │ ← CMS API
                     │ PG     :5432 │ ← 数据库
                     │ Redis  :6379 │ ← 缓存
                     └──────────────┘
```

### 职责分离

| 服务器 | 角色 | 公网 | 理由 |
|--------|------|------|------|
| ECS-1 | Web 网关 + SSR | ✅ 开放 80/443 | 承受公网流量 |
| ECS-2 | 数据 + CMS | ❌ 仅内网 | 数据库安全隔离 |

---

## 二、ECS-1 部署

### 2.1 目录结构

```
/opt/xhkj/
├── xinghui-web/          # Nuxt 应用代码
│   └── Dockerfile
├── nginx/
│   ├── conf.d/
│   │   └── xhmxb.conf
│   └── ssl/
│       ├── xhmxb.com.pem
│       └── xhmxb.com.key
├── docker-compose.yml
└── .env
```

### 2.2 docker-compose.yml

```yaml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - nuxt
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  nuxt:
    build: ./xinghui-web
    env_file: .env
    expose:
      - "3000"
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 2.3 Nuxt Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.output .output
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 2.4 Nginx 配置

```nginx
# /opt/xhkj/nginx/conf.d/xhmxb.conf

upstream nuxt {
    server nuxt:3000;
}

upstream strapi {
    server <ECS-2-内网IP>:1337;   # → 见 ENV.md
}

server {
    listen 80;
    server_name xhmxb.com www.xhmxb.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name xhmxb.com www.xhmxb.com;

    # SSL
    ssl_certificate     /etc/nginx/ssl/xhmxb.com.pem;
    ssl_certificate_key /etc/nginx/ssl/xhmxb.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Strapi API 代理
    location /api/ {
        proxy_pass http://strapi;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Strapi 文件上传
    location /uploads/ {
        proxy_pass http://strapi;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Strapi Admin（限内网 IP 或办公 IP）
    location /admin {
        # allow <办公网络IP>;  # [TODO - 填入办公网络 IP]
        # deny all;
        proxy_pass http://strapi;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Nuxt SSR（兜底）
    location / {
        proxy_pass http://nuxt;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态资源长缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        proxy_pass http://nuxt;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 三、ECS-2 部署

### 3.1 目录结构

```
/opt/xhkj/
├── xinghui-cms/          # Strapi 应用代码
│   └── Dockerfile
├── backups/
│   └── postgres/
├── docker-compose.yml
└── .env
```

### 3.2 docker-compose.yml

```yaml
version: "3.8"
services:
  strapi:
    build: ./xinghui-cms
    env_file: .env
    volumes:
      - uploads:/app/public/uploads
    ports:
      - "1337:1337"    # 仅内网可访问（安全组控制）
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  postgres:
    image: postgres:16-alpine
    env_file: .env
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"    # 仅本机
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    ports:
      - "127.0.0.1:6379:6379"    # 仅本机
    restart: always

volumes:
  pgdata:
  redisdata:
  uploads:
```

### 3.3 Strapi Dockerfile

```dockerfile
FROM node:22-alpine AS builder
RUN apk add --no-cache build-base python3
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
```

### 3.4 .env.example

```bash
# Strapi
HOST=0.0.0.0
PORT=1337
APP_KEYS=<openssl rand -base64 32>,<openssl rand -base64 32>
API_TOKEN_SALT=<openssl rand -base64 32>
ADMIN_JWT_SECRET=<openssl rand -base64 32>
JWT_SECRET=<openssl rand -base64 32>
TRANSFER_TOKEN_SALT=<openssl rand -base64 32>

# PostgreSQL
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=xinghui_cms
DATABASE_USERNAME=xinghui
DATABASE_PASSWORD=<生成强密码>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<生成强密码>

# SMTP
SMTP_HOST=[TODO]
SMTP_PORT=[TODO]
SMTP_USER=[TODO]
SMTP_PASS=[TODO]
```

---

## 四、服务器初始化脚本

```bash
#!/bin/bash
# deploy/scripts/init-server.sh
# 在两台 ECS 上都执行

set -e

echo "=== 更新系统 ==="
apt update && apt upgrade -y

echo "=== 安装 Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "=== 安装 Docker Compose ==="
apt install docker-compose-plugin -y

echo "=== 安装常用工具 ==="
apt install -y git curl vim htop

echo "=== 创建项目目录 ==="
mkdir -p /opt/xhkj
mkdir -p /opt/backups/postgres

echo "=== 配置 Docker 日志轮转 ==="
cat > /etc/docker/daemon.json << 'DAEMON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
DAEMON
systemctl restart docker

echo "=== 初始化完成 ==="
docker --version
docker compose version
```

---

## 五、备份策略

### 5.1 PostgreSQL 每日备份

```bash
#!/bin/bash
# deploy/scripts/backup-pg.sh
# crontab: 0 3 * * * /opt/xhkj/backup-pg.sh

BACKUP_DIR=/opt/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER=xhkj-postgres-1

echo "[$(date)] 开始备份..."
docker exec $CONTAINER pg_dump -U xinghui xinghui_cms | gzip > "$BACKUP_DIR/xinghui_cms_$DATE.sql.gz"

# 保留 30 天
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] 备份完成: xinghui_cms_$DATE.sql.gz"
```

### 5.2 上传文件备份

```bash
# Strapi uploads 挂载在 Docker volume，可用 docker cp 或直接备份 volume 目录
# 建议后续迁移到阿里云 OSS，自带冗余存储
```

---

## 六、部署流程

### 6.1 首次部署

```bash
# 1. 两台 ECS 执行初始化
scp deploy/scripts/init-server.sh root@<ECS-IP>:/tmp/
ssh root@<ECS-IP> "bash /tmp/init-server.sh"

# 2. 克隆代码
ssh root@<ECS-IP>
cd /opt/xhkj
git clone https://github.com/lnO4X/XHKJ.git .

# 3. ECS-2: 配置并启动数据服务
cd /opt/xhkj
cp .env.example .env
vim .env  # 填入密码和配置
docker compose up -d
# 等待 Strapi 首次启动完成（约 1-2 分钟）

# 4. ECS-1: 配置并启动 Web 服务
cd /opt/xhkj
cp .env.example .env
vim .env  # 填入 ECS-2 内网 IP 和 Strapi URL
# 将 SSL 证书放到 nginx/ssl/
docker compose up -d

# 5. 验证
curl -I https://xhmxb.com
```

### 6.2 更新部署

```bash
# 拉取最新代码
cd /opt/xhkj && git pull origin main

# 重建并重启（零停机）
docker compose up -d --build

# 验证
docker compose ps
docker compose logs --tail=50
```

---

## 七、监控 & 运维

| 项目 | 方案 |
|------|------|
| 进程监控 | Docker restart: always |
| 日志查看 | `docker compose logs -f [service]` |
| 磁盘监控 | `df -h` + 阿里云监控告警 |
| 数据库状态 | `docker exec postgres pg_isready` |
| SSL 证书到期 | [TODO - 自动续签或阿里云告警] |
