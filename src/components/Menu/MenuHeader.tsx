import React from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon';
import { MenuHeaderProps } from './Menu.types';

/**
 * MenuHeader组件 - 菜单头部区域
 * 
 * @param props - MenuHeader组件属性
 * @returns MenuHeader组件
 */
export const MenuHeader: React.FC<MenuHeaderProps> = ({
  collapsed,
  userInfo,
  mode,
  siteName,
  customerName,
  logo,
  locale = 'CN',
  onToggleCollapse,
}) => {
  const renderUserAvatar = () => (
    <div className="relative w-9 h-9">
      <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {userInfo?.name?.charAt(0) || 'U'}
        </span>
      </div>
      {/* 语言标识 */}
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 text-xs text-text-100 border border-gray-200">
        {locale}
      </div>
    </div>
  );

  const renderToggleButton = () => (
    <button
      onClick={onToggleCollapse}
      className="absolute top-4 left-4 w-5 h-5 flex items-center justify-center text-text-64 hover:text-text-100 transition-colors"
      aria-label={collapsed ? '展开菜单' : '收起菜单'}
    >
      <Icon 
        name={collapsed ? 'chevron-right' : 'chevron-left'} 
        size="sm"
        className={clsx(
          'transition-transform duration-200',
          collapsed && 'rotate-180'
        )}
      />
    </button>
  );

  // Account模式 - 显示用户信息
  if (mode === 'account') {
    return (
      <div className="relative">
        {renderToggleButton()}
        <div className="p-4 pt-16">
          {!collapsed && (
            <div className="flex flex-col items-center gap-4">
              {/* 用户头像 */}
              {renderUserAvatar()}
              
              {/* 用户信息 */}
              <div className="flex flex-col items-center gap-0.5 w-full">
                {/* 角色标签 */}
                {userInfo?.role && (
                  <div className="bg-cyan-light rounded px-1.5 py-0.5">
                    <span className="text-xs text-text-light font-medium">
                      {userInfo.role}
                    </span>
                  </div>
                )}
                
                {/* 用户名 */}
                <div className="text-sm font-medium text-text-100 text-center">
                  {userInfo?.name || 'User Name'}
                </div>
                
                {/* 邮箱 */}
                <div className="text-xs text-text-40 text-center">
                  {userInfo?.email || 'user@example.com'}
                </div>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="flex justify-center">
              {renderUserAvatar()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Site模式 - 显示站点信息
  if (mode === 'site') {
    return (
      <div className="relative">
        {renderToggleButton()}
        <div className="p-4 pt-16">
          {!collapsed && (
            <div className="flex flex-col gap-4">
              {/* Logo */}
              {logo && (
                <div className="flex items-center gap-3">
                  <img 
                    src={logo.src} 
                    alt={logo.alt || 'Logo'} 
                    className="w-6 h-6"
                  />
                  <span className="text-sm font-medium text-text-100">
                    {logo.title || 'Omada'}
                  </span>
                </div>
              )}
              
              {/* 站点选择器 */}
              <div className="bg-gray-button rounded-md p-2 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center gap-2">
                  <Icon name="location" size="sm" className="text-text-64" />
                  <span className="text-sm text-text-100">
                    {siteName || 'Site Name 1111'}
                  </span>
                </div>
                <Icon name="chevron-right" size="xs" className="text-text-64" />
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="flex flex-col items-center gap-4">
              {renderUserAvatar()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Portal模式 - 显示客户信息
  if (mode === 'portal') {
    return (
      <div className="relative">
        {renderToggleButton()}
        <div className="p-4 pt-16">
          {!collapsed && (
            <div className="flex flex-col gap-4">
              {/* Omada Logo */}
              {logo && (
                <div className="flex items-center justify-center">
                  <img 
                    src={logo.src} 
                    alt={logo.alt || 'Omada Logo'} 
                    className="h-11"
                  />
                </div>
              )}
              
              {/* 客户选择器 */}
              <div className="bg-gray-button rounded-md p-2 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center gap-2">
                  <Icon name="user" size="sm" className="text-text-64" />
                  <span className="text-sm text-text-100">
                    {customerName || 'Customer Name'}
                  </span>
                </div>
                <Icon name="chevron-right" size="xs" className="text-text-64" />
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="flex justify-center">
              <Icon name="user" size="lg" className="text-text-64" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}; 