# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/packages/backend
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies after build
WORKDIR /app
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 3001

# Start the application
WORKDIR /app/packages/backend
CMD ["npm", "start"]
