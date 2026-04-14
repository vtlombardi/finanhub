'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Tag, CreditCard, MessageSquare, Bell, Shield, Settings } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, isOwner } = usePermissions();
  const showAdminSection = isAdmin || isOwner;

  const links = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/listings', label: 'Anúncios M&A', icon: List },
    { href: '/dashboard/leads', label: 'Leads & Propostas', icon: Tag },
    { href: '/dashboard/interesses', label: 'Meus Interesses', icon: MessageSquare },
    { href: '/dashboard/plan', label: 'Assinatura', icon: CreditCard },
  ];

  const adminLinks = [
    { href: '/dashboard/admin/leads', label: 'Central de Leads', icon: Shield },
    { href: '/dashboard/moderation', label: 'Moderação de Anúncios', icon: Shield },
    { href: '/dashboard/members', label: 'Membros & Equipe', icon: Bell },
  ];

  return (
    <aside className="w-64 h-screen max-w-xs border-r border-[#1e293b] glass-panel fixed flex flex-col z-10 transition-all">
      <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
          FINANHUB
        </h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
        {/* Main Section */}
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Operational Section */}
        {showAdminSection && (
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Operacional
            </h3>
            {adminLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 font-medium' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-[#1e293b]">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Settings size={18} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
