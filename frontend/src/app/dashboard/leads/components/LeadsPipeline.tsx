'use client';

import React from 'react';
import { PipelineColumn } from './PipelineColumn';

interface LeadsPipelineProps {
  leads: any[];
  onViewLead: (lead: any) => void;
  onChatLead: (lead: any) => void;
  onStatusChange: (leadId: string, status: string) => void;
}

const STAGES = [
  { id: 'NEW',          label: 'Inbound' },
  { id: 'UNDER_REVIEW',  label: 'Em Análise' },
  { id: 'QUALIFIED',     label: 'Qualificado' },
  { id: 'PROPOSAL',      label: 'Proposta' },
  { id: 'IN_CONTACT',    label: 'Negociação' },
  { id: 'WON',           label: 'Fechado' },
];

export function LeadsPipeline({ leads, onViewLead, onChatLead, onStatusChange }: LeadsPipelineProps) {
  // Group leads by status
  const groupedLeads = STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.status === stage.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ 
      display: 'flex', 
      gap: '20px', 
      overflowX: 'auto', 
      paddingBottom: '24px',
      minHeight: '600px',
      height: 'calc(100vh - 350px)',
      maxHeight: '1000px'
    }} className="custom-scrollbar">
      {STAGES.map(stage => (
        <PipelineColumn 
          key={stage.id}
          id={stage.id}
          label={stage.label}
          leads={groupedLeads[stage.id] || []}
          onViewLead={onViewLead}
          onChatLead={onChatLead}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
