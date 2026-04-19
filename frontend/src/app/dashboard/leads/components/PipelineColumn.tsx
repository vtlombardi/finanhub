'use client';

import React from 'react';
import { LeadKanbanCard } from './LeadKanbanCard';
import { MoreVertical, Info } from 'lucide-react';

interface PipelineColumnProps {
  id: string;
  label: string;
  leads: any[];
  onViewLead: (lead: any) => void;
  onChatLead: (lead: any) => void;
  onStatusChange: (leadId: string, status: string) => void;
}

export function PipelineColumn({ id, label, leads, onViewLead, onChatLead, onStatusChange }: PipelineColumnProps) {
  return (
    <div style={{ 
      flex: '0 0 320px', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      background: 'rgba(255,255,255,0.01)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.03)',
      overflow: 'hidden'
    }}>
      {/* Column Header */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.03)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
          <span style={{ 
            fontSize: '10px', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '2px 8px', 
            borderRadius: '10px', 
            color: '#64748b',
            fontWeight: 800
          }}>
            {leads.length}
          </span>
        </div>
        <button style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Cards Area */}
      <div 
        className="custom-scrollbar"
        style={{ 
          flex: 1, 
          padding: '12px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {leads.length === 0 ? (
          <div style={{ 
            height: '100px', 
            border: '2px dashed rgba(255,255,255,0.03)', 
            borderRadius: '12px', 
            display: 'grid', 
            placeItems: 'center',
            color: '#1e293b'
          }}>
            <Info size={20} />
          </div>
        ) : (
          leads.map(lead => (
            <LeadKanbanCard 
              key={lead.id} 
              lead={lead} 
              onView={onViewLead} 
              onChat={onChatLead} 
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
