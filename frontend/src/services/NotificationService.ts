import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: any;
  createdAt: string;
}

export const NotificationService = {
  getHeaders() {
    const token = Cookies.get('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  async getNotifications(page = 1, limit = 20) {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { page, limit },
      headers: this.getHeaders(),
    });
    return response.data;
  },

  async getUnreadCount() {
    const response = await axios.get(`${API_URL}/notifications/unread`, {
      headers: this.getHeaders(),
    });
    return response.data.unread;
  },

  async markAsRead(id: string) {
    const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
      headers: this.getHeaders(),
    });
    return response.data;
  },

  async markAllAsRead() {
    const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
      headers: this.getHeaders(),
    });
    return response.data;
  },
};
