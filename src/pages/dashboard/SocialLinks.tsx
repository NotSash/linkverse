import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiLink, FiZap, FiAlertCircle } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import {
  FaVideo,
  FaComments,
  FaPlay,
  FaFire,
  FaCamera,
  FaComment,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaSnapchat,
  FaPinterest,
  FaAtlas,
  FaReddit,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSpotify,
  FaApple,
  FaMusic,
  FaGithub,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaQuora,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  getSocialLinks,
  updateSocialLinks,
} from '../../services/linkService';
import { SOCIAL_PLATFORMS } from '../../utils/constants';

// Map icon string names to React icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FaVideo,
  FaComments,
  FaPlay,
  FaFire,
  FaCamera,
  FaComment,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaSnapchat,
  FaPinterest,
  FaAtlas,
  FaReddit,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSpotify,
  FaApple,
  FaMusic,
  FaGithub,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaQuora,
};

const PLATFORM_GROUPS = [
  {
    key: 'global',
    title: '🌍 Global Social Media',
    platforms: SOCIAL_PLATFORMS.global,
  },
  {
    key: 'indian',
    title: '🇮🇳 Indian Platforms',
    platforms: SOCIAL_PLATFORMS.indian,
  },
  {
    key: 'messaging',
    title: '💬 Messaging',
    platforms: SOCIAL_PLATFORMS.messaging,
  },
  { key: 'music', title: '🎵 Music', platforms: SOCIAL_PLATFORMS.music },
  {
    key: 'professional',
    title: '💼 Professional & Creative',
    platforms: SOCIAL_PLATFORMS.professional,
  },
];

function renderIcon(iconName?: string) {
  if (!iconName) return <FiLink className="w-4 h-4" />;
  const IconComponent = ICON_MAP[iconName];
  return IconComponent ? (
    <IconComponent className="w-4 h-4" />
  ) : (
    <FiLink className="w-4 h-4" />
  );
}

export default function SocialLinks() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [maxPlatforms, setMaxPlatforms] = useState(3);

  const fetchSocialLinks = useCallback(async () => {
    try {
      const res = await getSocialLinks();
      const links = res.socialLinks || {};
      const plainLinks =
        typeof links.toObject === 'function' ? links.toObject() : links;
      setFormData(plainLinks);
      setOriginalData(plainLinks);
      setIsPro(res.isPro || false);
      setMaxPlatforms(res.maxPlatforms || 3);
    } catch (err) {
      console.error('Failed to fetch social links:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getFilledCount = (
    platforms?: Array<{ key: string }>,
    data?: Record<string, string>
  ): number => {
    const source = data || formData;
    if (platforms) {
      return platforms.filter((p) => source[p.key]?.trim()).length;
    }
    // Total across all platforms
    return Object.values(source).filter(
      (v) => typeof v === 'string' && v.trim()
    ).length;
  };

  const totalFilled = getFilledCount();
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleSave = async () => {
    // Check limit before saving
    if (!isPro && totalFilled > maxPlatforms) {
      toast.error(
        `Free plan allows only ${maxPlatforms} social platforms. Remove some or upgrade to Pro.`
      );
      return;
    }

    setSaving(true);
    try {
      // Send ALL values including empty strings — so backend can clear removed links
      const dataToSend: Record<string, string> = {};
      const allPlatformKeys = PLATFORM_GROUPS.flatMap((g) =>
        g.platforms.map((p: any) => p.key)
      );

      for (const key of allPlatformKeys) {
        dataToSend[key] = formData[key]?.trim() || '';
      }

      await updateSocialLinks(dataToSend);
      setOriginalData({ ...formData });
      toast.success('Social links updated!');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to update social links'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <div className="h-7 bg-gray-200 rounded-lg w-40 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-64 animate-pulse mt-2" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="h-5 bg-gray-200 rounded w-36 animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-10 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Social Links
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add your social media profiles. These appear as icons on your public
          page.
        </p>
      </div>

      {/* Usage indicator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiLink className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {totalFilled} / {maxPlatforms} platform
              {maxPlatforms !== 1 ? 's' : ''} used
            </span>
          </div>
          {!isPro && totalFilled >= maxPlatforms && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
              <FiZap className="w-3.5 h-3.5" />
              Upgrade for unlimited
            </div>
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              totalFilled >= maxPlatforms
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            style={{
              width: `${Math.min((totalFilled / maxPlatforms) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Platform Groups */}
      {PLATFORM_GROUPS.map((group) => (
        <div
          key={group.key}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              {group.title}
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              {getFilledCount(group.platforms)}/{group.platforms.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.platforms.map((platform: any) => {
              const isFilled = !!formData[platform.key]?.trim();
              const isOverLimit =
                !isPro &&
                !isFilled &&
                totalFilled >= maxPlatforms;

              return (
                <div key={platform.key} className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    {platform.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                      {renderIcon(platform.icon)}
                    </span>
                    <input
                      type="text"
                      value={formData[platform.key] || ''}
                      onChange={(e) =>
                        handleChange(platform.key, e.target.value)
                      }
                      placeholder={
                        platform.placeholder ||
                        `Your ${platform.label} URL`
                      }
                      disabled={isOverLimit}
                      className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        isOverLimit
                          ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : isFilled
                            ? 'border-green-200 bg-green-50/30'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {isFilled && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <FiCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  {platform.key === 'whatsapp' && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      Enter 10-digit number (without +91)
                    </p>
                  )}
                  {isOverLimit && (
                    <p className="text-[10px] text-amber-500 font-medium">
                      Upgrade to Pro to add more
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sticky Save Button */}
      <div className="sticky bottom-20 sm:bottom-4 z-10">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
            hasChanges
              ? 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white active:scale-[0.97]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          } disabled:opacity-60`}
        >
          {saving ? (
            <ImSpinner8 className="w-4 h-4 animate-spin" />
          ) : (
            <FiCheck className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : hasChanges ? 'Save Social Links' : 'No Changes'}
        </button>
      </div>
    </div>
  );
}