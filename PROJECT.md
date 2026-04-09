# FINANHUB - Enterprise Modular Ecosystem

## 1. Visão Geral
FINANHUB é uma plataforma de marketplace B2B e gestão de oportunidades de investimento, projetada com uma arquitetura de microsserviços lógica (Modular Monorepo). O sistema é composto por 4 pilares fundamentais totalmente desacoplados, permitindo desenvolvimento, teste e deploy independente.

## 2. Pilares do Sistema (Módulos)

### 2.1. Frontend (Interface de Usuário)
- **Tecnologia**: Next.js (App Router).
- **Responsabilidade**: Renderização de UI, SEO, Dashboards e interatividade.
- **Isolamento**: Consome dados exclusivamente via `Services` e `Hooks`. Zero chamadas diretas de API em componentes visuais.
- **Contrato**: Utiliza tipagem oficial via `@shared/contracts`.
- **Organização**:
  - `src/services`: Camada de lógica de comunicação com backend.
  - `src/hooks`: Camada de gestão de estado e side-effects de dados.
  - `src/components`: Componentes visuais puros ou com lógica mínima de UI.

### 2.2. Backend (Core Engine)
- **Tecnologia**: NestJS (Node.js/TypeScript).
- **Responsabilidade**: Regras de negócio, autenticação (RBAC/Multi-tenant), orquestração de processos.
- **Isolamento**: Exposto via API REST. Independente de como os dados são exibidos.
- **Contrato**: Fornece endpoints e DTOs.

### 2.3. Database (Persistência ACID) [Authority]
- **Tecnologia**: PostgreSQL + Prisma ORM.
- **Responsabilidade**: Fonte única da verdade para o Schema e Migrações.
- **Localização**: `/database`.
- **Isolamento**: Apenas persistência. Sem lógica de negócio complexa em triggers/procedures.
- **Uso**: Todos os demais módulos (`backend`, `ai-agents`) devem apontar para o schema neste diretório.

### 2.4. AI-Agents (Inteligência Autônoma)
- **Tecnologia**: Python/Node.js (LangChain/LLMs).
- **Responsabilidade**: Moderação, análise de risco, matchmaking e enriquecimento de dados.
- **Isolamento**: Opera via filas assíncronas (Redis/Webhooks). Nunca toca o frontend.

### 2.5. Shared (Contratos e Tipos) [NEW]
- **Responsabilidade**: Unificação de interfaces, DTOs, Enums e constantes.
- **Alias**: `@shared/*`.
- **Localização**: `/shared`.
- **Isolamento**: Não contém lógica de execução ou segredos. Apenas definições de tipos e esquemas de dados.

## 3. Matriz de Comunicação e Contratos

| Origem | Destino | Tipo | Protocolo | Contrato |
|---|---|---|---|---|
| Frontend | Backend | Request/Response | REST/HTTPS | Endpoints + DTOs JSON |
| Backend | Database | Query | Prisma/TCP | /database/schema.prisma |
| AI-Agents | Database | Query | Prisma/TCP | /database/schema.prisma |
| Backend | AI-Agents | Event/Async | BullMQ/Redis | Job Payload Schema |
| AI-Agents | Backend | Callback | Webhook/HTTP | Result Payload |
| Todos | Shared | Import | TypeScript Alias | @shared/* |

## 4. Motor de Monetização (Estratégia)
- **Tiers**: BASE, PROFESSIONAL, ELITE.
- **Modelo de Cobrança**: Híbrido (Pagamento por anúncio vs Assinatura).
- **Gating**: Implementado via `SubscriptionGuard` (Backend) e `PlanGate` (Frontend).
- **Créditos**: Suporte a crédito pro-rata para transições de planos (Pro -> Elite).

## 5. Estratégia de Desenvolvimento Isolado

### Como rodar cada parte sozinho:
- **Frontend**: `cd frontend && npm run dev`. Se o backend não estiver acessível, utiliza `services/mocks`.
- **Backend**: `cd backend && npm run start:dev`. Requer banco de dados (pode ser mockado ou docker local).
- **Database**: `cd database && docker compose up`. Para gerenciar apenas o banco e migrações.
- **IA**: Execução de scripts via `ai-agents/` unitariamente.

## 5. Fluxo de Integração Final
A integração ocorre no ambiente de Infra (`infra/`) via `docker-compose.yml`, que orquestra todos os serviços e configura as variáveis de ambiente necessárias (ex: `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `REDIS_URL`) para que os módulos se "enxerguem" via rede interna.

## 6. Regras de Ouro (Anti-Acoplamento)
1. **Zero Cross-Imports**: Arquivos de `/frontend` NUNCA importam código de `/backend`. Ambos importam de `/shared`.
2. **Path Alias Only**: Imports para contratos comuns devem obrigatoriamente usar `@shared/...`.
3. **API-First**: O Backend deve estar funcional mesmo sem Frontend.
3. **Env-Driven**: Nenhuma URL ou segredo é fixo no código. Sempre via `.env`.
4. **Contract-Respect**: Mudanças em contratos exigem atualização de versão ou retrocompatibilidade.
