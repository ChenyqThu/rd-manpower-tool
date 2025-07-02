import React, { forwardRef } from 'react';
import { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb.types';
import { BreadcrumbItemComponent } from './BreadcrumbItem';

/**
 * 面包屑组件
 * 
 * 面包屑是辅助导航模式，用于显示页面在层次结构内的位置，并允许用户向上返回。
 * 主要用于页面层级较深的辅助导航（≥3个层级），帮助用户定位当前页面所在位置。
 * 
 * @example
 * ```tsx
 * const breadcrumbItems = [
 *   { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
 *   { label: 'Internet', href: '/settings/internet' },
 *   { label: 'WAN Settings', current: true }
 * ];
 * 
 * <Breadcrumb 
 *   items={breadcrumbItems} 
 *   separator="slash"
 * />
 * ```
 * 
 * @param props - 面包屑组件属性
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    items, 
    separator = 'slash', 
    className = '', 
    maxItems = 10,
    collapseText = '...',
    ...props 
  }, ref) => {
    // 处理项目折叠逻辑
    const processedItems = React.useMemo(() => {
      if (items.length <= maxItems) {
        return items;
      }

      const firstItem = items[0];
      const lastItems = items.slice(-(maxItems - 2));
      const collapseItem: BreadcrumbItem = {
        label: collapseText,
        onClick: () => {
          // 可以在这里添加展开逻辑
        }
      };

      return [firstItem, collapseItem, ...lastItems];
    }, [items, maxItems, collapseText]);

    return (
      <nav
        ref={ref}
        className={`flex items-center gap-1 ${className}`}
        aria-label="面包屑导航"
        {...props}
      >
        <ol className="flex items-center gap-1 list-none m-0 p-0">
          {processedItems.map((item, index) => {
            const isLast = index === processedItems.length - 1;
            const isCurrent = item.current || isLast;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center">
                <BreadcrumbItemComponent
                  item={item}
                  separator={separator}
                  isLast={isLast}
                  isCurrent={isCurrent}
                />
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb; 