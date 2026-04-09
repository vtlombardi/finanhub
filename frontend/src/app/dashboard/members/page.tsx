'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import { UserPlus, Trash2, Edit2, Loader2, CheckCircle, Clock } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
  isEmailVerified: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = { OWNER: 'Proprietário', ADMIN: 'Admin', USER: 'Membro' };
const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  ADMIN: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  USER: 'bg-slate-700 text-slate-400 border-slate-600',
};

export default function MembersPage() {
  useAuthGuard();
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Invite form
  const [showForm, setShowForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'USER' | 'ADMIN'>('USER');

  // Edit modal
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editRole, setEditRole] = useState<string>('USER');

  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const loadMembers = async () => {
    try {
      const { data } = await api.get<Member[]>('/tenants/members');
      setMembers(data);
    } catch {
      setError('Erro ao carregar membros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/tenants/members', { email: inviteEmail, fullName: inviteName, role: inviteRole });
      setSuccess(`Convite enviado para ${inviteEmail}.`);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('USER');
      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao enviar convite.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editMember) return;
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/tenants/members/${editMember.id}`, { role: editRole });
      setSuccess('Cargo atualizado.');
      setEditMember(null);
      loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao atualizar cargo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (member: Member) => {
    if (!confirm(`Remover ${member.fullName} do workspace?`)) return;
    setError('');
    try {
      await api.delete(`/tenants/members/${member.id}`);
      setSuccess(`${member.fullName} removido.`);
      loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao remover membro.');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Membros do Workspace</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie quem tem acesso ao seu workspace.</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Convidar Membro
            </button>
          )}
        </div>

        {/* Feedback */}
        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}

        {/* Invite form */}
        {showForm && (
          <form onSubmit={handleInvite} className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Novo Convite</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="input-premium"
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="input-premium"
                  placeholder="joao@empresa.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cargo</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'USER' | 'ADMIN')}
                  className="input-premium"
                >
                  <option value="USER">Membro</option>
                  {user?.role === 'OWNER' && <option value="ADMIN">Admin</option>}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2">
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="btn-primary text-sm px-6 py-2">
                {submitting ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        )}

        {/* Members list */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold text-white">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{member.fullName}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[member.role]}`}>
                          {ROLE_LABELS[member.role]}
                        </span>
                        {member.isEmailVerified ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-label="Conta ativa" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500" aria-label="Convite pendente" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {canManage && member.id !== user?.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setEditMember(member); setEditRole(member.role); }}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar cargo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {(user?.role === 'OWNER' || member.role === 'USER') && (
                        <button
                          onClick={() => handleRemove(member)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Remover membro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit role modal */}
        {editMember && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-sm font-semibold text-white">Alterar cargo — {editMember.fullName}</h3>
              <select
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                className="input-premium w-full"
              >
                <option value="USER">Membro</option>
                <option value="ADMIN">Admin</option>
                {user?.role === 'OWNER' && <option value="OWNER">Proprietário</option>}
              </select>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditMember(null)} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2">
                  Cancelar
                </button>
                <button onClick={handleUpdateRole} disabled={submitting} className="btn-primary text-sm px-6 py-2">
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
