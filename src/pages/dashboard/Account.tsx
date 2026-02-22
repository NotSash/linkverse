import { useState } from 'react';
import {
  FiLock,
  FiTrash2,
  FiDownload,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiShield,
} from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { changePassword, deleteAccount } from '../../services/authService';
import { validatePassword } from '../../utils/validators';

export default function Account() {
  const { user, logout } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const allChecks = hasMinLength && hasUppercase && hasNumber;
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      logout();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to delete account'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const exportData = {
      profile: {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        bio: user.bio,
        category: user.category,
        city: user.city,
        state: user.state,
      },
      links: user.links || [],
      socialLinks: user.socialLinks || {},
      theme: user.theme || {},
      seoSettings: user.seoSettings || {},
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkverse-${user.username}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const passwordStrength = !newPassword
    ? 0
    : [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account security and data
        </p>
      </div>

      {/* ──── Change Password ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <FiLock className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Change Password
          </h2>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Strength Indicator */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                {/* Strength Bar */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? passwordStrength === 3
                            ? 'bg-green-500'
                            : passwordStrength === 2
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Checks */}
                <div className="space-y-1">
                  {[
                    { check: hasMinLength, label: 'At least 8 characters' },
                    { check: hasUppercase, label: 'One uppercase letter' },
                    { check: hasNumber, label: 'One number' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          item.check
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {item.check ? (
                          <FiCheck className="w-2.5 h-2.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <span
                        className={
                          item.check ? 'text-green-700' : 'text-gray-500'
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                confirmPassword && !passwordsMatch
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1.5">
                Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <FiCheck className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            onClick={handleChangePassword}
            disabled={
              changingPassword ||
              !allChecks ||
              !passwordsMatch ||
              !currentPassword
            }
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {changingPassword ? (
              <ImSpinner8 className="w-4 h-4 animate-spin" />
            ) : (
              <FiShield className="w-4 h-4" />
            )}
            {changingPassword ? 'Changing...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* ──── Export Data ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-gray-50 rounded-xl">
            <FiDownload className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Export Your Data
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Download all your profile data, links, and settings as a JSON file.
        </p>
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97]"
        >
          <FiDownload className="w-4 h-4" />
          Download My Data
        </button>
      </div>

      {/* ──── Danger Zone ──── */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-red-100 p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-base font-bold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, all your data will be permanently
          removed. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97]"
        >
          <FiTrash2 className="w-4 h-4" />
          Delete My Account
        </button>
      </div>

      {/* ──── Delete Confirmation Modal ──── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Your Account
                </h3>
                <p className="text-xs text-gray-500">This cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-800">
                This will permanently delete your profile, links, analytics, and
                all associated data.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Type{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-red-600 font-bold text-xs">
                DELETE
              </code>{' '}
              below to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) =>
                setDeleteConfirmText(e.target.value.toUpperCase())
              }
              placeholder="Type DELETE"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 font-mono tracking-wider"
              autoComplete="off"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <ImSpinner8 className="w-4 h-4 animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}