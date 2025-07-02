# Omada UI 组件库

基于 Figma 设计系统构建的 React + TypeScript 组件库，使用 Tailwind CSS 进行样式管理。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建组件库

```bash
npm run build
```

## 📦 组件

### Button 按钮

基于 Figma 设计的按钮组件，支持多种变体、尺寸和状态。

### Icon 图标

完整的图标组件库，包含70+常用图标，支持多种尺寸和颜色。

### TopBar 顶部栏

页面顶部导航栏组件，支持标题、左右侧内容、分割线等功能。

### Menu 导航菜单

侧边导航菜单组件，支持三种模式：Account、Site、Portal，适用于系统层级简单但功能数量多的场景。

#### 基础用法

```tsx
import { Button, Icon } from 'omada-ui';

function App() {
  return (
    <div>
      <Button>默认按钮</Button>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      
      {/* 图标使用 */}
      <Icon name="star" />
      <Icon name="heart" color="red" size="lg" />
      
      {/* 带图标的按钮 */}
      <Button leftIcon={<Icon name="add" />}>
        添加项目
      </Button>
      
      {/* TopBar 使用 */}
      <TopBar title="页面标题" />
      <TopBar 
        title="管理后台"
        leftContent={<Button variant="text" icon={<Icon name="menu" />} />}
        rightContent={<Button variant="text" icon={<Icon name="user" />} />}
      />
    </div>
  );
}
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'outline' \| 'text' \| 'danger'` | `'primary'` | 按钮变体 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| loading | `boolean` | `false` | 加载状态 |
| disabled | `boolean` | `false` | 禁用状态 |
| block | `boolean` | `false` | 块级按钮 |
| leftIcon | `ReactNode` | - | 左侧图标 |
| rightIcon | `ReactNode` | - | 右侧图标 |
| onClick | `(event: MouseEvent) => void` | - | 点击事件 |

#### 变体示例

```tsx
// 主要按钮 - 墨绿色
<Button variant="primary">主要按钮</Button>

// 次要按钮 - 灰色
<Button variant="secondary">次要按钮</Button>

// 边框按钮
<Button variant="outline">边框按钮</Button>

// 文字按钮
<Button variant="text">文字按钮</Button>

// 危险按钮 - 红色
<Button variant="danger">危险按钮</Button>
```

#### 尺寸示例

```tsx
<Button size="small">小按钮</Button>
<Button size="medium">中等按钮</Button>
<Button size="large">大按钮</Button>
```

#### 状态示例

```tsx
<Button loading>加载中...</Button>
<Button disabled>禁用状态</Button>
```

#### 带图标示例

```tsx
<Button leftIcon={<Icon name="add" />}>添加</Button>
<Button rightIcon={<Icon name="arrow-right" />}>继续</Button>
```

#### Icon Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | `IconName` | - | 图标名称（必填） |
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | 图标尺寸 |
| color | `IconColor` | `'text-80'` | 图标颜色 |
| clickable | `boolean` | `false` | 是否可点击 |
| spinning | `boolean` | `false` | 是否旋转 |
| onClick | `(event: MouseEvent) => void` | - | 点击事件 |

#### Icon 使用示例

```tsx
// 基础图标
<Icon name="star" />

// 自定义尺寸和颜色
<Icon name="heart" size="lg" color="red" />

// 可点击图标
<Icon 
  name="settings" 
  clickable 
  onClick={() => console.log('设置被点击')} 
/>

// 旋转图标（加载状态）
<Icon name="loading" spinning />

// 在按钮中使用
<Button leftIcon={<Icon name="add" />}>
  添加项目
</Button>
```

#### 可用图标

图标库包含以下分类的图标：

- **常用功能**: add, close, check, search, filter, edit, delete, copy, download, upload, refresh, settings, more
- **导航箭头**: arrow-right, arrow-left, arrow-up, arrow-down, chevron-right, chevron-left, chevron-up, chevron-down  
- **状态图标**: info, warning, error, success, loading
- **导航菜单**: home, dashboard, menu, user, users, profile, logout, login
- **文件文档**: file, folder, document, image, video
- **通信交流**: mail, message, notification, bell, phone
- **其他常用**: calendar, clock, location, link, external-link, eye, eye-off, heart, star, bookmark, share, print, lock, unlock

#### TopBar Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | - | 标题文本 |
| leftContent | `ReactNode` | - | 左侧内容 |
| rightContent | `ReactNode` | - | 右侧内容 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 高度尺寸 |
| variant | `'white' \| 'gray'` | `'white'` | 背景色变体 |
| showDivider | `boolean` | `true` | 是否显示分割线 |
| fixed | `boolean` | `false` | 是否固定在顶部 |
| shadow | `boolean` | `false` | 是否显示阴影 |

#### TopBar 使用示例

```tsx
// 基础用法
<TopBar title="页面标题" />

// 带左右侧内容
<TopBar 
  title="管理后台"
  leftContent={<Button variant="text" icon={<Icon name="menu" />} />}
  rightContent={<Button variant="text" icon={<Icon name="user" />} />}
/>

// 固定在顶部
<TopBar title="页面标题" fixed shadow />

// 不同尺寸
<TopBar title="小尺寸" size="small" />
<TopBar title="大尺寸" size="large" />

// 完整示例
<TopBar
  title="Omada 管理后台"
  size="large"
  shadow
  leftContent={
    <Button variant="text" leftIcon={<Icon name="menu" />} />
  }
  rightContent={
    <div className="flex items-center gap-3">
      <Button variant="text" size="small" leftIcon={<Icon name="search" />} />
      <Button variant="text" size="small" leftIcon={<Icon name="notification" />} />
      <Button variant="text" size="small" leftIcon={<Icon name="user" />}>
        管理员
      </Button>
    </div>
  }
/>
```

