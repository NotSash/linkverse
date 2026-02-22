import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  href?: string;
  target?: string;
  title?: string;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md focus:ring-indigo-500',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400',
  outline:
    'border-2 border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 focus:ring-indigo-500',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  gradient:
    'bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 text-white shadow-sm hover:shadow-md focus:ring-indigo-500',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-8',
  md: 'px-5 py-2.5 text-sm gap-2 min-h-10',
  lg: 'px-6 py-3 text-base gap-2 min-h-12',
};

const Spinner = ({ className = '' }: { className?: string }) => (
  <svg
    className={cn('animate-spin h-4 w-4', className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  onClick,
  type = 'button',
  className = '',
  href,
  target,
  title,
}) => {
  const isDisabled = disabled || isLoading;

  const classes = cn(
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'active:scale-[0.97]',
    isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    fullWidth && 'w-full',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const content = (
    <>
      {isLoading ? (
        <Spinner />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !isLoading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target || '_self'}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={classes}
        title={title}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      title={title}
    >
      {content}
    </button>
  );
};

export default Button;