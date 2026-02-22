import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Public Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Refund from '@/pages/Refund';
import PublicProfile from '@/pages/PublicProfile';

// Dashboard Layout & Pages
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import Links from '@/pages/dashboard/Links';
import SocialLinks from '@/pages/dashboard/SocialLinks';
import Appearance from '@/pages/dashboard/Appearance';
import Analytics from '@/pages/dashboard/Analytics';
import Settings from '@/pages/dashboard/Settings';
import Account from '@/pages/dashboard/Account';
import Billing from '@/pages/dashboard/Billing';
import SEO from '@/pages/dashboard/SEO';
import Preview from '@/pages/dashboard/Preview';

// Admin Layout & Pages
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import PaymentRecords from '@/pages/admin/PaymentRecords';
import SupportTickets from '@/pages/admin/SupportTickets';

// Branded loading screen
function BrandedLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-indigo-50 via-white to-pink-50">
      {/* Logo */}
      <div className="mb-6 animate-float">
        <div className="w-16 h-16 bg-linear-to-br from-indigo-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <span className="text-2xl font-bold text-white">L</span>
        </div>
      </div>

      {/* Spinner */}
      <div className="relative mb-4">
        <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>

      {/* Brand text */}
      <p className="text-sm font-medium text-gray-500 animate-pulse">
        Loading LinkVerse...
      </p>

      {/* Subtle gradient bar */}
      <div className="mt-6 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-linear-to-r from-indigo-600 to-pink-500 rounded-full animate-shimmer" />
      </div>
    </div>
  );
}

// Protected Route — requires user authentication
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <BrandedLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

// Guest Route — redirect authenticated users away from login/signup
function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <BrandedLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

// Admin Route — requires admin token
function AdminRoute() {
  const adminToken = localStorage.getItem('linkverse_admin_token');

  if (!adminToken) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}

// Main Router
export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund" element={<Refund />} />

      {/* Guest Routes — redirect to dashboard if already logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/links" element={<Links />} />
          <Route path="/dashboard/socials" element={<SocialLinks />} />
          <Route path="/dashboard/appearance" element={<Appearance />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/account" element={<Account />} />
          <Route path="/dashboard/billing" element={<Billing />} />
          <Route path="/dashboard/seo" element={<SEO />} />
          <Route path="/dashboard/preview" element={<Preview />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/payments" element={<PaymentRecords />} />
          <Route path="/admin/support" element={<SupportTickets />} />
        </Route>
      </Route>

      {/* Public Profile — must be before catch-all */}
      <Route path="/:username" element={<PublicProfile />} />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}