import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 
  | 'primary'      // 墨绿色主要按钮
  | 'secondary'    // 灰色次要按钮  
  | 'outline'      // 边框按钮
  | 'text'         // 文字按钮
  | 'danger';      // 危险按钮

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮变体样式
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * 是否为加载状态
   * @default false
   */
  loading?: boolean;
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  
  /**
   * 按钮内容
   */
  children: ReactNode;
  
  /**
   * 左侧图标
   */
  leftIcon?: ReactNode;
  
  /**
   * 右侧图标
   */
  rightIcon?: ReactNode;
  
  /**
   * 是否为块级按钮（占满宽度）
   * @default false
   */
  block?: boolean;
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 点击事件处理函数
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
} 