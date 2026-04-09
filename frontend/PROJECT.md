# FINANHUB - Módulo Frontend (Next.js)

## 1. Responsabilidade do Módulo
Prover a interface de usuário (UI/UX) de alta fidelidade para o marketplace FINANHUB. Responsável por renderização SSR (SEO), gestão de estado de interface, captura de leads e navegação do dashboard.

## 2. O Que Ele Pode Fazer
- Renderizar páginas complexas de anúncios e dashboards.
- Gerenciar estado local e global de UI (Zustand).
- Consumir APIs REST via camada de `services/`.
- Gating de interface via componente `PlanGate` (BASE, PROFESSIONAL, ELITE).
- Controle reativo de limites de uso via hook `useSubscription`.
- Renderização de IA Banners (HayiaInsightCard) para upsell contextual.
- Validar formulários (Zod/React Hook Form).
- Lidar com autenticação via Cookies HTTP-Only (injetados pelo backend).

## 3. O Que Ele NÃO Pode Fazer
- **NUNCA** acessar o banco de dados diretamente.
- **NUNCA** conter lógica de negócio pesada (Cálculos de ROI, validações de fraude, etc. devem estar no Backend).
- **NUNCA** importar código das pastas `/backend`, `/database` ou `/ai-agents`.
- **NUNCA** armazenar segredos de infraestrutura (apenas variáveis públicas prefixadas com `NEXT_PUBLIC_`).

## 4. Dependências Permitidas
- Framework: Next.js 16.x.
- UI: TailwindCSS, Lucide Icons, Shadcn/UI (se aplicável).
- State: Zustand.
- API: Axios.
- Validation: Zod, React Hook Form.

## 5. Interfaces de Comunicação
- **Backend**: via HTTPS/REST (Endpoints no padrão JSON).
- **Storage**: via Presigned URLs (Upload direto para o bucket).

## 6. Variáveis de Ambiente Usadas
- `NEXT_PUBLIC_API_URL`: URL base do backend.
- `NEXT_PUBLIC_APP_URL`: URL base do próprio frontend.

## 7. Como Rodar Isoladamente
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. O frontend entrará em modo "Isolado" se o backend estiver offline, utilizando falbacks no interceptor do Axios.

## 8. Como Testar Isoladamente
- **Unitários**: `npm run test` (Vitest/Jest).
- **Componentes**: Storybook (se configurado).
- **Lint**: `npm run lint`.

## 9. Como Integrar Com o Resto
A integração ocorre configurando a `NEXT_PUBLIC_API_URL` no `.env.local` para apontar para o container/host do Backend. A autenticação é transparente via Cookies.

## 10. Estrutura de Pastas Explicada
- `src/app/`: Rotas Next.js (App Router).
- `src/components/`: Componentes de UI reutilizáveis (Hero, SearchBar, etc).
- `src/services/`: Camada única de comunicação com APIs.
- `src/store/`: Gestão de estado global (Zustand).
- `src/types/`: Definição de interfaces TS (alinhadas com os contratos do Backend).
- `src/hooks/`: Hooks customizados para lógica de UI reutilizável.
