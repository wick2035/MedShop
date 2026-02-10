import { motion } from 'framer-motion';
import { Clock, ShieldCheck } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import type { ServiceType } from '@/types/enums';

interface ServiceInfo {
  id: string;
  name: string;
  serviceType: ServiceType | string;
  description?: string;
  price: number;
  originalPrice?: number;
  insuranceCovered?: boolean;
  durationMinutes?: number;
}

interface ServiceCardProps {
  service: ServiceInfo;
  onClick?: () => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const typeLabel =
    SERVICE_TYPE_LABELS[service.serviceType as ServiceType] ?? service.serviceType;
  const hasDiscount =
    service.originalPrice !== undefined &&
    service.originalPrice > service.price;

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
        <h4 className="text-sm font-semibold text-gray-900 font-display line-clamp-1">
          {service.name}
        </h4>
        <span className="inline-flex flex-shrink-0 items-center rounded-md bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600">
          {typeLabel}
        </span>
      </div>

      {/* Description */}
      {service.description && (
        <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">
          {service.description}
        </p>
      )}

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {service.insuranceCovered && (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky">
            <ShieldCheck className="h-3 w-3" />
            医保
          </span>
        )}
        {service.durationMinutes !== undefined && service.durationMinutes > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {service.durationMinutes}分钟
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-2 border-t border-ivory-200/60 pt-3">
        <span className="text-base font-semibold text-sage-600 font-display">
          {formatCurrency(service.price)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-gray-400 line-through">
            {formatCurrency(service.originalPrice)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
