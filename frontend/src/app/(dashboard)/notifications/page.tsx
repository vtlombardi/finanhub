'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, MessageSquare, DollarSign, BarChart3, Shield } from 'lucide-react';
import { NotificationsService } from '@/features/notifications/notifications.service';

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  NEW_LEAD: { icon: BarChart3, color: 'text-blue-400' },
  NEW_PROPOSAL: { icon: DollarSign, color: 'text-emerald-400' },
  NEW_MESSAGE: { icon: MessageSquare, color: 'text-indigo-400' },
  LISTING_STATUS_CHANGE: { icon: Shield, color: 'text-amber-400' },
  MODERATION_ACTION: { icon: Shield, color: 'text-red-400' },
};

export default function NotificationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await NotificationsService.getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await NotificationsService.markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await NotificationsService.markAllAsRead();
    fetchNotifications();
  };

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">Carregando notificações...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <Bell size={24} className="text-amber-400" /> Notificações
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold h-6 min-w-[1.5rem] rounded-full flex items-center justify-center px-2">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Alertas sobre leads, propostas e mudanças de status.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
            <CheckCheck size={16} /> Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Bell size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Nenhuma notificação</h3>
          <p className="text-slate-500 text-sm mt-2">Quando houver atividade nos seus deals, você será alertado aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || { icon: Bell, color: 'text-slate-400' };
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                className={`glass-panel rounded-xl p-4 flex items-start gap-4 transition ${!n.isRead ? 'border-l-4 border-l-blue-500 bg-blue-500/5' : 'opacity-70'}`}
              >
                <div className={`h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-sm">{n.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{n.body}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(n.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition flex-shrink-0"
                    title="Marcar como lida"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
