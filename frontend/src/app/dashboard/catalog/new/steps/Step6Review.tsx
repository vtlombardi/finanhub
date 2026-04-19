'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck, Star } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function Step6Review() {
  const { formData } = useCatalog();

  const calculateQualityScore = () => {
    let score = 20; // Base score
    if (formData.description?.length > 100) score += 20;
    if (formData.benefits) score += 20;
    if (formData.competitiveDifferential) score += 20;
    if (formData.avgTicket) score += 20;
    return Math.min(score, 100);
  };

  const score = calculateQualityScore();

  return (
    <div className={styles.wizardStep}>
      <div className={styles.stepHeader}>
        <h2>Revisão e Publicação</h2>
        <p>Confira os detalhes da estruturação da sua oferta antes de torná-la pública.</p>
      </div>

      <div className={styles.reviewGrid}>
        {/* Preview Card */}
        <div className={styles.previewContainer}>
          <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50">Preview da Oferta</h3>
          <div className={styles.previewCard}>
            <div className={styles.previewImagePlace}>
              {formData.type}
            </div>
            <div className={styles.previewInfo}>
              <span className={styles.previewTag}>{formData.categoryName || 'Categoria'}</span>
              <h4>{formData.name || 'Nome do Produto/Serviço'}</h4>
              <p>{formData.executiveSummary || 'Sem resumo disponível...'}</p>
              <div className={styles.previewPrice}>
                <span>Valor Médio:</span>
                <strong>R$ {formData.avgTicket ? Number(formData.avgTicket).toLocaleString() : '---'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Score & Checklist */}
        <div className={styles.statusContainer}>
          <div className={styles.scoreBox}>
            <div className={styles.scoreCircle}>
              <svg viewBox="0 0 36 36">
                <path 
                  className={styles.scoreCircleBg} 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
                <path 
                  className={styles.scoreCircleFill} 
                  strokeDasharray={`${score}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
              </svg>
              <div className={styles.scoreValue}>
                <span>{score}</span>
                <small>Score</small>
              </div>
            </div>
            <div className={styles.scoreInfo}>
              <h4>Qualidade HAYIA</h4>
              <p>{score >= 80 ? 'Excelente estruturação comercial!' : 'Adicione mais detalhes para atingir o selo Premium.'}</p>
            </div>
          </div>

          <div className={styles.checklist}>
            <div className={styles.checkItem}>
              {formData.name ? <CheckCircle2 size={16} className="text-[#00b8b2]" /> : <AlertCircle size={16} className="text-yellow-500" />}
              <span>Identificação completa</span>
            </div>
            <div className={styles.checkItem}>
              {formData.description ? <CheckCircle2 size={16} className="text-[#00b8b2]" /> : <AlertCircle size={16} className="text-yellow-500" />}
              <span>Descrição detalhada</span>
            </div>
            <div className={styles.checkItem}>
              {formData.competitiveDifferential ? <CheckCircle2 size={16} className="text-[#00b8b2]" /> : <AlertCircle size={16} className="text-yellow-500" />}
              <span>Diferencial competitivo</span>
            </div>
            <div className={styles.checkItem}>
              <ShieldCheck size={16} className="text-[#00b8b2]" />
              <span>Verificação de conformidade</span>
            </div>
          </div>

          <div className={styles.premiumBanner}>
            <Star size={20} className="text-yellow-500" />
            <div>
              <strong>Selo Institucional Finanhub</strong>
              <p>Ofertas com score acima de 90 ganham destaque prioritário no marketplace.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
