import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';
import { Card, PageHeader } from '@/components/ui';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  image?: string;
  purpose?: string;
  description?: string;
  price: number;
  isActive?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function OrderProduct() {
  const {
    navigate,
    pageParams,
    showToast,
    token,
    role,
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [deliveryOrganization, setDeliveryOrganization] =
    useState('');

  const [deliveryAddress, setDeliveryAddress] =
    useState('');

  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const productId = pageParams.productId;

  /*
   * Load product
   */
  const loadProduct = useCallback(async () => {
    if (!token) {
      setProduct(null);
      setLoading(false);
      showToast('Please login again', 'error');
      return;
    }

    if (role !== 'doctor') {
      setProduct(null);
      setLoading(false);
      showToast(
        'Only doctors can place product orders',
        'error'
      );
      return;
    }

    if (!productId) {
      setProduct(null);
      setLoading(false);
      showToast(
        'Product information is missing',
        'error'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/products/${productId}`,
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
          data.message || 'Failed to load product'
        );
      }

      if (!data.product) {
        throw new Error('Product information is unavailable');
      }

      setProduct(data.product);
    } catch (error: unknown) {
      setProduct(null);

      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to load product',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [token, role, productId, showToast]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  /*
   * Quantity
   */
  const increaseQuantity = () => {
    setQuantity((current) => {
      if (current >= 100) {
        showToast(
          'Maximum quantity is 100',
          'error'
        );
        return current;
      }

      return current + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  /*
   * Price calculations
   *
   * These are only for displaying the summary.
   * The backend calculates the final order price
   * from the database product price.
   */
  const safePrice = useMemo(() => {
    if (!product) return 0;

    const price = Number(product.price);

    return Number.isFinite(price) && price >= 0
      ? price
      : 0;
  }, [product]);

  const subtotal = safePrice * quantity;
  const total = subtotal;

  const formatPrice = (value: number) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return '₹0';
    }

    return `₹${amount.toLocaleString('en-IN')}`;
  };

  /*
   * Place order
   */
  const handlePlaceOrder = async () => {
    if (submitting) {
      return;
    }

    if (!token) {
      showToast('Please login again', 'error');
      return;
    }

    if (role !== 'doctor') {
      showToast(
        'Only doctors can place orders',
        'error'
      );
      return;
    }

    if (!product) {
      showToast('Product not found', 'error');
      return;
    }

    if (!product._id) {
      showToast(
        'Product information is invalid',
        'error'
      );
      return;
    }

    if (product.isActive === false) {
      showToast(
        'This product is currently unavailable',
        'error'
      );
      return;
    }

    if (
      product.approvalStatus &&
      product.approvalStatus !== 'APPROVED'
    ) {
      showToast(
        'This product is not currently available for ordering',
        'error'
      );
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      showToast(
        'Quantity must be at least 1',
        'error'
      );
      return;
    }

    if (quantity > 100) {
      showToast(
        'Maximum quantity is 100',
        'error'
      );
      return;
    }

    const organization =
      deliveryOrganization.trim();

    const address = deliveryAddress.trim();

    const orderNotes = notes.trim();

    if (!organization) {
      showToast(
        'Please enter the delivery organization',
        'error'
      );
      return;
    }

    if (organization.length > 200) {
      showToast(
        'Organization name is too long',
        'error'
      );
      return;
    }

    if (!address) {
      showToast(
        'Please enter the delivery address',
        'error'
      );
      return;
    }

    if (address.length > 500) {
      showToast(
        'Delivery address is too long',
        'error'
      );
      return;
    }

    if (orderNotes.length > 1000) {
      showToast(
        'Notes cannot exceed 1000 characters',
        'error'
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product: product._id,
            quantity,
            deliveryOrganization: organization,
            deliveryAddress: address,
            notes: orderNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to place order'
        );
      }

      setOrderPlaced(true);

      showToast(
        'Order placed successfully',
        'success'
      );
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to place order',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-ink-500">
          Loading product...
        </p>
      </Card>
    );
  }

  /*
   * Product not found
   */
  if (!product) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-10 h-10 mx-auto text-ink-300 mb-3" />

        <h2 className="font-semibold text-ink-900">
          Product not found
        </h2>

        <p className="text-sm text-ink-500 mt-1">
          The product you're trying to order is
          unavailable.
        </p>

        <button
          type="button"
          onClick={() => navigate('products')}
          className="btn-primary mt-5"
        >
          Back to Products
        </button>
      </Card>
    );
  }

  /*
   * Order success
   */
  if (orderPlaced) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('products')}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>

          <h2 className="text-xl font-semibold text-ink-900">
            Order Placed Successfully
          </h2>

          <p className="text-sm text-ink-500 mt-2">
            Your order for {product.name} has been
            submitted successfully.
          </p>

          <div className="mt-5 p-4 rounded-xl bg-ink-50 text-left">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-ink-500">
                Product
              </span>

              <span className="font-medium text-ink-800 text-right">
                {product.name}
              </span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-ink-500">
                Quantity
              </span>

              <span className="font-medium text-ink-800">
                {quantity}
              </span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-ink-500">
                Total
              </span>

              <span className="font-semibold text-ink-900">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-ink-500">
                Status
              </span>

              <span className="font-medium text-amber-600">
                PENDING
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              type="button"
              onClick={() => navigate('orders')}
              className="btn-primary"
            >
              View My Orders
            </button>

            <button
              type="button"
              onClick={() => navigate('products')}
              className="btn-secondary"
            >
              Continue Browsing
            </button>
          </div>
        </Card>
      </div>
    );
  }

  /*
   * Main order page
   */
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          navigate('product-details', {
            id: product._id,
          })
        }
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Product
      </button>

      <PageHeader
        title="Order Product"
        subtitle="Place an order with the current BI product price"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <div className="flex gap-4">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-9 h-9 text-brand-600" />
                </div>
              )}

              <div className="min-w-0">
                <h2 className="font-semibold text-lg text-ink-900">
                  {product.name}
                </h2>

                <p className="text-sm text-ink-500 mt-1">
                  {product.purpose ||
                    product.description ||
                    'BI Healthcare Product'}
                </p>

                <p className="text-lg font-bold text-brand-700 mt-3">
                  {formatPrice(safePrice)}

                  <span className="text-xs font-normal text-ink-400 ml-1">
                    / unit
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Quantity */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-4">
              Quantity
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || submitting}
                aria-label="Decrease quantity"
                className="w-10 h-10 rounded-lg border border-ink-200 flex items-center justify-center hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div
                className="w-16 h-10 rounded-lg border border-ink-200 flex items-center justify-center font-semibold"
                aria-label={`Quantity ${quantity}`}
              >
                {quantity}
              </div>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= 100 || submitting}
                aria-label="Increase quantity"
                className="w-10 h-10 rounded-lg border border-ink-200 flex items-center justify-center hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-400 mt-2">
              Maximum quantity: 100 units
            </p>
          </Card>

          {/* Delivery */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Delivery Details
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="delivery-organization"
                  className="label"
                >
                  Organization
                </label>

                <input
                  id="delivery-organization"
                  type="text"
                  value={deliveryOrganization}
                  onChange={(e) =>
                    setDeliveryOrganization(
                      e.target.value
                    )
                  }
                  maxLength={200}
                  placeholder="Hospital / Clinic / Organization"
                  className="input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="delivery-address"
                  className="label"
                >
                  Delivery Address
                </label>

                <textarea
                  id="delivery-address"
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(
                      e.target.value
                    )
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Enter complete delivery address"
                  className="input resize-none"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="order-notes"
                  className="label"
                >
                  Additional Notes
                </label>

                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  rows={3}
                  maxLength={1000}
                  placeholder="Any special delivery instructions..."
                  className="input resize-none"
                  disabled={submitting}
                />

                <p className="text-xs text-ink-400 mt-1 text-right">
                  {notes.length}/1000
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-5 sticky top-5">
            <h3 className="font-semibold text-ink-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">
                  Unit Price
                </span>

                <span className="font-medium">
                  {formatPrice(safePrice)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-ink-500">
                  Quantity
                </span>

                <span className="font-medium">
                  {quantity}
                </span>
              </div>

              <div className="border-t border-ink-100 pt-3 flex justify-between">
                <span className="text-ink-600">
                  Subtotal
                </span>

                <span className="font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="border-t border-ink-100 pt-3 flex justify-between">
                <span className="font-semibold text-ink-900">
                  Total
                </span>

                <span className="text-xl font-bold text-brand-700">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-brand-50">
              <p className="text-xs text-brand-700">
                The final order price is calculated
                by the BI backend using the product
                price stored in the database.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full btn-primary mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />

              {submitting
                ? 'Placing Order...'
                : 'Place Order'}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}