import { useState, useEffect, useCallback } from 'react';
import {
  FiCreditCard,
  FiCheck,
  FiLoader,
  FiDownload,
  FiCalendar,
  FiStar,
  FiAlertCircle,
  FiX,
  FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  verifyPayment,
  getPaymentHistory,
  getInvoice,
  loadRazorpayScript,
  createOrder,
} from '../../services/paymentService';
import type { PaymentRecord } from '../../services/paymentService';
import { formatDate, getDaysRemaining } from '../../utils/helpers';

// ============================================
// Types
// ============================================

type PlanType = 'monthly' | 'yearly';

interface PlanConfig {
  type: PlanType;
  label: string;
  price: string;
  pricePerMonth: string;
  badge?: string;
}

// ============================================
// Constants
// ============================================

const PLANS: PlanConfig[] = [
  {
    type: 'monthly',
    label: 'Monthly',
    price: '₹49',
    pricePerMonth: '₹49/month',
  },
  {
    type: 'yearly',
    label: 'Yearly',
    price: '₹499',
    pricePerMonth: '₹41.58/month',
    badge: 'Save ₹89!',
  },
];

const PRO_FEATURES = [
  'Unlimited links',
  '30+ platforms',
  'Custom themes',
  'Analytics dashboard',
  'SEO settings',
  'Priority support',
  'Custom OG image',
  'No branding',
  'GST invoice',
];

// ============================================
// Helpers
// ============================================

const fireConfetti = async () => {
  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  } catch {
    // Optional dependency
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'captured':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'refunded':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    captured: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    created: 'Pending',
  };
  return labels[status] || status;
};

// ============================================
// Skeleton
// ============================================

function BillingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-28 mb-5" />
        <div className="h-20 bg-gray-100 rounded-xl mb-4" />
        <div className="h-12 bg-gray-100 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-36 mb-5" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 bg-gray-100 rounded-lg mb-3"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Plan Selector Component
// ============================================

