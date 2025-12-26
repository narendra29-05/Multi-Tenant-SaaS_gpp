# Use Node image to build the app
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# For development purposes in this project
EXPOSE 3000
CMD ["npm", "start"]