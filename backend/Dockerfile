# ==================================
# Stage 1: Dependencies
# ==================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files (ensure package-lock.json is included)
COPY package.json package-lock.json ./

# Install dependencies (production only for final image)
RUN npm ci --only=production && \
    cp -R node_modules /prod_node_modules && \
    npm ci

# ==================================
# Stage 2: Build (if needed)
# ==================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# No build step needed for this app, but keeping stage for future use

# ==================================
# Stage 3: Production
# ==================================
FROM node:20-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /prod_node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port (Railway will override with PORT env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command
CMD ["npm", "start"]
