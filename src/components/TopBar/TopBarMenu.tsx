import { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { TopBarMenuProps, TopBarMenuItem } from './TopBar.types';
import { Icon } from '../Icon';

/**
 * TopBar 菜单组件
 * 
 * 用于显示顶部栏的导航菜单，支持单级和多级菜单结构。
 * 提供激活状态、禁用状态和点击事件处理。
 * 
 * @example
 * ```tsx
 * const menuItems = [
 *   { key: 'home', title: '首页', icon: <Icon name="home" /> },
 *   { key: 'dashboard', title: '仪表板', icon: <Icon name="dashboard" /> },
 *   { 
 *     key: 'settings', 
 *     title: '设置', 
 *     icon: <Icon name="settings" />,
 *     children: [
 *       { key: 'profile', title: '个人资料' },
 *       { key: 'account', title: '账户设置' }
 *     ]
 *   }
 * ];
 * 
 * <TopBarMenu 
 *   items={menuItems} 
 *   activeKey="home"
 *   onItemClick={(item) => console.log(item)}
 * />
 * ```
 */
export const TopBarMenu = forwardRef<HTMLDivElement, TopBarMenuProps>(({
  items,
  activeKey,
  onItemClick,
  className,
  ...rest
}, ref) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // 切换子菜单展开状态
  const toggleExpanded = (key: string) => {
    setExpandedKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // 处理菜单项点击
  const handleItemClick = (item: TopBarMenuItem) => {
    if (item.disabled) return;
    
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.key);
    } else {
      onItemClick?.(item);
    }
    
    item.onClick?.();
  };

  // 渲染菜单项
  const renderMenuItem = (item: TopBarMenuItem, level: number = 0) => {
    const isActive = activeKey === item.key;
    const isExpanded = expandedKeys.includes(item.key);
    const hasChildren = item.children && item.children.length > 0;

    const itemClasses = clsx(
      // 基础样式
      'flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200',
      
      // 层级缩进
      {
        'ml-0': level === 0,
        'ml-4': level === 1,
        'ml-8': level === 2,
      },
      
      // 状态样式
      {
        'bg-brand text-white': isActive && !item.disabled,
        'text-text-primary hover:bg-gray-100': !isActive && !item.disabled,
        'text-text-40 cursor-not-allowed': item.disabled,
        'cursor-pointer': !item.disabled,
      }
    );

    const iconClasses = clsx(
      'w-4 h-4 flex-shrink-0',
      {
        'text-white': isActive && !item.disabled,
        'text-icon-40': !isActive || item.disabled,
      }
    );

    const textClasses = clsx(
      'text-sm font-medium truncate',
      {
        'text-white': isActive && !item.disabled,
        'text-text-primary': !isActive && !item.disabled,
        'text-text-40': item.disabled,
      }
    );

    const chevronClasses = clsx(
      'w-4 h-4 flex-shrink-0 transition-transform duration-200',
      {
        'rotate-180': isExpanded,
        'rotate-0': !isExpanded,
        'text-white': isActive && !item.disabled,
        'text-icon-40': !isActive || item.disabled,
      }
    );

    return (
      <div key={item.key}>
        <div
          className={itemClasses}
          onClick={() => handleItemClick(item)}
          role="menuitem"
          tabIndex={item.disabled ? -1 : 0}
          aria-disabled={item.disabled}
          aria-expanded={hasChildren ? isExpanded : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleItemClick(item);
            }
          }}
        >
          {/* 图标 */}
          {item.icon && (
            <span className={iconClasses}>
              {item.icon}
            </span>
          )}
          
          {/* 标题 */}
          <span className={textClasses}>
            {item.title}
          </span>
          
          {/* 展开箭头 */}
          {hasChildren && (
            <Icon 
              name="chevron-down" 
              className={chevronClasses}
            />
          )}
        </div>
        
        {/* 子菜单 */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(childItem => 
              renderMenuItem(childItem, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const containerClasses = clsx(
    'flex flex-col space-y-1',
    className
  );

  return (
    <div
      ref={ref}
      className={containerClasses}
      role="menu"
      {...rest}
    >
      {items.map(item => renderMenuItem(item))}
    </div>
  );
});

// 设置组件显示名称，便于调试
TopBarMenu.displayName = 'TopBarMenu';

export default TopBarMenu; 