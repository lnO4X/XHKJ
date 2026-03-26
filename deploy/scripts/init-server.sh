#!/bin/bash
# Server initialization — CentOS 7
# Run on both ECS servers
set -e

echo "=== [1/5] Install base tools ==="
yum install -y yum-utils git curl vim

echo "=== [2/5] Install Docker CE ==="
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker

echo "=== [3/5] Configure Docker mirrors + log rotation ==="
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'DAEMON'
{
  "registry-mirrors": ["https://docker.m.daocloud.io", "https://mirror.ccs.tencentyun.com"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
DAEMON
systemctl restart docker

echo "=== [4/5] Create project directories ==="
mkdir -p /opt/xhkj
mkdir -p /opt/backups/postgres

echo "=== [5/5] Verify ==="
docker --version
docker compose version
git --version

echo "=== Init complete ==="
