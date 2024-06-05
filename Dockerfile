# Import node version
FROM node:14
# Set working directory
WORKDIR /usr/src/app
# Copy package jsons
COPY package.json .
COPY package-lock.json .
# Install dependencies
RUN npm install
# Add app
COPY . .
# Build app
RUN npm run build
# Expose the port the app runs on
EXPOSE 3000
# Command to run the app
CMD ["npm", "start"]