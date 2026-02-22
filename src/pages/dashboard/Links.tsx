import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiPlus,
  FiX,
  FiCheck,
  FiLink,
  FiAlertCircle,
  FiZap,
} from 'react-icons/fi';
import { ImSpinner8 } from 'react-icons/im';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import LinkCard from '../../components/dashboard/LinkCard';
import {
  getLinks,
  addLink,
  updateLink,
  deleteLink,
  reorderLinks,
  toggleLink,
} from '../../services/linkService';
import type { Link, LinksResponse } from '../../services/linkService';
import { PLATFORM_OPTIONS } from '../../utils/constants';
import { isValidUrl } from '../../utils/helpers';

interface LinkFormData {
  title: string;
  url: string;
  platform: string;
  isActive: boolean;
}

const INITIAL_FORM: LinkFormData = {
  title: '',
  url: '',
  platform: 'other',
  isActive: true,
};

export default function Links() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [maxLinks, setMaxLinks] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchLinks = useCallback(async () => {
    try {
      const res: LinksResponse = await getLinks();
      setLinks(res.links || []);
      setIsPro(res.isPro);
      setMaxLinks(res.maxLinks);
    } catch (err) {
      console.error('Failed to fetch links:', err);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Focus title input when modal opens
  useEffect(() => {
    if (showModal) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [showModal]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  const openAddModal = () => {
    if (links.length >= maxLinks) {
      toast.error(
        isPro
          ? 'Maximum 50 links reached. Delete some to add more.'
          : `Free plan allows ${maxLinks} links. Upgrade to Pro for 50!`
      );
      return;
    }
    setEditingLink(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (link: Link) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      platform: link.platform || 'other',
      isActive: link.isActive !== false,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLink(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 80) {
      errors.title = 'Title must be 80 characters or less';
    }

    if (!formData.url.trim()) {
      errors.url = 'URL is required';
    } else if (!isValidUrl(formData.url.trim())) {
      errors.url = 'Please enter a valid URL (https://...)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingLink) {
        const res = await updateLink(editingLink._id, {
          title: formData.title.trim(),
          url: formData.url.trim(),
          platform: formData.platform,
          isActive: formData.isActive,
        });
        // Optimistic update
        setLinks((prev) =>
          prev.map((l) =>
            l._id === editingLink._id ? { ...l, ...res.data.link } : l
          )
        );
        toast.success('Link updated!');
      } else {
        const res = await addLink({
          title: formData.title.trim(),
          url: formData.url.trim(),
          platform: formData.platform,
        });
        setLinks((prev) => [...prev, res.data.link]);
        toast.success('Link added!');
      }
      closeModal();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to save link';
      toast.error(message);

      // If upgrade required, close modal and show message
      if (err?.response?.data?.requiresPro) {
        closeModal();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic delete
    const previousLinks = [...links];
    setLinks((prev) => prev.filter((l) => l._id !== id));

    try {
      await deleteLink(id);
      toast.success('Link deleted!');
    } catch (err: any) {
      setLinks(previousLinks);
      toast.error(err?.response?.data?.message || 'Failed to delete link');
    }
  };

  const handleToggle = async (id: string) => {
    // Optimistic toggle
    setLinks((prev) =>
      prev.map((l) =>
        l._id === id ? { ...l, isActive: !l.isActive } : l
      )
    );

    try {
      await toggleLink(id);
    } catch (err: any) {
      // Revert on failure
      setLinks((prev) =>
        prev.map((l) =>
          l._id === id ? { ...l, isActive: !l.isActive } : l
        )
      );
      toast.error('Failed to toggle link');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l._id === active.id);
    const newIndex = links.findIndex((l) => l._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousLinks = [...links];
    const newLinks = arrayMove(links, oldIndex, newIndex);

    setLinks(newLinks);

    try {
      await reorderLinks(newLinks.map((l) => l._id));
    } catch {
      setLinks(previousLinks);
      toast.error('Failed to reorder links');
    }
  };

  const handlePlatformChange = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platform,
      // Auto-fill title only if user hasn't typed anything yet
      title: prev.title === '' || prev.title === getPlatformLabel(prev.platform)
        ? getPlatformLabel(platform)
        : prev.title,
    }));
  };

  const getPlatformLabel = (value: string): string => {
    return PLATFORM_OPTIONS.find((p) => p.value === value)?.label || 'My Link';
  };

  const canAddMore = links.length < maxLinks;
  const linkUsage = Math.round((links.length / maxLinks) * 100);

  // Skeleton loading
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 animate-pulse" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16 animate-pulse mt-1.5" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-60 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Links
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {links.length} / {maxLinks} link{maxLinks !== 1 ? 's' : ''} used
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!canAddMore}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            canAddMore
              ? 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-md active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Link</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Usage Bar */}
      {links.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Link Usage
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {links.length} / {maxLinks}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                linkUsage >= 90
                  ? 'bg-red-500'
                  : linkUsage >= 70
                    ? 'bg-amber-500'
                    : 'bg-linear-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${Math.min(linkUsage, 100)}%` }}
            />
          </div>
          {!isPro && links.length >= maxLinks && (
            <div className="flex items-center gap-2 mt-3 p-2.5 bg-indigo-50 rounded-lg">
              <FiZap className="w-4 h-4 text-indigo-600 shrink-0" />
              <p className="text-xs text-indigo-700">
                <span className="font-semibold">Upgrade to Pro</span> to add up
                to 50 links, custom themes, analytics & more!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Links List */}
      {links.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-14 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FiLink className="w-7 h-7 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            No links yet
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Add your first link to start building your bio page. Share it with
            your audience!
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98]"
          >
            <FiPlus className="w-4 h-4" />
            Add Your First Link
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {links.map((link) => (
                <LinkCard
                  key={link._id}
                  link={link}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-modal-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 z-10 sm:rounded-t-2xl">
              <h2
                id="link-modal-title"
                className="text-lg font-bold text-gray-900"
              >
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-5">
              {/* Platform Selector */}
              <div>
                <label
                  htmlFor="link-platform"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Platform
                </label>
                <select
                  id="link-platform"
                  value={formData.platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors hover:border-gray-300"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="link-title"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="link-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }));
                    if (formErrors.title)
                      setFormErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g., My YouTube Channel"
                  maxLength={80}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.title
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {formErrors.title ? (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {formErrors.title}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`text-xs ${formData.title.length > 70 ? 'text-amber-500' : 'text-gray-400'}`}
                  >
                    {formData.title.length}/80
                  </span>
                </div>
              </div>

              {/* URL */}
              <div>
                <label
                  htmlFor="link-url"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="link-url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }));
                      if (formErrors.url)
                        setFormErrors((prev) => ({ ...prev, url: '' }));
                    }}
                    placeholder="https://..."
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.url
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.url && (
                  <span className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                    <FiAlertCircle className="w-3 h-3" />
                    {formErrors.url}
                  </span>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-sm font-semibold text-gray-700">
                    Active
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.isActive
                      ? 'Visible on your profile'
                      : 'Hidden from your profile'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isActive}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      formData.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-4 sm:p-5 border-t border-gray-100 flex gap-3 sm:rounded-b-2xl">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
              >
                {saving ? (
                  <ImSpinner8 className="w-4 h-4 animate-spin" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
                {saving
                  ? 'Saving...'
                  : editingLink
                    ? 'Update Link'
                    : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}