'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, Shield, User, Clock, Eye, 
  Search, Filter, Plus, Trash2, ChevronLeft,
  Share2, Lock, Download, AlertCircle, CheckCircle2,
  TrendingUp, ArrowRight, Zap, Info
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { DataRoomService, DataRoomDocument, DataRoomViewLog } from '@/services/DataRoomService';

const CATEGORIES = [
  { id: 'FINANCEIRO', label: 'Financeiro', icon: <TrendingUp size={18} />, color: '#10b981', help: 'DRE, Balanço, Fluxo de Caixa' },
  { id: 'JURIDICO', label: 'Jurídico', icon: <Shield size={18} />, color: '#6366f1', help: 'Contratos, Atas, Processos' },
  { id: 'OPERACIONAL', label: 'Operacional', icon: <Zap size={18} />, color: '#eab308', help: 'Processos, KPIs, Ativos' },
  { id: 'SOCIETARIO', label: 'Societário', icon: <User size={18} />, color: '#ec4899', help: 'Organograma, Sócios' },
  { id: 'TRIBUTARIO', label: 'Tributário', icon: <DollarSign size={18} />, color: '#14b8a6', help: 'Impostos, Certidões' },
  { id: 'RH', label: 'RH', icon: <User size={18} />, color: '#8b5cf6', help: 'Folha, Benefícios' },
  { id: 'OUTROS', label: 'Outros', icon: <Info size={18} />, color: '#94a3b8', help: 'Documentos diversos' },
];

