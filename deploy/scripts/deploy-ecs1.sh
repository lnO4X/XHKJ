#!/bin/bash
# Deploy/update ECS-1 (Web server)
set -e

cd /opt/xhkj

echo "=== Pull latest code ==="
git pull origin main

echo "=== Rebuild and restart web services ==="
cd deploy
docker compose --env-file .env.ecs1 -f docker-compose.ecs1.yml up -d --build

echo "=== Status ==="
docker compose --env-file .env.ecs1 -f docker-compose.ecs1.yml ps
echo "=== ECS-1 deploy complete ==="
