'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';
import { TrendingUp, DollarSign, PieChart, Activity } from 'lucide-react';
import { CategoryAttribute } from '../types';
import { categoriesService } from '@/services/categories.service';

export function StepFinancials() {
  const { form } = useWizard();
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryId = form.watch('categoryId');

  useEffect(() => {
    if (!categoryId) return;

    setLoading(true);
    categoriesService.getAttributes(categoryId)
      .then(data => {
        setAttributes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching attributes:', err);
        setLoading(false);
      });
  }, [categoryId]);

  // Grupos fixos para campos padronizados
  const financialGroups = [
    {
      title: 'Principais Métricas',
      icon: <DollarSign />,
      fields: [
        { name: 'price', label: 'Valor da Oportunidade', type: 'currency', helper: 'Valor total de avaliação ou aporte' },
        { name: 'annualRevenue', label: 'Faturamento Anual (LTM)', type: 'currency', helper: 'Soma dos últimos 12 meses' },
      ]
    },
    {
      title: 'Rentabilidade',
      icon: <TrendingUp />,
      fields: [
        { name: 'ebitda', label: 'EBITDA Anual', type: 'currency', helper: 'Lucro antes de juros, impostos e depreciação' },
        { name: 'margin', label: 'Margem Líquida (%)', type: 'percentage', helper: 'Relação entre lucro líquido e faturamento' },
      ]
    }
  ];

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
        <PieChart className="text-4xl text-var(--muted) mb-4" />
        <p className="text-var(--muted)">Selecione uma categoria no primeiro passo para habilitar os indicadores financeiros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Campos Padronizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {financialGroups.map((group, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHead}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-var(--brand)/10 border border-var(--brand)/20 flex items-center justify-center text-var(--brand)">
                  {group.icon}
                </div>
                <div>
                  <h3 className="text-lg">{group.title}</h3>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mt-4">
              {group.fields.map(field => (
                <div key={field.name} className="space-y-2">
                  <label className="text-xs font-bold text-[#8ea4c3] uppercase tracking-wider">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-var(--muted) font-mono text-sm">
                      {field.type === 'currency' ? 'R$' : '%'}
                    </span>
                    <input
                      type="number"
                      {...form.register(field.name as any)}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all font-mono"
                      placeholder="0,00"
                    />
                  </div>
                  {field.helper && <span className="text-[10px] text-var(--muted) uppercase tracking-wider">{field.helper}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Atributos Dinâmicos por Categoria */}
      {attributes.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-var(--purple)/10 border border-var(--purple)/20 flex items-center justify-center text-var(--purple)">
                <Activity />
              </div>
              <div>
                <h3 className="text-lg">Indicadores Específicos do Setor</h3>
                <p className={styles.headSub}>Métricas customizadas para a categoria selecionada.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {attributes.map(attr => (
              <div key={attr.id} className="space-y-2">
                <label className="text-xs font-bold text-[#8ea4c3] uppercase tracking-wider">
                  {attr.label} {attr.isRequired && <span className="text-var(--brand)">*</span>}
                </label>
                
                {attr.type === 'NUMBER' ? (
                  <input
                    type="number"
                    {...form.register(`attributes.${attr.id}`)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all font-mono"
                    placeholder="—"
                  />
                ) : attr.type === 'BOOLEAN' ? (
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all has-[:checked]:border-var(--brand) has-[:checked]:bg-var(--brand)/10">
                      <input type="radio" value="true" {...form.register(`attributes.${attr.id}`)} className="hidden" />
                      <span className="text-sm font-medium">Sim</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all has-[:checked]:border-var(--brand) has-[:checked]:bg-var(--brand)/10">
                      <input type="radio" value="false" {...form.register(`attributes.${attr.id}`)} className="hidden" />
                      <span className="text-sm font-medium">Não</span>
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    {...form.register(`attributes.${attr.id}`)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
                    placeholder="Preencha o valor..."
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-var(--brand) border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
