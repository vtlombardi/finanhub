# FINANHUB - CONTEXT

## VISÃO GERAL
A FINANHUB é uma plataforma digital de negócios e oportunidades com inteligência artificial.

Seu objetivo é conectar:
- empresas
- investidores
- empreendedores
- anunciantes
- compradores

A plataforma funciona como um marketplace avançado de negócios, combinando:
- classificados premium
- hub de oportunidades
- gestão comercial
- inteligência artificial aplicada

## OBJETIVO DO PRODUTO
Permitir que usuários e empresas possam:
- anunciar produtos, serviços e oportunidades
- captar leads qualificados
- negociar diretamente dentro da plataforma
- utilizar IA para melhorar performance comercial
- acessar oportunidades relevantes com maior eficiência

---

## VISÃO DE NEGÓCIO
Ser o "LinkedIn do Capital Financeiro e Comercial". Onde ofertas de negócios complexas são transacionadas com o mesmo grau de velocidade e fluidez de um marketplace moderno, reduzindo o CAC de fundos e facilitando aquisições de assets reais.

## ARQUITETURA GERAL
Uma aplicação `Enterprise Full Stack Monorepo` contendo: Frontend em Next.js (SSR+CSR), Backend escalável construído em Node.js (NestJS), armazenamento em PostgreSQL, serviços orquestrados via containeres (Docker) na Nuvem e sub-módulo ativo provido por scripts de Machine Learning (LLMs/Embeddings).

## PRINCIPAIS MÓDULOS
- **Marketplace Público**: Buscador SEO Friendly com categorias dinâmicas de oportunidades.
- **Tenant Dashboard**: CMS onde a empresa administra seus anúncios, monitora métricas e propostas.
- **Hub de Comunicação**: Inbox em tempo real para negociações.
- **Módulo Administrador (Root)**: Moderação da saúde geral do ecossistema e financeiro.

## REGRAS DE NEGÓCIO CENTRAIS
1. O usuário final (User) sempre estará anexado a um contexto (Tenant/Company), mesmo que seja uma empresa "EIRELI" de um homem só.
2. Anúncios só vão ao ar após processo de validação em background pela camada Autônoma (AI-Agents).
3. Uma Proposta/Lead estabelecida abre um canal restrito e imutável de Chat entre Investidor e C-Level do Anunciante.

## FUNCIONAMENTO MULTI-TENANT
- A tabela mestre de agrupamento é o `Company` (ou Tenant).
- Todo registro persistido em base (seja Anúncio, Oferta ou Pagamento) carregará compulsoriamente a chave identificadora `tenant_id`. 
- Operações de backend possuem guardiões RBAC no middleware checando o token contra o tenant atual, bloqueando vazamento horizontal de dados.

## O PAPEL DA IA NO SISTEMA
Não se trata de um mero "chat de ajuda", mas sim Agentes Ocultos nos Webhooks. A IA modera linguagem ofensiva via Natural Language, cruza atributos customizados para alertar sobre golpes financeiros ("too good to be true"), e, no futuro, enviará e-mails de conexões sugeridas com base nos perfis históricos das pontas.

## PRINCIPAIS FLUXOS
- **Criação Rápida**: Cadastro → Cria Perfil Tenant → Edita Anúncio → Aguarda Autenticação IA → Live Status.
- **Deal Maker**: Investidor Logado → Avalia Anúncio → Clica "Enviar Proposta" → Chat Real-time criado para os fundadores daquele Tenant dono do anúncio.

## DIRETRIZES TÉCNICAS
- Todo o front deve consumir exclusivamente as rotas validadas de API.
- Zero Business-Logic deve residir na representação da View (Frontend). O frontend apenas injeta payloads.
- O versionamento do código segue padronizações baseadas no *Conventional Commits*.

## PADRÕES ARQUITETURAIS
- **Backend:** Padrão MVC (com Services pesados e Controllers finos), Orientado a Eventos e Injeção de Dependências.
- **Frontend:** Server-side Components como default. Client Components unicamente onde existe Hooks e Reatividade explícita no navegador.

## DECISÕES IMPORTANTES CONCORRENTES
- Escolha relacional de base de dados (PostgreSQL sobre NoSQL) devido à necessidade inerente de validação ACID e foreign keys rigorosas para operações de balanço financeiro e assinaturas em breve.

## ANTI-PADRÕES (O QUE NÃO FAZER)
- Não utilizar LocalStorage para Tokens vitais (Utilize HTTPOnly Cookies no Backend).
- Não realizar consultas diretas Front → DataBase de NENHUMA maneira.
- Não "chumbar" senhas, URL's de credenciais ou APIs keys hardcoded nos repositórios (uso exigido do `.env`).

## PRIORIDADES DO PROJETO
1. Segurança (Mitigação total de acesso via injeção/multitenant exploits).
2. Performance LCP/SEO (Velocidade de indexação da vitrine de Classificados).
3. Velocidade para mercado (Componentes prontos).

## VISÃO DE LONGO PRAZO
O ecossistema proverá conexões automatizadas via API externas, possibilitando não apenas o networking corporativo, mas a assinatura oficial em nuvem do escopo das transações fechadas dentro da própria plataforma FINANHUB (Legal e Fin-Ops).
