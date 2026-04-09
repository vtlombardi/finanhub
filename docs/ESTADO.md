# PROJETO
- Nome: FINANHUB
- Tipo: Plataforma B2B M&A — marketplace compra/venda de empresas
- Monorepo: /Users/vtlombardi/Projects/Finanhub/FINANHUB/
- Stack: Next.js · NestJS · PostgreSQL/Prisma · Redis/BullMQ · OpenAI

# ESTADO ATUAL
- ETAPA: Funcionalidades core completas
- ÚLTIMA AÇÃO: Implementação e Refinamento Premium da página /nossa-empresa (Institutional Standard)
- PENDÊNCIAS: ver seção abaixo
- PRÓXIMO PASSO: /dashboard/settings (rota no sidebar aponta para 404)

# STACK DETALHADA
- Frontend: Next.js App Router + Tailwind — /frontend/
- Backend: NestJS + Prisma — /backend/
- AI Workers: BullMQ + OpenAI gpt-4o-mini — /ai-agents/
- Schema compartilhado: /database/schema.prisma
- Auth: JWT cookie `finanhub.token` 7d · multi-tenancy via tenantId

# MÓDULOS BACKEND (/backend/src/modules/)
- auth: register/verify/resend/login/forgot/reset/accept-invite/me
- listings: CRUD + upload multer + favoritos + recomendações + similares
- leads: createLead (enfileira AI) + proposals CRUD
- moderation: queue + applyAction + history + notifica tenant
- categories: CRUD tenant-scoped + CategoryAttributes (TEXT/NUMBER/BOOLEAN/URL)
- tenants: CRUD + member management
- users: invite + role update + remove (RBAC OWNER>ADMIN>USER)
- analytics: KPIs + trends 7d + exportCSV
- notifications: create/batch/getForUser/markRead/unreadCount
- ads: CRUD banner (LEADERBOARD/MOBILE_BANNER/SIDEBAR) + findActive
- dataroom: requestAccess + getMyRequest + getDocuments (investor) + getRequests + updateStatus + addDoc + removeDoc (seller)
- mail: verification + invite + reset
- chat, dashboard, plans, companies: existentes

# AI WORKERS (/ai-agents/src/workers/)
- AdReviewWorker: fila `ai-review` → AiInsight + status listing
- LeadQualificationWorker: fila `ai-lead-qualification` → score/intentLevel/classification
- Ambos: parseAiJson() strip markdown · AiJob auditoria · retry exponencial

# PÁGINAS FRONTEND
- Público: /login /register /forgot-password /reset-password /accept-invite /deals/[slug] /nossa-empresa
- Dashboard: / leads messages members categories moderation stats notifications dataroom listings/[id]/edit
- Components: AdminLayout (sidebar+header) · NotificationBell (polling 30s) · DataRoomSection (5 estados)

# BANCO — MIGRAÇÕES APLICADAS
- 20260405213402_add_admin_fields
- 20260407000000_add_missing_fields
- 20260408014323_add_lead_tenant_relation_and_indexes
- 20260408120000_add_ads_model
- 20260408130000_add_reset_password_fields
- 20260408140000_add_dataroom ← última

# DECISÕES RELEVANTES
- AdsModule = banners/publicidade (não listings)
- Invite reutiliza resetPasswordCode/resetPasswordExpires (48h)
- DataRoomRequest @@unique([listingId, investorId]) — idempotente
- Slug de categoria imutável (quebra URLs)
- Upload: multer diskStorage /uploads/ servido como static
- LeadQualificationWorker existia mas bug JSON.parse sem strip md — corrigido
- /register existia mas não salvava JWT pós verify — corrigido
- deals/[slug] tinha mock fallback no catch — removido

# PENDÊNCIAS
- [ ] /dashboard/settings — 404 (sidebar aponta para essa rota)
- [ ] ModerationController sem guard de OWNER/ADMIN (qualquer JWT acessa)
- [ ] attrValues no form de edição de listing (consumir GET /categories/:id/attributes)
- [ ] Paginação na vitrine pública /deals (frontend ignora `pagination` da API)
- [ ] prisma generate no ai-agents após cada mudança de schema

# PRÓXIMOS PASSOS (ordem sugerida)
1. /dashboard/settings — dados do tenant, logo, plano atual
2. Guard OWNER/ADMIN no ModerationController
3. attrValues no form de listing
4. Paginação na vitrine /deals
