# FINANHUB - Contratos de Integração (Interface Definitions)

Este documento define os protocolos e formatos de dados obrigatórios para a comunicação entre os módulos do ecossistema.

## 1. Módulo: Frontend ↔ Backend (REST API)

### 1.1. Padrão de Requisição
- **Base URL**: `${NEXT_PUBLIC_API_URL}/api/v1`
- **Headers Obrigatórias**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (para rotas privadas)

### 1.2. Principais Endpoints e DTOs

#### Auth
- `POST /auth/login`: `{ email, password }` -> `{ token, user }`
- `POST /auth/register`: `{ email, password, name, companyName }` -> `{ user }`

#### Marketplace (Ads)
- `GET /ads`: Query Params (`category`, `search`, `page`) -> `{ data: Ad[], meta: Pagination }`
- `POST /ads`: `{ title, description, price, categoryId, companyId }` -> `{ id, status: 'pending_ai' }`

#### Propostas (Leads)
- `POST /proposals`: `{ adId, message, valueProposal }` -> `{ proposalId, status: 'open' }`

---

## 2. Módulo: Backend ↔ Database (Schema Registry)

### 2.1. Entidades Core (schema.prisma)
O Backend consome o schema definido no módulo `database/`.

- **Company (Tenant)**: Chave primária `id`. Todos os dados relacionados possuem `companyId`.
- **User**: Pertence a uma ou mais `Companies`.
- **Ad (Anúncio)**: Status enum: `DRAFT`, `PENDING_AI`, `ACTIVE`, `REJECTED`.

### 2.2. Regras de Integridade
- Deleção lógica (`deletedAt`) para todas as entidades principais.
- Chaves estrangeiras obrigatórias para `tenant_id`.

---

## 3. Módulo: Backend ↔ AI-Agents (Async Jobs)

### 3.1. Job de Moderação (Push)
- **Fila**: `ai_moderation_queue`
- **Payload**:
```json
{
  "jobId": "uuid",
  "resourceType": "AD",
  "resourceId": "uuid",
  "content": {
    "title": "string",
    "description": "string"
  }
}
```

### 3.2. Webhook de Resultado (Callback)
- **Endpoint**: `POST /api/internal/ai-callback`
- **Payload**:
```json
{
  "jobId": "uuid",
  "verdict": "APPROVED | REJECTED",
  "reason": "string (opcional)",
  "confidence": 0.95
}
```

---

## 4. Módulo: Infraestrutura (Env Contract)

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Conexão PostreSQL | `postgres://...` |
| `REDIS_URL` | Conexão Message Broker | `redis://...` |
| `API_URL` | Endpoint Backend para o Front | `https://api.finanhub.com` |
| `STORAGE_URL` | Bucket de Assets | `https://s3.amazonaws.com/...` |
