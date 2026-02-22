import { ReactNode } from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'bg-indigo-50 text-indigo-600',
  className = '',
}: StatsCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
            {title}
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`shrink-0 p-2.5 sm:p-3 rounded-xl ${color}`}
        >
          <span className="text-lg sm:text-xl block">{icon}</span>
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
              isPositive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {isPositive ? (
              <FiTrendingUp className="w-3 h-3" />
            ) : (
              <FiTrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}
            {trend.toFixed(1)}%
          </div>
          {trendLabel && (
            <span className="text-xs text-gray-400 truncate">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}