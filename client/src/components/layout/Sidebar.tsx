import type { Role } from '@/types';

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FlaskConical,
  Video,
  Building2,
  Users,
  Bell,
  User,
  Settings,
  HeartPulse,
  Stethoscope,
  Briefcase,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useApp } from '@/store/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['doctor', 'rep', 'admin'],
  },

  // Products
  {
    id: 'product-management',
    label: 'Product Management',
    icon: Package,
    roles: ['rep', 'admin'],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    roles: ['doctor', 'rep', 'admin'],
  },

  // Orders
  {
    id: 'orders',
    label: 'My Orders',
    icon: ShoppingBag,
    roles: ['doctor'],
  },
  {
    id: 'order-management',
    label: 'Order Management',
    icon: ShoppingBag,
    roles: ['rep', 'admin'],
  },

  // Samples
  {
    id: 'samples',
    label: 'Samples',
    icon: FlaskConical,
    roles: ['doctor', 'rep', 'admin'],
  },

  // Demo Sessions
  {
    id: 'demos',
    label: 'Demo Sessions',
    icon: Video,
    roles: ['doctor', 'rep', 'admin'],
  },
  {
    id: 'demo-management',
    label: 'Demo Management',
    icon: Video,
    roles: ['rep', 'admin'],
  },

  // Organizations
  {
    id: 'organizations',
    label: 'Organizations',
    icon: Building2,
    roles: ['doctor', 'rep', 'admin'],
  },

  // Representative
  {
    id: 'interactions',
    label: 'Interactions',
    icon: Users,
    roles: ['rep'],
  },

  // Administration
  {
    id: 'reps',
    label: 'Representatives',
    icon: Briefcase,
    roles: ['admin'],
  },
  {
    id: 'doctors',
    label: 'Doctors',
    icon: Stethoscope,
    roles: ['admin'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ShieldCheck,
    roles: ['admin'],
  },

  // Common
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    roles: ['doctor', 'rep', 'admin'],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    roles: ['doctor', 'rep', 'admin'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['doctor', 'rep', 'admin'],
  },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const {
    role,
    page,
    navigate,
    logout,
  } = useApp();

  const items = navItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64',
          'bg-white border-r border-ink-200/60',
          'flex flex-col',
          'transition-transform duration-300',
          'lg:translate-x-0',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-ink-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>

          <div>
            <p className="text-lg font-bold text-ink-900 tracking-tight">
              BI
            </p>

            <p className="text-[10px] text-ink-500 font-medium -mt-0.5">
              Pharma Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-ink-400 uppercase tracking-wider">
            {role === 'doctor'
              ? 'Healthcare'
              : role === 'rep'
              ? 'Representative'
              : 'Administration'}
          </p>

          {items.map((item, idx) => {
            const Icon = item.icon;

            const isActive = page === item.id;

            const showDivider =
              (item.id === 'notifications' ||
                item.id === 'analytics') &&
              idx > 0;

            return (
              <div
                key={`${item.id}-${idx}`}
              >
                {/* Section divider */}
                {showDivider && (
                  <div className="my-2 border-t border-ink-100" />
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigate(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3',
                    'px-3 py-2.5 rounded-lg',
                    'text-sm font-medium',
                    'transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px]',
                      isActive
                        ? 'text-brand-600'
                        : 'text-ink-400'
                    )}
                  />

                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-ink-100 space-y-2">

          {/* System status */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-ink-50">
            <div className="w-2 h-2 rounded-full bg-green-500" />

            <p className="text-xs text-ink-500 font-medium">
              System Operational
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut className="w-[18px] h-[18px]" />

            <span>Logout</span>
          </button>

        </div>
      </aside>
    </>
  );
}