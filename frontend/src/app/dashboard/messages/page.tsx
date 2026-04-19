'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useChatThreads, useChatMessages } from '@/hooks/useChat';
import { ChatService } from '@/services/ChatService';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanGate } from '@/components/plans/PlanGate';
import { ChatThread } from '@shared/contracts';
import {
  Send,
  MessageSquare,
  User,
  Shield,
  Search,
  Plus,
  Loader2,
  X,
  Lock,
  CheckCheck,
  Zap,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import styles from '@/styles/Dashboard.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getThreadName(thread: ChatThread, myId: string): string {
  if (thread.listing?.title) return thread.listing.title;
  const other = thread.participants?.find((p) => p.userId !== myId);
  return other?.user?.fullName || 'Conversa Estratégica';
}

function getThreadSub(thread: ChatThread, myId: string): string {
  const other = thread.participants?.find((p) => p.userId !== myId);
  return other?.user?.email || 'Membro verificado';
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  useAuthGuard();
  const { user } = useAuth();
  const { hasTier } = useSubscription();
  const { show } = useNotificationStore();

  const { threads, loading: loadingThreads, refresh: refreshThreads } = useChatThreads();
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const { messages, loading: loadingMessages, sending, sendMessage } = useChatMessages(activeThread?.id);

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread || sending) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      refreshThreads();
    } catch (err: any) {
      show(err?.response?.data?.message || 'Erro ao enviar mensagem.', 'error');
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleCreateThread = async () => {
    setCreatingThread(true);
    try {
      const thread = await ChatService.createThread();
      await refreshThreads();
      setActiveThread(thread);
      setShowNewThread(false);
      show('Conversa iniciada com sucesso!', 'success');
    } catch (err: any) {
      show(err?.response?.data?.message || 'Erro ao criar conversa.', 'error');
    } finally {
      setCreatingThread(false);
    }
  };

  const filteredThreads = threads.filter(t => {
    if (!searchQuery) return true;
    const name = getThreadName(t, user?.id ?? '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const myId: string = user?.id ?? '';

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Secure Deal Room Chat
          </h1>
          <p>Comunicação criptografada e institucional para investidores e decisores.</p>
        </div>
        <button
          onClick={() => setShowNewThread(true)}
          className={styles.btnBrand}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', height: '48px' }}
        >
          <Plus size={18} /> Iniciar Negociação
        </button>
      </div>

      <div className={styles.card} style={{ padding: 0, height: 'calc(100vh - 280px)', display: 'flex', overflow: 'hidden', minHeight: '600px' }}>
        
        {/* Thread Sidebar: High-Density & Semantic */}
        <div style={{ width: '380px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome ou ativo..."
                className={styles.bConfig}
                style={{ width: '100%', height: '44px', paddingLeft: '40px', background: 'rgba(0,0,0,0.3)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingThreads ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 className="w-8 h-8 text-[#00b8b2] animate-spin mx-auto" />
                <p style={{ marginTop: '16px', fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Sincronizando Sessões...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                 <div style={{ background: 'rgba(255,255,255,0.02)', width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
                    <MessageSquare size={20} style={{ color: '#475569' }} />
                 </div>
                 <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Nenhuma negociação ativa.</p>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isActive = activeThread?.id === t.id;
                const lastMsg = t.messages?.[0];
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThread(t)}
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      padding: '20px 24px', 
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: isActive ? 'rgba(0,184,178,0.05)' : 'transparent',
                      transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                    className="hover:bg-white/[0.02] group"
                  >
                    {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#00b8b2', boxShadow: '2px 0 10px rgba(0,184,178,0.3)' }} />}
                    <div className="flex items-center gap-4">
                      <div style={{ width: '48px', height: '48px', background: isActive ? '#00b8b2' : 'rgba(255,255,0.03)', borderRadius: '14px', display: 'grid', placeItems: 'center', color: isActive ? '#fff' : '#475569', border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }} className="group-hover:border-[#00b8b2]/30">
                        <User size={22} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: isActive ? '#fff' : '#eef6ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getThreadName(t, myId)}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800 }}>{lastMsg ? timeLabel(lastMsg.createdAt) : ''}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: isActive ? '#00b8b2' : '#8fa6c3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, fontWeight: lastMsg?.senderId !== myId && !isActive ? 800 : 400 }}>
                          {lastMsg?.body || 'Inicie a conversa...'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Body: Advanced Fidelity */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
          {activeThread ? (
            <>
              {/* Institutional Header */}
              <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #00b8b2 0%, #007672 100%)', borderRadius: '12px', display: 'grid', placeItems: 'center', boxShadow: '0 4px 15px rgba(0,184,178,0.2)' }}>
                    <Lock size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>{getThreadName(activeThread, myId)}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00b8b2' }}></div>
                      <span style={{ fontSize: '11px', color: '#8fa6c3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessão Segura Ativa</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button className={styles.btnGhost} style={{ width: '40px', height: '40px', padding: 0, display: 'grid', placeItems: 'center' }}><Search size={16} /></button>
                   <button className={styles.btnGhost} style={{ width: '40px', height: '40px', padding: 0, display: 'grid', placeItems: 'center' }}><MoreVertical size={16} /></button>
                </div>
              </div>

              {/* Messages Feed */}
              <div 
                ref={scrollRef}
                style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                className="custom-scrollbar"
              >
                {loadingMessages && messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
                    <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin" />
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === myId;
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '65%', 
                          background: isMine ? 'rgba(0,184,178,0.1)' : 'rgba(255,255,255,0.03)', 
                          color: isMine ? '#fff' : '#eef6ff',
                          padding: '16px 20px',
                          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          fontSize: '14px',
                          position: 'relative',
                          border: isMine ? '1px solid rgba(0,184,178,0.3)' : '1px solid rgba(255,255,255,0.05)',
                          boxShadow: isMine ? '0 10px 30px rgba(0,0,0,0.2)' : 'none'
                        }}>
                          <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.body}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                             <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                               {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {isMine && <CheckCheck size={12} className="text-[#00b8b2] opacity-60" />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Input Area */}
              <div style={{ padding: '24px 32px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <PlanGate minTier="PROFESSIONAL" variant="lock">
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Comunique-se de forma segura e institucional..."
                        className={styles.bConfig}
                        style={{ 
                          width: '100%', 
                          background: 'rgba(255,255,255,0.02)', 
                          padding: '16px 20px', 
                          color: '#fff', 
                          fontSize: '14px',
                          resize: 'none',
                          height: Math.min(Math.max(56, newMessage.split('\n').length * 20), 120) + 'px'
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                          }
                        }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim() || sending}
                      className={styles.btnBrand}
                      style={{ width: '56px', height: '56px', padding: 0, display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    >
                      {sending ? <Loader2 size={20} className="animate-spin text-white" /> : <Send size={20} className="text-white" />}
                    </button>
                  </form>
                </PlanGate>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '60px', textAlign: 'center' }}>
              <div>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #00b8b2 0%, transparent 100%)', borderRadius: '32px', opacity: 0.1, transform: 'rotate(12deg)' }}></div>
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)' }}>
                      <Zap size={40} style={{ color: '#00b8b2', opacity: 0.5 }} />
                   </div>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>HAYIA Intelligence Connection</h3>
                <p style={{ fontSize: '14px', color: '#8fa6c3', maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
                   Selecione uma negociação ao lado para acessar o Deal Room seguro. Suas conversas são auditadas pela HAYIA para garantir conformidade e transparência estratégica.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal - Nova Conversa */}
      {showNewThread && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: '20px' }}>
          <div className={styles.card} style={{ maxWidth: '440px', width: '100%', padding: '40px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setShowNewThread(false)} style={{ position: 'absolute', right: '24px', top: '24px', color: '#64748b' }}>
              <X size={20} />
            </button>
            <div style={{ width: '56px', height: '56px', background: 'rgba(0,184,178,0.1)', borderRadius: '16px', display: 'grid', placeItems: 'center', color: '#00b8b2', marginBottom: '24px' }}>
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Iniciar Deal Room</h2>
            <p style={{ fontSize: '14px', color: '#8fa6c3', marginBottom: '32px', lineHeight: 1.6 }}>
               Inicie um canal de negociação direta com especialistas da FINANHUB para suporte em diligências ou intermediação de ativos.
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <button 
                onClick={handleCreateThread}
                disabled={creatingThread}
                className={styles.btnBrand}
                style={{ width: '100%', height: '52px' }}
              >
                {creatingThread ? 'Estabelecendo Conexão...' : 'Abrir Sessão Segura'}
              </button>
              <button onClick={() => setShowNewThread(false)} className={styles.btnGhost} style={{ width: '100%', height: '52px' }}>Cancelar Operação</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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
    </>
  );
}
