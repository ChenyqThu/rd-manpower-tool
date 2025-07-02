import { ReactNode } from 'react';

/**
 * 菜单项接口
 */
export interface MenuItem {
  /** 菜单项ID */
  id: string;
  /** 菜单项标签 */
  label?: string;
  /** 菜单项图标 */
  icon?: ReactNode;
  /** 菜单项图标URL（支持localhost资源） */
  iconUrl?: string;
  /** 是否激活 */
  active?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 子菜单项 */
  children?: MenuItem[];
  /** 是否显示箭头 */
  showArrow?: boolean;
  /** 菜单项类型 */
  type?: 'default' | 'divider' | 'group';
  /** 分组标题（当type为group时使用） */
  groupTitle?: string;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户名 */
  name: string;
  /** 用户邮箱 */
  email: string;
  /** 用户头像URL */
  avatar?: string;
  /** 用户角色标签 */
  role?: string;
}

/**
 * Menu组件Props接口
 */
export interface MenuProps {
  /** 自定义类名 */
  className?: string;
  /** 是否收起 */
  collapsed?: boolean;
  /** 收起状态改变回调 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 菜单项列表 */
  items: MenuItem[];
  /** 用户信息 */
  userInfo?: UserInfo;
  /** 是否显示用户信息 */
  showUserInfo?: boolean;
  /** 是否显示底部操作区域 */
  showFooter?: boolean;
  /** 底部操作区域内容 */
  footer?: ReactNode;
  /** 菜单宽度 */
  width?: number;
  /** 收起时的宽度 */
  collapsedWidth?: number;
  /** 菜单模式 */
  mode?: 'account' | 'site' | 'portal';
  /** 站点名称（site模式使用） */
  siteName?: string;
  /** 客户名称（portal模式使用） */
  customerName?: string;
  /** Logo信息 */
  logo?: {
    src: string;
    alt?: string;
    title?: string;
  };
  /** 语言标识 */
  locale?: string;
  /** 退出登录回调 */
  onSignOut?: () => void;
  /** 管理客户回调（portal模式） */
  onManageCustomer?: () => void;
}

/**
 * MenuHeader组件Props接口
 */
export interface MenuHeaderProps {
  /** 是否收起 */
  collapsed: boolean;
  /** 用户信息 */
  userInfo?: UserInfo;
  /** 菜单模式 */
  mode: 'account' | 'site' | 'portal';
  /** 站点名称 */
  siteName?: string;
  /** 客户名称 */
  customerName?: string;
  /** Logo信息 */
  logo?: {
    src: string;
    alt?: string;
    title?: string;
  };
  /** 语言标识 */
  locale?: string;
  /** 收起按钮点击回调 */
  onToggleCollapse?: () => void;
}

/**
 * MenuFooter组件Props接口
 */
export interface MenuFooterProps {
  /** 是否收起 */
  collapsed: boolean;
  /** 菜单模式 */
  mode: 'account' | 'site' | 'portal';
  /** 退出登录回调 */
  onSignOut?: () => void;
  /** 管理客户回调 */
  onManageCustomer?: () => void;
}

/**
 * MenuGroup组件Props接口
 */
export interface MenuGroupProps {
  /** 分组标题 */
  title?: string;
  /** 子菜单项 */
  items: MenuItem[];
  /** 是否收起 */
  collapsed: boolean;
  /** 菜单项点击回调 */
  onItemClick?: (item: MenuItem) => void;
} 