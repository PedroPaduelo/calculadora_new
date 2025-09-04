FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json turbo.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/packages/backend
RUN npx prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build backend
WORKDIR /app/packages/backend
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
