import { useState, useEffect, useRef } from 'react';
import {
  FiSmartphone,
  FiMonitor,
  FiExternalLink,
  FiShare2,
  FiCopy,
  FiDownload,
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getLinks } from '../../services/linkService';
import type { Link as LinkType } from '../../services/linkService';
import {
  copyToClipboard,
  getShareLinks,
  getProfileUrl,
  getInitials,
} from '../../utils/helpers';
import { DEFAULT_THEME } from '../../utils/constants';
import SocialIconsRow from '../../components/public/SocialIconsRow';

interface ThemeData {
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  buttonStyle: string;
  backgroundType: string;
  gradientFrom: string;
  gradientTo: string;
  backgroundImage: string;
  [key: string]: string;
}

export default function Preview() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const profileUrl = getProfileUrl(user?.username || '');
  const shareLinks = getShareLinks(profileUrl, user?.fullName);

  // Normalize theme with defaults to avoid loose typing issues
  const rawTheme: Record<string, any> = user?.theme || {};
  const theme: ThemeData = {
    backgroundColor: rawTheme.backgroundColor || DEFAULT_THEME.backgroundColor,
    cardColor: rawTheme.cardColor || DEFAULT_THEME.cardColor,
    textColor: rawTheme.textColor || DEFAULT_THEME.textColor,
    buttonColor: rawTheme.buttonColor || DEFAULT_THEME.buttonColor,
    buttonTextColor: rawTheme.buttonTextColor || DEFAULT_THEME.buttonTextColor,
    fontFamily: rawTheme.fontFamily || DEFAULT_THEME.fontFamily,
    buttonStyle: rawTheme.buttonStyle || DEFAULT_THEME.buttonStyle,
    backgroundType: rawTheme.backgroundType || DEFAULT_THEME.backgroundType,
    gradientFrom: rawTheme.gradientFrom || DEFAULT_THEME.gradientFrom,
    gradientTo: rawTheme.gradientTo || DEFAULT_THEME.gradientTo,
    backgroundImage: rawTheme.backgroundImage || '',
  };

  const rawSocials = user?.socialLinks || {};
  const socialLinks: Record<string, string> = Object.entries(rawSocials).reduce(
    (acc, [key, val]) => {
      if (typeof val === 'string') acc[key] = val;
      return acc;
    },
    {} as Record<string, string>
  );

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await getLinks();
        const data = res.links || [];
        setLinks(
          Array.isArray(data) ? data.filter((l) => l.isActive !== false) : []
        );
      } catch (err) {
        console.error('Failed to fetch links:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shareRef.current &&
        !shareRef.current.contains(e.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadQR = () => {
    const canvas = document.getElementById(
      'preview-qr'
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkverse-${user?.username || 'profile'}-qr.png`;
    a.click();
    toast.success('QR code downloaded!');
  };

  const getButtonClasses = (style: string): string => {
    switch (style) {
      case 'rounded':
        return 'rounded-xl';
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'outline':
        return 'rounded-xl border-2';
      case 'shadow':
        return 'rounded-xl';
      default:
        return 'rounded-full';
    }
  };

  const getButtonInlineStyle = (style: string): React.CSSProperties => {
    if (style === 'outline') {
      return {
        fontFamily: theme.fontFamily,
        backgroundColor: 'transparent',
        color: theme.buttonColor,
        borderColor: theme.buttonColor,
      };
    }
    if (style === 'shadow') {
      return {
        fontFamily: theme.fontFamily,
        backgroundColor: theme.buttonColor,
        color: theme.buttonTextColor,
        boxShadow: `0 4px 14px ${theme.buttonColor}40`,
      };
    }
    return {
      fontFamily: theme.fontFamily,
      backgroundColor: theme.buttonColor,
      color: theme.buttonTextColor,
    };
  };

  const getBgStyle = (): React.CSSProperties => {
    if (theme.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(to bottom, ${theme.gradientFrom}, ${theme.gradientTo})`,
      };
    }
    if (theme.backgroundType === 'image' && theme.backgroundImage) {
      return {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: theme.backgroundColor };
  };

  const hasSocialLinks = Object.values(socialLinks).some(
    (v) => v && v.trim() !== ''
  );

  const renderProfile = () => (
    <div
      className="flex flex-col items-center w-full px-4 py-10"
      style={{
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Avatar */}
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.fullName}
          className="w-20 h-20 rounded-full object-cover ring-2 ring-white/40 shadow-lg"
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ring-2 ring-white/40"
          style={{
            backgroundColor: `${theme.buttonColor}25`,
            color: theme.buttonColor,
          }}
        >
          {getInitials(user?.fullName || 'U')}
        </div>
      )}

      <h2 className="mt-3 text-lg font-bold">
        {user?.fullName || 'Your Name'}
      </h2>
      <p className="text-sm opacity-60">@{user?.username || 'username'}</p>
      {user?.bio && (
        <p className="mt-2 text-sm text-center max-w-xs opacity-75 leading-relaxed">
          {user.bio}
        </p>
      )}

      {/* Social Icons */}
      {hasSocialLinks && (
        <SocialIconsRow socialLinks={socialLinks} theme={theme} />
      )}

      {/* Links */}
      <div className="mt-6 w-full max-w-xs space-y-3">
        {links.length > 0 ? (
          links.map((link, i) => (
            <div
              key={link._id || i}
              className={`w-full px-5 py-3 text-center font-medium text-sm transition-transform hover:scale-[1.02] ${getButtonClasses(theme.buttonStyle)}`}
              style={getButtonInlineStyle(theme.buttonStyle)}
            >
              {link.title}
            </div>
          ))
        ) : (
          <div className="text-center opacity-40 text-sm py-4">
            No links to preview
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Preview Your Page
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          See how your LinkVerse page looks to visitors
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mx-auto">
        {(['mobile', 'desktop'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === mode
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {mode === 'mobile' ? (
              <FiSmartphone className="w-4 h-4" />
            ) : (
              <FiMonitor className="w-4 h-4" />
            )}
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center">
        {viewMode === 'mobile' ? (
          <div className="relative">
            <div
              className="w-[300px] h-[620px] rounded-[2.5rem] border-10 border-gray-800 overflow-hidden bg-gray-800"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-10" />
              <div
                className="w-full h-full overflow-y-auto"
                style={getBgStyle()}
              >
                {renderProfile()}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="bg-gray-200 rounded-t-xl px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white rounded-lg px-3 py-1.5 text-xs text-gray-500 truncate font-mono">
                {profileUrl}
              </div>
            </div>
            <div
              className="border-x-2 border-b-2 border-gray-200 rounded-b-xl overflow-hidden min-h-[500px]"
              style={getBgStyle()}
            >
              {renderProfile()}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={`/${user?.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97]"
        >
          <FiExternalLink className="w-4 h-4" />
          Open My Page
        </a>

        <div className="relative" ref={shareRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <FiShare2 className="w-4 h-4" />
            Share
          </button>
          {showShareMenu && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-48 z-20">
              <button
                onClick={() => {
                  copyToClipboard(profileUrl);
                  setShowShareMenu(false);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiCopy className="w-4 h-4 text-gray-400" />
                Copy Link
              </button>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaWhatsapp className="w-4 h-4 text-green-500" />
                WhatsApp
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaXTwitter className="w-4 h-4" />
                Twitter
              </a>
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaTelegram className="w-4 h-4 text-blue-500" />
                Telegram
              </a>
            </div>
          )}
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xs mx-auto">
        <QRCodeCanvas
          id="preview-qr"
          value={profileUrl}
          size={150}
          bgColor="#ffffff"
          fgColor="#4f46e5"
          level="M"
        />
        <p className="text-sm font-medium text-gray-600">
          Scan to visit your page
        </p>
        <button
          onClick={handleDownloadQR}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
        >
          <FiDownload className="w-4 h-4" />
          Download QR Code
        </button>
      </div>
    </div>
  );
}