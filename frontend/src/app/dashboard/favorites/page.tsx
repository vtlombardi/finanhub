'use client';

import React, { useState, useMemo } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useNotificationStore } from '@/store/useNotificationStore';
import { 
  Heart, 
  Loader2, 
  Bookmark,
  TrendingUp,
  Activity,
  Search,
  ArrowRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';
import { FavoriteCard } from './components/FavoriteCard';
import { FavoritesFilters } from './components/FavoritesFilters';

const CATEGORIES = [
  { slug: 'tech', name: 'Tecnologia' },
  { slug: 'industry', name: 'Indústria' },
  { slug: 'retail', name: 'Varejo' },
  { slug: 'services', name: 'Serviços' },
  { slug: 'finance', name: 'Finanças' },
  { slug: 'agrobusiness', name: 'Agronegócio' },
  { slug: 'health', name: 'Saúde' },
];

export default function FavoritesPage() {
  useAuthGuard();
  const { favorites, loading, error, toggleFavorite } = useFavorites();
  const { show } = useNotificationStore();

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const handleRemove = async (id: string) => {
    try {
      await toggleFavorite(id);
      show('Oportunidade removida dos seus interesses.', 'success');
    } catch {
      show('Erro ao remover favorito.', 'error');
    }
  };

  // Logic for Filtering and Sorting
  const filteredFavorites = useMemo(() => {
    let result = [...favorites]; 

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(s) || 
        l.description.toLowerCase().includes(s) ||
        (l.city && l.city.toLowerCase().includes(s))
      );
    }

    if (category) {
      result = result.filter(l => l.category?.slug === category);
    }

    if (sort === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'activity') {
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else {
      // newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [favorites, search, category, sort]);

  const stats = [
    { label: 'Oportunidades Salvas', value: favorites.length, icon: Bookmark, color: '#00b8b2' },
    { label: 'Match com Perfil', value: '88%', icon: TrendingUp, color: '#10b981' },
    { label: 'Atividade no Setor', value: 'Alta', icon: Activity, color: '#fb923c' },
  ];

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-var(--brand) animate-pulse" />
             <span className="text-[10px] font-black text-var(--brand) uppercase tracking-[0.2em]">Investment Backlog</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Central de Interesses</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Sua seleção estratégica de ativos e acompanhamento de M&A.</p>
        </div>
        
        <Link 
          href="/dashboard/deals"
          className={`${styles.btnBrand} px-8 h-12 rounded-xl flex items-center gap-3 font-bold text-xs shadow-xl shadow-var(--brand-glow)`}
        >
          Explorar Novos Deals
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${styles.card} flex items-center gap-5 p-6 border-white/5`}>
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 hover:scale-110" 
              style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20`, color: stat.color }}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight font-mono">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      {favorites.length > 0 && (
        <FavoritesFilters 
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          categories={CATEGORIES}
        />
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-var(--brand) animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sincronizando Portfólio...</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-32 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center mb-8">
            <Heart size={40} className="text-slate-700" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Seu backlog está vazio</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
            Seus interesses estratégicos aparecerão aqui. Comece explorando o marketplace para salvar as melhores oportunidades.
          </p>
          <Link href="/dashboard/deals" className={styles.btnBrand} style={{ padding: '0 40px', height: '56px', borderRadius: '16px' }}>
            Explorar Marketplace
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="py-32 flex flex-col items-center text-center">
          <Search size={40} className="text-slate-800 mb-6" />
          <h3 className="text-lg font-black text-white mb-2">Nenhum resultado para os filtros</h3>
          <p className="text-slate-500 mb-8">Tente ajustar seus critérios de busca ou categorias.</p>
          <button onClick={() => { setSearch(''); setCategory(''); setSort('newest'); }} className={styles.btnGhost}>
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
          {filteredFavorites.map((listing: any) => (
            <FavoriteCard 
              key={listing.id} 
              listing={listing} 
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
