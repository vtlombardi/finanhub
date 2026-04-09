'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Bell, CheckCheck, Loader2, Circle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { SystemNotification } from '@shared/contracts';



const LIMIT = 20;

const TYPE_COLORS: Record<string, string> = {
  LISTING_STATUS_CHANGE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  NEW_LEAD:              'bg-violet-500/15 text-violet-400 border-violet-500/30',
  NEW_PROPOSAL:          'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PROPOSAL_UPDATE:       'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  LISTING_STATUS_CHANGE: 'Status do anúncio',
  NEW_LEAD:              'Novo lead',
  NEW_PROPOSAL:          'Nova proposta',
  PROPOSAL_UPDATE:       'Proposta atualizada',
};

export default function NotificationsPage() {
  useAuthGuard();
  const [page, setPage] = useState(1);
  const { notifications, unreadCount, total, loading, markOne, markAll } = useNotifications(page);

  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkOne = async (n: SystemNotification) => {
    if (n.isRead) return;
    setMarkingId(n.id);
    await markOne(n.id);
    setMarkingId(null);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await markAll();
    setMarkingAll(false);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#020617] text-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" /> Notificações
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount > 0
                ? `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`
                : 'Tudo em dia.'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 px-4 py-2 rounded-xl border border-blue-500/30 hover:bg-blue-500/10 transition disabled:opacity-50"
            >
              {markingAll
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <CheckCheck className="w-3.5 h-3.5" />
              }
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {notifications.map(n => {
                const typeCls = TYPE_COLORS[n.type] ?? 'bg-slate-700 text-slate-400 border-slate-600';
                const typeLabel = TYPE_LABELS[n.type] ?? n.type;
                const isBusy = markingId === n.id;

                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                      n.isRead ? '' : 'bg-blue-500/[0.04]'
                    } hover:bg-slate-800/30`}
                  >
                    {/* Unread indicator */}
                    <div className="mt-1.5 shrink-0 w-5 flex justify-center">
                      {n.isRead
                        ? <span className="w-2 h-2 rounded-full bg-transparent" />
                        : <Circle className="w-2 h-2 text-blue-500 fill-blue-500" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeCls}`}>
                            {typeLabel}
                          </span>
                          <p className={`text-sm ${n.isRead ? 'text-slate-400 font-normal' : 'text-white font-semibold'}`}>
                            {n.title}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-600 shrink-0">
                          {new Date(n.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                    </div>

                    {/* Mark as read */}
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkOne(n)}
                        disabled={isBusy}
                        className="shrink-0 mt-1 p-1.5 text-slate-600 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
                        title="Marcar como lida"
                      >
                        {isBusy
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCheck className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CSS Helper for type colors (preserving visuals) */}
        <style jsx>{`
          .unread-bg { background-color: rgba(59, 130, 246, 0.04); }
        `}</style>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
            >
              Anterior
            </button>
            <span className="text-xs text-slate-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
            >
              Próxima
            </button>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
