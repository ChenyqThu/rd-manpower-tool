import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { IconProps } from './Icon.types';
import { iconPaths } from './icons';

export const Icon = forwardRef<SVGSVGElement, IconProps>(({
  name,
  size = 'md',
  color = 'text-80',
  className,
  clickable = false,
  spinning = false,
  onClick,
  ...props
}, ref) => {
  // 尺寸映射
  const sizeClasses = {
    xs: 'w-3 h-3',     // 12px
    sm: 'w-3.5 h-3.5', // 14px
    md: 'w-4 h-4',     // 16px
    lg: 'w-5 h-5',     // 20px
    xl: 'w-6 h-6',     // 24px
    '2xl': 'w-8 h-8'   // 32px
  };

  // 颜色映射
  const colorClasses = {
    'text-100': 'text-text-100',
    'text-90': 'text-text-90',
    'text-80': 'text-text-80',
    'text-64': 'text-text-64',
    'text-50': 'text-text-50',
    'text-40': 'text-text-40',
    'text-24': 'text-text-24',
    'primary': 'text-primary',
    'primary-hover': 'text-primary-hover',
    'theme': 'text-primary-theme',
    'light': 'text-icon-light',
    'light-hover': 'text-icon-light-hover',
    'red': 'text-red',
    'red-alt': 'text-red-alt',
    'purple': 'text-purple',
    'orange': 'text-orange',
    'green': 'text-green',
    'yellow': 'text-yellow',
    'white': 'text-white',
    'inherit': 'text-inherit'
  };

  // 基础样式
  const baseClasses = clsx(
    'inline-block flex-shrink-0',
    sizeClasses[size],
    colorClasses[color],
    {
      'cursor-pointer': clickable,
      'animate-spin': spinning,
      'transition-colors duration-200': !spinning,
    },
    className
  );

  // 获取图标路径
  const iconPath = iconPaths[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (clickable && onClick) {
      onClick(event);
    }
  };

  return (
    <svg
      ref={ref}
      className={baseClasses}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      onClick={handleClick}
      role={clickable ? 'button' : 'img'}
      aria-hidden={!clickable}
      tabIndex={clickable ? 0 : -1}
      {...props}
    >
      {iconPath}
    </svg>
  );
});

Icon.displayName = 'Icon'; 