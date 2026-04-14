'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OpportunitySidebar, OpportunityFilters } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard, Opportunity } from '@/components/opportunities/OpportunityCard';
import { OpportunityHero } from '@/components/opportunities/OpportunityHero';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/fh-cards.css';

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'TechNova Solutions',
    description: 'Líder em desenvolvimento de software B2B com crescimento de 30% YoY. Empresa consolidada no mercado de tecnologia com alta escalabilidade e base de clientes recorrentes.',
    category: 'Tecnologia',
    subcategory: 'Software B2B',
    location: 'São Paulo, SP',
    price: 'R$ 5.000.000,00',
    rating: 4.90,
    date: 'Publicado há 74 dias',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
    verified: true,
    status: 'Ativo'
  },
  {
    id: '2',
    title: 'Clínica Bem-Estar',
    description: 'Centro médico especializado com 5 anos de operação. Equipamentos de última geração, clientela fiel e localização privilegiada.',
    category: 'Saúde',
    subcategory: 'Clínica Médica',
    location: 'Rio de Janeiro, RJ',
    price: 'R$ 2.800.000,00',
    rating: 4.80,
    date: 'Publicado há 74 dias',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
    verified: false,
    status: 'Ativo'
  },
  {
    id: '3',
    title: 'CapitalFlow Finanças',
    description: 'Plataforma de gestão financeira para PMEs com base de clientes em expansão. Modelo SaaS com receita recorrente.',
    category: 'Finanças',
    subcategory: 'SaaS',
    location: 'Belo Horizonte, MG',
    price: 'R$ 8.500.000,00',
    rating: 5.00,
    date: 'Publicado há 74 dias',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    verified: true,
    status: 'Ativo'
  },
  {
    id: '4',
    title: 'Boutique Aurora',
    description: 'Marca de moda feminina consolidada com loja em shopping de alto padrão. E-commerce ativo e forte presença nas redes sociais.',
    category: 'Varejo',
    subcategory: 'Moda',
    location: 'Porto Alegre, RS',
    price: 'R$ 1.500.000,00',
    rating: 4.60,
    date: 'Publicado há 74 dias',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop',
    verified: false,
    status: 'Ativo'
  },
  {
    id: '5',
    title: 'EcoLogistics BR',
    description: 'Operação logística sustentável com frota de veículos elétricos. Contratos de longo prazo com grandes varejistas.',
    category: 'Logística',
    subcategory: 'E-commerce',
    location: 'Curitiba, PR',
    price: 'R$ 12.000.000,00',
    rating: 4.75,
    date: 'Publicado há 12 dias',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop',
    verified: true,
    status: 'Ativo'
  },
  {
    id: '6',
    title: 'SolarGrid Energy',
    description: 'Instaladora de painéis solares com forte presença no Nordeste. Pipeline de projetos aprovados para os próximos 2 anos.',
    category: 'Energia',
    subcategory: 'Renovável',
    location: 'Recife, PE',
    price: 'R$ 3.200.000,00',
    rating: 4.85,
    date: 'Publicado há 5 dias',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop',
    verified: true,
    status: 'Ativo'
  }
];

function OportunidadesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<OpportunityFilters | null>(null);

  // Inicializar busca a partir da URL (somente no mount)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !filters) {
      setFilters(prev => ({
        ...(prev || {} as OpportunityFilters),
        search: q
      } as OpportunityFilters));
    }
  }, []); // Executar apenas uma vez no mount

  const handleFilterChange = (newFilters: OpportunityFilters) => {
    setFilters(newFilters);
    
    // Sincronizar com a URL
    const params = new URLSearchParams();
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.category && newFilters.category !== 'Categoria') params.set('category', newFilters.category);
    if (newFilters.state) params.set('state', newFilters.state);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.minPrice) params.set('min', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('max', newFilters.maxPrice);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    
    // Atualizar a URL sem forçar re-render completo ou scroll
    const newUrl = `/oportunidades?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  };

  const filteredAndSortedOpportunities = useMemo(() => {
    let result = [...MOCK_OPPORTUNITIES];

    if (filters) {
      // 1. Busca Inteligente (titulo, descricao, categoria, subcategoria, cidade, estado)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(opp => 
          opp.title.toLowerCase().includes(query) ||
          opp.description.toLowerCase().includes(query) ||
          opp.category.toLowerCase().includes(query) ||
          opp.subcategory.toLowerCase().includes(query) ||
          opp.location.toLowerCase().includes(query)
        );
      }

      // 2. Filtros Exatos
      if (filters.category && filters.category !== 'Categoria' && filters.category !== 'Todas as Categorias') {
        // Mapeamento simples para match com o mock
        const catMap: Record<string, string> = {
            'empresas': 'Tecnologia', // Exemplo simplificado
            'saude': 'Saúde',
            'financas': 'Finanças',
            'varejo': 'Varejo',
            'logistica': 'Logística',
            'energia': 'Energia'
        };
        const targetCat = catMap[filters.category.toLowerCase()] || filters.category;
        result = result.filter(opp => opp.category.toLowerCase() === targetCat.toLowerCase());
      }

      if (filters.state) {
        result = result.filter(opp => opp.location.includes(filters.state));
      }

      if (filters.city) {
        result = result.filter(opp => opp.location.includes(filters.city));
      }

      // 3. Faixa de Preço
      const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^\d]/g, '')) || 0;
      
      if (filters.minPrice) {
        result = result.filter(opp => parsePrice(opp.price) >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        result = result.filter(opp => parsePrice(opp.price) <= parseFloat(filters.maxPrice));
      }

      // 4. Qualidade / Verificado
      if (filters.isVerified) {
        result = result.filter(opp => opp.verified);
      }

      // 5. Ordenação
      if (filters.sort) {
        switch (filters.sort) {
          case 'price_asc':
            result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            break;
          case 'price_desc':
            result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            break;
          case 'verificados_first':
            result.sort((a, b) => (a.verified === b.verified ? 0 : a.verified ? -1 : 1));
            break;
          default:
            // 'desc' / Mais Recentes
            break;
        }
      }
    }

    return result;
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#020617] pb-20">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="pt-[68px]">
        <OpportunityHero />

        <div className="container mx-auto px-4 max-w-[1400px] mt-16">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-[320px] shrink-0">
              <OpportunitySidebar onFilterChange={handleFilterChange} initialSearch={searchParams.get('q') || ''} />
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-10 bg-white/[0.02] border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Lista de <span className="text-[#12b3af]">Oportunidades</span>
                  </h2>
                  <p className="text-sm text-white/40 mt-1">
                    Exibindo {filteredAndSortedOpportunities.length} ativos disponíveis para negociação
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden sm:block">Ordenar por:</span>
                  <div className="relative group">
                    <button className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0B1220] px-5 py-2.5 text-xs font-bold text-white/80 hover:text-white hover:border-[#12b3af]/40 transition-all outline-none shadow-xl">
                      <span>{filters?.sort === 'price_asc' ? 'Menor Preço' : filters?.sort === 'price_desc' ? 'Maior Preço' : 'Mais Recentes'}</span>
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none" className="text-[#12b3af]"><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

              {filteredAndSortedOpportunities.length > 0 ? (
                <div className="fh-cards">
                  {filteredAndSortedOpportunities.map(opp => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-white/10 bg-white/5">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20 mb-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                   <p className="text-white/40 font-medium">Nenhuma oportunidade encontrada com os filtros atuais.</p>
                   <button 
                    onClick={() => {
                        window.history.pushState({}, '', '/oportunidades');
                        window.location.reload();
                    }}
                    className="mt-4 text-[#12b3af] text-sm font-bold hover:underline"
                   >
                     Limpar todos os filtros
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OportunidadesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Carregando...</div>}>
      <OportunidadesContent />
    </Suspense>
  );
}
