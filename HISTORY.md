# FINANHUB - Registro de Alterações (History)

## [2026-04-09] - Lançamento da Máquina de Monetização (Monetization Engine)

### Implementação do Core Comercial
- **Refatoração do Prisma Schema**: Atualização do enum `PlanTier` para o modelo de "Níveis de Poder": `BASE`, `PROFESSIONAL` e `ELITE`.
- **Database Reset & Migration**: Limpeza de dados legados e sincronização do banco com a nova estratégia de tiers.
- **Seeder de Alta Fidelidade**: População dos novos planos com limites específicos de listings, leads, e acesso a recursos premium (Data Room, IA).
- **Lógica de Crédito Pro-rata**: Implementação no `PlansService` do cálculo automático de abatimento de valor para transições de Professional para Elite.

### Governança e Segurança
- **SubscriptionGuard (Backend)**: Proteção de rotas via NestJS Guards, verificando tiers mínimos e funcionalidades ativas.
- **CheckSubscription Decorator**: Facilitação de uso para desenvolvedores protegerem rotas premium com uma única linha.

### UI/UX & Gating de Interface
- **useSubscription Hook**: Novo hook reativo para consulta de limites e planos no Dashboard.
- **PlanGate Component**: Wrapper premium com *glassmorphism blur* e CTAs contextuais para incentivar o upgrade de funcionalidades bloqueadas.
- **Data Room Protection**: Implementação do gating real no Virtual Data Room, bloqueando gestão de documentos para usuários Base.

### Inteligência HAYIA
- **HayiaInsightCard**: Integração de banners de inteligência no topo do Dashboard que analisam o comportamento (tráfego/leads) e sugerem o upgrade ideal.

---

## [2026-04-09] - Refinamento Estético da Página /anuncie
- **Padrão Stripe/Linear**: Implementação de profundidade visual, gradientes radiais suaves e bordas vítreas.
- **Níveis de Poder**: Nova proposta de valor baseada em "Nível de Impacto no Dealmaking".
- **Hierarquia Visual**: Refinamento de banners da HAYIA e de Crédito para destaque estratégico.
- **Ajuste Cirúrgico de Espaçamento**: Otimização do fluxo vertical da página para melhor legibilidade e conversão.

---

## [2026-04-09] - Implementação e Refinamento da Página "Nossa Empresa"

### Reconstrução Institucional Premium
- **Design de Alta Fidelidade**: Transformação da página institucional em um ativo de padrão internacional (estilo Stripe/Linear).
- **Estética Dark & Glassmorphism**: Uso intensivo de transparências, blurs (12px), sombras profundas e glows sutis (#12b3af).
- **Hero de Impacto**: Integração de imagem gerada por IA representando arquitetura corporativa moderna em alta resolução.

### Conteúdo Estratégico & UX
- **Copywriting Autoritativo**: Redefinição completa do conteúdo em português, posicionando a Finanhub como um ecossistema de M&A e liquidez.
- **Rápida Navegação (Rhythm)**: Redução estratégica de espaçamentos verticais (padding) para um fluxo de leitura contínuo e menos fragmentado.
- **Transições Fluidas**: Implementação de gradientes de background para conexão visual entre seções, eliminando cortes secos.
- **Lógica de Conversão (Final CTA)**: Adição de uma seção final focada em resultados comerciais ("Sua oportunidade merece posicionamento") com gatilhos de ação claros.

### Componentização
- **Custom CSS (about.css)**: Centralização de estilos específicos em módulo isolado para garantir performance e evitar side-effects.
- **Refinamento da Seção Tech**: Integração visual do bloco de tecnologia ("Finanhub Brain") com linguagem visual unificada.
