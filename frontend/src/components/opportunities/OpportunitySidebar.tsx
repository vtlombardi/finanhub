'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, MapPin, Tag, DollarSign, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface OpportunityFilters {
  category: string | null;
  subcategory: string | null;
  state: string | null;
  city: string | null;
  minPrice: string;
  maxPrice: string;
  verified: boolean;
}

interface OpportunitySidebarProps {
  onFilterChange: (filters: OpportunityFilters) => void;
}

const CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Ativos e Estruturas', 
    subcategories: ['Direito Creditório (Precatórios)', 'Extração e Mineração', 'Fazendas e Agronegócio', 'Infraestrutura e Logística'] 
  },
  { 
    id: '2', 
    name: 'Compra e Venda de Empresas', 
    subcategories: ['Comércio e Varejo', 'Indústria e Manufatura', 'Serviços em Geral', 'Tecnologia e Software'] 
  },
  { 
    id: '3', 
    name: 'Franquias e Licenciamento', 
    subcategories: ['Alimentação e Bebidas', 'Educação e Treinamento', 'Saúde, Beleza e Bem-estar', 'Serviços Automotivos'] 
  },
  { 
    id: '4', 
    name: 'Investimentos', 
    subcategories: ['Aporte de Capital', 'Private Equity', 'Sociedade Operacional', 'Sociedade Participativa'] 
  },
  { 
    id: '5', 
    name: 'Projetos e Startups', 
    subcategories: ['EdTech (Educação)', 'FinTech (Finanças)', 'HealthTech (Saúde)', 'Prototipagem e Ideação'] 
  }
];

const STATES = [
  { code: 'SP', name: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'] },
  { code: 'RJ', name: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói', 'Búzios', 'Petrópolis'] },
  { code: 'MG', name: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Ouro Preto', 'Juiz de Fora'] },
];

export const OpportunitySidebar: React.FC<OpportunitySidebarProps> = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);

  // Cascading logic: Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  // Cascading logic: Reset city when state changes
  useEffect(() => {
    setSelectedCity(null);
  }, [selectedState]);

  const activeSubcategories = CATEGORIES.find(c => c.name === selectedCategory)?.subcategories || [];
  const activeCities = STATES.find(s => s.code === selectedState)?.cities || [];

  const handleApplyFilters = () => {
    onFilterChange({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      state: selectedState,
      city: selectedCity,
      minPrice,
      maxPrice,
      verified: isVerified,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedState(null);
    setSelectedCity(null);
    setMinPrice('');
    setMaxPrice('');
    setIsVerified(false);
    onFilterChange({
      category: null,
      subcategory: null,
      state: null,
      city: null,
      minPrice: '',
      maxPrice: '',
      verified: false,
    });
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-[#12b3af]" />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Filtros</h2>
      </div>

      {/* Category Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-widest pl-1">
          <Tag className="w-4 h-4" />
          Categorias
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <select 
            className="w-full bg-transparent text-white p-3 outline-none appearance-none cursor-pointer text-sm"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="" className="bg-[#0a101b]">Todas as Categorias</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.name} className="bg-[#0a101b]">{c.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory - Animated Appearance */}
        {selectedCategory && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <select 
                className="w-full bg-transparent text-white p-3 outline-none appearance-none cursor-pointer text-sm"
                value={selectedSubcategory || ''}
                onChange={(e) => setSelectedSubcategory(e.target.value || null)}
              >
                <option value="" className="bg-[#0a101b]">Todas as Subcategorias</option>
                {activeSubcategories.map(s => (
                  <option key={s} value={s} className="bg-[#0a101b]">{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-widest pl-1">
          <MapPin className="w-4 h-4" />
          Localização
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <select 
              className="w-full bg-transparent text-white p-3 outline-none appearance-none cursor-pointer text-sm"
              value={selectedState || ''}
              onChange={(e) => setSelectedState(e.target.value || null)}
            >
              <option value="" className="bg-[#0a101b]">UF</option>
              {STATES.map(s => (
                <option key={s.code} value={s.code} className="bg-[#0a101b]">{s.code}</option>
              ))}
            </select>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <select 
              className="w-full bg-transparent text-white p-3 outline-none appearance-none cursor-pointer text-sm"
              disabled={!selectedState}
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value || null)}
            >
              <option value="" className="bg-[#0a101b]">Cidade</option>
              {activeCities.map(c => (
                <option key={c} value={c} className="bg-[#0a101b]">{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-widest pl-1">
          <DollarSign className="w-4 h-4" />
          Faixa de Valor
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <label className="text-[10px] text-gray-500 uppercase">Min</label>
            <input 
              type="text" 
              placeholder="R$ 0" 
              className="bg-transparent text-white outline-none w-full text-sm"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <label className="text-[10px] text-gray-500 uppercase">Max</label>
            <input 
              type="text" 
              placeholder="Livre" 
              className="bg-transparent text-white outline-none w-full text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Verified Toggle */}
      <div 
        className="flex items-center justify-between p-4 bg-[#12b3af]/5 border border-[#12b3af]/20 rounded-2xl cursor-pointer hover:bg-[#12b3af]/10 transition-all group"
        onClick={() => setIsVerified(!isVerified)}
      >
        <div className="flex items-center gap-3">
          <CheckCircle className={`w-5 h-5 transition-colors ${isVerified ? 'text-[#12b3af]' : 'text-gray-600'}`} />
          <span className="text-sm font-medium text-white">Verificados pela <span className="text-[#12b3af]">FH</span></span>
        </div>
        <div className={`w-10 h-5 rounded-full transition-all relative ${isVerified ? 'bg-[#12b3af]' : 'bg-gray-700'}`}>
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isVerified ? 'right-1' : 'left-1'}`}></div>
        </div>
      </div>

      <button 
        onClick={handleApplyFilters}
        className="w-full bg-[#12b3af] hover:bg-[#0f9895] text-white py-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] uppercase tracking-widest text-sm"
      >
        Aplicar Filtros
      </button>

      <button 
        onClick={handleClearFilters}
        className="w-full text-gray-500 hover:text-white text-xs font-medium transition-all"
      >
        Limpar todos os filtros
      </button>
    </aside>
  );
};
