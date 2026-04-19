'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit2, 
  Trash2, Copy, Play, Pause, Loader2, AlertCircle,
  Building2, MapPin, Calendar, Tag, ChevronLeft, ChevronRight, ChevronDown,
  Eye, Target, Zap, BarChart2
} from 'lucide-react';
import { useMyListings, MyListingsFilters } from '@/hooks/useMyListings';
import { listingsService } from '@/services/listings.service';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';

const STATUS_CONFIG: Record<string, { label: string; color: string; cls: string }> = {
  DRAFT: { label: 'Rascunho', color: '#64748b', cls: 'bg-slate-700/10 text-slate-400 border-slate-700/20' },
  PENDING_AI_REVIEW: { label: 'Sob Auditoria', color: '#f59e0b', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ACTIVE: { label: 'Publicado', color: '#10b981', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  INACTIVE: { label: 'Suspenso', color: '#64748b', cls: 'bg-slate-800 text-slate-500 border-slate-700' },
  FLAGGED: { label: 'Audit. Necessária', color: '#ef4444', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
  CLOSED: { label: 'Encerrado', color: '#1e293b', cls: 'bg-slate-900 text-slate-600' },
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
      successMessage = 'Ativo duplicado com sucesso.';
    } else if (action === 'delete') {
      if (confirm('Deseja realmente remover este ativo da plataforma?')) {
        res = await softDelete(id);
        successMessage = 'Ativo removido conforme solicitado.';
      } else {
        setSubmitting(null);
        return;
      }
    } else if (action === 'toggle') {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      res = await toggleStatus(id, nextStatus);
      successMessage = nextStatus === 'ACTIVE' ? 'Operação ativada.' : 'Operação suspensa temporariamente.';
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
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Central Operacional de Ativos</h1>
          <p>Monitoramento de performance e gestão estratégica do portfólio.</p>
        </div>
        <Link 
          href="/dashboard/listings/new/edit" 
          className={styles.btnBrand}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', height: '48px' }}
        >
          <Plus size={18} /> Cadastrar Novo Ativo
        </Link>
      </div>

      {/* Advanced Filters */}
      <div className={styles.card} style={{ marginBottom: '32px', padding: '24px' }}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Buscar por ID, Título ou Localidade..."
              className={styles.bConfig}
              style={{ width: '100%', paddingLeft: '48px', height: '48px', background: 'rgba(0,0,0,0.3)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="w-full lg:w-56 relative">
              <select 
                className={styles.bConfig}
                style={{ width: '100%', height: '48px', appearance: 'none', background: 'rgba(0,0,0,0.3)', padding: '0 20px' }}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined, page: 1 }))}
              >
                <option value="">Todas Categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#475569] pointer-events-none" />
          </div>

          <div className="w-full lg:w-56 relative">
              <select 
                className={styles.bConfig}
                style={{ width: '100%', height: '48px', appearance: 'none', background: 'rgba(0,0,0,0.3)', padding: '0 20px' }}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined, page: 1 }))}
              >
                <option value="">Todos Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#475569] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Area */}
      {error ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '60px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p style={{ color: '#ef4444', fontWeight: 800 }}>Falha na sincronização operacional: {error}</p>
          <button onClick={() => refresh(filters)} className={styles.btnBrand} style={{ marginTop: '24px' }}>Reiniciar Conexão</button>
        </div>
      ) : loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '40vh' }}>
          <Loader2 className="w-12 h-12 text-[#00b8b2] animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px', borderStyle: 'dashed' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 24px', display: 'grid', placeItems: 'center' }}>
            <Building2 size={32} style={{ color: '#1e293b' }} />
          </div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>Inventário Vazio</p>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Não há registros que correspondam aos filtros técnicos aplicados.</p>
          <Link href="/dashboard/listings/new/edit" className={styles.btnBrand} style={{ marginTop: '32px', display: 'inline-flex' }}>
            Cadastrar Novo Ativo
          </Link>
        </div>
      ) : (
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '20px 32px', textAlign: 'left', color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ativo & Timing</th>
                  <th style={{ padding: '20px 32px', textAlign: 'left', color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance</th>
                  <th style={{ padding: '20px 32px', textAlign: 'center', color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Audit.</th>
                  <th style={{ padding: '20px 32px', textAlign: 'right', color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Estimado</th>
                  <th style={{ padding: '20px 32px', textAlign: 'right', color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gestão</th>
                </tr>
              </thead>
              <tbody>
                {data.map((listing) => (
                  <tr key={listing.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover:bg-white/[0.01] transition-colors">
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <strong style={{ color: '#eef6ff', fontSize: '15px', fontWeight: 800 }}>{listing.title}</strong>
                        <div className="flex items-center gap-2">
                           <span style={{ fontSize: '11px', color: '#334155', fontWeight: 800, padding: '2px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>ID: {listing.id.split('-')[0].toUpperCase()}</span>
                           <span style={{ fontSize: '11px', color: '#475569' }}>{listing.category?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px' }}>
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                             <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</span>
                             <div className="flex items-center gap-2 mt-1">
                                <Eye size={12} className="text-[#00b8b2] opacity-50" />
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>1.2k</span>
                             </div>
                          </div>
                          <div className="flex flex-col">
                             <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Leads</span>
                             <div className="flex items-center gap-2 mt-1">
                                <Target size={12} className="text-[#fb923c] opacity-50" />
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>24</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '24px 32px', textAlign: 'center' }}>
                      <span className={`${styles.badge} ${STATUS_CONFIG[listing.status]?.cls}`} style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                        {STATUS_CONFIG[listing.status]?.label || listing.status}
                      </span>
                    </td>
                    <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#00b8b2', fontSize: '16px' }}>
                        {listing.price ? formatCurrency(listing.price) : 'Sob consulta'}
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-3">
                        {submitting === listing.id ? (
                          <Loader2 size={16} className="text-[#00b8b2] animate-spin" />
                        ) : (
                          <>
                            <Link href={`/dashboard/listings/${listing.id}/edit`} className={styles.btnGhost} style={{ width: '40px', height: '40px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '10px' }} title="Editar Ativo">
                              <Edit2 size={16} />
                            </Link>
                            <div className="relative">
                              <button 
                                onClick={() => setIsActionMenuOpen(isActionMenuOpen === listing.id ? null : listing.id)}
                                className={styles.btnGhost}
                                style={{ width: '40px', height: '40px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '10px' }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              
                              {isActionMenuOpen === listing.id && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '12px', width: '200px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', padding: '6px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
                                  <button onClick={() => handleAction(listing.id, 'toggle', listing.status)} className={styles.btnGhost} style={{ width: '100%', textAlign: 'left', justifyContent: 'start', fontSize: '13px', height: '40px', border: 'none', padding: '0 12px' }}>
                                    {listing.status === 'ACTIVE' ? <><Pause size={14} className="mr-2 opacity-50" /> Suspender Operação</> : <><Play size={14} className="mr-2 opacity-50" /> Ativar Operação</>}
                                  </button>
                                  <button onClick={() => handleAction(listing.id, 'duplicate')} className={styles.btnGhost} style={{ width: '100%', textAlign: 'left', justifyContent: 'start', fontSize: '13px', height: '40px', border: 'none', padding: '0 12px' }}>
                                    <Copy size={14} className="mr-2 opacity-50" /> Duplicar Registro
                                  </button>
                                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '6px' }}></div>
                                  <button onClick={() => handleAction(listing.id, 'delete')} className={styles.btnGhost} style={{ width: '100%', textAlign: 'left', justifyContent: 'start', fontSize: '13px', height: '40px', border: 'none', padding: '0 12px', color: '#ef4444' }}>
                                    <Trash2 size={14} className="mr-2 opacity-50" /> Remover Definitivo
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
        </div>
      )}

      {/* Pagination: Institutional Style */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '40px' }}>
          <p style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>Mostrando {(pagination.page - 1) * pagination.limit + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} ativos registrados.</p>
          <div className="flex items-center gap-3">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: pagination.page - 1 }))}
              className={styles.btnGhost}
              style={{ width: '44px', height: '44px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '10px' }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#00b8b2', padding: '0 16px' }}>{pagination.page} / {pagination.totalPages}</span>
            <button 
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: pagination.page + 1 }))}
              className={styles.btnGhost}
              style={{ width: '44px', height: '44px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '10px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
