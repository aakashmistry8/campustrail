#!/bin/bash

# CampusTrail Deployment Script
# Usage: ./deploy/deploy.sh [platform]
# Platforms: docker, railway, vercel, netlify

set -e

PLATFORM=${1:-docker}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Deploying CampusTrail to $PLATFORM..."

case $PLATFORM in
  "docker")
    echo "📦 Building Docker image..."
    cd "$ROOT_DIR"
    docker build -t campustrail:latest .
    echo "✅ Docker image built successfully!"
    echo "Run with: docker run -p 3000:3000 -e DATABASE_URL=your_db_url campustrail:latest"
    ;;
    
  "railway")
    echo "🚂 Deploying to Railway..."
    cd "$ROOT_DIR"
    if ! command -v railway &> /dev/null; then
      echo "❌ Railway CLI not installed. Install with: npm install -g @railway/cli"
      exit 1
    fi
    railway up
    echo "✅ Deployed to Railway!"
    ;;
    
  "vercel")
    echo "▲ Deploying to Vercel..."
    cd "$ROOT_DIR"
    if ! command -v vercel &> /dev/null; then
      echo "❌ Vercel CLI not installed. Install with: npm install -g vercel"
      exit 1
    fi
    vercel --prod
    echo "✅ Deployed to Vercel!"
    ;;
    
  "netlify")
    echo "🌐 Deploying to Netlify..."
    cd "$ROOT_DIR/frontend"
    if ! command -v netlify &> /dev/null; then
      echo "❌ Netlify CLI not installed. Install with: npm install -g netlify-cli"
      exit 1
    fi
    npm run build
    netlify deploy --prod --dir=dist
    echo "✅ Deployed to Netlify!"
    echo "Note: Backend needs to be deployed separately for Netlify"
    ;;
    
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "Available platforms: docker, railway, vercel, netlify"
    exit 1
    ;;
esac

echo "🎉 Deployment complete!"