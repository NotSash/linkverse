import { FiExternalLink } from 'react-icons/fi';
import { logClick } from '../../services/analyticsService';

interface LinkButtonProps {
  link: {
    _id: string;
    title: string;
    url: string;
    platform?: string;
    icon?: string;
  };
  theme: {
    buttonColor?: string;
    buttonTextColor?: string;
    buttonStyle?: string;
    fontFamily?: string;
  };
  username: string;
  isOwner: boolean;
}

export default function LinkButton({
  link,
  theme,
  username,
  isOwner,
}: LinkButtonProps) {
  const {
    buttonColor = '#6366f1',
    buttonTextColor = '#ffffff',
    buttonStyle = 'pill',
    fontFamily = 'Poppins',
  } = theme || {};

  const handleClick = () => {
    if (isOwner) return;

    // Use the service's logClick which handles sendBeacon internally
    logClick(username, link._id).catch(() => {});
  };

  const getButtonClasses = () => {
    switch (buttonStyle) {
      case 'rounded':
        return 'rounded-xl';
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'outline':
        return 'rounded-xl bg-transparent border-2';
      case 'shadow':
        return 'rounded-xl';
      default:
        return 'rounded-full';
    }
  };

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily,
      transition: 'all 0.2s ease',
    };

    if (buttonStyle === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        color: buttonColor,
        borderColor: buttonColor,
      };
    }

    if (buttonStyle === 'shadow') {
      return {
        ...base,
        backgroundColor: buttonColor,
        color: buttonTextColor,
        boxShadow: `0 4px 14px ${buttonColor}40`,
      };
    }

    return {
      ...base,
      backgroundColor: buttonColor,
      color: buttonTextColor,
    };
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`w-full max-w-md flex items-center justify-between px-5 py-3.5 font-medium text-sm sm:text-base hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] transition-all duration-200 ${getButtonClasses()}`}
      style={getButtonStyle()}
    >
      <span className="w-5" aria-hidden="true" />
      <span className="flex-1 text-center truncate px-2">{link.title}</span>
      <FiExternalLink className="w-4 h-4 shrink-0 opacity-60" />
    </a>
  );
}