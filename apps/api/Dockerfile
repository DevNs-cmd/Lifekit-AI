# ==========================================
# Stage 1: Build & Compile TypeScript
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy codebase
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Compile NestJS code
RUN npm run build

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built distribution and Prisma configurations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client in production environment
RUN npx prisma generate

EXPOSE 4000

# Set up healthy status checks via Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/live').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
