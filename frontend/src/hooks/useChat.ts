'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from '@/services/ChatService';
import { ChatThread, ChatMessage } from '@shared/contracts';

/**
 * Hook para gerenciar a lista de conversas (threads).
 */
export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    try {
      const data = await ChatService.listThreads();
      setThreads(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar threads:', err);
      setError('Falha ao carregar conversas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return { threads, setThreads, loading, error, refresh: loadThreads };
}

/**
 * Hook para gerenciar as mensagens de uma conversa ativa.
 * Inclui polling automático.
 */
export function useChatMessages(threadId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastFetchRef = useRef<number>(0);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!threadId) return;
    
    // Evita múltiplas chamadas simultâneas se já houver uma em andamento recentemente
    const now = Date.now();
    if (silent && now - lastFetchRef.current < 2000) return;
    
    if (!silent) setLoading(true);
    
    try {
      const data = await ChatService.getMessages(threadId);
      setMessages(data);
      lastFetchRef.current = Date.now();
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      if (!silent) setError('Erro ao carregar histórico.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [threadId]);

  // Polling
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 5000);
    
    return () => clearInterval(interval);
  }, [threadId, fetchMessages]);

  const sendMessage = async (body: string) => {
    if (!threadId || !body.trim() || sending) return;

    setSending(true);
    try {
      const newMessage = await ChatService.sendMessage(threadId, body.trim());
      setMessages(prev => [...prev, newMessage]);
      setError(null);
      return newMessage;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao enviar mensagem.';
      setError(msg);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, error, sendMessage, refresh: fetchMessages };
}
