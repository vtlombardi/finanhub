'use client';

import React from 'react';
import { 
  Search, 
  Tag, 
  DollarSign, 
  MapPin, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

interface FavoritesFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  sort: string;
  setSort: (val: string) => void;
  categories: { slug: string; name: string }[];
}

export function FavoritesFilters({ 
  search, 
  setSearch, 
  category, 
  setCategory, 
  sort, 
  setSort,
  categories 
}: FavoritesFiltersProps) {
  
  const hasFilters = search || category || sort !== 'newest';

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Search */}
      <div className="flex-1 w-full space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Busca Rápida</label>
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-var(--brand) transition-colors" />
          <input 
            type="text"
            placeholder="Filtrar por título, descrição ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm outline-none focus:border-var(--brand)/50 focus:bg-white/[0.05] transition-all"
          />
        </div>
      </div>

      {/* Category */}
      <div className="w-full md:w-56 space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
        <div className="relative">
          <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 text-white text-sm outline-none focus:border-var(--brand)/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#020617]">Todas</option>
            {categories.map(cat => (
              <option key={cat.slug} value={cat.slug} className="bg-[#020617]">{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort */}
      <div className="w-full md:w-56 space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ordenação</label>
        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 text-white text-sm outline-none focus:border-var(--brand)/50 appearance-none cursor-pointer"
          >
            <option value="newest" className="bg-[#020617]">Mais recentes</option>
            <option value="price_desc" className="bg-[#020617]">Maior Valor</option>
            <option value="price_asc" className="bg-[#020617]">Menor Valor</option>
            <option value="activity" className="bg-[#020617]">Atividade (Score)</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button 
          onClick={() => { setSearch(''); setCategory(''); setSort('newest'); }}
          className="h-12 px-4 rounded-xl border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
        >
          <X size={16} />
          Limpar
        </button>
      )}
    </div>
  );
}
