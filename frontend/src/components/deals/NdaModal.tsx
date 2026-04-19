'use client';

import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, FileText, Lock } from 'lucide-react';

interface NdaModalProps {
  listingTitle: string;
  onAccept: () => void;
  onCancel: () => void;
}

export function NdaModal({ listingTitle, onAccept, onCancel }: NdaModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxScale: '600px',
        maxWidth: '600px',
        background: '#0a0f1d',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        animation: 'modalOpen 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <style>{`
          @keyframes modalOpen {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ padding: '32px', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'rgba(251,146,60,0.1)', 
            display: 'grid', 
            placeItems: 'center', 
            color: '#fb923c',
            margin: '0 auto 20px'
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Acordo de Confidencialidade (NDA)</h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Acesso estratégico a documentos de auditados de <strong>{listingTitle}</strong></p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
          <div style={{ 
            padding: '24px', 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.02)',
            fontSize: '14px',
            color: '#8fa6c3',
            lineHeight: 1.8
          }}>
            <p style={{ marginTop: 0 }}>O INVESTIDOR compromete-se a manter absoluta confidencialidade sobre todos os Dados, Informações e Documentos que lhe venham a ser revelados em decorrência do acesso ao Data Room da oportunidade <strong>{listingTitle}</strong>.</p>
            
            <p>1. <strong>Uso Restrito:</strong> As informações devem ser utilizadas exclusivamente para o propósito de avaliação da operação de M&A em curso.</p>
            
            <p>2. <strong>Não Divulgação:</strong> O investidor não poderá revelar, repassar ou dar ciência das informações a terceiros, exceto consultores profissionais (advogados, contadores) vinculados por dever de sigilo.</p>
            
            <p>3. <strong>Vencimento:</strong> Estas obrigações de confidencialidade permanecerão vigentes pelo prazo de 24 (vinte e quatro) meses.</p>
            
            <p style={{ marginBottom: 0 }}>Ao aceitar este termo, você declara ciência de que o descumprimento destas cláusulas poderá gerar responsabilização civil e reparação de danos.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '32px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            marginBottom: '24px',
            userSelect: 'none'
          }}>
            <input 
              type="checkbox" 
              checked={accepted} 
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fb923c' }}
            />
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>Li e concordo integralmente com os termos deste NDA</span>
          </label>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={onCancel}
              style={{ 
                flex: 1, 
                height: '48px', 
                borderRadius: '14px', 
                background: 'rgba(255,255,255,0.02)', 
                color: '#64748b', 
                border: '1px solid rgba(255,255,255,0.05)', 
                fontWeight: 800,
                cursor: 'pointer'
              }}
              className="hover:bg-white/5"
            >
              Recusar
            </button>
            <button 
              disabled={!accepted}
              onClick={onAccept}
              style={{ 
                flex: 2, 
                height: '48px', 
                borderRadius: '14px', 
                background: accepted ? '#fb923c' : 'rgba(251,146,60,0.2)', 
                color: '#fff', 
                border: 'none', 
                fontWeight: 900,
                cursor: accepted ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              className={accepted ? "hover:scale-[1.02] active:scale-[0.98]" : ""}
            >
              <Lock size={18} />
              <span>Aceitar NDA & Acessar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
