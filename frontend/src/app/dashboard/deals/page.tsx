'use client';

import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { ListingsService } from '@/services/ListingsService';
import Link from 'next/link';
import { 
  Briefcase, 
  Search, 
  Heart, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  X,
  MapPin,
  TrendingUp,
  Tag,
  DollarSign,
  Activity,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Dashboard.module.css';

const CATEGORIES = [
  { slug: 'tech', name: 'Tecnologia' },
  { slug: 'industry', name: 'Indústria' },
  { slug: 'retail', name: 'Varejo' },
  { slug: 'services', name: 'Serviços' },
  { slug: 'finance', name: 'Finanças' },
  { slug: 'agrobusiness', name: 'Agronegócio' },
  { slug: 'health', name: 'Saúde' },
];

const STATES = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'PE', 'CE', 'BA', 'AM'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor valor' },
  { value: 'price_desc', label: 'Maior valor' },
];

export default function IntegratedMarketplacePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { show } = useNotificationStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const { 
    listings, 
    pagination, 
    loading, 
    filters, 
    updateFilters, 
    clearFilters, 
    setPage,
    refresh
  } = useListings({ limit: 12, sort: 'newest' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refresh();
  };

  const handleFavorite = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/dashboard/deals`);
      return;
    }
    try {
      const res = await ListingsService.toggleFavorite(listingId);
      show(res.favorited ? 'Oportunidade salva nos favoritos.' : 'Removido dos favoritos.', 'success');
      refresh();
    } catch {
      show('Falha ao processar solicitação.', 'error');
    }
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.state || (filters.sort && filters.sort !== 'newest');

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className={styles.pageHeader} style={{ marginBottom: '40px' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#00b8b2] animate-pulse" />
            <span className="text-[10px] font-black text-[#00b8b2] uppercase tracking-[0.2em]">Live Marketplace Feed</span>
          </div>
          <h1>Oportunidades Estratégicas</h1>
          <p>Terminal de exploração de ativos, parcerias e aquisições no Middle-Market.</p>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`${styles.btnGhost} px-6 rounded-xl border border-white/5 flex items-center gap-3 font-bold text-xs h-12 ${showFilters ? 'bg-white/5 border-white/20 text-white' : ''}`}
          >
            <Filter size={16} />
            Filtros Avançados
            {hasActiveFilters && <div className="w-1.5 h-1.5 rounded-full bg-[#00b8b2]" />}
          </button>
          <button 
             onClick={refresh}
             className={`${styles.btnBrand} px-8 rounded-xl flex items-center gap-2 font-bold text-xs h-12 shadow-xl shadow-[#00b8b215]`}
          >
            <Activity size={16} />
            Atualizar Terminal
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={styles.card} style={{ marginBottom: '40px', padding: '32px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Busca Rápida</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input 
                  type="text"
                  placeholder="Setor ou palavra-chave..."
                  className="w-full bg-black/20 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00b8b220] transition-all"
                  value={filters.q || ''}
                  onChange={(e) => updateFilters({ q: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Indústria</label>
              <select 
                className="w-full bg-black/20 border border-white/5 rounded-lg py-2.5 px-4 text-sm text-[#8fa6c3] outline-none"
                value={filters.category || ''}
                onChange={(e) => updateFilters({ category: e.target.value })}
              >
                <option value="">Todas as áreas</option>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug} className="bg-[#020617]">{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Geografia</label>
              <select 
                className="w-full bg-black/20 border border-white/5 rounded-lg py-2.5 px-4 text-sm text-[#8fa6c3] outline-none"
                value={filters.state || ''}
                onChange={(e) => updateFilters({ state: e.target.value })}
              >
                <option value="">Brasil (Geral)</option>
                {STATES.map(s => <option key={s} value={s} className="bg-[#020617]">{s}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Ordenação</label>
              <select 
                className="w-full bg-black/20 border border-white/5 rounded-lg py-2.5 px-4 text-sm text-[#8fa6c3] outline-none font-bold"
                value={filters.sort || 'newest'}
                onChange={(e) => updateFilters({ sort: e.target.value as any })}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#020617]">{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
            <button onClick={clearFilters} className="text-[10px] font-black text-[#475569] hover:text-white uppercase tracking-widest flex items-center gap-2 transition">
              <X size={14} /> Limpar Parâmetros
            </button>
            <div className="flex gap-4">
               <button onClick={() => { setShowFilters(false); refresh(); }} className={styles.btnBrand} style={{ height: '40px', padding: '0 24px', fontSize: '11px', borderRadius: '10px' }}>
                 Aplicar Critérios de Matching
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[340px] rounded-3xl bg-white/[0.01] border border-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="py-40 text-center">
           <Search size={40} className="mx-auto mb-6 text-[#1e293b]" />
           <h3 className="text-xl font-black text-white mb-2">Sem resultados para estes critérios</h3>
           <p className="text-sm text-[#475569] max-w-sm mx-auto mb-8">Refine sua busca ou limpe os filtros para visualizar novas oportunidades.</p>
           <button onClick={clearFilters} className={styles.btnGhost}>Ver Todas as Oportunidades</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((deal) => (
            <Link key={deal.id} href={`/dashboard/deals/${deal.slug || deal.id}`} className="block">
              <div 
                className={styles.card} 
                style={{ 
                   padding: '28px', 
                   height: '100%', 
                   display: 'flex', 
                   flexDirection: 'column', 
                   borderStyle: 'solid', 
                   borderColor: 'rgba(255,255,255,0.04)',
                   transition: '0.3s ease-out'
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <div className="px-2.5 py-1 rounded-md bg-[#00b8b210] border border-[#00b8b220] text-[#00b8b2] text-[9px] font-black uppercase tracking-widest">
                       {deal.category?.name || 'Mercado Geral'}
                    </div>
                    {deal.isFeatured && (
                      <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                         Premium
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleFavorite(e, deal.id)}
                    className="w-8 h-8 rounded-lg bg-black/20 border border-white/5 flex items-center justify-center text-[#475569] hover:text-rose-500 transition-colors"
                  >
                    <Heart size={14} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-[#00b8b2] transition-colors">{deal.title}</h3>
                
                <p className="text-sm text-[#64748b] font-medium leading-relaxed line-clamp-3 mb-8">
                  {deal.description}
                </p>

                <div className="mt-auto space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <MapPin size={12} className="text-[#334155]" />
                       <span className="text-[11px] font-black text-[#475569] uppercase tracking-widest">{deal.state || 'BR'}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-2">
                       <Tag size={12} className="text-[#334155]" />
                       <span className="text-[11px] font-black text-[#475569] uppercase tracking-widest">M&A Opportunity</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-[#475569] uppercase tracking-widest mb-1">Target Valuation</p>
                      <p className="text-xl font-black text-white font-mono tracking-tighter">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(deal.price || 0))}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                       <ArrowRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          <button 
            disabled={filters.page === 1}
            onClick={() => setPage(filters.page ? filters.page - 1 : 1)}
            className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-center text-[#475569] hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 px-4">
             <span className="text-[11px] font-black text-[#475569] uppercase tracking-widest">Página</span>
             <span className="text-[11px] font-black text-white">{filters.page || 1}</span>
             <span className="text-[11px] font-black text-[#475569] uppercase tracking-widest">de</span>
             <span className="text-[11px] font-black text-white">{pagination.totalPages}</span>
          </div>
          <button 
            disabled={filters.page === pagination.totalPages}
            onClick={() => setPage(filters.page ? filters.page + 1 : 2)}
            className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-center text-[#475569] hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
