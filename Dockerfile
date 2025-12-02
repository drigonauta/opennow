# Use Node.js 18 Alpine as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code

COPY . .

# Build frontend
RUN npm run build

# Debug: Check file content
RUN echo "DEBUG: Checking src/lib/firebase.ts in Docker..." && \
    cat src/lib/firebase.ts | grep "apiKey"



# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Start server
CMD ["node", "server/index.js"]
