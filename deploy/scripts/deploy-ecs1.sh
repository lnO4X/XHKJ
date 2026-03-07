#!/bin/bash
# Deploy/update ECS-1 (Web server)
set -e

cd /opt/xhkj

echo "=== 拉取最新代码 ==="
git pull origin main

echo "=== 重建并重启 Web 服务 ==="
cd deploy
docker compose -f docker-compose.ecs1.yml up -d --build

echo "=== 查看状态 ==="
docker compose -f docker-compose.ecs1.yml ps
echo "=== 部署完成 ==="
