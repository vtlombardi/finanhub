'use client';

import styles from '@/styles/Dashboard.module.css';
import { Target, Zap, ShieldCheck } from 'lucide-react';

interface IntentPoint {
  level: string;
  count: number;
}

interface IntentAnalysisProps {
  data: IntentPoint[];
}

export function IntentAnalysis({ data }: IntentAnalysisProps) {
  const totalLeads = data.reduce((acc, curr) => acc + curr.count, 0);

  const getPercentage = (count: number) => {
    if (totalLeads === 0) return 0;
    return (count / totalLeads) * 100;
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'HIGH': return 'Alta Intenção';
      case 'MEDIUM': return 'Médio Interesse';
      case 'LOW': return 'Exploratório';
      default: return 'Não Classificado';
    }
  };

  const getColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#10b981';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#64748b';
      default: return '#475569';
    }
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'HIGH': return <ShieldCheck size={16} />;
      case 'MEDIUM': return <Zap size={16} />;
      case 'LOW': return <Target size={16} />;
      default: return null;
    }
  };

  // Ensure ALL levels are present even if count is 0
  const sortedLevels = ['HIGH', 'MEDIUM', 'LOW', 'UNDEFINED'];
  const normalizedData = sortedLevels.map(lvl => {
    const found = data.find(d => d.level === lvl);
    return { level: lvl, count: found ? found.count : 0 };
  });

  return (
    <div className={styles.card} style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Qualidade dos Leads</h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Distribuição baseada no nível de engajamento HAYIA.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {normalizedData.map((item) => {
          const percentage = getPercentage(item.count);
          const color = getColor(item.level);

          return (
            <div key={item.level}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: color }}>{getIcon(item.level)}</div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{getLevelLabel(item.level)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{item.count}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({percentage.toFixed(0)}%)</span>
                </div>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    background: color, 
                    borderRadius: '10px',
                    transition: 'width 1s ease-out',
                    boxShadow: `0 0 10px ${color}40`
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          💡 <strong style={{ color: '#fff' }}>Insight:</strong> Leads de <strong>Alta Intenção</strong> tendem a fechar negócio 4x mais rápido. Priorize estes contatos na sua agenda semanal.
        </p>
      </div>
    </div>
  );
}
