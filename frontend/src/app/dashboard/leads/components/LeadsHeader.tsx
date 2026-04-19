'use client';

import React from 'react';
import { 
  Users, Target, DollarSign, TrendingUp, 
  Clock, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

interface LeadsHeaderProps {
  stats: {
    total: number;
    qualified: number;
    negotiating: number;
    won: number;
    conversionRate: number;
    avgResponseTime: string;
    advancementRate: number;
  };
}

export function LeadsHeader({ stats }: LeadsHeaderProps) {
  const kpis = [
    {
      label: 'Volume Total',
      value: stats.total,
      subValue: 'Leads Inbound',
      icon: <Users size={18} />,
      color: '#3b82f6',
    },
    {
      label: 'Taxa de Avanço',
      value: `${stats.advancementRate.toFixed(1)}%`,
      subValue: 'Eficiência de Funil',
      icon: <TrendingUp size={18} />,
      color: '#10b981',
    },
    {
      label: 'Tempo de Resposta',
      value: stats.avgResponseTime,
      subValue: 'Média de Atendimento',
      icon: <Clock size={18} />,
      color: '#fb923c',
    },
    {
      label: 'Taxa de Conversão',
      value: `${stats.conversionRate.toFixed(1)}%`,
      subValue: 'Sucesso em Fechamentos',
      icon: <CheckCircle2 size={18} />,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => (
        <div key={kpi.label} className={styles.card} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          {/* subtle glow */}
          <div style={{ 
            position: 'absolute', 
            top: '-20px', 
            right: '-20px', 
            width: '100px', 
            height: '100px', 
            background: `${kpi.color}05`, 
            filter: 'blur(40px)',
            borderRadius: '50%'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: `${kpi.color}10`, 
              borderRadius: '12px', 
              display: 'grid', 
              placeItems: 'center',
              color: kpi.color,
              border: `1px solid ${kpi.color}20`
            }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {kpi.label}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              {kpi.value}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
             <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>{kpi.subValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
