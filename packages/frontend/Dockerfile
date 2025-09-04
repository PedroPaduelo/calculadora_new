FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json turbo.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/frontend ./packages/frontend
COPY packages/shared ./packages/shared

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build frontend
WORKDIR /app/packages/frontend
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
