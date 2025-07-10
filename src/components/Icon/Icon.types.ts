import { SVGAttributes } from 'react';

export type IconSize = 
  | 'xs'      // 12px
  | 'sm'      // 14px
  | 'md'      // 16px
  | 'lg'      // 20px
  | 'xl'      // 24px
  | '2xl';    // 32px

export type IconColor = 
  | 'text-100'    // 最深文本色
  | 'text-90'     // 90% 透明度
  | 'text-80'     // 80% 透明度
  | 'text-64'     // 64% 透明度
  | 'text-50'     // 50% 透明度
  | 'text-40'     // 40% 透明度
  | 'text-24'     // 24% 透明度
  | 'primary'     // 主色调
  | 'primary-hover' // 主色调悬停
  | 'theme'       // 主题色
  | 'light'       // 浅色图标
  | 'light-hover' // 浅色图标悬停
  | 'red'         // 危险色
  | 'red-alt'     // 替代红色
  | 'purple'      // 紫色
  | 'orange'      // 橙色
  | 'green'       // 绿色
  | 'yellow'      // 黄色
  | 'white'       // 白色
  | 'inherit';    // 继承父元素颜色

export type IconName = 
  // 常用功能图标
  | 'add'
  | 'close'
  | 'check'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'chevron-down'
  | 'search'
  | 'filter'
  | 'edit'
  | 'delete'
  | 'copy'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'settings'
  | 'more'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'loading'
  // 导航图标
  | 'home'
  | 'dashboard'
  | 'menu'
  | 'user'
  | 'users'
  | 'profile'
  | 'logout'
  | 'login'
  // 文件和文档
  | 'file'
  | 'folder'
  | 'document'
  | 'image'
  | 'video'
  // 通信图标
  | 'mail'
  | 'message'
  | 'notification'
  | 'bell'
  | 'phone'
  // 其他常用图标
  | 'calendar'
  | 'clock'
  | 'location'
  | 'link'
  | 'external-link'
  | 'eye'
  | 'eye-off'
  | 'heart'
  | 'star'
  | 'bookmark'
  | 'share'
  | 'print'
  | 'lock'
  | 'unlock'
  | 'calculate'
  | 'info-circle';

export interface IconProps extends Omit<SVGAttributes<SVGElement>, 'color'> {
  /**
   * 图标名称
   */
  name: IconName;
  
  /**
   * 图标尺寸
   * @default 'md'
   */
  size?: IconSize;
  
  /**
   * 图标颜色
   * @default 'text-80'
   */
  color?: IconColor;
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 是否可点击（添加指针样式）
   * @default false
   */
  clickable?: boolean;
  
  /**
   * 是否旋转（用于加载图标）
   * @default false
   */
  spinning?: boolean;
  
  /**
   * 点击事件处理函数
   */
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
} 