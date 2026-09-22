import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-brand-600',
};

export function ToastContainer() {
  const {
    toasts,
    dismissToast,
  } = useApp();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] w-[calc(100%-2rem)] max-w-sm flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const toastType = (
          toast.type in iconMap
            ? toast.type
            : 'info'
        ) as ToastType;

        const Icon = iconMap[toastType];

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-card-hover border border-ink-200/60 p-4 animate-slide-in-right"
          >
            {/* Toast Icon */}
            <Icon
              className={cn(
                'w-5 h-5 flex-shrink-0 mt-0.5',
                colorMap[toastType]
              )}
              aria-hidden="true"
            />

            {/* Message */}
            <p className="text-sm text-ink-700 flex-1 leading-relaxed">
              {toast.message}
            </p>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="flex-shrink-0 p-1 rounded-md text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
            >
              <X
                className="w-4 h-4"
                aria-hidden="true"
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}