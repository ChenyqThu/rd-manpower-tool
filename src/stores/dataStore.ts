import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AllocationMatrix, ValidationResult, SankeyData } from '../types/data';
import { useConfigStore } from './configStore';

interface DataState {
  // 状态数据
  allocations: AllocationMatrix;
  validationResults: ValidationResult[];
  sankeyData: SankeyData | null;
  isLoading: boolean;
  
  // 人力分配操作
  updateAllocation: (
    timePointId: string, 
    projectId: string, 
    teamId: string, 
    data: { occupied: number; prerelease: number }
  ) => void;
  
  updateMultipleAllocations: (updates: {
    timePointId: string;
    projectId: string;
    teamId: string;
    data: { occupied: number; prerelease: number };
  }[]) => void;
  
  // 数据验证
  setValidationResults: (results: ValidationResult[]) => void;
  clearValidationResults: () => void;
  
  // 桑基图数据
  setSankeyData: (data: SankeyData | null) => void;
  
  // 加载状态
  setLoading: (isLoading: boolean) => void;
  
  // 工具方法
  getAllocationByKeys: (timePointId: string, projectId: string, teamId: string) => { occupied: number; prerelease: number } | undefined;
  getTeamTotalAtTime: (timePointId: string, teamId: string) => number;
  getProjectTotalAtTime: (timePointId: string, projectId: string) => number;
  getStatistics: () => { totalCapacity: number; totalAllocated: number; totalPrerelease: number };
  
  // 重置操作
  resetAllocations: () => void;
  importAllocations: (allocations: AllocationMatrix) => void;
}

