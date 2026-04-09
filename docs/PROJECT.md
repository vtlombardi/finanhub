# FINANHUB - Módulo Documentação (Docs & ADRs)

## 1. Responsabilidade do Módulo
Centralizar o conhecimento técnico, arquitetural e de produto do ecossistema. Responsável por manter registros de decisões de arquitetura (ADRs), manuais de onboarding e glossário de termos B2B/M&A.

## 2. O Que Ele Pode Fazer
- Armazenar ADRs (Architecture Decision Records).
- Conter diagramas de fluxo e arquitetura (Mermaid/PNG).
- Prover guias de configuração de ambiente para novos desenvolvedores.
- Documentar contratos de API e modelos de dados.

## 3. O Que Ele NÃO Pode Fazer
- **NUNCA** conter código executável da aplicação.
- **NUNCA** armazenar credenciais ou segredos em texto claro.
- **NUNCA** ser desatualizado após mudanças críticas em outros módulos (Documentação Viva).

## 4. Dependências Permitidas
- Formatos: Markdown (.md), Diagramas (.mermaid).
- Ferramentas: Static site generators (ex: Docusaurus/MkDocs) se necessário no futuro.

## 5. Interfaces de Comunicação
- **Desenvolvedores**: via leitura direta no repositório ou portal de docs.

## 6. Variáveis de Ambiente Usadas
- N/A (Módulo estático).

## 7. Como Rodar Isoladamente
1. `cd docs`
2. Utilizar um visualizador de Markdown (como VSCode ou GitHub).

## 8. Como Testar Isoladamente
- **Lint**: `markdownlint` para garantir padrão de escrita.
- **Links**: Verificar integridade de links internos entre documentos.

## 9. Como Integrar Com o Resto
O módulo `docs/` serve como o manual de instruções para todos os outros módulos. Ele é a primeira parada para entender como o Frontend consome o Backend ou como a IA processa os dados.

## 10. Estrutura de Pastas Explicada
- `adr/`: Registros históricos de decisões técnicas.
- `api/`: Detalhes técnicos de endpoints e payloads.
- `onboarding/`: Guias para novos membros do time.
- `assets/`: Imagens, diagramas e mídias de suporte.
