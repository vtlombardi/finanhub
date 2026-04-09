'use client';

import React from 'react';
import { Sparkles, ArrowUpRight, BrainCircuit, Target, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';

/**
 * Card de Insights da HAYIA no Dashboard.
 * Mostra insights de IA ou convida para upgrade se o plano for inferior ao Professional/Elite.
 */
export function HayiaInsightCard() {
  const { hasTier, loading } = useSubscription();

  if (loading) return null;

  const isElite = hasTier('ELITE');
  const isProfessional = hasTier('PROFESSIONAL');

  return (
    <div className="relative group overflow-hidden bg-slate-900/60 border border-slate-800 rounded-2xl p-6 transition-all hover:border-blue-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Insights HAYIA</h3>
              {isElite ? (
                <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                  Ativo
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Preview
                </span>
              )}
            </div>
            
            {!isElite ? (
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Nossa IA identificou <span className="text-blue-400 font-semibold">12 potenciais investidores</span> com fit para o seu setor. Faça upgrade para o plano <span className="text-white font-bold">Elite</span> e inicie o matching ativo agora.
              </p>
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                O Agente HAYIA está processando mandatos de compra para o seu setor. <span className="text-emerald-400">3 novos matches qualificados</span> encontrados nas últimas 24h.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isElite ? (
            <Link 
              href="/dashboard/plans"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-600/20"
            >
              Fazer Upgrade
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            </Link>
          ) : (
            <Link 
              href="/dashboard/leads"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all border border-slate-700"
            >
              Ver Matches
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}
