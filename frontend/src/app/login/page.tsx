'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import Link from 'next/link';

// Componente Interno que usa SearchParams (Exige Suspense Boundary no Next.js App Router)
function LoginLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redireciona o usuário perfeitamente de volta pro ponto de interrupção (Vitrine)
      router.push(callbackUrl);
    } catch {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">{error}</div>}
      
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
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
        <input 
          type="password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-premium" 
          placeholder="••••••••"
          required
        />
      </div>
      
      <button type="submit" disabled={loading} className="w-full btn-primary mt-2">
        {loading ? 'Acessando...' : 'Entrar na Plataforma'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <Link href="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4">
             <span className="text-white font-bold text-xl">FH</span>
           </Link>
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
             Bem-vindo ao Finanhub
           </h1>
           <p className="text-slate-400 mt-2 text-sm">Autentique-se para interagir com o mercado.</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border-slate-700/50 relative z-10">
           <Suspense fallback={<div className="text-slate-500 text-center animate-pulse">Carregando Módulo Seguro...</div>}>
              <LoginLogic />
           </Suspense>
        </div>
        
        <p className="text-center mt-6 text-sm text-slate-500">
           Ainda não tem conta? <Link href="/register" className="text-blue-400 hover:underline">Solicite Acesso à Network</Link>
        </p>
      </div>
    </main>
  );
}
