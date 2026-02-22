import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaCreditCard, FaMobileAlt } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';

const PRO_FEATURES = [
  'Unlimited links',
  '30+ platform support',
  'Custom themes & appearance',
  'Detailed analytics dashboard',
  'SEO settings',
  'Priority support',
  'Custom OG image',
  'Remove LinkVerse branding',
  'GST invoice included',
];

const PAYMENT_METHODS = [
  { name: 'UPI', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Visa', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  {
    name: 'Mastercard',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  { name: 'RuPay', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Paytm', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  {
    name: 'PhonePe',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  { name: 'GPay', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  {
    name: 'Net Banking',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const price = isYearly ? 499 : 49;
  const period = isYearly ? 'year' : 'month';
  const perMonth = isYearly
    ? `₹${(499 / 12).toFixed(0)}/mo`
    : null;

  return (
    <section className="py-16 md:py-24 bg-gray-50/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[Poppins]">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            One plan, everything included. No hidden charges.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <span
            className={`text-sm font-medium transition-colors ${
              !isYearly ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Monthly
          </span>

          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              isYearly ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={isYearly}
            aria-label="Toggle yearly pricing"
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm ${
                isYearly ? 'left-[30px]' : 'left-0.5'
              }`}
            />
          </button>

          <span
            className={`text-sm font-medium transition-colors ${
              isYearly ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Yearly
          </span>

          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200"
            >
              Save ₹89!
            </motion.span>
          )}
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="relative bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border-2 border-indigo-500 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/15 transition-shadow duration-300">
            {/* Best Value Badge */}
            <div className="absolute top-0 left-0 right-0">
              <div className="bg-linear-to-r from-indigo-600 to-pink-500 text-white text-xs font-bold text-center py-1.5">
                ⭐ BEST VALUE — MOST POPULAR
              </div>
            </div>

            <div className="relative p-6 md:p-8 pt-12">
              {/* Plan name */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-[Poppins]">
                  Pro Plan
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Everything you need to grow
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl font-semibold text-gray-500">
                    ₹
                  </span>
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-bold text-gray-900 leading-none tabular-nums"
                  >
                    {price}
                  </motion.span>
                  <span className="text-lg text-gray-400 mb-1.5">
                    /{period}
                  </span>
                </div>

                {isYearly && perMonth && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 font-medium mt-2"
                  >
                    That's just {perMonth} — Save ₹89 per year!
                  </motion.p>
                )}
                {!isYearly && (
                  <p className="text-xs text-gray-400 mt-2">
                    Switch to yearly to save ₹89
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <FaCheck className="w-2.5 h-2.5 text-green-600" />
                    </span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-linear-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-base"
              >
                Start Now — ₹{price}/{period}
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <p className="text-center text-sm text-gray-400 mt-4">
                Less than a chai per day! ☕
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <FaCreditCard className="w-4 h-4" />
            <span>Pay securely via</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method.name}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${method.color}`}
              >
                {method.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <FaMobileAlt className="w-3 h-3" />
            <span>
              Powered by Razorpay — India's most trusted payment gateway
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}