import { ReactNode } from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: string;
}

export default function AdminStatsCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'bg-indigo-100 text-indigo-600',
}: AdminStatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 truncate tabular-nums">
            {value}
          </p>
          {trend !== undefined && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {trend >= 0 ? (
                <FiTrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : (
                <FiTrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
              )}
              <span
                className={`text-xs font-semibold ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend >= 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`shrink-0 p-2.5 sm:p-3 rounded-xl ${color} group-hover:scale-105 transition-transform`}
        >
          <span className="text-lg sm:text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}