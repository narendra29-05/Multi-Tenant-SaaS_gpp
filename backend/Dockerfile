FROM node:18-alpine

# Use the same directory as defined in volumes
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the backend port
EXPOSE 5000

# Default command (overridden in docker-compose for dev)
CMD ["npm", "start"]