import { useState, useEffect, useCallback } from 'react';
import {
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiCalendar,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
} from '../../components/dashboard/ChartComponents';
import { getStats } from '../../services/adminService';
import { formatDate, getInitials } from '../../utils/helpers';

/* ───────────────────────────── skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="h-7 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-56 mt-2 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse mb-3" />
            <div className="h-7 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-80"
          >
            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse mb-4" />
            <div className="h-56 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── main ── */
export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch admin stats:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ---------- loading ---------- */
  if (loading) return <DashboardSkeleton />;

  /* ---------- error ---------- */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Failed to load dashboard
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  /* ---------- stats cards ---------- */
  const subscriberPercent = stats?.totalUsers
    ? (stats.activeSubscribers / stats.totalUsers) * 100
    : 0;

  const statsCards = [
    {
      title: 'Total Users',
      value: (stats?.totalUsers || 0).toLocaleString(),
      icon: <FiUsers />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Subscribers',
      value: (stats?.activeSubscribers || 0).toLocaleString(),
      icon: <FiCheckCircle />,
      color: 'bg-green-100 text-green-600',
      trend: subscriberPercent,
      trendLabel: 'of total users',
    },
    {
      title: 'Total Revenue',
      value: `₹${((stats?.totalRevenue || 0) / 100).toLocaleString('en-IN')}`,
      icon: <FiDollarSign />,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${((stats?.monthlyRevenue || 0) / 100).toLocaleString('en-IN')}`,
      icon: <FiCalendar />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Expired Users',
      value: (stats?.expiredUsers || 0).toLocaleString(),
      icon: <FiAlertTriangle />,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Total Page Views',
      value: (stats?.totalPageViews || 0).toLocaleString(),
      icon: <FiEye />,
      color: 'bg-cyan-100 text-cyan-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform overview and analytics
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Refresh data"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statsCards.map((card, i) => (
          <AdminStatsCard key={i} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="New Signups (Last 30 Days)"
          data={stats?.signupsPerDay || []}
          xKey="date"
          yKey="count"
          color="#6366f1"
        />
        <LineChartComponent
          title="Revenue (Last 30 Days)"
          data={stats?.revenuePerDay || []}
          xKey="date"
          yKey="amount"
          color="#10b981"
        />
        <PieChartComponent
          title="Users by Category"
          data={stats?.usersByCategory || []}
          nameKey="category"
          valueKey="count"
        />
        <BarChartComponent
          title="Top States"
          data={stats?.usersByState || []}
          xKey="state"
          yKey="count"
          color="#8b5cf6"
        />
      </div>

      {/* Recent Signups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 pb-0 sm:pb-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Signups
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Latest users who joined the platform
          </p>
        </div>

        {stats?.recentSignups?.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentSignups.map((user: any, i: number) => (
                  <tr
                    key={user._id || i}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                            {getInitials(user.fullName || 'U')}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">
                      <span className="truncate block max-w-[200px]">
                        {user.email}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.subscriptionStatus === 'active'
                            ? 'bg-green-100 text-green-700'
                            : user.subscriptionStatus === 'expired'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.subscriptionStatus === 'active'
                          ? 'Active'
                          : user.subscriptionStatus === 'expired'
                          ? 'Expired'
                          : 'Free'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm hidden sm:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <FiUsers className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No recent signups</p>
          </div>
        )}
      </div>
    </div>
  );
}