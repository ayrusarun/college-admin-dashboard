# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Verify next is installed
RUN ls -la node_modules/next/package.json

# Copy all source files
COPY . .

# Build the application with explicit directory
RUN cd /app && NODE_ENV=production npx --yes next@16.1.0 build

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
