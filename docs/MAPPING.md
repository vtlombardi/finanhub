# Mapeamento do Sistema - FINANHUB (Etapas 6 e 7)

Abaixo está o mapeamento completo para as instâncias do banco de dados (Prisma/PostgreSQL) e o catálogo de endpoints da API (NestJS), construído sob a métrica corporativa multi-tenant.

## 1. Mapeamento de Entidades do Banco de Dados (Database Schema)

### Entidades de Identidade (Core)
* **Tenant (Company)**: Raiz do multi-tenant.
  * *Campos:* `id`, `name`, `cnpj`, `slug`, `status` (ACTIVE/INACTIVE), `createdAt`, `updatedAt`
  * *Relações:* 1 -> N `User`, 1 -> N `Ad`, 1 -> N `Wallet/Subscription`.
* **User (Profile)**: Membros operando contas.
  * *Campos:* `id`, `name`, `email`, `password_hash`, `tenantId`, `role` (OWNER, ADMIN, MANAGER, USER)
  * *Relações:* N -> 1 `Tenant`.

### Entidades do Marketplace (Negócios)
* **Category**: Dinâmicas para agrupamento (Fusões, Investimentos, Imóveis).
  * *Campos:* `id`, `name`, `slug`, `parentId` (árvore de subcategorias).
* **Ad (Classificado/Oportunidade)**: O núcleo de transação.
  * *Campos:* `id`, `title`, `description`, `price`, `status` (DRAFT, PENDING_AI, ACTIVE, REJECTED), `tenantId`, `categoryId`.
  * *Relações:* N -> 1 `Tenant`, N -> 1 `Category`, 1 -> N `Lead`.
* **Media / Uploads**: Anexos multimídia protegidos no S3.
  * *Campos:* `id`, `url`, `type` (IMAGE/VIDEO), `adId`.

### Entidades de Match e Negociação
* **Lead / Proposal**: Intenção real de negócio (Conversão do Investidor).
  * *Campos:* `id`, `adId`, `senderTenantId`, `receiverTenantId`, `status` (PENDING, ACCEPTED, DECLINED).
* **ChatRoom & Message**:
  * *ChatRoom:* `id`, `leadId`, `createdAt`.
  * *Message:* `id`, `roomId`, `senderId`, `content`, `timestamp`.

### Entidades Analíticas e de IA
* **ModValidation**: Rastro das auditorias da IA sobre os anúncios.
  * *Campos:* `id`, `adId`, `score`, `flagged_keywords`, `status`.

---

## 2. Catálogo de Rotas da API e Permissões (REST/NestJS)

Todas as rotas `/api/v1/*` requerem cabeçalho `Authorization: Bearer <JWT>`, exceto onde explicitado [Acesso Livre]. Todo JWT trafega com o `tenantId` embutido para bloqueio natural.

### Módulo: Auth & Identity (`/auth`)
| Method | Endpoint | Auth | Objetivo |
|:---|:---|:---|:---|
| POST | `/api/v1/auth/register` | Livre | Cadastro da Empresa (Gera o Root Tenant) |
| POST | `/api/v1/auth/login` | Livre | Emite token de acesso as interfaces B2B |
| GET | `/api/v1/auth/me` | User | Valida e expõe escopo do User Logado |

### Módulo: Tenants e Membros (`/tenants`)
| Method | Endpoint | Auth | Objetivo |
|:---|:---|:---|:---|
| GET | `/api/v1/tenants/current` | User | View settings gerais do "Meu Negócio" |
| POST | `/api/v1/tenants/members` | Owner | Convida/adiciona novo usuário para o Tenant |
| PATCH| `/api/v1/tenants/members/:id`| Owner | Altera cargo do usuário (Promove a Admin) |

### Módulo: Módulo de Classificados / Oportunidades (`/ads`)
| Method | Endpoint | Auth | Objetivo |
|:---|:---|:---|:---|
| GET | `/api/v1/ads` | Livre | Vitrine pública com busca SEO/Filtros |
| GET | `/api/v1/ads/:slug` | Livre | View da oportunidade aberta pública |
| POST | `/api/v1/ads` | Admin | Criar uma oportunidade (Vai para PENDING_AI) |
| PUT | `/api/v1/ads/:id` | Admin | Edita informações do anúncio e joga p/ auditoria |
| GET | `/api/v1/tenant/:tid/ads`| User | Dashboard do Tenant (Ads privados que postaram) |

### Módulo: Negociação de Oportunidades (`/leads` e `/chat`)
| Method | Endpoint | Auth | Objetivo |
|:---|:---|:---|:---|
| POST | `/api/v1/leads` | User | Envia proposta/interesse inicial no Ad alheio |
| GET | `/api/v1/leads/inbox` | O/Admin| Painel do Ofertante verificando Propostas ganhas |
| GET | `/api/v1/chat/:leadId/room`| User | Abre sala de negociação vinculada ao Lead Aceito |
| POST | `/ws/chat/message` | WS/User| Envio Socket de mensagem em tempo real |

### Módulo: Agentes Autônomos (AI Webhooks) (`/ai-agents`)
| Method | Endpoint | Auth | Objetivo |
|:---|:---|:---|:---|
| POST | `/api/v1/webhooks/ai/moderation`| Internal| Escuta callback do LLM aprovando/reprovando URL |
| POST | `/api/v1/ai/summary` | Admin | Gera Resumo inteligente p/ otimizar o anúncio do Tenant |
