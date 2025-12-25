FROM node:18-alpine

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

COPY package*.json ./

# This will now build bcrypt for Linux/Alpine specifically
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]