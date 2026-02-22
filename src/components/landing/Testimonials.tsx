import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Fashion Creator',
    city: 'Mumbai',
    category: 'Fashion',
    gradient: 'from-pink-500 to-rose-500',
    quote:
      'LinkVerse has taken my Instagram bio to the next level! Everything is in one place — my YouTube, blog, and shopping links. My followers love it!',
    rating: 5,
  },
  {
    name: 'Raj Kumar',
    role: 'Tech Reviewer',
    city: 'Bangalore',
    category: 'Tech',
    gradient: 'from-blue-500 to-indigo-500',
    quote:
      'Finally a bio-link tool that understands Indian creators. Moj, ShareChat, everything is supported. The dark theme looks amazing on my page!',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    role: 'Beauty Creator',
    city: 'Ahmedabad',
    category: 'Beauty',
    gradient: 'from-purple-500 to-violet-500',
    quote:
      'Customizing my page was so easy. The preset themes are gorgeous and I love that I can match everything to my brand colors!',
    rating: 5,
  },
  {
    name: 'Amit Singh',
    role: 'Fitness Coach',
    city: 'Delhi',
    category: 'Fitness',
    gradient: 'from-green-500 to-emerald-500',
    quote:
      'My YouTube subscribers grew 20% after I started using LinkVerse. Best investment of just 49 rupees per month!',
    rating: 5,
  },
  {
    name: 'Neha Gupta',
    role: 'Food Blogger',
    city: 'Delhi',
    category: 'Food',
    gradient: 'from-orange-500 to-amber-500',
    quote:
      'As a food blogger, I need all my Zomato, Swiggy, and Instagram links in one place. LinkVerse does it perfectly and looks stunning!',
    rating: 5,
  },
  {
    name: 'Vikram Rao',
    role: 'Comedy Creator',
    city: 'Hyderabad',
    category: 'Comedy',
    gradient: 'from-amber-500 to-yellow-500',
    quote:
      'The analytics feature is fire! Now I know exactly which links my audience clicks the most. Super helpful for growing my comedy channel.',
    rating: 5,
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
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

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[Poppins]">
            Loved by Indian Creators
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of creators who trust LinkVerse to power their online
            presence
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <svg
                  className="w-8 h-8 text-indigo-200 group-hover:text-indigo-300 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5">
                {t.quote}
              </p>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <FaStar key={i} className="w-3.5 h-3.5 text-amber-400" />
                ))}
              </div>

              {/* Author */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-linear-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                  >
                    {getInitials(t.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {t.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">{t.role}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{t.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}