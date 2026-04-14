'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/features/auth/AuthProvider';

export default function ProfilePage() {
  useAuthGuard();
  const { user } = useAuth();
  const { updateProfile, changePassword, loading, error } = useProfile();
  
  const [name, setName] = useState('');
  
  // Sincroniza nome inicial com usuário carregado
  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user]);

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
      await updateProfile({ name });
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setInnerError(err.message || 'Erro ao atualizar perfil.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setInnerError(null);

    if (newPassword !== confirmPassword) {
      setInnerError('As senhas não coincidem.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccessMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setInnerError(err.message || 'Erro ao alterar senha.');
    }
  };

  return (
    <AdminLayout>
      <div className="dashboard-content-wrapper p-6 lg:p-10 space-y-8 min-h-screen bg-[#020617]">
        {/* Header da Página */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
          <p className="text-slate-400 text-sm">Gerencie suas informações pessoais e configurações de segurança.</p>
        </div>

        {(successMessage || error || innerError) && (
          <div className={`p-4 rounded-md ${successMessage ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {successMessage || error || innerError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna da Esquerda: Dados do Usuário */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sessão: Informações Pessoais */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-semibold text-white">Informações Pessoais</h2>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Nome Completo</label>
                    <input 
                      type="text" 
                      id="profile-name"
                      name="fullName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2 opacity-60">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">E-mail (Não editável)</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      readOnly 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    id="save-profile-btn"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loading ? 'Salvando...' : 'Salvar Perfil'}
                  </button>
                </div>
              </form>
            </div>

            {/* Sessão: Segurança (Senha) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-semibold text-white">Segurança</h2>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Senha Atual</label>
                    <input 
                      type="password" 
                      id="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Nova Senha</label>
                      <input 
                        type="password" 
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Confirmar Nova Senha</label>
                      <input 
                        type="password" 
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                        placeholder="Repita a nova senha"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    id="change-password-btn"
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loading ? 'Processando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Coluna da Direita: Dados da Conta / Contexto */}
          <div className="space-y-8">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h3 className="text-white font-bold">{user?.fullName}</h3>
                    <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700">
                      {user?.role}
                    </span>
                 </div>
              </div>

              <div className="divide-y divide-slate-800">
                 <div className="py-3 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Empresa / Tenant</span>
                    <span className="text-sm text-slate-200">{user?.tenant?.name || 'Não informado'}</span>
                 </div>
                 <div className="py-3 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">ID da Conta</span>
                    <span className="text-xs font-mono text-slate-400">{user?.id}</span>
                 </div>
                 <div className="py-3 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Membro desde</span>
                    <span className="text-sm text-slate-200">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </span>
                 </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-xl p-6 shadow-xl">
               <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                     <h3 className="text-white font-bold">Seu Plano</h3>
                     <span className="text-blue-400 font-bold text-lg">Elite</span>
                  </div>
                  <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30">
                     ATIVO
                  </div>
               </div>
               <p className="text-xs text-slate-400 mb-6">Você tem acesso a todos os recursos premium da plataforma.</p>
               <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/10 transition-all">
                  Gerenciar Assinatura
               </button>
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
