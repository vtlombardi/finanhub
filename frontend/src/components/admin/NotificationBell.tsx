'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Loader2, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationsService } from '@/services/notifications.service';
import { SystemNotification } from '@shared/contracts';

const POLL_INTERVAL_MS = 30_000;


export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markOne, markAll, refresh } = useNotifications(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Poll unread count ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleMarkOne = async (n: SystemNotification) => {
    if (!n.isRead) {
      await markOne(n.id);
    }
  };

  const [markingAllInProgress, setMarkingAllInProgress] = useState(false);
  const handleMarkAll = async () => {
    setMarkingAllInProgress(true);
    await markAll();
    setMarkingAllInProgress(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Notificações"
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
      >
        <Bell size={20} color={open ? '#3b82f6' : '#999'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 700,
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 12px)',
          right: 0,
          width: '340px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #1e293b',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
              Notificações {unreadCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  marginLeft: '6px',
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markingAllInProgress}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', color: '#3b82f6', background: 'none',
                  border: 'none', cursor: 'pointer', opacity: markingAllInProgress ? 0.5 : 1,
                }}
              >
                {markingAllInProgress
                  ? <Loader2 size={11} className="animate-spin" />
                  : <CheckCheck size={11} />
                }
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <Loader2 size={20} color="#3b82f6" className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
                Nenhuma notificação ainda.
              </div>
            ) : (
              notifications.slice(0, 8).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleMarkOne(n)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #1e293b',
                    background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.05)',
                    cursor: 'pointer',
                    border: 'none',
                    borderBottomColor: '#1e293b',
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Unread dot */}
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: n.isRead ? 'transparent' : '#3b82f6',
                    marginTop: '5px', flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '12px', fontWeight: n.isRead ? 400 : 600,
                      color: n.isRead ? '#94a3b8' : '#f1f5f9',
                      margin: 0, lineHeight: 1.4,
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      fontSize: '11px', color: '#64748b',
                      margin: '3px 0 0', lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {n.body}
                    </p>
                    <p style={{ fontSize: '10px', color: '#475569', margin: '4px 0 0' }}>
                      {new Date(n.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {n.isRead && <Check size={12} color="#334155" style={{ marginTop: '4px', flexShrink: 0 }} />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
            >
              Ver todas as notificações →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
