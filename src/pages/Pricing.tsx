import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiChevronDown } from 'react-icons/fi';
import { HiArrowRight } from 'react-icons/hi';
import { FaCreditCard, FaMobileAlt } from 'react-icons/fa';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

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

const COMPARISON = [
  { feature: 'Public Profile Page', free: false, pro: true },
  { feature: 'Add Links', free: 'Setup only', pro: 'Unlimited' },
  {
    feature: 'Custom Themes',
    free: 'Default only',
    pro: 'Full customization',
  },
  { feature: 'Analytics Dashboard', free: false, pro: true },
  { feature: 'SEO Settings', free: false, pro: true },
  { feature: 'Social Media Icons', free: false, pro: true },
  { feature: 'LinkVerse Branding Removed', free: false, pro: true },
  { feature: 'Priority Support', free: false, pro: true },
  { feature: 'GST Invoice', free: false, pro: true },
];

const BILLING_FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. Your Pro features will remain active until the end of your current billing period. No questions asked.',
  },
  {
    q: 'Do you offer refunds?',
    a: "Yes, we offer refunds within 7 days of payment if you haven't extensively used the Pro features. After 7 days, no refunds are issued for the current billing period. Email refunds@linkverse.com to request.",
  },
  {
    q: "Will my page go offline if I don't renew?",
    a: 'Yes, your public profile page will become unavailable if your subscription expires. However, your data (links, settings, analytics) will be safely preserved. Simply renew to get your page back online instantly.',
  },
  {
    q: 'Do you offer annual plans?',
    a: 'Yes! We offer a yearly plan at ₹499/year, which saves you ₹89 compared to paying monthly. Toggle the switch above to see the yearly pricing.',
  },
];

const PAYMENT_METHODS = [
  {
    name: 'UPI (GPay, PhonePe, Paytm)',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  { name: 'Visa', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  {
    name: 'Mastercard',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  { name: 'RuPay', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Net Banking', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  {
    name: 'Wallets',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    document.title = 'Pricing — LinkVerse';
    return () => {
      document.title = 'LinkVerse';
    };
  }, []);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  const price = isYearly ? 499 : 49;
  const period = isYearly ? 'year' : 'month';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-12"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 mb-5">
            Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-[Poppins] mb-4">
            <span className="bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One plan, everything you need. No hidden charges, no surprises.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
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
        </div>

        {/* Pricing Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-md mx-auto mb-20"
        >
          <div className="relative bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border-2 border-indigo-500 overflow-hidden">
            {/* Top badge */}
            <div className="bg-linear-to-r from-indigo-600 to-pink-500 text-white text-xs font-bold text-center py-1.5">
              ⭐ BEST VALUE — MOST POPULAR
            </div>

            <div className="relative p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-[Poppins]">
                  Pro Plan
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Everything you need to grow
                </p>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl font-semibold text-gray-500">
                    ₹
                  </span>
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-gray-900 leading-none tabular-nums"
                  >
                    {price}
                  </motion.span>
                  <span className="text-lg text-gray-400 mb-1">
                    /{period}
                  </span>
                </div>
                {isYearly && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 font-medium mt-2"
                  >
                    Just ₹{Math.round(499 / 12)}/month — Save ₹89!
                  </motion.p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <FiCheck className="w-3 h-3 text-green-600" />
                    </span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2 w-full py-3.5 bg-linear-to-r from-indigo-600 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
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

        {/* Comparison Table */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mb-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 font-[Poppins] mb-8">
            Free vs Pro
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 min-w-[400px]">
              <div className="p-4 font-semibold text-gray-700 text-sm">
                Feature
              </div>
              <div className="p-4 font-semibold text-gray-500 text-center text-sm">
                Free
              </div>
              <div className="p-4 font-semibold text-center text-sm">
                <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  Pro
                </span>
              </div>
            </div>

            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 border-b border-gray-100 last:border-0 min-w-[400px] ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="p-4 text-sm text-gray-700">{row.feature}</div>
                <div className="p-4 flex items-center justify-center">
                  {row.free === false ? (
                    <FiX className="w-4 h-4 text-red-400" />
                  ) : row.free === true ? (
                    <FiCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-gray-500 text-center">
                      {row.free}
                    </span>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center">
                  {row.pro === true ? (
                    <FiCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-indigo-600 font-medium text-center">
                      {row.pro}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-5">
            <FaCreditCard className="w-4 h-4" />
            <span>We accept all major payment methods</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method.name}
                className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-medium border ${method.color}`}
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

        {/* Billing FAQs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 font-[Poppins] mb-8">
            Billing FAQ
          </h2>

          <div className="space-y-3">
            {BILLING_FAQS.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-indigo-200 bg-indigo-50/30'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`font-medium pr-4 text-sm transition-colors ${
                        isOpen
                          ? 'text-indigo-700'
                          : 'text-gray-900 group-hover:text-indigo-600'
                      }`}
                    >
                      {faq.q}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 text-indigo-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'max-h-[300px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] mb-4">
            Ready to grow your audience?
          </h2>
          <p className="text-indigo-100 mb-7 max-w-lg mx-auto">
            Join thousands of Indian creators who use LinkVerse to power their
            online presence.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 hover:shadow-lg transition-all duration-200"
          >
            Get Started — It's Free
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}