#!/bin/bash

# Quick start script for CampusTrail development
# Usage: ./start.sh [frontend|backend|all|docker]

set -e

MODE=${1:-all}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting CampusTrail in $MODE mode..."

case $MODE in
  "frontend")
    echo "📱 Starting frontend only..."
    cd "$ROOT_DIR/frontend"
    npm run dev
    ;;
    
  "backend")
    echo "🔧 Starting backend only..."
    cd "$ROOT_DIR/backend"
    npm run dev
    ;;
    
  "docker")
    echo "🐳 Starting with Docker..."
    cd "$ROOT_DIR"
    docker-compose up --build
    ;;
    
  "all"|*)
    echo "🔄 Starting both frontend and backend..."
    echo "Installing dependencies..."
    cd "$ROOT_DIR/frontend" && npm install
    cd "$ROOT_DIR/backend" && npm install
    
    echo "Building backend..."
    cd "$ROOT_DIR/backend" && npm run build
    
    echo "Starting backend..."
    cd "$ROOT_DIR/backend" && npm run start &
    BACKEND_PID=$!
    
    echo "Waiting for backend to start..."
    sleep 3
    
    echo "Starting frontend..."
    cd "$ROOT_DIR/frontend" && npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ CampusTrail is starting up!"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend:  http://localhost:4000"
    echo "🩺 Health:   http://localhost:4000/health"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for interrupt
    trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
    ;;
esac