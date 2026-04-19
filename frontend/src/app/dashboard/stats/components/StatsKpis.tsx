'use client';

import { TrendingUp, TrendingDown, Eye, Users, Activity, BarChart3 } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

interface KpiProps {
  label: string;
  value: string | number;
  variation: number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ label, value, variation, icon, color }: KpiProps) {
  const isPositive = variation >= 0;
  
  return (
    <div className={styles.card} style={{ 
      padding: '24px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      border: '1px solid rgba(255,255,255,0.03)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          background: `${color}10`, 
          borderRadius: '12px', 
          display: 'grid', 
          placeItems: 'center', 
          color: color, 
          border: `1px solid ${color}20` 
        }}>
          {icon}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          padding: '4px 8px', 
          borderRadius: '20px', 
          background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: isPositive ? '#10b981' : '#ef4444',
          fontSize: '11px',
          fontWeight: 800
        }}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(variation).toFixed(1)}%
        </div>
      </div>
      
      <div>
        <p style={{ 
          fontSize: '11px', 
          color: '#64748b', 
          margin: '0 0 4px', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em' 
        }}>
          {label}
        </p>
        <p style={{ 
          fontSize: '28px', 
          fontWeight: 900, 
          color: '#fff', 
          margin: 0, 
          letterSpacing: '-0.02em' 
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface StatsKpisProps {
  kpis: {
    monthlyViews: number;
    viewsVariation: number;
    totalLeads: number;
    leadsVariation: number;
    conversionRate: string;
    conversionVariation: string;
    potentialVolume: number;
  };
}

export function StatsKpis({ kpis }: StatsKpisProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        label="Visualizações"
        value={kpis.monthlyViews.toLocaleString()}
        variation={kpis.viewsVariation}
        icon={<Eye size={20} />}
        color="#3b82f6"
      />
      <KpiCard
        label="Leads Recebidos"
        value={kpis.totalLeads}
        variation={kpis.leadsVariation}
        icon={<Users size={20} />}
        color="#8b5cf6"
      />
      <KpiCard
        label="Taxa de Conversão"
        value={kpis.conversionRate}
        variation={parseFloat(kpis.conversionVariation)}
        icon={<Activity size={20} />}
        color="#ec4899"
      />
      <KpiCard
        label="Volume Potencial"
        value={formatCurrency(kpis.potentialVolume)}
        variation={12.5} // Placeholder variation for volume if not calculated in backend yet
        icon={<BarChart3 size={20} />}
        color="#10b981"
      />
    </div>
  );
}
