# FINANHUB - Enterprise Context & Architecture

## 1. Visão Geral
A FINANHUB é um ecossistema digital de marketplace B2B para fusões, aquisições e investimentos (M&A). A plataforma utiliza Inteligência Artificial para curadoria de leads e moderação de ativos reais, conectando investidores a c-levels de forma segura e eficiente.

## 2. Pilares de Arquitetura (Enterprise Standard)
O projeto adota uma estrutura de **Monorepo Modular** com separação física e lógica total entre as camadas de apresentação, processamento, persistência e inteligência.

### 2.1. Desacoplamento Total
- **Frontend**: Aplicação Next.js isolada. Não possui lógica de negócio ou acesso direto ao banco. Comunica-se exclusivamente via API REST.
- **Backend**: API NestJS (Node.js). É a autoridade única de regras de negócio e segurança (Multi-tenant/RBAC).
- **Database**: PostgreSQL gerido via Prisma. Módulo focado em schema, migrações e integridade referencial.
- **AI-Agents**: Micro-serviços assíncronos para processamento de linguagem natural e análise de risco.

## 3. Diretrizes de Desenvolvimento
1. **API-First**: O Backend fornece o contrato (Swagger/DTOs) que o Frontend consome.
2. **Desenvolvimento Isolado**: Cada módulo deve ser capaz de rodar individualmente para testes e desenvolvimento.
3. **Contratos Imutáveis**: Mudanças em APIs ou Schemas devem ser versionadas para não quebrar módulos dependentes.
4. **Sem Dependência de Código**: Proibido importar arquivos (TS/JS) de um diretório de módulo para outro (`Zero Cross-Module Imports`).

## 4. Fluxo de Comunicação
- **Síncrono (HTTP/REST)**: Frontend <-> Backend.
- **Persistência (TCP)**: Backend <-> Database.
- **Assíncrono (Event-Driven/Redis)**: Backend <-> AI-Agents.

## 5. Segurança e Governança
- **Multi-tenancy**: Isolamento rigoroso de dados por `company_id`.
- **RBAC**: Permissões baseadas em roles (Admin, Member, Investidor).
- **Monetização**: Controle de acesso por plano (Subscription Guard) e limites de uso (Gating).
- **Audit Trail**: Logs de todas as mutações sensíveis no banco.

## 6. Padronização de Arquivos
Cada módulo contém seu próprio `PROJECT.md` detalhando responsabilidades, limites, dependências e interfaces, seguindo o padrão de 10 pontos obrigatórios da FINANHUB.
