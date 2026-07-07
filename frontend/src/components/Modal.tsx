'use client';

import { ReactNode, useEffect } from 'react';

export default function Modal({
  open,
  title,
  onClose,
  eyebrow = 'Ajouter',
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  eyebrow?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (open) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="w-full max-w-4xl rounded-[30px] border border-white/20 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.35)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-200">
            Fermer
          </button>
        </div>
        <div className="pt-6">{children}</div>
      </div>
    </div>
  );
}