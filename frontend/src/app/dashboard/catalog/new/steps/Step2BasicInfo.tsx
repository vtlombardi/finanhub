'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function Step2BasicInfo() {
  const { formData, setFormData } = useCatalog();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.wizardStep}>
      <div className={styles.stepHeader}>
        <h2>Informações Básicas</h2>
        <p>Identifique sua oferta e forneça uma visão clara do que ela representa.</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Nome do Produto/Serviço</label>
          <input 
            type="text" 
            name="name"
            placeholder="Ex: Consultoria em Fusões e Aquisições"
            value={formData.name || ''}
            onChange={handleChange}
            className={styles.inputDark}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Categoria</label>
            <select 
              name="categoryName"
              value={formData.categoryName || ''}
              onChange={handleChange}
              className={styles.selectDark}
            >
              <option value="">Selecione...</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="financeiro">Financeiro</option>
              <option value="logistica">Logística</option>
              <option value="industria">Indústria</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Subcategoria</label>
            <input 
              type="text"
              name="subcategoryId"
              placeholder="Ex: Software SaaS"
              value={formData.subcategoryId || ''}
              onChange={handleChange}
              className={styles.inputDark}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Resumo Executivo (Pitch)</label>
          <textarea 
            name="executiveSummary"
            rows={3}
            placeholder="Um resumo de 2 ou 3 linhas focado em valor..."
            value={formData.executiveSummary || ''}
            onChange={handleChange}
            className={styles.textareaDark}
          />
          <small>Este texto será o primeiro contato visual do investidor.</small>
        </div>

        <div className={styles.formGroup}>
          <label>Descrição Completa</label>
          <textarea 
            name="description"
            rows={6}
            placeholder="Detalhe o funcionamento, história ou especificações técnicas..."
            value={formData.description || ''}
            onChange={handleChange}
            className={styles.textareaDark}
          />
        </div>
      </div>
    </div>
  );
}
