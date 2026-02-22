import { FiChevronLeft, FiChevronRight, FiFileText, FiInbox } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

// ============================================
// Types
// ============================================

interface Payment {
  _id: string;
  createdAt: string;
  userId?: { fullName?: string; email?: string };
  userName?: string;
  userEmail?: string;
  amount: number;
  status: string;
  method?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
}

interface PaymentTableProps {
  payments: Payment[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRevenue?: number;
  /** If true, amount is in paise (divide by 100). Default: true */
  amountInPaise?: boolean;
}

// ============================================
// Helpers
// ============================================

const STATUS_STYLES: Record<string, string> = {
  captured: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed: 'bg-red-50 text-red-700 border border-red-200',
  refunded: 'bg-blue-50 text-blue-700 border border-blue-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  created: 'bg-gray-50 text-gray-600 border border-gray-200',
};

const getStatusStyle = (status: string): string => {
  return (
    STATUS_STYLES[status?.toLowerCase()] ||
    'bg-gray-50 text-gray-600 border border-gray-200'
  );
};

const formatAmount = (amount: number, inPaise: boolean): string => {
  const rupees = inPaise ? amount / 100 : amount;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    captured: 'Captured',
    paid: 'Paid',
    success: 'Success',
    failed: 'Failed',
    refunded: 'Refunded',
    pending: 'Pending',
    created: 'Created',
  };
  return labels[status?.toLowerCase()] || status || 'Unknown';
};

// ============================================
// Skeleton
// ============================================

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-48" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function PaymentTable({
  payments,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  totalRevenue,
  amountInPaise = true,
}: PaymentTableProps) {
  if (loading) return <TableSkeleton />;

  // ---- Empty State ----
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiInbox className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No payments found</p>
        <p className="text-gray-400 text-sm mt-1">
          Payments will appear here once transactions are made
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Revenue Banner */}
      {totalRevenue !== undefined && totalRevenue > 0 && (
        <div className="mb-5 bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-emerald-600 font-medium">
              Total Revenue
            </span>
            <p className="text-2xl font-bold text-emerald-800 mt-0.5">
              {formatAmount(totalRevenue, amountInPaise)}
            </p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => {
              const userName =
                payment.userId?.fullName || payment.userName || 'N/A';
              const userEmail =
                payment.userId?.email || payment.userEmail || '';

              return (
                <tr
                  key={payment._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3.5 px-4 text-sm text-gray-700">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    {userEmail && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {userEmail}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-gray-900 tabular-nums">
                    {formatAmount(payment.amount, amountInPaise)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-600 capitalize">
                    {payment.method || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    {payment.razorpayPaymentId ? (
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">
                          {payment.razorpayPaymentId.length > 18
                            ? payment.razorpayPaymentId.substring(0, 18) + '…'
                            : payment.razorpayPaymentId}
                        </code>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {payment.invoiceNumber ? (
                      <span className="inline-flex items-center gap-1 text-sm text-indigo-600">
                        <FiFileText className="w-3.5 h-3.5" />
                        {payment.invoiceNumber}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {payments.map((payment) => {
          const userName =
            payment.userId?.fullName || payment.userName || 'N/A';
          const userEmail = payment.userId?.email || payment.userEmail || '';

          return (
            <div
              key={payment._id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              {/* Top row — user & status */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {userEmail}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ml-2 shrink-0 ${getStatusStyle(
                    payment.status
                  )}`}
                >
                  {getStatusLabel(payment.status)}
                </span>
              </div>

              {/* Amount & date */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {formatDate(payment.createdAt)}
                </span>
                <span className="font-bold text-gray-900 tabular-nums">
                  {formatAmount(payment.amount, amountInPaise)}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span className="capitalize">{payment.method || '—'}</span>
                {payment.invoiceNumber && (
                  <span className="flex items-center gap-1 text-indigo-500">
                    <FiFileText className="w-3 h-3" />
                    {payment.invoiceNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <FiChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Next
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}