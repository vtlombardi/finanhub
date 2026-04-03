'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/features/auth/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Campos Básicos de Form 
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    tenantId: '' 
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. O user cria-se no Banco através do UsersController atrelando-se ao Tenant passado
      await AuthService.register(formData.fullName, formData.email, formData.password, formData.tenantId);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Falha ao registrar usuário corporativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4">
             <span className="text-white font-bold text-xl">FH</span>
           </Link>
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
             Crie seu Acesso B2B
           </h1>
           <p className="text-slate-400 mt-2 text-sm">Estruturando operação no monorepo de M&A</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border-slate-700/50">
           {success ? (
              <div className="text-center py-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-200">Cadastrado com sucesso!</h3>
                  <p className="text-slate-400 text-sm mt-2">Sua corporação foi interligada. Redirecionando para login...</p>
              </div>
           ) : (
           <form onSubmit={handleRegister} className="space-y-4">
              {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome / Documento</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="input-premium" 
                  placeholder="Nome Completo Analista"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-premium" 
                  placeholder="voce@empresa.com.br"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="input-premium" 
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">ID Tenant (Empresa)</label>
                    <input 
                      type="text" 
                      value={formData.tenantId}
                      onChange={e => setFormData({...formData, tenantId: e.target.value})}
                      className="input-premium" 
                      placeholder="Ex: c1d9-4b"
                      required
                    />
                  </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full btn-primary mt-4">
                {loading ? 'Criando Escopo...' : 'Registrar Operação'}
              </button>
            </form>
            )}
        </div>
        
        {!success && <p className="text-center mt-6 text-sm text-slate-500">
           Já opera a rede M&A? <Link href="/login" className="text-blue-400 hover:underline">Entre no Backoffice</Link>
        </p>}
      </div>
    </main>
  );
}
