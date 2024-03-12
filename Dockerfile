# Use the official Node.js 18 Alpine base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the TypeScript source code
COPY . .

# Run TypeScript compilation
RUN npm run build

# Move to the TypeScript compilation output directory
WORKDIR /usr/src/app/builds

# Make your script executable
RUN chmod +x fetcher.js

# Define the command to run your application
ENTRYPOINT ["node", "fetcher.js"]