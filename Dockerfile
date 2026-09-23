# ==============================================================================
# Affitti Milano - Production Dockerfile for Hostinger VPS
# Multi-stage optimized build: minimal footprint (<150MB), non-root security
# ==============================================================================

# Stage 1: Build Frontend (Vite) and Backend (Express bundle)
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and configurations
COPY . .

# Build Vite client to dist/ and bundle server.ts to dist/server.cjs
ENV NODE_ENV=production
RUN npm run build

# ==============================================================================
# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl/wget for healthchecks
RUN apk add --no-cache curl wget

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
COPY --from=builder /app/firebase-blueprint.json ./firebase-blueprint.json

# Create directory for logs if needed and set ownership to node user
RUN mkdir -p /app/logs && chown -R node:node /app

# Run as non-privileged user for security
USER node

EXPOSE 3000

# Docker healthcheck querying the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]
