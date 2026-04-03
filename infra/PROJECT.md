# FINANHUB - Documentação Sub-Módulo Infraestrutura (DevOps)

## 1. Topologia Containerizada Multi-Ambiente
O ambiente de desenvolvimento e produção foram unificados sob a raiz elástica do Docker. A infraestrutura atua através de Múltiplos contêineres amarrados a uma sub-rede bridge (`finanhub_net`).

Os ambientes foram estritamente separados visando performance local versus estabilidade em escala.
- **Desenvolvimento** (`docker-compose.yml`): Roda instâncias Multi-stage miradas na Tag `development`. Os containers dependem agressivamente de `Volumes` (Binds no OS), de modo que salvar um arquivo `.ts` no NestJS recarrega a engine nodemon sem desligar o contêiner.
- **Produção** (`docker-compose.prod.yml`): Não aceita volumes de source-code. Depende de imagens encapsuladas e precompiladas no Estágio `production`.

## 2. Gateway Proxy (Nginx)
Para cessar o vazamento de portas inseguras (`3000`, `3001`) ao host local e varrer de vez a configuração custosa de `CORS` nos frameworks, adotamos o gateway Nginx na porta `80`.
- Regra `/` -> Bate em `frontend:3000` (Container local do Next).
- Regra `/api/` -> Bate em `backend:3000` (Container local do Nest).
- Regra WebSocket `/socket.io/` preparada sob HTTP/1.1 Upgrades.

## 3. Comandos Rápidos Dev/Prod

**Subir Ecossistema Local (Dev):**
```bash
docker compose up -d
# O código quebra-galho "npm run dev" e "start:dev" disparará o daemon assistindo seus arquivos.
```
**Subir Pipeline Fake de Prod (Testando Imagens):**
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## 4. Monitoramento Passivo
A stack possui alicerce instanciado em `/infra/monitoring/prometheus.yml`, pronto para agregar Grafana em updates futuros raspsando os containers base via NodeMetrics.

## 5. Backlog Técnico da Infra
- [x] Configurar master Gateway transparente Nginx (Front e Back).
- [x] Provisionar Imagens Isoladas Node via Multi-Stage (`base`, `dev`, `builder`, `prod`).
- [x] Splitar `docker-compose.yml` local hot-reload de `.prod.yml`.
- [ ] Atuar na rede com Let's Encrypt bot injetando certificados SSL/TLS para ambiente AWS HML.
