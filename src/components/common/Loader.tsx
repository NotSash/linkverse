import React from 'react';
import { cn } from '@/utils/cn';

// --- Spinner ---
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'text-indigo-600',
  className = '',
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        color,
        'border-current border-t-transparent rounded-full animate-spin',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// --- Skeleton Line ---
interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}

export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'rounded',
}) => (
  <div
    className={cn(width, height, rounded, 'skeleton', className)}
    role="presentation"
    aria-hidden="true"
  />
);

// --- Skeleton Avatar ---
interface SkeletonAvatarProps {
  size?: string;
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'w-12 h-12',
  className = '',
}) => (
  <div
    className={cn(size, 'rounded-full skeleton shrink-0', className)}
    role="presentation"
    aria-hidden="true"
  />
);

// --- Skeleton Card ---
interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  className = '',
}) => (
  <div
    className={cn('bg-white rounded-xl border border-gray-100 p-5', className)}
    role="presentation"
    aria-hidden="true"
  >
    {showAvatar && (
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-1/3" height="h-4" />
          <SkeletonLine width="w-1/2" height="h-3" />
        </div>
      </div>
    )}
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? 'w-2/3' : i === 0 ? 'w-full' : 'w-5/6'}
          height={i === 0 ? 'h-5' : 'h-3'}
        />
      ))}
    </div>
  </div>
);

// --- Stats Card Skeleton ---
export const SkeletonStatsCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={cn('bg-white rounded-xl border border-gray-100 p-5', className)}
    role="presentation"
    aria-hidden="true"
  >
    <div className="flex items-start justify-between mb-3">
      <SkeletonAvatar size="w-10 h-10" />
      <SkeletonLine width="w-16" height="h-4" />
    </div>
    <SkeletonLine width="w-1/2" height="h-3" className="mb-2" />
    <SkeletonLine width="w-1/3" height="h-7" />
  </div>
);

// --- Link Card Skeleton ---
export const SkeletonLinkCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={cn(
      'bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3',
      className
    )}
    role="presentation"
    aria-hidden="true"
  >
    <SkeletonLine width="w-6" height="h-8" rounded="rounded" />
    <SkeletonAvatar size="w-8 h-8" />
    <div className="flex-1 space-y-2">
      <SkeletonLine width="w-2/3" height="h-4" />
      <SkeletonLine width="w-1/2" height="h-3" />
    </div>
    <SkeletonLine width="w-12" height="h-6" rounded="rounded-full" />
  </div>
);

// --- Page Loader ---
interface PageLoaderProps {
  message?: string;
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  className = '',
}) => (
  <div
    className={cn('min-h-[60vh] flex flex-col items-center justify-center gap-4', className)}
    role="status"
    aria-label={message}
  >
    <Spinner size="lg" />
    <p className="text-gray-500 text-sm font-medium animate-pulse">{message}</p>
  </div>
);

// --- Inline Loader ---
export const InlineLoader: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className = '',
}) => (
  <div className={cn('flex items-center justify-center gap-2 py-4', className)}>
    <Spinner size="sm" />
    <span className="text-gray-500 text-sm">{message}</span>
  </div>
);

// --- Overlay Loader ---
export const OverlayLoader: React.FC<{ message?: string }> = ({
  message = 'Please wait...',
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 mx-4 max-w-xs w-full">
      <Spinner size="lg" />
      <p className="text-gray-700 font-medium text-center">{message}</p>
    </div>
  </div>
);