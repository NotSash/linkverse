import { useState } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiMoreVertical,
  FiEyeOff,
  FiBarChart2,
} from 'react-icons/fi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Link } from '../../services/linkService';

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function LinkCard({
  link,
  onEdit,
  onDelete,
  onToggle,
}: LinkCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    onDelete(link._id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl border transition-all duration-200 ${
        isDragging
          ? 'shadow-xl border-indigo-200 opacity-90 scale-[1.02] z-50 ring-2 ring-indigo-100'
          : 'shadow-sm border-gray-100 hover:shadow-md hover:border-gray-200'
      } ${!link.isActive ? 'bg-gray-50/50' : ''}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing p-1.5 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-50 touch-none transition-colors"
          aria-label="Drag to reorder"
        >
          <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Link Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold text-sm sm:text-base truncate ${
                link.isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {link.title}
            </h3>
            {!link.isActive && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                <FiEyeOff className="w-2.5 h-2.5" />
                Hidden
              </span>
            )}
          </div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-indigo-500 truncate max-w-[180px] sm:max-w-[320px] mt-0.5 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">
              {link.url.replace(/^https?:\/\/(www\.)?/, '')}
            </span>
            <FiExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <FiBarChart2 className="w-3 h-3" />
            <span>
              {link.clickCount || 0} click
              {link.clickCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Toggle */}
          <button
            onClick={() => onToggle(link._id)}
            role="switch"
            aria-checked={link.isActive}
            aria-label={link.isActive ? 'Deactivate link' : 'Activate link'}
            className={`relative w-9 h-5 sm:w-10 sm:h-[22px] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
              link.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-[18px] sm:h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                link.isActive
                  ? 'translate-x-4 sm:translate-x-[18px]'
                  : 'translate-x-0'
              }`}
            />
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(link)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label="Edit link"
          >
            <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete link"
          >
            <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-red-700 font-medium">
              Delete "{link.title}"?
            </p>
            <div className="flex gap-2 ml-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}