// 星云科技示例人力排布数据
const defaultAllocations: AllocationMatrix = {
  'time-1': { // Q1启动期 - 项目启动和需求分析
    'project-1': { // CRM系统 v2.0 (核心产品，高优先级)
      'team-1': { occupied: 4.0, prerelease: 0 }, // 前端团队重点投入
      'team-2': { occupied: 6.0, prerelease: 0 }, // 后端团队核心力量
      'team-4': { occupied: 3.0, prerelease: 0 }, // 测试团队跟进
      'team-6': { occupied: 2.0, prerelease: 0 }, // 产品团队需求分析
    },
    'project-2': { // 数据分析平台 (新产品线)
      'team-2': { occupied: 3.0, prerelease: 0 }, // 后端支持
      'team-3': { occupied: 5.0, prerelease: 0 }, // 数据团队主力
      'team-6': { occupied: 1.0, prerelease: 0 }, // 产品规划
    },
    'project-4': { // 用户中心升级 (基础服务)
      'team-2': { occupied: 2.0, prerelease: 0 }, // 后端改造
      'team-5': { occupied: 2.0, prerelease: 0 }, // 运维配合
    },
    'project-5': { // 监控平台 (内部工具)
      'team-5': { occupied: 3.0, prerelease: 0 }, // 运维主导
      'team-3': { occupied: 1.0, prerelease: 0 }, // 数据支持
    },
  },
  'time-2': { // Q2开发期 - 核心功能开发阶段
    'project-1': { // CRM系统 v2.0 (加速开发)
      'team-1': { occupied: 8.0, prerelease: 2.0 }, // 前端加大投入，准备预释放
      'team-2': { occupied: 9.0, prerelease: 1.0 }, // 后端核心开发
      'team-4': { occupied: 4.0, prerelease: 0 }, // 测试全力跟进
      'team-6': { occupied: 1.0, prerelease: 0 }, // 产品收尾
    },
    'project-2': { // 数据分析平台 (同步推进)
      'team-2': { occupied: 4.0, prerelease: 0 }, // 后端增加投入
      'team-3': { occupied: 6.0, prerelease: 0 }, // 数据团队主力
      'team-6': { occupied: 2.0, prerelease: 0 }, // 产品细化
    },
    'project-3': { // 移动端App (启动开发)
      'team-1': { occupied: 2.0, prerelease: 0 }, // 前端开始移动端
      'team-2': { occupied: 1.0, prerelease: 0 }, // 后端API支持
    },
    'project-4': { // 用户中心升级 (收尾发布)
      'team-2': { occupied: 1.0, prerelease: 1.0 }, // 准备释放
      'team-5': { occupied: 1.0, prerelease: 1.0 }, // 运维收尾
    },
    'project-5': { // 监控平台 (持续开发)
      'team-5': { occupied: 3.0, prerelease: 0 }, // 运维主导
      'team-3': { occupied: 1.0, prerelease: 0 }, // 数据支持
    },
  },
  'time-3': { // Q3发布期 - 产品发布和上线
    'project-1': { // CRM系统 v2.0 (发布上线)
      'team-1': { occupied: 6.0, prerelease: 2.0 }, // 前端发布支持
      'team-2': { occupied: 8.0, prerelease: 2.0 }, // 后端发布保障
      'team-4': { occupied: 2.0, prerelease: 0 }, // 测试验证
      'team-5': { occupied: 1.0, prerelease: 0 }, // 运维发布支持
    },
    'project-2': { // 数据分析平台 (冲刺发布)
      'team-2': { occupied: 2.0, prerelease: 0 }, // 后端收尾
      'team-3': { occupied: 7.0, prerelease: 1.0 }, // 数据团队冲刺
      'team-4': { occupied: 2.0, prerelease: 0 }, // 测试验证
      'team-6': { occupied: 1.0, prerelease: 0 }, // 产品验收
    },
    'project-3': { // 移动端App (加速开发)
      'team-1': { occupied: 2.0, prerelease: 0 }, // 前端移动端
      'team-2': { occupied: 3.0, prerelease: 0 }, // 后端API完善
      'team-4': { occupied: 2.0, prerelease: 0 }, // 测试移动端
    },
    'project-5': { // 监控平台 (发布准备)
      'team-5': { occupied: 4.0, prerelease: 0 }, // 运维最后冲刺
      'team-3': { occupied: 0, prerelease: 0 }, // 数据团队专注平台
    },
  },
  'time-4': { // Q4优化期 - 性能优化和下轮规划
    'project-2': { // 数据分析平台 (优化维护)
      'team-2': { occupied: 1.0, prerelease: 0 }, // 后端维护
      'team-3': { occupied: 3.0, prerelease: 2.0 }, // 数据团队释放资源
      'team-4': { occupied: 1.0, prerelease: 0 }, // 测试监控
    },
    'project-3': { // 移动端App (发布上线)
      'team-1': { occupied: 4.0, prerelease: 0 }, // 前端发布支持
      'team-2': { occupied: 4.0, prerelease: 0 }, // 后端稳定性
      'team-4': { occupied: 2.0, prerelease: 0 }, // 测试验证
      'team-5': { occupied: 1.0, prerelease: 0 }, // 运维支持
    },
    'project-6': { // API网关优化 (开始投入)
      'team-2': { occupied: 5.0, prerelease: 0 }, // 后端主力
      'team-5': { occupied: 3.0, prerelease: 0 }, // 运维配合
    },
    'project-7': { // AI智能助手 (开始探索)
      'team-3': { occupied: 3.0, prerelease: 0 }, // 数据团队AI研发
      'team-1': { occupied: 2.0, prerelease: 0 }, // 前端界面
    },
    'project-8': { // 微服务架构 (技术调研)
      'team-2': { occupied: 1.0, prerelease: 0 }, // 后端架构师
      'team-5': { occupied: 1.0, prerelease: 0 }, // 运维评估
      'team-6': { occupied: 1.0, prerelease: 0 }, // 产品规划
    },
  },
};

