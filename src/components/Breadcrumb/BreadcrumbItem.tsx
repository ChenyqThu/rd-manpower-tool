import React from 'react';
import { BreadcrumbItemProps } from './Breadcrumb.types';

// 分隔符图标组件
const SlashSeparator = () => (
  <svg 
    width="5" 
    height="14" 
    viewBox="0 0 5 14" 
    fill="none" 
    className="mx-2.5 mt-[5px]"
  >
    <path 
      d="M0.5 13.5L4.5 0.5" 
      stroke="currentColor" 
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowSeparator = () => (
  <svg 
    width="6" 
    height="10" 
    viewBox="0 0 6 10" 
    fill="none" 
    className="mx-[9px] mt-[7px]"
  >
    <path 
      d="M1 1L5 5L1 9" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 面包屑项组件
 * 
 * 渲染单个面包屑项，包括文本、图标和分隔符
 * 
 * @param props - 面包屑项组件属性
 */
export const BreadcrumbItemComponent: React.FC<BreadcrumbItemProps> = ({
  item,
  separator,
  isLast,
  isCurrent
}) => {
  const { label, href, icon, onClick } = item;

  // 根据状态确定文本颜色
  const getTextColor = () => {
    if (isCurrent) {
      return 'text-[#1d2529]'; // 当前页面：深色
    }
    return 'text-[#1d2529a3]'; // 其他项：40% 透明度
  };

  // 悬停状态颜色
  const getHoverColor = () => {
    if (isCurrent) {
      return 'hover:text-[#1d2529]';
    }
    return 'hover:text-[#4acbd6]'; // 悬停时的青色
  };

  // 按下状态颜色
  const getPressedColor = () => {
    if (isCurrent) {
      return 'active:text-[#1d2529]';
    }
    return 'active:text-[#00bbd4]'; // 按下时的深青色
  };

  const textClasses = `
    text-sm 
    font-normal 
    leading-normal 
    transition-colors 
    duration-150
    ${getTextColor()} 
    ${getHoverColor()} 
    ${getPressedColor()}
  `.trim();

  const separatorClasses = `
    text-[#1d2529a3] 
    text-sm
  `.trim();

  // 渲染内容
  const renderContent = () => (
    <div className="flex items-center gap-1">
      {icon && (
        <span className="w-4 h-4 flex-shrink-0">
          {icon}
        </span>
      )}
      <span className={textClasses}>
        {label}
      </span>
    </div>
  );

  // 渲染分隔符
  const renderSeparator = () => {
    if (isLast) return null;

    const SeparatorComponent = separator === 'slash' ? SlashSeparator : ArrowSeparator;
    
    return (
      <span className={separatorClasses}>
        <SeparatorComponent />
      </span>
    );
  };

  return (
    <>
      {href && !isCurrent ? (
        <a
          href={href}
          onClick={onClick}
          className="flex items-center gap-1 no-underline cursor-pointer"
          aria-current={isCurrent ? 'page' : undefined}
        >
          {renderContent()}
        </a>
      ) : onClick && !isCurrent ? (
        <button
          onClick={onClick}
          className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
          aria-current={isCurrent ? 'page' : undefined}
        >
          {renderContent()}
        </button>
      ) : (
        <span 
          className="flex items-center gap-1"
          aria-current={isCurrent ? 'page' : undefined}
        >
          {renderContent()}
        </span>
      )}
      {renderSeparator()}
    </>
  );
};

export default BreadcrumbItemComponent; 