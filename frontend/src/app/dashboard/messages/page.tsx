'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useChatThreads, useChatMessages } from '@/hooks/useChat';
import { ChatService } from '@/services/ChatService';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanGate } from '@/components/plans/PlanGate';
import AdminLayout from '@/components/admin/AdminLayout';
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
  ChevronRight,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getThreadName(thread: ChatThread, myId: string): string {
  if (thread.listing?.title) return thread.listing.title;
  const other = thread.participants?.find((p) => p.userId !== myId);
  return other?.user?.fullName || 'Conversa';
}

function getThreadSub(thread: ChatThread, myId: string): string {
  const other = thread.participants?.find((p) => p.userId !== myId);
  return other?.user?.email || '';
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

  // Hooks de Chat
  const { threads, loading: loadingThreads, refresh: refreshThreads } = useChatThreads();
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const { messages, loading: loadingMessages, sending, sendMessage } = useChatMessages(activeThread?.id);

  // Estados locais UI
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ao receber mensagens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Envio ──────────────────────────────────────────────────────────────────

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread || sending) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      // Atualiza timestamp da thread localmente para subir na lista
      refreshThreads();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao enviar mensagem.';
      alert(msg);
    } finally {
      inputRef.current?.focus();
    }
  };

  // ── Nova conversa ──────────────────────────────────────────────────────────

  const handleCreateThread = async () => {
    setCreatingThread(true);
    try {
      const thread = await ChatService.createThread();
      await refreshThreads();
      setActiveThread(thread);
      setShowNewThread(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao criar conversa.');
    } finally {
      setCreatingThread(false);
    }
  };

  // ── Filtragem de threads ───────────────────────────────────────────────────

  const filteredThreads = threads.filter(t => {
    if (!searchQuery) return true;
    const name = getThreadName(t, user?.id ?? '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const myId: string = user?.id ?? '';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-64px)] bg-[#020617] text-slate-100 overflow-hidden">

        {/* ── Sidebar: lista de threads ── */}
        <aside className="w-72 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/30">

          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Mensagens
            </h2>
            <button
              onClick={() => setShowNewThread(true)}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Nova conversa"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-slate-800">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/50 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar conversa..."
                className="bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingThreads ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Carregando...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-slate-700" />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {searchQuery ? 'Nenhum resultado.' : 'Nenhuma conversa ainda.'}
                </p>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isActive = activeThread?.id === t.id;
                const lastMsg = t.messages?.[0]; // Backend deve trazer a última mensagem
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThread(t)}
                    className={`w-full text-left px-4 py-4 transition-all border-b border-slate-800/40 relative group ${
                      isActive ? 'bg-blue-600/10' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {getThreadName(t, myId)}
                          </span>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-600 shrink-0 font-medium">
                              {timeLabel(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate leading-snug">
                          {lastMsg?.body || getThreadSub(t, myId) || 'Inicie a conversa...'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Área de chat ── */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#020617]">
          {activeThread ? (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/10">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {getThreadName(activeThread, myId)}
                    </p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {getThreadSub(activeThread, myId)}
                    </p>
                  </div>
                </div>
                
                {/* Ações de Header (Opcional no futuro) */}
              </div>

              {/* Messages body */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth custom-scrollbar"
              >
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Sincronizando...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-700 text-sm gap-2">
                    <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-2">
                      <MessageSquare className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-medium opacity-50">Seja o primeiro a escrever.</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMine = m.senderId === myId;
                    const showAvatar = !isMine && (idx === 0 || messages[idx-1].senderId !== m.senderId);
                    
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {!isMine && (
                          <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 mr-3 mt-1 shrink-0 ${!showAvatar ? 'opacity-0' : ''}`}>
                            {m.sender?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div className="flex flex-col max-w-[75%]">
                          {!isMine && showAvatar && (
                            <span className="text-[10px] text-slate-500 font-bold ml-1 mb-1 uppercase tracking-tight">
                              {m.sender?.fullName}
                            </span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm shadow-xl transition-all ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/10'
                                : 'bg-slate-900/80 text-slate-200 rounded-tl-none border border-slate-800 shadow-black/20'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                            <div className={`text-[10px] mt-2 block opacity-40 font-medium ${isMine ? 'text-right' : 'text-left'}`}>
                              {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area com Gating */}
              <div className="px-6 py-5 border-t border-slate-800 bg-slate-950/40 backdrop-blur-xl shrink-0">
                <PlanGate 
                  minTier="PROFESSIONAL"
                  variant="lock"
                  title="Interação Premium"
                  description="Como usuário Basic, você pode apenas receber mensagens de investidores. Faça upgrade para responder e negociar ativamente."
                >
                  <form onSubmit={handleSend} className="flex gap-3 items-end max-w-5xl mx-auto">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef as any}
                        rows={1}
                        value={newMessage}
                        onChange={e => {
                          setNewMessage(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={e => { 
                          if (e.key === 'Enter' && !e.shiftKey) { 
                            e.preventDefault(); 
                            handleSend(e); 
                          } 
                        }}
                        placeholder="Escreva sua mensagem..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 resize-none overflow-hidden"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed w-12 h-12 rounded-xl transition-all shrink-0 flex items-center justify-center shadow-lg shadow-blue-600/20"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                    </button>
                  </form>
                </PlanGate>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-10 bg-[#020617]">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />
                <div className="relative w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl">
                  <MessageSquare className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <div className="max-w-sm">
                <h3 className="text-xl font-bold text-white mb-2 italic tracking-tight font-serif uppercase tracking-widest">Finanhub Secure Chat</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Selecione uma conversa ao lado para visualizar o histórico de negociações ou inicie um suporte direto.
                </p>
                
                <button 
                  onClick={() => setShowNewThread(true)}
                  className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition-all mx-auto"
                >
                  <Plus className="w-4 h-4" /> Nova Conversa
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Modal: nova conversa ── */}
        {showNewThread && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Nova Conversa</h3>
                </div>
                <button onClick={() => setShowNewThread(false)} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl">
                <p className="text-xs text-slate-400 leading-loose">
                  Esta ação abrirá um canal direto e seguro com o **Administrador Master**. 
                  Ideal para suporte técnico, dúvidas sobre assinaturas ou intermediação estratégica de negócios.
                </p>
              </div>
              
              <div className="relative z-10 flex gap-4 pt-2">
                <button 
                  onClick={() => setShowNewThread(false)} 
                  className="flex-1 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCreateThread}
                  disabled={creatingThread}
                  className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {creatingThread ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Confirmar Abertura
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </AdminLayout>
  );
}
