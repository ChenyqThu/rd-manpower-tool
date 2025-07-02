import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ButtonProps } from './Button.types';

// 加载中的旋转图标组件
const LoadingSpinner = ({ size }: { size: 'small' | 'medium' | 'large' }) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <svg 
      className={clsx('animate-spin', sizeClasses[size])} 
      fill="none" 
      viewBox="0 0 24 24"
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
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  block = false,
  className,
  onClick,
  ...props
}, ref) => {
  // 基础样式
  const baseClasses = clsx(
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'border border-transparent rounded-button',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      'w-full': block,
      'cursor-not-allowed': disabled || loading,
    }
  );

  // 尺寸样式
  const sizeClasses = {
    small: 'px-3 py-1.5 text-button-sm min-h-[32px]',
    medium: 'px-4 py-2 text-button-md min-h-[40px]',
    large: 'px-6 py-3 text-button-lg min-h-[48px]'
  };

  // 变体样式
  const variantClasses = {
    primary: clsx(
      'bg-primary text-white shadow-button',
      'hover:bg-primary-hover hover:shadow-button-hover',
      'focus:ring-primary',
      'active:bg-primary active:shadow-sm'
    ),
    secondary: clsx(
      'bg-gray-button text-text-80 shadow-button',
      'hover:bg-gray-button-hover hover:shadow-button-hover',
      'focus:ring-gray-400',
      'active:bg-gray-300 active:shadow-sm'
    ),
    outline: clsx(
      'bg-transparent text-primary border-primary',
      'hover:bg-primary hover:text-white',
      'focus:ring-primary',
      'active:bg-primary-hover active:text-white'
    ),
    text: clsx(
      'bg-transparent text-text-light',
      'hover:text-text-light-hover hover:bg-gray-50',
      'focus:ring-text-light',
      'active:bg-gray-100'
    ),
    danger: clsx(
      'bg-red text-white shadow-button',
      'hover:bg-red-600 hover:shadow-button-hover',
      'focus:ring-red',
      'active:bg-red-700 active:shadow-sm'
    )
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* 左侧图标或加载图标 */}
      {loading ? (
        <LoadingSpinner size={size} />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      
      {/* 按钮文本 */}
      <span className={clsx({ 'opacity-0': loading && !leftIcon && !rightIcon })}>
        {children}
      </span>
      
      {/* 右侧图标 */}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button'; 