export const useDataStore = create<DataState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        allocations: defaultAllocations,
        validationResults: [],
        sankeyData: null,
        isLoading: false,

        // 人力分配操作
        updateAllocation: (timePointId, projectId, teamId, data) => set((state) => {
          const newAllocations = { ...state.allocations };
          
          if (!newAllocations[timePointId]) {
            newAllocations[timePointId] = {};
          }
          if (!newAllocations[timePointId][projectId]) {
            newAllocations[timePointId][projectId] = {};
          }
          
          newAllocations[timePointId][projectId][teamId] = data;
          
          return { allocations: newAllocations };
        }, false, 'updateAllocation'),

        updateMultipleAllocations: (updates) => set((state) => {
          const newAllocations = { ...state.allocations };
          
          updates.forEach(({ timePointId, projectId, teamId, data }) => {
            if (!newAllocations[timePointId]) {
              newAllocations[timePointId] = {};
            }
            if (!newAllocations[timePointId][projectId]) {
              newAllocations[timePointId][projectId] = {};
            }
            newAllocations[timePointId][projectId][teamId] = data;
          });
          
          return { allocations: newAllocations };
        }, false, 'updateMultipleAllocations'),

        // 数据验证
        setValidationResults: (results) => set({ validationResults: results }, false, 'setValidationResults'),
        clearValidationResults: () => set({ validationResults: [] }, false, 'clearValidationResults'),

        // 桑基图数据
        setSankeyData: (data) => set({ sankeyData: data }, false, 'setSankeyData'),

        // 加载状态
        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

        // 工具方法
        getAllocationByKeys: (timePointId, projectId, teamId) => {
          const { allocations } = get();
          return allocations[timePointId]?.[projectId]?.[teamId];
        },

        getTeamTotalAtTime: (timePointId, teamId) => {
          const { allocations } = get();
          const timeData = allocations[timePointId] || {};
          
          return Object.values(timeData).reduce((total, projectData) => {
            const allocation = projectData[teamId];
            return total + (allocation ? allocation.occupied : 0);
          }, 0);
        },

        getProjectTotalAtTime: (timePointId, projectId) => {
          const { allocations } = get();
          const projectData = allocations[timePointId]?.[projectId] || {};
          
          return Object.values(projectData).reduce((total, allocation) => {
            return total + allocation.occupied;
          }, 0);
        },

        getStatistics: () => {
          const { allocations } = get();
          const { getTotalCapacity, timePoints } = useConfigStore.getState();
          
          // 只统计当前配置中存在的时间点
          const configuredTimePointIds = timePoints.map(tp => tp.id);
          const availableTimePointIds = configuredTimePointIds.filter(id => allocations[id]);
          
          if (availableTimePointIds.length === 0) {
            return {
              totalCapacity: getTotalCapacity(),
              totalAllocated: 0,
              totalPrerelease: 0,
            };
          }
          
          // 计算每个配置的时间点的总分配人力，然后求平均值
          let totalAllocatedSum = 0;
          let totalPrereleaseSum = 0;
          
          availableTimePointIds.forEach(timePointId => {
            const timeData = allocations[timePointId];
            let timeAllocated = 0;
            let timePrerelease = 0;
            
            Object.values(timeData).forEach(projectData => {
              Object.values(projectData).forEach(allocation => {
                timeAllocated += allocation.occupied;
                timePrerelease += allocation.prerelease;
              });
            });
            
            totalAllocatedSum += timeAllocated;
            totalPrereleaseSum += timePrerelease;
          });
          
          // 计算平均值
          const avgAllocated = totalAllocatedSum / availableTimePointIds.length;
          const avgPrerelease = totalPrereleaseSum / availableTimePointIds.length;
          
          return {
            totalCapacity: getTotalCapacity(),
            totalAllocated: avgAllocated,
            totalPrerelease: avgPrerelease,
          };
        },

        // 重置操作
        resetAllocations: () => set({ 
          allocations: defaultAllocations,
          validationResults: [],
          sankeyData: null 
        }, false, 'resetAllocations'),

        importAllocations: (allocations) => set({ 
          allocations,
          validationResults: [],
          sankeyData: null 
        }, false, 'importAllocations'),
      }),
      {
        name: 'manpower-data-storage',
        version: 6,
        partialize: (state) => ({ allocations: state.allocations }), // 只持久化分配数据
      }
    ),
    {
      name: 'data-store',
    }
  )
); 