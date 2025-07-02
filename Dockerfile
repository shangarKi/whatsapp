# ──────────────────────────────────────────────
# 1. Base image: Node 20 on Debian 12 (bookworm)
# ──────────────────────────────────────────────
FROM node:20-slim

# ──────────────────────────────────────────────
# 2. Install system Chromium + minimal deps
#    (~90 MB; avoids 170 MB Puppeteer download)
# ──────────────────────────────────────────────
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      chromium \
      ca-certificates \
      fonts-liberation \
      libnss3 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libgbm1 \
      libpangocairo-1.0-0 \
      libpango-1.0-0 \
      libasound2 \
      libxss1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ──────────────────────────────────────────────
# 3. Environment variables
# ──────────────────────────────────────────────
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    CHROMIUM_PATH=/usr/bin/chromium \
    NODE_ENV=production

# ──────────────────────────────────────────────
# 4. Create app directory & copy dependency manifests
#    (Separate layer ⇒ better Docker cache)
# ──────────────────────────────────────────────
WORKDIR /app

# ⬇️ COPY BOTH FILES EXPLICITLY — fixes npm ci error
COPY package.json package-lock.json ./

# Install only prod deps (fast, reproducible)
RUN npm ci --omit=dev --no-audit --no-fund

# ──────────────────────────────────────────────
# 5. Copy the rest of the source code
# ──────────────────────────────────────────────
COPY . .

# ──────────────────────────────────────────────
# 6. Optional health‑check port (match Express)
# ──────────────────────────────────────────────
EXPOSE 3000


# ──────────────────────────────────────────────
# 7. Start the WhatsApp bot
# ──────────────────────────────────────────────
CMD ["node", "index.js"]
