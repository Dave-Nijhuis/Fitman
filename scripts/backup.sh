#!/bin/bash
# Backs up the Fitman SQLite database from the running Docker container.
# Safe to run while the app is live — uses SQLite's built-in backup API.
#
# Usage:
#   ./scripts/backup.sh
#
# Set up as a daily cron job:
#   0 3 * * * /path/to/Fitman/scripts/backup.sh >> /path/to/Fitman/backups/backup.log 2>&1

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$REPO_DIR/backups"
CONTAINER="fitman-backend-1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fitman_$TIMESTAMP.db"
KEEP_LAST=7

mkdir -p "$BACKUP_DIR"

echo "[$TIMESTAMP] Starting backup..."

# Trigger SQLite's safe online backup inside the container
docker exec "$CONTAINER" sqlite3 /app/data/fitman.db ".backup /app/data/backup_tmp.db"

# Copy the backup file out to the host
docker cp "$CONTAINER:/app/data/backup_tmp.db" "$BACKUP_DIR/$BACKUP_FILE"

# Clean up the temp file inside the container
docker exec "$CONTAINER" rm /app/data/backup_tmp.db

# Remove backups older than KEEP_LAST
ls -t "$BACKUP_DIR"/fitman_*.db 2>/dev/null | tail -n +$((KEEP_LAST + 1)) | xargs -r rm

echo "[$TIMESTAMP] Backup saved to backups/$BACKUP_FILE"
echo "[$TIMESTAMP] Kept last $KEEP_LAST backups:"
ls -lh "$BACKUP_DIR"/fitman_*.db 2>/dev/null | awk '{print "  " $NF, $5}'
