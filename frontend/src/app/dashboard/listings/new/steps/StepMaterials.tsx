'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useWizard } from '../WizardContext';
import { Image, Plus, FileText, Lock, Eye, Trash2 } from 'lucide-react';

export function StepMaterials() {
  const { form } = useWizard();

  // Mock de arquivos para o UI (integrar com state real depois)
  const gallery = [
    { id: 1, url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400', isCover: true },
  ];

  const docs = [
    { id: 1, name: 'Deck_Apresentacao_V1.pdf', size: '4.2MB', type: 'marketing' },
    { id: 2, name: 'Demonstrativo_DRE_2023.xlsx', size: '1.1MB', type: 'confidential' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Seção 1: Visual (Capa e Galeria) */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3>Identidade Visual</h3>
            <p className={styles.headSub}>Imagens de alta qualidade aumentam a atratividade do anúncio.</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          <div className="min-w-[200px] h-[140px] border-2 border-dashed border-var(--line) rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-var(--brand) hover:bg-var(--brand)/5 cursor-pointer transition-all">
            <Plus className="text-2xl text-var(--muted)" />
            <span className="text-xs font-bold text-var(--muted) uppercase">Adicionar Capa</span>
          </div>

          {gallery.map(img => (
            <div key={img.id} className="relative min-w-[240px] h-[140px] rounded-2xl overflow-hidden border border-white/10 group">
              <img src={img.url} alt="Listing" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"><Eye /></button>
                <button className="w-9 h-9 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center text-red-400"><Trash2 /></button>
              </div>
              {img.isCover && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-var(--brand) text-[#06111f] text-[10px] font-black uppercase rounded-lg">Capa</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Seção 2: Data Room (Documentos) */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-var(--blue)/10 border border-var(--blue)/20 flex items-center justify-center text-var(--blue)">
              <Lock />
            </div>
            <div>
              <h3>Data Room Estratégico</h3>
              <p className={styles.headSub}>Documentos e apresentações protegidos por confidencialidade.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border-2 border-dashed border-var(--line) rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-var(--blue) hover:bg-var(--blue)/5 cursor-pointer transition-all group">
            <div className="w-12 h-12 rounded-full bg-var(--blue)/10 flex items-center justify-center text-var(--blue) group-hover:scale-110 transition-transform">
              <Plus className="text-2xl" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-white mb-1">Upload de Documento</span>
              <span className="block text-xs text-var(--muted) uppercase">PDF, XLSX ou PPTX (Max 20MB)</span>
            </div>
          </div>

          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-var(--line-2) transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.type === 'confidential' ? 'bg-var(--orange)/10 text-var(--orange)' : 'bg-var(--blue)/10 text-var(--blue)'}`}>
                    <FileText />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white">{doc.name}</span>
                    <span className="block text-[11px] text-var(--muted) uppercase tracking-wider">{doc.size} • {doc.type === 'confidential' ? 'Acesso Restrito' : 'Acesso Livre'}</span>
                  </div>
                </div>
                <button className="p-2 text-var(--muted) hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
