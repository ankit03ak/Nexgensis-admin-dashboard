import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types/product';
import { CategoryBadge, RatingBadge, StockBadge, LocalChangeBadge } from '../common/Badge';

interface ProductTableProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <th scope="col" className="py-3.5 pl-6 pr-3 w-16">
                Image
              </th>
              <th scope="col" className="py-3.5 px-3">
                Product Title & Brand
              </th>
              <th scope="col" className="py-3.5 px-3">
                Category
              </th>
              <th scope="col" className="py-3.5 px-3 text-right">
                Price
              </th>
              <th scope="col" className="py-3.5 px-3 text-center">
                Rating
              </th>
              <th scope="col" className="py-3.5 px-3 text-center">
                Stock
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const discountedPrice = product.price;
              const hasDiscount =
                product.discountPercentage && product.discountPercentage > 0;
              const originalPrice = hasDiscount
                ? (product.price / (1 - product.discountPercentage! / 100)).toFixed(2)
                : null;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  {/* Thumbnail */}
                  <td className="py-3 pl-6 pr-3 whitespace-nowrap">
                    <div
                      onClick={() => onViewProduct(product)}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all"
                    >
                      <img
                        src={product.thumbnail || product.images?.[0] || 'https://placehold.co/100x100?text=No+Img'}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Img';
                        }}
                      />
                    </div>
                  </td>

                  {/* Title & Brand */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewProduct(product)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 text-left line-clamp-1 cursor-pointer transition-colors"
                        title={product.title}
                      >
                        {product.title}
                      </button>
                      <LocalChangeBadge
                        isLocal={product.isLocal}
                        isModified={product.isModified}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{product.brand || 'Generic'}</span>
                      {product.sku && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {product.sku}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <CategoryBadge category={product.category} />
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      ${discountedPrice.toFixed(2)}
                    </div>
                    {hasDiscount && (
                      <div className="text-[11px] text-slate-400 line-through">
                        ${originalPrice}
                      </div>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <RatingBadge rating={product.rating} />
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <StockBadge stock={product.stock} />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 pl-3 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewProduct(product)}
                        title="View details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        title="Edit product"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        title="Delete product"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
