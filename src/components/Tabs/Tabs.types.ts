import { ReactNode } from 'react';

/**
 * 标签页尺寸
 */
export type TabSize = 'small' | 'medium' | 'large';

/**
 * 标签页类型
 */
export type TabType = 'line' | 'card' | 'editable-card';

/**
 * 标签页位置
 */
export type TabPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * 标签项接口
 */
export interface TabItem {
  /** 标签的唯一标识 */
  key: string;
  /** 标签标题 */
  label: ReactNode;
  /** 标签内容 */
  children?: ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 图标 */
  icon?: ReactNode;
  /** 徽标数字 */
  badge?: number | string;
  /** 是否可关闭 */
  closable?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 标签页组件属性
 */
export interface TabsProps {
  /** 标签项列表 */
  items: TabItem[];
  /** 当前激活的标签key */
  activeKey?: string;
  /** 默认激活的标签key */
  defaultActiveKey?: string;
  /** 标签页类型 */
  type?: TabType;
  /** 标签页尺寸 */
  size?: TabSize;
  /** 标签页位置 */
  tabPosition?: TabPosition;
  /** 是否居中显示 */
  centered?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 标签切换回调 */
  onChange?: (activeKey: string) => void;
  /** 标签关闭回调 */
  onEdit?: (targetKey: string, action: 'add' | 'remove') => void;
  /** 新增标签按钮文本 */
  addButtonText?: string;
  /** 是否显示新增按钮 */
  hideAdd?: boolean;
}

/**
 * 标签项组件属性
 */
export interface TabPaneProps {
  /** 标签项数据 */
  tab: TabItem;
  /** 是否激活 */
  active: boolean;
  /** 标签页类型 */
  type: TabType;
  /** 标签页尺寸 */
  size: TabSize;
  /** 标签页位置 */
  position: TabPosition;
  /** 点击回调 */
  onClick: (key: string) => void;
  /** 关闭回调 */
  onClose?: (key: string) => void;
} 