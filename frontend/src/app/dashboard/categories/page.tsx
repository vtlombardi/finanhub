'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import {
  Tag, Plus, Edit2, Trash2, Loader2, X, Check,
  ChevronDown, ChevronUp, SlidersHorizontal, Settings, Box, Database,
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconClass: string | null;
  _count: { listings: number };
}

interface CategoryAttribute {
  id: string;
  name: string;
  label: string;
  type: string;
  isRequired: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ATTRIBUTE_TYPES = ['TEXT', 'NUMBER', 'BOOLEAN', 'URL'] as const;
type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

const TYPE_CONFIG: Record<AttributeType, { label: string; cls: string }> = {
  TEXT:    { label: 'Texto',   cls: styles.bGhost },
  NUMBER:  { label: 'Número',  cls: styles.bBlue },
  BOOLEAN: { label: 'Sim/Não', cls: styles.bViolet },
  URL:     { label: 'Link/URL',cls: styles.bGreen },
};

const emptyForm = { name: '', slug: '', description: '', iconClass: '' };
const emptyAttrForm = { name: '', label: '', type: 'TEXT' as AttributeType, isRequired: false };

// ─── AttributesPanel ─────────────────────────────────────────────────────────

function AttributesPanel({ categoryId, canManage }: { categoryId: string; canManage: boolean }) {
  const [attrs, setAttrs] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAttrForm);

  const [editAttrId, setEditAttrId] = useState<string | null>(null);
  const [editAttrForm, setEditAttrForm] = useState({ label: '', type: 'TEXT' as AttributeType, isRequired: false });

