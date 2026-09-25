import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { Product } from '../../types/product';
import { productsApi } from '../../api/productsApi';
import { useProductOverlay } from '../../context/ProductOverlayContext';
import { CategoryBadge, RatingBadge, StockBadge, LocalChangeBadge } from '../common/Badge';

interface ProductDetailViewProps {
  productId: number;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  delay?: number;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onBack,
  onEdit,
  onDelete,
  delay,
}) => {
  const { applyOverlayToSingle, createdProducts, deletedIds } = useProductOverlay();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    // 0. Check if ID is invalid or non-numeric
    if (!productId || productId <= 0) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    // 1. Check if ID is marked as deleted in local overlay
    if (deletedIds.includes(productId)) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    // 2. Check if product was locally created
    const locallyCreated = createdProducts.find((p) => p.id === productId);
    if (locallyCreated) {
      setProduct(locallyCreated);
      setSelectedImage(locallyCreated.thumbnail || locallyCreated.images?.[0] || '');
      setIsLoading(false);
      return;
    }

    // 3. Otherwise fetch from DummyJSON API
    productsApi
      .getProductById(productId, delay)
      .then((data) => {
        if (!isMounted) return;
        const modified = applyOverlayToSingle(data);
        if (!modified) {
          setIsNotFound(true);
        } else {
          setProduct(modified);
          setSelectedImage(
            modified.images?.[0] || modified.thumbnail || 'https://placehold.co/600x600?text=No+Image'
          );
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setIsNotFound(true);
        } else {
          const msg =
            err instanceof Error ? err.message : 'Failed to retrieve product details.';
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, delay, applyOverlayToSingle, createdProducts, deletedIds]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">
          Loading product details for #{productId}...
        </p>
      </div>
    );
  }

  // "Not Found" State (as requested: "Show a 'not found' page for a wrong id.")
  if (isNotFound) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center shadow-xs">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5">
          <AlertCircle className="w-10 h-10 stroke-[1.8]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          We couldn&rsquo;t find any product with ID <span className="font-mono font-semibold text-slate-800">#{productId}</span>.
          It may have been deleted or the identifier is invalid.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product List
        </button>
      </div>
    );
  }

  // Network / Server Error State
  if (error || !product) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">Error Loading Product</h3>
        <p className="text-sm text-slate-600 mb-6">{error || 'Unknown error occurred.'}</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product List
        </button>
      </div>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail || 'https://placehold.co/600x600?text=No+Image'];

  const discountedPrice = product.price;
  const hasDiscount = Boolean(product.discountPercentage && product.discountPercentage > 0);
  const originalPrice = hasDiscount
    ? (product.price / (1 - product.discountPercentage! / 100)).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product List
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-amber-600 rounded-xl transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Product
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Product
          </button>
        </div>
      </div>

      {/* Main Product Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Images Gallery: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center p-4">
              <img
                src={selectedImage}
                alt={product.title}
                className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x600?text=No+Image';
                }}
              />
            </div>

            {/* Thumbnails row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-16 h-16 rounded-xl border p-1 bg-white overflow-hidden shrink-0 transition-all cursor-pointer ${
                      selectedImage === imgUrl
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details: 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <CategoryBadge category={product.category} />
                <LocalChangeBadge
                  isLocal={product.isLocal}
                  isModified={product.isModified}
                />
                {product.brand && (
                  <span className="text-xs font-semibold text-slate-500">
                    Brand: {product.brand}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <RatingBadge rating={product.rating} />
                <span className="text-xs text-slate-400">
                  {product.reviews?.length || 0} Customer Reviews
                </span>
                <span className="text-slate-300">•</span>
                <StockBadge stock={product.stock} />
                {product.sku && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-mono text-slate-500">
                      SKU: {product.sku}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-400 line-through">
                      ${originalPrice}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Inclusive of all simulated taxes & duties
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description || 'No description provided.'}
              </p>
            </div>

            {/* Feature specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-500" />
                  Shipping
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {product.shippingInformation || 'Standard Shipping'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Warranty
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {product.warrantyInformation || '1-Year Warranty'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  Returns
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {product.returnPolicy || '30-Day Return Policy'}
                </div>
              </div>

              {product.dimensions && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    Dimensions (W x H x D)
                  </div>
                  <div className="text-xs font-semibold text-slate-800 font-mono">
                    {product.dimensions.width} &times; {product.dimensions.height} &times; {product.dimensions.depth} cm
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified feedback for this product
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">
              {Number(product.rating || 0).toFixed(1)}
            </span>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.reviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rev.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic line-clamp-4">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                    <UserIcon className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {rev.reviewerName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {rev.reviewerEmail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No reviews yet for this product.
          </div>
        )}
      </div>
    </div>
  );
};
