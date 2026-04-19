'use client';

import React, { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/features/auth/AuthProvider';
import { 
  User, Shield, Lock, CreditCard, Building, Info, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, 
  Key, Mail, Fingerprint, Phone, Globe, MapPin, 
  Calendar, Camera, Briefcase, ExternalLink,
  Save, Trash2
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

export default function ProfilePage() {
  useAuthGuard();
  const { user } = useAuth();
  const { updateProfile, changePassword, loading, error } = useProfile();
  
  // Profile State
  const [formData, setFormData] = useState({
    fullName: '',
    phonePrimary: '',
    phoneSecondary: '',
    jobTitle: '',
    companyName: '',
    websiteUrl: '',
    city: '',
    state: '',
    country: 'Brasil'
  });

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phonePrimary: user.phonePrimary || '',
        phoneSecondary: user.phoneSecondary || '',
        jobTitle: user.jobTitle || '',
        companyName: user.companyName || '',
        websiteUrl: user.websiteUrl || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'Brasil'
      });
    }
  }, [user]);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [innerError, setInnerError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setInnerError(null);
    
    try {
      await updateProfile(formData);
      setSuccessMessage('Perfil institucional atualizado com sucesso!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setInnerError(err.response?.data?.message || err.message || 'Erro ao atualizar perfil.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setInnerError(null);

    if (!newPassword || newPassword.length < 8) {
      setInnerError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setInnerError('As senhas não coincidem.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccessMessage('Credenciais de acesso atualizadas com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setInnerError(err.response?.data?.message || err.message || 'Erro ao alterar senha.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Perfil Institucional</h1>
          <p>Gerencie sua identidade corporativa, canais de contato e segurança do terminal.</p>
        </div>
      </div>

      {(successMessage || error || innerError) && (
        <div style={{ 
          marginBottom: '32px', 
          padding: '20px 24px', 
          borderRadius: '12px',
          border: '1px solid',
          background: successMessage ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          borderColor: successMessage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: successMessage ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: 700
        }}>
          {successMessage ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {successMessage || error || innerError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content Areas */}
        <div className="lg:col-span-8 space-y-10">
          
          <form onSubmit={handleUpdateProfile} className="space-y-10">
            {/* Section 1: Identity */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <User size={16} className="text-[#00b8b2]" /> Identidade Institucional
                </h2>
                <span style={{ fontSize: '10px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>UUID: {user?.id?.split('-')[0]}</span>
              </div>
              
              <div style={{ padding: '40px 32px' }}>
                <div className="flex flex-col md:flex-row gap-10 items-start mb-10">
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                       {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt={formData.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                         <span style={{ fontSize: '42px', fontWeight: 900, color: '#334155' }}>{formData.fullName?.charAt(0) || 'U'}</span>
                       )}
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#00b8b2] rounded-full border-4 border-[#0a0f1d] flex items-center justify-center text-white shadow-lg cursor-not-allowed opacity-50" title="Upload em breve">
                      <Camera size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome Completo do Operador</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={styles.bConfig}
                        style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="Ex: Roberto Silva"
                      />
                    </div>
                    <div className="space-y-4">
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail de Acesso (Corporativo)</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          readOnly 
                          className={styles.bConfig}
                          style={{ width: '100%', padding: '14px 18px', paddingRight: '44px', background: 'rgba(255,255,255,0.03)', color: '#475569', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.05)' }}
                        />
                        <Shield size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1e293b]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cargo / Função</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
                      <input 
                        type="text" 
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className={styles.bConfig}
                        style={{ width: '100%', padding: '14px 18px 14px 44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="Ex: Diretor de M&A"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa / Instituição</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
                      <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={styles.bConfig}
                        style={{ width: '100%', padding: '14px 18px 14px 44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="Ex: Invest Capital"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Localization */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Phone size={16} className="text-[#8b5cf6]" /> Canais de Contato e Presença
                </h2>
              </div>
              
              <div style={{ padding: '40px 32px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telefone Principal</label>
                    <input 
                      type="text" 
                      name="phonePrimary"
                      value={formData.phonePrimary}
                      onChange={handleChange}
                      className={styles.bConfig}
                      style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder="+55 (11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site Institucional</label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
                      <input 
                        type="text" 
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        className={styles.bConfig}
                        style={{ width: '100%', padding: '14px 18px 14px 44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="https://suaempresa.com.br"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidade</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={styles.bConfig}
                      style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={styles.bConfig}
                      style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder="SP"
                    />
                  </div>
                  <div className="space-y-4">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>País</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
                      <input 
                        type="text" 
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={styles.bConfig}
                        style={{ width: '100%', padding: '14px 18px 14px 44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="Brasil"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button type="submit" disabled={loading} className={styles.btnBrand} style={{ padding: '0 40px', height: '56px', borderRadius: '14px', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(0,184,178,0.3)' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Consolidar Alterações</>}
              </button>
            </div>
          </form>

          {/* Section 3: Secure Access Section */}
          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Lock size={16} className="text-[#fb923c]" /> Segurança e Autenticação
              </h2>
            </div>
            
            <form onSubmit={handleChangePassword} style={{ padding: '40px 32px' }}>
              <div className="mb-8 space-y-4">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senha Administrativa Atual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.bConfig}
                  style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nova Credencial de Acesso</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.bConfig}
                    style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div className="space-y-4">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmação Técnica</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.bConfig}
                    style={{ width: '100%', padding: '14px 18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button type="submit" disabled={loading} className={styles.btnGhost} style={{ padding: '0 32px', height: '48px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', fontWeight: 800 }}>
                  {loading ? <Loader2 size={18} className="animate-spin text-[#00b8b2]" /> : 'Atualizar Protocolo de Segurança'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Account Context Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Executive Overview Card */}
          <div className={styles.card} style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 24px' }}>
              <div style={{ position: 'absolute', inset: -8, borderRadius: '36px', border: '2px solid rgba(0,184,178,0.2)', animation: 'pulse 2s infinite ease-in-out' }}></div>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #00b8b2, #006b67)', borderRadius: '32px', display: 'grid', placeItems: 'center', fontSize: '36px', fontWeight: 900, color: '#fff', boxShadow: '0 20px 40px rgba(0,184,178,0.25)', overflow: 'hidden' }}>
                 {user?.avatarUrl ? (
                   <img src={user.avatarUrl} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   user?.fullName?.charAt(0) || 'U'
                 )}
              </div>
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '32px', height: '32px', background: '#10b981', borderRadius: '50%', border: '4px solid #0a0f1d', display: 'grid', placeItems: 'center' }}>
                 <CheckCircle2 size={16} className="text-white" />
              </div>
            </div>

            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff' }}>{formData.fullName}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569', fontWeight: 700 }}>{formData.jobTitle || 'Membro do Terminal'}</p>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(0,184,178,0.1)', border: '1px solid rgba(0,184,178,0.2)' }}>
               <Fingerprint size={12} className="text-[#00b8b2]" />
               <span style={{ fontSize: '11px', fontWeight: 800, color: '#00b8b2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membro {user?.role || 'Verificado'}</span>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }} className="space-y-6">
              <div className="flex items-center gap-4">
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#475569' }}>
                  <Building size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workspace Atual</p>
                  <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#fff', fontWeight: 700 }}>{user?.tenant?.name || 'VVT SOLUTIONS'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#475569' }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ativação do Terminal</p>
                  <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#fff', fontWeight: 700 }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Outubro, 2025'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#475569' }}>
                  <ExternalLink size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID de Rastreamento</p>
                  <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#475569', fontFamily: 'monospace', fontWeight: 800 }}>FIN-{user?.id?.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Access Tier Panel */}
          <div className={styles.card} style={{ padding: '32px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <div>
                  <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plano de Acesso</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: '#8b5cf6' }}>Elite M&A</p>
               </div>
               <div style={{ width: '48px', height: '48px', background: '#8b5cf6', borderRadius: '14px', display: 'grid', placeItems: 'center', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}>
                  <Sparkles size={24} className="text-white" />
               </div>
            </div>
            <p style={{ margin: '24px 0', fontSize: '13px', color: '#8fa6c3', lineHeight: 1.6 }}>Seu terminal possui as credenciais de auditoria máxima (HAYIA Core) e acesso total ao Data Room de ativos institucionais.</p>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ width: '100%', height: '100%', background: '#8b5cf6' }}></div>
            </div>
            <div className="flex justify-between items-center mb-8">
               <span style={{ fontSize: '10px', color: '#475569', fontWeight: 800 }}>RECURSOS UTILIZADOS</span>
               <span style={{ fontSize: '10px', color: '#fff', fontWeight: 900 }}>100% DISPONÍVEL</span>
            </div>
            <button type="button" className={styles.btnGhost} style={{ width: '100%', height: '48px', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Upgrade de Terminal
            </button>
          </div>

          {/* Account Management Actions */}
          <div className={styles.card} style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
             <h4 style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zona Crítica</h4>
             <button type="button" className="flex items-center gap-3 w-100 text-[#475569] hover:text-[#ef4444] transition-colors" style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', fontWeight: 700 }}>
                <Trash2 size={16} /> Encerrar do Terminal Institutional
             </button>
          </div>

        </div>

      </div>
    </>
  );
}
