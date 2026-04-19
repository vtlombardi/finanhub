'use client';

import React from 'react';
import { Zap, Target, Info, TrendingUp } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';

export function HayiaAdvisor() {
  const { currentStep } = useWizard();

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Posicionamento Estratégico',
          content: (
            <ul className="space-y-3">
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Título direto aumenta em 40% a abertura do deck.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Resumo executivo é seu primeiro contato com o mercado.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Categoria correta atrai investidores qualificados.</li>
            </ul>
          )
        };
      case 2:
        return {
          title: 'Transparência Financeira',
          content: (
            <ul className="space-y-3">
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Margem EBITDA mede a eficiência da operação.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Faturamento anual valida a escala do negócio.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Agrupe custos fixos para facilitar a análise.</li>
            </ul>
          )
        };
      case 3:
        return {
          title: 'Estrutura e Governança',
          content: (
            <ul className="space-y-3">
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Motivo da venda transmite segurança ao comprador.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Retenção de talentos chave aumenta o valuation.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Baixa dependência dos sócios reduz o risco.</li>
            </ul>
          )
        };
      case 4:
        return {
          title: 'Documentação e Data Room',
          content: (
            <ul className="space-y-3">
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Data Room organizado acelera o deal em 2 meses.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Capa em alta resolução transmite solidez.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Separe documentos contábeis de apresentações.</li>
            </ul>
          )
        };
      case 5:
        return {
          title: 'Pitch de Fechamento',
          content: (
            <ul className="space-y-3">
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Score elevado garante destaque na vitrine premium.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Revise pendências antes do envio para auditoria.</li>
              <li className="flex gap-2"><span className="text-var(--brand)">•</span> Oportunidades Premium recebem 3x mais propostas.</li>
            </ul>
          )
        };
      default:
        return null;
    }
  };

  const content = getStepContent();

  if (!content) return null;

  return (
    <div className={styles.advisorPanel}>
      <div className={styles.advisorHeader}>
        <div className={styles.advisorIcon}>
          <Zap size={20} />
        </div>
        <div className={styles.advisorTitle}>HAYIA STRATEGIC ADVISOR</div>
      </div>
      
      <div className={styles.advisorContent}>
        <strong className="text-white block mb-2">{content.title}</strong>
        <div className="text-[#9ab1cf] text-sm leading-relaxed">
          {content.content}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Zap size={14} />
          <span className="text-[8px] uppercase font-bold tracking-tighter">Mercado</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Target size={14} />
          <span className="text-[8px] uppercase font-bold tracking-tighter">Metas</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <Info size={14} />
          <span className="text-[8px] uppercase font-bold tracking-tighter">Governança</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <TrendingUp size={14} />
          <span className="text-[8px] uppercase font-bold tracking-tighter">Exit</span>
        </div>
      </div>
    </div>
  );
}
