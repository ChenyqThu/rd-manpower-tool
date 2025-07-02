import { forwardRef } from 'react';
import clsx from 'clsx';
import { TopBarProps } from './TopBar.types';

/**
 * TopBar 顶部栏组件
 * 
 * 提供页面顶部导航栏功能，支持标题、左右侧内容、分割线等功能。
 * 遵循 Omada 设计系统规范，支持多种样式变体和尺寸。
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <TopBar title="页面标题" />
 * 
 * // 带左右侧内容
 * <TopBar 
 *   title="页面标题"
 *   leftContent={<Button variant="text" icon={<Icon name="menu" />} />}
 *   rightContent={<Button variant="text" icon={<Icon name="user" />} />}
 * />
 * 
 * // 固定在顶部
 * <TopBar title="页面标题" fixed shadow />
 * ```
 */
export const TopBar = forwardRef<HTMLDivElement, TopBarProps>(({
  title,
  leftContent,
  rightContent,
  showDivider = true,
  variant = 'white',
  size = 'medium',
  fixed = false,
  shadow = false,
  className,
  children,
  ...rest
}, ref) => {
  // 容器样式类名
  const containerClasses = clsx(
    // 基础样式
    'flex items-center justify-between w-full',
    
    // 高度尺寸
    {
      'h-12': size === 'small',      // 48px
      'h-14': size === 'medium',     // 56px
      'h-16': size === 'large',      // 64px
    },
    
    // 背景色变体
    {
      'bg-white': variant === 'white',
      'bg-gray-bg': variant === 'gray',
    },
    
    // 固定定位
    {
      'fixed top-0 left-0 right-0 z-50': fixed,
    },
    
    // 阴影效果
    {
      'shadow-sm': shadow,
    },
    
    // 分割线
    {
      'border-b border-gray-divider': showDivider,
    },
    
    // 内边距
    'px-4 sm:px-6',
    
    className
  );

  // 标题样式类名
  const titleClasses = clsx(
    'text-text-primary font-medium truncate',
    {
      'text-sm': size === 'small',
      'text-base': size === 'medium',
      'text-lg': size === 'large',
    }
  );

  // 左侧内容容器样式
  const leftContentClasses = 'flex items-center gap-2 flex-shrink-0';
  
  // 右侧内容容器样式
  const rightContentClasses = 'flex items-center gap-2 flex-shrink-0';

  // 中间内容区域样式
  const centerContentClasses = 'flex-1 flex items-center justify-start px-2 min-w-0';

  return (
    <div
      ref={ref}
      className={containerClasses}
      role="banner"
      {...rest}
    >
      {/* 左侧内容区域 */}
      {leftContent && (
        <div className={leftContentClasses}>
          {leftContent}
        </div>
      )}
      
      {/* 中间内容区域 */}
      <div className={centerContentClasses}>
        {title && (
          <h1 className={titleClasses}>
            {title}
          </h1>
        )}
        {children}
      </div>
      
      {/* 右侧内容区域 */}
      {rightContent && (
        <div className={rightContentClasses}>
          {rightContent}
        </div>
      )}
    </div>
  );
});

// 设置组件显示名称，便于调试
TopBar.displayName = 'TopBar';

export default TopBar; 