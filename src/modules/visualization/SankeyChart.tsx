import React, { useMemo, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { SankeyChart as SankeyChartType } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useConfigStore } from '../../stores/configStore';
import { useDataStore } from '../../stores/dataStore';

interface FilterState {
  teams: Set<string>;
  projects: Set<string>;
}

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SankeyChartType,
  CanvasRenderer,
]);

interface SankeyNode {
  name: string;
  value?: number;
  itemStyle?: {
    color: string;
  };
  category?: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  teamDetails?: {[teamId: string]: {name: string, value: number, color: string}};
}

export const SankeyChart: React.FC = () => {
  const { teams, projects, timePoints } = useConfigStore();
  const { allocations } = useDataStore();
  
  const [filters, setFilters] = useState<FilterState>({
    teams: new Set(teams.map(t => t.id)),
    projects: new Set(projects.map(p => p.id))
  });

  // 切换筛选状态
  const toggleFilter = (type: 'teams' | 'projects', id: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { ...prev, [type]: newSet };
    });
  };

  // 计算桑基图数据
  const sankeyData = useMemo(() => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    // 按日期排序时间点，只取前3个时间点（7月、9月、11月）
    const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    
    // 过滤的团队和项目
    const filteredTeams = teams.filter(t => filters.teams.has(t.id));
    const filteredProjects = projects.filter(p => filters.projects.has(p.id));

    // 第一列：添加团队节点
    filteredTeams.forEach((team) => {
      nodes.push({
        name: team.name,
        value: team.capacity,
        itemStyle: { color: team.color },
        category: 0,
      });
    });

    // 为每个时间点创建项目节点
    sortedTimePoints.forEach((timePoint, timeIndex) => {
      filteredProjects.forEach((project) => {
        let totalPersons = 0;
        filteredTeams.forEach((team) => {
          const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
          if (allocation) {
            totalPersons += allocation.occupied;
          }
        });
        
        if (totalPersons > 0) {
          const nodeId = `${project.name}_${timeIndex}`;
          nodes.push({
            name: nodeId,
            value: totalPersons,
            itemStyle: { color: project.color },
            category: timeIndex + 1,
          });
        }
      });
    });

    // 创建连接 - 每列只与前一列相关
    sortedTimePoints.forEach((timePoint, timeIndex) => {
      if (timeIndex === 0) {
        // 第一个时间点：从团队到项目的直接分配
        filteredProjects.forEach((project) => {
          const projectNodeId = `${project.name}_${timeIndex}`;
          if (nodes.some(node => node.name === projectNodeId)) {
            filteredTeams.forEach((team) => {
              const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
              if (allocation && allocation.occupied > 0) {
                links.push({
                  source: team.name,
                  target: projectNodeId,
                  value: allocation.occupied,
                  teamDetails: {
                    [team.id]: {
                      name: team.name,
                      value: allocation.occupied,
                      color: team.color
                    }
                  }
                });
              }
            });
          }
        });
      } else {
        // 后续时间点：只从上一列的项目节点流向当前列
        const prevTimePoint = sortedTimePoints[timeIndex - 1];
        
        // 收集上一个时间点的所有项目及其人力分布（按团队分组）
        const prevProjectResources: {[projectId: string]: {[teamId: string]: number}} = {};
        filteredProjects.forEach((project) => {
          const prevNodeId = `${project.name}_${timeIndex - 1}`;
          if (nodes.some(node => node.name === prevNodeId)) {
            prevProjectResources[project.id] = {};
            filteredTeams.forEach((team) => {
              const allocation = allocations[prevTimePoint.id]?.[project.id]?.[team.id];
              if (allocation && allocation.occupied > 0) {
                prevProjectResources[project.id][team.id] = allocation.occupied;
              }
            });
          }
        });

        // 为当前时间点的每个项目分配人力
        filteredProjects.forEach((currentProject) => {
          const currentNodeId = `${currentProject.name}_${timeIndex}`;
          if (!nodes.some(node => node.name === currentNodeId)) return;

          // 获取当前项目需要的人力（按团队）
          const currentNeeds: {[teamId: string]: number} = {};
          filteredTeams.forEach((team) => {
            const allocation = allocations[timePoint.id]?.[currentProject.id]?.[team.id];
            if (allocation && allocation.occupied > 0) {
              currentNeeds[team.id] = allocation.occupied;
            }
          });

          // 优先从同一项目的上一时间点继承
          const prevNodeId = `${currentProject.name}_${timeIndex - 1}`;
          if (nodes.some(node => node.name === prevNodeId)) {
            // 计算可继承的人力
            let inheritedTotal = 0;
            const inheritedTeamDetails: {[teamId: string]: {name: string, value: number, color: string}} = {};
            
            filteredTeams.forEach((team) => {
              const prevAllocation = allocations[prevTimePoint.id]?.[currentProject.id]?.[team.id]?.occupied || 0;
              const currentNeed = currentNeeds[team.id] || 0;
              const inherited = Math.min(prevAllocation, currentNeed);
              
              if (inherited > 0) {
                inheritedTotal += inherited;
                inheritedTeamDetails[team.id] = {
                  name: team.name,
                  value: inherited,
                  color: team.color
                };
                // 从需求中减去已继承的部分
                currentNeeds[team.id] = Math.max(0, currentNeed - inherited);
                // 从上一项目的资源中减去已使用的部分
                if (prevProjectResources[currentProject.id]) {
                  prevProjectResources[currentProject.id][team.id] = Math.max(0, 
                    (prevProjectResources[currentProject.id][team.id] || 0) - inherited
                  );
                }
              }
            });

            if (inheritedTotal > 0) {
              links.push({
                source: prevNodeId,
                target: currentNodeId,
                value: inheritedTotal,
                teamDetails: inheritedTeamDetails
              });
            }
          }

          // 从其他项目释放的资源中分配剩余需求
          Object.entries(currentNeeds).forEach(([teamId, needAmount]) => {
            if (needAmount <= 0) return;

            let remainingNeed = needAmount;
            
            // 遍历所有上一时间点的项目，寻找可用的同团队资源
            Object.entries(prevProjectResources).forEach(([prevProjectId, teamResources]) => {
              if (remainingNeed <= 0) return;
              
              const availableFromTeam = teamResources[teamId] || 0;
              if (availableFromTeam > 0) {
                const transferAmount = Math.min(remainingNeed, availableFromTeam);
                
                const prevProject = filteredProjects.find(p => p.id === prevProjectId);
                const team = filteredTeams.find(t => t.id === teamId);
                if (prevProject && team) {
                  const prevNodeId = `${prevProject.name}_${timeIndex - 1}`;
                  
                  links.push({
                    source: prevNodeId,
                    target: currentNodeId,
                    value: transferAmount,
                    teamDetails: {
                      [teamId]: {
                        name: team.name,
                        value: transferAmount,
                        color: team.color
                      }
                    }
                  });
                  
                  // 更新剩余需求和可用资源
                  remainingNeed -= transferAmount;
                  teamResources[teamId] -= transferAmount;
                }
              }
            });
          });
        });

        // 处理上一时间点剩余的未分配资源（可以考虑流向其他项目或显示为空闲）
        Object.entries(prevProjectResources).forEach(([prevProjectId, teamResources]) => {
          const prevProject = filteredProjects.find(p => p.id === prevProjectId);
          if (!prevProject) return;
          
          const prevNodeId = `${prevProject.name}_${timeIndex - 1}`;
          
          Object.entries(teamResources).forEach(([teamId, remainingAmount]) => {
            if (remainingAmount > 0.5) { // 只处理超过0.5人的剩余资源
              // 尝试分配给当前时间点需要该团队人力的其他项目
              let allocated = false;
              
              filteredProjects.forEach((targetProject) => {
                if (allocated || targetProject.id === prevProjectId) return;
                
                const targetNodeId = `${targetProject.name}_${timeIndex}`;
                if (nodes.some(node => node.name === targetNodeId)) {
                  const targetAllocation = allocations[timePoint.id]?.[targetProject.id]?.[teamId];
                  if (targetAllocation && targetAllocation.occupied > 0) {
                    // 分配一部分剩余资源
                    const transferAmount = Math.min(remainingAmount, targetAllocation.occupied * 0.2); // 最多20%
                    
                    if (transferAmount > 0.5) {
                      const team = filteredTeams.find(t => t.id === teamId);
                      if (team) {
                        links.push({
                          source: prevNodeId,
                          target: targetNodeId,
                          value: Math.round(transferAmount * 10) / 10,
                          teamDetails: {
                            [teamId]: {
                              name: team.name,
                              value: Math.round(transferAmount * 10) / 10,
                              color: team.color
                            }
                          }
                        });
                        allocated = true;
                      }
                    }
                  }
                }
              });
            }
          });
        });
      }
    });

    // 合并相同source和target的links，并收集团队详情
    const mergedLinksMap = new Map<string, SankeyLink>();
    
    links.forEach(link => {
      const key = `${link.source}->${link.target}`;
      if (mergedLinksMap.has(key)) {
        const existingLink = mergedLinksMap.get(key)!;
        existingLink.value += link.value;
        // 合并团队详情
        if (link.teamDetails) {
          if (!existingLink.teamDetails) existingLink.teamDetails = {};
          Object.entries(link.teamDetails).forEach(([teamId, details]) => {
            if (existingLink.teamDetails![teamId]) {
              existingLink.teamDetails![teamId].value += details.value;
            } else {
              existingLink.teamDetails![teamId] = { ...details };
            }
          });
        }
      } else {
        mergedLinksMap.set(key, { ...link });
      }
    });
    
    const mergedLinks = Array.from(mergedLinksMap.values());
    return { nodes, links: mergedLinks };
  }, [teams, projects, timePoints, allocations, filters]);

  // 为tooltip使用的变量
  const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const filteredTeams = teams.filter(t => filters.teams.has(t.id));
  const filteredProjects = projects.filter(p => filters.projects.has(p.id));

  const option = {
    title: {
      text: '研发人力流动桑基图',
      left: 'center',
      top: '2%',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: function (params: any) {
        if (params.dataType === 'node') {
          const nodeName = params.name;
          
          // 检查是否是团队节点（在第一列）
          const isTeamNode = filteredTeams.some(team => team.name === nodeName);
          
          if (isTeamNode) {
            // 团队节点
            const team = filteredTeams.find(t => t.name === nodeName);
            return `<div style="font-size: 13px;"><strong>${nodeName}</strong><br/>团队总人力: ${team?.capacity || 0}人</div>`;
          } else {
            // 项目节点，解析项目名称和时间点索引
            const match = nodeName.match(/^(.+)_(\d+)$/);
            if (match) {
              const [, projectName, timeIndexStr] = match;
              const timeIndex = parseInt(timeIndexStr);
              const project = filteredProjects.find(p => p.name === projectName);
              const timePoint = sortedTimePoints[timeIndex];
              
              if (project && timePoint) {
                let tooltipContent = `<div style="font-size: 13px;"><strong>${projectName}</strong> @ ${timePoint.name}<br/>总人力: ${params.value || 0}人<br/>团队分布：`;
                
                filteredTeams.forEach(team => {
                  const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
                  if (allocation && allocation.occupied > 0) {
                    tooltipContent += `<br/><span style="display:inline-block;width:8px;height:8px;background-color:${team.color};border-radius:50%;margin-right:6px;"></span><span style="font-size:11px;">${team.name}: ${allocation.occupied}人</span>`;
                  }
                });
                
                tooltipContent += '</div>';
                return tooltipContent;
              }
            }
          }
          
          return `<div style="font-size: 13px;"><strong>${params.name}</strong><br/>人力: ${params.value || 0}人</div>`;
        } else if (params.dataType === 'edge') {
          // 连接线的详细流动信息
          let sourceName = params.data.source;
          let targetName = params.data.target;
          
          // 如果是项目节点，提取项目名称和时间点
          const sourceMatch = sourceName.match(/^(.+)_(\d+)$/);
          const targetMatch = targetName.match(/^(.+)_(\d+)$/);
          
          let sourceDisplayName = sourceName;
          let targetDisplayName = targetName;
          
          if (sourceMatch) {
            sourceDisplayName = sourceMatch[1];
          }
          
          if (targetMatch) {
            targetDisplayName = targetMatch[1];
          }
          
          let tooltipContent = `<div style="font-size: 13px;"><strong>${sourceDisplayName} → ${targetDisplayName}</strong><br/>总流动: ${params.data.value}人`;
          
          // 使用teamDetails显示详细的团队流动信息
          if (params.data.teamDetails) {
            tooltipContent += '<br/>团队流动详情：';
            Object.values(params.data.teamDetails).forEach((teamDetail: any) => {
              tooltipContent += `<br/><span style="display:inline-block;width:8px;height:8px;background-color:${teamDetail.color};border-radius:50%;margin-right:6px;"></span><span style="font-size:11px;">${teamDetail.name}: ${teamDetail.value}人</span>`;
            });
          }
          
          return tooltipContent + '</div>';
        }
        return '';
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
        },
        label: {
          fontSize: 12,
          fontWeight: 'bold',
          formatter: function(params: any) {
            // 如果是项目节点，只显示项目名称
            const match = params.name.match(/^(.+)_(\d+)$/);
            if (match) {
              const projectName = match[1];
              // 如果项目名称过长，进行截断（增加到15个字符）
              return projectName.length > 15 ? projectName.substring(0, 15) + '...' : projectName;
            }
            return params.name; // 团队节点直接返回名称
          }
        },
        data: sankeyData.nodes,
        links: sankeyData.links,
        left: '5%',
        right: '10%',
        top: '12%',
        bottom: '8%',
        nodeWidth: 20,
        nodeGap: 12,
        nodeAlign: 'justify',
        layoutIterations: 0,
        orient: 'horizontal',
        draggable: false,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">人力流动分析</h3>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>团队: {teams.filter(t => filters.teams.has(t.id)).length}/{teams.length}</span>
            <span>项目: {projects.filter(p => filters.projects.has(p.id)).length}/{projects.length}</span>
            <span>节点: {sankeyData.nodes.length}</span>
            <span>连接: {sankeyData.links.length}</span>
          </div>
        </div>

        {/* 图例和筛选 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 团队筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                团队筛选
              </h4>
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => toggleFilter('teams', team.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filters.teams.has(team.id)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-200 text-gray-500 border border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: filters.teams.has(team.id) ? team.color : '#9ca3af'
                      }}
                    />
                    {team.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 项目筛选 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                项目筛选
              </h4>
              <div className="flex flex-wrap gap-2">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => toggleFilter('projects', project.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filters.projects.has(project.id)
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-200 text-gray-500 border border-gray-300'
                    }`}
                  >
                    <div 
                      className={`w-3 h-3 mr-2 ${
                        project.pattern === 'dots' ? 'rounded-full' : ''
                      }`}
                      style={{
                        backgroundColor: filters.projects.has(project.id) ? project.color : '#9ca3af',
                        ...(filters.projects.has(project.id) && project.pattern === 'stripes' ? {
                          background: `repeating-linear-gradient(45deg, ${project.color}, ${project.color} 2px, transparent 2px, transparent 4px)`
                        } : {})
                      }}
                    />
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-96 w-full">
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        {/* 操作说明 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">图表说明</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>4列布局</strong>：团队 → 7月项目 → 9月项目 → 11月项目</p>
            <p>• <strong>人员流动</strong>：每列只与前一列相关，优先项目继承，再从其他项目转移</p>
            <p>• <strong>团队匹配</strong>：人员转移时考虑团队类型对应关系</p>
            <p>• <strong>筛选功能</strong>：点击图例可筛选显示的团队和项目</p>
            <p>• <strong>鼠标悬停</strong>：显示详细的人力分配和流动信息</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 