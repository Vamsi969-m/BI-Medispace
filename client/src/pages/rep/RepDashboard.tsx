import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Video,
  FlaskConical,
  ShoppingCart,
  Phone,
  MapPin,
  TrendingUp,
  ArrowRight,
  PackageCheck,
  ClipboardCheck,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';

import {
  StatCard,
  Card,
  StatusBadge,
  PageHeader,
} from '@/components/ui';

import {
  formatCurrency,
  formatDate,
  timeAgo,
} from '@/lib/utils';

import {
  getAllDemos,
  updateDemoStatus,
} from '@/services/demoService';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Demo {
  _id: string;

  demoType:
    | 'VIDEO'
    | 'PHONE'
    | 'FACE_TO_FACE';

  scheduledDate: string;

  status:
    | 'PENDING'
    | 'APPROVED'
    | 'DISPATCHED'
    | 'LIVE'
    | 'COMPLETED'
    | 'CANCELLED';

  notes?: string;

  doctor?: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };

  product?: {
    _id: string;
    name: string;
    image?: string;
    purpose?: string;
  };

  representative?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

interface Sample {
  _id: string;

  quantity: number;

  deliveryOrganization: string;
  deliveryAddress: string;

  notes?: string;

  status:
    | 'PENDING'
    | 'APPROVED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

  trackingNumber?: string;

  createdAt: string;

  doctor?: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };

  product?: {
    _id: string;
    name: string;
    image?: string;
  };

  representative?: {
    _id?: string;
    fullName?: string;
  };
}

interface Order {
  _id: string;

  quantity: number;
  unitPrice: number;
  subtotal: number;
  total: number;

  deliveryOrganization: string;
  deliveryAddress: string;

  notes?: string;

  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

  trackingNumber?: string;

  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;

  doctor?: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };

  product?: {
    _id: string;
    name: string;
    image?: string;
  };

  representative?: {
    _id?: string;
    fullName?: string;
  };
}

interface Activity {
  id: string;
  icon: 'Video' | 'FlaskConical' | 'ShoppingCart' | 'PackageCheck';
  description: string;
  date: string;
}

const iconMap: Record<
  Activity['icon'],
  React.ComponentType<{ className?: string }>
> = {
  Video,
  FlaskConical,
  ShoppingCart,
  PackageCheck,
};

