import { ReactNode } from 'react';

/**
 * 面包屑分隔符类型
 */
export type BreadcrumbSeparator = 'slash' | 'arrow';

/**
 * 面包屑项状态
 */
export type BreadcrumbItemState = 'normal' | 'hover' | 'pressed' | 'current';

/**
 * 面包屑项接口
 */
export interface BreadcrumbItem {
  /** 显示文本 */
  label: string;
  /** 链接地址 */
  href?: string;
  /** 图标 */
  icon?: ReactNode;
  /** 是否为当前页面 */
  current?: boolean;
  /** 点击事件处理 */
  onClick?: () => void;
}

/**
 * 面包屑组件属性
 */
export interface BreadcrumbProps {
  /** 面包屑项列表 */
  items: BreadcrumbItem[];
  /** 分隔符类型 */
  separator?: BreadcrumbSeparator;
  /** 自定义类名 */
  className?: string;
  /** 最大显示项数，超出会折叠 */
  maxItems?: number;
  /** 折叠时显示的文本 */
  collapseText?: string;
}

/**
 * 面包屑项组件属性
 */
export interface BreadcrumbItemProps {
  /** 面包屑项数据 */
  item: BreadcrumbItem;
  /** 分隔符类型 */
  separator: BreadcrumbSeparator;
  /** 是否为最后一项 */
  isLast: boolean;
  /** 是否为当前页面 */
  isCurrent: boolean;
} 