import { motion } from 'framer-motion';
import { Calendar, Tag } from 'lucide-react';
import { cn, formatCurrency, truncate } from '@/lib/utils';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';
import type { PackageType } from '@/types/enums';

interface PackageInfo {
  id: string;
  name: string;
  packageType: PackageType | string;
  description?: string;
  price: number;
  originalPrice?: number;
  validityDays?: number;
}

interface PackageCardProps {
  pkg: PackageInfo;
  onClick?: () => void;
}

export default function PackageCard({ pkg, onClick }: PackageCardProps) {
  const typeLabel =
    PACKAGE_TYPE_LABELS[pkg.packageType as PackageType] ?? pkg.packageType;
  const hasDiscount =
    pkg.originalPrice !== undefined && pkg.originalPrice > pkg.price;
  const discountPct =
    hasDiscount && pkg.originalPrice
      ? Math.round((1 - pkg.price / pkg.originalPrice) * 100)
      : 0;

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
        <h4 className="text-base font-semibold text-gray-900 font-display line-clamp-1">
          {pkg.name}
        </h4>
        <span className="inline-flex flex-shrink-0 items-center rounded-md bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600">
          {typeLabel}
        </span>
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">
          {truncate(pkg.description, 80)}
        </p>
      )}

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pkg.validityDays !== undefined && pkg.validityDays > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            有效期 {pkg.validityDays} 天
          </span>
        )}
        {hasDiscount && discountPct > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta">
            <Tag className="h-3 w-3" />
            省{discountPct}%
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-2 border-t border-ivory-200/60 pt-3">
        <span className="text-lg font-semibold text-sage-600 font-display">
          {formatCurrency(pkg.price)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-gray-400 line-through">
            {formatCurrency(pkg.originalPrice)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
