'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Loader2, Lock, Shield, 
  DollarSign, Zap, User, ExternalLink,
  CheckCheck
} from 'lucide-react';
import { useChatMessages } from '@/hooks/useChat';
import { ChatService } from '@/services/ChatService';
import styles from '@/styles/Dashboard.module.css';

interface LeadChatOverlayProps {
  lead: any;
  onClose: () => void;
}

export function LeadChatOverlay({ lead, onClose }: LeadChatOverlayProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(true);
  const { messages, loading: loadingMessages, sending, sendMessage } = useChatMessages(threadId || undefined);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      try {
        // Find or create thread for this lead
        const thread = await ChatService.createThread({ 
          leadId: lead.id,
          listingId: lead.listingId 
        });
        setThreadId(thread.id);
      } catch (err) {
        console.error('Error initializing chat:', err);
      } finally {
        setLoadingThread(false);
      }
    }
    initChat();
  }, [lead.id, lead.listingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadId || sending) return;
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!lead) return null;

  const score = lead.score ?? 0;
  const potentialValue = lead.listing?.price || 0;
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0
  }).format(potentialValue);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: '80px', 
        right: '20px', 
        bottom: '20px', 
        width: '420px', 
        background: '#0a0f1d', 
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Contextual Header */}
      <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,184,178,0.1)', display: 'grid', placeItems: 'center', color: '#00b8b2' }}>
                 <Lock size={18} />
              </div>
              <div>
                 <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Deal Room Seguro</div>
                 <div style={{ fontSize: '11px', color: '#00b8b2', fontWeight: 700, textTransform: 'uppercase' }}>Criptografia Ativa</div>
              </div>
           </div>
           <button onClick={onClose} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-white">
              <X size={20} />
           </button>
        </div>

        {/* Context Bar */}
        <div style={{ 
          padding: '12px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#eef6ff' }}>{lead.investor?.fullName}</div>
              <div style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: score > 70 ? 'rgba(16,185,129,0.1)' : 'rgba(251,146,60,0.1)', color: score > 70 ? '#10b981' : '#fb923c', fontWeight: 900 }}>
                 IA {score}%
              </div>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                {lead.listing?.title}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#00b8b2' }}>{formattedValue}</div>
           </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
        className="custom-scrollbar"
      >
        {loadingThread || loadingMessages ? (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
            <Loader2 className="w-8 h-8 text-[#00b8b2] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '40px' }}>
             <div>
                <MessageSquare size={32} style={{ color: '#1e293b', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '13px', color: '#64748b' }}>Inicie a negociação com {lead.investor?.fullName.split(' ')[0]}.</p>
             </div>
          </div>
        ) : (
          messages.map((m: any) => {
            const isMine = m.senderId !== lead.investorId; // Simple logic for demo
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '85%', 
                  background: isMine ? 'rgba(0,184,178,0.1)' : 'rgba(255,255,255,0.03)', 
                  padding: '12px 16px', 
                  borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '13px',
                  color: '#fff',
                  border: isMine ? '1px solid rgba(0,184,178,0.2)' : '1px solid rgba(255,255,255,0.05)'
                }}>
                  {m.body}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '9px', color: '#475569' }}>
                    {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {isMine && <CheckCheck size={10} className="text-[#00b8b2]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            style={{ 
              flex: 1, 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '12px', 
              padding: '0 16px', 
              height: '44px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
            className="focus:border-[#00b8b2]/30"
          />
          <button 
            disabled={!newMessage.trim() || sending}
            className={styles.btnBrand}
            style={{ width: '44px', height: '44px', padding: 0, display: 'grid', placeItems: 'center', borderRadius: '12px' }}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
