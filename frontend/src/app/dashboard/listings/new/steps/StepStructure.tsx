'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';
import { Users, Clock, HelpCircle, Zap } from 'lucide-react';

export function StepStructure() {
  const { form } = useWizard();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3>Estrutura Operacional</h3>
            <p className={styles.headSub}>Detalhes sobre o funcionamento e o estado atual do negócio.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
              <Users className="text-var(--brand)" /> Número de Colaboradores
            </label>
            <input
              type="number"
              {...form.register('employeesCount')}
              placeholder="Ex: 15"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
            />
            <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Total de funcionários diretos e indiretos.</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
              <Clock className="text-var(--brand)" /> Tempo de Mercado (Anos)
            </label>
            <input
              type="number"
              {...form.register('marketTime')}
              placeholder="Ex: 5"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
            />
            <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Anos de operação ininterrupta do CNPJ atual.</span>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="text-var(--brand)" /> Motivo da Venda / Captação
          </label>
          <textarea
            {...form.register('reasonForSale')}
            placeholder="Explique os motivos estratégicos para esta movimentação..."
            className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all resize-none"
          />
          <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Investidores valorizam transparência sobre a saída dos sócios.</span>
        </div>

        <div className="mt-8 space-y-2">
          <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
            <Zap className="text-var(--brand)" /> Diferenciais e Pontos Fortes
          </label>
          <textarea
            {...form.register('operationStructure')}
            placeholder="Cite o que torna este negócio único (tecnologia própria, contratos fixos, localização, etc.)..."
            className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all resize-none"
          />
          <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Ex: Tecnologia proprietária, contratos de 5 anos, etc.</span>
        </div>
      </div>
    </div>
  );
}
