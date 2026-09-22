import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-56',
}: {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  width?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center">
        {trigger}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-40 mt-2 bg-white rounded-xl shadow-card-hover border border-ink-200/60 py-1.5 animate-slide-up',
              width,
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

export function DropdownItem({
  icon: Icon,
  children,
  onClick,
  danger,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors text-left',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-700 hover:bg-ink-50'
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className="px-3.5 py-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wide">{children}</div>;
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-ink-100" />;
}
