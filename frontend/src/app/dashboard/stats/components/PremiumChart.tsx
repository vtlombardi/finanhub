'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import styles from '@/styles/Dashboard.module.css';

interface TrendPoint {
  date: string;
  views: number;
  leads: number;
}

interface PremiumChartProps {
  data: TrendPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  
  return (
    <div style={{ 
      background: '#0a0f1d', 
      border: '1px solid rgba(255,255,255,0.08)', 
      borderRadius: '12px', 
      padding: '16px', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(10px)' 
    }}>
      <p style={{ 
        color: '#64748b', 
        fontSize: '11px', 
        margin: '0 0 12px', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em' 
      }}>
        Data: {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
          <p style={{ color: '#fff', fontSize: '14px', margin: 0, fontWeight: 700 }}>
            {p.name}: <span style={{ color: p.color, fontWeight: 900 }}>{p.value}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export function PremiumChart({ data }: PremiumChartProps) {
  const formatTrendDate = (iso: string) => {
    const parts = iso.split('-');
    if (parts.length < 3) return iso;
    return `${parts[2]}/${parts[1]}`;
  };

  const chartData = data.map(d => ({
    ...d,
    formattedDate: formatTrendDate(d.date)
  }));

  return (
    <div className={styles.card} style={{ padding: '32px' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Engajamento & Performance</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0' }}>Série temporal de visualizações vs. manifestações de interesse (leads).</p>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          padding: '6px 16px', 
          borderRadius: '8px', 
          border: '1px solid rgba(255,255,255,0.05)', 
          fontSize: '11px', 
          fontWeight: 800, 
          color: '#64748b', 
          textTransform: 'uppercase' 
        }}>
           Série Temporal
        </div>
      </div>

      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
              axisLine={false} 
              tickLine={false}
              dy={15}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
              axisLine={false} 
              tickLine={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="views" 
              name="Visualizações" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorViews)" 
              strokeWidth={3}
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="leads" 
              name="Leads Qualificados" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorLeads)" 
              strokeWidth={3}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
