import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiEye,
  FiMousePointer,
  FiPercent,
  FiCreditCard,
  FiPlus,
  FiBarChart2,
  FiCopy,
  FiExternalLink,
  FiDownload,
  FiLock,
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { QRCodeCanvas } from 'qrcode.react';
import StatsCard from '../../components/dashboard/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { getOverview } from '../../services/analyticsService';
import {
  copyToClipboard,
  getShareLinks,
  formatNumber,
  getProfileUrl,
  getDaysRemaining,
} from '../../utils/helpers';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isProActive = !!(
    user?.isPro &&
    user?.subscriptionStatus === 'active' &&
    user?.subscriptionEndDate &&
    new Date(user.subscriptionEndDate) > new Date()
  );

  useEffect(() => {
    async function fetchStats() {
      if (!isProActive) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOverview('30d');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [isProActive]);

  const profileUrl = getProfileUrl(user?.username || '');
  const shareLinks = getShareLinks(profileUrl, user?.fullName);
  const daysLeft = user?.subscriptionEndDate
    ? getDaysRemaining(user.subscriptionEndDate)
    : 0;

  const handleDownloadQR = () => {
    const canvas = document.getElementById(
      'qr-code-canvas'
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkverse-${user?.username || 'profile'}-qr.png`;
    link.click();
  };

  // Skeleton Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 bg-gray-200 rounded-lg w-52 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-40 animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-3" />
              <div className="h-7 bg-gray-200 rounded w-14 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-44 animate-pulse mb-4" />
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Hey, {user?.fullName?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Here's how your page is doing
        </p>
      </div>

      {/* Subscription Warning — Free users */}
      {!isProActive && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-bold text-amber-800">
              🔒 Your page is not live
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Subscribe to Pro for just ₹49/month to publish your page and
              unlock all features.
            </p>
          </div>
          <Link
            to="/dashboard/billing"
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-[0.97]"
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Stats */}
      {isProActive ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="Page Views"
            value={formatNumber(stats?.totalViews || 0)}
            icon={<FiEye />}
            trend={stats?.viewsTrend}
            trendLabel="vs last period"
            color="bg-blue-50 text-blue-600"
          />
          <StatsCard
            title="Link Clicks"
            value={formatNumber(stats?.totalClicks || 0)}
            icon={<FiMousePointer />}
            trend={stats?.clicksTrend}
            trendLabel="vs last period"
            color="bg-green-50 text-green-600"
          />
          <StatsCard
            title="Click Rate"
            value={`${stats?.ctr || '0'}%`}
            icon={<FiPercent />}
            color="bg-purple-50 text-purple-600"
          />
          <StatsCard
            title="Subscription"
            value={daysLeft > 0 ? `${daysLeft}d left` : 'Active'}
            icon={<FiCreditCard />}
            color={
              daysLeft <= 3 && daysLeft > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }
          />
        </div>
      ) : (
        <div className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 opacity-40 pointer-events-none select-none blur-[2px]">
            <StatsCard
              title="Page Views"
              value="—"
              icon={<FiEye />}
              color="bg-blue-50 text-blue-600"
            />
            <StatsCard
              title="Link Clicks"
              value="—"
              icon={<FiMousePointer />}
              color="bg-green-50 text-green-600"
            />
            <StatsCard
              title="Click Rate"
              value="—%"
              icon={<FiPercent />}
              color="bg-purple-50 text-purple-600"
            />
            <StatsCard
              title="Subscription"
              value="Inactive"
              icon={<FiCreditCard />}
              color="bg-red-50 text-red-600"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Link
              to="/dashboard/billing"
              className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-indigo-200 shadow-lg px-5 py-3 rounded-xl text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors active:scale-[0.97]"
            >
              <FiLock className="w-4 h-4" />
              Upgrade to Pro to view analytics
            </Link>
          </div>
        </div>
      )}

      {/* URL Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
          Your LinkVerse URL
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm sm:text-base text-indigo-600 truncate">
            {profileUrl}
          </div>
          <button
            onClick={() => copyToClipboard(profileUrl, 'Link')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 active:scale-[0.97]"
          >
            <FiCopy className="w-4 h-4" />
            Copy
          </button>
        </div>

        {/* Share Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 font-medium mr-1">
            Share:
          </span>
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <FaWhatsapp className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <FaXTwitter className="w-4 h-4" />
            <span className="hidden sm:inline">Twitter</span>
          </a>
          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <FaTelegram className="w-4 h-4" />
            <span className="hidden sm:inline">Telegram</span>
          </a>
        </div>

        {/* QR Code */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <QRCodeCanvas
              id="qr-code-canvas"
              value={profileUrl}
              size={120}
              bgColor="#ffffff"
              fgColor="#4f46e5"
              level="M"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-700">QR Code</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Scan to visit your LinkVerse page
            </p>
            <button
              onClick={handleDownloadQR}
              className="mt-2 inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
            >
              <FiDownload className="w-4 h-4" />
              Download PNG
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            to: '/dashboard/links',
            icon: FiPlus,
            title: 'Add New Link',
            desc: 'Add links to your page',
            color: 'bg-indigo-50 text-indigo-600',
            hoverColor:
              'group-hover:bg-indigo-600 group-hover:text-white',
          },
          {
            to: '/dashboard/appearance',
            icon: IoColorPaletteOutline,
            title: 'Customize Theme',
            desc: 'Make your page unique',
            color: 'bg-purple-50 text-purple-600',
            hoverColor:
              'group-hover:bg-purple-600 group-hover:text-white',
          },
          {
            to: '/dashboard/analytics',
            icon: FiBarChart2,
            title: 'View Analytics',
            desc: 'Track your performance',
            color: 'bg-green-50 text-green-600',
            hoverColor:
              'group-hover:bg-green-600 group-hover:text-white',
          },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all group active:scale-[0.98]"
          >
            <div
              className={`p-2.5 rounded-xl transition-colors ${action.color} ${action.hoverColor}`}
            >
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {action.title}
              </p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* View Public Page */}
      <div className="text-center pb-2">
        <a
          href={`/${user?.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
        >
          <FiExternalLink className="w-4 h-4" />
          Open My Public Page
        </a>
      </div>
    </div>
  );
}