# Multi-stage Docker build for Homelab API Key Manager
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code and build
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=6644

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled backend and frontend from builder
COPY --from=builder /app/dist ./dist

# Create persistent storage directory and set non-root ownership
RUN mkdir -p /app/data && chown -R node:node /app

USER node
 
EXPOSE 6644
VOLUME ["/app/data"]

CMD ["node", "dist/server.js"]
