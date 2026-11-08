import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 border font-mono text-xs tracking-wider uppercase transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-[#0A0A0A] border-[#20D989] text-[#20D989] shadow-[0_0_15px_rgba(32,217,137,0.15)]'
                : toast.type === 'error'
                ? 'bg-[#0A0A0A] border-[#FF5555] text-[#FF5555] shadow-[0_0_15px_rgba(255,85,85,0.15)]'
                : toast.type === 'warning'
                ? 'bg-[#0A0A0A] border-amber-500 text-amber-400'
                : 'bg-[#0A0A0A] border-[#242424] text-[#F2F2F2]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#20D989]" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 shrink-0 text-[#FF5555]" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400]" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 text-[#20D989]" />}
            <span className="font-semibold leading-relaxed">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
