import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { setPageMeta } from '@/utils/helpers';

const sections = [
  {
    title: '1. Subscription Cancellation',
    content:
      'You can cancel your LinkVerse Pro subscription at any time. When you cancel:\n\n• Your Pro features will remain active until the end of your current billing period.\n• Your public profile page will go offline after your subscription expires.\n• Your account data, links, theme settings, and analytics history will be preserved — nothing is deleted.\n• You can re-subscribe at any time to restore your page and access Pro features again.',
  },
  {
    title: '2. Refund Eligibility',
    content:
      'We offer refunds under the following conditions:\n\n• Within 7 Days: If you request a refund within 7 days of your payment and have not extensively used the Pro features, you are eligible for a full refund of ₹49.\n• After 7 Days: No refunds are issued for the current billing period after 7 days from the payment date.\n• Technical Issues: If you experience a persistent technical issue that prevents you from using the service and our team is unable to resolve it, you may be eligible for a refund regardless of the 7-day window.\n• Duplicate Payments: If you are charged more than once for the same billing period, the duplicate charge will be refunded immediately.',
  },
  {
    title: '3. How to Request a Refund',
    content:
      'To request a refund, please follow these steps:\n\n1. Send an email to refunds@linkverse.com from your registered email address.\n2. Include the following information:\n   • Your registered email address\n   • Your LinkVerse username\n   • Razorpay Payment ID (found in your Billing page under Payment History)\n   • Reason for the refund request\n3. Our team will review your request and respond within 2 business days.\n4. If approved, the refund will be processed within 5-7 business days.\n\nAlternatively, you can submit a refund request through our Contact page.',
  },
  {
    title: '4. Refund Processing',
    content:
      'Approved refunds are processed as follows:\n\n• Refunds are issued to the original payment method used for the transaction (UPI, credit/debit card, net banking, or wallet).\n• Refund processing is handled by Razorpay, our payment gateway partner.\n• Processing time depends on your payment method and bank:\n   • UPI: 2-5 business days\n   • Credit/Debit Cards: 5-10 business days\n   • Net Banking: 5-10 business days\n   • Wallets: 2-3 business days\n• You will receive an email confirmation once the refund has been initiated.\n• The refund amount will be ₹49 (the full monthly subscription amount).',
  },
  {
    title: '5. Non-Refundable Cases',
    content:
      'Refunds will NOT be issued in the following cases:\n\n• Subscription periods where more than 7 days have passed since payment.\n• Accounts that have been terminated or suspended due to policy violations or Terms of Service breaches.\n• Partial month usage — we do not offer prorated refunds for unused days within a billing period.\n• Requests made after account deletion, as we cannot verify the original payment.\n• Promotional or discounted subscriptions, unless otherwise stated in the promotion terms.',
  },
  {
    title: '6. Contact Us',
    content:
      'For any questions about our refund policy or to submit a refund request:\n\n• Email: refunds@linkverse.com\n• Response Time: Within 2 business days\n• You can also reach us through our Contact page for general inquiries.\n\nWe are committed to ensuring your satisfaction with LinkVerse. If you have any concerns about the service, please reach out to us before requesting a refund — we may be able to resolve your issue.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function Refund() {
  useEffect(() => {
    setPageMeta({
      title: 'Refund Policy — LinkVerse',
      description: 'LinkVerse refund and cancellation policy. Full refund within 7 days, cancel anytime.',
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-poppins mb-2">
            Refund Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2024</p>
        </motion.div>

        {/* Key Points Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 mb-10"
        >
          <h3 className="font-semibold text-amber-900 mb-3">Key Points</h3>
          <ul className="space-y-2.5 text-sm text-amber-800">
            {[
              { icon: '✅', text: 'Full refund available within 7 days of payment' },
              { icon: '✅', text: 'Cancel anytime — Pro features remain active until period ends' },
              { icon: '✅', text: 'Refund processed to original payment method in 2-10 business days' },
              { icon: '✅', text: 'Your data is never deleted when you cancel or get a refund' },
              { icon: '📧', text: 'Email refunds@linkverse.com to request a refund' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-200 text-center"
        >
          <p className="text-gray-600 mb-4">Have a question about refunds or billing?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}