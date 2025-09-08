import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Toast { id: string; title: string; description?: string; type?: 'default' | 'success' | 'error'; }
interface ToastContextValue { push: (t: Omit<Toast, 'id'>) => void; }

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext); if (!ctx) throw new Error('useToast outside provider'); return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(()=> setToasts(prev => prev.filter(x=>x.id!==id)), 4500);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-[320px] max-w-[calc(100%-1rem)]">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={`rounded-xl border shadow-lg backdrop-blur bg-white/90 dark:bg-slate-900/90 px-4 py-3 text-sm flex flex-col gap-1 ${
                t.type==='success' ? 'border-emerald-500/30' : t.type==='error' ? 'border-rose-500/30' : 'border-slate-200 dark:border-slate-800'
              }`}
              role="status" aria-live="polite"
            >
              <span className="font-medium tracking-wide">{t.title}</span>
              {t.description && <span className="text-xs text-muted leading-relaxed">{t.description}</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
