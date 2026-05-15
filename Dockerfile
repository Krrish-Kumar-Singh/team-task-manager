FROM node:22-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

# Railway sets PORT at runtime (usually 8080). Do not set PORT in Railway variables.
CMD ["npm", "start"]
