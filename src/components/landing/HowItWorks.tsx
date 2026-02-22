import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserPlus, FaLink, FaRocket } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';

const steps = [
  {
    number: 1,
    icon: FaUserPlus,
    title: 'Sign Up',
    description:
      'Create your free account in 30 seconds. Pick a unique username that becomes your personal URL.',
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    shadowColor: 'shadow-indigo-500/20',
  },
  {
    number: 2,
    icon: FaLink,
    title: 'Add Your Links',
    description:
      'Add links to all your platforms, customize your page with beautiful themes, colors, and fonts.',
    gradient: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    shadowColor: 'shadow-pink-500/20',
  },
  {
    number: 3,
    icon: FaRocket,
    title: 'Share Your LinkVerse',
    description:
      'Put your LinkVerse URL in every bio and start growing your audience across all platforms.',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    shadowColor: 'shadow-amber-500/20',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
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
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[Poppins]">
            Get Started in 3 Steps
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            From signup to sharing — it takes less than 5 minutes
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-[88px] left-[16.67%] right-[16.67%] h-px">
            <div className="w-full h-full border-t-2 border-dashed border-gray-200" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative"
          >
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={stepVariants}>
                {/* Mobile connector */}
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute left-1/2 -translate-x-1/2 h-8 w-px border-l-2 border-dashed border-gray-200" />
                )}

                <div className="flex flex-col items-center text-center group">
                  {/* Step number */}
                  <div
                    className={`relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-linear-to-br ${step.gradient} flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg ${step.shadowColor} group-hover:scale-110 transition-transform duration-300 mb-5 md:mb-6`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${step.bgColor} ${step.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 font-[Poppins] mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-14 md:mt-16"
        >
          <p className="text-gray-500 mb-5 text-sm">Ready to get started?</p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-linear-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base"
          >
            Create Your Page — It's Free
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}