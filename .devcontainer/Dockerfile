# Use an official Node.js image as the base
FROM node:16

# Create a directory for the app
WORKDIR /workspaces/Song-Sculptor

# Copy package.json and package-lock.json
COPY ../package*.json ./

# Install app dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY ../ .

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
