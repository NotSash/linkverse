import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 — Page Not Found | LinkVerse';
    return () => {
      document.title = 'LinkVerse';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-8">
        <div className="text-center max-w-lg mx-auto">
          {/* Animated 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <span className="text-[120px] sm:text-[160px] font-bold font-[Poppins] bg-linear-to-br from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-none select-none">
                404
              </span>
              <motion.span
                animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-2 -right-6 text-4xl"
              >
                🔍
              </motion.span>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[Poppins] mb-3">
              Page not found
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
              Oops! The page you're looking for doesn't exist or may have been
              moved. Let's get you back on track.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
            >
              <FiHome className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-200 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </motion.div>

          {/* Floating decoration */}
          <motion.div
            className="mt-12 flex justify-center gap-4 text-3xl select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {['🔗', '🔍', '🌐'].map((emoji, i) => (
              <motion.span
                key={emoji}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>

          {/* Helpful links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-gray-100"
          >
            <p className="text-sm text-gray-400 mb-4">
              Here are some helpful links:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/contact', label: 'Contact' },
                { to: '/login', label: 'Login' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}