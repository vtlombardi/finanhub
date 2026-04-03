# FINANHUB - Plano-Mestre do Ecossistema

## 1. Visão Geral do Projeto
A FINANHUB é uma plataforma digital avançada de negócios e oportunidades movida a Inteligência Artificial. Atuará como hub central corporativo para conexões reais, funcionando como classificados enterprise, marketplace multi-tenant e gestora de oportunidades comerciais. O escopo abrange empresas, investidores, anunciantes e prestadores de serviço que negociarão ativos num ambiente blindado por moderação e anti-fraudes automatizados, gerando leads conversíveis e matchmaking de altíssima precisão.

## 2. Arquitetura Geral
O ecossistema adota padrão monorepo por questões de governança. As camadas são:
- **`/frontend`**: Aplicação Next.js + React. Apresentação híbrida (SSR/CSR), provendo os Dashboards, Listings e UI do marketplace.
- **`/backend`**: Core API robusta em NestJS + Node.js (TypeScript). Gateway lógico central de persistência e validação muti-tenant.
- **`/database`**: Persistência ACID em PostgreSQL gerida por ORM/Migrations (Prisma ou TypeORM).
- **`/ai-agents`**: Agentes desacoplados para NLP, embeddings e curadoria automatizada operando via workers secundários.
- **`/infra`**: Provisionamento declarativo via IaC, CI/CD, monitoramento e containers Docker (preparados para clusters ECS/K8s e S3).
- **`/docs`**: ADRs e registros de ciclo de vida da plataforma.

## 3. Comunicação entre Camadas
- **Frontend ↔ Backend**: API RESTful sobre HTTPS (com WebSocket para Chat/Notificações RT). Integração baseada em tokens JWT.
- **Backend ↔ Database**: Comunicação via pool de conexões (TCP/IP local ou VPC privada) com separação lógica de tenant via schemas ou colunas indexadas.
- **Backend ↔ AI-Agents**: Assíncrona. Backend insere "Jobs de Validação" em filas Redis/SQS. Agentes IA consomem, processam com LLMs e publicam o resultado de volta para o Backend.
- **Backend ↔ Storage**: SDK para Amazon S3 (ou compativeis) lidando com uploads via presigned URLs para reduzir gargalo.

## 4. Modelagem de Dados (Entidades)
Tudo que trafega no ecossistema gira em torno da integridade das seguintes tabelas:
- **Identidade e RBAC**: `Users`, `Profiles`, `Companies (Tenants)`, `CompanyMembers`, `Roles`, `Permissions`, `Sessions`, `Logs`.
- **Oferta de Negócios**: `Ads`, `Listings`, `Categories`, `Attributes`, `CustomFields`, `Media`.
- **Interatividade**: `Favorites`, `Leads`, `Proposals`, `Conversations (Chat)`, `Messages`, `Notifications`, `Feedbacks`.
- **Financeiro B2B**: `Plans`, `Subscriptions`, `Payments`, `SponsoredAds`.
- **Segurança e IA**: `ModerationLogs`, `FraudDetectionFlags`, `AIJobs`, `AIResults`, `AuditTrails`, `APIWebhooks`.

## 5. Rotas de API Direcionais
| Módulo | Method | Endpoint | Auth | Role Req. | Objetivo |
|---|---|---|---|---|---|
| Auth | POST | `/api/v1/auth/login` | Não | N/A | Emissão de tokens JWT |
| Users | GET | `/api/v1/users/me` | Sim | User | Retorna contexto do Profile |
| Tenants | POST | `/api/v1/companies` | Sim | User | Cadastro de nova empresa tenant |
| Ads | GET | `/api/v1/ads` | Não | N/A | Fetches catálogo B2B publico |
| Ads | POST | `/api/v1/ads` | Sim | Verif. Member | Cria classificado/oportunidade |
| Chat | WS | `/ws/v1/chat/:id` | Sim | Ad Owner/Buyer | Negociações diretas WebSocket|
| Proposals | POST | `/api/v1/proposals/:ad_id` | Sim | User | Gera Lead B2B para o autor |
| Fraud | POST | `/api/internal/fraud-check` | Sim | System/AI | Webhook de resposta dos agentes|
*(As demais subrotas operam nos mesmos conformes verbais CRUD).*

## 6. Estrutura Detalhada de Pastas
- `/frontend/src/`: Componentes (`components/`), Regras Híbridas (`hooks/`, `utils/`, `types/`, `services/`), e Páginas (`app/`).
- `/backend/src/`: Módulos NestJS (Controllers, Providers, Services e Guards).
- `/database/`: Schemas, index migrations puras (SQL/Prisma) e Seeders de mock data.
- `/ai-agents/`: Scripts e runtimes Python ou TS para LangChain, Prompts e Embeddings.
- `/infra/`: `docker-compose.yml`, Helm Charts, configs AWS/Terraform.

## 7. Ordem Ideal de Implementação
1. **Fundacional**: Configuração do `/infra` (Banco de Dados + API Node rodando em container).
2. **Conexão e Auth**: CRUD Users/Companies e Setup Next.js Auth. JWT validado.
3. **Core Produto B2B**: Entidades de Ads (Oportunidades), Upload para Storage S3 e Feedbacks visuais.
4. **Vendas/Networking**: Serviços de Chat, Leads e Propostas no backend. Visões no frontend.
5. **Governança Total**: Módulo `/ai-agents` entra rodando curadoria invisível sobre cada "Lead" trocado.

## 8. Roadmap Técnico
- **Fase 1 (Fundação)**: Auth JWT, Perfil, Modelagem de Empresas Multi-tenant e Subida do ambiente S3.
- **Fase 2 (Núcleo)**: Classificados B2B, Busca Textual, Oportunidades CRUD completo, Leads.
- **Fase 3 (Governança)**: Dashboard e Painel Admin. Sistema de permissões aprimorado. RBAC.
- **Fase 4 (Monetização)**: Assinaturas e Destaques Pagos (Sponsored Ads).
- **Fase 5 (Inteligência)**: Agentes para sumário de perfis corporativos e moderação anti-fraude.

## 9. Riscos e Pontos de Atenção
- **Segurança Multi-Tenant**: Injetar validação `company_id` em toda query Backend. Vazamento cruzado destrói a base B2B corporativa.
- **Acoplamento Core**: Garantir que as lógicas de IA no `/ai-agents` sejam imunes às quebras nativas do `/backend` e só se comuniquem por payload (Fila).
- **Storage/Bandwidth Limit**: Abuso de mídias de oportunidade. Aplicar Rate Limit e WebP automático.

## 10. Padrões e Convenções
- **Clean e SOLID**: Códigos com responsabilidade única nas camadas NestJS e Next.js local (Services separadas de UI Components).
- **Commit Pattern**: Padrão Conventional Commits (ex: `feat: auth module`).
- **Erros**: Retorno JSON RFC padronizado global via Exception Filters (`message`, `code`, `timestamp`).
- **Logs**: Sistema unificado Elasticsearch ou Pino loggers por nível (INFO, WARN, ERROR).
