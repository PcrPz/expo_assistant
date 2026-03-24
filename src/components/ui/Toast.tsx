'use client';
// src/components/ui/Toast.tsx

import { useEffect, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

// ── Global event bus ──────────────────────────────────────────
type Listener = (toast: ToastItem) => void;
const listeners: Listener[] = [];

export function emitToast(toast: ToastItem) {
  listeners.forEach(fn => fn(toast));
}

export function onToast(fn: Listener) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i > -1) listeners.splice(i, 1);
  };
}

// ── Config per type ───────────────────────────────────────────
const CONFIG: Record<ToastType, {
  borderColor: string;
  progressColor: string;
  iconColor: string;
  icon: string;
}> = {
  success: {
    borderColor: '#16A34A',
    progressColor: '#16A34A',
    iconColor: '#16A34A',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  },
  error: {
    borderColor: '#DC2626',
    progressColor: '#DC2626',
    iconColor: '#DC2626',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  },
  warning: {
    borderColor: '#FFBD0D',
    progressColor: '#FFBD0D',
    iconColor: '#B45309',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  },
  info: {
    borderColor: '#3674B5',
    progressColor: '#3674B5',
    iconColor: '#3674B5',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  },
};

const DURATION = 4000;

// ── Single Toast ──────────────────────────────────────────────
function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIG[item.type];

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(item.id), 300);
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderLeft: `3px solid ${cfg.borderColor}`,
        borderRadius: '2px 10px 10px 2px',
        padding: '13px 15px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        width: '350px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transform: visible ? 'translateX(0)' : 'translateX(320px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Icon */}
      <div
        style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }}
        dangerouslySetInnerHTML={{ __html: cfg.icon }}
      />

      {/* Body */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.3 }}>
          {item.title}
        </p>
        {item.description && (
          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
            {item.description}
          </p>
        )}
        {/* Progress bar */}
        <div style={{ height: 2, background: '#F0F0F0', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
          <div
            style={{
              height: 2,
              background: cfg.progressColor,
              borderRadius: 1,
              animation: `toast-shrink ${DURATION}ms linear forwards`,
            }}
          />
        </div>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        style={{
          width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#9CA3AF', cursor: 'pointer', flexShrink: 0,
          borderRadius: 4, border: 'none', background: 'none', padding: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Container ─────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    return onToast(toast => {
      setToasts(prev => {
        const next = [toast, ...prev].slice(0, 3); // max 3
        return next;
      });
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 72,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
          zIndex: 9999,
        }}
      >
        {toasts.map(t => (
          <ToastCard key={t.id} item={t} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
}