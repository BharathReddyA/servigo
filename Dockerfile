# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the entire application code into the container
COPY . .

# Expose the port your application is listening on (assuming it's 3000)
EXPOSE 3000

# Specify the command to run your application
CMD ["npm", "start"]
