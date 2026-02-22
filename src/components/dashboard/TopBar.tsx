import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getDaysRemaining } from '../../utils/helpers';
import {
  HiBars3,
  HiBell,
  HiChevronDown,
  HiCog6Tooth,
  HiCreditCard,
  HiArrowTopRightOnSquare,
  HiArrowRightOnRectangle,
  HiExclamationTriangle,
} from 'react-icons/hi2';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/links': 'Links',
  '/dashboard/socials': 'Social Links',
  '/dashboard/appearance': 'Appearance',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/account': 'Account',
  '/dashboard/billing': 'Billing',
  '/dashboard/seo': 'SEO Settings',
  '/dashboard/preview': 'Preview',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  const isProActive =
    user?.isPro &&
    user?.subscriptionStatus === 'active' &&
    user?.subscriptionEndDate &&
    new Date(user.subscriptionEndDate) > new Date();

  const daysLeft = user?.subscriptionEndDate
    ? getDaysRemaining(user.subscriptionEndDate)
    : 0;

  const isExpiringSoon = isProActive && daysLeft <= 3 && daysLeft > 0;
  const isExpired =
    user?.subscriptionEndDate &&
    new Date(user.subscriptionEndDate) < new Date();

  const notifications: {
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    action: string;
  }[] = [];

  if (!isProActive && !isExpired) {
    notifications.push({
      type: 'warning',
      title: 'Page Not Published',
      message: 'Subscribe to Pro to make your page live.',
      action: 'Subscribe Now →',
    });
  }
  if (isExpiringSoon) {
    notifications.push({
      type: 'warning',
      title: 'Subscription Expiring Soon',
      message: `Your Pro plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`,
      action: 'Renew Now →',
    });
  }
  if (isExpired) {
    notifications.push({
      type: 'error',
      title: 'Subscription Expired',
      message: 'Your page is offline. Renew to restore it.',
      action: 'Renew Now →',
    });
  }

  const hasNotification = notifications.length > 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 md:px-6">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <HiBars3 className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            {pageTitle}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
              aria-label="Notifications"
            >
              <HiBell className="w-5 h-5 text-gray-500" />
              {hasNotification && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 max-h-80 overflow-y-auto">
                <h3 className="px-4 py-3 text-sm font-bold text-gray-900 border-b border-gray-100">
                  Notifications
                </h3>

                {notifications.length > 0 ? (
                  notifications.map((notif, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          notif.type === 'error'
                            ? 'bg-red-100'
                            : 'bg-amber-100'
                        }`}
                      >
                        <HiExclamationTriangle
                          className={`w-4 h-4 ${
                            notif.type === 'error'
                              ? 'text-red-600'
                              : 'text-amber-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {notif.message}
                        </p>
                        <button
                          onClick={() =>
                            navigateAndClose('/dashboard/billing')
                          }
                          className="text-xs text-indigo-600 font-semibold mt-1.5 hover:text-indigo-700"
                        >
                          {notif.action}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-400">
                      You're all caught up! 🎉
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-gray-100">
                  {getInitials(user?.fullName || '')}
                </div>
              )}
              <HiChevronDown
                className={`w-4 h-4 text-gray-400 hidden md:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user?.username}
                  </p>
                  {isProActive && (
                    <span className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                      PRO
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => navigateAndClose('/dashboard/settings')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiCog6Tooth className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>

                  <a
                    href={user?.username ? `/${user.username}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiArrowTopRightOnSquare className="w-4 h-4 text-gray-400" />
                    View My Page
                  </a>

                  <button
                    onClick={() => navigateAndClose('/dashboard/billing')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HiCreditCard className="w-4 h-4 text-gray-400" />
                    Billing
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
