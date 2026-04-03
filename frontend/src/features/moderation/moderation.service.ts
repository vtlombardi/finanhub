import { api } from '@/services/api.client';

export class ModerationService {
  static async getQueue(status?: string) {
    const params = status ? { status } : {};
    const res = await api.get('/moderation/queue', { params });
    return res.data;
  }

  static async applyAction(listingId: string, action: string, reason?: string) {
    const res = await api.post(`/moderation/${listingId}/action`, { action, reason });
    return res.data;
  }

  static async getHistory(listingId: string) {
    const res = await api.get(`/moderation/${listingId}/history`);
    return res.data;
  }
}
