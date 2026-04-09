'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import {
  Tag, Plus, Edit2, Trash2, Loader2, X, Check,
  ChevronDown, ChevronUp, SlidersHorizontal,
} from 'lucide-react';

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

const TYPE_LABELS: Record<AttributeType, string> = {
  TEXT: 'Texto',
  NUMBER: 'Número',
  BOOLEAN: 'Sim/Não',
  URL: 'URL',
};

const TYPE_BADGES: Record<AttributeType, string> = {
  TEXT:    'bg-slate-700 text-slate-300 border-slate-600',
  NUMBER:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  BOOLEAN: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  URL:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
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
    <div className="border-t border-slate-800 bg-slate-950/40 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Atributos customizados
        </span>
        {canManage && (
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo atributo
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Chave <span className="text-slate-600 font-normal">(máquina, ex: annual_revenue)</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value.replace(/\s+/g, '_').toLowerCase() }))}
                className="input-premium w-full text-sm font-mono"
                placeholder="annual_revenue"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Label exibida ao usuário</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className="input-premium w-full text-sm"
                placeholder="Receita Anual"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as AttributeType }))}
                className="input-premium w-full text-sm"
              >
                {ATTRIBUTE_TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id={`req-${categoryId}`}
                checked={form.isRequired}
                onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <label htmlFor={`req-${categoryId}`} className="text-xs text-slate-400 cursor-pointer">
                Preenchimento obrigatório
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyAttrForm); }}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
            >
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs px-4 py-1.5">
              {submitting ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      {/* Attribute list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      ) : attrs.length === 0 && !showForm ? (
        <p className="text-xs text-slate-700 italic py-1">
          Nenhum atributo customizado. Use para capturar dados específicos (ex: Receita Anual, Número de Funcionários).
        </p>
      ) : (
        <div className="space-y-1.5">
          {attrs.map(attr => (
            <div key={attr.id} className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
              {editAttrId === attr.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1">Label</label>
                    <input
                      type="text"
                      value={editAttrForm.label}
                      onChange={e => setEditAttrForm(f => ({ ...f, label: e.target.value }))}
                      className="input-premium w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1">Tipo</label>
                    <select
                      value={editAttrForm.type}
                      onChange={e => setEditAttrForm(f => ({ ...f, type: e.target.value as AttributeType }))}
                      className="input-premium w-full text-xs"
                    >
                      {ATTRIBUTE_TYPES.map(t => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editAttrForm.isRequired}
                        onChange={e => setEditAttrForm(f => ({ ...f, isRequired: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded accent-blue-500"
                      />
                      Obrigatório
                    </label>
                    <div className="flex gap-1">
                      <button onClick={() => setEditAttrId(null)} className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleUpdate(attr.id)} disabled={submitting} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="text-xs font-medium text-slate-300">{attr.label}</span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{attr.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_BADGES[attr.type as AttributeType] ?? TYPE_BADGES.TEXT}`}>
                      {TYPE_LABELS[attr.type as AttributeType] ?? attr.type}
                    </span>
                    {attr.isRequired && (
                      <span className="text-[10px] text-amber-500">obrigatório</span>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditAttrId(attr.id); setEditAttrForm({ label: attr.label, type: attr.type as AttributeType, isRequired: attr.isRequired }); }}
                        className="p-1.5 text-slate-600 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(attr)}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // Which category has its attributes panel open
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
      setSuccess('Categoria atualizada.');
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
      setSuccess(`Categoria "${cat.name}" excluída.`);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-blue-500" /> Categorias
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie categorias e seus atributos customizados.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Nova Categoria
            </button>
          )}
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>
        )}

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">Nova Categoria</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-premium w-full"
                  placeholder="Tecnologia (SaaS)"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Slug
                  <span className="ml-1 text-slate-600">(gerado automaticamente se vazio)</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="input-premium w-full font-mono"
                  placeholder="tecnologia-saas"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-premium w-full"
                  placeholder="Empresas de software como serviço"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ícone CSS (opcional)</label>
                <input
                  type="text"
                  value={form.iconClass}
                  onChange={e => setForm(f => ({ ...f, iconClass: e.target.value }))}
                  className="input-premium w-full font-mono"
                  placeholder="fa-laptop"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2"
              >
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="btn-primary text-sm px-6 py-2">
                {submitting ? 'Criando...' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <Tag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma categoria cadastrada.</p>
            <p className="text-sm text-slate-600 mt-1">
              Crie a primeira clicando em &ldquo;Nova Categoria&rdquo;.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
            {categories.map(cat => (
              <div key={cat.id}>
                {/* Category row */}
                <div className="px-6 py-4 hover:bg-slate-800/20 transition-colors">
                  {editId === cat.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Nome</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            className="input-premium w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Descrição</label>
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            className="input-premium w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Ícone CSS</label>
                          <input
                            type="text"
                            value={editForm.iconClass}
                            onChange={e => setEditForm(f => ({ ...f, iconClass: e.target.value }))}
                            className="input-premium w-full text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditId(null)}
                          className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          disabled={submitting}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {cat.iconClass
                            ? <i className={`fa ${cat.iconClass} text-blue-400 text-sm`} />
                            : <Tag className="w-4 h-4 text-slate-500" />
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{cat.name}</span>
                            <span className="text-[10px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{cat.slug}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              cat._count.listings > 0
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-slate-800 text-slate-600 border-slate-700'
                            }`}>
                              {cat._count.listings} anúncio{cat._count.listings !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{cat.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle attributes panel */}
                        <button
                          onClick={() => setExpandedAttrId(expandedAttrId === cat.id ? null : cat.id)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                            expandedAttrId === cat.id
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }`}
                          title="Atributos"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          {expandedAttrId === cat.id
                            ? <ChevronUp className="w-3 h-3" />
                            : <ChevronDown className="w-3 h-3" />
                          }
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              disabled={cat._count.listings > 0}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                              title={cat._count.listings > 0 ? 'Remova os anúncios vinculados primeiro' : 'Excluir'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attributes panel (lazy — only mounts when opened) */}
                {expandedAttrId === cat.id && (
                  <AttributesPanel categoryId={cat.id} canManage={canManage} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
