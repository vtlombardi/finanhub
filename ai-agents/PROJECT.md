# FINANHUB - Documentação Sub-Módulo Inteligência Artificial (AI Agents)

## 1. Visão da Camada de IA
A inteligência artificial do FINANHUB não é vista apenas como geradores de texto, mas atua ativamente como uma malha em formato de "agenciadores", executando curadoria e tomada de decisões sob contratos baseados em limites técnicos para sanear e vitaminar a integridade da comunidade e deals comerciais publicadas na base.

## 2. Arquitetura Modular `/ai-agents`
O padrão do módulo foi escalado para lidar com delegação de multi-agentes:
- **`/gateway`**: Recebe os webhooks e jobs do backend NestJS, comportando-se como interface de borda da IA.
- **`/orchestrator`**: Onde reside o master loop (`orchestrator.ts`), decidindo para qual subtarefa o Job recebido deve ser despachado.
- **`/agents`**: A força de trabalho. Cada pasta concentra lógicas/prompts e conectores limitados à sua ação:
  - `ad-generator`: Aumenta anúncios baseados em dados enxutos enviados pelo tenant.
  - `lead-qualifier`: Pontua e resume e checa intenção das propostas de investidores nos chats.
  - `opportunity-analyzer`: Analisa métricas profundas da categoria para validar suspeita de fraudes e "Too Good To Be True".
- **`/memory`**: Módulo de vetorização provendo longo prazo de contexto (RAG/Embeddings) para os LLMs da rede, armazenando scores passados de determinados tenants.
- **`/shared`**: Tipagens puras, payloads de eventos e interfaces da resposta da API (`contracts.ts`).

## 3. Contratos de Entrada e Saída
- Entradas processadas devem via Backoffice: Webhooks tipificados para processamento passivo enviando um payload (Ad JSON via RabbitMQ). 
- Saídas geradas em formatações fixas de Struct JSON (ex: schema Pydantic traduzidos em scores de `1 a 10` e status de `APPROVED/FLAGGED`).

## 4. Logs, Avaliação e Limites
Armazenamento estrito dos logs de custo (Token-burn / Prompt-burn) para alinhamento e faturamento de custos API. O agente jamais manipula pagamentos, exclusões irrevogáveis de dados de usuários diretas na base; ele delega a ação ao Backend gerando *"aluguéis"* que moderadores humanos julgam se necessário.

## 5. Backlog Técnico IA Modular
- [x] Instanciar worker global no `/orchestrator/orchestrator.ts` com concorrência BullMQ e tipagem de entrada/saída.
- [ ] Configurar pinecone client em `/memory` para base de dados vetorizados de scams-passados.
