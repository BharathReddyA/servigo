# Use the official Node.js image as the base image
FROM node:18-alpine
# ENV NODE_ENV = production

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./
COPY package-lock*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for the Node.js server
EXPOSE 3000

# Set environment variables for the database connection
ENV DB_HOST=localhost DB_PORT=3306 DB_USER=admin DB_PASSWORD=admin123 DB_NAME=servicedb

# Start the Node.js server
CMD node server.js
