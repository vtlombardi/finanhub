'use client';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';

export function PublicHeader() {
  const { user } = useAuth(); // Monitora token em sessão de forma passiva

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">FH</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">FINANHUB</span>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
           <Link href="/deals" className="hover:text-blue-400 transition-colors">Portfólio de Ativos</Link>
           <Link href="/anuncie" className="hover:text-blue-400 transition-colors">Planos</Link>
           <Link href="/about" className="hover:text-blue-400 transition-colors">Sobre Nós</Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-4">
          {user ? (
             <Link href="/dashboard" className="text-sm font-medium text-slate-200 hover:text-white px-4 py-2 border border-slate-700 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition">
               Ir para o Painel
             </Link>
          ) : (
             <>
               <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                 Fazer Login
               </Link>
               <Link href="/register" className="btn-primary text-sm shadow-blue-500/10">
                 Começar Agora
               </Link>
             </>
          )}
        </div>
      </div>
    </header>
  );
}
