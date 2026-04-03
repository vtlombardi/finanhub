# Fluxos de Comunicação do Ecossistema - FINANHUB (Etapa 8)

Este documento dita estritamente como as camadas de rede do monorepo corporativo interagem entre si em ambientes de produção. Não são permitidos "desvios", como o frontend comunicando diretamente com as bases de dados ou a IA.

### 1. Comunicação Frontend ↔ Backend
- **Protocolo Base:** HTTPS para requisições de estado (REST API) trafegando carga util JSON.
- **Requisição no Next.js:** O App Router agirá como BFF (Backend for Frontend) consumindo as rotas B2B do NestJS durante o Server-Side Rendering (SSR). Chamadas em client (filtros de Oportunidades, cliques dinâmicos) utilizarão Axios com Interceptors embutindo o *Bearer Token*.
- **CORS e Limites:** API do NestJS bloqueia requisições `OPTIONS` não oriundas de origens validadas da FINANHUB.

### 2. Comunicação Backend ↔ Database
- **Protocolo:** Conexão socket TCP/IP mantida por Pool nativo do serviço rodando no provedor PostgreSQL na Nuvem (escala vertical primária).
- **Tradução Relacional:** Uso estrito do ORM Prisma via instâncias em Singleton (`PrismaClient`). Toda gravação tem validação ACID rigorosa.
- **Tenant Isolation:** Injeção programática via Node.js limitando operações exclusivas de consulta usando o `tenantId` global em todo e qualquer fluxo do prisma (`where: { tenantId: user.tenantId }`).

### 3. Comunicação Backend ↔ AI-Agents
- **Assíncrona por Filas Ocultas (Event-Driven):** O backend NUNCA congela uma requisição aguardando a LLM da OpenAI responder (já que agentes NLP são lentos e instáveis). O backend encerra a resposta HTTP do criador do Anúncio colocando o status dele como "PENDING_AI", e injeta via Redis/RabbitMQ um Job. Os workers no submódulo `/ai-agents` recebem o job, rodam o pipeline antifraude NLP e disparam webhooks de volta para `/api/v1/webhooks/ai/moderation` aplicando os bloqueios ou permitindo anúncios limpos.

### 4. Comunicação Backend ↔ Storage
- **Pre-Signed S3 Uploading Stream:** O NestJS NUNCA servirá de tubo pesado de bytes de vídeo/imagem para aliviar CPU.
- O Frontend pede para o Backend: *"Quero subir uma foto de pitch-deck"*. O Backend autentica os limites Multi-tenant, gera um link cifrado temporal (Presigned URL Amazon S3) e retorna pro Front. O Front despeja os bytes HTTP PUT diretamente no Bucket. Apenas a URI é então salva de volta no servidor.

### 5. Comunicação Backend ↔ Notificações
- **Multicanal Assíncrono:** Utilização do Provider Factory Padrão do NestJS interagindo com Sendgrid/Mailgun (E-mail transacionais de "Match e Conexão de M&A"), disparo de SMS (Twilio para Recuperação) e persistência num sistema de "Pusher/Sino" local salvo no Banco (Notificações in-app).

### 6. Chat em Tempo Real
- **Topologia de Borda (WebSocket/Socket.io):** A partir do momento em que um investidor clica em "Fazer Proposta" e ela é convertida pela empresa detentora da oportunidade (Lead Approved), o Backend abre uma `ChatRoom`.
- O trafego de mensagens adota WebSockets bidirecionais mantidos em cache Volátil (Redis para scale-out dos servidores NodeJS), persistindo o log do chat em lote no postgres rodando em *Background Queue* para evitar lock de transações simultâneas de mensagens B2B rápidas.

### 7. Jobs Assíncronos (CRON e Workers)
- **Engine BullMQ + Elasticache Redis:** Responsável por expurgo da plataforma local: limpar Tokens JWT vencidos diários do log, apagar ChatRooms abandonadas há mais de 3 anos, retentativas automáticas e soft-deletes obrigatórios da lei LGPD usando `@Cron()` decorada nos Services do NestJS.

### 8. Autenticação Ponta a Ponta
1. **Ponta**: Frontend capta credenciais via TLS.
2. **Gateway**: Backend processa encriptação `bcrypt` hash (rounds de no mínimo 10) e devolve access\_token `JWT` de janela super curta (15 minutos) + um refresh_token criptografado no cookie do navegador focado em evitar ataques XSS via HTTPOnly.
3. **Escopo contínuo:** Em toda chamada sensível futura, o middleware Interceptor injeta a entidade `req.user` na thread contendo obrigatoriamente a *Role* (Owner/Admin) e o `tenantId` base no Token validado contra chave privada do Backend FINANHUB.
