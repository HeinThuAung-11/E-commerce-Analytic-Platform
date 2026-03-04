FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx prisma generate --schema src/prisma/schema.prisma
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema src/prisma/schema.prisma && node dist/server.js"]
