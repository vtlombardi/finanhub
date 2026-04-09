'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';

function ResetPasswordLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword({ email, code, newPassword });
      router.push('/login?reset=success');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Código inválido ou expirado. Solicite um novo.');
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
          onChange={e => setEmail(e.target.value)}
          className="input-premium"
          placeholder="voce@empresa.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Código de Verificação</label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="input-premium tracking-widest text-center text-xl font-bold"
          placeholder="000000"
          maxLength={6}
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Verifique seu e-mail. Não recebeu?{' '}
          <Link href="/forgot-password" className="text-blue-400 hover:underline">Solicitar novo código</Link>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Nova Senha</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="input-premium"
          placeholder="Mínimo 8 caracteres"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nova Senha</label>
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
        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4">
            <span className="text-white font-bold text-xl">FH</span>
          </Link>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Redefinir Senha
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Insira o código recebido por e-mail e escolha uma nova senha.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border-slate-700/50 relative z-10">
          <Suspense fallback={<div className="text-slate-500 text-center animate-pulse">Carregando...</div>}>
            <ResetPasswordLogic />
          </Suspense>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          <Link href="/login" className="text-blue-400 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </main>
  );
}
