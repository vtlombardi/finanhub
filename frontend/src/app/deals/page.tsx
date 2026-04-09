'use client';

import { useState } from 'react';
import { PublicHeader } from "@/components/layout/PublicHeader";
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
  ArrowUpDown, 
  X,
  MapPin,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react';

import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'tech', name: 'Tecnologia' },
  { slug: 'industry', name: 'Indústria' },
  { slug: 'retail', name: 'Varejo' },
  { slug: 'services', name: 'Serviços' },
  { slug: 'finance', name: 'Finanças' },
  { slug: 'agrobusiness', name: 'Agronegócio' },
  { slug: 'health', name: 'Saúde' },
];

const STATES = [
  'SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'PE', 'CE', 'BA', 'AM'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealsShowcasePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refresh();
  };

  const handleFavorite = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/deals`);
      return;
    }
    try {
      const res = await ListingsService.toggleFavorite(listingId);
      // Aqui poderíamos usar um toast, mas manteremos o padrão para consistência
      alert(res.favorited ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.');
      refresh();
    } catch {
      alert('Falha ao atualizar favorito.');
    }
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.state || filters.sort !== 'newest';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      <PublicHeader />

      {/* Hero / Header */}
      <div className="pt-32 pb-16 bg-[#020617] border-b border-white/[0.03] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Marketplace Middle-Market</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-tight">
            Oportunidades de M&A
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl font-medium">
            Explore ativos auditados e oportunidades diretas de investimento e aquisição. 
            {pagination && <span className="text-slate-400"> Atualmente {pagination.total} empresas conectadas.</span>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Search & Main Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Setor, modelo de negócio ou região..."
              value={filters.q || ''}
              onChange={(e) => updateFilters({ q: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-2xl px-6 py-4 border transition-all flex items-center gap-2 font-semibold text-sm ${
                showFilters 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={18} />
              Filtros
              {hasActiveFilters && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
            </button>
            <button 
              onClick={refresh}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 py-4 font-bold text-sm transition-all shadow-xl shadow-blue-600/10 active:scale-95"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 mb-10 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Category */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Categoria
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                >
                  <option value="">Todas as Categorias</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-3 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={12} /> Faixa de Valuation (R$)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilters({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Mínimo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 outline-none focus:border-blue-500/40 font-mono"
                  />
                  <div className="w-4 h-px bg-slate-800 shrink-0" />
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Máximo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 outline-none focus:border-blue-500/40 font-mono"
                  />
                </div>
              </div>

              {/* State & Sort */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Região / UF
                </label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => updateFilters({ state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                >
                  <option value="">Brasil (Todos)</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800/50">
              <button 
                onClick={clearFilters} 
                className="text-xs font-bold text-slate-500 hover:text-slate-300 flex items-center gap-2 transition uppercase tracking-tighter"
              >
                <X size={14} /> Limpar tudo
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Ordenar:</span>
                  <select
                    value={filters.sort || 'newest'}
                    onChange={(e) => updateFilters({ sort: e.target.value as any })}
                    className="bg-transparent text-xs font-bold text-slate-400 outline-none cursor-pointer hover:text-white transition"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>
                    ))}
                  </select>
                </div>
                <button 
                   onClick={() => { setShowFilters(false); refresh(); }} 
                   className="text-xs font-bold bg-white text-black px-6 py-3 rounded-xl hover:bg-slate-200 transition active:scale-95"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 h-80 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum deal encontrado</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Tente ajustar seus filtros ou termos de busca para encontrar novas oportunidades.</p>
            <button onClick={clearFilters} className="mt-6 text-blue-500 font-bold hover:text-blue-400">Ver todas as oportunidades</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((deal) => (
                <Link href={`/deals/${deal.slug || deal.id}`} key={deal.id} className="group flex">
                  <div className={`bg-slate-900/40 border border-slate-800/80 rounded-[32px] overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col relative w-full ${
                    deal.isFeatured ? 'ring-1 ring-amber-500/20 bg-amber-500/[0.02]' : ''
                  }`}>
                    
                    {/* Visual indicators */}
                    <div className="absolute top-0 right-0 p-6 z-10">
                       {deal.isFeatured && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                          Premium Choice
                        </div>
                      )}
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
                              <Briefcase size={14} />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                             {deal.category?.name || 'Mercado Geral'}
                           </span>
                        </div>
                        <button
                          onClick={(e) => handleFavorite(e, deal.id)}
                          className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all z-20 group/fav"
                        >
                          <Heart size={16} className="group-active/fav:scale-125 transition-transform" />
                        </button>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {deal.title}
                      </h3>
                      
                      <p className="text-sm text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">
                        {deal.description}
                      </p>

                      <div className="mt-auto flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                           <div className="flex items-center gap-2">
                             <MapPin size={12} className="text-slate-700" />
                             {deal.state || 'BR'}
                           </div>
                           <div className="w-1 h-1 rounded-full bg-slate-800" />
                           <div className="flex items-center gap-2">
                             <Tag size={12} className="text-slate-700" />
                             M&A Deal
                           </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Valuation Alvo</p>
                            <p className="font-mono text-2xl font-bold text-white tracking-tighter">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(deal.price || 0))}
                            </p>
                          </div>
                          <div className="bg-white text-black h-12 w-12 rounded-2xl flex items-center justify-center opacity-0 scale-90 -translate-x-4 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300 shadow-2xl shadow-white/10">
                            <ChevronRight size={22} strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-20">
                <button
                  onClick={() => setPage(filters.page ? filters.page - 1 : 1)}
                  disabled={filters.page === 1 || !filters.page}
                  className="w-12 h-12 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pagination.totalPages }, (_, i) => {
                    const p = i + 1;
                    const isActive = p === (filters.page || 1);
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-12 w-12 rounded-2xl text-xs font-bold transition-all ${
                          isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(filters.page ? filters.page + 1 : 2)}
                  disabled={filters.page === pagination.totalPages}
                  className="w-12 h-12 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-400 hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
