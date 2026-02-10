import { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

function Avatar({ src, name = '', size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showFallback = !src || imgError;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        showFallback && 'bg-sage-100 text-sage-600',
        sizeMap[size],
        className,
      )}
    >
      {showFallback ? (
        <span className="font-medium leading-none select-none">
          {getInitials(name)}
        </span>
      ) : (
        <img
          src={src}
          alt={name || 'avatar'}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';

export { Avatar };
