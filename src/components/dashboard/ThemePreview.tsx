import { getInitials } from '../../utils/helpers';

interface ThemePreviewProps {
  theme: {
    backgroundColor?: string;
    cardColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    fontFamily?: string;
    buttonStyle?: string;
    backgroundType?: string;
    gradientFrom?: string;
    gradientTo?: string;
    backgroundImage?: string;
  };
  user: {
    fullName?: string;
    username?: string;
    bio?: string;
    profilePicture?: string;
  };
  links?: Array<{ title: string; platform?: string }>;
}

export default function ThemePreview({
  theme,
  user,
  links,
}: ThemePreviewProps) {
  const sampleLinks =
    links && links.length > 0
      ? links.slice(0, 4)
      : [
          { title: 'My YouTube Channel', platform: 'youtube_video' },
          { title: 'Follow me on Instagram', platform: 'instagram_post' },
          { title: 'Latest Blog Post', platform: 'blog' },
        ];

  const textColor = theme.textColor || '#111827';
  const buttonColor = theme.buttonColor || '#6366f1';
  const buttonTextColor = theme.buttonTextColor || '#ffffff';
  const fontFamily = theme.fontFamily || 'Poppins';

  const getBackgroundStyle = (): React.CSSProperties => {
    if (
      theme.backgroundType === 'gradient' &&
      theme.gradientFrom &&
      theme.gradientTo
    ) {
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
    return { backgroundColor: theme.backgroundColor || '#ffffff' };
  };

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      color: buttonTextColor,
      fontFamily,
    };

    if (theme.buttonStyle === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `2px solid ${buttonColor}`,
        color: buttonColor,
      };
    }

    return { ...base, backgroundColor: buttonColor };
  };

  const getButtonRadius = (): string => {
    switch (theme.buttonStyle) {
      case 'pill':
        return '9999px';
      case 'square':
        return '0px';
      case 'rounded':
      case 'shadow':
      case 'outline':
        return '12px';
      default:
        return '9999px';
    }
  };

  return (
    <div className="flex justify-center">
      {/* Phone Frame */}
      <div className="relative" style={{ width: '260px', height: '520px' }}>
        <div
          className="absolute inset-0 rounded-[2.5rem] border-10 border-gray-800 overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-800 rounded-b-xl z-10" />

          {/* Screen */}
          <div
            className="w-full h-full overflow-y-auto scrollbar-hide"
            style={{ ...getBackgroundStyle(), fontFamily }}
          >
            <div className="flex flex-col items-center pt-10 pb-6 px-4">
              {/* Profile Picture */}
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || ''}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-md"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/40 shadow-md"
                  style={{
                    backgroundColor: `${buttonColor}25`,
                    color: buttonColor,
                  }}
                >
                  {getInitials(user.fullName || 'U')}
                </div>
              )}

              {/* Name */}
              <h3
                className="mt-3 text-sm font-bold text-center"
                style={{ color: textColor }}
              >
                {user.fullName || 'Your Name'}
              </h3>

              {/* Username */}
              <p
                className="text-[11px] mt-0.5 opacity-60"
                style={{ color: textColor }}
              >
                @{user.username || 'username'}
              </p>

              {/* Bio */}
              {user.bio && (
                <p
                  className="text-[11px] mt-2 text-center leading-relaxed max-w-[200px] opacity-75"
                  style={{ color: textColor }}
                >
                  {user.bio.length > 80
                    ? user.bio.substring(0, 80) + '...'
                    : user.bio}
                </p>
              )}

              {/* Social Icons Placeholder */}
              <div className="flex gap-1.5 mt-3">
                {['IG', 'YT', 'X'].map((icon, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{
                      backgroundColor: theme.cardColor || '#f3f4f6',
                      color: textColor,
                      opacity: 0.7,
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>

              {/* Link Buttons */}
              <div className="w-full mt-4 space-y-2 px-1">
                {sampleLinks.map((link, i) => (
                  <div
                    key={i}
                    className="w-full px-4 py-2.5 text-center text-[11px] font-semibold transition-transform hover:scale-[1.02] cursor-default"
                    style={{
                      ...getButtonStyle(),
                      borderRadius: getButtonRadius(),
                      boxShadow:
                        theme.buttonStyle === 'shadow'
                          ? `0 4px 14px ${buttonColor}35`
                          : undefined,
                    }}
                  >
                    {link.title.length > 28
                      ? link.title.substring(0, 28) + '...'
                      : link.title}
                  </div>
                ))}
              </div>

              {/* Watermark preview */}
              <p
                className="mt-6 text-[8px] opacity-30"
                style={{ color: textColor }}
              >
                ⚡ Powered by LinkVerse
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}