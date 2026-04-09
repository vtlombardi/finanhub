'use client';

import React from 'react';
import { Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanTier } from '@shared/contracts';
import Link from 'next/link';

interface PlanGateProps {
  children: React.ReactNode;
  minTier: PlanTier;
  title?: string;
  description?: string;
  variant?: 'blur' | 'lock';
}

/**
 * Componente de Gating para recursos premium.
 * Bloqueia ou borra o conteúdo se o usuário não possuir o tier mínimo exigido.
 */
export function PlanGate({
  children,
  minTier,
  title = 'Recurso Premium',
  description = 'Faça upgrade do seu plano para desbloquear este recurso e acelerar seus negócios.',
  variant = 'lock'
}: PlanGateProps) {
  const { hasTier, loading } = useSubscription();

  // Durante o loading da assinatura, mantemos um estado neutro (ou shimmer se preferir)
  if (loading) {
    return (
      <div className="animate-pulse bg-slate-900/50 border border-slate-800 rounded-2xl h-32 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isAllowed = hasTier(minTier);

  if (isAllowed) {
    return <>{children}</>;
  }

  // Visual de Bloqueio (Lock)
  if (variant === 'lock') {
    return (
      <div className="relative group overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center transition-all hover:border-blue-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
            {title}
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </h3>
          
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            {description}
          </p>
          
          <Link 
            href="/dashboard/plans"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-600/20"
          >
            Ver Planos de Upgrade
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Visual de Desfoque (Blur)
  return (
    <div className="relative group">
      {/* Conteúdo Borrado */}
      <div className="blur-md pointer-events-none select-none filter opacity-40 transition-all group-hover:blur-lg">
        {children}
      </div>

      {/* Overlay de Upgrade */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
        <div className="bg-[#020617]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 text-center shadow-2xl max-w-sm transform transition-transform duration-300 group-hover:scale-105">
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <h4 className="text-white font-bold mb-1">{title}</h4>
          <p className="text-slate-400 text-xs mb-4">{description}</p>
          <Link 
            href="/dashboard/plans"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
          >
            Fazer Upgrade <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
