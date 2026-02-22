import { useState, useEffect, useCallback } from 'react';
import {
  FiEye,
  FiMousePointer,
  FiLink,
  FiPercent,
  FiTrendingUp,
  FiExternalLink,
  FiRefreshCw,
} from 'react-icons/fi';
import StatsCard from '../../components/dashboard/StatsCard';
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
} from '../../components/dashboard/ChartComponents';
import {
  getOverview,
  getViews,
  getClicks,
  getTopLinks,
  getReferrers,
} from '../../services/analyticsService';
import type {
  AnalyticsOverview,
  DateCount,
  TopLink,
  Referrer,
} from '../../services/analyticsService';
import { formatNumber } from '../../utils/helpers';

type Range = '7d' | '30d' | '90d' | 'all';

// ============================================
// Skeleton Loaders
// ============================================

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-12" />
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
      <div className="h-[250px] bg-gray-50 rounded-lg" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-44 mb-6" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 border-b border-gray-50"
        >
          <div className="h-4 w-6 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-16 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function Analytics() {
  const [range, setRange] = useState<Range>('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [viewsData, setViewsData] = useState<DateCount[]>([]);
  const [clicksData, setClicksData] = useState<DateCount[]>([]);
  const [topLinksData, setTopLinksData] = useState<TopLink[]>([]);
  const [referrersData, setReferrersData] = useState<Referrer[]>([]);

  const fetchData = useCallback(
    async (r: Range, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [overviewRes, viewsRes, clicksRes, topRes, refRes] =
          await Promise.allSettled([
            getOverview(r),
            getViews(r),
            getClicks(r),
            getTopLinks(r),
            getReferrers(r),
          ]);

        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value);
        }
        if (viewsRes.status === 'fulfilled') {
          setViewsData(viewsRes.value.data || []);
        }
        if (clicksRes.status === 'fulfilled') {
          setClicksData(clicksRes.value.data || []);
        }
        if (topRes.status === 'fulfilled') {
          setTopLinksData(topRes.value.data || []);
        }
        if (refRes.status === 'fulfilled') {
          setReferrersData(refRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const ranges: { value: Range; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'all', label: 'All Time' },
  ];

  const hasData =
    (overview?.totalViews || 0) > 0 || (overview?.totalClicks || 0) > 0;

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-56 mt-2 animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"
            />
          ))}
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  // ---- Empty State ----
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your page performance
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FiTrendingUp className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            No analytics data yet
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
            Share your LinkVerse page to start tracking views and clicks.
            Analytics will appear here once visitors start arriving.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
              <FiEye className="w-4 h-4" />
              <span>Page views</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
              <FiMousePointer className="w-4 h-4" />
              <span>Link clicks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
              <FiLink className="w-4 h-4" />
              <span>Top links</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CTR calculation
  const ctrValue =
    overview && overview.totalViews > 0
      ? ((overview.totalClicks / overview.totalViews) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your page performance
          </p>
        </div>
        <button
          onClick={() => fetchData(range, true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Range Filter */}
      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              range === r.value
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total Views"
          value={formatNumber(overview?.totalViews || 0)}
          icon={<FiEye />}
          trend={overview?.viewsTrend}
          trendLabel={overview?.trendLabel || 'vs previous'}
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Total Clicks"
          value={formatNumber(overview?.totalClicks || 0)}
          icon={<FiMousePointer />}
          trend={overview?.clicksTrend}
          trendLabel={overview?.trendLabel || 'vs previous'}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          title="Active Links"
          value={formatNumber(overview?.activeLinks || overview?.totalLinks || 0)}
          icon={<FiLink />}
          color="bg-purple-50 text-purple-600"
        />
        <StatsCard
          title="Click Rate"
          value={`${ctrValue}%`}
          icon={<FiPercent />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          data={viewsData}
          xKey="date"
          yKey="count"
          color="#3b82f6"
          title="Page Views Over Time"
        />
        <LineChartComponent
          data={clicksData}
          xKey="date"
          yKey="count"
          color="#10b981"
          title="Link Clicks Over Time"
        />
        <BarChartComponent
          data={topLinksData.slice(0, 8)}
          xKey="title"
          yKey="clickCount"
          color="#6366f1"
          title="Top Links by Clicks"
        />
        <PieChartComponent
          data={referrersData.slice(0, 8)}
          nameKey="source"
          valueKey="count"
          title="Traffic Sources"
        />
      </div>

      {/* Top Links Table */}
      {topLinksData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-800">
              Top Performing Links
            </h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              {topLinksData.length} link{topLinksData.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="min-w-full px-4 sm:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Platform
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      CTR
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topLinksData.map((link, index) => (
                    <tr
                      key={link._id || index}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0
                              ? 'bg-amber-100 text-amber-700'
                              : index === 1
                              ? 'bg-gray-100 text-gray-600'
                              : index === 2
                              ? 'bg-orange-50 text-orange-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {link.rank || index + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-[250px]">
                            {link.title}
                          </span>
                          {link.url && (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 hidden md:table-cell">
                        <span className="text-gray-500 capitalize">
                          {link.platform || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="font-semibold text-gray-900 tabular-nums">
                          {formatNumber(link.clickCount || 0)}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right hidden sm:table-cell">
                        <span className="text-gray-500 tabular-nums">
                          {link.ctr || 0}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right hidden lg:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  link.percentageOfTotal || 0,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
                            {link.percentageOfTotal || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Referrers Table */}
      {referrersData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-5">
            Traffic Sources
          </h3>
          <div className="space-y-3">
            {referrersData.slice(0, 8).map((ref, index) => (
              <div
                key={ref.source + index}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-gray-400 w-5 text-right tabular-nums">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {ref.source}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 tabular-nums shrink-0">
                      {formatNumber(ref.count)} ({ref.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(ref.percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}