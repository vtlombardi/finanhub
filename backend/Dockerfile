# TARGET: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# TARGET: Development (bind mounts via docker-compose)
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# TARGET: Builder (compila TypeScript -> JavaScript)
FROM base AS builder
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# TARGET: Production (imutável, sem fontes cruas)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
