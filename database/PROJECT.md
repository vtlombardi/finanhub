## 1. Visão Arquitetural B2B Isolada
O Finanhub adotou PostgreSQL como fonte da verdade, protegido por uma orquestração forte do ORM Prisma. O framework desenhado é estrito na tripla: `Tenant` -> `Company` -> `User`. Todos os dados pertencem obrigatoriamente a uma fundação de Multi-Tenant, assegurando confidencialidade entre assinantes SaaS e suas respectivas instâncias transacionais B2B.

## 2. Modelagem das 3 Grandes Fases
A base foi desmembrada estrategicamente:
1. **Fase 1 (Fundação e Marketplace)**: Nascem as estruturas de Identidade (`Tenant`, `User`, `Company`) atadas por `CompanyMember`. O `Listing` entra como motor substituto flexível para antigos Anúncios, abraçado dinamicamente pelas Tabelas Pivot (`Category`, `CategoryAttribute`, `ListingAttributeValue`).  
2. **Fase 2 (Acordos e Relacionamentos)**: O foco da concorrência do mercado. Foram introduzidas `Proposal` para dinheiro na mesa, `Lead` medindo tração temporal, `Favorite` e o sistema de mensagens embutido de Websockets atrelado a ofertas via `ChatThread` x `ChatMessage`.
3. **Fase 3 (Governança, SaaS e AI)**: Infraestrutura comercial para o provedor cobrar com `Plan` e `Subscription`, e os potes paralelos preenchidos pela malha de Inteligência Artificial (`AiInsight` flagando scammers, e `AiJob` persistindo as chamadas assíncronas custosas feitas via BullMQ).

## 3. Segurança (Indexes and Constraints)
Adotamos fortificações massivas:
- `@@unique([tenantId, email])` e `@@unique([tenantId, slug])` garantindo que dois escopos diferentes de provedores SaaS podem até dividir o mesmo nome base ou usuário se a regra pedir.
- As Constraints do Prisma `onDelete: Cascade` varrerão instâncias conectadas (apagou o Inquilino? Apaga tudo), salvando apenas históricos rígidos no `AuditLog` por amarras como Constraint `SetNull`.
- Índices compostos de queries nas tabelas de volume (`Listing`, `Lead`).

## 4. Backlog Técnico Banco
- [x] Definir ORM nativo (Prisma).
- [x] Desenhar ERD (Entity Relationship Diagram) master (Todas as 3 fases integradas no `schema.prisma`).
- [ ] Aplicar Docker Container Postgres e orquestração.
