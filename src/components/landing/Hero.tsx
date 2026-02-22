import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube, FaSpotify, FaTwitter } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';

/* ─── Floating icon ─── */
function FloatingIcon({
  icon: Icon,
  color,
  delay,
  className,
}: {
  icon: React.ElementType;
  color: string;
  delay: number;
  className: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      className={`absolute ${className} hidden lg:flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${color}`}
    >
      <Icon className="w-5 h-5 text-white" />
    </motion.div>
  );
}

/* ─── Phone mockup ─── */
function PhonePreview() {
  const links = [
    { title: 'My Instagram', color: 'from-purple-500 to-pink-500' },
    { title: 'YouTube Channel', color: 'from-red-500 to-red-600' },
    { title: 'Shop My Looks', color: 'from-indigo-500 to-indigo-600' },
    { title: 'Blog Posts', color: 'from-emerald-500 to-teal-500' },
  ];

  const socials = [
    {
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      icon: FaInstagram,
    },
    { color: 'bg-red-500', icon: FaYoutube },
    { color: 'bg-sky-400', icon: FaTwitter },
  ];

  return (
    <div className="relative mx-auto w-[260px] h-[520px] sm:w-[280px] sm:h-[560px]">
      {/* Phone frame */}
      <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-900/30 border-[6px] border-gray-800 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="absolute inset-0 bg-linear-to-b from-indigo-50 via-white to-white overflow-hidden pt-10 px-4">
          <div className="flex flex-col items-center mt-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-16 h-16 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md"
            >
              P
            </motion.div>

            <h3 className="mt-3 font-bold text-gray-800 text-sm font-[Poppins]">
              Priya Sharma
            </h3>
            <p className="text-xs text-gray-500">@priya.fashion</p>
            <p className="text-[10px] text-gray-500 mt-1 text-center px-2 leading-relaxed">
              Fashion & lifestyle creator from Mumbai
            </p>

            {/* Social icons */}
            <div className="flex gap-2 mt-3">
              {socials.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`w-7 h-7 rounded-full ${s.color} flex items-center justify-center`}
                >
                  <s.icon className="w-3.5 h-3.5 text-white" />
                </motion.div>
              ))}
            </div>

            {/* Link buttons */}
            <div className="w-full space-y-2.5 mt-4 px-1">
              {links.map((link, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className={`w-full py-2.5 px-4 rounded-full bg-linear-to-r ${link.color} text-white text-xs font-medium text-center shadow-sm hover:shadow-md transition-shadow cursor-default`}
                >
                  {link.title}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12 md:pt-24 md:pb-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-72 h-72 md:w-md md:h-112 rounded-full bg-purple-200/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -left-20 w-72 h-72 md:w-md md:h-112 rounded-full bg-pink-200/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/4 w-48 h-48 md:w-72 md:h-72 rounded-full bg-indigo-200/20 blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                The Bio-Link Platform for Indian Creators
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-[Poppins] leading-[1.1] tracking-tight"
            >
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                One Link
              </span>
              <br />
              <span className="text-gray-900">For Everything!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Combine all your platforms — Instagram, YouTube, Moj, ShareChat,
              and 30+ more — into one beautiful, customizable page. Starting at
              just{' '}
              <span className="font-semibold text-gray-900">₹49/month</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-pink-500 rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Create Your Page
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/techraj"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 active:scale-[0.98] transition-all duration-200"
              >
                See Demo Profile
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start"
            >
              {[
                '30+ Platforms',
                'UPI Payments',
                'Custom Themes',
                'Made in India 🇮🇳',
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500"
                >
                  <svg
                    className="w-3.5 h-3.5 text-green-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative shrink-0 hidden md:block"
          >
            {/* Floating icons */}
            <FloatingIcon
              icon={FaInstagram}
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0}
              className="-left-10 top-20"
            />
            <FloatingIcon
              icon={FaYoutube}
              color="bg-red-500"
              delay={0.5}
              className="-right-8 top-36"
            />
            <FloatingIcon
              icon={FaSpotify}
              color="bg-green-500"
              delay={1}
              className="-left-6 bottom-36"
            />
            <FloatingIcon
              icon={FaTwitter}
              color="bg-sky-400"
              delay={1.5}
              className="-right-6 bottom-52"
            />

            {/* Glow behind phone */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl scale-110" />

            <PhonePreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}