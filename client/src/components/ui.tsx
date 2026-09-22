import {
  type ComponentType,
  type ReactNode,
} from 'react';

import {
  cn,
  statusColor,
} from '@/lib/utils';

/* =========================================================
   Badge
   ========================================================= */

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn('badge', className)}>
      {children}
    </span>
  );
}

/* =========================================================
   Status Badge
   ========================================================= */

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'font-medium',
        statusColor(status)
      )}
    >
      {status}
    </Badge>
  );
}

/* =========================================================
   Card
   ========================================================= */

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({
  children,
  className,
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}

/* =========================================================
   Stat Card
   ========================================================= */

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'brand' | 'teal' | 'amber' | 'green' | 'red';
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp = false,
  color = 'brand',
}: StatCardProps) {
  const colorMap: Record<
    NonNullable<StatCardProps['color']>,
    string
  > = {
    brand: 'bg-brand-50 text-brand-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-ink-500 font-medium">
            {label}
          </p>

          <p className="text-2xl font-bold text-ink-900 mt-1">
            {value}
          </p>

          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-2',
                trendUp
                  ? 'text-green-600'
                  : 'text-ink-500'
              )}
            >
              {trendUp ? '↑' : '→'} {trend}
            </p>
          )}
        </div>

        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
            colorMap[color]
          )}
        >
          <Icon
            className="w-5 h-5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   Empty State
   ========================================================= */

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
        <Icon
          className="w-8 h-8 text-ink-400"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-lg font-semibold text-ink-800">
        {title}
      </h3>

      <p className="text-sm text-ink-500 mt-1 max-w-sm">
        {description}
      </p>

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Tabs
   ========================================================= */

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: TabsProps) {
  return (
    <div
      className="flex gap-1 border-b border-ink-200 overflow-x-auto"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              isActive
                ? 'tab-active'
                : 'tab-inactive'
            )}
          >
            {tab.label}

            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-ink-100 text-ink-500'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   Rating
   ========================================================= */

interface RatingProps {
  value: number;
  count?: number;
}

export function Rating({
  value,
  count,
}: RatingProps) {
  const safeValue = Number.isFinite(value)
    ? Math.max(0, Math.min(5, value))
    : 0;

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${safeValue.toFixed(1)} out of 5`}
    >
      <span className="text-sm font-semibold text-amber-600">
        {safeValue.toFixed(1)}
      </span>

      <svg
        className="w-4 h-4 text-amber-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>

      {count !== undefined && (
        <span className="text-xs text-ink-400">
          ({count})
        </span>
      )}
    </div>
  );
}

/* =========================================================
   Spinner
   ========================================================= */

export function Spinner() {
  return (
    <div
      className="flex items-center justify-center py-12"
      role="status"
      aria-label="Loading"
    >
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />

      <span className="sr-only">
        Loading...
      </span>
    </div>
  );
}

/* =========================================================
   Page Header
   ========================================================= */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-ink-900">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-ink-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}