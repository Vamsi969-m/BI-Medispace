import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Package,
  Heart,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';
import { ProductCard } from '@/components/ProductCard';
import {
  PageHeader,
  EmptyState,
  Card,
} from '@/components/ui';
import type { ProductCategory } from '@/types';
import { cn } from '@/lib/utils';

const categories: (ProductCategory | 'All')[] = [
  'All',
  'Cardiology',
  'Oncology',
  'Diabetes',
  'Neurology',
  'Respiratory',
  'Gastroenterology',
  'Immunology',
  'Infectious Diseases',
];

const sortOptions = [
  {
    id: 'relevance',
    label: 'Most Relevant',
  },
  {
    id: 'price-low',
    label: 'Price: Low to High',
  },
  {
    id: 'price-high',
    label: 'Price: High to Low',
  },
  {
    id: 'rating',
    label: 'Highest Rated',
  },
];

export function ProductCatalog() {
  const {
    products,
    pageParams,
  } = useApp();

  const [search, setSearch] = useState(
    pageParams.search || ''
  );

  const [category, setCategory] =
    useState<ProductCategory | 'All'>('All');

  const [sort, setSort] =
    useState('relevance');

  const [showFilters, setShowFilters] =
    useState(false);

  const [favoritesOnly, setFavoritesOnly] =
    useState(false);

  /*
   * Keep search synchronized with navigation.
   *
   * Example:
   * Topbar search -> Products?search=cardio
   */
  useEffect(() => {
    setSearch(pageParams.search || '');
  }, [pageParams.search]);

  /*
   * Filter and sort products.
   */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = search.trim().toLowerCase();

    /*
     * Search
     */
    if (query) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || '';

        const description =
          product.shortDescription?.toLowerCase() || '';

        const categoryName =
          product.category?.toLowerCase() || '';

        const purpose =
          product.purpose?.toLowerCase() || '';

        return (
          name.includes(query) ||
          description.includes(query) ||
          categoryName.includes(query) ||
          purpose.includes(query)
        );
      });
    }

    /*
     * Category
     */
    if (category !== 'All') {
      result = result.filter(
        (product) =>
          product.category === category
      );
    }

    /*
     * Favorites
     */
    if (favoritesOnly) {
      result = result.filter(
        (product) => product.isFavorite === true
      );
    }

    /*
     * Sorting
     */
    switch (sort) {
      case 'price-low':
        result.sort(
          (a, b) => a.price - b.price
        );
        break;

      case 'price-high':
        result.sort(
          (a, b) => b.price - a.price
        );
        break;

      case 'rating':
        result.sort(
          (a, b) => b.rating - a.rating
        );
        break;

      case 'relevance':
      default:
        /*
         * Keep backend/context order.
         */
        break;
    }

    return result;
  }, [
    products,
    search,
    category,
    sort,
    favoritesOnly,
  ]);

  /*
   * Clear all filters.
   */
  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setFavoritesOnly(false);
    setSort('relevance');
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    category !== 'All' ||
    favoritesOnly ||
    sort !== 'relevance';

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        subtitle={`${filteredProducts.length} ${
          filteredProducts.length === 1
            ? 'product'
            : 'products'
        } available from BI Pharmaceuticals`}
      />

      {/* Search and Filters */}
      <Card className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
              aria-hidden="true"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, description, category, or purpose..."
              className="input pl-9 pr-9"
              aria-label="Search products"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort and filter buttons */}
          <div className="flex flex-wrap gap-2">
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
              className="input w-auto cursor-pointer"
              aria-label="Sort products"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {/* Favorites */}
            <button
              type="button"
              onClick={() =>
                setFavoritesOnly(
                  (current) => !current
                )
              }
              className={cn(
                'btn px-3',
                favoritesOnly
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'btn-secondary'
              )}
              aria-pressed={favoritesOnly}
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  favoritesOnly &&
                    'fill-current'
                )}
              />

              Favorites
            </button>

            {/* Mobile filters */}
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) => !current
                )
              }
              className="btn-secondary lg:hidden"
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Categories */}
        <div
          className={cn(
            'flex flex-wrap gap-2 mt-3',
            !showFilters && 'hidden lg:flex'
          )}
        >
          {categories.map((cat) => {
            const isActive =
              category === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setCategory(cat)
                }
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                )}
                aria-pressed={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
            <p className="text-xs text-ink-500">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1
                ? 'product'
                : 'products'}{' '}
              found
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title={
              favoritesOnly
                ? 'No favorite products'
                : 'No products found'
            }
            description={
              favoritesOnly
                ? 'You have not added any products to your favorites yet.'
                : 'Try adjusting your search or filters to find what you are looking for.'
            }
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}