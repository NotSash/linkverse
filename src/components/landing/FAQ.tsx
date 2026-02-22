import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const FAQ_ITEMS = [
  {
    question: 'What is LinkVerse?',
    answer:
      'LinkVerse is a bio-link platform designed specifically for Indian creators and influencers. It lets you combine all your social media profiles, content platforms, and monetization links into one beautiful, customizable page that you can share everywhere.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'LinkVerse Pro costs just ₹49 per month or ₹499 per year. No hidden charges, no surprise fees. You can set up your page for free and subscribe when you are ready to publish it.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major Indian payment methods through Razorpay — UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking from all major banks, and mobile wallets.',
  },
  {
    question: 'Can I use my custom domain?',
    answer:
      'Not yet, but we are working on it! Custom domain support is coming soon. For now, your page will be available at linkverse.com/yourusername.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'You can sign up and set up your entire page for free — add links, customize your theme, write your bio, everything. You only need a Pro subscription (₹49/month) to publish your page and make it accessible to your audience.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, absolutely! You can cancel your subscription at any time. No questions asked, no cancellation fees. Your page will remain active until the end of your current billing period.',
  },
  {
    question: 'Do you support Indian platforms like Moj and ShareChat?',
    answer:
      'Yes! We support 30+ platforms including all major Indian ones — Moj, ShareChat, Josh, Chingari, Roposo, Koo, JioSaavn, Gaana, Wynk Music, and many more, alongside global platforms like Instagram, YouTube, and Spotify.',
  },
  {
    question: 'Will I get a GST invoice?',
    answer:
      'Yes, a proper GST invoice is automatically generated for every payment you make. You can download it from your billing page and use it for tax purposes or business expense claims.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Absolutely. We use industry-standard encryption for all data transmission (HTTPS/TLS). Passwords are hashed using bcrypt, and we never store your payment card details — all payments are securely processed by Razorpay.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach us through our contact form on the website, or email us directly at support@linkverse.com. We typically respond within 24 hours.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[Poppins]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Got questions? We've got answers.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="space-y-3"
        >
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`rounded-xl border transition-colors duration-200 ${
                  isOpen
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-base font-medium pr-4 transition-colors ${
                      isOpen
                        ? 'text-indigo-700'
                        : 'text-gray-900 group-hover:text-indigo-600'
                    }`}
                  >
                    {item.question}
                  </span>
                  <span
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? 'bg-indigo-100 text-indigo-600 rotate-180'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-5 pb-5 text-gray-600 leading-relaxed text-sm md:text-base">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 mb-3 text-sm">Still have questions?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors text-sm"
          >
            Contact our support team →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}