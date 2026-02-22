import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const WHY_CARDS = [
  {
    emoji: '🇮🇳',
    title: 'Made in India',
    description:
      'Built by an Indian team that understands the creator ecosystem, culture, and needs of Indian influencers.',
    gradient: 'from-orange-50 to-green-50',
    border: 'border-orange-100',
  },
  {
    emoji: '📱',
    title: 'Indian Platforms',
    description:
      'Support for Moj, ShareChat, Josh, Chingari, Roposo, JioSaavn, Gaana, Wynk, and many more.',
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-100',
  },
  {
    emoji: '💳',
    title: 'UPI & Indian Payments',
    description:
      'Pay with UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking, or wallets. Powered by Razorpay.',
    gradient: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
  },
  {
    emoji: '💰',
    title: 'Affordable Pricing',
    description:
      'Just ₹49/month — less than a cup of chai per day. No hidden charges, no surprises. GST invoice included.',
    gradient: 'from-purple-50 to-pink-50',
    border: 'border-purple-100',
  },
];

const ROADMAP = [
  'Custom domain support',
  'More themes and customization options',
  'Collaboration features for brands and creators',
  'Advanced analytics with audience insights',
  'Creator marketplace and discovery',
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function About() {
  useEffect(() => {
    document.title = 'About — LinkVerse';
    return () => {
      document.title = 'LinkVerse';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 mb-5">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-[Poppins] mb-4">
            <span className="bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              About LinkVerse
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Empowering Indian content creators with the tools they need to grow
            their online presence.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 font-[Poppins] mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LinkVerse was born from a simple observation — Indian content
            creators deserve a bio-link platform that truly understands them.
            While global platforms exist, none of them cater specifically to the
            unique ecosystem of Indian creators.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We bring all your social media, content platforms, and monetization
            links together in one beautiful, customizable page. From Instagram
            and YouTube to Moj, ShareChat, Josh, and JioSaavn — we support the
            platforms that matter to Indian creators.
          </p>
        </motion.section>

        {/* Our Story */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 font-[Poppins] mb-4">
            Our Story
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              India has over 80 million content creators, and that number is
              growing every day. From fashion influencers in Mumbai to tech
              reviewers in Bangalore, food bloggers in Delhi to comedy creators
              in Hyderabad — the Indian creator economy is booming.
            </p>
            <p>
              Yet, most bio-link tools were built for Western audiences. They
              don't support Indian platforms like Moj, ShareChat, Josh, or
              Chingari. They don't accept UPI payments. They don't understand the
              needs of Indian creators.
            </p>
            <p>
              That's why we built LinkVerse — a platform made in India, for
              India. We support 30+ platforms, accept payments via UPI, cards,
              and wallets, and offer everything at just ₹49/month — affordable
              for creators at every stage.
            </p>
          </div>
        </motion.section>

        {/* Why LinkVerse */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 font-[Poppins] mb-6">
            Why LinkVerse?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className={`bg-linear-to-br ${card.gradient} rounded-2xl p-6 border ${card.border} hover:shadow-md transition-shadow duration-200`}
              >
                <div className="text-3xl mb-3">{card.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900 font-[Poppins] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Vision */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 font-[Poppins] mb-4">
            Our Vision
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            We envision a future where every Indian creator has a professional
            online presence. We're constantly working on new features to help you
            grow:
          </p>
          <ul className="space-y-3">
            {ROADMAP.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </span>
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] mb-4">
            Ready to create your LinkVerse page?
          </h2>
          <p className="text-indigo-100 mb-7 max-w-lg mx-auto">
            Join thousands of Indian creators who trust LinkVerse to power their
            online presence.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 hover:shadow-lg transition-all duration-200"
          >
            Get Started — It's Free
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.section>

        <p className="text-center mt-10 text-sm text-gray-400">
          Built with ❤️ in India for Indian creators 🇮🇳
        </p>
      </main>

      <Footer />
    </div>
  );
}