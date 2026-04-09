import { api } from './api.client';
import { ChatThread, ChatMessage, CreateThreadDto, SendMessageDto } from '@shared/contracts';

/**
 * Serviço de Mensageria/Chat.
 * Centraliza a comunicação com os endpoints de threads e mensagens.
 */
export class ChatService {
  /**
   * Lista todas as conversas em que o usuário participa.
   */
  static async listThreads(): Promise<ChatThread[]> {
    const response = await api.get('/chat/threads');
    return response.data;
  }

  /**
   * Obtém o histórico de mensagens de uma conversa específica.
   */
  static async getMessages(threadId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/threads/${threadId}/messages`);
    return response.data;
  }

  /**
   * Envia uma nova mensagem em uma conversa.
   */
  static async sendMessage(threadId: string, body: string): Promise<ChatMessage> {
    const dto: SendMessageDto = { body };
    const response = await api.post(`/chat/threads/${threadId}/messages`, dto);
    return response.data;
  }

  /**
   * Cria uma nova conversa (thread).
   */
  static async createThread(data: CreateThreadDto = {}): Promise<ChatThread> {
    const response = await api.post('/chat/threads', data);
    return response.data;
  }
}
