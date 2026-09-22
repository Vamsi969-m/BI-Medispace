import {
  Heart,
  ShoppingCart,
  FlaskConical,
  Video,
} from 'lucide-react';

import type { Product } from '@/types';

import { useApp } from '@/store/AppContext';

import { Rating } from '@/components/ui';

import {
  formatCurrency,
  cn,
} from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    navigate,
    toggleFavorite,
    showToast,
  } = useApp();

  const productId = product.id;

  const isFav = product.isFavorite || false;

  const handleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    toggleFavorite(productId);

    showToast(
      isFav
        ? 'Removed from favorites'
        : 'Added to favorites'
    );
  };

  const handleOpenDetails = () => {
    navigate('product-details', {
      id: productId,
      productId,
    });
  };

  const handleBookDemo = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    navigate('demo-booking', {
      productId,
    });
  };

  const handleRequestSample = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    navigate('sample-request', {
      productId,
    });
  };

  const handleOrder = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    navigate('order-product', {
      productId,
    });
  };

  return (
    <div
      className="card card-hover overflow-hidden group cursor-pointer flex flex-col"
      onClick={handleOpenDetails}
    >
      {/* Product Image */}
      <div className="relative h-44 bg-ink-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-400">
            <FlaskConical className="w-12 h-12" />
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            isFav
              ? `Remove ${product.name} from favorites`
              : `Add ${product.name} to favorites`
          }
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:shadow transition-all"
        >
          <Heart
            className={cn(
              'w-4 h-4',
              isFav
                ? 'fill-red-500 text-red-500'
                : 'text-ink-400'
            )}
          />
        </button>

        {/* Category */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-ink-700">
          {product.category}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink-900 leading-tight line-clamp-2">
            {product.name}
          </h3>

          <Rating
            value={product.rating || 0}
            count={product.reviewCount || 0}
          />
        </div>

        {/* Short Description */}
        <p className="text-sm text-ink-500 mt-1.5 line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Product Information */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-medium text-green-600">
            Available
          </span>

          <span className="text-ink-300">
            •
          </span>

          <span className="text-xs text-ink-500">
            Made in {product.madeIn || 'N/A'}
          </span>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
          <p className="text-lg font-bold text-ink-900">
            {formatCurrency(product.price)}
          </p>

          <div className="flex items-center gap-1.5">
            {/* Book Demo */}
            <button
              type="button"
              onClick={handleBookDemo}
              className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
              title="Book Demo"
              aria-label={`Book demo for ${product.name}`}
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Request Sample */}
            <button
              type="button"
              onClick={handleRequestSample}
              className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
              title="Request Sample"
              aria-label={`Request sample of ${product.name}`}
            >
              <FlaskConical className="w-4 h-4" />
            </button>

            {/* Order Product */}
            <button
              type="button"
              onClick={handleOrder}
              className="p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
              title="Order Product"
              aria-label={`Order ${product.name}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
