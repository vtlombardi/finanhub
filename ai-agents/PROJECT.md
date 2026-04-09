# FINANHUB - Módulo AI-Agents (Inteligência Autônoma)

## 1. Responsabilidade do Módulo
Prover inteligência analítica e automação de processos para a plataforma. Responsável por moderação de conteúdo, análise de risco de fraudes financeiras, enriquecimento de perfis B2B e matchmaking entre investidores e oportunidades.

## 2. O Que Ele Pode Fazer
- Processar Linguagem Natural (NLP) para analisar descrições de anúncios.
- Gerar Embeddings para busca semântica.
- Identificar padrões de fraude ("Too good to be true").
- Categorizar automaticamente novas janelas de oportunidade.
- Enviar resultados de volta para o backend via Webhooks.

## 3. O Que Ele NÃO Pode Fazer
- **NUNCA** acessar o frontend diretamente.
- **NUNCA** persistir dados no banco de dados principal (PostgreSQL) sem passar pela API do Backend.
- **NUNCA** executar lógica de negócio administrativa (Cobrança, Gestão de Usuários).
- **NUNCA** bloquear a thread principal do Backend (deve ser 100% assíncrono).

## 4. Dependências Permitidas
- Runtimes: Node.js (TS) ou Python.
- IA Frameworks: LangChain, OpenAI SDK, HuggingFace.
- Queue: BullMQ / Redis Client.
- NLP: Natural, compromize (JS) ou NLTK/Spacy (Python).

## 5. Interfaces de Comunicação
- **Backend**: via Queue (Redis/BullMQ) ou Webhooks (HTTP POST).
- **External**: Conectores de APIs de LLMs (OpenAI, Anthropic).

## 6. Variáveis de Ambiente Usadas
- `REDIS_URL`: Conexão com o broker de mensagens.
- `BACKEND_WEBHOOK_URL`: Endpoint para postar resultados.
- `AI_API_KEY`: Chave de autenticação para provedores de LLM.

## 7. Como Rodar Isoladamente
1. `cd ai-agents`
2. `npm install` (ou setup venv em python).
3. `npm run start:worker`.
4. Pode ser testado enviando payloads JSON diretamente para os scripts de processamento.

## 8. Como Testar Isoladamente
- **Unitários**: Testar funções de parsing e análise com mocks de resposta de LLM.
- **Integração**: Rodar o worker apontando para um Mock Server que simule o Backend.

## 9. Como Integrar Com o Resto
Os agentes ficam em escuta de canais Redis específicos (ex: `category_curation_queue`). Quando um anúncio é criado no Backend, um Job é postado nessa fila. O AI-Agent processa e invoca a `BACKEND_WEBHOOK_URL` com o veredito.

## 10. Estrutura de Pastas Explicada
- `src/agents/`: Lógica central de cada agente (Moderador, Matchmaker).
- `src/prompts/`: Templates de instruções para LLMs.
- `src/queue/`: Configurações de consumo de fila.
- `src/services/`: Conectores externos (OpenAI, etc).
