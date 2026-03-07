#!/bin/bash
# Deploy/update ECS-2 (Data server)
set -e

cd /opt/xhkj

echo "=== 拉取最新代码 ==="
git pull origin main

echo "=== 重建并重启数据服务 ==="
cd deploy
docker compose -f docker-compose.ecs2.yml up -d --build

echo "=== 查看状态 ==="
docker compose -f docker-compose.ecs2.yml ps
echo "=== 部署完成 ==="
