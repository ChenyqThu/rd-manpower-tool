import React, { useMemo, useState, useEffect } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useConfigStore } from '../../stores/configStore';
import { useDataStore } from '../../stores/dataStore';
import { Icon } from '../../components/Icon';

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  BarChart,
  CanvasRenderer,
]);

// 生成颜色渐变的工具函数
const generateColorGradient = (baseColor: string, steps: number): string[] => {
  const colors: string[] = [];
  
  // 将hex颜色转换为RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb = hexToRgb(baseColor);
  
  for (let i = 0; i < steps; i++) {
    // 从深到浅的渐变，第一个最深，最后一个最浅
    const ratio = 1 - (i * 0.4 / Math.max(1, steps - 1)); // 最浅40%
    const newR = Math.round(rgb.r + (255 - rgb.r) * (1 - ratio));
    const newG = Math.round(rgb.g + (255 - rgb.g) * (1 - ratio));
    const newB = Math.round(rgb.b + (255 - rgb.b) * (1 - ratio));
    
    colors.push(`rgb(${newR}, ${newG}, ${newB})`);
  }
  
  return colors;
};

interface ProjectStatistics {
  id: string;
  name: string;
  status: string;
  color: string;
  totalManpower: number;
  releaseDate?: string;
  pattern?: string;
  timePeriods: TimePeriodData[];
}

interface TimePeriodData {
  name: string;
  fromTimePoint: string;
  toTimePoint: string;
  manpower: number;
  days: number;
  totalManDays: number;
  color: string;
}

