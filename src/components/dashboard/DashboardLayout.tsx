import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { HiSparkles, HiXMark } from 'react-icons/hi2';

function ProUpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <div className="relative bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <HiSparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              <span className="sm:hidden">Upgrade to Pro!</span>
              <span className="hidden sm:inline">
                You're on the Free plan — Upgrade to Pro for the full
                experience!
              </span>
            </p>
            <p className="text-xs text-white/80 hidden md:block mt-0.5">
              Unlimited links, custom themes, analytics, SEO settings, remove
              branding & more.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="px-4 py-1.5 bg-white text-indigo-700 text-xs sm:text-sm font-bold rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-sm active:scale-[0.97]"
          >
            Go Pro ✨
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Dismiss upgrade banner"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const isProUser =
    user?.isPro &&
    user?.subscriptionStatus === 'active' &&
    user?.subscriptionEndDate &&
    new Date(user.subscriptionEndDate) > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Pro Upgrade Banner — only for non-pro users */}
        {!isProUser && <ProUpgradeBanner />}

        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}