import React, { useState } from 'react';

interface PieChartData {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  size = 140, 
  showLegend = true 
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-xs text-gray-500">暂无数据</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-xs text-gray-500">暂无分配</div>
      </div>
    );
  }

  const radius = size / 2 - 2;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90; // 从顶部开始

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    
    // 计算路径
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // 计算标签位置（中间角度的位置）
    const midAngle = ((currentAngle + angle / 2) * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(midAngle);
    const labelY = centerY + labelRadius * Math.sin(midAngle);
    
    currentAngle += angle;
    
    return {
      ...item,
      pathData,
      percentage,
      labelX,
      labelY,
      angle
    };
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg width={size} height={size} className="flex-shrink-0">
          {slices.map((slice) => (
            <g key={slice.id}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className={`cursor-pointer transition-all duration-200 ${
                  hoveredSlice === slice.id 
                    ? 'opacity-90 filter drop-shadow-lg' 
                    : hoveredSlice 
                      ? 'opacity-60' 
                      : 'opacity-100 hover:opacity-90'
                }`}
                onMouseEnter={() => setHoveredSlice(slice.id)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              
              {/* 显示百分比标签（只在大于5%时显示） */}
              {slice.percentage > 5 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-white pointer-events-none"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {slice.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          ))}
        </svg>
        
        {/* Hover tooltip */}
        {hoveredSlice && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
            {slices.find(s => s.id === hoveredSlice)?.name}: {slices.find(s => s.id === hoveredSlice)?.value}人 ({slices.find(s => s.id === hoveredSlice)?.percentage.toFixed(1)}%)
          </div>
        )}
      </div>
      
      {/* 图例 */}
      {showLegend && (
        <div className="space-y-1">
          {slices
            .sort((a, b) => b.percentage - a.percentage)
            .map((slice) => (
            <div 
              key={slice.id} 
              className={`flex items-center space-x-2 text-xs cursor-pointer transition-opacity ${
                hoveredSlice && hoveredSlice !== slice.id ? 'opacity-50' : 'opacity-100'
              }`}
              onMouseEnter={() => setHoveredSlice(slice.id)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="truncate text-gray-700 font-medium">{slice.name}</div>
                <div className="text-gray-500">
                  {slice.percentage.toFixed(1)}% ({slice.value}人)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 