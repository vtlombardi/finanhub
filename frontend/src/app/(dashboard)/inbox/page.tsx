'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { ChatService } from '@/features/chat/chat.service';
import { useAuth } from '@/features/auth/AuthProvider';

export default function InboxPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    ChatService.getInbox().then(setThreads).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openThread = async (threadId: string) => {
    setActiveThread(threadId);
    const msgs = await ChatService.getMessages(threadId);
    setMessages(msgs);
    setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    try {
      const msg = await ChatService.sendMessage(activeThread, newMessage);
      setMessages([...messages, msg]);
      setNewMessage('');
      setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      alert('Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">Carregando conversas...</div>;

  // Thread view
  if (activeThread) {
    const thread = threads.find((t) => t.id === activeThread);
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 flex-shrink-0">
          <button onClick={() => setActiveThread(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="font-medium text-slate-200 text-sm">{thread?.listing?.title || 'Conversa'}</p>
            <p className="text-xs text-slate-500">
              {thread?.participants?.map((p: any) => p.user.fullName).join(', ')}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 py-12 text-sm">Nenhuma mensagem ainda. Inicie a conversa.</div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                  {!isMe && <p className="text-xs font-medium text-blue-400 mb-1">{msg.sender?.fullName}</p>}
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200/50' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/50 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 transition disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inbox list
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <MessageSquare size={24} className="text-blue-400" /> Mensagens
        </h1>
        <p className="text-slate-400 text-sm mt-1">Conversas privadas sobre deals M&A.</p>
      </div>

      {threads.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Nenhuma conversa</h3>
          <p className="text-slate-500 text-sm mt-2">Manifeste interesse em um deal para iniciar uma conversa.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => openThread(thread.id)}
              className="w-full glass-panel rounded-xl p-4 flex items-center gap-4 hover:bg-slate-800/40 transition text-left"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {(thread.listing?.title || 'D')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200 text-sm truncate">{thread.listing?.title || 'Deal'}</p>
                <p className="text-xs text-slate-500 truncate">
                  {thread.messages?.[0]?.sender?.fullName}: {thread.messages?.[0]?.body || 'Sem mensagens'}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 gap-1">
                {thread.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold h-5 min-w-[1.25rem] rounded-full flex items-center justify-center px-1.5">
                    {thread.unreadCount}
                  </span>
                )}
                <span className="text-xs text-slate-600">
                  {new Date(thread.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