export const ProjectBarChart: React.FC = () => {
  const { teams, projects, timePoints } = useConfigStore();
  const { allocations } = useDataStore();
  
  // 按日期排序时间点
  const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date));
  
  // 选中的时间点，默认选择所有时间点
  const [selectedTimePoints, setSelectedTimePoints] = useState<Set<string>>(
    new Set(timePoints.map(tp => tp.id))
  );

  // 移除图例筛选状态管理，让ECharts自己处理

  // 计算默认截止时间（最后时间点年份的年底）
  const getDefaultEndDate = () => {
    if (sortedTimePoints.length === 0) return '';
    const lastTimePoint = sortedTimePoints[sortedTimePoints.length - 1];
    const year = new Date(lastTimePoint.date).getFullYear();
    return `${year}-12-31`;
  };

  // 用户设置的截止时间
  const [endDate, setEndDate] = useState<string>(() => getDefaultEndDate());

  // 当时间点变化时，更新默认截止时间
  useEffect(() => {
    if (!endDate || endDate === getDefaultEndDate()) {
      setEndDate(getDefaultEndDate());
    }
  }, [timePoints]);

  // 计算两个时间点之间的天数差
  const calculateDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 计算项目统计数据
  const projectStatistics = useMemo((): ProjectStatistics[] => {
    return projects.map(project => {
      let totalManpower = 0;
      const timePeriods: TimePeriodData[] = [];
      
      // 获取选中的时间点并按日期排序
      const selectedTimePointsData = sortedTimePoints.filter(tp => 
        selectedTimePoints.has(tp.id)
      );
      
      // 生成该项目的颜色渐变
      const colors = generateColorGradient(project.color, selectedTimePointsData.length);
      
      // 如果只选择了一个时间点，按30天计算
      if (selectedTimePointsData.length === 1) {
        const timePoint = selectedTimePointsData[0];
        let singlePeriodManpower = 0;
        for (const team of teams) {
          const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
          if (allocation) {
            singlePeriodManpower += allocation.occupied;
          }
        }
        const days = 30;
        const manDays = singlePeriodManpower * days;
        totalManpower = manDays;
        
        timePeriods.push({
          name: `${timePoint.name} (30天)`,
          fromTimePoint: timePoint.name,
          toTimePoint: '(30天)',
          manpower: singlePeriodManpower,
          days,
          totalManDays: manDays,
          color: colors[0] || project.color,
        });
      } else if (selectedTimePointsData.length > 1) {
        // 遍历选中的时间点（除了最后一个）
        for (let i = 0; i < selectedTimePointsData.length - 1; i++) {
          const currentTimePoint = selectedTimePointsData[i];
          const nextTimePoint = selectedTimePointsData[i + 1];
          
          // 计算该时间段的天数
          const daysBetween = calculateDaysBetween(currentTimePoint.date, nextTimePoint.date);
          
          // 遍历所有团队，获取当前时间点的人力投入
          let currentPeriodManpower = 0;
          for (const team of teams) {
            const allocation = allocations[currentTimePoint.id]?.[project.id]?.[team.id];
            if (allocation) {
              currentPeriodManpower += allocation.occupied;
            }
          }
          
          // 计算人·天：人力投入 * 天数
          const manDays = currentPeriodManpower * daysBetween;
          totalManpower += manDays;
          
          timePeriods.push({
            name: `${currentTimePoint.name} → ${nextTimePoint.name}`,
            fromTimePoint: currentTimePoint.name,
            toTimePoint: nextTimePoint.name,
            manpower: currentPeriodManpower,
            days: daysBetween,
            totalManDays: manDays,
            color: colors[i] || project.color,
          });
        }
        
        // 处理最后一个时间点：使用用户设置的截止时间
        const lastTimePoint = selectedTimePointsData[selectedTimePointsData.length - 1];
        
        // 计算最后一个时间点到截止时间的天数
        const daysToEnd = endDate ? calculateDaysBetween(lastTimePoint.date, endDate) : 30;
        
        // 计算最后一个时间点的人力投入
        let lastPeriodManpower = 0;
        for (const team of teams) {
          const allocation = allocations[lastTimePoint.id]?.[project.id]?.[team.id];
          if (allocation) {
            lastPeriodManpower += allocation.occupied;
          }
        }
        
        const lastManDays = lastPeriodManpower * daysToEnd;
        totalManpower += lastManDays;
        
        const endDateStr = endDate ? new Date(endDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '结束';
        timePeriods.push({
          name: `${lastTimePoint.name} → ${endDateStr}`,
          fromTimePoint: lastTimePoint.name,
          toTimePoint: endDateStr,
          manpower: lastPeriodManpower,
          days: daysToEnd,
          totalManDays: lastManDays,
          color: colors[selectedTimePointsData.length - 1] || project.color,
        });
      }
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        color: project.color,
        totalManpower,
        releaseDate: project.releaseDate,
        pattern: project.pattern,
        timePeriods,
      };
    }).sort((a, b) => b.totalManpower - a.totalManpower); // 按人力投入降序排序
  }, [projects, teams, allocations, selectedTimePoints, sortedTimePoints, endDate]);

  // 准备图表配置
  const chartOptions = useMemo(() => {
    // 获取所有时间段的名称用于图例
    const allTimePeriods = new Set<string>();
    projectStatistics.forEach(project => {
      project.timePeriods.forEach(period => {
        allTimePeriods.add(period.name);
      });
    });
    const timePeriodNames = Array.from(allTimePeriods);

    // 准备Y轴数据（项目名称）
    const projectNames = projectStatistics.map(p => p.name);

    // 为每个时间段创建一个series
    const series = timePeriodNames.map(periodName => {
      const data = projectStatistics.map(project => {
        const period = project.timePeriods.find(p => p.name === periodName);
        return period ? {
          value: period.totalManDays,
          itemStyle: { color: period.color },
          // 存储额外信息供tooltip使用
          periodData: period,
          projectData: {
            id: project.id,
            name: project.name,
            status: project.status,
            releaseDate: project.releaseDate,
          }
        } : {
          value: 0,
          itemStyle: { color: 'transparent' },
          periodData: null,
          projectData: {
            id: project.id,
            name: project.name,
            status: project.status,
            releaseDate: project.releaseDate,
          }
        };
      });

      return {
        name: periodName,
        type: 'bar',
        stack: '总量',
        data: data.reverse(), // 反转数据顺序，让投入多的在上面
        barWidth: 20,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
      };
    });

    // 不要在这里过滤series，而是通过图例的selected状态来控制显示

    return {
      title: {
        text: '版本人力投入总览（按时间段分组）',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const { data } = params;
          if (!data.periodData || data.value === 0) return '';
          
          const statusMap: { [key: string]: string } = {
            'development': '开发中',
            'planning': '规划中',
            'release': '已发布',
            'completed': '已完成',
          };
          
          return `
            <div style="margin: 0; padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${data.projectData.name}</div>
              <div style="color: #666; margin-bottom: 4px;">状态: ${statusMap[data.projectData.status] || data.projectData.status}</div>
              ${data.projectData.releaseDate ? `<div style="color: #666; margin-bottom: 4px;">发布时间: ${data.projectData.releaseDate}</div>` : ''}
              <div style="border-top: 1px solid #eee; margin: 8px 0; padding-top: 8px;">
                <div style="font-weight: bold; color: ${params.color}; margin-bottom: 4px;">${data.periodData.name}</div>
                <div style="color: #666;">人力投入: ${data.periodData.manpower}人</div>
                <div style="color: #666;">时间跨度: ${data.periodData.days}天</div>
                <div style="font-weight: bold; color: ${params.color};">总人·天: ${data.periodData.totalManDays}</div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 'bottom',
        data: timePeriodNames,
        selector: false, // 禁用图例的全选/反选按钮
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '15%',
        bottom: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '人力投入 (人·天)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e5e5',
          },
        },
        axisTick: {
          lineStyle: {
            color: '#e5e5e5',
          },
        },
        axisLabel: {
          color: '#666',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: projectNames.reverse(), // 反转Y轴数据，让投入多的在上面
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#333',
          fontSize: 11,
          width: 120,
          overflow: 'truncate',
        },
      },
      series: series,
    };
  }, [projectStatistics]);

  // 处理时间点选择
  const handleTimePointToggle = (timePointId: string) => {
    const newSelection = new Set(selectedTimePoints);
    if (newSelection.has(timePointId)) {
      newSelection.delete(timePointId);
    } else {
      newSelection.add(timePointId);
    }
    setSelectedTimePoints(newSelection);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedTimePoints.size === timePoints.length) {
      setSelectedTimePoints(new Set());
    } else {
      setSelectedTimePoints(new Set(timePoints.map(tp => tp.id)));
    }
  };

  // 图表事件配置 - 移除自定义的图例处理，让ECharts自己管理
  const chartEvents = {};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">版本人力投入总览</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>选中时间点: {selectedTimePoints.size}/{timePoints.length}</span>
          <span>•</span>
          <span>总计: {projectStatistics.reduce((sum, p) => sum + p.totalManpower, 0)}人·天</span>
        </div>
      </div>

      {/* 时间点筛选 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">时间点筛选</h4>
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {selectedTimePoints.size === timePoints.length ? '取消全选' : '全选'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {sortedTimePoints.map(timePoint => (
            <button
              key={timePoint.id}
              onClick={() => handleTimePointToggle(timePoint.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTimePoints.has(timePoint.id)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {timePoint.name}
            </button>
          ))}
          
          {/* 截止时间设置 - 紧凑布局 */}
          {sortedTimePoints.length > 0 && (
            <>
              <div className="mx-2 text-gray-400">→</div>
              <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full px-3 py-1">
                <span className="text-xs text-gray-600">截止</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs border-0 bg-transparent focus:outline-none focus:ring-0 p-0 w-28"
                />
                <div className="relative group flex">
                  <Icon 
                    name="info-circle" 
                    size="xs" 
                    className="text-gray-400 hover:text-gray-600 cursor-help"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                      <div className="text-center">
                        最后时间点({sortedTimePoints[sortedTimePoints.length - 1]?.name})到截止时间
                      </div>
                      <div className="text-center font-medium text-blue-200">
                        {endDate ? calculateDaysBetween(sortedTimePoints[sortedTimePoints.length - 1]?.date || '', endDate) : 0}天
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEndDate(getDefaultEndDate())}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  title="重置为默认（当年年底）"
                >
                  重置
                </button>
              </div>
            </>
          )}
        </div>
      </div>


      {/* 图表 */}
      <div className="h-96">
        {projectStatistics.length > 0 ? (
          <ReactEChartsCore
            echarts={echarts}
            option={chartOptions}
            onEvents={chartEvents}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-sm">暂无数据</p>
              <p className="text-xs mt-1">请选择时间点或配置项目数据</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};