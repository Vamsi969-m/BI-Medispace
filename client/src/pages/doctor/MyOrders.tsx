import { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Calendar,
  Package,
  MapPin,
  Truck,
  RotateCcw,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';
import {
  Card,
  StatusBadge,
  PageHeader,
  Tabs,
  EmptyState,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

export function MyOrders() {
  const { navigate, showToast } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('bi_token');

      if (!token) {
        showToast('Please login again', 'error');
        return;
      }

      const response = await fetch(
        `${API_URL}/orders/my`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load orders'
        );
      }

      setOrders(data.orders || []);
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to load orders',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const activeOrders = orders.filter((order) =>
    [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
    ].includes(order.status)
  );

  const deliveredOrders = orders.filter(
    (order) => order.status === 'DELIVERED'
  );

  const cancelledOrders = orders.filter(
    (order) => order.status === 'CANCELLED'
  );

  const tabData = [
    {
      id: 'active',
      label: 'Active',
      count: activeOrders.length,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      count: deliveredOrders.length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: cancelledOrders.length,
    },
  ];

  const currentOrders =
    tab === 'active'
      ? activeOrders
      : tab === 'delivered'
      ? deliveredOrders
      : cancelledOrders;

  const handleReorder = (order: Order) => {
    if (!order.product?._id) {
      showToast(
        'Product information is unavailable',
        'error'
      );
      return;
    }

    navigate('order-product', {
      productId: order.product._id,
    });
  };

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle="Track your product orders and delivery status"
        action={
          <button
            onClick={() => navigate('products')}
            className="btn-primary"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </button>
        }
      />

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-500">
            Loading your orders...
          </p>
        </Card>
      ) : (
        <Card className="p-5">
          <Tabs
            tabs={tabData}
            active={tab}
            onChange={setTab}
          />

          <div className="pt-5">
            {currentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={`No ${tab} orders`}
                description={
                  tab === 'active'
                    ? 'Your active product orders will appear here.'
                    : `You don't have any ${tab} orders yet.`
                }
                action={
                  tab === 'active' ? (
                    <button
                      onClick={() =>
                        navigate('products')
                      }
                      className="btn-primary"
                    >
                      Browse Products
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {currentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-xl border border-ink-100 hover:border-ink-200 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Product information */}
                      <div className="flex items-start gap-4">
                        {order.product?.image ? (
                          <img
                            src={order.product.image}
                            alt={
                              order.product.name
                            }
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-brand-600" />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-ink-900">
                            {order.product?.name ||
                              'Product'}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              Qty: {order.quantity}
                            </span>

                            <span className="text-xs text-ink-500">
                              ₹
                              {order.unitPrice.toLocaleString(
                                'en-IN'
                              )}{' '}
                              / unit
                            </span>

                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(
                                order.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and total */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-ink-400">
                            Total
                          </p>

                          <p className="font-semibold text-ink-900">
                            ₹
                            {order.total.toLocaleString(
                              'en-IN'
                            )}
                          </p>
                        </div>

                        <StatusBadge
                          status={order.status}
                        />
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="mt-4 pt-4 border-t border-ink-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-ink-400 mt-0.5 flex-shrink-0" />

                        <div>
                          <p className="text-xs font-medium text-ink-700">
                            {order.deliveryOrganization}
                          </p>

                          <p className="text-xs text-ink-500 mt-0.5">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tracking */}
                    {order.trackingNumber && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                        <Truck className="w-4 h-4" />

                        <span>
                          Tracking Number:
                        </span>

                        <span className="font-semibold">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}

                    {/* Representative */}
                    {order.representative && (
                      <div className="mt-3">
                        <p className="text-xs text-ink-500">
                          Representative:{' '}
                          <span className="font-medium text-ink-700">
                            {
                              order.representative
                                .fullName
                            }
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {order.status ===
                        'DELIVERED' && (
                        <button
                          onClick={() =>
                            handleReorder(order)
                          }
                          className="btn-secondary text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reorder
                        </button>
                      )}

                      {order.status ===
                        'SHIPPED' &&
                        order.trackingNumber && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 px-3">
                            <Truck className="w-4 h-4" />
                            In transit
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}