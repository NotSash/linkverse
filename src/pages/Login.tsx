import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { validateLoginForm, hasErrors } from '@/utils/validators';
import { setPageMeta } from '@/utils/helpers';
import * as authService from '@/services/authService';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPageMeta({
      title: 'Log In — LinkVerse',
      description: 'Log in to your LinkVerse account to manage your bio-link page.',
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (hasErrors(validationErrors)) {
      const filtered: Record<string, string> = {};
      Object.entries(validationErrors).forEach(([k, v]) => {
        if (v) filtered[k] = v;
      });
      setErrors(filtered);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData);

      if (response.requiresVerification) {
        toast.error(response.message || 'Please verify your email first.');
        navigate('/signup', { state: { email: response.email, step: 'otp' } });
        return;
      }

      const { token, user } = response.data;
      login(token, user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);

      if (message.toLowerCase().includes('password')) {
        setErrors({ password: message });
      } else if (message.toLowerCase().includes('email') || message.toLowerCase().includes('account')) {
        setErrors({ email: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogIn className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">
                Welcome back!
              </h1>
              <p className="text-gray-500 mt-2">Log in to your LinkVerse account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<FiMail className="w-5 h-5" />}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<FiLock className="w-5 h-5" />}
                required
              />

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="gradient"
                fullWidth
                size="lg"
                isLoading={loading}
                icon={<FiLogIn className="w-5 h-5" />}
              >
                Log In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}