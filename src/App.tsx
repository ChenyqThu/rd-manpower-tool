import { useState } from 'react';
import { useConfigStore } from './stores/configStore';
import { useDataStore } from './stores/dataStore';
import { TopBar } from './components/TopBar';
import { Tabs } from './components/Tabs';
import { Icon } from './components/Icon';
import { TeamConfig } from './modules/config/TeamConfig';
import { ProjectConfig } from './modules/config/ProjectConfig';
import { TimeConfig } from './modules/config/TimeConfig';
import { ConfigImportExport } from './modules/config/ConfigImportExport';
import { AllocationGrid } from './modules/allocation/AllocationGrid';
import { SankeyChart } from './modules/visualization/SankeyChart';
import { DistributionChart } from './modules/visualization/DistributionChart';
import { ProjectBarChart } from './modules/visualization/ProjectBarChart';
import { exportDashboardToHTML } from './utils/exportDashboard';
import omadaLogoUrl from './assets/omadalogotea.png';

// 导航标签类型
type Tab = 'config' | 'allocation' | 'visualization';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const { teams, projects, timePoints, getTotalCapacity } = useConfigStore();
  const { validationResults, isLoading, allocations } = useDataStore();

  const totalCapacity = getTotalCapacity();
  const hasValidationErrors = validationResults.some(result => !result.isValid);

  // 导出Dashboard功能
  const handleExportDashboard = async () => {
    try {
      await exportDashboardToHTML({
        teams,
        projects,
        timePoints,
        allocations
      });
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请检查数据是否完整');
    }
  };

  // 标签页配置
  const tabItems = [
    {
      key: 'config',
      label: '基础配置',
      icon: <Icon name="settings" size="sm" />,
      children: (
        <div className="space-y-8">
          <ConfigImportExport />
          <TeamConfig />
          <ProjectConfig />
          <TimeConfig />
        </div>
      )
    },
    {
      key: 'allocation',
      label: '人力排布',
      icon: <Icon name="dashboard" size="sm" />,
      children: (
        <div className="space-y-6">
          <AllocationGrid />
        </div>
      )
    },
    {
      key: 'visualization',
      label: 'Dashboard',
      icon: <Icon name="dashboard" size="sm" />,
      children: (
        <div className="space-y-6">
          {/* Dashboard 导出按钮 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Dashboard 导出</h3>
                <p className="text-sm text-gray-600 mt-1">
                  导出当前Dashboard为独立的HTML文件，包含完整的图表数据和交互功能
                </p>
              </div>
              <button
                onClick={handleExportDashboard}
                disabled={teams.length === 0 || projects.length === 0 || timePoints.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="download" size="sm" className="mr-2" />
                导出 HTML
              </button>
            </div>
          </div>
          
          <ProjectBarChart />
          <SankeyChart />
          <DistributionChart />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <TopBar
        title="Omada 研发人力排布系统"
        size="large"
        shadow
        leftContent={
          <div className="flex items-center">
            {/* Omada Logo */}
            <div className="h-8 flex items-center">
              <img 
                src={omadaLogoUrl} 
                alt="Omada Logo"
                className="h-full object-contain"
              />
            </div>
            {/* 垂直分割线 */}
            <div className="w-px h-6 bg-gray-300 mx-4"></div>
          </div>
        }
        rightContent={
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {hasValidationErrors && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>配置异常</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Icon name="loading" spinning size="sm" />
                <span>处理中...</span>
              </div>
            )}
            <div className="hidden md:flex items-center space-x-2">
              <span>总人力: {totalCapacity}人</span>
              <span>·</span>
              <span>团队: {teams.length}</span>
              <span>·</span>
              <span>项目: {projects.length}</span>
              <span>·</span>
              <span>时间点: {timePoints.length}</span>
            </div>
            <div className="text-gray-500">v1.0</div>
          </div>
        }
      />

      {/* 主要内容区域 */}
      <main className="w-full p-6">
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as Tab)}
          type="line"
          size="medium"
          className="w-full"
        />
      </main>
    </div>
  );
}

export default App;
