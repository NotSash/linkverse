import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  HiHome,
  HiLink,
  HiDevicePhoneMobile,
  HiPaintBrush,
  HiChartBar,
  HiCog6Tooth,
  HiCreditCard,
  HiMagnifyingGlass,
  HiEye,
  HiArrowRightOnRectangle,
  HiArrowTopRightOnSquare,
  HiEllipsisHorizontal,
  HiXMark,
} from 'react-icons/hi2';

const NAV_ITEMS = [
  { to: '/dashboard', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/dashboard/links', icon: HiLink, label: 'Links', end: false },
  {
    to: '/dashboard/socials',
    icon: HiDevicePhoneMobile,
    label: 'Social Links',
    end: false,
  },
  {
    to: '/dashboard/appearance',
    icon: HiPaintBrush,
    label: 'Appearance',
    end: false,
  },
  {
    to: '/dashboard/analytics',
    icon: HiChartBar,
    label: 'Analytics',
    end: false,
  },
  {
    to: '/dashboard/settings',
    icon: HiCog6Tooth,
    label: 'Settings',
    end: false,
  },
  {
    to: '/dashboard/billing',
    icon: HiCreditCard,
    label: 'Billing',
    end: false,
  },
  { to: '/dashboard/seo', icon: HiMagnifyingGlass, label: 'SEO', end: false },
  { to: '/dashboard/preview', icon: HiEye, label: 'Preview', end: false },
];

const MOBILE_TAB_ITEMS = NAV_ITEMS.slice(0, 4);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement>(null);

  const moreItems = NAV_ITEMS.slice(4);

  // Close more sheet on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreSheetRef.current &&
        !moreSheetRef.current.contains(e.target as Node)
      ) {
        setShowMoreSheet(false);
      }
    };
    if (showMoreSheet) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreSheet]);

  // Close more sheet on route change
  useEffect(() => {
    setShowMoreSheet(false);
  }, [location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const profileUrl = user?.username ? `/${user.username}` : '#';

  // Check if any "more" item is currently active
  const isMoreActive = moreItems.some(
    (item) =>
      location.pathname === item.to ||
      (!item.end && location.pathname.startsWith(item.to + '/'))
  );

  const navLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }): string =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <>
      {/* ──── Desktop Sidebar ──── */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
              <HiLink className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              LinkVerse
            </span>
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white">
                {getInitials(user?.fullName || '')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user?.username || 'username'}
              </p>
            </div>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
          >
            <HiArrowTopRightOnSquare className="w-4 h-4" />
            <span>View My Page</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full font-medium"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ──── Mobile Sidebar Overlay ──── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <HiLink className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                  LinkVerse
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close sidebar"
              >
                <HiXMark className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(user?.fullName || '')}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl w-full font-medium"
              >
                <HiArrowRightOnRectangle className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ──── Mobile Bottom Tab Bar ──── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {MOBILE_TAB_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-14 rounded-xl transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-400 active:text-gray-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">
                {item.label.split(' ')[0]}
              </span>
            </NavLink>
          ))}

          {/* More Button */}
          <button
            onClick={() => setShowMoreSheet(!showMoreSheet)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-14 rounded-xl transition-colors ${
              showMoreSheet || isMoreActive
                ? 'text-indigo-600'
                : 'text-gray-400 active:text-gray-600'
            }`}
          >
            <HiEllipsisHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">More</span>
          </button>
        </div>

        {/* More Sheet */}
        {showMoreSheet && (
          <>
            {/* Sheet backdrop */}
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setShowMoreSheet(false)}
            />
            <div
              ref={moreSheetRef}
              className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl rounded-t-2xl p-4 pb-2 animate-in slide-in-from-bottom duration-150"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="grid grid-cols-5 gap-3">
                {moreItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMoreSheet(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
                        isActive
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-500 active:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {item.label.split(' ')[0]}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
}