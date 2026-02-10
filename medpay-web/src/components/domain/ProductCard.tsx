import { motion } from 'framer-motion';
import { Pill, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import type { ProductType } from '@/types/enums';

interface ProductInfo {
  id: string;
  name: string;
  productType: ProductType | string;
  genericName?: string;
  manufacturer?: string;
  specification?: string;
  price: number;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  insuranceCovered?: boolean;
}

interface ProductCardProps {
  product: ProductInfo;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const typeLabel =
    PRODUCT_TYPE_LABELS[product.productType as ProductType] ?? product.productType;
  const isLowStock =
    product.stockQuantity !== undefined && product.stockQuantity <= 10;
  const isOutOfStock =
    product.stockQuantity !== undefined && product.stockQuantity <= 0;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(45, 97, 57, 0.10)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'rounded-lg bg-white border border-ivory-200/60 p-4 shadow-sm',
        'transition-colors',
        onClick && 'cursor-pointer',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 font-display truncate">
              {product.name}
            </h4>
            {product.requiresPrescription && (
              <span className="flex-shrink-0 inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                Rx
              </span>
            )}
          </div>
          {product.genericName && (
            <p className="mt-0.5 text-xs text-gray-400">{product.genericName}</p>
          )}
        </div>
        <span className="inline-flex flex-shrink-0 items-center rounded-md bg-ivory-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {typeLabel}
        </span>
      </div>

      {/* Manufacturer + Spec */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        {product.manufacturer && (
          <span>
            <Pill className="mr-1 inline h-3 w-3" />
            {product.manufacturer}
          </span>
        )}
        {product.specification && <span>{product.specification}</span>}
      </div>

      {/* Tags */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {product.insuranceCovered && (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky">
            <ShieldCheck className="h-3 w-3" />
            医保
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-ivory-200/60 pt-3">
        <span className="text-base font-semibold text-sage-600 font-display">
          {formatCurrency(product.price)}
        </span>
        {product.stockQuantity !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              isOutOfStock
                ? 'text-red-500'
                : isLowStock
                  ? 'text-amber-600'
                  : 'text-gray-400',
            )}
          >
            {(isLowStock || isOutOfStock) && (
              <AlertTriangle className="h-3 w-3" />
            )}
            {isOutOfStock
              ? '缺货'
              : `库存 ${product.stockQuantity}`}
          </span>
        )}
      </div>
    </motion.div>
  );
}
