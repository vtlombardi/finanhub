'use client';

import React from 'react';
import { Upload, Image as ImageIcon, FileText, Plus } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function Step5Media() {
  const { formData, setFormData } = useCatalog();

  return (
    <div className={styles.wizardStep}>
      <div className={styles.stepHeader}>
        <h2>Mídia e Materiais</h2>
        <p>Enriqueça sua oferta com imagens de alta qualidade e documentos institucionais.</p>
      </div>

      <div className={styles.mediaGrid}>
        {/* Imagem de Capa */}
        <div className={styles.mediaCardMain}>
          <div className={styles.mediaHeader}>
            <ImageIcon size={16} />
            <span>Imagem de Capa</span>
          </div>
          <div className={styles.uploadPlaceholder}>
            <Upload size={32} />
            <p>Clique para upload ou arraste</p>
            <span>PNG ou JPG (Sugerido: 1200x800px)</span>
          </div>
        </div>

        {/* Galeria */}
        <div className={styles.mediaCardGallery}>
          <div className={styles.mediaHeader}>
            <Plus size={16} />
            <span>Galeria de Fotos</span>
          </div>
          <div className={styles.galleryStrip}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.gallerySlot}>
                <Plus size={16} />
              </div>
            ))}
          </div>
        </div>

        {/* Documentos */}
        <div className={styles.documentsSection}>
          <h3 className="text-[#00b8b2] text-xs font-black uppercase tracking-widest mt-8 mb-4">Documentação Técnica e Comercial</h3>
          
          <div className={styles.docRow}>
            <div className={styles.docItem}>
              <div className={styles.docIcon}><FileText size={20} /></div>
              <div className={styles.docInfo}>
                <span className={styles.docTitle}>Catálogo de Produtos</span>
                <span className={styles.docStatus}>Nenhum arquivo enviado</span>
              </div>
              <button className={styles.btnActionIcon}><Plus size={16} /></button>
            </div>

            <div className={styles.docItem}>
              <div className={styles.docIcon}><FileText size={20} /></div>
              <div className={styles.docInfo}>
                <span className={styles.docTitle}>Apresentação Institucional</span>
                <span className={styles.docStatus}>Nenhum arquivo enviado</span>
              </div>
              <button className={styles.btnActionIcon}><Plus size={16} /></button>
            </div>
          </div>

          <div className={styles.docRow}>
            <div className={styles.docItem}>
              <div className={styles.docIcon}><FileText size={20} /></div>
              <div className={styles.docInfo}>
                <span className={styles.docTitle}>Documentos Complementares</span>
                <span className={styles.docStatus}>Nenhum arquivo enviado</span>
              </div>
              <button className={styles.btnActionIcon}><Plus size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
