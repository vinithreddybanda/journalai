# Use official Node.js image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Start the app (change if your app uses a different start command)
CMD ["npm", "start"]
