# TARGET: Base Dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./

# TARGET: Development (Mapeado via Bind Mounts locais)
FROM base AS development
# Instala pacote base completo incluindo devDependencies essenciais
RUN npm install
# O package.json do frontend já possui "scripts": { "dev": "next dev" }
# O comando será executado injetado via docker-compose (command: npm run dev)
CMD ["npm", "run", "dev"]

# TARGET: Builder (Para compilar App Fechado)
FROM base AS builder
RUN npm install
COPY . .
# Caso tenha prisma gerado dentro de dependencias locais do Next, chame-o
RUN npm run build 

# TARGET: Production (Imutável, Sem fontes cruas)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
