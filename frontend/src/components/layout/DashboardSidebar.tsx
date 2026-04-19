'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/Dashboard.module.css';

export function DashboardSidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: '◫' },
        { label: 'Oportunidades', href: '/dashboard/deals', icon: '◎' },
        { label: 'Leads', href: '/dashboard/leads', icon: '✦' },
        { label: 'Mensagens', href: '/dashboard/messages', icon: '⌁' },
        { label: 'Favoritos', href: '/dashboard/favorites', icon: '♡' },
      ],
    },
    {
      title: 'Gestão',
      items: [
        { label: 'Novo Anúncio', href: '/dashboard/listings/new', icon: '＋' },
        { label: 'Meus Anúncios', href: '/dashboard/listings', icon: '▣' },
        { label: 'Analytics', href: '/dashboard/stats', icon: '◔' },
        { label: 'Notificações', href: '/dashboard/notifications', icon: '⚑' },
        { label: 'Data Room', href: '/dashboard/dataroom', icon: '⇡' },
      ],
    },
    {
      title: 'Conta',
      items: [
        { label: 'Perfil', href: '/dashboard/profile', icon: '◉' },
        { label: 'Time & Permissão', href: '/dashboard/members', icon: '▤' },
        { label: 'Plano & Billing', href: '/dashboard/plans', icon: '⬢' },
      ],
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <span>FH</span>
        </div>
        <div className={styles.brandInfo}>
          <h1>FINANHUB</h1>
          <p>Painel do usuário • visual premium</p>
        </div>
      </div>

      {navGroups.map((group, idx) => (
        <div key={idx} className={styles.navGroup}>
          <div className={styles.navTitle}>{group.title}</div>
          <nav className={styles.nav}>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
              >
                <span className={styles.ico}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ))}

      <div className={styles.planCard}>
        <span className={styles.pill}>Plano Elite • Ativo</span>
        <h3>Desbloqueie o matching premium</h3>
        <p>
          Mais visibilidade, Data Room, respostas prioritárias e sugestões avançadas da HAYIA para seus anúncios.
        </p>
        <div className={styles.btnRow}>
          <Link href="/dashboard/plans" className={`${styles.btn} ${styles.btnBrand}`}>
            Fazer upgrade
          </Link>
          <Link href="/dashboard/plans" className={`${styles.btn} ${styles.btnGhost}`}>
            Ver benefícios
          </Link>
        </div>
      </div>
    </aside>
  );
}
