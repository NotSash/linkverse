import {
  FiEye,
  FiSlash,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
} from 'react-icons/fi';
import { formatDate, getInitials } from '../../utils/helpers';

/* ─────────────────── Types ─────────────────── */
interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  category?: string;
  profilePicture?: string;
  isPro?: boolean;
  isBanned?: boolean;
  subscriptionStatus?: string;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onViewDetails: (userId: string) => void;
  onToggleBan: (userId: string, currentlyBanned: boolean) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

/* ─────────────────── Status Badge ─────────────────── */
function StatusBadge({ user }: { user: User }) {
  if (user.isBanned)
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
        Banned
      </span>
    );
  if (user.isPro && user.subscriptionStatus === 'active')
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
        Active
      </span>
    );
  if (user.subscriptionStatus === 'expired')
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
        Expired
      </span>
    );
  return (
    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
      Free
    </span>
  );
}

/* ─────────────────── User Avatar ─────────────────── */
function UserAvatar({
  user,
  size = 'sm',
}: {
  user: User;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

  if (user.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt=""
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0`}
    >
      {getInitials(user.fullName)}
    </div>
  );
}

/* ─────────────────── Skeleton ─────────────────── */
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── Pagination ─────────────────── */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        'ellipsis',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      'ellipsis',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis',
      totalPages,
    ];
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <FiChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((item, idx) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                currentPage === item
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <span className="hidden sm:inline">Next</span>
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────── Main Component ─────────────────── */
export default function UserTable({
  users,
  onViewDetails,
  onToggleBan,
  loading,
  pagination,
}: UserTableProps) {
  if (loading) return <TableSkeleton />;

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiUsers className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No users found</p>
        <p className="text-gray-400 text-sm mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600 truncate block max-w-[200px]">
                    {user.email}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {user.category ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {user.category}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge user={user} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(user._id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleBan(user._id, !!user.isBanned)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.isBanned
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={user.isBanned ? 'Unban User' : 'Ban User'}
                    >
                      {user.isBanned ? (
                        <FiCheck className="w-4 h-4" />
                      ) : (
                        <FiSlash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card Layout ── */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar user={user} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
              <StatusBadge user={user} />
            </div>

            <div className="mt-3 text-xs text-gray-500 space-y-1.5">
              <p className="truncate">{user.email}</p>
              <div className="flex items-center justify-between">
                <span>Joined {formatDate(user.createdAt)}</span>
                {user.category && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    {user.category}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => onViewDetails(user._id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <FiEye className="w-3.5 h-3.5" />
                View
              </button>
              <button
                onClick={() => onToggleBan(user._id, !!user.isBanned)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  user.isBanned
                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                    : 'text-red-600 bg-red-50 hover:bg-red-100'
                }`}
              >
                {user.isBanned ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5" /> Unban
                  </>
                ) : (
                  <>
                    <FiSlash className="w-3.5 h-3.5" /> Ban
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}