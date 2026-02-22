import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiX,
  FiDownload,
  FiLoader,
  FiUsers,
  FiFilter,
  FiExternalLink,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import UserTable from '../../components/admin/UserTable';
import {
  getUsers,
  getUserDetails,
  toggleBan,
  exportUsersCSV,
} from '../../services/adminService';
import { CATEGORIES, INDIAN_STATES } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, getInitials } from '../../utils/helpers';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [banningUser, setBanningUser] = useState<string | null>(null);
  const [showBanConfirm, setShowBanConfirm] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebounce<string>(searchQuery, 500);

  const fetchUsers = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params: any = { page, limit: 20 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (stateFilter !== 'all') params.state = stateFilter;
        const res = await getUsers(params);
        setUsers(res.users || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || res.users?.length || 0);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, categoryFilter, stateFilter]
  );

  // Reset to page 1 and fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
  }, [fetchUsers]);

  // Fetch when page changes (but not on filter change — that's handled above)
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchUsers(page);
    },
    [fetchUsers]
  );

  const handleViewDetails = async (userId: string) => {
    setLoadingDetails(true);
    setShowUserModal(true);
    document.body.style.overflow = 'hidden';
    try {
      const res = await getUserDetails(userId);
      setSelectedUser(res);
    } catch {
      toast.error('Failed to load user details');
      setShowUserModal(false);
      document.body.style.overflow = '';
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeUserModal = useCallback(() => {
    setShowUserModal(false);
    setSelectedUser(null);
    document.body.style.overflow = '';
  }, []);

  const handleToggleBan = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    setShowBanConfirm(user);
  };

  const confirmBan = async () => {
    if (!showBanConfirm) return;
    setBanningUser(showBanConfirm._id);
    try {
      await toggleBan(showBanConfirm._id);
      toast.success(
        showBanConfirm.isBanned ? 'User unbanned' : 'User banned'
      );
      setShowBanConfirm(null);
      fetchUsers(currentPage);
    } catch {
      toast.error('Failed to update user');
    } finally {
      setBanningUser(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportUsersCSV();
      toast.success('CSV exported!');
    } catch {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBanConfirm) setShowBanConfirm(null);
        else if (showUserModal) closeUserModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [showBanConfirm, showUserModal, closeUserModal]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    stateFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setStateFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {totalCount.toLocaleString()} user{totalCount !== 1 ? 's' : ''}{' '}
              total
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
        >
          {exporting ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiDownload className="w-4 h-4" />
          )}
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, username, or phone..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-colors"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-colors"
        >
          <option value="all">All States</option>
          {INDIAN_STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
        }}
        onViewDetails={handleViewDetails}
        onToggleBan={(userId: string) => handleToggleBan(userId)}
      />

      {/* ─── User Details Modal ─── */}
      {showUserModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeUserModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">User Details</h2>
              <button
                onClick={closeUserModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-40 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded w-28 animate-pulse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : selectedUser ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4">
                    {selectedUser.profilePicture ? (
                      <img
                        src={selectedUser.profilePicture}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xl">
                        {getInitials(selectedUser.fullName || 'U')}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {selectedUser.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{selectedUser.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedUser.isPro
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {selectedUser.isPro ? 'Pro' : 'Free'}
                        </span>
                        {selectedUser.isBanned && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/${selectedUser.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View public profile"
                    >
                      <FiExternalLink className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Email', value: selectedUser.email },
                      {
                        label: 'Phone',
                        value: selectedUser.phone || 'Not provided',
                      },
                      {
                        label: 'Category',
                        value: selectedUser.category || 'Not set',
                      },
                      {
                        label: 'Location',
                        value:
                          [selectedUser.city, selectedUser.state]
                            .filter(Boolean)
                            .join(', ') || 'Not set',
                      },
                      {
                        label: 'Joined',
                        value: formatDate(selectedUser.createdAt),
                      },
                      {
                        label: 'Subscription',
                        value: selectedUser.subscriptionStatus || 'Free',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <p className="text-xs text-gray-500 font-medium mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  {selectedUser.bio && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Bio
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedUser.bio}
                      </p>
                    </div>
                  )}

                  {/* Links */}
                  {selectedUser.links && selectedUser.links.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Links ({selectedUser.links.length})
                      </h4>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {selectedUser.links.map((link: any) => (
                          <div
                            key={link._id}
                            className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                          >
                            <span className="truncate flex-1 text-gray-700">
                              {link.title}
                            </span>
                            <span className="text-xs text-gray-400 ml-3 font-medium tabular-nums">
                              {(link.clickCount || 0).toLocaleString()} clicks
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ─── Ban Confirmation Modal ─── */}
      {showBanConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowBanConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                showBanConfirm.isBanned ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {showBanConfirm.isBanned ? (
                <FiUsers className="w-6 h-6 text-green-600" />
              ) : (
                <FiX className="w-6 h-6 text-red-600" />
              )}
            </div>

            <h2 className="text-lg font-bold text-center mb-1">
              {showBanConfirm.isBanned ? 'Unban User' : 'Ban User'}
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              {showBanConfirm.isBanned
                ? `Are you sure you want to unban ${showBanConfirm.fullName}? They will regain access to their profile.`
                : `Are you sure you want to ban ${showBanConfirm.fullName}? Their public page will be taken offline.`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBanConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBan}
                disabled={banningUser === showBanConfirm._id}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  showBanConfirm.isBanned
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {banningUser === showBanConfirm._id
                  ? 'Processing...'
                  : showBanConfirm.isBanned
                  ? 'Unban User'
                  : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}