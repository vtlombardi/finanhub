# FINANHUB - Documentação Módulo Frontend Enterprise

## 1. Visão do Frontend
Fornecer a interface premium baseada na experiência "Marketplace/SaaS corporativo". Next.js (App Router) domina o SSR focando em SEO veloz para anúncios de fusão/venda e React-Client garante um painel administrativo liso para a gestão de conversas em M&A B2B.

## 2. Padrão Organizacional Limpo (/frontend/src)
Para que milhares de anúncios simultâneos rodem, dividimos as responsabilidades em taxonomia forte de pastas evitando "Componentes Fitas Ocultas".
- **`/app`**: Encapsulador final de rotas de página organizadas por Grupos Lógicos, não por arquivos longos.
- **`/components`**: Estritamente pedaços de UI "burros" e visuais ou layouts estruturais como Heads e Carousels.
- **`/features`**: Toda a aglomeração lógica vertical. O "State de Auth" só existe dentro de `/features/auth`.
- **`/services`**: A API layer centralizada e Interceptor HTTP. Componente e Views nunca sabem onde fica a URL do backend.
- **`/store`**: Extensão volátil (Zustand) guardando estado do tenant.
- **`/hooks`**: Funções abstratas React puras que injetam mutações externas para UI.
- **`/types`**: Os contratos do TS espelhando `/backend`.
- **`/lib`**: Dependências configuradas (exemplo: prisma mock ou lib de PDF genérica isolada).
- **`/utils`**: Pure functions para validações (Sem dependências em React Native ou Axios).

## 3. Topologia de Rotas Desacopladas (Route Groups)
- **`(public)`**: Rotas expostas de alto tráfego que batem nos caches ISR/SSG do Vercel/Next (Busca SEO).
   - `/ads`: Vitrine listando deals.
- **`(auth)`**: Domínio da entrada.
   - `/login`
   - `/register`
- **`(dashboard)`**: O núcleo Multi-tenant privado (Onde o B2B acontece).
   - `/dashboard`: Painel base.
   - `/dashboard/leads`: Gerencimento.

## 4. Camada de Integração API
Desenhada em Classes Singleton/Static isoladas dentro do `/services/api.ts` e `/services/auth.service.ts`.
Todo payload enviado do Formulário atravessa essa camada, garantindo que o token embutido seja injetado invisivelmente nas Headers. 

## 5. Estratégia de Autenticação JWT 
Adotada via Instância React Context em `/features/auth/AuthProvider.tsx`, repassando o objeto `user: ITenant` limpo para a hierarquia da tela. O token material (string Base64) vive apenas em cache seguro/Http-cookie.

## 6. Backlog Técnico do Frontend
- [x] Configurar interceptor Axios interceptando erro Code 401 e executando `logout` forçado global.
- [ ] Converter listagens cruas para tipagens Zod de validação local nos campos do form `/anuncie`.
