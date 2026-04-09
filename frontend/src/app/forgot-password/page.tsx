'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthService } from '@/services/AuthService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Erro ao processar a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4">
            <span className="text-white font-bold text-xl">FH</span>
          </Link>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Recuperar Senha
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Informe seu e-mail corporativo para receber um código de redefinição.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border-slate-700/50 relative z-10">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Se este e-mail estiver cadastrado, você receberá um código em breve.<br />
                Verifique sua caixa de entrada e spam.
              </p>
              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="block w-full btn-primary text-center mt-4"
              >
                Inserir código
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-premium"
                  placeholder="voce@empresa.com"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary mt-2">
                {loading ? 'Enviando...' : 'Enviar Código de Recuperação'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          Lembrou a senha? <Link href="/login" className="text-blue-400 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </main>
  );
}
