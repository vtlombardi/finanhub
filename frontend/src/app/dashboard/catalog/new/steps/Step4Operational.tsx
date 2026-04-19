'use client';

import React from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function Step4Operational() {
  const { formData, setFormData } = useCatalog();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ [e.target.name]: e.target.value });
  };

  const isProduct = formData.type === 'PRODUCT' || formData.type === 'BOTH';
  const isService = formData.type === 'SERVICE' || formData.type === 'BOTH';

  return (
    <div className={styles.wizardStep}>
      <div className={styles.stepHeader}>
        <h2>Estrutura Operacional</h2>
        <p>Apresente os detalhes de entrega e capacidade de execução da sua oferta.</p>
      </div>

      <div className={styles.formGrid}>
        {isProduct && (
          <div className={`${styles.operationBlock} ${isService ? styles.borderBottom : ''}`}>
            <h3 className="text-[#00b8b2] text-xs font-black uppercase tracking-widest mb-4">Métricas de Produto</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Unidade de Venda</label>
                <input 
                  type="text" 
                  name="unitOfSale"
                  placeholder="Ex: Unidade, Caixa, Tonelada..."
                  value={formData.unitOfSale || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Capacidade / Estoque</label>
                <input 
                  type="text" 
                  name="stockCapacity"
                  placeholder="Ex: 500 un/mês, Pronta entrega..."
                  value={formData.stockCapacity || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Prazo de Entrega</label>
                <input 
                  type="text" 
                  name="deliveryTime"
                  placeholder="Ex: 5 dias úteis"
                  value={formData.deliveryTime || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Local de Operação</label>
                <input 
                  type="text" 
                  name="operationLocation"
                  placeholder="Ex: São Paulo - SP, Global..."
                  value={formData.operationLocation || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
            </div>
          </div>
        )}

        {isService && (
          <div className={`${styles.operationBlock} ${isProduct ? 'mt-8' : ''}`}>
            <h3 className="text-[#00b8b2] text-xs font-black uppercase tracking-widest mb-4">Métricas de Serviço</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Formato de Execução</label>
                <select 
                  name="executionFormat"
                  value={formData.executionFormat || ''}
                  onChange={handleChange}
                  className={styles.selectDark}
                >
                  <option value="">Selecione...</option>
                  <option value="REMOTE">100% Remoto</option>
                  <option value="ONSITE">Presencial / In-company</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Disponibilidade</label>
                <input 
                  type="text" 
                  name="availability"
                  placeholder="Ex: Imediata, Próximo mês..."
                  value={formData.availability || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Escopo de Atuação</label>
                <input 
                  type="text" 
                  name="scope"
                  placeholder="Ex: Nacional, América Latina..."
                  value={formData.scope || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Prazo Médio de Execução</label>
                <input 
                  type="text" 
                  name="serviceTime"
                  placeholder="Ex: 3 meses, Ciclo fechado..."
                  value={formData.serviceTime || ''}
                  onChange={handleChange}
                  className={styles.inputDark}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
