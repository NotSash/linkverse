import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiCheck, FiX, FiLoader, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import { signup, verifyOTP, resendOTP, checkUsername } from '@/services/authService';
import { useDebounce } from '@/hooks/useDebounce';
import { CATEGORIES } from '@/utils/constants';
import { validateEmail, validatePhone, validateUsername, validatePassword, validateConfirmPassword, validateRequired, hasErrors, type FormErrors } from '@/utils/validators';
import { setPageMeta } from '@/utils/helpers';

const fireConfetti = async () => {
  try {
    const confettiModule = await import('canvas-confetti');
    confettiModule.default({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  } catch {
    // Confetti not available
  }
};

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              i + 1 < currentStep
                ? 'bg-green-500 text-white'
                : i + 1 === currentStep
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i + 1 < currentStep ? <FiCheck className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-8 h-0.5 transition-all duration-300 ${
                i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Animation variants for step transitions
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
} as const;

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const locationState = location.state as { email?: string; step?: string } | null;

  // Steps: 1 = Name/Email/Phone, 2 = Username/Password, 3 = Category/Terms, 4 = OTP
  const [formStep, setFormStep] = useState(1);
  const [step, setStep] = useState<'form' | 'otp'>(locationState?.step === 'otp' ? 'otp' : 'form');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: locationState?.email || '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    category: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const debouncedUsername = useDebounce(formData.username, 500);

  // Page meta
  useEffect(() => {
    const titles: Record<string, string> = {
      form: `Sign Up (Step ${formStep}/3) — LinkVerse`,
      otp: 'Verify Email — LinkVerse',
    };
    setPageMeta({
      title: titles[step],
      description: 'Create your free LinkVerse account and start building your bio-link page.',
    });
  }, [step, formStep]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  // Check username availability
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    checkUsername(debouncedUsername)
      .then((res) => setUsernameStatus(res.available ? 'available' : 'taken'))
      .catch(() => setUsernameStatus('idle'));
  }, [debouncedUsername]);

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp' || otpTimer <= 0) {
      if (otpTimer <= 0) setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, otpTimer]);

  // Input handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'username') {
      setFormData((prev) => ({ ...prev, username: value.toLowerCase().replace(/[^a-z0-9_]/g, '') }));
    } else if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Step validation
  const validateStep = (stepNum: number): boolean => {
    const stepErrors: FormErrors = {};

    switch (stepNum) {
      case 1:
        stepErrors.fullName = validateRequired(formData.fullName, 'Full name');
        stepErrors.email = validateEmail(formData.email);
        stepErrors.phone = validatePhone(formData.phone);
        break;
      case 2:
        stepErrors.username = validateUsername(formData.username);
        stepErrors.password = validatePassword(formData.password);
        stepErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
        if (usernameStatus === 'taken') {
          stepErrors.username = 'This username is already taken';
        }
        break;
      case 3:
        stepErrors.category = validateRequired(formData.category, 'Category');
        if (!formData.agreeToTerms) {
          stepErrors.agreeToTerms = 'You must agree to the Terms & Privacy Policy';
        }
        break;
    }

    if (hasErrors(stepErrors)) {
      const filtered: Record<string, string> = {};
      Object.entries(stepErrors).forEach(([k, v]) => {
        if (v) filtered[k] = v;
      });
      setErrors(filtered);
      toast.error(Object.values(filtered)[0]);
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    if (!validateStep(formStep)) return;
    setDirection(1);
    setErrors({});

    if (formStep < 3) {
      setFormStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPrevStep = () => {
    if (formStep > 1) {
      setDirection(-1);
      setErrors({});
      setFormStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
        category: formData.category,
      });

      toast.success('OTP sent to your email!');
      setStep('otp');
      setOtpTimer(60);
      setCanResend(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; field?: string } } };
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(message);

      // Navigate back to the step with the error
      const field = error.response?.data?.field;
      if (field === 'email' || field === 'phone') {
        setFormStep(1);
        setErrors({ [field]: message });
      } else if (field === 'username') {
        setFormStep(2);
        setErrors({ username: message });
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ email: formData.email, otp: otpString });
      login(res.token, res.user);
      fireConfetti();
      setShowWelcomeModal(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      await resendOTP(formData.email);
      toast.success('New OTP sent!');
      setOtpTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  // Render form steps
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={<FiUser className="w-5 h-5" />}
              required
              autoFocus
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<FiMail className="w-5 h-5" />}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`w-full pl-18 pr-4 py-2.5 border rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="yourname"
                  maxLength={30}
                  autoFocus
                  className={`w-full pl-8 pr-10 py-2.5 border rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.username ? 'border-red-400 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <FiLoader className="w-4 h-4 text-gray-400 animate-spin" />}
                  {usernameStatus === 'available' && <FiCheck className="w-4 h-4 text-green-500" />}
                  {usernameStatus === 'taken' && <FiX className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">linkverse.com/{formData.username || 'yourname'}</p>
              {usernameStatus === 'taken' && <p className="text-red-500 text-xs">Username is taken</p>}
              {usernameStatus === 'available' && <p className="text-green-500 text-xs">Username is available!</p>}
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.password ? 'border-red-400 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target flex items-center justify-center"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded transition-colors ${
                        getPasswordStrength() >= level
                          ? level === 1 ? 'bg-red-500' : level === 2 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target flex items-center justify-center"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What's your niche? <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleSelectChange}
                autoFocus
                className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white ${
                  errors.category ? 'border-red-400 bg-red-50/50' : 'border-gray-300'
                }`}
              >
                <option value="">Select your category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Summary card */}
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-indigo-900">Account Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-indigo-700">
                <div>
                  <span className="text-indigo-500">Name:</span> {formData.fullName}
                </div>
                <div>
                  <span className="text-indigo-500">Email:</span> {formData.email}
                </div>
                <div>
                  <span className="text-indigo-500">Username:</span> @{formData.username}
                </div>
                <div>
                  <span className="text-indigo-500">Phone:</span> +91 {formData.phone}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-indigo-600 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" className="text-indigo-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Your Details', 'Create Identity', 'Almost Done!'];
  const stepDescriptions = [
    'Tell us about yourself',
    'Choose your username & password',
    'Pick your niche and review',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {step === 'form' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8"
            >
              {/* Step Indicator */}
              <StepIndicator currentStep={formStep} totalSteps={3} />

              {/* Header — changes per step */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  {stepTitles[formStep - 1]}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  {stepDescriptions[formStep - 1]}
                </p>
              </div>

              {/* Animated Step Content */}
              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  goToNextStep();
                }}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={formStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {renderFormStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  {formStep > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goToPrevStep}
                      icon={<FiArrowLeft className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="gradient"
                    fullWidth
                    size="lg"
                    isLoading={loading}
                    disabled={loading || (formStep === 2 && usernameStatus === 'checking')}
                    iconRight={formStep < 3 ? <FiArrowRight className="w-4 h-4" /> : undefined}
                    className={formStep === 1 ? 'w-full' : 'flex-1'}
                  >
                    {formStep < 3 ? 'Continue' : 'Create Account'}
                  </Button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-medium hover:underline">Log in</Link>
              </p>
            </motion.div>
          ) : (
            /* OTP Verification Step */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2, damping: 15 }}
                  className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FiMail className="w-8 h-8 text-indigo-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">Verify your email</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-gray-700">{formData.email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                ))}
              </div>

              {/* Timer / Resend */}
              <div className="text-center mb-6">
                {!canResend ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold text-indigo-600">{otpTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Didn't receive the code? Resend OTP
                  </button>
                )}
              </div>

              <Button
                onClick={handleVerifyOtp}
                variant="gradient"
                fullWidth
                size="lg"
                isLoading={loading}
                disabled={loading || otp.join('').length !== 6}
              >
                Verify & Continue
              </Button>

              <button
                onClick={() => {
                  setStep('form');
                  setFormStep(1);
                }}
                className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                ← Back to signup
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Welcome Modal */}
      <Modal
        isOpen={showWelcomeModal}
        onClose={() => {}}
        title="Welcome to LinkVerse! 🎉"
        size="md"
        showCloseButton={false}
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-6">Your account is ready. Let's set up your page!</p>

          <div className="space-y-3 text-left mb-6">
            {['Upload your profile picture', 'Write a catchy bio', 'Add your first link'].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
                <span className="text-gray-700">{text}</span>
              </motion.div>
            ))}
          </div>

          <Button variant="gradient" fullWidth size="lg" onClick={() => navigate('/dashboard')}>
            Let's Go! 🚀
          </Button>
        </div>
      </Modal>
    </div>
  );
}