#!/bin/bash

# Continuous Git monitoring script
# This script continuously monitors the Git repository for changes and auto-updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Configuration
CHECK_INTERVAL=30  # Check every 30 seconds
CURRENT_BRANCH=$(git branch --show-current)

print_status "Starting Git watcher for branch: $CURRENT_BRANCH"
print_status "Checking for updates every $CHECK_INTERVAL seconds"
print_status "Press Ctrl+C to stop"

# Store initial commit hash
LAST_COMMIT=$(git rev-parse HEAD)

while true; do
    # Fetch latest changes quietly
    git fetch origin >/dev/null 2>&1
    
    # Get remote commit hash
    REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH)
    
    # Check if there are new commits
    if [ "$LAST_COMMIT" != "$REMOTE_COMMIT" ]; then
        print_status "🔄 New changes detected!"
        print_status "Local:  $LAST_COMMIT"
        print_status "Remote: $REMOTE_COMMIT"
        
        # Run the auto-update script
        ./auto-update.sh
        
        # Update our tracking commit
        LAST_COMMIT=$(git rev-parse HEAD)
        
        print_success "Update completed. Resuming monitoring..."
    else
        # Silent check - only show status every 10 minutes
        CURRENT_TIME=$(date +%s)
        if [ $((CURRENT_TIME % 600)) -eq 0 ]; then
            print_status "Monitoring... (last check: $(date '+%H:%M:%S'))"
        fi
    fi
    
    sleep $CHECK_INTERVAL
done