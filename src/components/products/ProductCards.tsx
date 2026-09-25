import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types/product';
import { CategoryBadge, RatingBadge, StockBadge, LocalChangeBadge } from '../common/Badge';

interface ProductCardsProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductCards: React.FC<ProductCardsProps> = ({
  products,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {products.map((product) => {
        const discountedPrice = product.price;
        const hasDiscount =
          product.discountPercentage && product.discountPercentage > 0;
        const originalPrice = hasDiscount
          ? (product.price / (1 - product.discountPercentage! / 100)).toFixed(2)
          : null;

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Image and Badges */}
              <div className="relative w-full h-44 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden mb-3">
                <img
                  src={product.thumbnail || product.images?.[0] || 'https://placehold.co/300x200?text=No+Image'}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=No+Image';
                  }}
                />
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  <CategoryBadge category={product.category} />
                  <LocalChangeBadge
                    isLocal={product.isLocal}
                    isModified={product.isModified}
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <RatingBadge rating={product.rating} />
                </div>
              </div>

              {/* Title & Brand */}
              <button
                type="button"
                onClick={() => onViewProduct(product)}
                className="text-left font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 text-base transition-colors cursor-pointer"
                title={product.title}
              >
                {product.title}
              </button>
              <p className="text-xs text-slate-400 mt-0.5">
                {product.brand || 'Generic'} {product.sku ? `• ${product.sku}` : ''}
              </p>

              {/* Description snippet */}
              <p className="text-xs text-slate-500 line-clamp-2 mt-2">
                {product.description}
              </p>
            </div>

            {/* Bottom Bar: Price, Stock, Actions */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900 leading-tight">
                  ${discountedPrice.toFixed(2)}
                </div>
                {hasDiscount && (
                  <div className="text-[11px] text-slate-400 line-through">
                    ${originalPrice}
                  </div>
                )}
                <div className="mt-1">
                  <StockBadge stock={product.stock} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onViewProduct(product)}
                  title="View details"
                  className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  title="Edit product"
                  className="p-2 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product)}
                  title="Delete product"
                  className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
