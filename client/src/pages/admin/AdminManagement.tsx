import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Search,
  Users,
  Stethoscope,
  Briefcase,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';

import {
  Card,
  StatCard,
  PageHeader,
} from '@/components/ui';

import { cn } from '@/lib/utils';

const API_URL = 'http://localhost:5000/api';

type ManagementType = 'doctors' | 'representatives';

interface BackendUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'DOCTOR' | 'REPRESENTATIVE' | 'ADMIN';
  phone?: string;
  specialization?: string;
  avatar?: string;
  organizationId?: string | null;
  isActive: boolean;
}

interface UsersResponse {
  doctors?: BackendUser[];
  representatives?: BackendUser[];
  message?: string;
}

interface UpdateUserResponse {
  user?: BackendUser;
  message?: string;
}

export function AdminManagement() {
  const {
    token,
    page,
    showToast,
  } = useApp();

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const type: ManagementType =
    page === 'doctors' ? 'doctors' : 'representatives';

  const title =
    type === 'doctors'
      ? 'Doctor Management'
      : 'Representative Management';

  const description =
    type === 'doctors'
      ? 'Manage registered doctors and their account status.'
      : 'Manage BI representatives and their account status.';

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      setError('Authentication token not found. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const endpoint =
        type === 'doctors'
          ? `${API_URL}/users/doctors`
          : `${API_URL}/users/representatives`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: UsersResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to fetch ${type}`
        );
      }

      const fetchedUsers =
        type === 'doctors'
          ? data.doctors || []
          : data.representatives || [];

      setUsers(fetchedUsers);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : `Failed to fetch ${type}`;

      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, type, showToast]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone || '').toLowerCase().includes(query) ||
        (user.specialization || '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [users, search]);

  const activeCount = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users]
  );

  const inactiveCount = users.length - activeCount;

  const updateStatus = async (
    userId: string,
    isActive: boolean
  ) => {
    if (!token) {
      showToast(
        'Authentication token not found. Please login again.',
        'error'
      );
      return;
    }

    try {
      setUpdatingId(userId);
      setError('');

      const response = await fetch(
        `${API_URL}/users/${userId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      const data: UpdateUserResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update user status'
        );
      }

      if (!data.user) {
        throw new Error(
          'User status was updated, but updated user data was not returned.'
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: data.user!.isActive,
              }
            : user
        )
      );

      showToast(
        isActive
          ? 'User account activated successfully'
          : 'User account deactivated successfully',
        'success'
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Failed to update user status';

      setError(message);
      showToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={description}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Total"
          value={users.length}
          color="brand"
        />

        <StatCard
          icon={UserCheck}
          label="Active"
          value={activeCount}
          color="green"
        />

        <StatCard
          icon={UserX}
          label="Inactive"
          value={inactiveCount}
          color="red"
        />
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={
              type === 'doctors'
                ? 'Search doctors by name, email, phone or specialization...'
                : 'Search representatives by name, email or phone...'
            }
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-ink-200 bg-ink-50/50 outline-none transition-all focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700">
          <XCircle className="w-5 h-5 flex-shrink-0" />

          <span className="flex-1">
            {error}
          </span>

          <button
            type="button"
            onClick={() => void fetchUsers()}
            className="px-3 py-1.5 rounded-lg border border-red-300 text-xs font-medium hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <Card className="min-h-[300px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-ink-500">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            Loading {type}...
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          {filteredUsers.length === 0 ? (
            <div className="min-h-[250px] flex flex-col items-center justify-center px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
                {type === 'doctors' ? (
                  <Stethoscope className="w-7 h-7 text-ink-400" />
                ) : (
                  <Briefcase className="w-7 h-7 text-ink-400" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-ink-800">
                No {type} found
              </h3>

              <p className="text-sm text-ink-500 mt-1 max-w-sm">
                {search
                  ? 'Try changing your search criteria.'
                  : `There are no registered ${type} yet.`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 bg-ink-50 border-b border-ink-100">
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  User
                </p>

                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  Contact
                </p>

                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  Specialization
                </p>

                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  Status
                </p>

                <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  Action
                </p>
              </div>

              {/* Users */}
              {filteredUsers.map((user) => {
                const isUpdating =
                  updatingId === user._id;

                return (
                  <div
                    key={user._id}
                    className="border-b border-ink-100 last:border-b-0 p-5 md:grid md:grid-cols-[2fr_2fr_1.5fr_1fr_1fr] md:items-center md:gap-4 md:px-6 hover:bg-ink-50/50 transition-colors"
                  >
                    {/* User */}
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold flex-shrink-0">
                          {user.fullName
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">
                          {user.fullName}
                        </p>

                        <p className="text-xs text-ink-500 mt-0.5">
                          {user.role === 'DOCTOR'
                            ? 'Doctor / HCP'
                            : 'BI Representative'}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-4 md:mt-0 min-w-0">
                      <p className="text-sm text-ink-700 truncate">
                        {user.email}
                      </p>

                      <p className="text-xs text-ink-500 mt-1">
                        {user.phone ||
                          'No phone number'}
                      </p>
                    </div>

                    {/* Specialization */}
                    <div className="mt-4 md:mt-0">
                      <p className="text-sm text-ink-600">
                        {user.specialization ||
                          'Not provided'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="mt-4 md:mt-0">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <div className="mt-4 md:mt-0">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          void updateStatus(
                            user._id,
                            !user.isActive
                          )
                        }
                        className={cn(
                          'inline-flex items-center justify-center gap-2',
                          'px-3 py-2 rounded-lg',
                          'text-xs font-medium',
                          'border transition-colors',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          user.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        )}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}

                        {isUpdating
                          ? 'Updating...'
                          : user.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Card>
      )}
    </div>
  );
}