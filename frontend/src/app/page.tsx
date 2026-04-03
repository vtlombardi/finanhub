import { PublicHeader } from "@/components/layout/PublicHeader";
import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-transparent blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-slate-200">The Modern Engine for</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 leading-tight">Mergers & Acquisitions</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A infraestrutura corporativa digital que conecta compradores, vendedores e assessores 
            com segurança, agilidade e inteligência de mercado estruturada.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/deals" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group">
                Explorar Operações
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl transition-all flex items-center justify-center">
                Anuncie sua Empresa
             </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass-panel p-8 rounded-2xl">
                 <div className="h-12 w-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                   <ShieldCheck size={24} />
                 </div>
                 <h3 className="text-xl font-semibold mb-3">Ambiente Restrito</h3>
                 <p className="text-slate-400 leading-relaxed">Blindagem corporativa em M&A isolando a exposição do seu core de negócios frente aos curiosos de mercado.</p>
               </div>
               <div className="glass-panel p-8 rounded-2xl border-blue-500/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                   <BarChart3 size={120} />
                 </div>
                 <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                   <BarChart3 size={24} />
                 </div>
                 <h3 className="text-xl font-semibold mb-3">Indicadores Real-time</h3>
                 <p className="text-slate-400 leading-relaxed">Acompanhe KPIs e travas de valuation comparativo diretamente do seu dashboard financeiro integrado.</p>
               </div>
               <div className="glass-panel p-8 rounded-2xl">
                 <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                   <Zap size={24} />
                 </div>
                 <h3 className="text-xl font-semibold mb-3">Avaliação Limpa</h3>
                 <p className="text-slate-400 leading-relaxed">O workflow permite que a submissão de ofertas seja triada de imediato por nossos Bots e listadas enxutas.</p>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
