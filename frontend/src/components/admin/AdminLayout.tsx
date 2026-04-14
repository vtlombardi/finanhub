'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/features/auth/AuthProvider';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Itens do menu principal (ícones da esquerda)
  const mainMenuItems = [
    { id: 'dashboard', icon: 'fa-home', label: 'Painel', href: '/dashboard' },
    { id: 'content', icon: 'fa-file-text-o', label: 'Conteúdo', href: '/dashboard/listings' },
    { id: 'categories', icon: 'fa-tags', label: 'Categorias', href: '/dashboard/categories' },
    { id: 'leads', icon: 'fa-inbox', label: 'Leads', href: '/dashboard/leads' },
    { id: 'admin-leads', icon: 'fa-briefcase', label: 'Central de Leads', href: '/dashboard/admin/leads' },
    { id: 'messages', icon: 'fa-envelope-o', label: 'Mensagens', href: '/dashboard/messages' },
    { id: 'stats', icon: 'fa-bar-chart', label: 'Métricas', href: '/dashboard/stats' },
    { id: 'members', icon: 'fa-users', label: 'Membros', href: '/dashboard/members' },
    { id: 'dataroom', icon: 'fa-lock', label: 'Data Room', href: '/dashboard/dataroom' },
    { id: 'moderation', icon: 'fa-shield', label: 'Moderação', href: '/dashboard/moderation' },
    { id: 'plans', icon: 'fa-credit-card', label: 'Planos', href: '/dashboard/plans' },
    { id: 'profile', icon: 'fa-user-circle-o', label: 'Perfil', href: '/dashboard/profile' },
    { id: 'settings', icon: 'fa-sliders', label: 'Configurações', href: '/dashboard/settings' },
  ];

  // Itens do submenu
  const contentSubmenu = [
    { label: 'Anúncios', href: '/dashboard/listings' },
    { label: 'Importação', href: '/dashboard/import' },
    { label: 'Exportação', href: '/dashboard/export' },
  ];

  const adminSubmenu = [
    { label: 'Central de Leads', href: '/dashboard/admin/leads' },
    { label: 'Moderação', href: '/dashboard/moderation' },
    { label: 'Planos de Cobrança', href: '/dashboard/plans' },
  ];

  return (
    <div className="main-dashboard">
      {/* Estilos globais agora são carregados no root layout para performance */}

      {/* Main Sidebar */}
      <nav className="main-sidebar">
        {/* Barra fina de ícones */}
        <div className="sidebar-menu">
          {mainMenuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`sidebar-link ${pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ? 'is-actived' : ''}`}
              title={item.label}
            >
              <i className={`fa ${item.icon}`} style={{ fontSize: '20px', color: '#fff' }}></i>
            </Link>
          ))}
        </div>
        
        {/* Submenu expandido (Labels) */}
        <div className="sidebar-submenu">
          <div className="submenu-item" id="dashboard-content" style={{ display: 'block' }}>
            <div className="submenu-title">
              {pathname?.includes('/admin') || pathname === '/dashboard/plans' || pathname === '/dashboard/moderation' 
                ? 'Operação' 
                : 'Conteúdo'}
            </div>
            <div className="submenu-list">
              {(pathname?.includes('/admin') || pathname === '/dashboard/plans' || pathname === '/dashboard/moderation' 
                ? adminSubmenu 
                : contentSubmenu).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`submenu-link ${pathname === item.href ? 'is-active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="main-wrapper">
        {/* Header */}
        <div className="main-header first-steps">
          <div className="domain-toggle" id="navBrand">
            <div className="domain-selected">
              <Link href="/dashboard" className="domain-logo" title="FINANHUB">
                <Image 
                  src="https://finanhub.com.br/custom/domain_1/content_files/img_logo.png" 
                  alt="Logo" 
                  width={150}
                  height={30}
                  priority
                  style={{ height: '30px', width: 'auto' }} 
                />
              </Link>
            </div>
          </div>

          <div className="header-search">
             <div className="input-group">
                <span className="input-group-addon"><i className="fa fa-search"></i></span>
                <input type="text" className="form-control" placeholder="Procurando por algo? Clique aqui ou digite /" />
             </div>
          </div>

          <div className="header-actions">
             {/* Barra de progresso */}
             <div className="config-platform-progress">
                <button className="btn btn-primary btn-progress">
                   Configure sua plataforma!
                   <span className="progress-badge">2/5</span>
                </button>
             </div>

             <div className="action-icons" style={{ display: 'flex', gap: '15px', alignItems: 'center', margin: '0 20px' }}>
                <i className="fa fa-question-circle-o" style={{ fontSize: '20px', color: '#999' }}></i>
                <i className="fa fa-eye" style={{ fontSize: '20px', color: '#999' }}></i>
                <NotificationBell />
             </div>

             <div className="user-actions">
                <Link href="/dashboard/profile" className="user-account">
                  <span className="user-avatar" style={{ backgroundColor: '#12b3af', color: '#fff', borderRadius: '50%', padding: '8px', fontSize: '12px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.fullName 
                      ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </Link>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="main-content" style={{ padding: '0' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
