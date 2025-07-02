# Base image
FROM node:20-slim

# Install system Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Environment vars
ENV CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_DOWNLOAD=true \
    NODE_ENV=production

# App setup
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy rest of the app
COPY . .

# Expose Express port if needed
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
