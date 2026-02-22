import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using LinkVerse, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of any changes.',
  },
  {
    id: 'accounts',
    title: '2. User Accounts',
    content:
      'You must provide accurate, complete, and current information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must be at least 13 years of age to use LinkVerse. You agree to notify us immediately of any unauthorized use of your account.',
  },
  {
    id: 'subscription',
    title: '3. Subscription and Payments',
    content:
      'LinkVerse Pro plan costs ₹49 per month or ₹499 per year. Payments are processed securely through Razorpay. The subscription is non-recurring — you must manually renew each period. Your Pro features remain active until the end of your billing period. All prices are inclusive of applicable GST. A GST invoice is generated for every payment.',
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use',
    content:
      'You agree not to use LinkVerse for any illegal, harmful, or fraudulent activities. Prohibited content includes but is not limited to: illegal content, spam, malware, phishing, harassment, hate speech, adult content involving minors, content that infringes on intellectual property rights, and any content that violates applicable Indian laws. We reserve the right to remove any content and suspend accounts that violate these guidelines.',
  },
  {
    id: 'ownership',
    title: '5. Content Ownership',
    content:
      'You retain full ownership of all content you create and share through LinkVerse, including your links, bio, profile information, and uploaded images. LinkVerse does not claim any intellectual property rights over your content. By using the platform, you grant LinkVerse a limited license to display your content as part of the service (e.g., rendering your public profile page).',
  },
  {
    id: 'availability',
    title: '6. Platform Availability',
    content:
      'We strive to maintain 99.9% uptime for all LinkVerse services. However, we do not guarantee uninterrupted or error-free service. We may occasionally perform maintenance, updates, or experience technical issues that temporarily affect availability. We will make reasonable efforts to notify users of planned downtime in advance.',
  },
  {
    id: 'termination',
    title: '7. Termination',
    content:
      'We may suspend or terminate your account if you violate these Terms and Conditions. Upon termination for policy violations, you may lose access to your account and all associated data. You may delete your own account at any time through the Account Settings page. Upon voluntary account deletion, your data will be permanently removed within 30 days.',
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content:
      'LinkVerse is provided on an "as is" and "as available" basis. To the maximum extent permitted by Indian law, LinkVerse and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the platform.',
  },
  {
    id: 'changes',
    title: '9. Changes to Terms',
    content:
      'We reserve the right to update or modify these Terms and Conditions at any time. When significant changes are made, we will notify users via email or through a prominent notice on the platform. The "Last updated" date at the top of this page will be revised accordingly. Your continued use of LinkVerse after changes constitutes acceptance of the updated terms.',
  },
  {
    id: 'governing-law',
    title: '10. Governing Law',
    content:
      'These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from or related to these terms or your use of LinkVerse shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.',
  },
];

export default function Terms() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = 'Terms & Conditions — LinkVerse';
    return () => {
      document.title = 'LinkVerse';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[Poppins]">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 sm:p-6 mb-10">
          <p className="text-amber-800 text-sm leading-relaxed">
            Please read these Terms and Conditions carefully before using
            LinkVerse. By accessing or using our platform, you agree to be bound
            by these terms. If you have questions, feel free to{' '}
            <Link
              to="/contact"
              className="text-amber-700 font-medium underline hover:no-underline"
            >
              contact us
            </Link>
            .
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 sm:p-6 mb-10">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Contents
          </h2>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline py-1 transition-colors text-left"
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 font-[Poppins] mb-3">
                {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}

          {/* Contact */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 font-[Poppins] mb-3">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms and Conditions, please
              contact us at{' '}
              <a
                href="mailto:legal@linkverse.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                legal@linkverse.com
              </a>{' '}
              or visit our{' '}
              <Link
                to="/contact"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-indigo-700 hover:scale-110 ${
          showTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <FiArrowUp className="w-4 h-4" />
      </button>

      <Footer />
    </div>
  );
}