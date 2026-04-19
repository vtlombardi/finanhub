'use client';

import React from 'react';
import { 
  MessageSquare, MoreHorizontal, Shield, 
  DollarSign, Zap, ArrowRight, User,
  Calendar, Info
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

interface LeadKanbanCardProps {
  lead: any;
  onView: (lead: any) => void;
  onChat: (lead: any) => void;
  onStatusChange: (leadId: string, status: string) => void;
}

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  HIGH:   { label: 'Alta Qualificação', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  MEDIUM: { label: 'Interesse Médio',  color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  LOW:    { label: 'Interesse Baixo',  color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

export function LeadKanbanCard({ lead, onView, onChat, onStatusChange }: LeadKanbanCardProps) {
  const score = lead.score ?? 0;
  const intent = lead.intentLevel ? INTENT_CONFIG[lead.intentLevel] : null;
  const initials = lead.investor?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  
  // Calculate potential value: use listing price or max proposal
  const proposals = lead.proposals || [];
  const maxProposal = proposals.reduce((max: number, p: any) => Math.max(max, Number(p.valueOffered)), 0);
  const displayValue = maxProposal > 0 ? maxProposal : Number(lead.listing?.price || 0);

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(displayValue);

  return (
    <div 
      className={styles.card} 
      style={{ 
        padding: '16px', 
        marginBottom: '12px', 
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.03)',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onView(lead)}
    >
      {/* Header: Score & Value */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            {formattedValue}
          </div>
          {/* Match Score Layer */}
          {lead.match && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <div style={{ 
                padding: '2px 6px', 
                background: 'rgba(0,184,178,0.1)', 
                border: '1px solid rgba(0,184,178,0.2)', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Target size={10} className="text-[#00b8b2]" />
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#00b8b2', textTransform: 'uppercase' }}>
                  {lead.match.score}% Fit
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative', width: '36px', height: '36px', display: 'grid', placeItems: 'center' }}>
          <svg style={{ position: 'absolute', width: '36px', height: '36px', transform: 'rotate(-90deg)' }}>
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="rgba(255,255,255,0.03)" 
              strokeWidth="3" 
            />
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke={score > 70 ? '#10b981' : score > 40 ? '#fb923c' : '#ef4444'} 
              strokeWidth="3" 
              strokeDasharray={100} 
              strokeDashoffset={100 - score}
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff' }}>{score}</span>
        </div>
      </div>

      {/* Investor Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'grid',
          placeItems: 'center',
          fontSize: '10px',
          fontWeight: 800,
          color: '#00b8b2'
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#eef6ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.investor?.fullName}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.listing?.title}
          </div>
        </div>
      </div>

      {/* HAYIA Summary */}
      <div style={{ 
        padding: '10px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '8px', 
        marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Zap size={10} className="text-[#00b8b2]" />
          <span style={{ fontSize: '9px', fontWeight: 900, color: '#00b8b2', textTransform: 'uppercase' }}>HAYIA Counsel</span>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: '#8fa6c3', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {lead.aiReasonSummary || 'Aguardando auditoria estratégica...'}
        </p>
      </div>

      {/* Footer: Tags & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
           {intent && (
             <div style={{ 
               padding: '4px 8px', 
               borderRadius: '4px', 
               background: intent.bg, 
               color: intent.color, 
               fontSize: '9px', 
               fontWeight: 800,
               border: `1px solid ${intent.color}20`
             }}>
               {intent.label}
             </div>
           )}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onChat(lead); }}
            style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer' }}
            className="hover:text-[#00b8b2] hover:border-[#00b8b2] transition-colors"
          >
            <MessageSquare size={14} />
          </button>
          <button 
            style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer' }}
            className="hover:text-white hover:border-white/20 transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
