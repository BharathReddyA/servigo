FROM docker.io/library/node:18-alpine

# Create an app directory
WORKDIR /app

# Copy your project code to the app directory
COPY . .

# Install dependencies
RUN npm install

# Install webpack globally
RUN npm install -g webpack

# Build the application
RUN npm run build

# Optionally, remove unnecessary dependencies
RUN rm -fr node_modules

# Expose the port your server listens on
EXPOSE 3000

# Specify the command to run your server
CMD [ "node", "server.js" ]
