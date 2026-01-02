#!/bin/bash

# Setup cron job for automatic updates
# This will check for updates every 5 minutes

PROJECT_DIR=$(pwd)
CRON_JOB="*/5 * * * * cd $PROJECT_DIR && ./auto-update.sh >> auto-update.log 2>&1"

echo "Setting up cron job for auto-updates..."
echo "Project directory: $PROJECT_DIR"
echo "Cron job: $CRON_JOB"

# Add to crontab
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo "📋 Current crontab:"
crontab -l

echo ""
echo "📝 To remove the cron job later, run:"
echo "   crontab -e"
echo "   (then delete the line with auto-update.sh)"

echo ""
echo "📊 To monitor auto-update activity:"
echo "   tail -f auto-update.log"