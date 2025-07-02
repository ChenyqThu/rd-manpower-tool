import React from 'react';
import { TabPaneProps } from './Tabs.types';

// 关闭图标组件
const CloseIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="none"
    className="ml-1"
  >
    <path 
      d="M9 3L3 9M3 3L9 9" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 标签项组件
 * 
 * 渲染单个标签项，包括文本、图标、徽标和关闭按钮
 * 
 * @param props - 标签项组件属性
 */
export const TabPane: React.FC<TabPaneProps> = ({
  tab,
  active,
  type,
  size,
  position,
  onClick,
  onClose
}) => {
  const { key, label, disabled, icon, badge, closable, className = '' } = tab;

  // 根据尺寸确定样式
  const getSizeClasses = () => {
    const isVertical = position === 'left' || position === 'right';
    
    switch (size) {
      case 'small':
        return isVertical 
          ? 'px-3 py-2 text-sm min-h-[32px]' 
          : 'px-3 py-1.5 text-sm min-w-[60px]';
      case 'large':
        return isVertical 
          ? 'px-4 py-3 text-base min-h-[48px]' 
          : 'px-4 py-2.5 text-base min-w-[80px]';
      default: // medium
        return isVertical 
          ? 'px-3 py-2.5 text-sm min-h-[40px]' 
          : 'px-3 py-2 text-sm min-w-[70px]';
    }
  };

  // 根据类型和状态确定样式
  const getTypeClasses = () => {
    const baseClasses = 'relative cursor-pointer transition-all duration-200 flex items-center justify-center';
    
    if (disabled) {
      return `${baseClasses} cursor-not-allowed opacity-40`;
    }

    switch (type) {
      case 'card':
        return active
          ? `${baseClasses} bg-white border border-[#E7E7E7] border-b-white text-[#1d2529] font-medium`
          : `${baseClasses} bg-[#f7f8fa] border border-[#E7E7E7] text-[#1d2529a3] hover:text-[#1d2529] hover:bg-white`;
      
      case 'editable-card':
        return active
          ? `${baseClasses} bg-white border border-[#E7E7E7] border-b-white text-[#1d2529] font-medium rounded-t-md`
          : `${baseClasses} bg-[#f7f8fa] border border-[#E7E7E7] text-[#1d2529a3] hover:text-[#1d2529] hover:bg-white rounded-t-md`;
      
      default: // line
        return active
          ? `${baseClasses} text-[#00bbd4] font-medium border-b-2 border-[#00bbd4]`
          : `${baseClasses} text-[#1d2529a3] hover:text-[#4acbd6] border-b-2 border-transparent`;
    }
  };

  // 处理点击事件
  const handleClick = () => {
    if (!disabled) {
      onClick(key);
    }
  };

  // 处理关闭事件
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose && !disabled) {
      onClose(key);
    }
  };

  // 渲染徽标
  const renderBadge = () => {
    if (!badge) return null;
    
    return (
      <span className="ml-1 px-1.5 py-0.5 bg-[#ee385c] text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center">
        {badge}
      </span>
    );
  };

  // 渲染内容
  const renderContent = () => (
    <div className="flex items-center gap-1">
      {icon && (
        <span className="flex-shrink-0 flex">
          {icon}
        </span>
      )}
      <span className="flex-shrink-0">
        {label}
      </span>
      {renderBadge()}
      {closable && !disabled && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-1 p-0.5 hover:bg-black/10 rounded transition-colors"
          aria-label="关闭标签"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );

  const tabClasses = `
    ${getSizeClasses()}
    ${getTypeClasses()}
    ${className}
  `.trim();

  return (
    <div
      className={tabClasses}
      onClick={handleClick}
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {renderContent()}
    </div>
  );
};

export default TabPane; 