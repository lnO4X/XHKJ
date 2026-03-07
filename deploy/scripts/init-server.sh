#!/bin/bash
# Run on both ECS servers
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
