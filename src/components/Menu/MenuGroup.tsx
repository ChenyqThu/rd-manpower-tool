import React from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon';
import { MenuGroupProps, MenuItem } from './Menu.types';

/**
 * MenuGroup组件 - 菜单项分组
 * 
 * @param props - MenuGroup组件属性
 * @returns MenuGroup组件
 */
export const MenuGroup: React.FC<MenuGroupProps> = ({
  title,
  items,
  collapsed,
  onItemClick,
}) => {
  const renderMenuItem = (item: MenuItem) => {
    if (item.type === 'divider') {
      return (
        <div key={item.id} className="h-px bg-gray-divider my-1" />
      );
    }

    const handleClick = () => {
      if (!item.disabled && item.onClick) {
        item.onClick();
      }
      if (onItemClick) {
        onItemClick(item);
      }
    };

    const menuItemClasses = clsx(
      'flex items-center gap-2 px-2 py-2.5 rounded-md transition-all duration-200 cursor-pointer group',
      {
        // 激活状态
        'bg-gray-button text-text-light': item.active,
        // 默认状态
        'text-text-64 hover:bg-gray-50 hover:text-text-100': !item.active && !item.disabled,
        // 禁用状态
        'text-text-24 cursor-not-allowed': item.disabled,
        // 收起时的样式
        'justify-center px-2': collapsed,
      }
    );

    return (
      <div
        key={item.id}
        className={menuItemClasses}
        onClick={handleClick}
        role="menuitem"
        tabIndex={item.disabled ? -1 : 0}
        aria-disabled={item.disabled}
      >
        {/* 图标 */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {item.iconUrl ? (
            <img 
              src={item.iconUrl} 
              alt={item.label}
              className="w-5 h-5"
            />
          ) : item.icon ? (
            item.icon
          ) : (
            <Icon 
              name="file" 
              size="sm" 
              className={clsx(
                'transition-colors',
                item.active ? 'text-text-light' : 'text-text-64'
              )}
            />
          )}
        </div>

        {/* 标签文字 */}
        {!collapsed && (
          <span className="flex-1 text-sm font-medium">
            {item.label}
          </span>
        )}

        {/* 箭头 */}
        {!collapsed && item.showArrow && (
          <Icon 
            name="chevron-right" 
            size="xs" 
            className={clsx(
              'text-text-64 transition-colors',
              'group-hover:text-text-100'
            )}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      {/* 分组标题 */}
      {!collapsed && title && (
        <div className="px-2 py-2">
          <span className="text-xs font-medium text-text-24 uppercase tracking-wider">
            {title}
          </span>
        </div>
      )}

      {/* 菜单项 */}
      <div className="flex flex-col gap-1">
        {items.map(renderMenuItem)}
      </div>
    </div>
  );
}; 