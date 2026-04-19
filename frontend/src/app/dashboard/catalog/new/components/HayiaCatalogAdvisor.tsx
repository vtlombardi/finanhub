'use client';

import React from 'react';
import { Lightbulb, Target, ShieldCheck, Zap } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';
import { useCatalog } from '../CatalogContext';

export function HayiaCatalogAdvisor() {
  const { currentStep, formData } = useCatalog();

  const getStepTips = () => {
    switch (currentStep) {
      case 1:
        return {
          icon: <Zap size={20} />,
          title: "Escolha o Modelo Ideal",
          description: "Certifique-se de escolher o tipo correto. Isso afeta como sua oferta será filtrada por investidores e empresas.",
          tips: [
            "Produto: Foco em escalabilidade e estoque.",
            "Serviço: Foco em expertise e escopo."
          ]
        };
      case 2:
        return {
          icon: <Lightbulb size={20} />,
          title: "Dicas de Escrita",
          description: "Descrições mais objetivas e focadas em valor tendem a converter 40% mais no ecossistema FINANHUB.",
          tips: [
            "Use um resumo executivo matador.",
            "Destaque resultados logo no início."
          ]
        };
      case 3:
        return {
          icon: <Target size={20} />,
          title: "Posicionamento",
          description: "Definir claramente quem é seu público-alvo ajuda a HAYIA a fazer o match perfeito.",
          tips: [
            "Seja específico no ticket médio.",
            "Explique por que sua solução é única no mercado."
          ]
        };
      case 4:
        return {
          icon: <ShieldCheck size={20} />,
          title: "Estrutura Operacional",
          description: "Transparência operacional gera confiança institucional imediata.",
          tips: [
            formData.type === 'SERVICE' ? "Detalhe bem os prazos de execução." : "Informe a capacidade real de distribuição."
          ]
        };
      case 5:
        return {
          icon: <Zap size={20} />,
          title: "Mídia de Alto Nível",
          description: "Adicionar catálogo ou apresentações aumenta a credibilidade em 60%.",
          tips: [
            "Use imagens de alta resolução.",
            "PDFs institucionais são essenciais."
          ]
        };
      case 6:
        return {
          icon: <Zap size={20} />,
          title: "Quase lá!",
          description: "Revise com cuidado. Uma oferta bem estruturada é o primeiro passo para o sucesso na nossa plataforma.",
          tips: [
            "Confira o score de qualidade.",
            "O preview reflete o que o investidor verá."
          ]
        };
      default:
        return null;
    }
  };

  const advice = getStepTips();

  if (!advice) return null;

  return (
    <div className={styles.advisorCard}>
      <div className={styles.advisorHeader}>
        <div className={styles.advisorIcon}>
          {advice.icon}
        </div>
        <h3>HAYIA Advisor</h3>
      </div>

      <div className={styles.advisorContent}>
        <div className={styles.adviceBlock}>
          <h4>{advice.title}</h4>
          <p>{advice.description}</p>
        </div>

        <div className={styles.tipsList}>
          {advice.tips.map((tip, idx) => (
            <div key={idx} className={styles.tipItem}>
              <div className={styles.tipDot} />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.advisorFooter}>
        <span>IA Consultiva em tempo real</span>
      </div>
    </div>
  );
}
