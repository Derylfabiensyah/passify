import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const success = useCallback((msg, duration) => show(msg, 'success', duration), [show]);
  const error = useCallback((msg, duration) => show(msg, 'error', duration), [show]);
  const warning = useCallback((msg, duration) => show(msg, 'warning', duration), [show]);
  const info = useCallback((msg, duration) => show(msg, 'info', duration), [show]);

  const toast = {
    show,
    success,
    error,
    warning,
    info,
    dismiss
  };

  return (
    <ToastContext.Provider value={{ toast, showToast: show }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDismiss }) {
  const getStyles = () => {
    switch (item.type) {
      case 'success':
        return {
          bg: 'bg-gray-900 border-emerald-500/40 text-white',
          iconColor: 'text-emerald-400',
          icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: 'bg-gray-900 border-red-500/40 text-white',
          iconColor: 'text-red-400',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-gray-900 border-amber-500/40 text-white',
          iconColor: 'text-amber-400',
          icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: 'bg-gray-900 border-teal-500/40 text-white',
          iconColor: 'text-teal-400',
          icon: Info,
        };
    }
  };

  const { bg, iconColor, icon: IconComponent } = getStyles();

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${bg}`}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 text-xs font-semibold leading-relaxed">
        {item.message}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        show: (msg) => console.log(msg),
        success: (msg) => console.log(msg),
        error: (msg) => console.error(msg),
        warning: (msg) => console.warn(msg),
        info: (msg) => console.info(msg),
        dismiss: () => {}
      },
      showToast: (msg) => console.log(msg)
    };
  }
  return context;
}
