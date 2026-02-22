import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiInfo,
  FiUpload,
  FiX,
  FiCheck,
  FiLoader,
  FiSearch,
  FiGlobe,
  FiImage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getSEO, updateSEO } from '../../services/paymentService';
import { getProfileUrl } from '../../utils/helpers';

// ============================================
// Types
// ============================================

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  defaults: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  effective: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  limits: {
    metaTitle: { max: number; current: number };
    metaDescription: { max: number; current: number };
  };
}

// ============================================
// Skeleton
// ============================================

function SEOSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="h-7 bg-gray-200 rounded w-36 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-72 mt-2 animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
          <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-11 bg-gray-200 rounded-lg w-44 animate-pulse" />
      </div>
    </div>
  );
}

// ============================================
// Character Counter
// ============================================

function CharCounter({
  current,
  max,
  warnAt,
}: {
  current: number;
  max: number;
  warnAt: number;
}) {
  const isWarning = current > warnAt;
  const isOver = current > max;

  return (
    <span
      className={`text-xs tabular-nums ${
        isOver
          ? 'text-red-500 font-medium'
          : isWarning
          ? 'text-amber-500'
          : 'text-gray-400'
      }`}
    >
      {current}/{max}
    </span>
  );
}

// ============================================
// Main Component
// ============================================

export default function SEO() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeOgImage, setRemoveOgImage] = useState(false);

  // Original values for change detection
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalDesc, setOriginalDesc] = useState('');

  // ---- Fetch SEO settings ----
  useEffect(() => {
    async function fetchSEO() {
      try {
        const data: SeoData = await getSEO();
        const title = data?.metaTitle || '';
        const desc = data?.metaDescription || '';
        const img = data?.ogImage || '';

        setMetaTitle(title);
        setMetaDescription(desc);
        setOgImage(img);

        setOriginalTitle(title);
        setOriginalDesc(desc);
      } catch (err) {
        console.error('Failed to fetch SEO settings:', err);
        toast.error('Failed to load SEO settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSEO();
  }, []);

  // ---- Track changes ----
  useEffect(() => {
    const changed =
      metaTitle !== originalTitle ||
      metaDescription !== originalDesc ||
      selectedFile !== null ||
      removeOgImage;
    setHasChanges(changed);
  }, [
    metaTitle,
    metaDescription,
    selectedFile,
    removeOgImage,
    originalTitle,
    originalDesc,
  ]);

  // ---- File handling ----
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setSelectedFile(file);
      setRemoveOgImage(false);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Cleanup previous preview URL
      return () => URL.revokeObjectURL(objectUrl);
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRemoveOgImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  // ---- Save ----
  const handleSave = async () => {
    if (metaTitle.length > 60) {
      toast.error('Meta title must be 60 characters or less');
      return;
    }
    if (metaDescription.length > 160) {
      toast.error('Meta description must be 160 characters or less');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('metaTitle', metaTitle.trim());
      formData.append('metaDescription', metaDescription.trim());

      if (selectedFile) {
        formData.append('ogImage', selectedFile);
      }

      if (removeOgImage && !selectedFile) {
        formData.append('removeOgImage', 'true');
      }

      const res = await updateSEO(formData);
      const seoData = res?.data || res;

      // Update local state with server response
      const newOgImage = seoData?.ogImage || seoData?.effective?.image || '';
      setOgImage(newOgImage);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setRemoveOgImage(false);

      // Update original values
      setOriginalTitle(metaTitle.trim());
      setOriginalDesc(metaDescription.trim());

      // Update auth context
      updateUser({
        seoSettings: {
          metaTitle: metaTitle.trim(),
          metaDescription: metaDescription.trim(),
          ogImage: newOgImage,
        },
      });

      toast.success('SEO settings saved!');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to save SEO settings'
      );
    } finally {
      setSaving(false);
    }
  };

  // ---- Computed values ----
  const effectiveTitle =
    metaTitle || `${user?.fullName || 'Your Name'} | LinkVerse`;
  const effectiveDescription =
    metaDescription || user?.bio || 'Check out my LinkVerse page';
  const effectiveImage =
    previewUrl ||
    (removeOgImage ? '' : ogImage) ||
    user?.profilePicture ||
    '';
  const profileUrl = getProfileUrl(user?.username || 'username');

  if (loading) return <SEOSkeleton />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          SEO Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Optimize how your page appears in search results and social media
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6">
        {/* Meta Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <FiSearch className="w-4 h-4 text-gray-400" />
            Meta Title
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={`${user?.fullName || 'Your Name'} | LinkVerse`}
            maxLength={70}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">
              Appears as the page title in search results
            </p>
            <CharCounter current={metaTitle.length} max={60} warnAt={50} />
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <FiGlobe className="w-4 h-4 text-gray-400" />
            Meta Description
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={user?.bio || 'A short description of your page...'}
            maxLength={200}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">
              Shown below the title in search results
            </p>
            <CharCounter
              current={metaDescription.length}
              max={160}
              warnAt={140}
            />
          </div>
        </div>

        {/* OG Image */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <FiImage className="w-4 h-4 text-gray-400" />
            Social Share Image (OG Image)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Recommended: 1200 × 630 pixels. Shown when your page is shared on
            social media.
          </p>

          {/* Image preview */}
          {effectiveImage && !removeOgImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200 mb-3">
              <img
                src={effectiveImage}
                alt="OG Preview"
                className="w-full h-44 sm:h-52 object-cover bg-gray-50"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                title="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-gray-200 hover:border-gray-300"
            >
              <FiUpload className="w-4 h-4" />
              {effectiveImage && !removeOgImage
                ? 'Change Image'
                : 'Upload Image'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
          >
            {saving ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiCheck className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save SEO Settings'}
          </button>
          {hasChanges && !saving && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Google Search Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FiSearch className="w-4 h-4 text-gray-400" />
          Google Search Preview
        </h2>
        <div className="max-w-xl">
          <p className="text-sm text-green-700 truncate">{profileUrl}</p>
          <p className="text-lg text-blue-700 font-medium mt-0.5 truncate hover:underline cursor-default">
            {effectiveTitle}
          </p>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
            {effectiveDescription}
          </p>
        </div>
      </div>

      {/* Social Card Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FiGlobe className="w-4 h-4 text-gray-400" />
          Social Share Preview
        </h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden max-w-md shadow-sm">
          {effectiveImage && !removeOgImage ? (
            <img
              src={effectiveImage}
              alt="Preview"
              className="w-full h-44 object-cover bg-gray-100"
            />
          ) : (
            <div className="w-full h-44 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-center">
                <span className="text-white text-4xl font-bold">LV</span>
                <p className="text-white/70 text-xs mt-1">LinkVerse</p>
              </div>
            </div>
          )}
          <div className="p-3.5 bg-gray-50">
            <p className="text-[11px] text-gray-500 uppercase tracking-wide truncate">
              {new URL(profileUrl).hostname}
            </p>
            <p className="font-semibold text-gray-900 text-sm mt-1 truncate">
              {effectiveTitle}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {effectiveDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
        <FiInfo className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 leading-relaxed">
          <p>
            These settings help your LinkVerse page appear better in Google
            search results and when shared on social media platforms like
            Facebook, Twitter, and WhatsApp.
          </p>
          <p className="mt-1.5 text-blue-600 text-xs">
            Changes may take a few minutes to reflect across platforms.
          </p>
        </div>
      </div>
    </div>
  );
}