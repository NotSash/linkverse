import React from 'react';

/* ============================================
   CARD COMPONENT
   Reusable card container with variants
   ============================================ */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'flat' | 'elevated';
  id?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  variant = 'default',
  id,
}) => {
  const paddingClasses: Record<string, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const variantClasses: Record<string, string> = {
    default: 'bg-white rounded-xl shadow-md border border-gray-100',
    outlined: 'bg-white rounded-xl border-2 border-gray-200',
    flat: 'bg-gray-50 rounded-xl',
    elevated: 'bg-white rounded-xl shadow-xl',
  };

  const hoverClasses = hover
    ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
    : 'transition-shadow duration-200';

  const clickClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      id={id}
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${clickClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
};

export default Card;

/* ============================================
   BADGE COMPONENT
   Small pill-shaped label for status/category
   ============================================ */

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'purple' | 'pink';
  icon?: string;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  icon,
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantClasses: Record<string, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  const dotColors: Record<string, string> = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && <span>{icon}</span>}
      {text}
    </span>
  );
};

/* ============================================
   STAT HIGHLIGHT CARD
   For dashboard stat display with trend
   ============================================ */

interface StatHighlightProps {
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatHighlight: React.FC<StatHighlightProps> = ({
  label,
  value,
  sublabel,
  variant = 'default',
  className = '',
}) => {
  const bgClasses: Record<string, string> = {
    default: 'bg-indigo-50 border-indigo-100',
    success: 'bg-green-50 border-green-100',
    warning: 'bg-amber-50 border-amber-100',
    error: 'bg-red-50 border-red-100',
  };

  const textClasses: Record<string, string> = {
    default: 'text-indigo-700',
    success: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
  };

  return (
    <div className={`rounded-lg border p-3 text-center ${bgClasses[variant]} ${className}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textClasses[variant]}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
};
