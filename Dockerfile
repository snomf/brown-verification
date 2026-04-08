FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy bot code and necessary libs
COPY bot.js register-commands.js .env.example ./
COPY lib/ ./lib/

# The bot doesn't need to expose ports, but we'll include it if needed
# EXPOSE 3000

# Start the bot
CMD [ "node", "bot.js" ]
