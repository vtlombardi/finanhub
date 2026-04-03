import { api } from '@/services/api.client';

export class ChatService {
  static async getOrCreateThread(listingId: string) {
    const res = await api.post('/chat/threads', { listingId });
    return res.data;
  }

  static async sendMessage(threadId: string, body: string) {
    const res = await api.post(`/chat/threads/${threadId}/messages`, { body });
    return res.data;
  }

  static async getMessages(threadId: string) {
    const res = await api.get(`/chat/threads/${threadId}/messages`);
    return res.data;
  }

  static async getInbox() {
    const res = await api.get('/chat/inbox');
    return res.data;
  }

  static async getUnreadCount() {
    const res = await api.get('/chat/unread');
    return res.data;
  }
}

