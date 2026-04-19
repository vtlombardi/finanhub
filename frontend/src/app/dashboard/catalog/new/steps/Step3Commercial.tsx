'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function Step3Commercial() {
  const { formData, setFormData } = useCatalog();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.wizardStep}>
      <div className={styles.stepHeader}>
        <h2>Posicionamento Comercial</h2>
        <p>Defina como sua oferta se destaca no mercado e para quem ela se destina.</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Público-Alvo</label>
          <input 
            type="text" 
            name="targetAudience"
            placeholder="Ex: Startups Series A, Indústrias Médias..."
            value={formData.targetAudience || ''}
            onChange={handleChange}
            className={styles.inputDark}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Diferencial Competitivo</label>
          <textarea 
            name="competitiveDifferential"
            rows={2}
            placeholder="O que te torna único? Ex: Tecnologia patenteada, Entrega em 24h..."
            value={formData.competitiveDifferential || ''}
            onChange={handleChange}
            className={styles.textareaDark}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Benefícios Principais</label>
          <textarea 
            name="benefits"
            rows={2}
            placeholder="Redução de custos de 30%, Agilidade no processo..."
            value={formData.benefits || ''}
            onChange={handleChange}
            className={styles.textareaDark}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Modelo de Contratação</label>
            <select 
              name="contractModel"
              value={formData.contractModel || ''}
              onChange={handleChange}
              className={styles.selectDark}
            >
              <option value="">Selecione...</option>
              {formData.type === 'SERVICE' ? (
                <>
                  <option value="PROJECT">Por Projeto</option>
                  <option value="RETAINER">Retainer Mensal</option>
                  <option value="HOURLY">Por Hora</option>
                  <option value="SUCCESS">Success Fee</option>
                </>
              ) : (
                <>
                  <option value="UNIT">Venda Unitária</option>
                  <option value="SUBSCRIPTION">Assinatura</option>
                  <option value="WHOLESALE">Atacado</option>
                  <option value="LICENSING">Licenciamento</option>
                </>
              )}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Ticket Médio / Preço Inicial (BRL)</label>
            <input 
              type="number" 
              name="avgTicket"
              placeholder="0,00"
              value={formData.avgTicket || ''}
              onChange={handleChange}
              className={styles.inputDark}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Recorrência</label>
          <div className="flex gap-4 mt-2">
            {['Inexistente', 'Diária', 'Semanal', 'Mensal', 'Anual'].map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                <input 
                  type="radio" 
                  name="recurrence" 
                  value={level}
                  checked={formData.recurrence === level}
                  onChange={handleChange}
                  className={styles.radioDark}
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
