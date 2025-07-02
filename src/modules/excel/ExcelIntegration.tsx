import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useConfigStore } from '../../stores/configStore';
import { useDataStore } from '../../stores/dataStore';
import { Icon } from '../../components/Icon';
import type { AllocationMatrix } from '../../types/data';

export const ExcelIntegration: React.FC = () => {
  const { teams, projects, timePoints, importConfig } = useConfigStore();
  const { allocations, importAllocations } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 按日期排序时间点
  const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date));

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 导出到Excel
  const handleExport = () => {
    try {
      setIsLoading(true);

      // 创建工作簿
      const workbook = XLSX.utils.book_new();

      // 准备数据：创建人力分配表
      const allocationData: (string | number)[][] = [];
      
      // 表头
      const header = ['项目', '团队', ...sortedTimePoints.map(tp => `${tp.name}(投入)`), ...sortedTimePoints.map(tp => `${tp.name}(预释)`)];
      allocationData.push(header);

      // 数据行
      projects.forEach(project => {
        teams.forEach(team => {
          const row: (string | number)[] = [project.name, team.name];
          
          // 投入人力
          sortedTimePoints.forEach(timePoint => {
            const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
            row.push(allocation?.occupied || 0);
          });
          
          // 预释人力
          sortedTimePoints.forEach(timePoint => {
            const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
            row.push(allocation?.prerelease || 0);
          });
          
          // 只添加有数据的行
          const hasData = row.slice(2).some(value => typeof value === 'number' && value > 0);
          if (hasData) {
            allocationData.push(row);
          }
        });
      });

      // 创建工作表
      const allocationSheet = XLSX.utils.aoa_to_sheet(allocationData);
      XLSX.utils.book_append_sheet(workbook, allocationSheet, '人力分配');

      // 创建团队配置表 - 包含更完整的信息
      const teamData = [
        ['团队ID', '团队名称', '人力容量', '职责描述', '颜色', '标号'],
        ...teams.map(team => [team.id, team.name, team.capacity, team.description || '', team.color, team.badge || ''])
      ];
      const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
      XLSX.utils.book_append_sheet(workbook, teamSheet, '团队配置');

      // 创建项目配置表 - 包含更完整的信息
      const projectData = [
        ['项目ID', '项目名称', '状态', '描述', '颜色', '图案', '发布日期', '关联团队'],
        ...projects.map(project => [
          project.id, 
          project.name, 
          project.status, 
          project.description || '', 
          project.color, 
          project.pattern || 'solid',
          project.releaseDate || '',
          Array.isArray(project.teams) ? project.teams.join(',') : ''
        ])
      ];
      const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
      XLSX.utils.book_append_sheet(workbook, projectSheet, '项目配置');

      // 创建时间点配置表
      const timePointData = [
        ['时间点ID', '时间点名称', '日期', '类型', '描述'],
        ...sortedTimePoints.map(tp => [tp.id, tp.name, tp.date, tp.type, tp.description || ''])
      ];
      const timePointSheet = XLSX.utils.aoa_to_sheet(timePointData);
      XLSX.utils.book_append_sheet(workbook, timePointSheet, '时间点配置');

      // 创建统计汇总表
      const { totalCapacity, totalAllocated, totalPrerelease } = useDataStore.getState().getStatistics();
      const summaryData = [
        ['统计项目', '数值', '说明'],
        ['总人力容量', totalCapacity, '所有团队人力容量之和'],
        ['平均已分配', totalAllocated.toFixed(1), '各时间点已分配人力的平均值'],
        ['平均预释放', totalPrerelease.toFixed(1), '各时间点预释放人力的平均值'],
        ['平均利用率', `${(totalAllocated / totalCapacity * 100).toFixed(1)}%`, '已分配人力占总容量的百分比'],
        [''],
        ['配置统计', '', ''],
        ['团队数量', teams.length, ''],
        ['项目数量', projects.length, ''],
        ['时间点数量', timePoints.length, ''],
        ['分配记录数', Object.keys(allocations).reduce((sum, timeId) => {
          return sum + Object.keys(allocations[timeId]).reduce((projectSum, projectId) => {
            return projectSum + Object.keys(allocations[timeId][projectId]).length;
          }, 0);
        }, 0), '有人力分配的项目-团队组合数'],
        [''],
        ['导出信息', '', ''],
        ['导出时间', new Date().toLocaleString('zh-CN'), ''],
        ['系统版本', '1.0', ''],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, '统计汇总');

      // 下载文件
      const fileName = `Omada人力排布_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showMessage('success', `成功导出到 ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      showMessage('error', '导出失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 从Excel导入
  const handleImport = (file: File) => {
    try {
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // 首先尝试导入基础配置（如果存在）
          let configImported = false;
          let importedTeams = teams;
          let importedProjects = projects;
          let importedTimePoints = timePoints;
          
          // 导入团队配置
          const teamSheetName = workbook.SheetNames.find(name => 
            name.includes('团队配置') || name.includes('team')
          );
          
          if (teamSheetName) {
            const teamSheet = workbook.Sheets[teamSheetName];
            const teamRows = XLSX.utils.sheet_to_json<any[]>(teamSheet, { header: 1 });
            
            if (teamRows.length > 1) {
              const teamHeader = teamRows[0];
              const nameIndex = teamHeader.indexOf('团队名称');
              const capacityIndex = teamHeader.indexOf('人力容量');
              const descriptionIndex = teamHeader.indexOf('职责描述');
              const colorIndex = teamHeader.indexOf('颜色');
              
              if (nameIndex !== -1 && capacityIndex !== -1) {
                const newTeams = [];
                for (let i = 1; i < teamRows.length; i++) {
                  const row = teamRows[i];
                  if (row[nameIndex]) {
                    newTeams.push({
                      id: `team-${i}`,
                      name: row[nameIndex],
                      capacity: parseFloat(row[capacityIndex]) || 0,
                      description: row[descriptionIndex] || '',
                      color: row[colorIndex] || '#3498db',
                      badge: ''
                    });
                  }
                }
                if (newTeams.length > 0) {
                  importedTeams = newTeams;
                  configImported = true;
                }
              }
            }
          }

          // 导入项目配置
          const projectSheetName = workbook.SheetNames.find(name => 
            name.includes('项目配置') || name.includes('project')
          );
          
          if (projectSheetName) {
            const projectSheet = workbook.Sheets[projectSheetName];
            const projectRows = XLSX.utils.sheet_to_json<any[]>(projectSheet, { header: 1 });
            
            if (projectRows.length > 1) {
              const projectHeader = projectRows[0];
              const nameIndex = projectHeader.indexOf('项目名称');
              const statusIndex = projectHeader.indexOf('状态');
              const descriptionIndex = projectHeader.indexOf('描述');
              const colorIndex = projectHeader.indexOf('颜色');
              
              if (nameIndex !== -1) {
                const newProjects = [];
                for (let i = 1; i < projectRows.length; i++) {
                  const row = projectRows[i];
                  if (row[nameIndex]) {
                    newProjects.push({
                      id: `project-${i}`,
                      name: row[nameIndex],
                      status: row[statusIndex] || 'planning',
                      description: row[descriptionIndex] || '',
                      color: row[colorIndex] || '#3498db'
                    });
                  }
                }
                if (newProjects.length > 0) {
                  importedProjects = newProjects;
                  configImported = true;
                }
              }
            }
          }

          // 导入时间点配置
          const timePointSheetName = workbook.SheetNames.find(name => 
            name.includes('时间点配置') || name.includes('timepoint')
          );
          
          if (timePointSheetName) {
            const timePointSheet = workbook.Sheets[timePointSheetName];
            const timePointRows = XLSX.utils.sheet_to_json<any[]>(timePointSheet, { header: 1 });
            
            if (timePointRows.length > 1) {
              const timePointHeader = timePointRows[0];
              const nameIndex = timePointHeader.indexOf('时间点名称');
              const dateIndex = timePointHeader.indexOf('日期');
              const typeIndex = timePointHeader.indexOf('类型');
              const descriptionIndex = timePointHeader.indexOf('描述');
              
              if (nameIndex !== -1 && dateIndex !== -1) {
                const newTimePoints = [];
                for (let i = 1; i < timePointRows.length; i++) {
                  const row = timePointRows[i];
                  if (row[nameIndex] && row[dateIndex]) {
                    newTimePoints.push({
                      id: `time-${i}`,
                      name: row[nameIndex],
                      date: row[dateIndex],
                      type: row[typeIndex] || 'current',
                      description: row[descriptionIndex] || ''
                    });
                  }
                }
                if (newTimePoints.length > 0) {
                  importedTimePoints = newTimePoints;
                  configImported = true;
                }
              }
            }
          }

          // 如果有基础配置数据，则导入
          if (configImported) {
            importConfig({
              teams: importedTeams,
              projects: importedProjects,
              timePoints: importedTimePoints
            });
          }

          // 读取人力分配表
          const allocationSheetName = workbook.SheetNames.find(name => 
            name.includes('人力分配') || name.includes('allocation') || name === 'Sheet1'
          );
          
          if (!allocationSheetName) {
            if (configImported) {
              showMessage('success', '基础配置导入成功');
              return;
            } else {
              throw new Error('未找到人力分配表，请确认Excel格式');
            }
          }

          const allocationSheet = workbook.Sheets[allocationSheetName];
          const allocationRows = XLSX.utils.sheet_to_json<any[]>(allocationSheet, { header: 1 });

          if (allocationRows.length < 2) {
            if (configImported) {
              showMessage('success', '基础配置导入成功');
              return;
            } else {
              throw new Error('人力分配表数据不足');
            }
          }

          // 解析表头
          const headerRow = allocationRows[0];
          const projectIndex = headerRow.indexOf('项目');
          const teamIndex = headerRow.indexOf('团队');
          
          if (projectIndex === -1 || teamIndex === -1) {
            if (configImported) {
              showMessage('success', '基础配置导入成功');
              return;
            } else {
              throw new Error('Excel格式错误：缺少"项目"或"团队"列');
            }
          }

          // 找到时间点列的位置  
          const timePointColumns: { [key: string]: { occupied: number; prerelease: number } } = {};
          const currentTimePoints = importedTimePoints.slice().sort((a, b) => a.date.localeCompare(b.date));
          
          currentTimePoints.forEach((timePoint) => {
            const occupiedIndex = headerRow.findIndex((header: string) => 
              header && header.includes(timePoint.name) && header.includes('投入')
            );
            const prereleaseIndex = headerRow.findIndex((header: string) => 
              header && header.includes(timePoint.name) && header.includes('预释')
            );

            if (occupiedIndex !== -1 && prereleaseIndex !== -1) {
              timePointColumns[timePoint.id] = {
                occupied: occupiedIndex,
                prerelease: prereleaseIndex,
              };
            }
          });

          // 解析数据
          const newAllocations: AllocationMatrix = {};
          
          // 初始化结构
          Object.keys(timePointColumns).forEach(timePointId => {
            newAllocations[timePointId] = {};
            importedProjects.forEach(project => {
              newAllocations[timePointId][project.id] = {};
            });
          });

          // 处理数据行
          for (let i = 1; i < allocationRows.length; i++) {
            const row = allocationRows[i];
            const projectName = row[projectIndex];
            const teamName = row[teamIndex];

            if (!projectName || !teamName) continue;

            // 找到对应的项目和团队ID
            const project = importedProjects.find(p => p.name === projectName);
            const team = importedTeams.find(t => t.name === teamName);

            if (!project || !team) {
              console.warn(`Skipping unknown project "${projectName}" or team "${teamName}"`);
              continue;
            }

            // 提取每个时间点的数据
            Object.entries(timePointColumns).forEach(([timePointId, columns]) => {
              const occupied = parseFloat(row[columns.occupied]) || 0;
              const prerelease = parseFloat(row[columns.prerelease]) || 0;

              if (occupied > 0 || prerelease > 0) {
                newAllocations[timePointId][project.id][team.id] = {
                  occupied,
                  prerelease,
                };
              }
            });
          }

          // 导入数据
          importAllocations(newAllocations);
          
          const messages = [];
          if (configImported) messages.push('基础配置');
          if (Object.keys(newAllocations).length > 0) messages.push(`人力分配 ${allocationRows.length - 1} 条记录`);
          
          showMessage('success', `成功导入：${messages.join('，')}`);

        } catch (error) {
          console.error('Parse error:', error);
          showMessage('error', `解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      showMessage('error', '读取文件失败');
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        showMessage('error', '请选择Excel文件（.xlsx或.xls）');
        return;
      }
      handleImport(file);
    }
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // 创建模板数据
      const templateData: (string | number)[][] = [];
      
      // 表头
      const header = ['项目', '团队', ...sortedTimePoints.map(tp => `${tp.name}(投入)`), ...sortedTimePoints.map(tp => `${tp.name}(预释)`)];
      templateData.push(header);

      // 示例数据
      if (projects.length > 0 && teams.length > 0) {
        const exampleRow: (string | number)[] = [projects[0].name, teams[0].name];
        sortedTimePoints.forEach(() => {
          exampleRow.push(0); // 投入
        });
        sortedTimePoints.forEach(() => {
          exampleRow.push(0); // 预释
        });
        templateData.push(exampleRow);
      }

      const templateSheet = XLSX.utils.aoa_to_sheet(templateData);
      XLSX.utils.book_append_sheet(workbook, templateSheet, '人力分配');

      // 下载模板
      XLSX.writeFile(workbook, '人力排布模板.xlsx');
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
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Excel数据集成</h3>
            <div className="flex items-center space-x-4">
              {/* 统计信息 */}
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>团队: {teams.length}</span>
                <span>项目: {projects.length}</span>
                <span>记录: {Object.keys(allocations).reduce((sum, timeId) => {
                  return sum + Object.keys(allocations[timeId]).reduce((projectSum, projectId) => {
                    return projectSum + Object.keys(allocations[timeId][projectId]).length;
                  }, 0);
                }, 0)}</span>
              </div>
              {/* 操作按钮 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="导入Excel"
                  disabled={isLoading}
                >
                  <Icon name="folder" size="sm" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="导出Excel"
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
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* 格式说明 */}
        <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Excel格式说明</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                导出格式
              </h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>人力分配表</strong>：项目-团队矩阵，各时间点投入和预释人力</p>
                <p>• <strong>团队配置表</strong>：ID、名称、容量、职责、颜色、标号</p>
                <p>• <strong>项目配置表</strong>：ID、名称、状态、颜色、图案、发布日期</p>
                <p>• <strong>时间点配置表</strong>：ID、名称、日期、类型、描述</p>
                <p>• <strong>统计汇总表</strong>：人力统计、配置统计、导出信息</p>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                导入要求
              </h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>必须列</strong>："项目"和"团队"列为必需</p>
                <p>• <strong>时间点格式</strong>："时间点名称(投入)"/"时间点名称(预释)"</p>
                <p>• <strong>名称匹配</strong>：项目和团队名称必须与配置匹配</p>
                <p>• <strong>数值格式</strong>：支持小数（如0.5人）和空值</p>
                <p>• <strong>智能导入</strong>：支持配置和分配数据同时导入</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 