# Import node version
FROM node:19-alpine as builder
# Set working directory
WORKDIR /app
# Copy package jsons
COPY package.json .
COPY package-lock.json .
# Install dependencies
RUN npm install
# Add app
COPY . .
# Build app
RUN npm build
# Expose the port I run the app on
EXPOSE 3000
# Start app
CMD ["npm", "start"]