# FINANHUB - Módulo Infraestrutura (DevOps & Deploy)

## 1. Responsabilidade do Módulo
Prover o ambiente computacional, orquestração de containers, redes internas e pipelines de CI/CD. Responsável por garantir que todos os módulos (Front, Back, DB, IA) se integrem corretamente em ambiente de staging e produção.

## 2. O Que Ele Pode Fazer
- Orquestrar containers via `docker-compose`.
- Definir regras de Proxy reverso e Gateway (Nginx).
- Provisionar infraestrutura como código (IaC).
- Gerenciar variáveis de ambiente globais e segredos.
- Configurar volumes e persistência de arquivos.

## 3. O Que Ele NÃO Pode Fazer
- **NUNCA** conter lógica de código de aplicação (`.js`, `.py`, `.ts` de negócio).
- **NUNCA** ser exposto sem camadas de segurança (Firewall/VPC).
- **NUNCA** depender de estados manuais (Deve ser 100% declarativo).

## 4. Dependências Permitidas
- Ferramentas: Docker, Docker Compose.
- IaC: Terraform / CloudFormation (opcional).
- Proxy: Nginx / Traefik.
- CI/CD: GitHub Actions / GitLab CI.

## 5. Interfaces de Comunicação
- **Módulos**: via Docker Network (DNS interno).
- **External**: via Portas 80/443 (HTTP/HTTPS).

## 6. Variáveis de Ambiente Usadas
- Responsável por injetar TODAS as variáveis dos demais módulos a partir de arquivos `.env` ou Vaults secretos.

## 7. Como Rodar Isoladamente
1. `cd infra`
2. `docker compose up -d`
3. Isso subirá a infraestrutura base (Redes, Volumes) mesmo sem os containers de aplicação (que podem ser adicionados depois).

## 8. Como Testar Isoladamente
- **Lint**: Validar arquivos YAML e Nginx Configs.
- **Connectivity**: Testar resolvimento de nomes internos entre containers.

## 9. Como Integrar Com o Resto
A infraestrutura é o "cola" do projeto. Ela lê as imagens geradas pelos módulos e as executa com as configurações de rede que permitem a comunicação Backend <-> DB e Frontend <-> Backend.

## 10. Estrutura de Pastas Explicada
- `docker/`: Dockerfiles e scripts de entrada.
- `nginx/`: Configurações de Proxy e SSL.
- `scripts/`: Utilitários de automação de deploy.
- `iac/`: Definições de infraestrutura em nuvem.
