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

interface ProjectStatistics {
  id: string;
  name: string;
  status: string;
  color: string;
  totalManpower: number;
  releaseDate?: string;
  pattern?: string;
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
      
      // 获取选中的时间点并按日期排序
      const selectedTimePointsData = sortedTimePoints.filter(tp => 
        selectedTimePoints.has(tp.id)
      );
      
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
        totalManpower = singlePeriodManpower * 30; // 默认30天
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
          totalManpower += currentPeriodManpower * daysBetween;
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
        
        totalManpower += lastPeriodManpower * daysToEnd;
      }
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        color: project.color,
        totalManpower,
        releaseDate: project.releaseDate,
        pattern: project.pattern,
      };
    }).sort((a, b) => b.totalManpower - a.totalManpower); // 按人力投入降序排序
  }, [projects, teams, allocations, selectedTimePoints, sortedTimePoints, endDate]);

  // 准备图表配置
  const chartOptions = useMemo(() => {
    const data = projectStatistics.map(project => ({
      name: project.name,
      value: project.totalManpower,
      itemStyle: {
        color: project.color,
      },
      // 存储额外信息供tooltip使用
      status: project.status,
      releaseDate: project.releaseDate,
    }));

    return {
      title: {
        text: '版本人力投入总览',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: any) {
          const data = params[0];
          const statusMap: { [key: string]: string } = {
            'development': '开发中',
            'planning': '规划中',
            'release': '已发布',
            'completed': '已完成',
          };
          return `
            <div style="margin: 0; padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
              <div style="color: #666; margin-bottom: 4px;">状态: ${statusMap[data.data.status] || data.data.status}</div>
              ${data.data.releaseDate ? `<div style="color: #666; margin-bottom: 4px;">发布时间: ${data.data.releaseDate}</div>` : ''}
              <div style="font-weight: bold; color: ${data.color};">总人力投入: ${data.value}人·天</div>
            </div>
          `;
        },
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '15%',
        bottom: '10%',
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
        data: data.map(d => d.name).reverse(), // 反转Y轴数据，让大的在上面
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
      series: [
        {
          name: '人力投入',
          type: 'bar',
          data: [...data].reverse(), // 同样反转series数据
          barWidth: 20,
          label: {
            show: true,
            position: 'right',
            color: '#333',
            fontSize: 11,
            formatter: '{c}人·天',
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      ],
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
                <div className="relative group">
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