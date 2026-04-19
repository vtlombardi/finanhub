'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';
import { Briefcase, Tag, FileText } from 'lucide-react';
import { categoriesService } from '@/services/categories.service';

export function StepOverview() {
  const { form } = useWizard();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    categoriesService.getAll()
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3>Fundamentos do Ativo</h3>
            <p className={styles.headSub}>Defina a identidade e a classificação da sua oportunidade.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="text-var(--brand)" /> Título do Anúncio
            </label>
            <input
              {...form.register('title', { required: 'Título é obrigatório', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
              placeholder="Ex: Consultoria de TI com 12 anos de mercado"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Mínimo 10 caracteres</span>
              {form.formState.errors.title && (
                <span className="text-red-400 text-[10px] font-bold">{form.formState.errors.title?.message as string}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
              <Tag className="text-var(--brand)" /> Categoria
            </label>
            <select
              {...form.register('categoryId', { required: 'Categoria é obrigatória' })}
              className="w-full h-12 bg-[#0a172a] border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Define os filtros dinâmicos</span>
              {form.formState.errors.categoryId && (
                <span className="text-red-400 text-[10px] font-bold">{form.formState.errors.categoryId?.message as string}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
              <Tag className="text-var(--brand)" /> Tipo da Oportunidade
            </label>
            <select
              {...form.register('opportunityType')}
              className="w-full h-12 bg-[#0a172a] border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
            >
              <option value="SELL">Venda Total</option>
              <option value="PARTNERSHIP">Sociedade / Parceria</option>
              <option value="INVESTMENT">Captação de Investimento</option>
              <option value="ASSET_SALE">Venda de Ativos / Maquinário</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
              <Tag className="text-var(--brand)" /> Subcategoria (Opcional)
            </label>
            <input
              {...form.register('subtitle')}
              placeholder="Ex: Especializada em Cloud Computing"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all"
            />
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <label className="text-sm font-bold text-[#8ea4c3] uppercase tracking-wider flex items-center gap-2">
            <FileText className="text-var(--brand)" /> Resumo Executivo
          </label>
          <textarea
            {...form.register('description', { required: 'Resumo executivo é obrigatório', minLength: { value: 100, message: 'Tente detalhar um pouco mais (mínimo 100 caracteres)' } })}
            placeholder="Descreva brevemente a oportunidade, focando nos pontos que atraem um investidor..."
            className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-xl p-4 text-[#eef6ff] focus:border-var(--brand) outline-none transition-all resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] text-var(--muted) uppercase tracking-wider">Dica: 100 a 500 caracteres para melhor conversão.</span>
            {form.formState.errors.description && (
              <span className="text-red-400 text-[10px] font-bold">{form.formState.errors.description?.message as string}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