#### Menu Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| mode | `'account' \| 'site' \| 'portal'` | `'account'` | 菜单模式 |
| items | `MenuItem[]` | `[]` | 菜单项列表 |
| collapsed | `boolean` | `false` | 是否收起 |
| width | `number` | `240` | 展开宽度 |
| collapsedWidth | `number` | `64` | 收起宽度 |
| userInfo | `UserInfo` | - | 用户信息（Account模式） |
| siteName | `string` | - | 站点名称（Site模式） |
| customerName | `string` | - | 客户名称（Portal模式） |
| logo | `LogoInfo` | - | Logo信息 |
| onCollapsedChange | `(collapsed: boolean) => void` | - | 收起状态变化回调 |
| onSignOut | `() => void` | - | 退出登录回调 |
| onManageCustomer | `() => void` | - | 管理客户回调（Portal模式） |

#### Menu 使用示例

```tsx
// Account模式 - 用户账户管理
<Menu
  mode="account"
  items={[
    {
      id: 'account-settings',
      label: 'Account Settings',
      icon: <Icon name="user" size="sm" />,
      active: true,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Icon name="lock" size="sm" />,
    },
    {
      id: 'divider1',
      type: 'divider',
    },
    {
      id: 'license',
      label: 'License',
      icon: <Icon name="document" size="sm" />,
    },
  ]}
  userInfo={{
    name: 'User Name',
    email: 'user@example.com',
    role: 'Admin',
  }}
  onSignOut={() => console.log('Sign out')}
/>

// Site模式 - 站点管理
<Menu
  mode="site"
  items={[
    {
      id: 'group1',
      type: 'group',
      groupTitle: 'Monitoring',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Icon name="dashboard" size="sm" />,
    },
    {
      id: 'devices',
      label: 'Devices',
      icon: <Icon name="settings" size="sm" />,
    },
    {
      id: 'group2',
      type: 'group',
      groupTitle: 'Settings',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Icon name="settings" size="sm" />,
      showArrow: true,
      active: true,
    },
  ]}
  siteName="Site Name 1111"
  logo={{
    src: '/logo.svg',
    title: 'Omada',
  }}
  onSignOut={() => console.log('Sign out')}
/>

// Portal模式 - 客户门户
<Menu
  mode="portal"
  items={[
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Icon name="dashboard" size="sm" />,
      active: true,
    },
    {
      id: 'devices',
      label: 'Devices',
      icon: <Icon name="settings" size="sm" />,
    },
    {
      id: 'divider1',
      type: 'divider',
    },
    {
      id: 'account',
      label: 'Account',
      icon: <Icon name="user" size="sm" />,
      showArrow: true,
    },
  ]}
  customerName="Customer Name"
  logo={{
    src: '/logo.svg',
    title: 'Omada by TP-Link',
  }}
  onManageCustomer={() => console.log('Manage customer')}
/>
```

## 🎨 设计变量

组件库使用了从 Figma 设计系统中提取的设计变量：

### 颜色

- **主色调**: `#00778c` (墨绿色)
- **主色调悬停**: `#009bb6`
- **文本主色**: `#1d2529cc` (80% 透明度)
- **文本次色**: `#1d25293d` (24% 透明度)
- **文本浅色**: `#00bbd4`
- **危险色**: `#ee385c`
- **灰色按钮**: `#f3f4f6`

### 字体

- **按钮小**: 14px/20px
- **按钮中**: 16px/24px  
- **按钮大**: 18px/28px

### 间距

- **按钮圆角**: 6px
- **内边距**: 根据尺寸变化

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS
- **Vite** - 构建工具
- **clsx** - 条件类名工具

## 📁 项目结构

```
src/
├── components/           # 组件目录
│   ├── Button/          # Button 组件
│   │   ├── Button.tsx   # 组件实现
│   │   ├── Button.types.ts # 类型定义
│   │   └── index.ts     # 导出文件
│   ├── Icon/            # Icon 组件
│   │   ├── Icon.tsx     # 组件实现
│   │   ├── Icon.types.ts # 类型定义
│   │   ├── icons.tsx    # 图标库
│   │   └── index.ts     # 导出文件
│   ├── TopBar/          # TopBar 组件
│   │   ├── TopBar.tsx   # 组件实现
│   │   ├── TopBar.types.ts # 类型定义
│   │   ├── TopBarMenu.tsx # 菜单子组件
│   │   └── index.ts     # 导出文件
│   ├── Menu/            # Menu 组件
│   │   ├── Menu.tsx     # 主组件实现
│   │   ├── Menu.types.ts # 类型定义
│   │   ├── MenuHeader.tsx # 头部子组件
│   │   ├── MenuGroup.tsx # 分组子组件
│   │   ├── MenuFooter.tsx # 底部子组件
│   │   └── index.ts     # 导出文件
│   └── index.ts         # 组件统一导出
├── styles/              # 样式文件
│   └── globals.css      # 全局样式
├── examples/            # 示例组件
│   └── ButtonExample.tsx
└── index.ts             # 库入口文件
```

## 🎯 开发指南

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 创建 `ComponentName.tsx` 组件文件
3. 创建 `ComponentName.types.ts` 类型定义文件
4. 创建 `index.ts` 导出文件
5. 在 `src/components/index.ts` 中添加导出

### 样式规范

- 使用 Tailwind CSS 原子类
- 遵循 Figma 设计变量
- 支持暗色模式（可选）
- 确保无障碍访问性

### 类型安全

- 所有组件都必须有完整的 TypeScript 类型定义
- 使用 `forwardRef` 支持 ref 传递
- 导出所有必要的类型供外部使用

## �� 许可证

MIT License 