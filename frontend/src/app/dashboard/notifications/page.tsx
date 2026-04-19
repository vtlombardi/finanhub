'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  TrendingUp, 
  Zap, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Search,
  Filter,
  CheckCheck,
  MoreVertical,
  ChevronRight,
  TrendingDown,
  LayoutGrid
} from 'lucide-react';
import { NotificationService, Notification } from '@/services/NotificationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD, LEADS, DATAROOM
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(1, 50);
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar tudo como lido:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'LEADS') return n.type.includes('LEAD') || n.type.includes('PROPOSAL');
    if (activeTab === 'DATAROOM') return n.type.includes('DATAROOM');
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'LEAD_CREATED':
      case 'NEW_LEAD':
        return <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><TrendingUp size={20} /></div>;
      case 'LEAD_SCORE_HIGH':
        return <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><Zap size={20} /></div>;
      case 'LEAD_STALLED':
        return <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform"><Clock size={20} /></div>;
      case 'DATAROOM_VIEWED':
      case 'DATAROOM_REQUESTED':
        return <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform"><FileText size={20} /></div>;
      case 'PROPOSAL_RECEIVED':
        return <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>;
      case 'PERFORMANCE_LOW':
        return <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform"><TrendingDown size={20} /></div>;
      default:
        return <div className="p-3 rounded-2xl bg-gray-500/10 text-gray-400 group-hover:scale-110 transition-transform"><Bell size={20} /></div>;
    }
  };

  const getActionLink = (notif: Notification) => {
    const { metadata } = notif;
    if (metadata?.leadId) return `/dashboard/leads?id=${metadata.leadId}`;
    if (metadata?.listingId) return `/dashboard/deals/${metadata.listingId}`;
    if (metadata?.requestId) return `/dashboard/dataroom/requests`;
    return '#';
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00b8b2]/10 border border-[#00b8b2]/20 rounded-xl text-[#00b8b2]">
              <Bell size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">HAYIA Intelligence Feed</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">
            Gestão proativa de leads, performance e insights estratégicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="h-12 px-6 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 disabled:opacity-30 border border-white/5"
          >
            <CheckCheck size={16} />
            Marcar tudo como lido
          </button>
        </div>
      </div>

      {/* Stats Quick KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notifications.length, icon: Bell, color: 'text-gray-400' },
          { label: 'Não Lidas', value: unreadCount, icon: Zap, color: 'text-[#00b8b2]' },
          { label: 'Criticas', value: notifications.filter(n => n.type.includes('STALLED') || n.type.includes('HIGH')).length, icon: AlertCircle, color: 'text-orange-400' },
          { label: 'Novos Leads', value: notifications.filter(n => n.type.includes('LEAD')).length, icon: TrendingUp, color: 'text-blue-400' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#020617] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{kpi.label}</p>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            </div>
            <kpi.icon className={kpi.color} size={20} />
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="bg-[#020617] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-2 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center gap-2">
          <div className="flex p-1 bg-black/40 rounded-2xl w-full md:w-auto">
            {['ALL', 'UNREAD', 'LEADS', 'DATAROOM'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-white/5 text-[#00b8b2] shadow-inner' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'Todas' : 
                 tab === 'UNREAD' ? 'Não Lidas' :
                 tab === 'LEADS' ? 'Leads' : 'Data Room'}
              </button>
            ))}
          </div>

          <div className="flex-1 relative w-full px-2">
            <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" />
            <input 
              placeholder="Filtrar por título, empresa ou oportunidade..." 
              className="w-full h-12 bg-transparent pl-12 pr-6 text-sm text-white placeholder-gray-600 outline-none"
            />
          </div>
        </div>

        {/* Feed List */}
        <div className="divide-y divide-white/[0.03]">
          {loading ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#00b8b2]/20 border-t-[#00b8b2] rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 text-sm font-medium">Sincronizando inteligência...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-32 text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-gray-700">
                <Bell size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold text-lg">Tudo em ordem por aqui</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Não encontramos notificações para o filtro selecionado.</p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`group flex items-start gap-6 p-8 transition-all relative hover:bg-white/[0.02] ${!notif.isRead ? 'bg-white/[0.01]' : ''}`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00b8b2]" />
                )}

                <div className="flex-shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-base font-bold ${!notif.isRead ? 'text-white' : 'text-gray-400'}`}>
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="px-2 py-0.5 bg-[#00b8b2]/10 text-[#00b8b2] text-[9px] font-black uppercase rounded-full">Nova</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {!notif.isRead && (
                        <button 
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-[#00b8b2] transition-all"
                          title="Marcar como lida"
                        >
                          <CheckCheck size={18} />
                        </button>
                      )}
                      <button className="p-2 text-gray-700 hover:text-gray-400 transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                    {notif.body}
                  </p>

                  <div className="pt-4 flex items-center gap-6">
                    <Link 
                      href={getActionLink(notif)}
                      onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                      className="h-10 px-6 bg-[#00b8b2] hover:bg-[#009e98] text-white text-[10px] font-black uppercase tracking-[2px] rounded-xl flex items-center gap-2 group/btn transition-all shadow-lg shadow-[#00b8b2]/10"
                    >
                      Acessar Contexto
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>

                    {notif.metadata?.listingTitle && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                        <LayoutGrid size={12} />
                        {notif.metadata.listingTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-12 border border-white/5 bg-white/[0.01] rounded-[32px] text-center space-y-4">
         <div className="w-12 h-1 bg-[#00b8b2]/20 mx-auto rounded-full" />
         <p className="text-[10px] text-gray-600 font-black uppercase tracking-[4px]">
           HAYIA PROACTIVE INTELLIGENCE · POWERED BY FINANHUB
         </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
