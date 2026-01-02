#!/bin/bash

# Auto-update script for CV Paraphrasing Platform
# This script pulls the latest changes from Git and restarts services

set -e

echo "🔄 Starting auto-update process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a Git repository. Please run this script from the project root."
    exit 1
fi

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Fetch latest changes
print_status "Fetching latest changes from remote..."
git fetch origin

# Check if there are updates
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$CURRENT_BRANCH)

if [ "$LOCAL" = "$REMOTE" ]; then
    print_success "Already up to date!"
    exit 0
fi

print_status "New changes detected. Updating..."

# Stash any local changes
if ! git diff-index --quiet HEAD --; then
    print_warning "Stashing local changes..."
    git stash push -m "Auto-stash before update $(date)"
fi

# Pull latest changes
print_status "Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Check if backend files changed
BACKEND_CHANGED=false
FRONTEND_CHANGED=false

# Get list of changed files
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)

if echo "$CHANGED_FILES" | grep -q "^backend/"; then
    BACKEND_CHANGED=true
    print_status "Backend changes detected"
fi

if echo "$CHANGED_FILES" | grep -q "^frontend/"; then
    FRONTEND_CHANGED=true
    print_status "Frontend changes detected"
fi

# Function to restart backend
restart_backend() {
    print_status "Restarting backend..."
    
    # Kill existing backend processes
    pkill -f "python.*main_simple.py" || true
    sleep 2
    
    # Install/update dependencies if requirements.txt changed
    if echo "$CHANGED_FILES" | grep -q "backend/requirements"; then
        print_status "Installing backend dependencies..."
        cd backend
        pip3 install -r requirements.txt
        cd ..
    fi
    
    # Start backend
    cd backend
    nohup python3 app/main_simple.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    print_success "Backend restarted (PID: $BACKEND_PID)"
}

# Function to restart frontend
restart_frontend() {
    print_status "Restarting frontend..."
    
    # Kill existing frontend processes
    pkill -f "vite.*dev" || true
    sleep 2
    
    # Install/update dependencies if package.json changed
    if echo "$CHANGED_FILES" | grep -q "frontend/package"; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    # Start frontend
    cd frontend
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Frontend restarted (PID: $FRONTEND_PID)"
}

# Restart services based on what changed
if [ "$BACKEND_CHANGED" = true ]; then
    restart_backend
fi

if [ "$FRONTEND_CHANGED" = true ]; then
    restart_frontend
fi

# If no specific changes detected, restart both (safer)
if [ "$BACKEND_CHANGED" = false ] && [ "$FRONTEND_CHANGED" = false ]; then
    print_warning "No specific backend/frontend changes detected. Restarting both services..."
    restart_backend
    restart_frontend
fi

print_success "Auto-update completed successfully!"
print_status "Backend log: backend.log"
print_status "Frontend log: frontend.log"

# Show running processes
print_status "Running processes:"
ps aux | grep -E "(python.*main_simple|vite.*dev)" | grep -v grep || print_warning "No processes found"