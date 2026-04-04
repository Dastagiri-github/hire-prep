# Use a very lightweight Alpine Linux base image to minimize cold start times
FROM node:18-alpine

# Install ONLY the necessary compilers and runtimes for code execution
RUN apk add --no-cache \
    g++ \
    python3 \
    openjdk11 \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# Copy package definitions
COPY package.json ./

# Install dependencies without generating or relying on lock files
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Cloud Run expects the app to listen on PORT 8080
ENV PORT=8080
EXPOSE 8080

# Run the container
CMD [ "node", "index.js" ]
