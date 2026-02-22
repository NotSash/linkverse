import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiX,
  FiFilter,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import PaymentTable from '../../components/admin/PaymentTable';
import { getPayments } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';

export default function PaymentRecords() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const debouncedSearch = useDebounce<string>(searchQuery, 500);

  const fetchPayments = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params: any = { page, limit: 20 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (methodFilter !== 'all') params.method = methodFilter;
        if (dateRange !== 'all') {
          const now = new Date();
          if (dateRange === '7d')
            params.startDate = new Date(
              now.getTime() - 7 * 24 * 60 * 60 * 1000
            ).toISOString();
          if (dateRange === '30d')
            params.startDate = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            ).toISOString();
          if (dateRange === '90d')
            params.startDate = new Date(
              now.getTime() - 90 * 24 * 60 * 60 * 1000
            ).toISOString();
        }
        const res = await getPayments(params);
        setPayments(res.payments || []);
        setTotalPages(res.totalPages || 1);
        setTotalRevenue(res.totalRevenue || 0);
        setTotalCount(res.totalCount || res.payments?.length || 0);
      } catch {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, methodFilter, dateRange]
  );

  // Reset to page 1 and fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchPayments(1);
  }, [fetchPayments]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchPayments(page);
    },
    [fetchPayments]
  );

  const hasActiveFilters =
    statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setMethodFilter('all');
    setDateRange('all');
    setSearchQuery('');
  };

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Payment Records
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {totalCount.toLocaleString()} transaction
              {totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {/* Quick revenue preview in header */}
        {!loading && totalRevenue > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
            <FiDollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              ₹
              {(totalRevenue / 100).toLocaleString('en-IN', {
                minimumFractionDigits: 0,
              })}
            </span>
            <span className="text-xs text-emerald-600">revenue</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email or payment ID..."
          className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow hover:border-gray-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-500">
          <FiFilter className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Filters
          </span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="captured">Captured</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-colors"
        >
          <option value="all">All Methods</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="netbanking">Net Banking</option>
          <option value="wallet">Wallet</option>
        </select>

        {/* Date range toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                dateRange === opt.value
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Payment Table */}
      <PaymentTable
        payments={payments}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalRevenue={totalRevenue}
      />
    </div>
  );
}