import { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Calendar,
  Package,
  MapPin,
  Truck,
  User,
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

export function OrderManagement() {
  const { showToast } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('bi_token');

      if (!token) {
        showToast('Please login again', 'error');
        return;
      }

      const response = await fetch(
        `${API_URL}/orders/all`,
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
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'delivered'
      ? deliveredOrders
      : cancelledOrders;

  const updateStatus = async (
    orderId: string,
    status: Order['status']
  ) => {
    try {
      const token = localStorage.getItem('bi_token');

      if (!token) {
        showToast('Please login again', 'error');
        return;
      }

      const response = await fetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update order'
        );
      }

      showToast(
        `Order updated to ${status}`,
        'success'
      );

      await loadOrders();
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to update order status',
        'error'
      );
    }
  };

  const addTrackingNumber = async (
    orderId: string
  ) => {
    const trackingNumber = window.prompt(
      'Enter tracking number'
    );

    if (!trackingNumber?.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('bi_token');

      if (!token) {
        showToast('Please login again', 'error');
        return;
      }

      const response = await fetch(
        `${API_URL}/orders/${orderId}/tracking`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trackingNumber:
              trackingNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to add tracking number'
        );
      }

      showToast(
        'Tracking number added successfully',
        'success'
      );

      await loadOrders();
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to add tracking number',
        'error'
      );
    }
  };

  const renderActions = (order: Order) => {
    switch (order.status) {
      case 'PENDING':
        return (
          <button
            onClick={() =>
              updateStatus(
                order._id,
                'CONFIRMED'
              )
            }
            className="btn-primary text-sm"
          >
            Confirm Order
          </button>
        );

      case 'CONFIRMED':
        return (
          <button
            onClick={() =>
              updateStatus(
                order._id,
                'PROCESSING'
              )
            }
            className="btn-primary text-sm"
          >
            Start Processing
          </button>
        );

      case 'PROCESSING':
        return (
          <button
            onClick={() =>
              updateStatus(
                order._id,
                'SHIPPED'
              )
            }
            className="btn-primary text-sm"
          >
            Mark Shipped
          </button>
        );

      case 'SHIPPED':
        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                addTrackingNumber(order._id)
              }
              className="btn-secondary text-sm"
            >
              <Truck className="w-4 h-4" />
              Add Tracking
            </button>

            <button
              onClick={() =>
                updateStatus(
                  order._id,
                  'DELIVERED'
                )
              }
              className="btn-primary text-sm"
            >
              Mark Delivered
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="Order Management"
        subtitle="Manage product orders from doctors"
      />

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-500">
            Loading orders...
          </p>
        </Card>
      ) : (
        <Card className="p-5">
          <Tabs
            tabs={tabData}
            active={activeTab}
            onChange={setActiveTab}
          />

          <div className="pt-5">
            {currentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={`No ${activeTab} orders`}
                description={
                  activeTab === 'active'
                    ? 'New doctor orders will appear here.'
                    : `There are no ${activeTab} orders.`
                }
              />
            ) : (
              <div className="space-y-4">
                {currentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-5 rounded-xl border border-ink-100 hover:border-ink-200 transition-all"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
                      {/* Order information */}
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
                            <span className="text-xs text-ink-500">
                              Order #{order._id.slice(-8)}
                            </span>

                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(
                                order.createdAt
                              )}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <span className="text-sm text-ink-600">
                              Qty:{' '}
                              <strong>
                                {order.quantity}
                              </strong>
                            </span>

                            <span className="text-sm text-ink-600">
                              ₹
                              {order.unitPrice.toLocaleString(
                                'en-IN'
                              )}{' '}
                              / unit
                            </span>

                            <span className="text-sm font-semibold text-ink-900">
                              Total: ₹
                              {order.total.toLocaleString(
                                'en-IN'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and actions */}
                      <div className="flex flex-col items-start xl:items-end gap-3">
                        <StatusBadge
                          status={order.status}
                        />

                        {renderActions(order)}
                      </div>
                    </div>

                    {/* Doctor */}
                    {order.doctor && (
                      <div className="mt-4 pt-4 border-t border-ink-100">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-ink-400 mt-0.5" />

                          <div>
                            <p className="text-xs font-medium text-ink-700">
                              Doctor
                            </p>

                            <p className="text-sm text-ink-600">
                              {order.doctor.fullName}
                            </p>

                            {order.doctor.email && (
                              <p className="text-xs text-ink-500">
                                {order.doctor.email}
                              </p>
                            )}

                            {order.doctor.phone && (
                              <p className="text-xs text-ink-500">
                                {order.doctor.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivery */}
                    <div className="mt-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-ink-400 mt-0.5" />

                        <div>
                          <p className="text-xs font-medium text-ink-700">
                            Delivery
                          </p>

                          <p className="text-sm text-ink-600">
                            {
                              order.deliveryOrganization
                            }
                          </p>

                          <p className="text-xs text-ink-500">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-4 p-3 rounded-lg bg-ink-50">
                        <p className="text-xs font-medium text-ink-500 mb-1">
                          Doctor Notes
                        </p>

                        <p className="text-sm text-ink-600">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Tracking */}
                    {order.trackingNumber && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />

                          <span className="text-xs text-blue-700">
                            Tracking Number:
                          </span>

                          <span className="text-sm font-semibold text-blue-800">
                            {order.trackingNumber}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Representative */}
                    {order.representative && (
                      <div className="mt-3">
                        <p className="text-xs text-ink-500">
                          Assigned Representative:{' '}
                          <span className="font-medium text-ink-700">
                            {
                              order.representative
                                .fullName
                            }
                          </span>
                        </p>
                      </div>
                    )}
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