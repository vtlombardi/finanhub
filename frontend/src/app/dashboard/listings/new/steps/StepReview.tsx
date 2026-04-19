'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';
import { CheckCircle2, AlertCircle, Award, Eye, Search, Zap, Image } from 'lucide-react';

export function StepReview() {
  const { form, qualityScore: score } = useWizard();
  const values = form.getValues();

  const checklist = [
    { label: 'Informações Básicas', complete: !!values.title && !!values.categoryId },
    { label: 'Viabilidade Financeira', complete: !!values.price && !!values.annualRevenue },
    { label: 'Dados Operacionais', complete: !!values.employeesCount && !!values.marketTime },
    { label: 'Materiais Visuais', complete: true /* Mock */ },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Score de Qualidade */}
        <div className={`${styles.card} md:col-span-1 border-var(--brand)/30`}>
          <div className="flex flex-col items-center text-center py-6">
            <div className="relative mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * score) / 100}
                  className="text-var(--brand) transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{score}</span>
                <span className="text-[10px] font-bold text-var(--brand) uppercase tracking-widest">Score</span>
              </div>
            </div>
            
            <h3 className="text-xl mb-2">Qualidade do Anúncio</h3>
            <p className="text-sm text-var(--muted) leading-relaxed">
              {score >= 80 ? 'Excelente! Seu anúncio tem altíssima chance de atrair investidores qualificados.' : 'Seu anúncio está bom, mas pode ser melhorado com mais detalhes operacionais.'}
            </p>
          </div>
        </div>

        {/* Card 2: Checklist & Pendências */}
        <div className={`${styles.card} md:col-span-2`}>
          <div className={styles.cardHead}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-lg text-var(--brand)" />
              <h3 className="text-lg">Checklist de Completude</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-sm text-[#eef6ff] font-medium">{item.label}</span>
                {item.complete ? (
                  <CheckCircle2 className="text-var(--brand)" />
                ) : (
                  <AlertCircle className="text-var(--orange)" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-var(--brand)/5 border border-var(--brand)/20 rounded-xl">
            <div className="flex items-center gap-3 text-var(--brand) mb-2">
              <Zap />
              <span className="text-xs font-black uppercase tracking-wider">Sugestão HAYIA</span>
            </div>
            <p className="text-sm text-[#9ab1cf] italic">
              "Para atingir o Score Premium (90+), considere adicionar mais 3 documentos ao Data Room e detalhar os diferenciais tecnológicos da operação."
            </p>
          </div>
        </div>
      </div>

      {/* Seção Preview Premium */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Eye className="text-lg text-var(--blue)" />
              <h3 className="text-lg">Preview do Anúncio (Padrão Marketplace)</h3>
            </div>
            <button className="text-xs font-bold text-var(--blue) uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all">
              <Search /> Visualização Completa
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-8 items-start opacity-80 pointer-events-none">
          <div className="w-full md:w-80 h-52 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-var(--muted)">
            <Image className="text-4xl" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-4 w-32 bg-var(--brand)/20 rounded-lg" />
            <h2 className="text-2xl font-bold">{values.title || 'Título da sua oportunidade'}</h2>
            <p className="text-var(--muted) line-clamp-3">{values.description || 'Aqui aparecerá o seu resumo executivo...'}</p>
            <div className="flex gap-4">
              <div className="h-10 w-24 bg-white/10 rounded-xl" />
              <div className="h-10 w-24 bg-white/10 rounded-xl" />
              <div className="h-10 w-24 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
