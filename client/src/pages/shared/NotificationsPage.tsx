import { Bell, CheckCheck, Video, FlaskConical, ShoppingCart, Info } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, PageHeader, EmptyState } from '@/components/ui';
import { timeAgo, cn } from '@/lib/utils';

const typeIcons = {
  demo: Video,
  order: ShoppingCart,
  sample: FlaskConical,
  interaction: Info,
  system: Info,
};

const typeColors = {
  demo: 'bg-brand-50 text-brand-600',
  order: 'bg-amber-50 text-amber-600',
  sample: 'bg-teal-50 text-teal-600',
  interaction: 'bg-blue-50 text-blue-600',
  system: 'bg-ink-100 text-ink-500',
};

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, showToast } = useApp();

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.filter((n) => !n.read).length} unread notifications`}
        action={notifications.some((n) => !n.read) && (
          <button onClick={() => { markAllNotificationsRead(); showToast('All notifications marked as read'); }} className="btn-secondary">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      />

      <Card className="p-5">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! New notifications will appear here." />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = typeIcons[n.type] || Info;
              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer',
                    n.read ? 'border-ink-100 bg-white' : 'border-brand-100 bg-brand-50/30'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[n.type])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-ink-600 mt-0.5">{n.message}</p>
                    <p className="text-xs text-ink-400 mt-1">{timeAgo(n.date)}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                      className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
