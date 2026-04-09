# FINANHUB - Enterprise Monorepo

## Quick Start: Execução Isolada por Módulo

Para garantir o desacoplamento enterprise, cada módulo pode ser desenvolvido e testado de forma independente.

### 1. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- **Nota**: A UI funcionará com fallbacks/mocks se o backend estiver offline. Consome `NEXT_PUBLIC_API_URL`.

### 2. Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
- **Nota**: Requer a `DATABASE_URL` ativa (PostgreSQL).

### 3. Database (PostgreSQL)
```bash
cd database
docker compose up -d
npx prisma migrate dev
```
- **Nota**: Sobe apenas o banco de dados e aplica o schema.

### 4. AI-Agents
```bash
cd ai-agents
npm install
npm run start:worker
```
- **Nota**: Requer `REDIS_URL` para escuta de filas.

---

## Integração Completa (Docker)
Para rodar todo o ecossistema integrado:
```bash
docker compose up --build
```
Acesse:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/docs

Para mais detalhes técnicos, consulte os arquivos `PROJECT.md` dentro de cada pasta.
