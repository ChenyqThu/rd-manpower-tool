import React from 'react';
import { Icon } from '../Icon';
import { MenuFooterProps } from './Menu.types';

/**
 * MenuFooter组件 - 菜单底部区域
 * 
 * @param props - MenuFooter组件属性
 * @returns MenuFooter组件
 */
export const MenuFooter: React.FC<MenuFooterProps> = ({
  collapsed,
  mode,
  onSignOut,
  onManageCustomer,
}) => {
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  const handleManageCustomer = () => {
    if (onManageCustomer) {
      onManageCustomer();
    }
  };

  // Portal模式 - 显示管理客户按钮
  if (mode === 'portal') {
    return (
      <div className="p-2">
        {!collapsed && (
          <button
            onClick={handleManageCustomer}
            className="w-full bg-white rounded-lg px-2 py-2.5 flex items-center gap-2 text-text-100 hover:bg-gray-50 transition-colors"
          >
            <Icon name="user" size="sm" className="text-text-64" />
            <span className="text-sm font-medium">Manage Customer</span>
          </button>
        )}
        
        {collapsed && (
          <button
            onClick={handleManageCustomer}
            className="w-full flex justify-center py-2.5 text-text-64 hover:text-text-100 transition-colors"
            aria-label="Manage Customer"
          >
            <Icon name="user" size="sm" />
          </button>
        )}
      </div>
    );
  }

  // Account和Site模式 - 显示退出登录按钮
  return (
    <div className="p-2">
      {!collapsed && (
        <button
          onClick={handleSignOut}
          className="w-full bg-gray-button rounded-md px-2 py-2.5 flex items-center justify-center text-text-80 hover:bg-gray-200 transition-colors"
        >
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      )}
      
      {collapsed && (
        <button
          onClick={handleSignOut}
          className="w-full flex justify-center py-2.5 text-text-64 hover:text-text-100 transition-colors"
          aria-label="Sign Out"
        >
          <Icon name="logout" size="sm" />
        </button>
      )}
    </div>
  );
}; 