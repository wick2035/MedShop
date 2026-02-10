import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn, getInitials, formatCurrency } from '@/lib/utils';

interface DoctorInfo {
  id: string;
  fullName: string;
  title: string;
  specialty: string;
  departmentId?: string;
  consultationFee: number;
  ratingScore?: number;
  isAcceptingPatients?: boolean;
  bio?: string;
}

interface DoctorCardProps {
  doctor: DoctorInfo;
  onClick?: () => void;
}

function RatingStars({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.3;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 fill-muted-gold text-muted-gold" />,
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <span key={i} className="relative">
          <Star className="h-3.5 w-3.5 text-gray-200" />
          <Star
            className="absolute inset-0 h-3.5 w-3.5 fill-muted-gold text-muted-gold"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </span>,
      );
    } else {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 text-gray-200" />,
      );
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  const isAccepting = doctor.isAcceptingPatients !== false;
  const specialties = doctor.specialty
    ? doctor.specialty.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(45, 97, 57, 0.10)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'relative rounded-lg bg-white border border-ivory-200/60 p-4 shadow-sm',
        'transition-colors',
        onClick && 'cursor-pointer',
      )}
    >
      {/* Not accepting overlay */}
      {!isAccepting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            暂不接诊
          </span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700 font-display font-semibold text-sm">
          {getInitials(doctor.fullName)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + title */}
          <div className="flex items-baseline gap-2">
            <h4 className="text-base font-semibold text-gray-900 font-display truncate">
              {doctor.fullName}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">{doctor.title}</span>
          </div>

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-block rounded-md bg-ivory-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {s}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-xs text-gray-400">+{specialties.length - 3}</span>
              )}
            </div>
          )}

          {/* Bio */}
          {doctor.bio && (
            <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{doctor.bio}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-ivory-200/60 pt-3">
        <div className="flex items-center gap-2">
          {doctor.ratingScore !== undefined && (
            <div className="flex items-center gap-1">
              <RatingStars score={doctor.ratingScore} />
              <span className="text-xs text-gray-500">
                {doctor.ratingScore.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-sage-600">
          {formatCurrency(doctor.consultationFee)}
        </span>
      </div>
    </motion.div>
  );
}
