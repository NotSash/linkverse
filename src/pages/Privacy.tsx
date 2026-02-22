import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const SECTIONS = [
  {
    id: 'info-collect',
    title: '1. Information We Collect',
    paragraphs: [
      'We collect the following types of information when you use LinkVerse:',
      '• Personal Information: Full name, email address, phone number, username, profile picture, bio, city, and state that you provide during registration and profile setup.',
      '• Account Data: Your links, social media handles, theme preferences, and SEO settings.',
      '• Payment Information: Payment transactions are processed securely through Razorpay. We store transaction IDs, payment status, and invoice details. We do NOT store your credit card numbers, UPI PINs, or banking passwords.',
      '• Usage Data: Page views, link clicks, timestamps, and approximate visitor locations (derived from IP addresses) for your analytics dashboard.',
      '• Device Information: Browser type, device type, and operating system for service optimization.',
    ],
  },
  {
    id: 'how-use',
    title: '2. How We Use Your Information',
    paragraphs: [
      'We use the information we collect to:',
      '• Provide, maintain, and improve the LinkVerse platform and services.',
      '• Process payments and generate GST invoices.',
      '• Send service-related emails (verification, password reset, payment confirmation, subscription reminders).',
      '• Provide analytics data about your public profile page performance.',
      '• Respond to support requests and contact form submissions.',
      '• Detect and prevent fraud, abuse, and security threats.',
      '• Comply with legal obligations under Indian law.',
    ],
  },
  {
    id: 'data-storage',
    title: '3. Data Storage and Security',
    paragraphs: [
      'Your data is stored securely on MongoDB Atlas cloud infrastructure. We implement industry-standard security measures including:',
      '• All data is encrypted in transit using HTTPS/TLS.',
      '• Passwords are hashed using bcrypt with a cost factor of 12 — we never store plain-text passwords.',
      '• JWT tokens are used for authentication with expiration policies.',
      '• Access to production databases is restricted and monitored.',
      '• Regular security reviews and updates are performed.',
      '• File uploads (profile pictures, images) are stored on Cloudinary with secure access controls.',
    ],
  },
  {
    id: 'third-party',
    title: '4. Third-Party Services',
    paragraphs: [
      'We use the following third-party services to operate LinkVerse:',
      '• Razorpay — For processing payments (UPI, cards, net banking, wallets). Razorpay has its own privacy policy and is PCI-DSS compliant.',
      '• Cloudinary — For storing and serving images (profile pictures, background images, OG images).',
      '• ip-api.com — For approximate geolocation (city/state only) from visitor IP addresses for analytics purposes. No personal data is sent.',
      "• Google Translate — Optional widget for language translation. Subject to Google's privacy policy.",
      '• SMTP Email Service — For sending transactional emails.',
    ],
  },
  {
    id: 'cookies',
    title: '5. Cookies and Local Storage',
    paragraphs: [
      'LinkVerse uses minimal cookies and browser storage:',
      "• Authentication Token: We store a JWT authentication token in your browser's localStorage to keep you logged in. This token expires after 7 days.",
      '• Theme Preference: Your dashboard light/dark mode preference is stored in localStorage.',
      '• We do NOT use advertising cookies or third-party tracking cookies.',
      '• We do NOT sell your data to advertisers or data brokers.',
    ],
  },
  {
    id: 'analytics',
    title: '6. Analytics on Public Pages',
    paragraphs: [
      'When visitors view your public LinkVerse profile page, we collect anonymous analytics data:',
      '• Page view counts and timestamps.',
      '• Link click counts.',
      '• Approximate visitor city and state (derived from IP address — we do NOT store full IP addresses).',
      '• Referrer domain (which website or app the visitor came from).',
      'This data is aggregated and anonymized. We do not track individual visitors, install tracking pixels, or collect personal information from your page visitors.',
    ],
  },
  {
    id: 'rights',
    title: '7. Your Rights',
    paragraphs: [
      'You have full control over your personal data on LinkVerse:',
      '• Access: You can view all your personal data through your Dashboard and Settings pages.',
      '• Update: You can update your profile information, links, and settings at any time.',
      '• Export: You can download all your data as a JSON file using the "Export Data" feature in Account Settings.',
      '• Delete: You can permanently delete your account and all associated data using the "Delete Account" feature.',
      '• Opt-out: You can unsubscribe from non-essential emails at any time.',
      'To exercise any of these rights, use the features available in your dashboard or contact us at privacy@linkverse.com.',
    ],
  },
  {
    id: 'retention',
    title: '8. Data Retention',
    paragraphs: [
      'We retain your data as follows:',
      '• Active Accounts: Your data is retained as long as your account is active.',
      '• Deleted Accounts: When you delete your account, all personal data, links, analytics, and payment records are permanently removed within 30 days.',
      '• Payment Records: Transaction records may be retained for up to 7 years as required by Indian tax and financial regulations.',
      '• Support Tickets: Contact form submissions are retained for 1 year after resolution for quality assurance purposes.',
    ],
  },
  {
    id: 'children',
    title: "9. Children's Privacy",
    paragraphs: [
      'LinkVerse is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete that information promptly.',
      'If you believe a child under 13 has provided us with personal information, please contact us at privacy@linkverse.com.',
    ],
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When significant changes are made, we will:',
      '• Update the "Last updated" date at the top of this page.',
      '• Send an email notification to all registered users.',
      '• Display a prominent notice on the platform.',
      'Your continued use of LinkVerse after changes constitutes acceptance of the updated Privacy Policy.',
    ],
  },
];

export default function Privacy() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = 'Privacy Policy — LinkVerse';
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 mb-10">
          <p className="text-indigo-800 text-sm leading-relaxed">
            At LinkVerse, we take your privacy seriously. This policy explains
            how we collect, use, and protect your personal information. We
            believe in transparency and giving you full control over your data.
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
              <h2 className="text-xl font-semibold text-gray-900 font-[Poppins] mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`leading-relaxed ${
                      p.startsWith('•')
                        ? 'text-gray-600 text-sm pl-4'
                        : 'text-gray-600'
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 font-[Poppins] mb-3">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy,
              please contact us at{' '}
              <a
                href="mailto:privacy@linkverse.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                privacy@linkverse.com
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