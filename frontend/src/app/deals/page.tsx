'use client';

import { useEffect, useState } from 'react';
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ListingsService, SearchFilters } from '@/features/listings/listings.service';
import Link from 'next/link';
import { Briefcase, Search, Heart, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { slug: 'tech', name: 'Tecnologia' },
  { slug: 'industry', name: 'Indústria' },
  { slug: 'retail', name: 'Varejo' },
  { slug: 'services', name: 'Serviços' },
  { slug: 'finance', name: 'Finanças' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
];

export default function DealsShowcasePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const fetchDeals = async (page = 1) => {
    setLoading(true);
    const filters: SearchFilters = { page, limit: 12, sort: sortBy };
    if (query) filters.q = query;
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    try {
      const result = await ListingsService.getPublicListings(filters);
      setDeals(result.data || []);
      setPagination(result.pagination || null);
      setCurrentPage(page);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeals(1);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setTimeout(() => fetchDeals(1), 0);
  };

  const handleFavorite = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/deals');
      return;
    }
    try {
      const res = await ListingsService.toggleFavorite(listingId);
      alert(res.favorited ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.');
    } catch {
      alert('Falha ao atualizar favorito.');
    }
  };

  const hasActiveFilters = category || minPrice || maxPrice || sortBy !== 'newest';

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 pb-20">
      <PublicHeader />

      <div className="pt-32 pb-12 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Oportunidades de M&A
          </h1>
          <p className="text-slate-400 mt-3 text-lg max-w-2xl">
            {pagination ? `${pagination.total} deals disponíveis` : 'Descubra transações no middle-market auditadas.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + Filter Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Busque por setor, nome ou modelo de negócio..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-medium transition shadow-lg shadow-blue-500/20 flex-shrink-0">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl px-4 py-3 border transition flex items-center gap-2 flex-shrink-0 ${showFilters ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
            </button>
          </div>
        </form>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="glass-panel rounded-xl p-6 mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categoria */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50"
                >
                  <option value="">Todas</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Preço Mínimo */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Preço Mínimo (R$)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50 font-mono"
                />
              </div>

              {/* Preço Máximo */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Preço Máximo (R$)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="∞"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50 font-mono"
                />
              </div>

              {/* Ordenação */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block flex items-center gap-1">
                  <ArrowUpDown size={12} /> Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/50"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
              <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 transition">
                <X size={14} /> Limpar filtros
              </button>
              <button onClick={() => fetchDeals(1)} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition">
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-panel h-64 rounded-xl animate-pulse bg-slate-800/50" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <Link href={`/deals/${deal.slug || deal.id}`} key={deal.id} className="group cursor-pointer">
                  <div className={`glass-panel rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col relative ${deal.isFeatured ? 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/10 ring-1 ring-amber-500/10' : 'hover:border-blue-500/50 hover:shadow-blue-500/10'}`}>
                    <div className={`h-2 bg-gradient-to-r ${deal.isFeatured ? 'from-amber-500 to-orange-500' : 'from-blue-600 to-indigo-500'}`}></div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                            <Briefcase size={12} /> {deal.category?.name || 'Mercado Geral'}
                          </span>
                          {deal.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                              ★ Destaque
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleFavorite(e, deal.id)}
                          className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 hover:text-rose-400 border border-slate-700 hover:bg-slate-700 transition pointer-events-auto"
                          title="Favoritar"
                        >
                          <Heart size={14} />
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {deal.title}
                      </h3>
                      {deal.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{deal.description}</p>
                      )}
                      <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-700/30">
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">VALUATION ALVO</p>
                          <p className="font-mono text-lg font-semibold text-slate-200">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(deal.price || 0))}
                          </p>
                        </div>
                        <div className="bg-blue-600 text-white h-8 w-8 rounded-lg flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {deals.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                Nenhum deal encontrado com os filtros selecionados.
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => fetchDeals(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => fetchDeals(p)}
                        className={`h-9 w-9 rounded-lg text-sm font-medium transition ${p === currentPage ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 7 && (
                    <span className="text-slate-500 px-2">...</span>
                  )}
                </div>
                <button
                  onClick={() => fetchDeals(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="text-xs text-slate-500 ml-2">
                  {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
