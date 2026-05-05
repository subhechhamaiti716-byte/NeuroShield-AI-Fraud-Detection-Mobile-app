# Use Node.js as the base image
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the mobile code
COPY . .

# Expose Expo web port
EXPOSE 19006

# Command will be overridden by docker-compose
CMD ["npx", "expo", "start", "--web"]
