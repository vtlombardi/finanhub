'use client';

import React, { useState, useMemo } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LeadsHeader } from './components/LeadsHeader';
import { LeadsPipeline } from './components/LeadsPipeline';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { LeadChatOverlay } from './components/LeadChatOverlay';
import { Loader2, Filter, Download, Plus, Search } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

export default function LeadsPipelinePage() {
  useAuthGuard();
  const { leads, loading, error, updateLeadStatus, updateLeadNotes } = useLeads();
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeChatLead, setActiveChatLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Stats
  const stats = useMemo(() => {
    if (!leads) return { total: 0, qualified: 0, negotiating: 0, won: 0, conversionRate: 0, avgResponseTime: '0h', advancementRate: 0 };
    
    const total = leads.length;
    const qualified = leads.filter(l => l.status === 'QUALIFIED' || l.status === 'PROPOSAL' || l.status === 'IN_CONTACT' || l.status === 'WON').length;
    const won = leads.filter(l => l.status === 'WON').length;
    const negotiating = leads.filter(l => l.status === 'IN_CONTACT' || l.status === 'PROPOSAL').length;
    
    return {
      total,
      qualified,
      negotiating,
      won,
      conversionRate: total > 0 ? (won / total) * 100 : 0,
      avgResponseTime: '1.4h', // Mocked as requested
      advancementRate: total > 0 ? (qualified / total) * 100 : 0,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(l => {
      const search = searchQuery.toLowerCase();
      return (
        l.investor?.fullName.toLowerCase().includes(search) || 
        l.listing?.title.toLowerCase().includes(search) ||
        l.id.toLowerCase().includes(search)
      );
    });
  }, [leads, searchQuery]);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin mx-auto mb-4" />
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Sincronizando Funil Executivo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Header Section */}
      <div className={styles.pageHeader} style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Leads & Negociações</h1>
          <p>Pipeline estratégico de originação e fechamento de ativos.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>
                <Search size={14} />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrar funnel..." 
                style={{ 
                  height: '44px', 
                  width: '240px', 
                  paddingLeft: '36px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px'
                }} 
              />
           </div>
           <button className={styles.btnGhost} style={{ height: '44px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} />
              <span>Exportar</span>
           </button>
        </div>
      </div>

      <LeadsHeader stats={stats} />

      {/* Main Board Area */}
      <LeadsPipeline 
        leads={filteredLeads} 
        onViewLead={setSelectedLead}
        onChatLead={setActiveChatLead}
        onStatusChange={updateLeadStatus}
      />

      {/* Side Drawer */}
      {selectedLead && (
        <LeadDetailDrawer 
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onChat={(l) => {
            setSelectedLead(null);
            setActiveChatLead(l);
          }}
          onStatusChange={async (id, status) => {
            await updateLeadStatus(id, status);
          }}
          onUpdateNotes={updateLeadNotes}
          onRefresh={refresh}
        />
      )}

      {/* Contextual Chat Overlay */}
      {activeChatLead && (
        <LeadChatOverlay 
          lead={activeChatLead}
          onClose={() => setActiveChatLead(null)}
        />
      )}

      {/* Global Scrollbar Customization */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
