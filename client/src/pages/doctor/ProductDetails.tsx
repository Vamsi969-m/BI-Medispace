import { useState } from 'react';

import {
  ArrowLeft,
  Heart,
  Video,
  FlaskConical,
  ShoppingCart,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Info,
  Package,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';
import { Card, Rating, Badge } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';

export function ProductDetails() {
  const {
    products,
    pageParams,
    navigate,
    toggleFavorite,
    showToast,
    role,
  } = useApp();

  const product = products.find(
    (p) => p.id === pageParams.id
  );

  const [activeTab, setActiveTab] =
    useState('overview');

  if (!product) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 mx-auto text-ink-300 mb-4" />

        <p className="text-ink-500">
          Product not found.
        </p>

        <button
          type="button"
          onClick={() => navigate('products')}
          className="btn-primary mt-4"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  /*
   * Backend product data is mapped by AppContext.
   * Keep safe fallbacks because some older products
   * may not contain all optional fields.
   */
  const isFav = product.isFavorite === true;

  const uses =
    product.approvedUses ||
    [];

  const manufacturedIn =
    product.madeIn ||
    'Not specified';

  const description =
    product.shortDescription ||
    'No description available.';

  const isAvailable =
    product.availability !== 'Backorder';

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
    },
    {
      id: 'specifications',
      label: 'Specifications',
    },
    {
      id: 'documentation',
      label: 'Documentation',
    },
    {
      id: 'important',
      label: 'Important Info',
    },
  ];

  const handleFavorite = () => {
    toggleFavorite(product.id);

    showToast(
      isFav
        ? 'Removed from favorites'
        : 'Added to favorites'
    );
  };

  const handleBookDemo = () => {
    if (role !== 'doctor') {
      showToast(
        'Only doctors can book product demos'
      );
      return;
    }

    navigate('demo-booking', {
      productId: product.id,
    });
  };

  const handleRequestSample = () => {
    if (role !== 'doctor') {
      showToast(
        'Only doctors can request product samples'
      );
      return;
    }

    navigate('sample-request', {
      productId: product.id,
    });
  };

  const handleOrder = () => {
    if (role !== 'doctor') {
      showToast(
        'Only doctors can order products'
      );
      return;
    }

    navigate('order-product', {
      productId: product.id,
    });
  };

  return (
    <div>
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('products')}
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* Product Header */}
          <Card className="overflow-hidden">

            <div className="relative h-72 bg-ink-100">

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-ink-300" />
                </div>
              )}

              {/* Favorite */}
              <button
                type="button"
                onClick={handleFavorite}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-sm hover:shadow transition-all"
                aria-label={
                  isFav
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                <Heart
                  className={cn(
                    'w-5 h-5',
                    isFav
                      ? 'fill-red-500 text-red-500'
                      : 'text-ink-400'
                  )}
                />
              </button>

              {/* Category + Availability */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge className="bg-white/90 backdrop-blur text-ink-700">
                  {product.category}
                </Badge>

                <Badge
                  className={cn(
                    'bg-white/90 backdrop-blur',
                    isAvailable
                      ? 'text-green-700'
                      : 'text-red-700'
                  )}
                >
                  {isAvailable
                    ? 'Available'
                    : 'Unavailable'}
                </Badge>
              </div>
            </div>

            {/* Product Basic Info */}
            <div className="p-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h1 className="text-2xl font-bold text-ink-900">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-4 mt-2">

                    <Rating
                      value={product.rating || 0}
                    />

                    <span className="text-sm text-ink-400">
                      •
                    </span>

                    <span className="text-sm text-ink-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />

                      Made in {manufacturedIn}
                    </span>

                  </div>
                </div>

                <p className="text-3xl font-bold text-brand-700 whitespace-nowrap">
                  {formatCurrency(product.price)}
                </p>

              </div>

              <p className="text-sm text-ink-600 mt-3">
                {product.shortDescription ||
                  description}
              </p>

            </div>
          </Card>

          {/* Product Information */}
          <Card className="p-5">

            {/* Tabs */}
            <div className="flex gap-1 border-b border-ink-200 overflow-x-auto">

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',

                    activeTab === tab.id
                      ? 'tab-active'
                      : 'tab-inactive'
                  )}
                >
                  {tab.label}
                </button>
              ))}

            </div>

            <div className="pt-5">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5">

                  {/* Purpose */}
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-brand-600" />
                      Purpose
                    </h3>

                    <p className="text-sm text-ink-600 leading-6">
                      {product.purpose ||
                        'Purpose information is not available.'}
                    </p>
                  </div>

                  {/* Uses */}
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Uses
                    </h3>

                    {uses.length > 0 ? (
                      <ul className="space-y-1.5">
                        {uses.map(
                          (
                            use: string,
                            index: number
                          ) => (
                            <li
                              key={`${use}-${index}`}
                              className="flex items-start gap-2 text-sm text-ink-600"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />

                              <span>{use}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink-500">
                        No usage information available.
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600" />
                      Product Description
                    </h3>

                    <p className="text-sm text-ink-600 leading-6">
                      {description}
                    </p>
                  </div>

                </div>
              )}

              {/* SPECIFICATIONS */}
              {activeTab === 'specifications' && (
                <div className="space-y-3">

                  <div className="overflow-hidden rounded-lg border border-ink-100">

                    <table className="w-full">

                      <tbody>

                        <tr className="bg-white">
                          <td className="px-4 py-3 text-sm font-medium text-ink-700 w-1/3">
                            Product Name
                          </td>

                          <td className="px-4 py-3 text-sm text-ink-600">
                            {product.name}
                          </td>
                        </tr>

                        <tr className="bg-ink-50/50">
                          <td className="px-4 py-3 text-sm font-medium text-ink-700">
                            Category
                          </td>

                          <td className="px-4 py-3 text-sm text-ink-600">
                            {product.category}
                          </td>
                        </tr>

                        <tr className="bg-white">
                          <td className="px-4 py-3 text-sm font-medium text-ink-700">
                            Manufactured In
                          </td>

                          <td className="px-4 py-3 text-sm text-ink-600">
                            {manufacturedIn}
                          </td>
                        </tr>

                        <tr className="bg-ink-50/50">
                          <td className="px-4 py-3 text-sm font-medium text-ink-700">
                            Purpose
                          </td>

                          <td className="px-4 py-3 text-sm text-ink-600">
                            {product.purpose ||
                              'Not specified'}
                          </td>
                        </tr>

                        <tr className="bg-white">
                          <td className="px-4 py-3 text-sm font-medium text-ink-700">
                            Rating
                          </td>

                          <td className="px-4 py-3 text-sm text-ink-600">
                            {product.rating || 0} / 5
                          </td>
                        </tr>

                        <tr className="bg-ink-50/50">
                          <td className="px-4 py-3 text-sm font-medium text-ink-700">
                            Price
                          </td>

                          <td className="px-4 py-3 text-sm text-ink-600">
                            {formatCurrency(
                              product.price
                            )}
                          </td>
                        </tr>

                      </tbody>
                    </table>

                  </div>
                </div>
              )}

              {/* DOCUMENTATION */}
              {activeTab === 'documentation' && (
                <div className="space-y-4">

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-50 border border-brand-100">

                    <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0" />

                    <div>
                      <p className="text-sm font-semibold text-brand-900">
                        BI Product Information
                      </p>

                      <p className="text-xs text-brand-700 mt-1">
                        Product information is maintained
                        by BI administrators and should
                        be reviewed before use.
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg border border-ink-100">

                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        Product Information
                      </p>

                      <p className="text-xs text-ink-500">
                        BI approved product information
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* IMPORTANT INFO */}
              {activeTab === 'important' && (
                <div className="space-y-3">

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">

                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />

                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Important Information
                      </p>

                      <p className="text-xs text-amber-700 mt-1">
                        Review the approved product
                        information and applicable
                        safety guidance before use.
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start gap-2 text-sm text-ink-600 p-3 rounded-lg bg-ink-50">

                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />

                    <span>
                      Product information and approved
                      uses should be maintained by BI
                      administrators.
                    </span>

                  </div>

                </div>
              )}

            </div>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          <Card className="p-5 sticky top-20">

            <div className="text-center mb-4">

              <p className="text-3xl font-bold text-brand-700">
                {formatCurrency(product.price)}
              </p>

              <p className="text-xs text-ink-500 mt-1">
                per unit
              </p>

            </div>

            <div className="space-y-2.5">

              {/* Demo */}
              <button
                type="button"
                onClick={handleBookDemo}
                disabled={
                  role !== 'doctor' ||
                  !isAvailable
                }
                className="w-full btn bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video className="w-4 h-4" />
                Book Demo
              </button>

              {/* Sample */}
              <button
                type="button"
                onClick={handleRequestSample}
                disabled={
                  role !== 'doctor' ||
                  !isAvailable
                }
                className="w-full btn bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FlaskConical className="w-4 h-4" />
                Request Sample
              </button>

              {/* Order */}
              <button
                type="button"
                onClick={handleOrder}
                disabled={
                  role !== 'doctor' ||
                  !isAvailable
                }
                className="w-full btn bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Order Product
              </button>

            </div>

            {/* Product Meta */}
            <div className="mt-4 pt-4 border-t border-ink-100 space-y-2">

              <div className="flex items-center gap-2 text-xs text-ink-500">
                <ShieldCheck className="w-4 h-4 text-green-500" />

                BI-approved product content
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Package className="w-4 h-4 text-brand-500" />

                {isAvailable
                  ? 'Product available'
                  : 'Product unavailable'}
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-500">
                <MapPin className="w-4 h-4 text-ink-400" />

                Manufactured in {manufacturedIn}
              </div>

            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}