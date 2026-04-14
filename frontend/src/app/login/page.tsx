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
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      router.push(callbackUrl);
    } catch {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {resetSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] text-center font-semibold tracking-wide animate-in fade-in slide-in-from-top-2">
          Senha redefinida com sucesso.
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center font-semibold tracking-wide animate-in">
          {error}
        </div>
      )}
      
      {/* Email Input */}
      <div className="space-y-2.5">
        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          E-mail
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-[52px] bg-white/[0.03] border border-white/[0.07] rounded-xl pl-11 pr-5 text-white placeholder:text-slate-800 focus:border-[#00b8b2]/40 focus:bg-white/[0.05] focus:outline-none transition-all duration-400 text-[13px] font-normal tracking-wide" 
            placeholder="voce@empresa.com"
            required
          />
        </div>
      </div>
      
      {/* Password Input */}
      <div className="space-y-2.5">
        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          Senha
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-[52px] bg-white/[0.03] border border-white/[0.07] rounded-xl pl-11 pr-5 text-white placeholder:text-slate-800 focus:border-[#00b8b2]/40 focus:bg-white/[0.05] focus:outline-none transition-all duration-400 text-[13px] font-normal tracking-wide" 
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {/* Esqueci link — inline right */}
      <div className="flex justify-end">
        <Link 
          href="/forgot-password" 
          className="text-[10px] text-slate-600 hover:text-[#00b8b2] transition-colors duration-400 font-medium tracking-wide uppercase"
        >
          Esqueceu a senha?
        </Link>
      </div>

      {/* CTA Button — Finanhub brand teal */}
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full h-[52px] bg-[#00b8b2] hover:bg-[#00c7c1] disabled:opacity-40 disabled:cursor-not-allowed text-[#01060f] text-[12px] font-black uppercase tracking-[0.25em] rounded-xl transition-all duration-400 mt-6 flex items-center justify-center gap-3 group btn-premium-shadow"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-[#01060f]/30 border-t-[#01060f]/80 rounded-full animate-spin" />
        ) : (
          <>
            <span>Entrar na Finanhub</span>
            <span className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-400">→</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#01060f] text-slate-100 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Deep Background Layers */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#01060f] to-[#040d1a] pointer-events-none" />
      {/* Subtle accent glow — bottom center, purely atmospheric */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00b8b2]/[0.015] rounded-full blur-[140px] pointer-events-none z-0" />
      
      {/* Main Card */}
      <div className="w-full max-w-[1080px] relative z-10">
        <div className="bg-[#07111e]/70 backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.08] premium-card-shadow overflow-hidden flex flex-col md:flex-row min-h-[620px]">
           
           {/* ─── LEFT PANEL — Branding 45% ─── */}
           <div className="w-full md:w-[45%] flex flex-col justify-between p-12 md:p-20 border-b border-white/[0.04] md:border-b-0 md:border-r md:border-white/[0.05]">
              
              {/* Logo at top */}
              <div>
                <Link href="/" className="inline-block">
                  <img 
                    src="/logo-finanhub-white.png" 
                    alt="Finanhub" 
                    className="h-6 w-auto object-contain opacity-70"
                  />
                </Link>
              </div>
              
              {/* Middle — Primary Branding */}
              <div className="py-10 md:py-0">
                <p className="text-[9px] font-bold text-[#00b8b2]/40 uppercase tracking-[0.45em] mb-7">
                  Portal Institucional
                </p>
                <h1 
                  className="login-h1 text-white mb-7" 
                >
                  Acesse a<br />Finanhub
                </h1>
                <p className="text-slate-500 text-[12px] font-normal leading-[1.8] max-w-[240px] opacity-80">
                  Conecte-se ao hub de oportunidades estratégicas de negócios e investimentos.
                </p>
              </div>

              {/* Bottom — Secondary CTA */}
              <div>
                <p className="text-[9px] text-slate-700 uppercase tracking-[0.22em] font-bold mb-4">
                  Ainda não tem acesso?
                </p>
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-3 text-slate-500 hover:text-white transition-all duration-400 group"
                >
                  <div className="w-8 h-8 rounded-full border border-white/[0.07] flex items-center justify-center group-hover:border-[#00b8b2]/30 group-hover:bg-[#00b8b2]/5 transition-all duration-400">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium tracking-wide uppercase">Solicitar acesso</span>
                </Link>
              </div>
           </div>

           {/* ─── RIGHT PANEL — Form 55% ─── */}
           <div className="w-full md:w-[55%] flex flex-col justify-center p-12 md:px-20 md:py-20 bg-white/[0.005]">
              <div className="w-full max-w-[340px] mx-auto">
                
                {/* Form Header */}
                <div className="mb-12">
                  <p className="text-[9px] font-bold text-[#00b8b2]/40 uppercase tracking-[0.45em] mb-4">
                    Autenticação Segura
                  </p>
                  <h2 
                    className="login-h2 text-white" 
                  >
                    Bem-vindo de volta
                  </h2>
                </div>

                <Suspense fallback={
                  <div className="py-20 text-center text-slate-700 text-[9px] uppercase tracking-[0.5em] font-black">
                    Carregando...
                  </div>
                }>
                  <LoginLogic />
                </Suspense>
              </div>
           </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 flex items-center justify-between px-4 opacity-20 hover:opacity-45 transition-opacity duration-700">
          <div className="flex gap-7 text-[9px] uppercase tracking-[0.25em] font-bold text-slate-600">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link>
          </div>
          <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-700">
            © 2026 Finanhub S.A.
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-in { animation: fadeSlide 0.5s ease forwards; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .login-h1 { font-weight: 400 !important; font-family: 'Poppins', sans-serif !important; }
        .login-h2 { font-weight: 300 !important; font-family: 'Poppins', sans-serif !important; }
      `}</style>
    </main>
  );
}
