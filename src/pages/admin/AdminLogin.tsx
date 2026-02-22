import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiLoader,
  FiArrowLeft,
  FiShield,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminLogin } from '../../services/adminService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin({ email: email.trim(), password });

      // Extract token from response — API returns { data: { token, admin } }
      const token = res.data?.token;
      if (!token) {
        toast.error('Login failed — no token received');
        return;
      }

      localStorage.setItem('linkverse_admin_token', token);
      toast.success('Welcome, Admin! 🛡️');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Invalid admin credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-slate-800 to-slate-900 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-sm text-gray-400 mt-1">
              LinkVerse Administration Panel
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@linkverse.com"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <FiEye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <FiShield className="w-4 h-4" />
                )}
                {loading ? 'Logging in...' : 'Login to Admin Panel'}
              </button>
            </form>

            {/* Dev hint */}
            {import.meta.env.DEV && (
              <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 text-center font-mono">
                  Default: admin@linkverse.com / Admin@123
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to LinkVerse
          </Link>
        </div>
      </div>
    </div>
  );
}