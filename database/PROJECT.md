# FINANHUB - Módulo Database (PostgreSQL + Prisma)

## 1. Responsabilidade do Módulo
Garantir a persistência, integridade e disponibilidade dos dados do ecossistema. Responsável pela definição do schema relacional, versionamento via migrações e fornecimento de dados iniciais (seeding) para desenvolvimento.

## 2. O Que Ele Pode Fazer
- Definir tabelas, índices e relacionamentos (Foreign Keys).
- Gerar migrações SQL a partir do schema Prisma.
- Suportar Tiers de Monetização (BASE, PROFESSIONAL, ELITE).
- Persistir histórico de assinaturas e balanço de créditos pro-rata.
- Executar scripts de Seed para popular o banco de dados.
- Realizar introspecção de bancos existentes.

## 3. O Que Ele NÃO Pode Fazer
- **NUNCA** conter lógica de negócio (Calculos, fluxos de API).
- **NUNCA** ser acessado diretamente pelo Frontend.
- **NUNCA** depender de dependências do `/backend` ou `/frontend`.
- **NUNCA** armazenar dados binários grandes (deve salvar apenas a referência/URL para o Storage).

## 4. Dependências Permitidas
- ORM: Prisma CLI / Prisma Client.
- Runtime: Node.js (para execução do Prisma/TS-Node).
- Database: PostgreSQL (via Docker).

## 5. Interfaces de Comunicação
- **Backend**: via Protocolo TCP/IP (Pool de conexões PostgreSQL).
- **CLI**: Interface de linha de comando Prisma para desenvolvedores.

## 6. Variáveis de Ambiente Usadas
- `DATABASE_URL`: String de conexão (ex: `postgresql://user:pass@localhost:5432/finanhub`).
- `DIRECT_URL`: Usada para migrações em alguns provedores cloud.

## 7. Como Rodar Isoladamente
1. `cd database`
2. `docker compose up -d` (para subir o PostgreSQL local).
3. `npx prisma migrate dev` (para aplicar o schema).

## 8. Como Testar Isoladamente
- **Schema Validation**: `npx prisma validate`.
- **Dry Run Migrations**: Verificar arquivos `.sql` gerados na pasta `prisma/migrations`.
- **Studio**: `npx prisma studio` para explorar os dados visualmente.

## 9. Como Integrar Com o Resto
O módulo exporta o `schema.prisma` que é consumido pelo `/backend` para gerar o `PrismaClient` tipado. A comunicação em tempo de execução é puramente via string de conexão `DATABASE_URL`.

## 10. Estrutura de Pastas Explicada
- `prisma/`: Contém o arquivo `schema.prisma` (Fonte da Verdade).
- `prisma/migrations/`: Histórico imutável de alterações no banco.
- `prisma/seed.ts`: Script de carga inicial de dados.
- `docker-compose.yml`: Definição da stack de banco de dados local.
