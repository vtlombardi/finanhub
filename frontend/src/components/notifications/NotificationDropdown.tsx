'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Notification } from '@/services/NotificationService';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationDropdown({ notifications, onMarkRead, onClose }: NotificationDropdownProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'LEAD_CREATED':
      case 'NEW_LEAD':
        return <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><TrendingUp size={16} /></div>;
      case 'LEAD_SCORE_HIGH':
        return <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Zap size={16} /></div>;
      case 'LEAD_STALLED':
        return <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400"><Clock size={16} /></div>;
      case 'DATAROOM_VIEWED':
      case 'DATAROOM_REQUESTED':
        return <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><FileText size={16} /></div>;
      case 'PROPOSAL_RECEIVED':
        return <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><CheckCircle2 size={16} /></div>;
      default:
        return <div className="p-2 rounded-xl bg-gray-500/10 text-gray-400"><Bell size={16} /></div>;
    }
  };

  const getActionLink = (notif: Notification) => {
    const { metadata } = notif;
    if (metadata?.leadId) return `/dashboard/leads?id=${metadata.leadId}`;
    if (metadata?.listingId) return `/dashboard/deals/${metadata.listingId}`;
    if (metadata?.requestId) return `/dashboard/dataroom/requests`;
    return '/dashboard/notifications';
  };

  return (
    <div className="absolute right-0 mt-3 w-96 bg-[#0c1425]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Feed de Inteligência</h3>
        <Link 
          href="/dashboard/notifications" 
          onClick={onClose}
          className="text-[10px] font-bold text-[#00b8b2] hover:text-white uppercase tracking-wider transition-colors"
        >
          Ver todas
        </Link>
      </div>

      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
              <Bell size={24} />
            </div>
            <p className="text-xs text-gray-500">Nenhuma notificação por enquanto</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href={getActionLink(notif)}
                onClick={() => {
                  onMarkRead(notif.id);
                  onClose();
                }}
                className={`flex gap-4 p-5 hover:bg-white/[0.03] transition-all border-b border-white/[0.02] last:border-0 relative group ${!notif.isRead ? 'bg-white/[0.01]' : ''}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-xs font-bold leading-tight ${!notif.isRead ? 'text-white' : 'text-gray-400'}`}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#00b8b2] shadow-[0_0_8px_rgba(0,184,178,0.5)]" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    {notif.body}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                    <span className="text-[9px] text-[#00b8b2] font-black uppercase tracking-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Ação <ChevronRight size={10} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[3px]">HAYIA Intelligence Engine</p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 184, 178, 0.3);
        }
      `}</style>
    </div>
  );
}
