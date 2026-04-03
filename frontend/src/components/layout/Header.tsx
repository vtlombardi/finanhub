'use client';
import { useAuth } from '@/features/auth/AuthProvider';
import { Bell, UserCircle, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth(); // Estado injetado JWT Context

  return (
    <header className="h-16 border-b border-[#1e293b] glass-panel flex items-center justify-between px-8 sticky top-0 z-10 w-full ml-0">
      <div className="flex-1">
        <h2 className="text-sm font-medium text-slate-400">
          Backoffice <span className="text-slate-600 mx-2">/</span> {user?.tenantId || 'Tenant Local'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-slate-700 mx-2"></div>

        <div className="flex items-center gap-3">
          <UserCircle size={24} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-200">
            {user?.email || 'Nenhum Usuário'}
          </span>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors ml-2" title="Sair da plataforma">
             <LogOut size={16}/>
          </button>
        </div>
      </div>
    </header>
  );
}
