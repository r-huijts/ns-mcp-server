# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy source files
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

# Install dependencies and build the project
RUN npm install --ignore-scripts && npm run build

# Stage 2: Create the production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Install only production dependencies
RUN npm ci --omit=dev

# Environment variables
ENV NS_API_KEY=your_api_key_here

# Define the command to run the application
ENTRYPOINT ["node", "build/index.js"]
