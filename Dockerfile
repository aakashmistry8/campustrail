# Multi-stage build for CampusTrail
FROM node:18-alpine AS backend-builder

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./
RUN npm run build

# Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Set production API URL - can be overridden by environment variable
ENV VITE_API_BASE=/api
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create a simple server to serve both frontend and backend
COPY deploy/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]