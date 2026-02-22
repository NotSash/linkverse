import { useState, useRef, useEffect } from 'react';
import {
  FiCamera,
  FiCheck,
  FiX,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  updateProfile,
  updateUsername,
  updateProfilePicture,
  checkUsername,
} from '../../services/authService';
import { useDebounce } from '../../hooks/useDebounce';
import { CATEGORIES, INDIAN_STATES } from '../../utils/constants';
import { validateUsername, validateBio } from '../../utils/validators';
import { getInitials, getProfileUrl } from '../../utils/helpers';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    category: '',
    city: '',
    state: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const debouncedUsername = useDebounce(formData.username, 500);

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
        category: user.category || 'Other',
        city: user.city || '',
        state: user.state || '',
      });
    }
  }, [user]);

  // Username availability check
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername === user?.username) {
      setUsernameStatus('idle');
      return;
    }
    const error = validateUsername(debouncedUsername);
    if (error) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    checkUsername(debouncedUsername)
      .then((res: any) =>
        setUsernameStatus(res.available ? 'available' : 'taken')
      )
      .catch(() => setUsernameStatus('idle'));
  }, [debouncedUsername, user?.username]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setFormData((prev) => ({
        ...prev,
        username: value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    if (previewImage) URL.revokeObjectURL(previewImage);
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUploadPic = async () => {
    if (!selectedFile) return;
    setUploadingPic(true);
    try {
      const fd = new FormData();
      fd.append('profilePicture', selectedFile);
      const res = await updateProfilePicture(fd);
      // Backend returns { success, data: { user, imageUrl } }
      const newPicUrl =
        res.data?.user?.profilePicture ||
        res.data?.imageUrl ||
        res.imageUrl;
      if (newPicUrl) {
        updateUser({ profilePicture: newPicUrl });
      }
      toast.success('Profile picture updated!');
      setSelectedFile(null);
      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to upload picture'
      );
    } finally {
      setUploadingPic(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    const bioError = validateBio(formData.bio);
    if (bioError) {
      toast.error(bioError);
      return;
    }

    setSaving(true);
    try {
      // Update username if changed
      if (formData.username !== user?.username) {
        if (usernameStatus === 'taken') {
          toast.error('Username is already taken');
          setSaving(false);
          return;
        }
        if (usernameStatus === 'invalid') {
          toast.error('Username format is invalid');
          setSaving(false);
          return;
        }
        await updateUsername({ username: formData.username });
      }

      // Update profile
      const res = await updateProfile({
        fullName: formData.fullName.trim(),
        bio: formData.bio.trim(),
        category: formData.category,
        city: formData.city.trim(),
        state: formData.state,
      });

      // Update local auth context
      // Backend returns { success, data: { user } }
      const updatedUser = res.data?.user || {};
      updateUser({
        fullName: formData.fullName.trim(),
        username: formData.username,
        bio: formData.bio.trim(),
        category: formData.category,
        city: formData.city.trim(),
        state: formData.state,
        ...updatedUser,
      });

      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const displayImage = previewImage || user?.profilePicture;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Profile Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your public profile information
        </p>
      </div>

      {/* ──── Profile Picture ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Profile Picture
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            {displayImage ? (
              <img
                src={displayImage}
                alt={user?.fullName || 'Profile'}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-2 border-gray-200">
                {getInitials(user?.fullName || 'U')}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors ring-2 ring-white"
              aria-label="Change profile picture"
            >
              <FiCamera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload/Cancel Buttons */}
          {selectedFile && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleUploadPic}
                disabled={uploadingPic}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 active:scale-[0.97]"
              >
                {uploadingPic ? (
                  <ImSpinner8 className="w-4 h-4 animate-spin" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
                {uploadingPic ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={handleCancelUpload}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          JPG, PNG or WebP. Max 5MB. Recommended 400×400px.
        </p>
      </div>

      {/* ──── Profile Form ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <FiUser className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Profile Information
          </h2>
        </div>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              maxLength={50}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                @
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="yourname"
                maxLength={30}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <ImSpinner8 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
                {usernameStatus === 'available' && (
                  <FiCheck className="w-4 h-4 text-green-500" />
                )}
                {(usernameStatus === 'taken' ||
                  usernameStatus === 'invalid') && (
                  <FiX className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 font-mono">
              {getProfileUrl(formData.username || 'username')}
            </p>
            {usernameStatus === 'taken' && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                This username is already taken
              </p>
            )}
            {usernameStatus === 'available' && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FiCheck className="w-3 h-3" />
                Username is available!
              </p>
            )}
            {usernameStatus === 'invalid' && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                Must start with a letter, 3-30 chars, lowercase + numbers + underscore
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell the world about yourself..."
              maxLength={160}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300 resize-none"
            />
            <p
              className={`text-xs mt-1 text-right ${
                formData.bio.length > 150 ? 'text-amber-500' : 'text-gray-400'
              }`}
            >
              {formData.bio.length}/160
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300 bg-white"
            >
              <option value="">Select your niche</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
                maxLength={50}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-gray-300 bg-white"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !formData.fullName.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              {saving ? (
                <ImSpinner8 className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}