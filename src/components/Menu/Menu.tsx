import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { MenuProps } from './Menu.types';
import { MenuHeader } from './MenuHeader';
import { MenuGroup } from './MenuGroup';
import { MenuFooter } from './MenuFooter';

/**
 * Menu组件 - 侧边导航菜单
 * 
 * 系统层级简单但功能数量多时，可使用侧边导航菜单进行"左右布局"。
 * 竖向排列的形式可以展示更多的菜单项。
 * 
 * @param props - Menu组件属性
 * @param ref - Menu组件引用
 * @returns Menu组件
 * 
 * @example
 * ```tsx
 * // Account模式
 * <Menu
 *   mode="account"
 *   items={menuItems}
 *   userInfo={{
 *     name: "User Name",
 *     email: "user@example.com",
 *     role: "Role"
 *   }}
 *   onSignOut={() => console.log('Sign out')}
 * />
 * 
 * // Site模式
 * <Menu
 *   mode="site"
 *   items={menuItems}
 *   siteName="Site Name 1111"
 *   logo={{
 *     src: "/logo.svg",
 *     title: "Omada"
 *   }}
 * />
 * 
 * // Portal模式
 * <Menu
 *   mode="portal"
 *   items={menuItems}
 *   customerName="Customer Name"
 *   onManageCustomer={() => console.log('Manage customer')}
 * />
 * ```
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(({
  className,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  items = [],
  userInfo,
  showUserInfo = true,
  showFooter = true,
  footer,
  width = 232,
  collapsedWidth = 52,
  mode = 'account',
  siteName,
  customerName,
  logo,
  locale = 'CN',
  onSignOut,
  onManageCustomer,
  ...props
}, ref) => {
  // 内部状态管理收起状态
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // 使用受控或非受控模式
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  
  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
    }
    
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

  const handleItemClick = (item: any) => {
    // 可以在这里添加全局的菜单项点击处理逻辑
    console.log('Menu item clicked:', item);
  };

  // 根据收起状态计算宽度
  const menuWidth = collapsed ? collapsedWidth : width;

  // 将菜单项按组分类
  const groupedItems = React.useMemo(() => {
    const groups: Array<{ title?: string; items: any[] }> = [];
    let currentGroup: { title?: string; items: any[] } = { items: [] };

    items.forEach(item => {
      if (item.type === 'group') {
        // 如果当前组有内容，先保存
        if (currentGroup.items.length > 0) {
          groups.push(currentGroup);
        }
        // 开始新组
        currentGroup = { title: item.groupTitle, items: [] };
      } else {
        currentGroup.items.push(item);
      }
    });

    // 保存最后一个组
    if (currentGroup.items.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [items]);

  const menuClasses = clsx(
    'bg-white flex flex-col h-full transition-all duration-300 ease-in-out',
    'border-r border-gray-200 shadow-sm',
    className
  );

  return (
    <div
      ref={ref}
      className={menuClasses}
      style={{ width: menuWidth }}
      role="navigation"
      aria-label="主导航菜单"
      {...props}
    >
      {/* 头部区域 */}
      {showUserInfo && (
        <MenuHeader
          collapsed={collapsed}
          userInfo={userInfo}
          mode={mode}
          siteName={siteName}
          customerName={customerName}
          logo={logo}
          locale={locale}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      {/* 菜单内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-6">
          {groupedItems.map((group, index) => (
            <MenuGroup
              key={index}
              title={group.title}
              items={group.items}
              collapsed={collapsed}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </div>

      {/* 底部区域 */}
      {showFooter && (
        <div className="mt-auto">
          {footer || (
            <MenuFooter
              collapsed={collapsed}
              mode={mode}
              onSignOut={onSignOut}
              onManageCustomer={onManageCustomer}
            />
          )}
        </div>
      )}
    </div>
  );
});

Menu.displayName = 'Menu'; 