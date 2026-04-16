'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OpportunitySidebar, OpportunityFilters } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard, Opportunity } from '@/components/opportunities/OpportunityCard';
import { OpportunityHero } from '@/components/opportunities/OpportunityHero';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/fh-cards.css';


function OportunidadesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<OpportunityFilters | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar busca a partir da URL (somente no mount)
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const min = searchParams.get('min');
    const max = searchParams.get('max');
    const sort = searchParams.get('sort');

    setFilters({
      search: q || '',
      category: cat || 'Categoria',
      state: state || '',
      city: city || '',
      minPrice: min || '',
      maxPrice: max || '',
      sort: sort || 'newest',
      isVerified: false
    });
  }, []); // Executar apenas uma vez no mount

  // Fetch de dados reais
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (filters?.search) params.search = filters.search;
        if (filters?.category && filters.category !== 'Categoria' && filters.category !== 'Todas as Categorias') params.category = filters.category;
        if (filters?.state) params.state = filters.state;
        if (filters?.city) params.city = filters.city;
        if (filters?.minPrice) params.minPrice = parseFloat(filters.minPrice);
        if (filters?.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
        if (filters?.sort) params.sort = filters.sort;

        // Chamada API real via OpportunityClient ou fetch direto se for público
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/opportunities?${new URLSearchParams(params).toString()}`);
        
        if (!response.ok) throw new Error('Falha ao carregar oportunidades');
        
        const json = await response.json();
        
        // Mapeamento para o formato da UI
        const mapped: Opportunity[] = json.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: item.category,
          categorySlug: item.category?.slug,
          subcategory: item.subtitle || item.category?.name,
          location: item.state ? `${item.city ? item.city + ', ' : ''}${item.state}` : item.location || 'Localização não informada',
          price: item.price,
          rating: item.rating || 0,
          date: item.date || 'Recém publicado',
          image: item.logoUrl || item.image || '',
          verified: item.verified || false,
          status: item.status || 'Ativo'
        }));

        setOpportunities(mapped);
      } catch (err: any) {
        console.error('Erro ao carregar anúncios:', err);
        setError('Não foi possível carregar as oportunidades. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    }

    if (filters) {
      fetchListings();
    }
  }, [filters]);

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
    // Agora o filtro e ordenação base são feitos no backend, 
    // mas mantemos este useMemo para possíveis refinamentos locais ou se o fetch falhar e usar mock
    return opportunities;
  }, [opportunities]);

  return (
    <div className="min-h-screen bg-[#020617] pb-20">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <main className="pt-[68px]">
        <OpportunityHero />

        <div className="container mx-auto px-4 max-w-[1400px] mt-16 pb-60">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-[320px] shrink-0">
              <OpportunitySidebar 
                onFilterChange={handleFilterChange} 
                initialSearch={searchParams.get('q') || ''} 
                initialCategory={searchParams.get('category') || ''}
              />
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

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <div className="w-12 h-12 border-4 border-[#12b3af]/20 border-t-[#12b3af] rounded-full animate-spin mb-4"></div>
                  <p className="text-white/40 font-medium animate-pulse">Buscando as melhores oportunidades...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-red-500/20 bg-red-500/5">
                   <p className="text-red-400 font-medium">{error}</p>
                   <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 text-white/60 text-sm hover:text-white underline"
                   >
                     Tentar novamente
                   </button>
                </div>
              ) : filteredAndSortedOpportunities.length > 0 ? (
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
