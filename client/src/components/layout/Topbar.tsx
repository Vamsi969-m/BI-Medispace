import { useState } from 'react';

import {
  Search,
  Bell,
  Menu,
  Stethoscope,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCheck,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';

import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownDivider,
} from '@/components/Dropdown';

import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const {
    role,
    user,
    setRole,
    navigate,
    logout,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    markNotificationRead,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);

  // -----------------------------------------
  // USER INFORMATION
  // -----------------------------------------

  const getUserInfo = () => {
    if (!user) {
      return {
        name: 'User',
        specialization: '',
        email: '',
        avatar: '',
      };
    }

    return {
      name:
        user.fullName ||
        'User',

      specialization:
        user.specialization ||
        (role === 'doctor'
          ? 'Doctor / HCP'
          : role === 'rep'
          ? 'BI Representative'
          : 'System Administrator'),

      email: user.email || '',

      avatar:
        user.avatar ||
        '',
    };
  };

  const userInfo = getUserInfo();

  // -----------------------------------------
  // ROLE CONFIG
  // -----------------------------------------

  const roleConfig = {
    doctor: {
      icon: Stethoscope,
      label: 'Doctor / HCP',
    },

    rep: {
      icon: Briefcase,
      label: 'BI Representative',
    },

    admin: {
      icon: ShieldCheck,
      label: 'Administrator',
    },
  };

  const RoleIcon = roleConfig[role].icon;

  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate('products', {
      search: query,
    });

    setSearchQuery('');
  };

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

  const handleLogout = () => {
    setShowNotif(false);
    logout();
  };

  // -----------------------------------------
  // AVATAR
  // -----------------------------------------

  const renderAvatar = () => {
    if (userInfo.avatar) {
      return (
        <img
          src={userInfo.avatar}
          alt={userInfo.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-ink-100"
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center ring-2 ring-ink-100">
        <span className="text-sm font-semibold">
          {userInfo.name
            .charAt(0)
            .toUpperCase()}
        </span>
      </div>
    );
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-ink-200/60">
      <div className="flex items-center justify-between gap-4 px-4 lg:px-6 h-16">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="relative hidden sm:block"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search products, orders, demos..."
              className="w-64 lg:w-80 pl-9 pr-4 py-2 text-sm rounded-lg border border-ink-200 bg-ink-50/50 outline-none transition-all focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </form>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* -------------------------------- */}
          {/* ROLE DROPDOWN */}
          {/* -------------------------------- */}

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors cursor-pointer">
                <RoleIcon className="w-4 h-4 text-brand-600" />

                <span className="text-sm font-medium text-ink-700 hidden sm:inline">
                  {roleConfig[role].label}
                </span>

                <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
              </div>
            }
            align="right"
            width="w-52"
          >
            {(close) => (
              <>
                <DropdownLabel>
                  Switch Role
                </DropdownLabel>

                <DropdownItem
                  icon={Stethoscope}
                  onClick={() => {
                    setRole('doctor');
                    navigate('dashboard');
                    close();
                  }}
                >
                  Doctor / HCP
                </DropdownItem>

                <DropdownItem
                  icon={Briefcase}
                  onClick={() => {
                    setRole('rep');
                    navigate('dashboard');
                    close();
                  }}
                >
                  BI Representative
                </DropdownItem>

                <DropdownItem
                  icon={ShieldCheck}
                  onClick={() => {
                    setRole('admin');
                    navigate('dashboard');
                    close();
                  }}
                >
                  Administrator
                </DropdownItem>
              </>
            )}
          </Dropdown>

          {/* -------------------------------- */}
          {/* NOTIFICATIONS */}
          {/* -------------------------------- */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowNotif((previous) => !previous)
              }
              className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99
                    ? '99+'
                    : unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <>
                {/* Outside click */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() =>
                    setShowNotif(false)
                  }
                />

                {/* Notification panel */}
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-card-hover border border-ink-200/60 z-40 animate-slide-up">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">

                    <h3 className="font-semibold text-ink-900 text-sm">
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          markAllNotificationsRead()
                        }
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />

                        Mark all read
                      </button>
                    )}

                  </div>

                  {/* Notification list */}
                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-ink-500">
                        No notifications
                      </div>
                    ) : (
                      notifications
                        .slice(0, 6)
                        .map((notification) => (
                          <button
                            type="button"
                            key={notification.id}
                            onClick={() => {
                              markNotificationRead(
                                notification.id
                              );

                              setShowNotif(false);
                            }}
                            className={cn(
                              'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-ink-50 transition-colors border-b border-ink-50',
                              !notification.read &&
                                'bg-brand-50/30'
                            )}
                          >
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                notification.read
                                  ? 'bg-ink-200'
                                  : 'bg-brand-500'
                              )}
                            />

                            <div className="flex-1 min-w-0">

                              <p className="text-sm font-medium text-ink-800">
                                {notification.title}
                              </p>

                              <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>

                              <p className="text-[10px] text-ink-400 mt-1">
                                {timeAgo(
                                  notification.date
                                )}
                              </p>

                            </div>
                          </button>
                        ))
                    )}

                  </div>

                  {/* View all */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotif(false);
                      navigate('notifications');
                    }}
                    className="w-full py-2.5 text-center text-sm text-brand-600 hover:bg-ink-50 font-medium rounded-b-xl"
                  >
                    View all notifications
                  </button>

                </div>
              </>
            )}

          </div>

          {/* -------------------------------- */}
          {/* PROFILE DROPDOWN */}
          {/* -------------------------------- */}

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 cursor-pointer">

                {renderAvatar()}

                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-ink-800 leading-tight">
                    {userInfo.name}
                  </p>

                  <p className="text-xs text-ink-500 leading-tight">
                    {userInfo.specialization}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-ink-400 hidden md:block" />

              </div>
            }
            align="right"
          >
            {(close) => (
              <>
                {/* User information */}
                <div className="px-3.5 py-2.5">
                  <p className="text-sm font-semibold text-ink-900">
                    {userInfo.name}
                  </p>

                  <p className="text-xs text-ink-500">
                    {userInfo.email}
                  </p>
                </div>

                <DropdownDivider />

                {/* Profile */}
                <DropdownItem
                  icon={User}
                  onClick={() => {
                    navigate('profile');
                    close();
                  }}
                >
                  My Profile
                </DropdownItem>

                {/* Settings */}
                <DropdownItem
                  icon={Settings}
                  onClick={() => {
                    navigate('settings');
                    close();
                  }}
                >
                  Settings
                </DropdownItem>

                <DropdownDivider />

                {/* Logout */}
                <DropdownItem
                  icon={LogOut}
                  danger
                  onClick={() => {
                    close();
                    handleLogout();
                  }}
                >
                  Logout
                </DropdownItem>
              </>
            )}
          </Dropdown>

        </div>
      </div>
    </header>
  );
}