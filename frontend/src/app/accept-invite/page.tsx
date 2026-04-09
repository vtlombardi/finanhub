'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { AuthService } from '@/services/AuthService';

function AcceptInviteLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email] = useState(searchParams.get('email') || '');
  const [code] = useState(searchParams.get('code') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (!email || !code) {
      setError('Link de convite inválido. Solicite um novo convite.');
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.acceptInvite({ email, code, password });
      Cookies.set('finanhub.token', data.access_token, { expires: 7 });
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Convite inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          readOnly
          className="input-premium opacity-60 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Criar Senha</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-premium"
          placeholder="Mínimo 8 caracteres"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Senha</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="input-premium"
          placeholder="Repita a senha"
          required
        />
      </div>

      <button type="submit" disabled={loading} className="w-full btn-primary mt-2">
        {loading ? 'Ativando conta...' : 'Ativar Conta e Entrar'}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4">
            <span className="text-white font-bold text-xl">FH</span>
          </Link>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Ativar Conta
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Defina sua senha para acessar o workspace.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border-slate-700/50 relative z-10">
          <Suspense fallback={<div className="text-slate-500 text-center animate-pulse">Carregando...</div>}>
            <AcceptInviteLogic />
          </Suspense>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          Já tem conta? <Link href="/login" className="text-blue-400 hover:underline">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