  const loadAttrs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<CategoryAttribute[]>(`/categories/${categoryId}/attributes`);
      setAttrs(data);
    } catch {
      setError('Erro ao carregar atributos.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { loadAttrs(); }, [loadAttrs]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/categories/${categoryId}/attributes`, form);
      setForm(emptyAttrForm);
      setShowForm(false);
      loadAttrs();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar atributo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (attrId: string) => {
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/categories/attributes/${attrId}`, editAttrForm);
      setEditAttrId(null);
      loadAttrs();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao atualizar atributo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (attr: CategoryAttribute) => {
    if (!confirm(`Remover o atributo "${attr.label}"?`)) return;
    setError('');
    try {
      await api.delete(`/categories/attributes/${attr.id}`);
      loadAttrs();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao remover atributo.');
    }
  };

  return (
    <div style={{ padding: '0 24px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '44px', width: '2px', height: '20px', background: 'rgba(255,255,255,0.05)' }} />
        <div className={styles.card} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '24px' }}>
          <div className="flex items-center justify-between mb-6">
            <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#8fa6c3', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database className="w-3.5 h-3.5 text-[#00b8b2]" /> Estrutura de Atributos Customizados
            </h4>
            {canManage && (
              <button
                onClick={() => setShowForm(s => !s)}
                className={styles.btnGhost}
                style={{ height: '32px', fontSize: '11px', border: 'none', background: 'rgba(255,255,255,0.03)' }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Novo campo
              </button>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: '16px', fontSize: '12px', color: '#ef4444' }}>{error}</div>
          )}

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleCreate} style={{ marginBottom: '24px', padding: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>KEY (SISTEMA)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value.replace(/\s+/g, '_').toLowerCase() }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', fontFamily: 'monospace' }}
                    placeholder="ex: faturamento_anual"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>LABEL (LISTAGEM)</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                    placeholder="Ex: Faturamento Anual"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>TIPO DE DADO</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as AttributeType }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                  >
                    {ATTRIBUTE_TYPES.map(t => (
                      <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#8fa6c3' }}>
                    <input
                      type="checkbox"
                      checked={form.isRequired}
                      onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                    />
                    Obrigatório
                  </label>
                  <div style={{ flex: 1 }} />
                  <button type="submit" disabled={submitting} className={styles.btnBrand} style={{ height: '36px', fontSize: '11px' }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Campo'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List */}
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', padding: '24px' }}>
               <Loader2 className="w-5 h-5 text-[#00b8b2] animate-spin" />
            </div>
          ) : attrs.length === 0 ? (
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Esta categoria ainda utiliza apenas campos padrão do terminal.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {attrs.map(attr => {
                const isEditing = editAttrId === attr.id;
                const cfg = TYPE_CONFIG[attr.type as AttributeType] || TYPE_CONFIG.TEXT;

                return (
                  <div key={attr.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: isEditing ? '1px solid rgba(0,184,178,0.2)' : '1px solid transparent' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <input
                          type="text"
                          value={editAttrForm.label}
                          onChange={e => setEditAttrForm(f => ({ ...f, label: e.target.value }))}
                          style={{ flex: 1, padding: '6px 10px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', borderRadius: '4px' }}
                        />
                        <select
                          value={editAttrForm.type}
                          onChange={e => setEditAttrForm(f => ({ ...f, type: e.target.value as AttributeType }))}
                          style={{ padding: '6px 10px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', borderRadius: '4px' }}
                        >
                          {ATTRIBUTE_TYPES.map(t => (
                            <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
                          ))}
                        </select>
                        <button onClick={() => handleUpdate(attr.id)} className={styles.btnBrand} style={{ width: '30px', height: '30px', padding: 0 }}><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditAttrId(null)} className={styles.btnGhost} style={{ width: '30px', height: '30px', padding: 0 }}><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <span style={{ fontSize: '13px', fontWeight: 600, color: '#eef6ff' }}>{attr.label}</span>
                           <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>{attr.name}</span>
                           <span className={`${styles.badge} ${cfg.cls}`} style={{ fontSize: '9px', padding: '1px 8px' }}>{cfg.label}</span>
                           {attr.isRequired && <span style={{ fontSize: '9px', color: '#fb923c', fontWeight: 800, textTransform: 'uppercase' }}>Obrigatório</span>}
                        </div>
                        {canManage && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => { setEditAttrId(attr.id); setEditAttrForm({ label: attr.label, type: attr.type as AttributeType, isRequired: attr.isRequired }); }} className={styles.btnGhost} style={{ width: '28px', height: '28px', padding: 0, border: 'none' }}><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(attr)} className={styles.btnGhost} style={{ width: '28px', height: '28px', padding: 0, border: 'none', color: '#ef4444' }}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  useAuthGuard();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', iconClass: '' });

  const [expandedAttrId, setExpandedAttrId] = useState<string | null>(null);

  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const load = async () => {
    try {
      const { data } = await api.get<Category[]>('/categories/my');
      setCategories(data);
    } catch {
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/categories', {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        iconClass: form.iconClass.trim() || undefined,
      });
      setSuccess(`Categoria "${form.name}" criada.`);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setExpandedAttrId(null);
    setEditForm({ name: cat.name, description: cat.description || '', iconClass: cat.iconClass || '' });
  };

  const handleUpdate = async (id: string) => {
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/categories/${id}`, {
        name: editForm.name.trim() || undefined,
        description: editForm.description.trim() || undefined,
        iconClass: editForm.iconClass.trim() || undefined,
      });
      setSuccess('Categoria atualizada com sucesso.');
      setEditId(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao atualizar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Excluir a categoria "${cat.name}"? Esta ação não pode ser desfeita.`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/categories/${cat.id}`);
      setSuccess(`Categoria "${cat.name}" removida.`);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Tag className="w-7 h-7 text-[#00b8b2]" /> Gestão de Segmentos
          </h1>
          <p>Configure as categorias de ativos e a taxonomia de dados customizados.</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
            className={styles.btnBrand}
            style={{ height: '44px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
        )}
      </div>

      {/* Internal Feedback Area */}
      {(error || success) && (
        <div className={styles.card} style={{ 
          marginBottom: '24px', 
          padding: '12px 20px', 
          border: success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
          color: success ? '#10b981' : '#ef4444',
          fontSize: '14px'
        }}>
          {error || success}
        </div>
      )}

      {/* Creation form */}
      {showForm && (
        <div className={styles.card} style={{ marginBottom: '32px', padding: '32px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>Explorar Novo Segmento</h3>
              <button onClick={() => setShowForm(false)} className={styles.btnGhost} style={{ width: '32px', height: '32px', padding: 0 }}>
                 <X className="w-4 h-4" />
              </button>
           </div>
           <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8fa6c3', textTransform: 'uppercase', marginBottom: '8px' }}>Nome Comercial</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}
                  placeholder="Ex: Startups SaaS"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8fa6c3', textTransform: 'uppercase', marginBottom: '8px' }}>Custom Slug (URL)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}
                  placeholder="ex: startups-saas"
                />
              </div>
              <div className="md:col-span-2">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8fa6c3', textTransform: 'uppercase', marginBottom: '8px' }}>Descrição Institucional</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}
                  placeholder="Breve resumo da categoria para o marketplace"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }} className="md:col-span-2">
                 <button type="submit" disabled={submitting} className={styles.btnBrand} style={{ height: '48px', padding: '0 40px' }}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Registro'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Main categories list */}
      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '40vh' }}>
          <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px' }}>
           <Box className="w-12 h-12 text-[#64748b] mx-auto mb-4 opacity-30" />
           <p style={{ color: '#8fa6c3' }}>Nenhum segmento configurado no sistema.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map(cat => {
            const isEditing = editId === cat.id;

            return (
              <div key={cat.id} className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                       <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          style={{ flex: 1, padding: '10px 14px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', borderRadius: '8px' }}
                        />
                        <button onClick={() => handleUpdate(cat.id)} className={styles.btnBrand} style={{ width: '40px', height: '40px', padding: 0 }}><Check className="w-5 h-5" /></button>
                        <button onClick={() => setEditId(null)} className={styles.btnGhost} style={{ width: '40px', height: '40px', padding: 0 }}><X className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                         <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', display: 'grid', placeItems: 'center' }}>
                           {cat.iconClass ? <i className={`fa ${cat.iconClass} text-[#00b8b2] text-xl`} /> : <Tag className="w-6 h-6 text-[#64748b]" />}
                         </div>
                         <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>{cat.name}</h3>
                               <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>{cat.slug}</span>
                               <span className={`${styles.badge} ${cat._count.listings > 0 ? styles.bBlue : styles.bGhost}`} style={{ fontSize: '10px' }}>
                                 {cat._count.listings} ativos
                               </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#8fa6c3', opacity: 0.6 }} className="truncate max-w-[500px]">{cat.description || 'Nenhuma descrição técnica adicionada.'}</p>
                         </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setExpandedAttrId(expandedAttrId === cat.id ? null : cat.id)}
                          className={styles.btnGhost}
                          style={{ height: '36px', fontSize: '12px', color: expandedAttrId === cat.id ? '#00b8b2' : '#8fa6c3' }}
                        >
                          <Settings className="w-4 h-4 mr-2" /> Estrutura
                          {expandedAttrId === cat.id ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </button>

                        {canManage && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => startEdit(cat)} className={styles.btnGhost} style={{ width: '36px', height: '36px', padding: 0, border: 'none' }}><Edit2 className="w-4 h-4" /></button>
                            <button 
                               onClick={() => handleDelete(cat)} 
                               disabled={cat._count.listings > 0} 
                               className={styles.btnGhost} 
                               style={{ width: '36px', height: '36px', padding: 0, border: 'none', color: '#ef4444', opacity: cat._count.listings > 0 ? 0.2 : 1 }}
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {expandedAttrId === cat.id && (
                  <AttributesPanel categoryId={cat.id} canManage={canManage} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
