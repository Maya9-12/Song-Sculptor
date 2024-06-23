FROM node:19

# Create vscode user and set permissions
RUN useradd -ms /bin/bash vscode \
    && mkdir -p /home/vscode/app \
    && chown -R vscode:vscode /home/vscode

# Switch to vscode user
USER vscode

WORKDIR /home/vscode/app

# Copy package files and install dependencies
COPY --chown=vscode:vscode package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY --chown=vscode:vscode . .

# Command to run the application
CMD ["npm", "start"]