function DollarSign({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}

export default function DataRoomManagementPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;

  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [logs, setLogs] = useState<DataRoomViewLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'AUDIT'>('DOCUMENTS');
  const [isUploading, setIsUploading] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('FINANCEIRO');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsResp, logsResp] = await Promise.all([
        DataRoomService.getSellerDocuments(listingId),
        DataRoomService.getTrackingLogs(listingId)
      ]);
      setDocuments(docsResp.data);
      setLogs(logsResp.data);
    } catch (err: any) {
      setError('Erro ao carregar dados do Data Room.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocUrl) return;

    setIsUploading(true);
    try {
      await DataRoomService.addDocument(listingId, {
        name: newDocName,
        url: newDocUrl,
        category: newDocCategory,
      });
      setNewDocName('');
      setNewDocUrl('');
      loadData();
    } catch (err) {
      console.error('Error adding document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) return;
    try {
      await DataRoomService.removeDocument(id);
      loadData();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  if (loading) return <div className="p-10 text-white">Carregando Data Room...</div>;

  return (
    <div className={styles.container} style={{ padding: '40px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
         <div>
            <button 
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase' }}
            >
              <ChevronLeft size={16} />
              Voltar ao Dashboard
            </button>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Security Data Room</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Gerenciamento de repositório estratégico e auditoria de acessos</p>
         </div>

         <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(16,185,129,0.05)', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.1)' }}>
               <Shield size={18} className="text-emerald-500" />
               <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Ambiente Criptografado</span>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
         <button 
           onClick={() => setActiveTab('DOCUMENTS')}
           style={{ 
             padding: '0 8px 16px', 
             fontSize: '14px', 
             fontWeight: 900, 
             color: activeTab === 'DOCUMENTS' ? '#00b8b2' : '#64748b',
             borderBottom: activeTab === 'DOCUMENTS' ? '2px solid #00b8b2' : 'none',
             background: 'none',
             cursor: 'pointer',
             textTransform: 'uppercase'
           }}
         >
           Repositório de Documentos
         </button>
         <button 
           onClick={() => setActiveTab('AUDIT')}
           style={{ 
             padding: '0 8px 16px', 
             fontSize: '14px', 
             fontWeight: 900, 
             color: activeTab === 'AUDIT' ? '#00b8b2' : '#64748b',
             borderBottom: activeTab === 'AUDIT' ? '2px solid #00b8b2' : 'none',
             background: 'none',
             cursor: 'pointer',
             textTransform: 'uppercase'
           }}
         >
           Audit Trail (Acessos)
         </button>
      </div>

      {activeTab === 'DOCUMENTS' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
          
          {/* Main Area: Categories */}
          <div className="space-y-10">
            {CATEGORIES.map(cat => {
              const catDocs = documents.filter(d => d.category === cat.id);
              return (
                <div key={cat.id} style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${cat.color}15`, display: 'grid', placeItems: 'center', color: cat.color }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff' }}>{cat.label}</h3>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{cat.help}</span>
                    </div>
                  </div>

                  {catDocs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {catDocs.map(doc => (
                        <div key={doc.id} className={styles.card} style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'grid', placeItems: 'center', color: '#64748b' }}>
                              <FileText size={20} />
                            </div>
                            <div>
                               <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{doc.name}</div>
                               <div style={{ fontSize: '11px', color: '#64748b' }}>Upload em {new Date(doc.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: '#64748b', display: 'grid', placeItems: 'center' }}>
                                <Download size={14} />
                             </a>
                             <button onClick={() => handleDeleteDocument(doc.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.05)', textAlign: 'center' }}>
                       <span style={{ fontSize: '12px', color: '#475569' }}>Nenhum documento nesta categoria.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar: Upload Area */}
          <div>
             <div className={styles.card} style={{ padding: '24px', position: 'sticky', top: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', marginBottom: '24px' }}>Adicionar Documento</h3>
                <form onSubmit={handleAddDocument} className="space-y-4">
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Nome do Arquivo</label>
                    <input 
                      type="text" 
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Ex: DRE 2023 - Consolidado"
                      style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', color: '#fff', fontSize: '13px', outline: 'none' }}
                      className="focus:border-[#00b8b2]/30"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>URL do Documento</label>
                    <input 
                      type="text" 
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      placeholder="https://..."
                      style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', color: '#fff', fontSize: '13px', outline: 'none' }}
                      className="focus:border-[#00b8b2]/30"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Categoria</label>
                    <select 
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value)}
                      style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0 16px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    style={{ width: '100%', height: '48px', marginTop: '12px' }} 
                    className={styles.btnBrand}
                  >
                    {isUploading ? 'Adicionando...' : 'Adicionar ao Data Room'}
                  </button>
                </form>

                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,184,178,0.03)', borderRadius: '14px', border: '1px solid rgba(0,184,178,0.1)' }}>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <AlertCircle size={14} className="text-[#00b8b2] flex-shrink-0" />
                      <p style={{ margin: 0, fontSize: '12px', color: '#8fa6c3', lineHeight: 1.5 }}>
                        Os documentos marcados como estratégicos só são visíveis para leads que você liberou manualmente e que assinaram o NDA digital.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        /* Audit Trail View */
        <div className={styles.card} style={{ border: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#fff' }}>Logs de Acesso & Visualização</h3>
             <div style={{ fontSize: '12px', color: '#64748b' }}>{logs.length} eventos registrados</div>
          </div>

          {logs.length > 0 ? (
            <div style={{ padding: '16px' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Investidor / Lead</th>
                        <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Documento Acessado</th>
                        <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Categoria</th>
                        <th style={{ textAlign: 'right', padding: '16px', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Data/Hora</th>
                     </tr>
                  </thead>
                  <tbody>
                     {logs.map(log => (
                       <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="hover:bg-white/[0.01]">
                          <td style={{ padding: '16px' }}>
                             <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{log.investor.fullName}</div>
                             <div style={{ fontSize: '12px', color: '#64748b' }}>{log.investor.email}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={14} className="text-[#64748b]" />
                                <span style={{ fontSize: '13px', color: '#fff' }}>{log.document.name}</span>
                             </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                             <span style={{ 
                               fontSize: '10px', 
                               fontWeight: 900, 
                               padding: '4px 10px', 
                               borderRadius: '6px', 
                               background: 'rgba(255,255,255,0.03)',
                               color: '#8fa6c3'
                             }}>{log.document.category}</span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                             <div style={{ fontSize: '13px', color: '#fff' }}>{new Date(log.viewedAt).toLocaleDateString()}</div>
                             <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.viewedAt).toLocaleTimeString()}</div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          ) : (
            <div style={{ padding: '80px', textAlign: 'center' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'grid', placeItems: 'center', color: '#64748b', margin: '0 auto 20px' }}>
                  <Eye size={24} />
               </div>
               <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '8px' }}>Sem atividades recentes</h3>
               <p style={{ fontSize: '14px', color: '#64748b' }}>Ainda não houve visualização de documentos neste Data Room.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
