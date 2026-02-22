import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import SocialIconsRow from '../components/public/SocialIconsRow';
import LinkButton from '../components/public/LinkButton';
import { getPublicProfile, logView } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import {
  getInitials,
  getCategoryEmoji,
  setPageMeta,
} from '../utils/helpers';

type PageState = 'loading' | 'not-found' | 'coming-soon' | 'profile';

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: authUser } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [watermark, setWatermark] = useState<boolean>(false);
  const [pageState, setPageState] = useState<PageState>('loading');
  const viewLogged = useRef(false);

  const isOwner = authUser?.username === username;

  useEffect(() => {
    if (!username) return;

    async function fetchProfile() {
      try {
        const response = await getPublicProfile(username!);

        if (!response || response.exists === false) {
          setPageState('not-found');
          return;
        }

        const profile = response.data;
        setWatermark(response.watermark?.enabled === true);

        if (response.comingSoon) {
          setProfileData(profile);
          setPageState('coming-soon');
          return;
        }

        setProfileData(profile);
        setPageState('profile');

        // Set SEO meta tags
        setPageMeta({
          title:
            profile.seoSettings?.metaTitle ||
            `${profile.fullName} | LinkVerse`,
          description:
            profile.seoSettings?.metaDescription ||
            profile.bio ||
            `Check out ${profile.fullName}'s LinkVerse page`,
          ogTitle:
            profile.seoSettings?.metaTitle ||
            `${profile.fullName} | LinkVerse`,
          ogDescription:
            profile.seoSettings?.metaDescription ||
            profile.bio ||
            undefined,
          ogImage:
            profile.seoSettings?.ogImage ||
            profile.profilePicture ||
            undefined,
          ogUrl: `https://linkverse.com/${profile.username}`,
          canonical: `https://linkverse.com/${profile.username}`,
        });
      } catch (err: any) {
        console.error('Public profile fetch error:', err);
        if (err?.response?.status === 404) {
          setPageState('not-found');
        } else {
          setPageState('not-found');
        }
      }
    }

    fetchProfile();
  }, [username]);

  // Log view once (skip for owner and coming-soon)
  useEffect(() => {
    if (
      pageState === 'profile' &&
      profileData &&
      !isOwner &&
      !viewLogged.current &&
      username
    ) {
      viewLogged.current = true;
      const referrer = document.referrer || undefined;
      logView(username, referrer).catch(() => {});
    }
  }, [pageState, profileData, isOwner, username]);

  // ── LOADING ──
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mx-auto" />
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="space-y-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-full max-w-xs bg-gray-200 rounded-full animate-pulse mx-auto"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── NOT FOUND ──
  if (pageState === 'not-found') {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page not found
          </h1>
          <p className="text-gray-500 mb-6">
            The username{' '}
            <span className="font-mono font-semibold text-indigo-600">
              @{username}
            </span>{' '}
            hasn&apos;t been claimed yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-sm transition-colors"
            >
              Go Home
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Claim this username
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── COMING SOON ──
  if (pageState === 'coming-soon' && profileData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          {profileData.profilePicture ? (
            <img
              src={profileData.profilePicture}
              alt={profileData.fullName}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-2xl font-bold mx-auto mb-4 ring-4 ring-white shadow-lg">
              {getInitials(profileData.fullName || 'U')}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {profileData.fullName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            @{profileData.username}
          </p>
          {profileData.category && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 font-medium">
              <span>{getCategoryEmoji(profileData.category)}</span>
              <span>{profileData.category}</span>
            </div>
          )}
          <div className="mt-5 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-full text-sm font-semibold">
            🚀 Coming Soon
          </div>
          <p className="text-gray-400 text-sm mt-4">
            This page will be live soon! ✨
          </p>
        </div>

        {/* Watermark */}
        {watermark && (
          <div className="mt-12">
            <Link
              to="/"
              className="text-xs font-medium text-gray-400 hover:text-indigo-500 transition-colors"
            >
              ⚡ Powered by LinkVerse
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── FULL PROFILE ──
  if (pageState !== 'profile' || !profileData) return null;

  const theme = profileData.theme || {};
  const textColor = theme.textColor || '#111827';
  const fontFamily = theme.fontFamily || 'Poppins';

  const getBackgroundStyle = (): React.CSSProperties => {
    if (theme.backgroundType === 'gradient' && theme.gradientFrom && theme.gradientTo) {
      return {
        background: `linear-gradient(to bottom, ${theme.gradientFrom}, ${theme.gradientTo})`,
      };
    }
    if (theme.backgroundType === 'image' && theme.backgroundImage) {
      return {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { backgroundColor: theme.backgroundColor || '#ffffff' };
  };

  const links = (profileData.links || [])
    .filter((l: any) => l.isActive !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const socialLinks = profileData.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some(
    (v: any) => v && typeof v === 'string' && v.trim() !== ''
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center py-10 sm:py-14 px-4"
      style={{ ...getBackgroundStyle(), fontFamily }}
    >
      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
        {/* Profile Picture */}
        {profileData.profilePicture ? (
          <img
            src={profileData.profilePicture}
            alt={profileData.fullName}
            className="w-24 h-24 rounded-full object-cover ring-3 ring-white/40 shadow-xl"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ring-3 ring-white/40 shadow-xl"
            style={{
              backgroundColor: `${theme.buttonColor || '#6366f1'}25`,
              color: theme.buttonColor || '#6366f1',
            }}
          >
            {getInitials(profileData.fullName || 'U')}
          </div>
        )}

        {/* Name */}
        <h1
          className="mt-4 text-xl font-bold text-center"
          style={{ color: textColor }}
        >
          {profileData.fullName}
        </h1>

        {/* Username */}
        <p
          className="text-sm mt-0.5 text-center"
          style={{ color: textColor, opacity: 0.6 }}
        >
          @{profileData.username}
        </p>

        {/* Bio */}
        {profileData.bio && (
          <p
            className="mt-3 text-sm text-center max-w-xs leading-relaxed"
            style={{ color: textColor, opacity: 0.8 }}
          >
            {profileData.bio}
          </p>
        )}

        {/* Category Badge */}
        {profileData.category && (
          <div
            className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${theme.buttonColor || '#6366f1'}18`,
              color: theme.buttonColor || '#6366f1',
            }}
          >
            <span>{getCategoryEmoji(profileData.category)}</span>
            <span>{profileData.category}</span>
          </div>
        )}

        {/* Location */}
        {(profileData.city || profileData.state) && (
          <p
            className="mt-1.5 text-xs text-center"
            style={{ color: textColor, opacity: 0.5 }}
          >
            📍 {[profileData.city, profileData.state].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Social Icons */}
        {hasSocialLinks && (
          <SocialIconsRow socialLinks={socialLinks} theme={theme} />
        )}

        {/* Links */}
        {links.length > 0 ? (
          <div className="mt-6 w-full flex flex-col items-center gap-3">
            {links.map((link: any) => (
              <LinkButton
                key={link._id}
                link={link}
                theme={theme}
                username={username!}
                isOwner={isOwner}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p
              className="text-sm"
              style={{ color: textColor, opacity: 0.4 }}
            >
              No links yet ✨
            </p>
          </div>
        )}

        {/* Watermark for free users */}
        {watermark && (
          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-medium opacity-50 hover:opacity-80 transition-opacity px-3 py-1.5 rounded-full"
              style={{
                color: textColor,
                backgroundColor: `${textColor}08`,
              }}
            >
              ⚡ Powered by LinkVerse
            </Link>
          </div>
        )}

        {/* Subtle footer for pro users */}
        {!watermark && (
          <div className="mt-10">
            <Link
              to="/"
              className="text-xs font-medium opacity-30 hover:opacity-50 transition-opacity"
              style={{ color: textColor }}
            >
              Made with ❤️ on LinkVerse
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}