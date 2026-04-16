'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit2, 
  Trash2, Copy, Play, Pause, Loader2, AlertCircle,
  Building2, MapPin, Calendar, Tag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useMyListings, MyListingsFilters } from '@/hooks/useMyListings';
import { listingsService } from '@/services/listings.service';
import { useNotificationStore } from '@/store/useNotificationStore';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-slate-700 text-slate-300' },
  PENDING_AI_REVIEW: { label: 'Em Revisão', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ACTIVE: { label: 'Publicado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  INACTIVE: { label: 'Pausado', color: 'bg-slate-800 text-slate-500 border-slate-700' },
  FLAGGED: { label: 'Necessita Ajustes', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  CLOSED: { label: 'Encerrado', color: 'bg-slate-900 text-slate-600' },
};

export default function MyListingsPage() {
  useAuthGuard();
  const { data, pagination, loading, error, refresh, duplicate, softDelete, toggleStatus } = useMyListings();
  const { show } = useNotificationStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState<MyListingsFilters>({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    refresh(filters);
  }, [filters, refresh]);

  useEffect(() => {
    listingsService.listCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, q: searchTerm, page: 1 }));
  };

  const handleAction = async (id: string, action: string, currentStatus?: string) => {
    setSubmitting(id);
    let res;
    let successMessage = '';

    if (action === 'duplicate') {
      res = await duplicate(id);
      successMessage = 'Anúncio duplicado com sucesso!';
    } else if (action === 'delete') {
      if (confirm('Tem certeza que deseja excluir este anúncio? (Esta ação poderá ser revertida pelo suporte)')) {
        res = await softDelete(id);
        successMessage = 'Anúncio excluído com sucesso!';
      } else {
        setSubmitting(null);
        return;
      }
    } else if (action === 'toggle') {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      res = await toggleStatus(id, nextStatus);
      successMessage = nextStatus === 'ACTIVE' ? 'Anúncio ativado!' : 'Anúncio pausado!';
    }

    if (res?.success) {
      show(successMessage, 'success');
      refresh(filters);
    } else if (res?.message) {
      show(res.message, 'error');
    }
    setSubmitting(null);
    setIsActionMenuOpen(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#00b8b2]" /> Gestão de Anúncios
            </h1>
            <p className="text-sm text-slate-500 mt-1">Visualize e gerencie seus anúncios no marketplace.</p>
          </div>
          <Link 
            href="/oportunidades/novo" 
            className="flex items-center gap-2 bg-[#00b8b2] hover:bg-[#00a39d] text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-[#00b8b2]/10"
          >
            <Plus className="w-4 h-4" /> Novo Anúncio
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar por título ou descrição..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00b8b2]/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48 relative">
                <select 
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm appearance-none focus:outline-none focus:border-[#00b8b2]/50 transition-colors cursor-pointer"
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined, page: 1 }))}
                >
                  <option value="">Todas Categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48 relative">
                <select 
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm appearance-none focus:outline-none focus:border-[#00b8b2]/50 transition-colors cursor-pointer"
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined, page: 1 }))}
                >
                  <option value="">Todos Status</option>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={() => refresh(filters)} className="text-sm text-red-300 underline mt-2 hover:text-red-200">Tentar novamente</button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin mb-4" />
            <p className="text-slate-500 text-sm animate-pulse">Carregando seus anúncios...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-700" />
            </div>
            <p className="text-slate-400 font-medium text-lg">Nenhum anúncio encontrado.</p>
            <p className="text-slate-600 text-sm mt-1 max-w-xs mx-auto">Você ainda não possui anúncios que correspondam aos filtros selecionados.</p>
            <Link href="/oportunidades/novo" className="inline-flex items-center mt-6 text-[#00b8b2] hover:underline font-medium">
              Comece criando seu primeiro anúncio →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Anúncio</th>
                  <th className="px-6 py-4 font-semibold">Categoria</th>
                  <th className="px-6 py-4 font-semibold">Localização</th>
                  <th className="px-6 py-4 font-semibold text-right">Valor</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-800/10 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{listing.title}</span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> Criado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-600" /> {listing.category?.name || 'Vago'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" /> {listing.city ? `${listing.city}, ${listing.state}` : 'Remoto'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-bold text-[#00b8b2] font-mono">
                        {listing.price ? formatCurrency(listing.price) : 'Sob consulta'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[listing.status]?.color || 'bg-slate-800 text-slate-400'}`}>
                        {STATUS_CONFIG[listing.status]?.label || listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right sticky right-0">
                      <div className="flex items-center justify-end gap-2">
                        {submitting === listing.id ? (
                          <Loader2 className="w-4 h-4 text-[#00b8b2] animate-spin" />
                        ) : (
                          <>
                            <Link href={`/dashboard/listings/${listing.id}/edit`} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm" title="Editar">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <div className="relative">
                              <button 
                                onClick={() => setIsActionMenuOpen(isActionMenuOpen === listing.id ? null : listing.id)}
                                className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                              
                              {isActionMenuOpen === listing.id && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5">
                                  <button onClick={() => handleAction(listing.id, 'toggle', listing.status)} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                                    {listing.status === 'ACTIVE' ? <><Pause className="w-3.5 h-3.5" /> Pausar</> : <><Play className="w-3.5 h-3.5" /> Ativar</>}
                                  </button>
                                  <button onClick={() => handleAction(listing.id, 'duplicate')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                                    <Copy className="w-3.5 h-3.5" /> Duplicar
                                  </button>
                                  <div className="h-px bg-slate-800 my-1"></div>
                                  <button onClick={() => handleAction(listing.id, 'delete')} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-xs text-slate-500">Mostrando {(pagination.page - 1) * pagination.limit + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} anúncios</p>
            <div className="flex items-center gap-2">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: pagination.page - 1 }))}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#00b8b2] px-3">{pagination.page} / {pagination.totalPages}</span>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: pagination.page + 1 }))}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
