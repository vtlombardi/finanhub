# FINANHUB - Módulo Backend (NestJS)

## 1. Responsabilidade do Módulo
Atuar como o núcleo lógico, motor de regras de negócio e gateway de dados da plataforma. Responsável por autenticação, autorização (RBAC), gestão multi-tenant, processamento de propostas e orquestração de APIs.

## 2. O Que Ele Pode Fazer
- Expor APIs RESTful documentadas.
- Validar tokens JWT e gerenciar sessões.
- Executar lógicas complexas de negócio (M&A Flow, Cálculos).
- Interagir com o banco de dados via Prisma.
- Gerenciar o Motor de Monetização (Tiers BASE, PROFESSIONAL, ELITE).
- Enforcement de limites de uso e acesso via `SubscriptionGuard`.
- Cálculo de créditos pro-rata para transição de planos.
- Disparar eventos para filas (Redis/BullMQ) para os AI-Agents.
- Gerar URLs assinadas para o Cloud Storage.

## 3. O Que Ele NÃO Pode Fazer
- **NUNCA** conter lógica de apresentação ou renderização de HTML/CSS.
- **NUNCA** depender da estrutura interna do diretório `/frontend`.
- **NUNCA** assumir que o cliente é exclusivamente o frontend web (deve ser API-First).
- **NUNCA** processar tarefas pesadas de IA de forma síncrona (deve delegar ao `/ai-agents`).

## 4. Dependências Permitidas
- Framework: NestJS 10.x.
- ORM: Prisma Client.
- Auth: Passport.js, JWT.
- Queue: BullMQ / IORedis.
- Utility: Class-validator, Bcrypt.

## 5. Interfaces de Comunicação
- **Frontend**: REST API (Protocolo HTTP/JSON).
- **Database**: Prisma Proxy (Protocolo TCP/IP).
- **AI-Agents**: Queue (BullMQ/Redis) e Webhooks.
- **External**: AWS SDK / MinIO SDK para Storage.

## 6. Variáveis de Ambiente Usadas
- `PORT`: Porta de execução (padrão 3001).
- `DATABASE_URL`: String de conexão com PostgreSQL.
- `JWT_SECRET`: Segredo para assinatura de tokens.
- `REDIS_URL`: Conexão para o broker de mensagens.
- `STORAGE_ENDPOINT`: Credenciais do bucket S3.

## 7. Como Rodar Isoladamente
1. `cd backend`
2. `npm install`
3. `npm run start:dev`
4. Requer um banco de dados rodando (pode ser o container especificado em `/database`).

## 8. Como Testar Isoladamente
- **Unitários**: `npm run test`.
- **E2E**: `npm run test:e2e` (Jest).
- **Swagger**: Acessível em `/api/docs` quando rodando.

## 9. Como Integrar Com o Resto
O Backend consome a `DATABASE_URL` do módulo `database/` e fornece a `API_URL` para o módulo `frontend/`. A comunicação com `ai-agents` é feita via broker de mensagens definido na `REDIS_URL`.

## 10. Estrutura de Pastas Explicada
- `src/modules/`: Divisão vertical por domínio (Auth, Ads, Tenants).
- `src/common/`: Guards, Interceptors, Decorators e filtros de exceção globais.
- `src/modules/database/`: Integração com Prisma Service isolada.
- `src/main.ts`: Ponto de entrada e configuração global do NestJS.
