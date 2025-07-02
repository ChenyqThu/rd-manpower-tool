import { ReactNode, HTMLAttributes } from 'react';

/**
 * TopBar 组件的 Props 接口
 */
export interface TopBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * 标题文本
   */
  title?: string;
  
  /**
   * 左侧内容
   */
  leftContent?: ReactNode;
  
  /**
   * 右侧内容
   */
  rightContent?: ReactNode;
  
  /**
   * 是否显示分割线
   * @default true
   */
  showDivider?: boolean;
  
  /**
   * 背景色变体
   * @default 'white'
   */
  variant?: 'white' | 'gray';
  
  /**
   * 高度尺寸
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 是否固定在顶部
   * @default false
   */
  fixed?: boolean;
  
  /**
   * 是否显示阴影
   * @default false
   */
  shadow?: boolean;
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 子元素
   */
  children?: ReactNode;
}

/**
 * TopBar 导航菜单项接口
 */
export interface TopBarMenuItem {
  /**
   * 菜单项标识
   */
  key: string;
  
  /**
   * 菜单项标题
   */
  title: string;
  
  /**
   * 菜单项图标
   */
  icon?: ReactNode;
  
  /**
   * 是否激活
   */
  active?: boolean;
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
  
  /**
   * 点击事件
   */
  onClick?: () => void;
  
  /**
   * 子菜单项
   */
  children?: TopBarMenuItem[];
}

/**
 * TopBar 菜单组件的 Props 接口
 */
export interface TopBarMenuProps {
  /**
   * 菜单项列表
   */
  items: TopBarMenuItem[];
  
  /**
   * 当前激活的菜单项 key
   */
  activeKey?: string;
  
  /**
   * 菜单项点击事件
   */
  onItemClick?: (item: TopBarMenuItem) => void;
  
  /**
   * 自定义类名
   */
  className?: string;
} 