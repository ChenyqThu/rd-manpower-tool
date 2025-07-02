import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useConfigStore } from '../../stores/configStore';
import { useDataStore } from '../../stores/dataStore';


import { TeamBadge } from '../../components/TeamBadge';
import { ProjectBadge } from '../../components/ProjectBadge';
import { Icon } from '../../components/Icon';
import { Switch } from '../../components/ui/Switch';

interface CellData {
  occupied: number;
  prerelease: number;
}

export const AllocationGrid: React.FC = () => {
  const { teams, projects, timePoints } = useConfigStore();
  const { allocations, updateAllocation, getStatistics, resetAllocations, importAllocations } = useDataStore();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 显示控制状态
  const [showTeamDetails, setShowTeamDetails] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('allocation-show-team-details');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  
  // 显示控制下拉菜单状态
  const [showControlMenu, setShowControlMenu] = useState(false);
  
  // 从localStorage加载折叠状态
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('allocation-collapsed-projects');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 保存折叠状态到localStorage
  useEffect(() => {
    localStorage.setItem('allocation-collapsed-projects', JSON.stringify([...collapsedProjects]));
  }, [collapsedProjects]);

  // 保存显示控制状态到localStorage
  useEffect(() => {
    localStorage.setItem('allocation-show-team-details', JSON.stringify(showTeamDetails));
  }, [showTeamDetails]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setShowControlMenu(false);
      }
    };

    if (showControlMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showControlMenu]);

  // 格式化数字，去掉不必要的小数点
  const formatNumber = (num: number): string => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  // 按日期排序时间点
  const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date));

  // 显示所有项目（不再按发布时间过滤）
  const visibleProjects = useMemo(() => {
    return projects;
  }, [projects]);

  // 获取项目应该显示的团队
  const getProjectTeams = (project: typeof projects[0]) => {
    if (!project.teams || project.teams.length === 0) {
      return teams; // 如果没有配置团队，显示所有团队
    }
    return teams.filter(team => project.teams!.includes(team.id));
  };

  const getCellValue = (timePointId: string, projectId: string, teamId: string): CellData => {
    return allocations[timePointId]?.[projectId]?.[teamId] || { occupied: 0, prerelease: 0 };
  };

  const setCellValue = (
    timePointId: string,
    projectId: string,
    teamId: string,
    field: 'occupied' | 'prerelease',
    value: number
  ) => {
    const currentValue = getCellValue(timePointId, projectId, teamId);
    
    // 对于预释值，限制不能超过当前投入
    let finalValue = Math.max(0, value);
    if (field === 'prerelease') {
      finalValue = Math.min(finalValue, currentValue.occupied);
    }
    
    const newValue = {
      ...currentValue,
      [field]: finalValue,
    };
    updateAllocation(timePointId, projectId, teamId, newValue);

    // 自动计算逻辑
    const currentTimeIndex = sortedTimePoints.findIndex(tp => tp.id === timePointId);
    
    if (field === 'prerelease') {
      // 当输入预释值时（包括0），自动更新下个时间点的投入
      if (currentTimeIndex < sortedTimePoints.length - 1) {
        const nextTimePoint = sortedTimePoints[currentTimeIndex + 1];
        const currentOccupied = newValue.occupied;
        const nextOccupied = Math.max(0, currentOccupied - finalValue);
        
        const nextValue = getCellValue(nextTimePoint.id, projectId, teamId);
        updateAllocation(nextTimePoint.id, projectId, teamId, {
          ...nextValue,
          occupied: nextOccupied
        });
      }
    } else if (field === 'occupied') {
      // 当输入投入值时的逻辑处理
      if (currentTimeIndex > 0) {
        // 如果比上个时间点小，自动更新上个时间点的预释
        const prevTimePoint = sortedTimePoints[currentTimeIndex - 1];
        const prevValue = getCellValue(prevTimePoint.id, projectId, teamId);
        
        if (finalValue < prevValue.occupied) {
          const prerelease = prevValue.occupied - finalValue;
          updateAllocation(prevTimePoint.id, projectId, teamId, {
            ...prevValue,
            prerelease: prerelease
          });
        } else if (finalValue === prevValue.occupied && prevValue.prerelease > 0) {
          // 如果当前投入等于上期投入，则将上期预释设为0
          updateAllocation(prevTimePoint.id, projectId, teamId, {
            ...prevValue,
            prerelease: 0
          });
        }
      }
      
      // 当投入值变化时，确保当前时间点的预释不超过新的投入值
      if (currentValue.prerelease > finalValue) {
        updateAllocation(timePointId, projectId, teamId, {
          ...newValue,
          prerelease: Math.min(currentValue.prerelease, finalValue)
        });
      }
    }
  };

  const handleCellEdit = (cellId: string) => {
    setEditingCell(cellId);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const getTeamUtilization = (teamId: string, timePointId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return { used: 0, capacity: 0, percentage: 0 };

    let totalUsed = 0;
    for (const project of projects) {
      const cellValue = getCellValue(timePointId, project.id, teamId);
      totalUsed += cellValue.occupied;
    }

    return {
      used: totalUsed,
      capacity: team.capacity,
      percentage: team.capacity > 0 ? (totalUsed / team.capacity) * 100 : 0,
    };
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 110) return 'bg-red-100 text-red-800';
    if (percentage > 100) return 'bg-orange-100 text-orange-800';
    if (percentage > 90) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // 获取项目在某个时间点的投入和预释汇总
  const getProjectSummary = (projectId: string, timePointId: string) => {
    const projectTeams = getProjectTeams(visibleProjects.find(p => p.id === projectId)!);
    let totalOccupied = 0;
    let totalPrerelease = 0;
    const teamBreakdown: { teamId: string; teamName: string; teamColor: string; occupied: number }[] = [];
    
    for (const team of projectTeams) {
      const cellValue = getCellValue(timePointId, projectId, team.id);
      totalOccupied += cellValue.occupied;
      totalPrerelease += cellValue.prerelease;
      
      // 只记录有投入的团队
      if (cellValue.occupied > 0) {
        teamBreakdown.push({
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          occupied: cellValue.occupied
        });
      }
    }
    
    return { totalOccupied, totalPrerelease, teamBreakdown };
  };

  // 获取总体团队占用情况
  const getOverallUtilization = (timePointId: string) => {
    let totalUsed = 0;
    let totalCapacity = 0;
    
    for (const team of teams) {
      const utilization = getTeamUtilization(team.id, timePointId);
      totalUsed += utilization.used;
      totalCapacity += utilization.capacity;
    }
    
    return {
      used: totalUsed,
      capacity: totalCapacity,
      percentage: totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0
    };
  };



  // 切换项目折叠状态
  const toggleProjectCollapse = (projectId: string) => {
    const newCollapsed = new Set(collapsedProjects);
    if (newCollapsed.has(projectId)) {
      newCollapsed.delete(projectId);
    } else {
      newCollapsed.add(projectId);
    }
    setCollapsedProjects(newCollapsed);
  };

  // 数据管理函数
  const handleLoadData = () => {
    fileInputRef.current?.click();
  };

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.allocations) {
          importAllocations(data.allocations);
          alert('数据载入成功！');
        } else {
          alert('数据格式不正确，请选择正确的数据文件。');
        }
      } catch (error) {
        alert('文件读取失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  const handleSaveData = () => {
    const data = {
      allocations,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manpower-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    try {
      // 使用与ExcelIntegration相同的导出逻辑
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

      // 创建团队配置表
      const teamData = [
        ['团队ID', '团队名称', '人力容量', '职责描述', '颜色', '标号'],
        ...teams.map(team => [team.id, team.name, team.capacity, team.description || '', team.color, team.badge || ''])
      ];
      const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
      XLSX.utils.book_append_sheet(workbook, teamSheet, '团队配置');

      // 创建项目配置表
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
      const statistics = getStatistics();
      const summaryData = [
        ['统计项目', '数值', '说明'],
        ['总人力容量', statistics.totalCapacity, '所有团队人力容量之和'],
        ['平均已分配', statistics.totalAllocated.toFixed(1), '各时间点已分配人力的平均值'],
        ['平均预释放', statistics.totalPrerelease.toFixed(1), '各时间点预释放人力的平均值'],
        ['平均利用率', `${(statistics.totalAllocated / statistics.totalCapacity * 100).toFixed(1)}%`, '已分配人力占总容量的百分比'],
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

      // 显示成功消息
      // 这里可以添加一个简单的提示，比如临时修改页面元素或使用更复杂的通知系统
      console.log(`成功导出到 ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('导出失败，请重试');
    }
  };

  const statistics = getStatistics();

  return (
    <div className="space-y-6">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileLoad}
        className="hidden"
      />
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">人力分配表</h3>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>总人力: {statistics.totalCapacity}</span>
                <span>已分配: {formatNumber(statistics.totalAllocated)}</span>
                <span>利用率: {formatNumber((statistics.totalAllocated / statistics.totalCapacity) * 100)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* 显示控制下拉菜单 */}
                <div className="relative">
                  <button
                    onClick={() => setShowControlMenu(!showControlMenu)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="显示控制"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  {showControlMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          显示控制
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                          <span className="text-sm text-gray-700">团队细节</span>
                          <Switch
                            checked={showTeamDetails}
                            onChange={setShowTeamDetails}
                            size="sm"
                            color="blue"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={handleLoadData}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="载入数据"
                >
                  <Icon name="folder" size="sm" />
                </button>
                <button
                  onClick={handleSaveData}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="保存数据"
                >
                  <Icon name="download" size="sm" />
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="导出Excel"
                >
                  <Icon name="document" size="sm" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要重置为默认的人力分配数据吗？这将清除所有手动修改的数据。')) {
                      resetAllocations();
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="重置数据"
                >
                  <Icon name="refresh" size="sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh + 200px)' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[160px] w-[160px] z-30">
                  项目 / 团队
                </th>
                {sortedTimePoints.map((timePoint) => (
                  <th
                    key={timePoint.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[180px] min-w-[180px] max-w-[180px]"
                  >
                    <div className="space-y-2">
                      <div>
                        <div>{timePoint.name}</div>
                        <div className="text-gray-400 normal-case text-xs">{timePoint.date}</div>
                      </div>
                      {/* 团队总体占用信息 */}
                      <div className="space-y-1">
                        {(() => {
                          const overallUtil = getOverallUtilization(timePoint.id);
                          return (
                            <div className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getUtilizationColor(overallUtil.percentage)}`}>
                              总占用: {formatNumber(overallUtil.used)}/{overallUtil.capacity} ({formatNumber(overallUtil.percentage)}%)
                            </div>
                          );
                        })()}
                      </div>
                      {/* 团队利用率显示 - 根据控制状态显示 */}
                      {showTeamDetails && (
                        <div className="flex items-center justify-center flex-wrap gap-1 normal-case">
                          {teams
                            .map((team) => {
                              const utilization = getTeamUtilization(team.id, timePoint.id);
                              return { team, utilization };
                            })
                            .filter(({ utilization }) => utilization.used > 0) // 只显示有投入的团队
                            .map(({ team, utilization }) => (
                              <div
                                key={`header-util-${team.id}-${timePoint.id}`}
                                className="flex items-center space-x-1"
                                title={`${team.name}: ${formatNumber(utilization.used)}/${utilization.capacity}人 (${formatNumber(utilization.percentage)}%)`}
                              >
                                <TeamBadge 
                                  team={team} 
                                  size="sm" 
                                  title={`${team.name}: ${formatNumber(utilization.used)}/${utilization.capacity}人 (${formatNumber(utilization.percentage)}%)`}
                                />
                                <span className={`text-xs flex-shrink-0 ${
                                  utilization.percentage > 110 ? 'text-red-600' :
                                  utilization.percentage > 100 ? 'text-orange-600' :
                                  utilization.percentage > 90 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {formatNumber(utilization.used)}/{utilization.capacity}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleProjects.map((project) => {
                const projectTeams = getProjectTeams(project);
                const isCollapsed = collapsedProjects.has(project.id);
                
                return (
                  <React.Fragment key={project.id}>
                    {/* 项目标题行 */}
                    <tr 
                      className="bg-gray-25 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleProjectCollapse(project.id)}
                    >
                      <td className="sticky left-0 bg-gray-25 hover:bg-gray-50 pl-2 pr-2 py-3 border-r border-gray-200 w-[160px] min-w-[160px] max-w-[160px] z-10">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 flex-shrink-0">
                              <svg 
                                className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <ProjectBadge 
                              project={project} 
                              size="sm" 
                              title={project.name}
                            />
                            <span className="font-medium text-gray-900 text-sm truncate" title={project.name}>
                              {project.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{projectTeams.length}个团队</span>
                            {project.releaseDate && (
                              <span className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                                {project.releaseDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {sortedTimePoints.map((timePoint) => {
                        const summary = getProjectSummary(project.id, timePoint.id);
                        return (
                          <td
                            key={`${project.id}-${timePoint.id}-header`}
                            className="px-2 py-3 text-center border-r border-gray-200 bg-gray-25 w-[180px] min-w-[180px] max-w-[180px]"
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                投入({formatNumber(summary.totalOccupied)}) | 预释({formatNumber(summary.totalPrerelease)})
                              </div>
                              {showTeamDetails && summary.teamBreakdown.length > 0 && (
                                <div className="flex items-center justify-center flex-wrap gap-1">
                                  {summary.teamBreakdown.map((team, index) => {
                                    const teamData = teams.find(t => t.id === team.teamId);
                                    return (
                                      <div
                                        key={team.teamId}
                                        className="flex items-center space-x-1"
                                        title={`${team.teamName}: ${team.occupied}人`}
                                      >
                                        {teamData && (
                                          <TeamBadge 
                                            team={teamData} 
                                            size="sm" 
                                            title={`${team.teamName}: ${team.occupied}人`}
                                          />
                                        )}
                                        <span className="text-xs text-gray-600 flex-shrink-0">{formatNumber(team.occupied)}</span>
                                        {index < summary.teamBreakdown.length - 1 && (
                                          <span className="text-xs text-gray-400">|</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* 团队分配行 */}
                    {!isCollapsed && projectTeams.map((team) => (
                    <tr key={`${project.id}-${team.id}`} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white hover:bg-gray-50 pl-8 pr-2 py-3 border-r border-gray-200 w-[160px] min-w-[160px] max-w-[160px] z-10">
                        <div className="flex items-center">
                          <div className="flex items-center space-x-2">
                            <TeamBadge 
                              team={team} 
                              size="sm" 
                              title={team.name}
                            />
                            <span className="text-sm text-gray-700 truncate" title={team.name}>{team.name}</span>
                          </div>
                        </div>
                      </td>
                      {sortedTimePoints.map((timePoint) => {
                        const cellValue = getCellValue(timePoint.id, project.id, team.id);
                        const cellId = `${timePoint.id}-${project.id}-${team.id}`;
                        
                        return (
                          <td
                            key={cellId}
                            className="px-2 py-3 text-center border-r border-gray-200 w-[180px] min-w-[180px] max-w-[180px]"
                          >
                            {/* 投入和预释输入框 - 横向布局 */}
                            <div className="flex items-center justify-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={cellValue.occupied || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setCellValue(timePoint.id, project.id, team.id, 'occupied', value);
                                }}
                                onFocus={() => handleCellEdit(`${cellId}-occupied`)}
                                onBlur={handleCellBlur}
                                onWheel={(e) => e.currentTarget.blur()}
                                className={`w-12 px-1 py-1 text-xs text-center border rounded ${
                                  editingCell === `${cellId}-occupied`
                                    ? 'border-blue-500 ring-1 ring-blue-500'
                                    : 'border-gray-300'
                                } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                                placeholder="0"
                              />
                              <span className="text-gray-400 text-xs">|</span>
                              <input
                                type="number"
                                min="0"
                                max={cellValue.occupied}
                                step="0.5"
                                value={cellValue.prerelease || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setCellValue(timePoint.id, project.id, team.id, 'prerelease', value);
                                }}
                                onFocus={() => handleCellEdit(`${cellId}-prerelease`)}
                                onBlur={handleCellBlur}
                                onWheel={(e) => e.currentTarget.blur()}
                                className={`w-12 px-1 py-1 text-xs text-center border rounded ${
                                  editingCell === `${cellId}-prerelease`
                                    ? 'border-blue-500 ring-1 ring-blue-500'
                                    : cellValue.prerelease >= cellValue.occupied && cellValue.occupied > 0
                                      ? 'border-amber-400 bg-amber-50'
                                      : 'border-gray-300'
                                } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                                placeholder="0"
                                title={cellValue.occupied > 0 ? `最大可预释: ${cellValue.occupied}人` : '请先设置投入人力'}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
                );
              })}




            </tbody>
          </table>
        </div>
      </div>

      {/* 操作说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">操作说明</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>投入</strong>：团队在该时间点投入到项目的人力</p>
          <p>• <strong>预释</strong>：团队在该时间点预计释放的人力（不能超过当前投入）</p>
          <p>• <strong>自动计算</strong>：输入预释值会自动更新下个时间点的投入；输入投入值会根据需要自动更新上个时间点的预释</p>
          <p>• <strong>限制规则</strong>：预释值不能超过当前投入值，达到上限时输入框会显示琥珀色提示</p>
          <p>• <strong>利用率颜色</strong>：绿色(≤90%) | 黄色(90-100%) | 橙色(100-110%) | 红色(&gt;110%)</p>
        </div>
      </div>
    </div>
  );
}; 