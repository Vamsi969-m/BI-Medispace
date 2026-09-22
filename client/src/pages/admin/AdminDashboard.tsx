import { useEffect, useMemo, useState } from 'react';

import {
  Package,
  ShoppingBag,
  DollarSign,
  Video,
  FlaskConical,
  Stethoscope,
  Briefcase,
  Building2,
  ArrowRight,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';

import {
  StatCard,
  Card,
  StatusBadge,
  PageHeader,
  Rating,
} from '@/components/ui';

import {
  formatCurrency,
  formatDate,
  cn,
} from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/* =========================================================
   Types
   ========================================================= */

interface Product {
  _id: string;
  name: string;
  shortDescription?: string;
  description: string;
  image?: string;
  manufacturedIn?: string;
  purpose: string;
  uses: string[];
  category: string;
  price: number;
  rating: number;
  isActive: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'DOCTOR' | 'REPRESENTATIVE' | 'ADMIN';
  phone?: string;
  avatar?: string;
  specialization?: string;
  organizationId?: string | null;
  isActive?: boolean;
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
  updatedAt?: string;

  doctor?: User;
  representative?: User;
  product?: Product;
}

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

  doctor?: User;
  representative?: User;
  product?: Product;
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
  updatedAt?: string;

  doctor?: User;
  representative?: User;
  product?: Product;
}

/* =========================================================
   API Helper
   ========================================================= */

async function fetchJson(
  url: string,
  token: string
) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Request failed'
    );
  }

  return data;
}

/* =========================================================
   Admin Dashboard
   ========================================================= */

