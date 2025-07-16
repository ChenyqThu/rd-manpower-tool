import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useConfigStore } from '../../stores/configStore';
import { useDataStore } from '../../stores/dataStore';



export const DistributionChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { teams, projects, timePoints } = useConfigStore();
  const { allocations } = useDataStore();
  
  // 按日期排序时间点
  const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date));

    // 准备图表数据
  const prepareChartData = () => {
    // 构建数据源格式 - 按项目（版本）统计
    const source: any[][] = [
      ['project', ...sortedTimePoints.map(tp => tp.name)]
    ];

    projects.forEach(project => {
      const row: (string | number)[] = [project.name];
      sortedTimePoints.forEach(timePoint => {
        let totalOccupied = 0;
        teams.forEach(team => {
          const allocation = allocations[timePoint.id]?.[project.id]?.[team.id];
          if (allocation) {
            totalOccupied += allocation.occupied;
          }
        });
        row.push(totalOccupied);
      });
      source.push(row);
    });

    return source;
  };

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const source = prepareChartData();
    if (source.length <= 1) return; // 没有数据时不渲染
    
    // 为饼图准备初始数据（第一个时间点）
    const initialPieData = projects.map((project, index) => ({
      name: project.name,
      value: source[index + 1] ? source[index + 1][1] : 0,
      itemStyle: {
        color: project.color
      }
    }));

    const option = {
      color: projects.map(project => project.color),
      legend: {
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        showContent: false
      },
      dataset: {
        source: source
      },
      xAxis: { 
        type: 'category',
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: { 
        gridIndex: 0,
        name: '人力投入',
        nameLocation: 'middle',
        nameGap: 50
      },
      grid: { 
        top: '20%',
        left: '55%',
        right: '2%',
        bottom: '20%'
      },
      series: [
        // 折线图系列 - 按项目（版本）
        ...projects.map(() => ({
          type: 'line',
          smooth: false,
          seriesLayoutBy: 'row',
          emphasis: { focus: 'series' },
          lineStyle: {
            width: 2
          },
          symbol: 'circle',
          symbolSize: 6
        })),
        // 饼图系列
        {
          type: 'pie',
          id: 'pie',
          radius: '50%',
          center: ['20%', '50%'],
          data: initialPieData,
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {c} ({d}%)',
            fontSize: 12
          },
          labelLine: {
            show: true
          }
        }
      ]
    };

    // 设置图表联动
    chartInstance.current.off('updateAxisPointer');
    chartInstance.current.on('updateAxisPointer', function (event: any) {
      const xAxisInfo = event.axesInfo[0];
      if (xAxisInfo) {
        const dimension = xAxisInfo.value + 1;
        
        // 更新饼图数据
        const updatedPieData = projects.map((project, index) => ({
          name: project.name,
          value: source[index + 1] ? source[index + 1][dimension] : 0,
          itemStyle: {
            color: project.color
          }
        }));

        chartInstance.current?.setOption({
          series: {
            id: 'pie',
            data: updatedPieData,
            label: {
              formatter: '{b}: {c} ({d}%)'
            }
          }
        });
      }
    });

    chartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [teams, projects, timePoints, allocations, sortedTimePoints]);

  // 清理
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">版本人力投入分析</h3>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>项目: {projects.length}</span>
            <span>时间点: {timePoints.length}</span>
            <span>总人力: {teams.reduce((sum, team) => sum + team.capacity, 0)}</span>
          </div>
        </div>

        {/* 项目图例 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            项目版本
          </h4>
          <div className="flex flex-wrap gap-2">
            {projects.map(project => (
              <div
                key={project.id}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200"
              >
                <div 
                  className={`w-3 h-3 mr-2 ${
                    project.pattern === 'dots' ? 'rounded-full' : ''
                  }`}
                  style={{
                    backgroundColor: project.color,
                    ...(project.pattern === 'stripes' ? {
                      background: `repeating-linear-gradient(45deg, ${project.color}, ${project.color} 2px, transparent 2px, transparent 4px)`
                    } : {})
                  }}
                />
                {project.name}
              </div>
            ))}
          </div>
        </div>

        {/* 图表容器 */}
        <div 
          ref={chartRef} 
          className="w-full h-96"
        />
        
        {/* 操作说明 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">图表说明</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>左侧饼图</strong>：显示选中时间点的项目人力分布情况</p>
            <p>• <strong>右侧折线图</strong>：显示各项目在不同时间点的人力投入趋势</p>
            <p>• <strong>联动交互</strong>：鼠标悬停在折线图上可实时更新饼图数据</p>
            <p>• <strong>数据统计</strong>：按项目版本统计人力投入，支持时间轴分析</p>
            <p>• <strong>点击图例</strong>：可筛选显示特定项目的数据趋势</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 