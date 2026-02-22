import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiClock,
  FiHelpCircle,
  FiSend,
  FiCheck,
  FiChevronDown,
  FiLoader,
  FiMessageSquare,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import api from '../services/api';

// ============================================
// Constants
// ============================================

const SUBJECT_OPTIONS = [
  'Payment & Billing',
  'Account Issue',
  'Feature Request',
  'Bug Report',
  'Partnership Inquiry',
  'Other',
];

const MAX_MESSAGE_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 200;
const MAX_NAME_LENGTH = 100;

// ============================================
// Contact API (inline — avoids importing from adminService)
// ============================================

const submitContactForm = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await api.post('/contact', data);
  return response.data;
};

// ============================================
// Component
// ============================================

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    customSubject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > MAX_NAME_LENGTH) {
      newErrors.name = `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const subject =
      formData.subject === 'Other'
        ? formData.customSubject.trim()
        : formData.subject;
    if (!subject) {
      newErrors.subject = 'Please select or enter a subject';
    } else if (subject.length > MAX_SUBJECT_LENGTH) {
      newErrors.subject = `Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters`;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const subject =
      formData.subject === 'Other'
        ? formData.customSubject.trim()
        : formData.subject;

    setLoading(true);
    try {
      await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject,
        message: formData.message.trim(),
      });
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      subject: '',
      customSubject: '',
      message: '',
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <FiMessageSquare className="w-4 h-4" />
            We're here to help
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Get in Touch
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, feedback, or need help? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left — Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              {
                icon: FiMail,
                iconBg: 'bg-indigo-50',
                iconColor: 'text-indigo-600',
                title: 'Email Us',
                desc: 'support@linkverse.com',
              },
              {
                icon: FiClock,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                title: 'Response Time',
                desc: 'We typically respond within 24 hours',
              },
              {
                icon: FiHelpCircle,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
                title: 'Quick Answers',
                desc: '',
                custom: (
                  <p className="text-gray-600 text-sm mt-1">
                    Check our{' '}
                    <Link
                      to="/#faq"
                      className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
                    >
                      FAQ section
                    </Link>{' '}
                    for instant answers to common questions.
                  </p>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className={`p-3 ${item.iconBg} rounded-xl ${item.iconColor} shrink-0`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.custom || (
                    <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Common topics */}
            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Common Topics
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  'Payment and billing issues',
                  'Account recovery',
                  'Feature requests',
                  'Bug reports',
                  'Partnership inquiries',
                ].map((topic) => (
                  <li key={topic} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-10 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FiCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Message Sent!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Thank you for reaching out. We'll get back to you within 24
                  hours at the email address you provided.
                </p>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8 space-y-5"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    maxLength={MAX_NAME_LENGTH}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 ${
                      errors.name
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-gray-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 ${
                      errors.email
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-gray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none bg-white ${
                        errors.subject
                          ? 'border-red-300 bg-red-50/50'
                          : 'border-gray-200'
                      } ${!formData.subject ? 'text-gray-400' : 'text-gray-900'}`}
                    >
                      <option value="" disabled>
                        Select a topic...
                      </option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Custom subject input when "Other" is selected */}
                  {formData.subject === 'Other' && (
                    <input
                      type="text"
                      name="customSubject"
                      value={formData.customSubject}
                      onChange={handleChange}
                      placeholder="Enter your subject..."
                      maxLength={MAX_SUBJECT_LENGTH}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 mt-2"
                    />
                  )}
                  {errors.subject && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    maxLength={MAX_MESSAGE_LENGTH + 50}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-gray-400 ${
                      errors.message
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-gray-200'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message ? (
                      <p className="text-xs text-red-500">{errors.message}</p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-xs tabular-nums ${
                        formData.message.length > MAX_MESSAGE_LENGTH
                          ? 'text-red-500 font-medium'
                          : formData.message.length > MAX_MESSAGE_LENGTH * 0.9
                          ? 'text-amber-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {formData.message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 shadow-sm shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We'll respond to your email within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}