'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import { UserPlus, Trash2, Edit2, Loader2, CheckCircle, Clock, X, Shield, Users, Mail, UserCheck, Fingerprint, Activity } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
  isEmailVerified: boolean;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; cls: string; icon: any; color: string }> = { 
  OWNER: { label: 'Proprietário', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Shield, color: '#8b5cf6' }, 
  ADMIN: { label: 'Administrador', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: UserCheck, color: '#3b82f6' }, 
  USER:  { label: 'Analista M&A', cls: 'bg-slate-700/10 text-slate-400 border-slate-600', icon: Fingerprint, color: '#64748b' } 
};

export default function MembersPage() {
  useAuthGuard();
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'USER' | 'ADMIN'>('USER');

  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editRole, setEditRole] = useState<string>('USER');

  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const loadMembers = async () => {
    try {
      const { data } = await api.get<Member[]>('/tenants/members');
      setMembers(data);
    } catch {
      setError('Erro na sincronização de membros.');
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
      setSuccess(`Protocolo de convite enviado para ${inviteEmail}.`);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('USER');
      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro no provisionamento do convite.');
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
      setSuccess('Cargo institucional redefinido com sucesso.');
      setEditMember(null);
      loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha na alteração de privilégios.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (member: Member) => {
    if (!confirm(`Revogar acesso de ${member.fullName} do terminal?`)) return;
    setError('');
    try {
      await api.delete(`/tenants/members/${member.id}`);
      setSuccess(`Privilégios de ${member.fullName} revogados.`);
      loadMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao processar revogação.');
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Equipe & Governança</h1>
          <p>Gestão de operadores institucionais e níveis de privilégio no terminal.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={styles.btnBrand}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px', height: '48px' }}
          >
            <UserPlus size={18} /> Provisionar Analista
          </button>
        )}
      </div>

      {(error || success) && (
        <div style={{ 
          marginBottom: '32px', 
          padding: '20px 24px', 
          borderRadius: '12px',
          border: '1px solid',
          background: success ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          borderColor: success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: success ? '#10b981' : '#ef4444',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {success ? <CheckCircle size={18} /> : <X size={18} />}
          {error || success}
        </div>
      )}

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '48px', padding: '40px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fff' }}>Protocolar Novo Convite</h3>
             <button onClick={() => setShowForm(false)} className={styles.btnGhost} style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }}>
                <X size={18} />
             </button>
          </div>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome Completo</label>
              <input
                type="text"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px' }}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div className="space-y-4">
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail Institucional</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px' }}
                placeholder="joao@empresa.com.br"
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ flex: 1 }} className="space-y-4">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nível de Privilégio</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'USER' | 'ADMIN')}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="USER" className="bg-[#020617]">Analista M&A (Padrão)</option>
                  {user?.role === 'OWNER' && <option value="ADMIN" className="bg-[#020617]">Administrador</option>}
                </select>
              </div>
              <button type="submit" disabled={submitting} className={styles.btnBrand} style={{ height: '52px', padding: '0 32px' }}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '40vh' }}>
          <Loader2 className="w-12 h-12 text-[#00b8b2] animate-spin" />
        </div>
      ) : (
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Activity size={16} className="text-[#00b8b2]" />
             <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operadores Ativos do Workspace</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map((member, idx) => {
              const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.USER;
              const RoleIcon = cfg.icon;
              const isMe = member.id === user?.id;

              return (
                <div 
                  key={member.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '24px 32px', 
                    borderBottom: idx < members.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    background: isMe ? 'rgba(0,184,178,0.02)' : 'transparent',
                    transition: '0.2s'
                  }}
                  className="hover:bg-white/[0.01]"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>
                    <div style={{ 
                      width: '52px', 
                      height: '52px', 
                      background: isMe ? '#00b8b210' : 'rgba(255,255,255,0.02)', 
                      borderRadius: '16px', 
                      display: 'grid', 
                      placeItems: 'center', 
                      fontSize: '18px', 
                      fontWeight: 900, 
                      color: isMe ? '#00b8b2' : '#475569',
                      border: `1px solid ${isMe ? 'rgba(0,184,178,0.2)' : 'rgba(255,255,255,0.05)'}`
                    }}>
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                           {member.fullName} {isMe && <span style={{ color: '#00b8b2', fontWeight: 700, marginLeft: '6px', fontSize: '11px', textTransform: 'uppercase' }}>(Master)</span>}
                        </h4>
                        <span className={`${styles.badge} ${cfg.cls}`} style={{ fontSize: '9px', padding: '3px 10px', fontWeight: 900 }}>
                           <RoleIcon size={10} className="mr-2" />
                           {cfg.label}
                        </span>
                        {member.isEmailVerified ? (
                          <div title="Identidade Verificada" style={{ color: '#10b981' }}><CheckCircle size={14} /></div>
                        ) : (
                          <div title="Verificação Pendente" style={{ color: '#fb923c' }}><Clock size={14} className="animate-pulse" /></div>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                           <Mail size={12} className="text-[#334155]" />
                           <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: 600 }}>{member.email}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <Clock size={12} className="text-[#334155]" />
                           <p style={{ margin: 0, fontSize: '11px', color: '#334155', fontWeight: 700, textTransform: 'uppercase' }}>Ingresso: {new Date(member.createdAt).toLocaleDateString('pt-BR')}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {canManage && !isMe && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => { setEditMember(member); setEditRole(member.role); }}
                        className={styles.btnGhost}
                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      {(user?.role === 'OWNER' || member.role === 'USER') && (
                        <button
                          onClick={() => handleRemove(member)}
                          className={styles.btnGhost}
                          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Management: High-Fidelity Modal */}
      {editMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 999 }}>
          <div className={styles.card} style={{ width: '100%', maxWidth: '440px', padding: '40px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 900, color: '#fff' }}>Atualizar Nível de Acesso</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '32px', fontWeight: 600 }}>Redefina as permissões institucionais para o analista <b>{editMember.fullName}</b>.</p>
            
            <div style={{ marginBottom: '40px' }} className="space-y-4">
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Privilégio Selecionado</label>
               <select
                 value={editRole}
                 onChange={e => setEditRole(e.target.value)}
                 style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
               >
                 <option value="USER" className="bg-[#020617]">Analista M&A</option>
                 <option value="ADMIN" className="bg-[#020617]">Administrador</option>
                 {user?.role === 'OWNER' && <option value="OWNER" className="bg-[#020617]">Proprietário Master</option>}
               </select>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditMember(null)} className={styles.btnGhost} style={{ height: '48px', padding: '0 24px', borderRadius: '12px' }}>
                Cancelar
              </button>
              <button onClick={handleUpdateRole} disabled={submitting} className={styles.btnBrand} style={{ height: '48px', padding: '0 24px', borderRadius: '12px' }}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Protocolo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
