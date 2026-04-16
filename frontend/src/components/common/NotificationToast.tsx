'use client';

import { useNotificationStore } from '@/store/useNotificationStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const STYLES = {
  success: 'border-emerald-500/20 bg-emerald-500/5',
  error: 'border-red-500/20 bg-red-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
};

export default function NotificationToast() {
  const { message, type, isVisible, hide } = useNotificationStore();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) setShouldRender(true);
    else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={cn(
      "fixed top-6 right-6 z-[9999] transition-all duration-300 transform",
      isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-[-20px] opacity-0 scale-95"
    )}>
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[320px] max-w-[420px]",
        STYLES[type]
      )}>
        <div className="flex-shrink-0">
          {ICONS[type]}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">
            {message}
          </p>
        </div>

        <button 
          onClick={hide}
          className="p-1 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
