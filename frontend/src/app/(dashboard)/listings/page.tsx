'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Star } from 'lucide-react';
import { ListingsService } from '@/features/listings/listings.service';
import { PlansService } from '@/features/plans/plans.service';

export default function ListingsDashboardPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fake fetch inicial pra bater no Axios Service (Simula fetch da vitrine por agora)
  const fetchListings = async () => {
    try {
      const data = await ListingsService.getMyListings();
      setListings(data);
    } catch (error) {
      console.error('Erro buscando listings', error);
      setListings([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const [search, setSearch] = useState('');

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Publicado</span>;
      case 'PENDING_AI_REVIEW':
        return <span className="px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">Aguardando Avaliação</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Painel de Anúncios</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie suas ofertas de M&A em um cenário unificado.</p>
        </div>
        <Link href="/dashboard/listings/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>Criar Anúncio</span>
        </Link>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-[#1e293b] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID ou Título..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium pl-10 h-10 w-full"
            />
          </div>
          <button className="h-10 px-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors w-full sm:w-auto">
            <Filter size={18} />
            <span>Filtrar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-400 text-sm font-medium border-b border-[#1e293b]">
                <th className="px-6 py-4 font-medium">Empresa / Título</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Market Value (R$)</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="animate-pulse flex items-center justify-center gap-3">
                         <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                         Carregando Operações...
                    </div>
                  </td>
                </tr>
              ) : listings.filter(l => l.title?.toLowerCase().includes(search.toLowerCase())).map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                      {listing.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">ID: #{listing.id.substring(0,8)}...</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {listing.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono">
                    R$ {(listing.price || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await PlansService.toggleFeatured(listing.id);
                            const data = await ListingsService.getMyListings();
                            setListings(data);
                          } catch (e: any) {
                            alert(e?.response?.data?.message || 'Erro ao destacar.');
                          }
                        }}
                        className={`p-1.5 rounded-lg transition ${listing.isFeatured ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
                        title={listing.isFeatured ? 'Remover destaque' : 'Destacar anúncio'}
                      >
                        <Star size={16} fill={listing.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                      <Link href={`/dashboard/listings/${listing.id}`} className="text-sm text-blue-500 hover:text-blue-400 font-medium">
                        Gerenciar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && listings.length === 0 && (
                 <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                        Nenhum anúncio rodando sob este escopo de locação.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
