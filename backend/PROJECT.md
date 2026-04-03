# FINANHUB - Documentação Módulo Backend

## 1. Visão do Backend
Fornecer a API principal de negócios, imaculada nas proteções de multitenant. Operará o núcleo transacional como o hub central B2B para o frontend consumir e integrar AI-Agents.

## 2. Arquitetura Modular
Proposto em NestJS/Node.js, adotando DDD prático (Domain Driven Design). Responsabilidades apartadas entre as portas de rede (Controllers) e lógicas abstratas (Services/Providers).

## 3. Módulos
- `/auth`, `/users`, `/tenants`, `/opportunities (ads)`, `/chat`, `/leads`, `/billing`, `/webhook-ai`, `/admin`.

## 4. Entidades Centrais
- Tenant (Empresas baseadas).
- Ads (Anúncios / Classificados B2B ofertados por tenants).
- Leads / Proposals (Intentos transacionais interligados a tenants ofertantes).

## 5. Casos de Uso (Use Cases)
- Criar Anúncio (Checagem de plano de cota vs moderação inicial).
- Converter Proposta em Chat Seguro (Match making e geração de chaves socket).
- Aprovar pagamento Sponsored (Emissão de recibos digitais e Webhooks Stripe).

## 6. Autenticação
Base JWT assimétrico com expiração estrita baseada no ciclo HMAC ou chaves privadas/públicas. Handshake inicial seguro.

## 7. Autorização
Roles injetáveis aplicadas diretamente sobre endpoints via decorators como `@Roles('ADMIN', 'OWNER')` em nestjs Guards.

## 8. Multi-Tenant
Forte aplicação do escopo (Cls-hooked ou injeção de Tenant via req contextual no middleware) assegurando falha imediata e 403 (Forbidden) se um acesso tenta forçar IDs cruzados por força-bruta.

## 9. Filas
Configurações amparadas em BullMQ e Redis manipulando jobs em backgrounds vitais (Ex: disparo de 20 e-mails massivos para investidores num match específico demorado).

## 10. Eventos
Event Emitters emitindo processos fracamente acoplados do core. (Ex: Ao persistir um anuncio, disparamos a `AD_CREATED` para notificar IA em paralelo).

## 11. Logs
Registro vital de trilhas no formato JSON (Pino / Winston) formatadas para coleta no CloudWatch / ELK. Nenhuma deleção deve ocorrer em base sem log correspondente de `soft_delete`.

## 12. Auditoria
Gravação persistente de quem manipulou a base de permissões ou expurgou empresas. Tabela `AuditLogs`.

## 13. Antifraude
Serviços dedicados com limites de tempo e rate-limiting integrados com o diretório `/ai-agents` para pausar publicações suspeitosamente volumosas.

## 14. Integração com IA
Consumimos microsserviços via APIs RPC/HTTP de sub-agentes autônomos ou gatilhos indiretos via Redis Queue.

## 15. Storage
Assentamentos documentais (CDNs e S3 Buckets presigned) acoplados a módulos nativos (AWS SDK/MinIO) gerando pre-urls evitando upload custoso através do Node Container (frontend submete no bucket direto via token validado pelo servidor).

## 16. Notificações
Socket.io (Tempo real) rodando sincronizado para sinos e banners push combinados a canais transacionais tipo Mailgun.

## 17. Padrões REST
URIs de modelagem puramente baseada em RFC:
- `GET /api/v1/resource` -> Coleções
- `POST /api/v1/resource/:id/sub-resource` -> Relações

## 18. Backlog Técnico Backend
- [x] Scaffold Arquitetural NestJS na pasta backend (Módulos Base, Auth, Tenants criados).
- [ ] Endpoints Seed Mock.
- [ ] Pipeline Local de teste para Integrações de JWT.
