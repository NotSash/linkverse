import { motion } from 'framer-motion';

const features = [
  {
    emoji: '🔗',
    title: '30+ Platform Support',
    description:
      'Instagram, YouTube, Moj, ShareChat, Josh, Chingari, Roposo, JioSaavn, and many more Indian & global platforms.',
    gradient: 'from-blue-50 to-indigo-50',
    border: 'hover:border-indigo-200',
  },
  {
    emoji: '🎨',
    title: 'Beautiful Themes',
    description:
      'Customize colors, fonts, button styles, gradients, and background images to match your brand perfectly.',
    gradient: 'from-pink-50 to-rose-50',
    border: 'hover:border-pink-200',
  },
  {
    emoji: '📊',
    title: 'Detailed Analytics',
    description:
      'Track page views, link clicks, top performing links, visitor locations, and more with real-time insights.',
    gradient: 'from-purple-50 to-violet-50',
    border: 'hover:border-purple-200',
  },
  {
    emoji: '⚡',
    title: 'Lightning Fast',
    description:
      'Pages load in under 1 second. No lag, no waiting. Your audience stays engaged and clicks through.',
    gradient: 'from-amber-50 to-yellow-50',
    border: 'hover:border-amber-200',
  },
  {
    emoji: '📱',
    title: 'Mobile-First Design',
    description:
      'Perfectly optimized for mobile — because 95% of your audience is browsing on their phone.',
    gradient: 'from-green-50 to-emerald-50',
    border: 'hover:border-green-200',
  },
  {
    emoji: '🇮🇳',
    title: 'Made for India',
    description:
      'Supports Indian platforms, UPI payments, and designed specifically for Indian content creators.',
    gradient: 'from-orange-50 to-amber-50',
    border: 'hover:border-orange-200',
  },
  {
    emoji: '🔒',
    title: 'Secure & Reliable',
    description:
      'Your data is encrypted and your page is always online. Enterprise-grade security at creator-friendly pricing.',
    gradient: 'from-teal-50 to-cyan-50',
    border: 'hover:border-teal-200',
  },
  {
    emoji: '🧾',
    title: 'GST Invoice',
    description:
      'Get proper GST invoices for every payment. Claim it as a business expense for your creator venture.',
    gradient: 'from-gray-50 to-slate-50',
    border: 'hover:border-gray-300',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

export default function Features() {
  return (
    <section className="py-16 md:py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[Poppins] text-gray-900">
            Everything You Need
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            All the tools to stand out and grow your audience — in one simple
            platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`group relative bg-white rounded-2xl p-5 md:p-6 border border-gray-100 ${feature.border} shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              {/* Subtle gradient background on hover */}
              <div
                className={`absolute inset-0 rounded-2xl bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {feature.emoji}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 font-[Poppins] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}