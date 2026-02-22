import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import {
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';

const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#features', isHash: true },
    { label: 'Pricing', href: '#pricing', isHash: true },
    { label: 'Demo Profile', href: '/techraj', isHash: false },
  ],
  company: [
    { label: 'About', href: '/about', isHash: false },
    { label: 'Contact', href: '/contact', isHash: false },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/terms', isHash: false },
    { label: 'Privacy Policy', href: '/privacy', isHash: false },
    { label: 'Refund Policy', href: '/refund', isHash: false },
  ],
};

const SOCIAL_LINKS = [
  {
    icon: FaTwitter,
    href: '#',
    label: 'Twitter',
    hoverColor: 'hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/30',
  },
  {
    icon: FaInstagram,
    href: '#',
    label: 'Instagram',
    hoverColor: 'hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30',
  },
  {
    icon: FaLinkedinIn,
    href: '#',
    label: 'LinkedIn',
    hoverColor: 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30',
  },
  {
    icon: FaYoutube,
    href: '#',
    label: 'YouTube',
    hoverColor: 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30',
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  const handleHashClick = useCallback(
    (hash: string) => {
      const sectionId = hash.replace('#', '');

      if (isLanding) {
        const el = document.getElementById(sectionId);
        if (el) {
          const offset = 80;
          const top =
            el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } else {
        navigate('/' + hash);
      }
    },
    [isLanding, navigate]
  );

  const renderLink = (link: {
    label: string;
    href: string;
    isHash?: boolean;
  }) => {
    if (link.isHash) {
      return (
        <button
          key={link.label}
          onClick={() => handleHashClick(link.href)}
          className="text-sm text-gray-400 hover:text-white transition-colors duration-200 text-left"
        >
          {link.label}
        </button>
      );
    }

    return (
      <Link
        key={link.label}
        to={link.href}
        className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
      >
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand — wider on desktop */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">LV</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent font-[Poppins]">
                LinkVerse
              </span>
            </Link>

            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              One Link For Everything! The ultimate bio-link platform built for
              Indian creators and influencers.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2.5 mt-5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-9 h-9 rounded-xl border border-gray-700/50 bg-gray-800/50 flex items-center justify-center text-gray-500 transition-all duration-200 ${social.hoverColor}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="md:col-span-2 md:col-start-7">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider & Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              Made with{' '}
              <FiHeart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> in
              India 🇮🇳
            </p>
            <p className="text-sm text-gray-500">
              © {currentYear} LinkVerse. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}