import {
  FaInstagram, FaYoutube, FaFacebook, FaLinkedin, FaSnapchat,
  FaPinterest, FaTelegram, FaWhatsapp, FaDiscord, FaReddit,
  FaGithub, FaDribbble, FaBehance, FaMedium, FaSpotify, FaApple, FaQuora,
} from 'react-icons/fa';
import { FaThreads, FaXTwitter } from 'react-icons/fa6';
import { SiSubstack } from 'react-icons/si';
import { FiMusic, FiLink, FiHeadphones } from 'react-icons/fi';

interface SocialIconsRowProps {
  socialLinks: Record<string, string>;
  theme?: {
    textColor?: string;
    buttonColor?: string;
    cardColor?: string;
  };
}

const PLATFORM_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  instagram: { icon: FaInstagram, color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
  youtube: { icon: FaYoutube, color: 'bg-red-600' },
  twitter: { icon: FaXTwitter, color: 'bg-black' },
  facebook: { icon: FaFacebook, color: 'bg-blue-600' },
  linkedin: { icon: FaLinkedin, color: 'bg-blue-700' },
  snapchat: { icon: FaSnapchat, color: 'bg-yellow-400' },
  pinterest: { icon: FaPinterest, color: 'bg-red-700' },
  telegram: { icon: FaTelegram, color: 'bg-sky-500' },
  whatsapp: { icon: FaWhatsapp, color: 'bg-green-500' },
  discord: { icon: FaDiscord, color: 'bg-indigo-600' },
  reddit: { icon: FaReddit, color: 'bg-orange-600' },
  threads: { icon: FaThreads, color: 'bg-black' },
  github: { icon: FaGithub, color: 'bg-gray-800' },
  dribbble: { icon: FaDribbble, color: 'bg-pink-500' },
  behance: { icon: FaBehance, color: 'bg-blue-800' },
  medium: { icon: FaMedium, color: 'bg-gray-900' },
  substack: { icon: SiSubstack, color: 'bg-orange-500' },
  quora: { icon: FaQuora, color: 'bg-red-700' },
  spotify: { icon: FaSpotify, color: 'bg-green-600' },
  applemusic: { icon: FaApple, color: 'bg-pink-600' },
  jiosaavn: { icon: FiMusic, color: 'bg-green-700' },
  gaana: { icon: FiHeadphones, color: 'bg-orange-600' },
  wynkmusic: { icon: FiMusic, color: 'bg-blue-500' },
  hungama: { icon: FiMusic, color: 'bg-yellow-600' },
  moj: { icon: FiLink, color: 'bg-pink-600' },
  sharechat: { icon: FiLink, color: 'bg-blue-500' },
  joshapp: { icon: FiLink, color: 'bg-red-500' },
  chingari: { icon: FiLink, color: 'bg-orange-500' },
  roposo: { icon: FiLink, color: 'bg-purple-600' },
  koo: { icon: FiLink, color: 'bg-yellow-500' },
};

export default function SocialIconsRow({ socialLinks }: SocialIconsRowProps) {
  const filledLinks = Object.entries(socialLinks || {}).filter(
    ([key, value]) =>
      key !== '_id' && value && typeof value === 'string' && value.trim() !== ''
  );

  if (filledLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-4">
      {filledLinks.map(([platform, url]) => {
        const config = PLATFORM_CONFIG[platform];
        if (!config) return null;

        const IconComponent = config.icon;
        const href = url.startsWith('http') ? url : `https://${url}`;
        const label =
          platform.charAt(0).toUpperCase() + platform.slice(1);

        return (
          <a
            key={platform}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${config.color} shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200`}
            title={label}
            aria-label={`Visit ${label}`}
          >
            <IconComponent className="w-[18px] h-[18px]" />
          </a>
        );
      })}
    </div>
  );
}