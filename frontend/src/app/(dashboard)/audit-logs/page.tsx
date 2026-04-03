'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api.client';
import { Shield, Clock, User, Activity, Search } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/audit-logs')
      .then(res => setLogs(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando auditoria...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logs de Auditoria</h1>
          <p className="text-slate-500 text-sm">Histórico completo de ações mutantes no tenant.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar logs..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Evento</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Entidade</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Usuário</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Data e Hora</th>
              <th className="px-6 py-4 font-semibold text-slate-700">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-md ${getActionColor(log.action)}`}>
                      <Activity className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-medium text-slate-800">{log.action}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs uppercase font-bold tracking-wider">
                    {log.entityType}
                  </span>
                  <span className="ml-2 text-xs truncate max-w-[100px] inline-block">{log.entityId}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-medium">{log.user?.fullName || 'Sistema'}</span>
                    <span className="text-xs text-slate-400">{log.user?.email || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs uppercase">
                  {log.metadata?.ip || '0.0.0.0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getActionColor(action: string) {
  if (action.startsWith('POST')) return 'bg-emerald-50 text-emerald-600';
  if (action.startsWith('PATCH') || action.startsWith('PUT')) return 'bg-amber-50 text-amber-600';
  if (action.startsWith('DELETE')) return 'bg-rose-50 text-rose-600';
  return 'bg-slate-50 text-slate-600';
}
