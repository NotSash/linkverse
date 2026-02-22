import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { validatePassword, validateConfirmPassword, getPasswordStrength } from '@/utils/validators';
import { resetPassword } from '@/services/authService';
import { setPageMeta } from '@/utils/helpers';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  const strength = getPasswordStrength(password);
  const isPasswordValid = strength.checks.slice(0, 3).every((c) => c.passed);

  useEffect(() => {
    setPageMeta({
      title: 'Reset Password — LinkVerse',
      description: 'Set a new password for your LinkVerse account.',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { password?: string; confirmPassword?: string } = {};
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    if (passErr) newErrors.password = passErr;
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await resetPassword({ token: token || '', password });
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || 'Something went wrong.';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setExpired(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

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
            {expired ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineExclamationCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins mb-2">Link Expired</h2>
                <p className="text-gray-500 text-sm mb-6">
                  This password reset link has expired or is invalid. Please request a new one.
                </p>
                <div className="space-y-3">
                  <Link to="/forgot-password">
                    <Button variant="gradient" fullWidth>
                      Request New Reset Link
                    </Button>
                  </Link>
                  <Link to="/login" className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your password has been successfully reset. Redirecting you to login...
                </p>
                <Link to="/login">
                  <Button variant="gradient" fullWidth>
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineLockClosed className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 font-poppins">Set a new password</h1>
                  <p className="text-gray-500 mt-2 text-sm">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      error={errors.password}
                      icon={<HiOutlineLockClosed className="w-5 h-5" />}
                      required
                    />

                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                i < strength.score ? strengthColors[strength.score - 1] : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {strength.score > 0 ? strengthLabels[strength.score - 1] : 'Too short'}
                        </span>
                        <div className="mt-2 space-y-1">
                          {strength.checks.map((check, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className={check.passed ? 'text-green-500' : 'text-gray-400'}>
                                {check.passed ? '✓' : '○'}
                              </span>
                              <span className={check.passed ? 'text-green-700' : 'text-gray-500'}>
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    error={errors.confirmPassword}
                    icon={<HiOutlineLockClosed className="w-5 h-5" />}
                    required
                  />

                  <Button
                    type="submit"
                    variant="gradient"
                    fullWidth
                    isLoading={loading}
                    size="lg"
                    disabled={!isPasswordValid}
                  >
                    Reset Password
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}