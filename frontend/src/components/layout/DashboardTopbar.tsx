'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import styles from '@/styles/Dashboard.module.css';
import { NotificationBell } from '../notifications/NotificationBell';

export function DashboardTopbar() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className={styles.topbar}>
      <div className={styles.search}>
        <span>⌕</span>
        <input placeholder="Buscar anúncios, leads, mensagens ou investidores..." />
      </div>

      <div className={styles.topActions}>
        <button 
          className={styles.iconBtn} 
          title="Sair"
          onClick={logout}
        >
          ⎋
        </button>
        <NotificationBell />
        <Link href="/dashboard/listings/new/edit" className={`${styles.btn} ${styles.btnBrand}`}>
          ＋ Novo anúncio
        </Link>
        
        <div className={styles.avatar}>
          <div className={styles.avatarCircle}>
            {user?.fullName ? getInitials(user.fullName) : 'VL'}
          </div>
          <div className={styles.avatarInfo}>
            <small>Conta verificada</small>
            <strong>{user?.fullName || 'Vitor Lombardi'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
