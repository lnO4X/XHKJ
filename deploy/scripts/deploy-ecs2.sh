#!/bin/bash
# Deploy/update ECS-2 (Data server)
set -e

cd /opt/xhkj

echo "=== Pull latest code ==="
git pull origin main

echo "=== Rebuild and restart data services ==="
cd deploy
docker compose --env-file .env.ecs2 -f docker-compose.ecs2.yml up -d --build

echo "=== Status ==="
docker compose --env-file .env.ecs2 -f docker-compose.ecs2.yml ps
echo "=== ECS-2 deploy complete ==="
