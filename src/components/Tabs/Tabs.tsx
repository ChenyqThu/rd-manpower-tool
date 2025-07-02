import { useState, useEffect, forwardRef } from 'react';
import { TabsProps } from './Tabs.types';
import { TabPane } from './TabPane';

// 添加按钮图标
const AddIcon = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 14 14" 
    fill="none"
  >
    <path 
      d="M7 3V11M3 7H11" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 标签页组件
 * 
 * 标签页用于在多个相关内容之间进行切换，是一种常见的导航模式。
 * 支持多种类型（线条、卡片、可编辑卡片）、尺寸和位置配置。
 * 
 * @example
 * ```tsx
 * const tabItems = [
 *   { key: '1', label: '标签一', children: <div>内容一</div> },
 *   { key: '2', label: '标签二', children: <div>内容二</div>, icon: <Icon name="star" /> },
 *   { key: '3', label: '标签三', children: <div>内容三</div>, badge: 5 }
 * ];
 * 
 * <Tabs 
 *   items={tabItems}
 *   type="line"
 *   size="medium"
 *   onChange={(key) => console.log('切换到:', key)}
 * />
 * ```
 * 
 * @param props - 标签页组件属性
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    items,
    activeKey,
    defaultActiveKey,
    type = 'line',
    size = 'medium',
    tabPosition = 'top',
    centered = false,
    className = '',
    onChange,
    onEdit,
    addButtonText = '添加',
    hideAdd = false,
    ...props 
  }, ref) => {
    // 内部状态管理
    const [internalActiveKey, setInternalActiveKey] = useState<string>(() => {
      return activeKey || defaultActiveKey || items[0]?.key || '';
    });

    // 当外部 activeKey 改变时更新内部状态
    useEffect(() => {
      if (activeKey !== undefined) {
        setInternalActiveKey(activeKey);
      }
    }, [activeKey]);

    const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;

    // 处理标签切换
    const handleTabClick = (key: string) => {
      if (activeKey === undefined) {
        setInternalActiveKey(key);
      }
      onChange?.(key);
    };

    // 处理标签关闭
    const handleTabClose = (key: string) => {
      onEdit?.(key, 'remove');
    };

    // 处理添加标签
    const handleAddTab = () => {
      onEdit?.('', 'add');
    };

    // 获取容器样式
    const getContainerClasses = () => {
      const isVertical = tabPosition === 'left' || tabPosition === 'right';
      const baseClasses = 'w-full';
      
      if (isVertical) {
        return `${baseClasses} flex`;
      }
      
      return baseClasses;
    };

    // 获取标签栏样式
    const getTabBarClasses = () => {
      const isVertical = tabPosition === 'left' || tabPosition === 'right';
      let classes = 'flex';
      
      if (isVertical) {
        classes += ' flex-col border-r border-[#E7E7E7] min-w-[120px]';
        if (tabPosition === 'right') {
          classes += ' order-2 border-r-0 border-l';
        }
      } else {
        classes += ' flex-row';
        if (type === 'card' || type === 'editable-card') {
          classes += ' border-b border-[#E7E7E7]';
        } else {
          classes += ' border-b border-[#E7E7E7]';
        }
        
        if (tabPosition === 'bottom') {
          classes += ' order-2 border-b-0 border-t';
        }
        
        if (centered) {
          classes += ' justify-center';
        }
      }
      
      return classes;
    };

    // 获取内容区域样式
    const getContentClasses = () => {
      const isVertical = tabPosition === 'left' || tabPosition === 'right';
      let classes = 'flex-1';
      
      if (isVertical) {
        classes += ' p-4';
      } else {
        classes += ' pt-4';
      }
      
      return classes;
    };

    // 渲染添加按钮
    const renderAddButton = () => {
      if (hideAdd || type !== 'editable-card') return null;
      
      return (
        <div
          className={`
            flex items-center justify-center cursor-pointer transition-colors duration-200
            px-3 py-2 text-[#1d2529a3] hover:text-[#4acbd6] border-b-2 border-transparent
            ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-base' : 'text-sm'}
          `}
          onClick={handleAddTab}
          role="button"
          aria-label={addButtonText}
        >
          <AddIcon />
          <span className="ml-1">{addButtonText}</span>
        </div>
      );
    };

    // 渲染标签栏
    const renderTabBar = () => (
      <div className={getTabBarClasses()}>
        {items.map((item) => (
          <TabPane
            key={item.key}
            tab={item}
            active={currentActiveKey === item.key}
            type={type}
            size={size}
            position={tabPosition}
            onClick={handleTabClick}
            onClose={item.closable ? handleTabClose : undefined}
          />
        ))}
        {renderAddButton()}
      </div>
    );

    // 渲染内容区域
    const renderContent = () => {
      const activeTab = items.find(item => item.key === currentActiveKey);
      
      if (!activeTab?.children) return null;
      
      return (
        <div className={getContentClasses()}>
          {activeTab.children}
        </div>
      );
    };

    const containerClasses = `
      ${getContainerClasses()}
      ${className}
    `.trim();

    return (
      <div
        ref={ref}
        className={containerClasses}
        {...props}
      >
        {renderTabBar()}
        {renderContent()}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

export default Tabs; 