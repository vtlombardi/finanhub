'use client';

import styles from '@/styles/Dashboard.module.css';
import { Zap, Shield, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

interface HayiaAdvisoryProps {
  score: number;
  trend: string;
  insight: string;
}

export function HayiaAdvisory({ score, trend, insight }: HayiaAdvisoryProps) {
  return (
    <div className={styles.card} style={{ 
      padding: '32px', 
      background: 'rgba(0,184,178,0.02)', 
      border: '1px solid rgba(0,184,178,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'rgba(0,184,178,0.1)', 
            borderRadius: '8px', 
            display: 'grid', 
            placeItems: 'center',
            color: '#00b8b2'
          }}>
            <Sparkles size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>HAYIA Intelligence</h2>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>Análise preditiva e orientação estratégica para otimização de ativos.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={14} className="text-[#00b8b2]" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Health Score</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{score.toFixed(1)}/100</div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Status de conformidade e prontidão para M&A excelente.</p>
        </div>

        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <TrendingUp size={14} className="text-[#3b82f6]" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projeção de Interesse</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>{trend}</div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Expectativa de fluxo baseada no comportamento atual do mercado.</p>
        </div>

        <div style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, rgba(0,184,178,0.1) 0%, transparent 100%)', 
          borderRadius: '16px', 
          border: '1px solid rgba(0,184,178,0.2)',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={14} className="text-[#00b8b2]" />
            <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Orientação Estratégica</h4>
          </div>
          <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
            &ldquo;{insight}&rdquo;
          </p>
          <button style={{ 
            marginTop: '20px', 
            background: 'none', 
            border: 'none', 
            padding: 0, 
            color: '#00b8b2', 
            fontSize: '12px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            cursor: 'pointer'
          }}>
            Ver Análise Detalhada <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
