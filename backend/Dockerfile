# TARGET: Base Dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# TARGET: Development (Para Bind Mount locale Hot-Reload NestJS)
FROM base AS development
# Instalamos as tools completas inclusive CLI do Prisma/Nest
RUN npm install
# Na ausência de mapeamento as dependências estarão disponíveis
CMD ["npm", "run", "start:dev"]

# TARGET: Builder (Montagem da Dist Node C/ Prisma)
FROM base AS builder
RUN npm install
COPY . .
# Precisamos assumir que o prisma schema pode ou não estar na raiz, 
# se gerado globalmente, deve estar no workspace. 
# RUN npx prisma generate
RUN npm run build

# TARGET: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
