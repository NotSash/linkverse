import { useState, useEffect, useRef } from 'react';
import { FiCheck, FiRotateCcw, FiUpload, FiTrash2 } from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getTheme, updateTheme } from '../../services/linkService';
import {
  PRESET_THEMES,
  FONT_OPTIONS,
  BUTTON_STYLES,
  DEFAULT_THEME,
} from '../../utils/constants';
import ThemePreview from '../../components/dashboard/ThemePreview';

interface ThemeState {
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  buttonStyle: string;
  backgroundType: string;
  gradientFrom: string;
  gradientTo: string;
  backgroundImage: string;
  [key: string]: string;
}

export default function Appearance() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<ThemeState>({ ...DEFAULT_THEME } as ThemeState);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const data = await getTheme();
        if (data?.theme) {
          setTheme({ ...DEFAULT_THEME, ...data.theme } as ThemeState);
          setActivePreset(data.activePreset || null);
        } else if (user?.theme) {
          setTheme({ ...DEFAULT_THEME, ...user.theme } as ThemeState);
        }
      } catch {
        if (user?.theme) {
          setTheme({ ...DEFAULT_THEME, ...user.theme } as ThemeState);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTheme();
  }, [user]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (bgPreview) URL.revokeObjectURL(bgPreview);
    };
  }, [bgPreview]);

  const handleChange = (key: keyof ThemeState, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const applyPreset = (preset: (typeof PRESET_THEMES)[number]) => {
    setTheme((prev) => ({
      ...prev,
      backgroundColor: preset.backgroundColor,
      cardColor: preset.cardColor,
      textColor: preset.textColor,
      buttonColor: preset.buttonColor,
      buttonTextColor: preset.buttonTextColor,
      fontFamily: preset.fontFamily,
      buttonStyle: preset.buttonStyle,
      backgroundType: preset.backgroundType,
      gradientFrom: preset.gradientFrom || DEFAULT_THEME.gradientFrom,
      gradientTo: preset.gradientTo || DEFAULT_THEME.gradientTo,
    }));
    setActivePreset(preset.name);
    toast.success(`Applied "${preset.name}" theme`);
  };

  const handleReset = () => {
    setTheme({ ...DEFAULT_THEME } as ThemeState);
    setActivePreset(null);
    setBgFile(null);
    if (bgPreview) URL.revokeObjectURL(bgPreview);
    setBgPreview(null);
    toast.success('Reset to default theme');
  };

  const handleBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (bgPreview) URL.revokeObjectURL(bgPreview);
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
    handleChange('backgroundType', 'image');
  };

  const handleRemoveBg = () => {
    setBgFile(null);
    if (bgPreview) URL.revokeObjectURL(bgPreview);
    setBgPreview(null);
    setTheme((prev) => ({
      ...prev,
      backgroundImage: '',
      backgroundType: 'solid',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (bgFile) {
        // Use FormData when uploading background image
        const formData = new FormData();
        formData.append('backgroundImage', bgFile);
        formData.append('backgroundColor', theme.backgroundColor);
        formData.append('cardColor', theme.cardColor);
        formData.append('textColor', theme.textColor);
        formData.append('buttonColor', theme.buttonColor);
        formData.append('buttonTextColor', theme.buttonTextColor);
        formData.append('fontFamily', theme.fontFamily);
        formData.append('buttonStyle', theme.buttonStyle);
        formData.append('backgroundType', 'image');
        formData.append('gradientFrom', theme.gradientFrom);
        formData.append('gradientTo', theme.gradientTo);
        await updateTheme(formData);
        setBgFile(null);
        if (bgPreview) URL.revokeObjectURL(bgPreview);
        setBgPreview(null);
      } else {
        // Send JSON for non-image updates (don't send backgroundImage URL back)
        const { backgroundImage, ...themeData } = theme;
        const payload: Record<string, any> = { ...themeData };

        // If user removed background, tell backend
        if (!backgroundImage && user?.theme?.backgroundImage) {
          payload.removeBackground = true;
        }

        await updateTheme(payload);
      }

      updateUser({ theme });
      toast.success('Theme saved!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  // Color picker helper
  const ColorPicker = ({
    label,
    value,
    field,
  }: {
    label: string;
    value: string;
    field: keyof ThemeState;
  }) => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-lg"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 font-mono">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 bg-gray-200 rounded-lg w-36 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-52 animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-28 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="h-5 bg-gray-200 rounded w-28 animate-pulse mb-4" />
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[520px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Appearance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize how your public page looks
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiRotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50 active:scale-[0.97]"
          >
            {saving ? (
              <ImSpinner8 className="w-4 h-4 animate-spin" />
            ) : (
              <FiCheck className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ──── Controls ──── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Background */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Background
            </h3>
            {/* Type switcher */}
            <div className="flex gap-2 mb-5">
              {(['solid', 'gradient', 'image'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleChange('backgroundType', type)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    theme.backgroundType === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {theme.backgroundType === 'solid' && (
              <ColorPicker
                label="Background Color"
                value={theme.backgroundColor}
                field="backgroundColor"
              />
            )}

            {theme.backgroundType === 'gradient' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-6">
                  <ColorPicker
                    label="From"
                    value={theme.gradientFrom || '#6366f1'}
                    field="gradientFrom"
                  />
                  <ColorPicker
                    label="To"
                    value={theme.gradientTo || '#ec4899'}
                    field="gradientTo"
                  />
                </div>
                {/* Gradient preview strip */}
                <div
                  className="h-8 rounded-xl"
                  style={{
                    background: `linear-gradient(to right, ${theme.gradientFrom || '#6366f1'}, ${theme.gradientTo || '#ec4899'})`,
                  }}
                />
              </div>
            )}

            {theme.backgroundType === 'image' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgFileSelect}
                  className="hidden"
                />
                {bgPreview || theme.backgroundImage ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={bgPreview || theme.backgroundImage}
                      alt="Background"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                      >
                        Change
                      </button>
                      <button
                        onClick={handleRemoveBg}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                  >
                    <FiUpload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-500 font-medium">
                      Upload background image
                    </span>
                    <span className="text-xs text-gray-400">
                      JPG, PNG, WebP • Max 5MB
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker
                label="Card Color"
                value={theme.cardColor}
                field="cardColor"
              />
              <ColorPicker
                label="Text Color"
                value={theme.textColor}
                field="textColor"
              />
              <ColorPicker
                label="Button Color"
                value={theme.buttonColor}
                field="buttonColor"
              />
              <ColorPicker
                label="Button Text"
                value={theme.buttonTextColor}
                field="buttonTextColor"
              />
            </div>
          </div>

          {/* Button Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Button Style
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {BUTTON_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleChange('buttonStyle', style.value)}
                  className={`p-3 border-2 rounded-xl transition-all ${
                    theme.buttonStyle === style.value
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`h-7 mx-auto transition-all ${
                      style.value === 'pill'
                        ? 'rounded-full'
                        : style.value === 'rounded'
                          ? 'rounded-lg'
                          : style.value === 'square'
                            ? 'rounded-none'
                            : style.value === 'outline'
                              ? 'bg-transparent border-2! rounded-lg'
                              : 'rounded-lg shadow-lg'
                    }`}
                    style={{
                      backgroundColor:
                        style.value === 'outline'
                          ? 'transparent'
                          : theme.buttonColor,
                      border:
                        style.value === 'outline'
                          ? `2px solid ${theme.buttonColor}`
                          : 'none',
                    }}
                  />
                  <p className="text-[10px] text-gray-500 mt-1.5 text-center font-medium">
                    {style.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Typography
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Font Family
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => handleChange('fontFamily', font.value)}
                      className={`p-3 border-2 rounded-xl text-left transition-all ${
                        theme.fontFamily === font.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p
                        className="text-sm font-semibold text-gray-800"
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {font.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Font preview */}
              <div
                className="p-3 rounded-xl bg-gray-50 text-sm text-gray-700"
                style={{ fontFamily: theme.fontFamily }}
              >
                The quick brown fox jumps over the lazy dog. 🦊
              </div>
            </div>
          </div>

          {/* Preset Themes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PRESET_THEMES.map((preset, index) => {
                const isActive = activePreset === preset.name;
                return (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className={`group text-center p-2 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-1.5 relative overflow-hidden"
                      style={{
                        background:
                          preset.backgroundType === 'gradient'
                            ? `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`
                            : preset.backgroundColor,
                      }}
                    >
                      <div
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full"
                        style={{ backgroundColor: preset.buttonColor }}
                      />
                      {isActive && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <FiCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 truncate font-medium">
                      {preset.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ──── Preview ──── */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Live Preview
            </h3>
            <ThemePreview
              theme={{
                ...theme,
                backgroundImage: bgPreview || theme.backgroundImage,
              }}
              user={{
                fullName: user?.fullName || 'Your Name',
                username: user?.username || 'username',
                bio: user?.bio || 'Your bio will appear here',
                profilePicture: user?.profilePicture || '',
              }}
              links={
                user?.links?.slice(0, 3).map((l: any) => ({
                  title: l.title,
                  platform: l.platform,
                })) || [
                  { title: 'My YouTube Channel', platform: 'youtube_video' },
                  { title: 'Follow on Instagram', platform: 'instagram_post' },
                  { title: 'Visit My Website', platform: 'website' },
                ]
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}