function PlanSelector({
  selectedPlan,
  onSelect,
  onSubscribe,
  paying,
}: {
  selectedPlan: PlanType;
  onSelect: (plan: PlanType) => void;
  onSubscribe: () => void;
  paying: boolean;
}) {
  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      <p className="text-sm font-medium text-gray-700 mb-3">
        Choose your plan:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {PLANS.map((plan) => (
          <button
            key={plan.type}
            onClick={() => onSelect(plan.type)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              selectedPlan === plan.type
                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {selectedPlan === plan.type && (
              <div className="absolute top-3 right-3">
                <FiCheck className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{plan.label}</p>
              {plan.badge && (
                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  {plan.badge}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {plan.price}
              <span className="text-sm font-normal text-gray-500">
                /{plan.type === 'yearly' ? 'year' : 'month'}
              </span>
            </p>
            {plan.type === 'yearly' && (
              <p className="text-xs text-emerald-600 mt-0.5">
                Just {plan.pricePerMonth}
              </p>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onSubscribe}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-sm shadow-indigo-200"
      >
        {paying ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : (
          <FiCreditCard className="w-4 h-4" />
        )}
        {paying
          ? 'Processing...'
          : `Subscribe — ${selectedPlan === 'yearly' ? '₹499/year' : '₹49/month'}`}
      </button>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function Billing() {
  const { user, updateUser, refreshUser } = useAuth();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [showMockPayment, setShowMockPayment] = useState(false);

  const isActive = !!(user?.isPro && user?.subscriptionStatus === 'active');
  const isExpired = user?.subscriptionStatus === 'expired';
  const daysLeft = user?.subscriptionEndDate
    ? getDaysRemaining(user.subscriptionEndDate)
    : 0;
  const isExpiringSoon = isActive && daysLeft <= 5 && daysLeft > 0;

  // ---- Fetch payment history ----
  const fetchPayments = useCallback(async () => {
    try {
      const res = await getPaymentHistory();
      setPayments(res.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await fetchPayments();
      setLoading(false);
    }
    init();
  }, [fetchPayments]);

  // ---- Handle successful payment ----
  const handlePaymentSuccess = useCallback(
    async (verifyData: any) => {
      updateUser({
        isPro: true,
        subscriptionStatus: 'active',
        subscriptionStartDate:
          verifyData.subscriptionStartDate || new Date().toISOString(),
        subscriptionEndDate:
          verifyData.subscriptionEndDate ||
          new Date(
            Date.now() +
              (selectedPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
      });

      await refreshUser();
      await fireConfetti();
      toast.success('Payment successful! Your Pro plan is now active! 🎉');
      await fetchPayments();
    },
    [updateUser, refreshUser, fetchPayments, selectedPlan]
  );

  // ---- Mock payment ----
  const handleMockPayment = async () => {
    setPaying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await verifyPayment({
        razorpay_payment_id: 'mock_pay_' + Date.now(),
        razorpay_order_id: 'mock_order_' + Date.now(),
        razorpay_signature: 'mock_signature',
        mockPayment: true,
        planType: selectedPlan,
      });

      const data = res.data;
      setShowMockPayment(false);
      await handlePaymentSuccess(data);
    } catch (err: any) {
      console.error('Mock payment error:', err);
      toast.error(
        err?.response?.data?.message || 'Payment failed. Please try again.'
      );
    } finally {
      setPaying(false);
    }
  };

  // ---- Real Razorpay payment ----
  const handlePayment = async () => {
    setPaying(true);
    try {
      const orderRes = await createOrder(selectedPlan);
      const orderData = orderRes.data;

      // If mock mode, show mock modal
      if (
        !orderData.razorpayKeyId ||
        orderData.mockMode ||
        orderData.razorpayKeyId === 'rzp_test_mock'
      ) {
        setPaying(false);
        setShowMockPayment(true);
        return;
      }

      // Load Razorpay script (singleton — won't duplicate)
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaying(false);
        setShowMockPayment(true);
        return;
      }

      const rzpOptions = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'LinkVerse',
        description:
          selectedPlan === 'yearly'
            ? 'Pro Plan — Yearly Subscription'
            : 'Pro Plan — Monthly Subscription',
        order_id: orderData.orderId,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#6366f1' },
        handler: async (response: any) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            await handlePaymentSuccess(verifyRes.data);
          } catch {
            toast.error(
              'Payment verification failed. Please contact support.'
            );
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast('Payment cancelled', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPaying(false);
      setShowMockPayment(true);
    }
  };

  // ---- Download invoice ----
  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const response = await getInvoice(paymentId);

      if (!response.invoiceHTML) {
        toast.error('Invoice not available');
        return;
      }

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(response.invoiceHTML);
        newWindow.document.close();
      } else {
        toast.error('Please allow popups to view the invoice');
      }
    } catch {
      toast.error('Failed to load invoice');
    }
  };

  if (loading) return <BillingSkeleton />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Subscription & Billing
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your plan and payment history
        </p>
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Your subscription expires in {daysLeft} day
              {daysLeft !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Renew now to keep your page live and retain all Pro features.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Current Plan
        </h2>

        {isActive ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Pro Plan</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    <FiStar className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    Expires:{' '}
                    {user?.subscriptionEndDate
                      ? formatDate(user.subscriptionEndDate)
                      : 'N/A'}
                  </span>
                  <span
                    className={`font-medium ml-1 ${
                      daysLeft <= 5 ? 'text-amber-600' : 'text-indigo-600'
                    }`}
                  >
                    ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
                  </span>
                </div>
              </div>
            </div>

            {/* Pro features grid */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Your plan includes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PRO_FEATURES.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <FiCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Renew option when expiring soon */}
            {isExpiringSoon && (
              <PlanSelector
                selectedPlan={selectedPlan}
                onSelect={setSelectedPlan}
                onSubscribe={handlePayment}
                paying={paying}
              />
            )}
          </>
        ) : isExpired ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">Pro Plan</h3>
              <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                Expired
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Your page is currently offline. Renew to get it back!
            </p>
            <PlanSelector
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              onSubscribe={handlePayment}
              paying={paying}
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">Free Tier</h3>
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                Free
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Your page is not published yet. Subscribe to Pro to go live!
            </p>
            <PlanSelector
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              onSubscribe={handlePayment}
              paying={paying}
            />
          </>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Payment History
        </h2>

        {payments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiCreditCard className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No payments yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto -mx-4 sm:-mx-6">
              <div className="min-w-full px-4 sm:px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="text-right py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3.5 text-gray-700">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="py-3.5 font-mono text-xs text-gray-500">
                          {payment.invoiceNumber || '—'}
                        </td>
                        <td className="py-3.5 text-gray-600 capitalize">
                          {payment.planType || 'monthly'}
                        </td>
                        <td className="py-3.5 font-semibold text-gray-900 tabular-nums">
                          ₹{(payment.amount / 100).toFixed(0)}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                              payment.status
                            )}`}
                          >
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="py-3.5 capitalize text-gray-600">
                          {payment.method || '—'}
                        </td>
                        <td className="py-3.5 text-right">
                          {payment.status === 'captured' && (
                            <button
                              onClick={() =>
                                handleDownloadInvoice(payment._id)
                              }
                              className="text-indigo-600 hover:text-indigo-700 text-xs font-medium inline-flex items-center gap-1 hover:underline"
                            >
                              <FiDownload className="w-3.5 h-3.5" />
                              Invoice
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      ₹{(payment.amount / 100).toFixed(0)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>{formatDate(payment.createdAt)}</span>
                      <span className="capitalize">
                        {payment.planType || 'monthly'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="capitalize">
                        {payment.method || '—'}
                      </span>
                      {payment.invoiceNumber && (
                        <span className="font-mono">
                          {payment.invoiceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  {payment.status === 'captured' && (
                    <button
                      onClick={() => handleDownloadInvoice(payment._id)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-xs font-medium border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      Download Invoice
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mock Payment Modal */}
      {showMockPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            {/* Close button */}
            <div className="flex justify-end -mt-1 -mr-1 mb-2">
              <button
                onClick={() => {
                  setShowMockPayment(false);
                  setPaying(false);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FiCreditCard className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Demo Checkout
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Razorpay not configured — using demo payment
              </p>
            </div>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="text-sm font-semibold text-gray-900">
                  Pro {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {selectedPlan === 'yearly' ? '₹499' : '₹49'}
                </span>
              </div>
            </div>

            {/* Mock card info */}
            <div className="space-y-3 mb-6">
              <div className="border border-gray-200 rounded-xl p-3.5">
                <label className="text-xs text-gray-400 mb-1 block">
                  Card Number
                </label>
                <p className="text-sm font-mono text-gray-500">
                  4111 1111 1111 1111
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-xl p-3.5">
                  <label className="text-xs text-gray-400 mb-1 block">
                    Expiry
                  </label>
                  <p className="text-sm font-mono text-gray-500">12/25</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-3.5">
                  <label className="text-xs text-gray-400 mb-1 block">
                    CVV
                  </label>
                  <p className="text-sm font-mono text-gray-500">123</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMockPayment(false);
                  setPaying(false);
                }}
                disabled={paying}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMockPayment}
                disabled={paying}
                className="flex-1 py-2.5 px-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
              >
                {paying ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <FiShield className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-400">
                Demo payment — no real charges
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}