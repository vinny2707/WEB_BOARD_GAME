# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY .env.production* ./
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Install envsubst
RUN apk add --no-cache gettext

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Expose port
EXPOSE 80

# Set default PORT and substitute in nginx config, then start
ENTRYPOINT []
CMD ["sh", "-c", "export PORT=${PORT:-80} && envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
