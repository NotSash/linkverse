import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const SECTION_IDS = ['hero', 'features', 'pricing'];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  /* ── Scroll tracking ── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Active section tracking via IntersectionObserver ── */
  useEffect(() => {
    if (!isLandingPage) return;

    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isLandingPage]);

  /* ── Close mobile on route change ── */
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleNavClick = useCallback(
    (href: string) => {
      setIsMobileOpen(false);

      if (href.startsWith('#')) {
        if (isLandingPage) {
          const el = document.querySelector(href);
          if (el) {
            const offset = 80;
            const top =
              el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        } else {
          navigate('/' + href);
        }
      }
    },
    [isLandingPage, navigate]
  );

  const isActiveHash = (href: string) => {
    if (!href.startsWith('#')) return false;
    return activeSection === href.replace('#', '');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm shadow-gray-200/50 border-b border-gray-100/80'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 to-pink-500 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <span className="text-white font-bold text-sm">LV</span>
              </div>
              <span className="text-xl font-bold font-[Poppins] bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                LinkVerse
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isHash = link.href.startsWith('#');
                const isActive = isHash
                  ? isActiveHash(link.href)
                  : location.pathname === link.href;

                if (isHash) {
                  return (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.href)}
                      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 rounded-full"
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-pink-500 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">LV</span>
                  </div>
                  <span className="text-lg font-bold font-[Poppins] bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                    LinkVerse
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close menu"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
                {NAV_LINKS.map((link, i) => {
                  const isHash = link.href.startsWith('#');

                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                    >
                      {isHash ? (
                        <button
                          onClick={() => handleNavClick(link.href)}
                          className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="block px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer CTA */}
              <div className="p-4 border-t border-gray-100 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-pink-500 rounded-xl hover:shadow-lg transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}