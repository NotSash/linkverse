import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineCheckCircle, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { validateEmail } from '@/utils/validators';
import { forgotPassword } from '@/services/authService';
import { setPageMeta } from '@/utils/helpers';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setPageMeta({
      title: 'Forgot Password — LinkVerse',
      description: 'Reset your LinkVerse account password.',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            {!sent ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineMail className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                    Forgot your password?
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm">
                    No worries! Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    error={error}
                    icon={<HiOutlineMail className="w-5 h-5" />}
                    required
                  />

                  <Button type="submit" variant="gradient" fullWidth isLoading={loading} size="lg">
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                  >
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins mb-2">
                  Check your inbox!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  If an account exists with{' '}
                  <span className="font-medium text-gray-700">{email}</span>, you'll receive a
                  password reset link. Check your inbox and spam folder.
                </p>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setSent(false);
                      setEmail('');
                    }}
                  >
                    Try a different email
                  </Button>
                  <Link
                    to="/login"
                    className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}