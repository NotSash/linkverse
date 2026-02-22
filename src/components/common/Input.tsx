import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { cn } from '@/utils/cn';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  rows?: number;
  prefix?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url';
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      type = 'text',
      placeholder,
      value = '',
      onChange,
      onBlur,
      onKeyDown,
      error,
      helperText,
      icon,
      rightElement,
      maxLength,
      disabled = false,
      required = false,
      name,
      id,
      className = '',
      autoFocus = false,
      autoComplete,
      rows = 4,
      prefix,
      inputMode,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-') || '';

    // Auto-grow textarea
    useEffect(() => {
      if (type === 'textarea' && internalTextareaRef.current) {
        internalTextareaRef.current.style.height = 'auto';
        internalTextareaRef.current.style.height = `${internalTextareaRef.current.scrollHeight}px`;
      }
    }, [value, type]);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
    const hasRightElement = rightElement || type === 'password';

    const inputClasses = cn(
      'w-full border rounded-lg px-4 py-2.5',
      'text-base sm:text-sm',
      'text-gray-900 placeholder-gray-400',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      error
        ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/50'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
      disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white',
      icon && 'pl-10',
      hasRightElement && 'pr-10',
      prefix && 'pl-14'
    );

    const sharedProps = {
      id: inputId,
      name,
      value,
      onChange,
      onBlur,
      onKeyDown,
      placeholder,
      disabled,
      required,
      maxLength,
      autoFocus,
      'aria-invalid': !!error as boolean,
      'aria-describedby': error
        ? `${inputId}-error`
        : helperText
          ? `${inputId}-helper`
          : undefined,
    };

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}

          {/* Prefix text */}
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium text-sm">{prefix}</span>
            </div>
          )}

          {/* Input or Textarea */}
          {type === 'textarea' ? (
            <textarea
              ref={(el) => {
                (internalTextareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                if (typeof ref === 'function') ref(el);
                else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
              }}
              {...sharedProps}
              rows={rows}
              className={cn(inputClasses, 'resize-y min-h-[100px]')}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              {...sharedProps}
              type={inputType}
              autoComplete={autoComplete}
              inputMode={inputMode}
              className={inputClasses}
            />
          )}

          {/* Right side — password toggle or custom element */}
          {type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 touch-target justify-center"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          ) : rightElement ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          ) : null}
        </div>

        {/* Bottom — error, helper, character count */}
        {(error || helperText || maxLength) && (
          <div className="flex justify-between items-start mt-1">
            <div className="flex-1">
              {error && (
                <p id={`${inputId}-error`} className="text-red-500 text-xs" role="alert">
                  {error}
                </p>
              )}
              {!error && helperText && (
                <p id={`${inputId}-helper`} className="text-gray-400 text-xs">
                  {helperText}
                </p>
              )}
            </div>
            {maxLength && value.length > 0 && (
              <span
                className={cn(
                  'text-xs ml-2 shrink-0',
                  value.length > maxLength
                    ? 'text-red-500 font-medium'
                    : value.length > maxLength * 0.9
                      ? 'text-amber-500'
                      : 'text-gray-400'
                )}
              >
                {value.length}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;