'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  Inbox, Loader2, Search, Filter, MessageSquare, 
  ExternalLink, StickyNote, MoreHorizontal, ShieldCheck,
  ChevronRight, Calendar, User, Briefcase, Tag, AlertCircle,
  Clock, CheckCircle, Smartphone, Mail, Building
} from 'lucide-react';
import { LeadsService } from '@/services/leads.service';
import { Lead } from '@shared/contracts';
import { useNotificationStore } from '@/store/useNotificationStore';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  NEW:           { label: 'Novo',           cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: Clock },
  UNDER_REVIEW:  { label: 'Em Análise',     cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   icon: Search },
  QUALIFIED:     { label: 'Qualificado',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  CONTACTED:     { label: 'Em Contato',     cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',   icon: MessageSquare },
  PROPOSAL_SENT: { label: 'Com Proposta',   cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Mail },
  WON:           { label: 'Convertido',     cls: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30', icon: ShieldCheck },
  LOST:          { label: 'Perdido',        cls: 'bg-slate-700/50 text-slate-400 border-slate-600',       icon: AlertCircle },
};

const INTENT_CONFIG: Record<string, { label: string; cls: string }> = {
  HIGH:   { label: 'Alta',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  MEDIUM: { label: 'Média',  cls: 'bg-amber-500/15  text-amber-400  border-amber-500/30'  },
  LOW:    { label: 'Baixa',  cls: 'bg-slate-700      text-slate-400  border-slate-600'      },
};

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  useAuthGuard(); // Idealmente adicionaria restrição ADMIN aqui
  const { show } = useNotificationStore();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  
  // Modals / Selection
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadLeads = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await LeadsService.getAdminLeads({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: pageToLoad,
      });
      console.log('Admin leads loaded:', response);
      setLeads(response.data || []);
      setPagination({
        total: response.total,
        page: response.page,
        lastPage: response.lastPage
      });
      setPage(response.page);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar Central de Leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads(1);
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      await LeadsService.updateLeadStatus(id, newStatus);
      show('Status atualizado com sucesso!', 'success');
      await loadLeads();
    } catch (err) {
      show('Erro ao atualizar status.', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      await LeadsService.updateLeadInternalNotes(selectedLead.id, notes);
      show('Notas salvas com sucesso!', 'success');
      await loadLeads();
      setSelectedLead(null);
    } catch (err) {
      show('Erro ao salvar notas.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Stats calculate
  const stats = {
    total: pagination?.total || 0,
    new: leads.filter(l => l.status === 'NEW').length, // Nota: Isso é apenas da página atual
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Central de Leads</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-xl">
              Gestão operacional estratégica de todas as manifestações de interesse da plataforma. 
              Mediação institucional private entre investidores e anunciantes.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            <button 
               onClick={() => loadLeads()}
               className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Atualizar
            </button>
            <div className="w-px h-4 bg-slate-800" />
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all">
              Relatório Exportar <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total de Leads" value={stats.total} icon={Inbox} color="bg-blue-500" />
          <StatCard label="Novas Entradas" value={stats.new} icon={Clock} color="bg-amber-500" />
          <StatCard label="Qualificados" value={stats.qualified} icon={ShieldCheck} color="bg-emerald-500" />
          <StatCard label="Em Negociação" value={stats.contacted} icon={MessageSquare} color="bg-indigo-500" />
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por investidor, e-mail ou anúncio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            {['all', 'NEW', 'UNDER_REVIEW', 'QUALIFIED', 'CONTACTED', 'WON'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  statusFilter === s 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-600'
                }`}
              >
                {s === 'all' ? 'Ver Todos' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table/Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 text-sm font-medium animate-pulse">Sincronizando base de dados operacional...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl py-20 text-center">
             <Inbox className="w-12 h-12 text-slate-800 mx-auto mb-4" />
             <p className="text-slate-400 font-bold text-lg">Nenhum registro encontrado</p>
             <p className="text-slate-600 text-sm">Não há leads que correspondam aos filtros atuais.</p>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investidor / Contato</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Oportunidade / Tenant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Score / Intensidade</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status Operacional</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {leads.map((lead) => {
                  const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                  const intent = lead.intentLevel ? INTENT_CONFIG[lead.intentLevel] : null;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/10 transition-colors group">
                      {/* Investidor Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-slate-700/50">
                            {(lead.investor?.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-100 truncate">{lead.investor?.fullName || 'Usuário Anonimo'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Mail size={10} /> {lead.investor?.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Listing Column */}
                      <td className="px-6 py-5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-300 truncate">{lead.listing?.title || 'Oportunidade Apagada'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                              {lead.listing?.tenant?.name || 'Geral'}
                            </span>
                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Score Column */}
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                               <span className={`text-sm font-bold ${Number(lead.score) > 70 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                 {lead.score || 0}
                               </span>
                            </div>
                            {intent && (
                              <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${intent.cls}`}>
                                {intent.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <select 
                            value={lead.status}
                            disabled={updatingStatus === lead.id}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all ${status.cls}`}
                            style={{ textAlignLast: 'center' }}
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key} className="bg-slate-900 text-slate-100">{cfg.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedLead(lead);
                              setNotes(lead.internalNotes || '');
                            }}
                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" 
                            title="Notas Internas"
                          >
                            <StickyNote size={16} className={lead.internalNotes ? 'text-blue-400' : ''} />
                          </button>
                          <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.lastPage > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => loadLeads(page - 1)}
              disabled={page === 1 || loading}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <span className="text-sm font-bold text-slate-400">
              Página <span className="text-white">{page}</span> de <span className="text-white">{pagination.lastPage}</span>
            </span>
            <button
              onClick={() => loadLeads(page + 1)}
              disabled={page === pagination.lastPage || loading}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Notes Modal (Simple implementation) */}
        {selectedLead && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <StickyNote size={18} className="text-blue-500" /> Notas de Mediação
                </h3>
                <button onClick={() => setSelectedLead(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                   <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Investidor</p>
                   <p className="text-sm font-medium text-slate-200">{selectedLead.investor?.fullName}</p>
                </div>
                <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-widest mb-2">Observações Estratégicas (Privado)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva o andamento da mediação, profilagem do investidor ou próximos passos operacionais..."
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none"
                />
                <p className="text-[10px] text-slate-600 mt-3 italic flex items-center gap-1.5">
                  <AlertCircle size={10} /> Estas notas são estritamente privadas e NUNCA serão exibidas para investidores ou anunciantes.
                </p>
              </div>
              <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {savingNotes ? <Loader2 size={12} className="animate-spin" /> : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

// Helper para o ícone X (fechar) que não estava no import inicial
function X({ size, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
