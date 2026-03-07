#!/bin/bash
# crontab: 0 3 * * * /opt/xhkj/deploy/scripts/backup-pg.sh
set -e

BACKUP_DIR=/opt/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER=deploy-postgres-1

echo "[$(date)] 开始备份..."
docker exec $CONTAINER pg_dump -U xinghui xinghui_cms | gzip > "$BACKUP_DIR/xinghui_cms_$DATE.sql.gz"

# Keep 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] 备份完成: xinghui_cms_$DATE.sql.gz"