export function RepDashboard() {
  const {
    navigate,
    showToast,
  } = useApp();

  const [demos, setDemos] = useState<Demo[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const token =
        localStorage.getItem('bi_token');

      if (!token) {
        showToast(
          'Please login again',
          'error'
        );
        return;
      }

      const [
        demosResponse,
        samplesResponse,
        ordersResponse,
      ] = await Promise.all([
        getAllDemos(token),

        fetch(`${API_URL}/samples/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                'Failed to load samples'
            );
          }

          return data;
        }),

        fetch(`${API_URL}/orders/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                'Failed to load orders'
            );
          }

          return data;
        }),
      ]);

      setDemos(
        demosResponse.demos || []
      );

      setSamples(
        samplesResponse.samples || []
      );

      setOrders(
        ordersResponse.orders || []
      );
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  /*
   * Demo statistics
   */

  const upcomingDemos = useMemo(() => {
    return demos
      .filter((demo) =>
        [
          'APPROVED',
          'DISPATCHED',
          'LIVE',
        ].includes(demo.status)
      )
      .sort(
        (a, b) =>
          new Date(
            a.scheduledDate
          ).getTime() -
          new Date(
            b.scheduledDate
          ).getTime()
      );
  }, [demos]);

  /*
   * Pending sample requests
   */

  const pendingSamples = useMemo(() => {
    return samples.filter((sample) =>
      [
        'PENDING',
        'APPROVED',
      ].includes(sample.status)
    );
  }, [samples]);

  /*
   * Active orders
   */

  const activeOrders = useMemo(() => {
    return orders.filter((order) =>
      [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
      ].includes(order.status)
    );
  }, [orders]);

  /*
   * Revenue
   */

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );
  }, [orders]);

  /*
   * Completed demos
   */

  const completedDemos = useMemo(() => {
    return demos.filter(
      (demo) =>
        demo.status === 'COMPLETED'
    ).length;
  }, [demos]);

  /*
   * Doctors appearing in real backend data.
   *
   * Assignment management will be implemented
   * separately.
   */

  const doctors = useMemo(() => {
    const doctorMap =
      new Map<
        string,
        {
          _id: string;
          fullName: string;
          email?: string;
          phone?: string;
        }
      >();

    demos.forEach((demo) => {
      if (demo.doctor?._id) {
        doctorMap.set(
          demo.doctor._id,
          demo.doctor
        );
      }
    });

    samples.forEach((sample) => {
      if (sample.doctor?._id) {
        doctorMap.set(
          sample.doctor._id,
          sample.doctor
        );
      }
    });

    orders.forEach((order) => {
      if (order.doctor?._id) {
        doctorMap.set(
          order.doctor._id,
          order.doctor
        );
      }
    });

    return Array.from(
      doctorMap.values()
    );
  }, [demos, samples, orders]);

  /*
   * Recent activities generated from
   * actual backend records.
   */

  const activities = useMemo(() => {
    const result: Activity[] = [];

    demos.forEach((demo) => {
      result.push({
        id: `demo-${demo._id}`,
        icon: 'Video',
        description: `Demo request for ${
          demo.product?.name || 'product'
        } from ${
          demo.doctor?.fullName || 'doctor'
        }`,
        date: demo.scheduledDate,
      });
    });

    samples.forEach((sample) => {
      result.push({
        id: `sample-${sample._id}`,
        icon: 'FlaskConical',
        description: `Sample request for ${
          sample.product?.name || 'product'
        } from ${
          sample.doctor?.fullName || 'doctor'
        }`,
        date: sample.createdAt,
      });
    });

    orders.forEach((order) => {
      result.push({
        id: `order-${order._id}`,
        icon: 'ShoppingCart',
        description: `Order placed for ${
          order.product?.name || 'product'
        } by ${
          order.doctor?.fullName || 'doctor'
        }`,
        date: order.createdAt,
      });
    });

    return result
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 6);
  }, [demos, samples, orders]);

  /*
   * Demo status update
   */

  const handleDemoAction = async (
    demoId: string,
    status: Demo['status']
  ) => {
    try {
      const token =
        localStorage.getItem('bi_token');

      if (!token) {
        showToast(
          'Please login again',
          'error'
        );
        return;
      }

      await updateDemoStatus(
        token,
        demoId,
        status
      );

      showToast(
        `Demo updated to ${status}`,
        'success'
      );

      await loadDashboardData();
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to update demo',
        'error'
      );
    }
  };

  /*
   * Demo type
   */

  const getDemoType = (
    type: Demo['demoType']
  ) => {
    switch (type) {
      case 'VIDEO':
        return 'Video Call';

      case 'PHONE':
        return 'Phone Call';

      case 'FACE_TO_FACE':
        return 'Face-to-Face';

      default:
        return 'Demo';
    }
  };

  /*
   * Loading state
   */

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Representative Dashboard"
          subtitle="Manage doctors, demos, samples and orders"
        />

        <Card className="p-8 text-center">
          <p className="text-sm text-ink-500">
            Loading dashboard...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Representative Dashboard"
        subtitle="Manage doctors, demos, samples and orders"
      />

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Doctors"
          value={doctors.length}
          color="brand"
        />

        <StatCard
          icon={Video}
          label="Upcoming Demos"
          value={upcomingDemos.length}
          trend={`${completedDemos} completed`}
          trendUp
          color="teal"
        />

        <StatCard
          icon={FlaskConical}
          label="Pending Samples"
          value={pendingSamples.length}
          color="amber"
        />

        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(
            totalRevenue
          )}
          trend={`${orders.length} orders`}
          trendUp
          color="green"
        />
      </div>

      {/* =========================
          DAILY ACTIVITIES + DEMOS
      ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Daily Activities */}

        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Recent Activities
            </h3>

            <button
              onClick={() =>
                navigate('interactions')
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {activities.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-6">
                No recent activities
              </p>
            ) : (
              activities.map((activity) => {
                const Icon =
                  iconMap[activity.icon];

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-3 border-b border-ink-50 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-ink-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-700">
                        {activity.description}
                      </p>

                      <p className="text-xs text-ink-400 mt-0.5">
                        {timeAgo(
                          activity.date
                        )}{' '}
                        •{' '}
                        {formatDate(
                          activity.date
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Upcoming Demos */}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Upcoming Demos
            </h3>

            <button
              onClick={() =>
                navigate('demo-management')
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {upcomingDemos.length === 0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">
                No upcoming demos
              </p>
            ) : (
              upcomingDemos
                .slice(0, 4)
                .map((demo) => {
                  const scheduledDate =
                    new Date(
                      demo.scheduledDate
                    );

                  return (
                    <div
                      key={demo._id}
                      className="p-3 rounded-lg bg-ink-50/50 hover:bg-ink-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-brand-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-800 truncate">
                            {demo.product?.name ||
                              'Product'}
                          </p>

                          <p className="text-xs text-ink-500">
                            {demo.doctor
                              ?.fullName ||
                              'Doctor'}
                          </p>

                          <p className="text-xs text-ink-500 mt-0.5">
                            {formatDate(
                              demo.scheduledDate
                            )}{' '}
                            •{' '}
                            {scheduledDate.toLocaleTimeString(
                              [],
                              {
                                hour: 'numeric',
                                minute: '2-digit',
                              }
                            )}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <StatusBadge
                              status={
                                demo.status
                              }
                            />

                            <span className="text-xs text-ink-400">
                              {getDemoType(
                                demo.demoType
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Demo actions */}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {demo.status ===
                          'PENDING' && (
                          <button
                            onClick={() =>
                              handleDemoAction(
                                demo._id,
                                'APPROVED'
                              )
                            }
                            className="btn-primary text-xs"
                          >
                            Approve
                          </button>
                        )}

                        {demo.status ===
                          'DISPATCHED' && (
                          <button
                            onClick={() =>
                              handleDemoAction(
                                demo._id,
                                'LIVE'
                              )
                            }
                            className="btn-primary text-xs"
                          >
                            Start Demo
                          </button>
                        )}

                        {demo.status === 'LIVE' && (
                          <button
                            onClick={() =>
                              handleDemoAction(
                                demo._id,
                                'COMPLETED'
                              )
                            }
                            className="btn-secondary text-xs"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </Card>
      </div>

      {/* =========================
          DOCTORS + PENDING TASKS
      ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Doctors */}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Doctors
            </h3>

            <button
              onClick={() =>
                navigate('interactions')
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Record Interaction
            </button>
          </div>

          <div className="space-y-2">
            {doctors.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-4">
                No doctors available
              </p>
            ) : (
              doctors
                .slice(0, 5)
                .map((doctor) => (
                  <div
                    key={doctor._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-brand-600" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-ink-800">
                          {doctor.fullName}
                        </p>

                        {doctor.email && (
                          <p className="text-xs text-ink-500">
                            {doctor.email}
                          </p>
                        )}

                        {doctor.phone && (
                          <p className="text-xs text-ink-500">
                            {doctor.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          navigate(
                            'interactions'
                          )
                        }
                        className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Record Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            'interactions'
                          )
                        }
                        className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Record Visit"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        {/* Pending Tasks */}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Pending Tasks
            </h3>
          </div>

          <div className="space-y-2">
            {/* Samples */}

            {pendingSamples
              .slice(0, 4)
              .map((sample) => (
                <div
                  key={sample._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-teal-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {sample.product?.name ||
                          'Product'}
                      </p>

                      <p className="text-xs text-ink-500">
                        Sample from{' '}
                        {sample.doctor
                          ?.fullName ||
                          'doctor'}
                        {' • '}
                        Qty:{' '}
                        {sample.quantity}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate('samples')
                    }
                    className="btn-secondary text-xs"
                  >
                    Review
                  </button>
                </div>
              ))}

            {/* Orders */}

            {orders
              .filter(
                (order) =>
                  order.status ===
                    'PENDING' ||
                  order.status ===
                    'CONFIRMED'
              )
              .slice(0, 4)
              .map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {order.product?.name ||
                          'Product'}
                      </p>

                      <p className="text-xs text-ink-500">
                        {order.doctor
                          ?.fullName ||
                          'Doctor'}
                        {' • '}
                        Qty:{' '}
                        {order.quantity}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        'order-management'
                      )
                    }
                    className="btn-secondary text-xs"
                  >
                    Review
                  </button>
                </div>
              ))}

            {pendingSamples.length === 0 &&
              orders.filter(
                (order) =>
                  order.status ===
                    'PENDING' ||
                  order.status ===
                    'CONFIRMED'
              ).length === 0 && (
                <div className="text-center py-6">
                  <ClipboardCheck className="w-8 h-8 mx-auto text-green-500 mb-2" />

                  <p className="text-sm text-ink-500">
                    No pending tasks
                  </p>
                </div>
              )}
          </div>
        </Card>
      </div>

      {/* =========================
          ACTIVE ORDERS
      ========================= */}

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-ink-900">
              Active Orders
            </h3>

            <p className="text-sm text-ink-500 mt-0.5">
              Orders currently being processed
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                'order-management'
              )
            }
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            Manage orders
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {activeOrders.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-5">
              No active orders
            </p>
          ) : (
            activeOrders
              .slice(0, 6)
              .map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-amber-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {order.product?.name ||
                          'Product'}
                      </p>

                      <p className="text-xs text-ink-500">
                        {order.doctor
                          ?.fullName ||
                          'Doctor'}
                        {' • '}
                        Qty:{' '}
                        {order.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-800">
                        {formatCurrency(
                          order.total
                        )}
                      </p>

                      <StatusBadge
                        status={
                          order.status
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <Card className="p-5">
        <h3 className="font-semibold text-ink-900 mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() =>
              navigate(
                'demo-management'
              )
            }
            className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-brand-200 hover:bg-brand-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Video className="w-5 h-5 text-brand-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-ink-800">
                Manage Demos
              </p>

              <p className="text-xs text-ink-500">
                Review demo requests
              </p>
            </div>
          </button>

          <button
            onClick={() =>
              navigate('samples')
            }
            className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-teal-200 hover:bg-teal-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-teal-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-ink-800">
                Manage Samples
              </p>

              <p className="text-xs text-ink-500">
                Process sample requests
              </p>
            </div>
          </button>

          <button
            onClick={() =>
              navigate(
                'order-management'
              )
            }
            className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-ink-800">
                Manage Orders
              </p>

              <p className="text-xs text-ink-500">
                Process doctor orders
              </p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}