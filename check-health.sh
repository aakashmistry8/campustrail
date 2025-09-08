#!/bin/bash

# Health check script for CampusTrail deployment
# Usage: ./check-health.sh [url]

URL=${1:-http://localhost:3000}

echo "🩺 Checking CampusTrail health at $URL..."

# Check frontend
echo "📱 Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is healthy (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend is not responding (HTTP $FRONTEND_STATUS)"
fi

# Check backend health endpoint
echo "🔧 Testing backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/health" || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is healthy (HTTP $BACKEND_STATUS)"
    HEALTH_RESPONSE=$(curl -s "$URL/health" 2>/dev/null || echo "{}")
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend is not responding (HTTP $BACKEND_STATUS)"
fi

# Overall status
if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    echo "🎉 CampusTrail is fully operational!"
    exit 0
else
    echo "⚠️  Some services are not healthy"
    exit 1
fi