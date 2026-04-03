# Dockerfile Base Multi-Stage para produção Enterprise

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Instala infra de workspaces global caso exista
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# RUN npm run build (aplicando command de sub-workspace no futuro)

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 start_user
USER start_user

# Expor porta abstrata
EXPOSE 3000
CMD ["npm", "start"]
