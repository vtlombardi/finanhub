'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OpportunityHero } from '@/components/opportunities/OpportunityHero';
import { OpportunitySidebar, OpportunityFilters } from '@/components/opportunities/OpportunitySidebar';
import { OpportunityCard, Opportunity } from '@/components/opportunities/OpportunityCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Grid, List, SortAsc, LayoutGrid, Info, Search, Loader2, AlertCircle } from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [authOpen, setAuthOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<OpportunityFilters>({
    category: null,
    subcategory: null,
    state: null,
    city: null,
    minPrice: '',
    maxPrice: '',
    verified: false,
  });

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      if (sidebarFilters.category) params.append('category', sidebarFilters.category);
      if (sidebarFilters.subcategory) params.append('subcategory', sidebarFilters.subcategory);
      if (sidebarFilters.state) params.append('state', sidebarFilters.state);
      if (sidebarFilters.city) params.append('city', sidebarFilters.city);
      if (sidebarFilters.minPrice) params.append('minPrice', sidebarFilters.minPrice);
      if (sidebarFilters.maxPrice) params.append('maxPrice', sidebarFilters.maxPrice);
      if (sidebarFilters.verified) params.append('verified', 'true');

      const response = await fetch(`http://localhost:3000/opportunities?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao carregar oportunidades');
      
      const result = await response.json();
      setOpportunities(result.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Não foi possível carregar as oportunidades. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, sidebarFilters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSearch = (query: string, ai: boolean) => {
    setSearchQuery(query);
    setIsAiMode(ai);
  };

  const handleFilterChange = (filters: OpportunityFilters) => {
    setSidebarFilters(filters);
  };


  return (
    <>
      <Header onOpenAuth={() => setAuthOpen(true)} />
      <main className="bg-[#05080f] min-h-screen">
        <OpportunityHero onSearch={handleSearch} initialQuery={searchQuery} />

        <section className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
               <OpportunitySidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Results Grid */}
            <div className="flex-1 space-y-8">
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-[#12b3af]/10 text-[#12b3af] px-4 py-1.5 rounded-full text-sm font-bold border border-[#12b3af]/20">
                    {loading ? 'Buscando...' : `${opportunities.length} ${opportunities.length === 1 ? 'Oportunidade encontrada' : 'Oportunidades encontradas'}`}
                    </div>
                    {searchQuery && (
                        <div className="text-gray-500 text-sm hidden md:block italic">
                            Resultados para: <span className="text-white font-medium">"{searchQuery}"</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2 hidden md:flex">
                     <button className="p-2 rounded-lg bg-[#12b3af] text-white transition-all"><LayoutGrid className="w-4 h-4" /></button>
                     <button className="p-2 rounded-lg text-gray-400 hover:text-white transition-all"><List className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider hidden sm:inline">Ordenar:</span>
                    <select 
                        className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#12b3af]/40 cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest" className="bg-[#0a101b]">Recentemente Adicionadas</option>
                        <option value="verified" className="bg-[#0a101b]">Verificadas Primeiro</option>
                        <option value="price-high" className="bg-[#0a101b]">Maior Valor</option>
                        <option value="price-low" className="bg-[#0a101b]">Menor Valor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Discovery Engine Suggestion (IA feedback) */}
              {isAiMode && searchQuery && !loading && (
                <div className="bg-[#12b3af]/5 border border-[#12b3af]/20 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in duration-500">
                    <div className="bg-[#12b3af] p-3 rounded-xl shadow-[0_0_15px_rgba(18,179,175,0.4)]">
                        <Info className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-white font-bold text-lg">Insight da IA HAYAI</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Analisei os resultados para <span className="text-[#12b3af]">"{searchQuery}"</span>. 
                            Encontrei oportunidades com alto potencial de ROI e modelos de negócio escaláveis. 
                            Recomendo filtrar por <span className="text-white font-medium italic">"Verificados"</span> para maior segurança institucional.
                        </p>
                    </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                      <Loader2 className="w-12 h-12 text-[#12b3af] animate-spin" />
                      <p className="text-gray-400 animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Processando base de dados...</p>
                  </div>
              )}

              {/* Error State */}
              {error && !loading && (
                  <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center space-y-4">
                      <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                          <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-2">
                          <h4 className="text-white font-bold text-lg">Erro na Conexão</h4>
                          <p className="text-gray-400 text-sm">{error}</p>
                      </div>
                      <button 
                        onClick={() => fetchOpportunities()}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
                      >
                          Tentar novamente
                      </button>
                  </div>
              )}

              {/* Grid */}
              {!loading && !error && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {opportunities.map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
              )}

              {/* Empty State */}
              {!loading && !error && opportunities.length === 0 && (
                <div className="text-center py-24 space-y-6">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white uppercase">Nenhum negócio encontrado</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Tente ajustar seus filtros ou mude sua busca para encontrar o que procura.</p>
                    </div>
                    <button 
                        onClick={() => { setSearchQuery(''); setSortBy('newest'); fetchOpportunities(); }}
                        className="text-[#12b3af] font-bold border-b border-[#12b3af] pb-1 hover:text-white hover:border-white transition-all uppercase tracking-widest text-sm"
                    >
                        Limpar todos os filtros
                    </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
