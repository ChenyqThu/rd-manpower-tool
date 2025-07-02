import React, { useState, useRef } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { Icon } from '../../components/Icon';
import type { Team, Project, TimePoint } from '../../types/data';

interface ConfigData {
  teams: Team[];
  projects: Project[];
  timePoints: TimePoint[];
  metadata: {
    exportTime: string;
    version: string;
  };
}

export const ConfigImportExport: React.FC = () => {
  const { teams, projects, timePoints, importConfig } = useConfigStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 导出基础配置到JSON
  const handleExportConfig = () => {
    try {
      setIsLoading(true);

      const configData: ConfigData = {
        teams: teams.map(team => ({
          id: team.id,
          name: team.name,
          capacity: team.capacity,
          description: team.description || '',
          color: team.color,
          badge: team.badge || ''
        })),
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          color: project.color,
          description: project.description || '',
          teams: project.teams || [],
          releaseDate: project.releaseDate || '',
          pattern: project.pattern || 'solid'
        })),
        timePoints: timePoints.map(timePoint => ({
          id: timePoint.id,
          name: timePoint.name,
          date: timePoint.date,
          description: timePoint.description || '',
          type: timePoint.type
        })),
        metadata: {
          exportTime: new Date().toISOString(),
          version: '1.0'
        }
      };

      const jsonString = JSON.stringify(configData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `基础配置_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', `成功导出基础配置到 JSON 文件`);
    } catch (error) {
      console.error('Export error:', error);
      showMessage('error', '导出失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 从JSON导入基础配置
  const handleImportConfig = (file: File) => {
    try {
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const configData: ConfigData = JSON.parse(jsonString);

          // 验证数据格式
          if (!configData.teams || !configData.projects || !configData.timePoints) {
            throw new Error('配置文件格式不正确，缺少必要的数据字段');
          }

          // 验证团队数据
          const validTeams = configData.teams.filter(team => 
            team.name && typeof team.capacity === 'number' && team.color
          );

          // 验证项目数据
          const validProjects = configData.projects.filter(project => 
            project.name && project.status && project.color
          );

          // 验证时间点数据
          const validTimePoints = configData.timePoints.filter(timePoint => 
            timePoint.name && timePoint.date && timePoint.type
          );

          if (validTeams.length === 0 && validProjects.length === 0 && validTimePoints.length === 0) {
            throw new Error('配置文件中没有找到有效的数据');
          }

          // 确保必要的属性存在
          const importedTeams = validTeams.map(team => ({
            ...team,
            description: team.description || '',
            badge: team.badge || ''
          }));

          const importedProjects = validProjects.map(project => ({
            ...project,
            description: project.description || '',
            teams: project.teams || [],
            releaseDate: project.releaseDate || '',
            pattern: project.pattern || 'solid' as const
          }));

          const importedTimePoints = validTimePoints.map(timePoint => ({
            ...timePoint,
            description: timePoint.description || ''
          }));

          // 导入配置
          importConfig({
            teams: importedTeams,
            projects: importedProjects,
            timePoints: importedTimePoints
          });

          const importedItems = [];
          if (importedTeams.length > 0) importedItems.push(`团队配置 ${importedTeams.length} 项`);
          if (importedProjects.length > 0) importedItems.push(`项目配置 ${importedProjects.length} 项`);
          if (importedTimePoints.length > 0) importedItems.push(`时间点配置 ${importedTimePoints.length} 项`);

          showMessage('success', `成功导入：${importedItems.join('，')}`);

        } catch (error) {
          console.error('Parse error:', error);
          showMessage('error', `解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsText(file, 'utf-8');
    } catch (error) {
      console.error('Import error:', error);
      showMessage('error', '读取文件失败');
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        showMessage('error', '请选择JSON文件（.json）');
        return;
      }
      handleImportConfig(file);
    }
  };

  // 下载配置模板
  const handleDownloadTemplate = () => {
    try {
      const templateData: ConfigData = {
        teams: [
          {
            id: "team-1",
            name: "前端团队",
            capacity: 10,
            description: "负责前端开发",
            color: "#3498db",
            badge: "①"
          },
          {
            id: "team-2", 
            name: "后端团队",
            capacity: 12,
            description: "负责后端开发",
            color: "#e74c3c",
            badge: "②"
          },
          {
            id: "team-3",
            name: "测试团队", 
            capacity: 8,
            description: "负责质量保证",
            color: "#2ecc71",
            badge: "③"
          }
        ],
        projects: [
          {
            id: "project-1",
            name: "项目A",
            status: "development",
            color: "#3498db",
            description: "重要项目A",
            teams: ["team-1", "team-2"],
            releaseDate: "2024-09",
            pattern: "solid"
          },
          {
            id: "project-2",
            name: "项目B", 
            status: "planning",
            color: "#e74c3c",
            description: "计划中项目B",
            teams: ["team-2", "team-3"],
            releaseDate: "2024-11",
            pattern: "stripes"
          },
          {
            id: "project-3",
            name: "项目C",
            status: "completed",
            color: "#2ecc71", 
            description: "已完成项目C",
            teams: ["team-1"],
            releaseDate: "2024-07",
            pattern: "dots"
          }
        ],
        timePoints: [
                     {
             id: "time-1",
             name: "第一阶段",
             date: "2024-07",
             description: "项目启动",
             type: "current"
           },
           {
             id: "time-2", 
             name: "第二阶段",
             date: "2024-09",
             description: "版本发布",
             type: "release"
           },
           {
             id: "time-3",
             name: "第三阶段",
             date: "2024-11", 
             description: "后续规划",
             type: "planning"
           }
        ],
        metadata: {
          exportTime: new Date().toISOString(),
          version: "1.0"
        }
      };

      const jsonString = JSON.stringify(templateData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '基础配置模板.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', '模板下载成功');
    } catch (error) {
      console.error('Template download error:', error);
      showMessage('error', '模板下载失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">基础配置管理</h3>
            <div className="flex items-center space-x-4">
              {/* 配置统计 */}
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>团队: {teams.length}</span>
                <span>项目: {projects.length}</span>
                <span>时间点: {timePoints.length}</span>
              </div>
              {/* 操作按钮 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="导入配置"
                  disabled={isLoading}
                >
                  <Icon name="folder" size="sm" />
                </button>
                <button
                  onClick={handleExportConfig}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="导出配置"
                  disabled={isLoading}
                >
                  <Icon name="download" size="sm" />
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="下载模板"
                  disabled={isLoading}
                >
                  <Icon name="document" size="sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* 格式说明 */}
        {/* <div className="p-6 bg-blue-50 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">JSON格式包含：</h4>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• 团队：名称、容量、描述、颜色、标号</li>
                <li>• 项目：名称、状态、描述、颜色、图案、发布时间</li>
                <li>• 时间点：名称、日期、类型、描述</li>
                <li>• 元数据：导出时间、版本信息</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">使用说明：</h4>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• JSON格式，便于编辑和版本控制</li>
                <li>• 包含所有颜色、标号、图案等特殊属性</li>
                <li>• 支持部分导入（只导入需要的配置）</li>
                <li>• 可下载模板作为参考格式</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}; 