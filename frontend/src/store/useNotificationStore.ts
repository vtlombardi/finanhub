import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  message: string | null;
  type: NotificationType;
  isVisible: boolean;
  show: (message: string, type?: NotificationType) => void;
  hide: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: 'info',
  isVisible: false,
  show: (message, type = 'info') => {
    set({ message, type, isVisible: true });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      set({ isVisible: false });
    }, 5000);
  },
  hide: () => set({ isVisible: false }),
}));
