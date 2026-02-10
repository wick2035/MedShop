import { motion } from 'framer-motion';
import { MapPin, Phone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOSPITAL_STATUS_LABELS, HOSPITAL_STATUS_COLORS } from '@/lib/constants';
import type { HospitalStatus, SubscriptionTier } from '@/types/enums';

interface HospitalInfo {
  id: string;
  name: string;
  code?: string;
  city?: string;
  province?: string;
  address?: string;
  status: HospitalStatus | string;
  subscriptionTier: SubscriptionTier | string;
  contactPhone?: string;
  phone?: string;
}

interface HospitalCardProps {
  hospital: HospitalInfo;
  onClick?: () => void;
}

const TIER_STYLES: Record<string, string> = {
  STANDARD: 'bg-gray-100 text-gray-600',
  PREMIUM: 'bg-muted-gold/10 text-muted-gold',
  ENTERPRISE: 'bg-sage-50 text-sage-600',
};

const TIER_LABELS: Record<string, string> = {
  STANDARD: '标准版',
  PREMIUM: '高级版',
  ENTERPRISE: '企业版',
};

export default function HospitalCard({ hospital, onClick }: HospitalCardProps) {
  const statusLabel =
    HOSPITAL_STATUS_LABELS[hospital.status as HospitalStatus] ?? hospital.status;
  const statusColor =
    HOSPITAL_STATUS_COLORS[hospital.status as HospitalStatus] ??
    'bg-gray-100 text-gray-700';
  const tierStyle = TIER_STYLES[hospital.subscriptionTier] ?? TIER_STYLES.STANDARD;
  const tierLabel =
    TIER_LABELS[hospital.subscriptionTier] ?? hospital.subscriptionTier;
  const phone = hospital.contactPhone ?? hospital.phone;

  const location = [hospital.province, hospital.city]
    .filter(Boolean)
    .join(' ');

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
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50 text-sage-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 font-display">
              {hospital.name}
            </h4>
            {hospital.code && (
              <span className="font-mono text-xs text-gray-400">
                {hospital.code}
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusColor,
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-ivory-200/60 pt-3">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
            tierStyle,
          )}
        >
          {tierLabel}
        </span>
      </div>
    </motion.div>
  );
}