export function AdminDashboard() {
  const {
    navigate,
    showToast,
    token,
  } = useApp();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [demos, setDemos] =
    useState<Demo[]>([]);

  const [samples, setSamples] =
    useState<Sample[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     Load Dashboard
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!token) {
        if (!cancelled) {
          setLoading(false);
          showToast(
            'Please login again',
            'error'
          );
        }

        return;
      }

      try {
        setLoading(true);

        const [
          productsData,
          ordersData,
          demosData,
          samplesData,
        ] = await Promise.all([
          /*
           * Admin needs all products so that
           * pending/rejected products are also
           * represented in admin statistics.
           */
          fetchJson(
            `${API_URL}/products/all`,
            token
          ),

          fetchJson(
            `${API_URL}/orders/all`,
            token
          ),

          fetchJson(
            `${API_URL}/demos/all`,
            token
          ),

          fetchJson(
            `${API_URL}/samples/all`,
            token
          ),
        ]);

        if (cancelled) return;

        setProducts(
          Array.isArray(productsData.products)
            ? productsData.products
            : []
        );

        setOrders(
          Array.isArray(ordersData.orders)
            ? ordersData.orders
            : []
        );

        setDemos(
          Array.isArray(demosData.demos)
            ? demosData.demos
            : []
        );

        setSamples(
          Array.isArray(samplesData.samples)
            ? samplesData.samples
            : []
        );
      } catch (error: unknown) {
        if (cancelled) return;

        showToast(
          error instanceof Error
            ? error.message
            : 'Failed to load admin dashboard',
          'error'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token, showToast]);

  /* =======================================================
     Statistics
     ======================================================= */

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );
  }, [orders]);

  const totalOrders = orders.length;

  const totalDemos = demos.length;

  const totalSamples = samples.length;

  const completedDemos = demos.filter(
    (demo) =>
      demo.status === 'COMPLETED'
  ).length;

  const pendingSamples = samples.filter(
    (sample) =>
      sample.status === 'PENDING'
  ).length;

  const activeOrders = orders.filter(
    (order) =>
      order.status !== 'DELIVERED' &&
      order.status !== 'CANCELLED'
  ).length;

  const activeProducts = products.filter(
    (product) =>
      product.isActive &&
      product.approvalStatus !== 'REJECTED'
  ).length;

  const pendingProducts = products.filter(
    (product) =>
      product.approvalStatus === 'PENDING'
  ).length;

  /* =======================================================
     Unique Doctors
     ======================================================= */

  const doctors = useMemo(() => {
    const doctorMap = new Map<
      string,
      User
    >();

    orders.forEach((order) => {
      if (order.doctor?._id) {
        doctorMap.set(
          order.doctor._id,
          order.doctor
        );
      }
    });

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

    return Array.from(
      doctorMap.values()
    );
  }, [orders, demos, samples]);

  /* =======================================================
     Unique Representatives
     ======================================================= */

  const representatives = useMemo(() => {
    const representativeMap =
      new Map<string, User>();

    orders.forEach((order) => {
      if (order.representative?._id) {
        representativeMap.set(
          order.representative._id,
          order.representative
        );
      }
    });

    demos.forEach((demo) => {
      if (demo.representative?._id) {
        representativeMap.set(
          demo.representative._id,
          demo.representative
        );
      }
    });

    samples.forEach((sample) => {
      if (sample.representative?._id) {
        representativeMap.set(
          sample.representative._id,
          sample.representative
        );
      }
    });

    return Array.from(
      representativeMap.values()
    );
  }, [orders, demos, samples]);

  /* =======================================================
     Top Products
     ======================================================= */

  const topProducts = useMemo(() => {
    return [...products]
      .filter(
        (product) =>
          product.isActive &&
          product.approvalStatus !== 'REJECTED'
      )
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, 5);
  }, [products]);

  /* =======================================================
     Recent Orders
     ======================================================= */

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      )
      .slice(0, 5);
  }, [orders]);

  /* =======================================================
     Products By Category
     ======================================================= */

  const categoryData = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const category =
          product.category?.trim() ||
          'Other';

        acc[category] =
          (acc[category] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>
    );
  }, [products]);

  const maxCategoryCount = useMemo(() => {
    const values =
      Object.values(categoryData);

    return values.length > 0
      ? Math.max(...values)
      : 1;
  }, [categoryData]);

  /* =======================================================
     Representative Activity
     ======================================================= */

  const representativeActivity =
    useMemo(() => {
      return representatives.map(
        (representative) => {
          const representativeOrders =
            orders.filter(
              (order) =>
                order.representative?._id ===
                representative._id
            );

          const representativeDemos =
            demos.filter(
              (demo) =>
                demo.representative?._id ===
                representative._id
            );

          const representativeSamples =
            samples.filter(
              (sample) =>
                sample.representative?._id ===
                representative._id
            );

          return {
            ...representative,

            orderCount:
              representativeOrders.length,

            demoCount:
              representativeDemos.length,

            sampleCount:
              representativeSamples.length,
          };
        }
      );
    }, [
      representatives,
      orders,
      demos,
      samples,
    ]);

  /* =======================================================
     Engagement
     ======================================================= */

  const engagementData = [
    {
      label: 'Product Views',
      value: null as number | null,
      max: 1,
      color: 'bg-brand-500',
    },
    {
      label: 'Demo Bookings',
      value: totalDemos,
      max: Math.max(totalDemos, 1),
      color: 'bg-teal-500',
    },
    {
      label: 'Sample Requests',
      value: totalSamples,
      max: Math.max(totalSamples, 1),
      color: 'bg-amber-500',
    },
    {
      label: 'Orders Placed',
      value: totalOrders,
      max: Math.max(totalOrders, 1),
      color: 'bg-green-500',
    },
  ];

  /* =======================================================
     Loading State
     ======================================================= */

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Loading BI Pharmaceuticals platform data..."
        />

        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />

            <p className="text-sm text-ink-500">
              Loading dashboard...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  /* =======================================================
     Dashboard UI
     ======================================================= */

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="BI Pharmaceuticals platform overview and analytics"
      />

      {/* ===================================================
          Main Statistics
          =================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(
            totalRevenue
          )}
          trend="From recorded orders"
          trendUp
          color="green"
        />

        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={totalOrders}
          trend={`${activeOrders} active`}
          trendUp
          color="brand"
        />

        <StatCard
          icon={Video}
          label="Demo Sessions"
          value={totalDemos}
          trend={`${completedDemos} completed`}
          trendUp
          color="teal"
        />

        <StatCard
          icon={FlaskConical}
          label="Sample Requests"
          value={totalSamples}
          trend={`${pendingSamples} pending`}
          trendUp
          color="amber"
        />
      </div>

      {/* ===================================================
          Platform Counts
          =================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Package}
          label="Products"
          value={products.length}
          trend={`${activeProducts} active`}
          color="brand"
        />

        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={doctors.length}
          color="teal"
        />

        <StatCard
          icon={Briefcase}
          label="Representatives"
          value={representatives.length}
          color="amber"
        />

        <StatCard
          icon={Building2}
          label="Organizations"
          value="—"
          trend="Not connected yet"
          color="green"
        />
      </div>

      {/* ===================================================
          Product Approval Summary
          =================================================== */}

      {pendingProducts > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-800">
                Product approval required
              </p>

              <p className="text-xs text-ink-500 mt-1">
                {pendingProducts}{' '}
                product
                {pendingProducts === 1
                  ? ''
                  : 's'} waiting for admin approval.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  'product-management'
                )
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Review products
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      )}

      {/* ===================================================
          Engagement + Categories
          =================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Doctor Engagement */}

        <Card className="p-5">
          <h3 className="font-semibold text-ink-900 mb-4">
            Doctor Engagement
          </h3>

          <div className="space-y-4">
            {engagementData.map(
              (item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-ink-600">
                      {item.label}
                    </span>

                    <span className="text-sm font-semibold text-ink-900">
                      {item.value === null
                        ? 'Not tracked'
                        : item.value}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    {item.value !== null && (
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          item.color
                        )}
                        style={{
                          width: `${
                            item.max > 0
                              ? Math.min(
                                  (item.value /
                                    item.max) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <p className="text-xs text-ink-400 mt-4">
            Product views require a product
            analytics endpoint and are not stored
            in the current backend.
          </p>
        </Card>

        {/* Products By Category */}

        <Card className="p-5">
          <h3 className="font-semibold text-ink-900 mb-4">
            Products by Category
          </h3>

          {Object.keys(categoryData)
            .length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-6">
              No products available
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(
                categoryData
              ).map(
                ([category, count]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-ink-600">
                        {category}
                      </span>

                      <span className="text-sm font-semibold text-ink-900">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{
                          width: `${
                            (count /
                              maxCategoryCount) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ===================================================
          Products + Representative Activity
          =================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Popular Products */}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Popular Products
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate('products')
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-6">
                No active products available
              </p>
            ) : (
              topProducts.map(
                (product, index) => (
                  <button
                    type="button"
                    key={product._id}
                    onClick={() =>
                      navigate(
                        'product-details',
                        {
                          id: product._id,
                          productId:
                            product._id,
                        }
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-colors text-left"
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-ink-100 text-ink-500'
                      )}
                    >
                      {index + 1}
                    </span>

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-ink-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {product.name}
                      </p>

                      <p className="text-xs text-ink-500 truncate">
                        {product.category} •{' '}
                        {formatCurrency(
                          product.price
                        )}
                      </p>
                    </div>

                    <Rating
                      value={
                        product.rating || 0
                      }
                    />
                  </button>
                )
              )
            )}
          </div>
        </Card>

        {/* Representative Activity */}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Representative Activity
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate('reps')
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {representativeActivity.length ===
            0 ? (
              <p className="text-sm text-ink-400 text-center py-6">
                No representative activity
                recorded yet
              </p>
            ) : (
              representativeActivity.map(
                (representative) => (
                  <div
                    key={
                      representative._id
                    }
                    className="flex items-center gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors"
                  >
                    {representative.avatar ? (
                      <img
                        src={
                          representative.avatar
                        }
                        alt={
                          representative.fullName
                        }
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-brand-600" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {
                          representative.fullName
                        }
                      </p>

                      <p className="text-xs text-ink-500 truncate">
                        {representative.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs">
                      <div className="text-center">
                        <p className="font-bold text-ink-900">
                          {
                            representative.orderCount
                          }
                        </p>

                        <p className="text-ink-400">
                          Orders
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="font-bold text-ink-900">
                          {
                            representative.demoCount
                          }
                        </p>

                        <p className="text-ink-400">
                          Demos
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="font-bold text-ink-900">
                          {
                            representative.sampleCount
                          }
                        </p>

                        <p className="text-ink-400">
                          Samples
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </Card>
      </div>

      {/* ===================================================
          Recent Orders
          =================================================== */}

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink-900">
            Recent Orders
          </h3>

          <button
            type="button"
            onClick={() =>
              navigate(
                'order-management'
              )
            }
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-8">
            No orders recorded yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left text-xs font-semibold text-ink-400 uppercase py-2 px-2 whitespace-nowrap">
                    Order ID
                  </th>

                  <th className="text-left text-xs font-semibold text-ink-400 uppercase py-2 px-2 whitespace-nowrap">
                    Product
                  </th>

                  <th className="text-left text-xs font-semibold text-ink-400 uppercase py-2 px-2 whitespace-nowrap">
                    Doctor
                  </th>

                  <th className="text-left text-xs font-semibold text-ink-400 uppercase py-2 px-2 whitespace-nowrap">
                    Date
                  </th>

                  <th className="text-right text-xs font-semibold text-ink-400 uppercase py-2 px-2 whitespace-nowrap">
                    Total
                  </th>

                  <th className="text-left text-xs font-semibold text-ink-400 uppercase py-2 px-2 whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map(
                  (order) => (
                    <tr
                      key={order._id}
                      className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors"
                    >
                      <td className="py-3 px-2 text-sm font-medium text-ink-700 whitespace-nowrap">
                        #
                        {order._id.slice(
                          -6
                        )}
                      </td>

                      <td className="py-3 px-2 text-sm text-ink-600 whitespace-nowrap">
                        {order.product?.name ||
                          'Product'}
                      </td>

                      <td className="py-3 px-2 text-sm text-ink-600 whitespace-nowrap">
                        {order.doctor
                          ?.fullName ||
                          'Doctor'}
                      </td>

                      <td className="py-3 px-2 text-sm text-ink-500 whitespace-nowrap">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      <td className="py-3 px-2 text-sm font-semibold text-ink-800 text-right whitespace-nowrap">
                        {formatCurrency(
                          order.total
                        )}
                      </td>

                      <td className="py-3 px-2">
                        <StatusBadge
                          status={
                            order.status
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
