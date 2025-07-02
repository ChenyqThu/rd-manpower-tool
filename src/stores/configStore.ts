import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Team, Project, TimePoint } from '../types/data';

interface ConfigState {
  // 状态数据
  teams: Team[];
  projects: Project[];
  timePoints: TimePoint[];
  
  // 团队管理操作
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  
  // 项目管理操作
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // 时间点管理操作
  addTimePoint: (timePoint: Omit<TimePoint, 'id'>) => void;
  updateTimePoint: (id: string, updates: Partial<TimePoint>) => void;
  removeTimePoint: (id: string) => void;
  
  // 工具方法
  getTeamById: (id: string) => Team | undefined;
  getProjectById: (id: string) => Project | undefined;
  getTimePointById: (id: string) => TimePoint | undefined;
  getTotalCapacity: () => number;
  
  // 重置操作
  resetAll: () => void;
  importConfig: (config: { teams: Team[]; projects: Project[]; timePoints: TimePoint[] }) => void;
}

// 生成唯一ID的工具函数
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// 默认配置数据 - 星云科技示例
const defaultTeams: Team[] = [
  { id: 'team-1', name: '前端团队', capacity: 12, description: '负责Web和移动端前端开发', color: '#3498db', badge: '①' },
  { id: 'team-2', name: '后端团队', capacity: 15, description: '负责核心服务和API开发', color: '#e74c3c', badge: '②' },
  { id: 'team-3', name: '数据团队', capacity: 8, description: '负责大数据平台和AI算法', color: '#2ecc71', badge: '③' },
  { id: 'team-4', name: '测试团队', capacity: 6, description: '负责质量保证和自动化测试', color: '#f39c12', badge: '④' },
  { id: 'team-5', name: '运维团队', capacity: 5, description: '负责基础设施和DevOps', color: '#9b59b6', badge: '⑤' },
  { id: 'team-6', name: '产品团队', capacity: 4, description: '负责需求分析和产品设计', color: '#1abc9c', badge: '⑥' },
];

const defaultProjects: Project[] = [
  { 
    id: 'project-1', 
    name: 'CRM系统 v2.0', 
    status: 'development', 
    color: '#3498db',
    description: '核心客户关系管理系统重构',
    teams: ['team-1', 'team-2', 'team-4'],
    releaseDate: '2024-07',
    pattern: 'solid'
  },
  { 
    id: 'project-2', 
    name: '数据分析平台', 
    status: 'development', 
    color: '#e74c3c',
    description: '企业级数据分析和BI平台',
    teams: ['team-2', 'team-3', 'team-6'],
    releaseDate: '2024-10',
    pattern: 'solid'
  },
  { 
    id: 'project-3', 
    name: '移动端App', 
    status: 'planning', 
    color: '#2ecc71',
    description: '移动端客户应用开发',
    teams: ['team-1', 'team-2'],
    releaseDate: '2024-10',
    pattern: 'stripes'
  },
  { 
    id: 'project-4', 
    name: '用户中心升级', 
    status: 'development', 
    color: '#f39c12',
    description: '统一用户认证和权限系统',
    teams: ['team-2', 'team-5'],
    releaseDate: '2024-04',
    pattern: 'dots'
  },
  { 
    id: 'project-5', 
    name: '监控平台', 
    status: 'development', 
    color: '#9b59b6',
    description: '系统性能监控和告警平台',
    teams: ['team-5', 'team-3'],
    releaseDate: '2024-07',
    pattern: 'dots'
  },
  { 
    id: 'project-6', 
    name: 'API网关优化', 
    status: 'planning', 
    color: '#1abc9c',
    description: '微服务API网关性能优化',
    teams: ['team-2', 'team-5'],
    releaseDate: '2024-10',
    pattern: 'dots'
  },
  { 
    id: 'project-7', 
    name: 'AI智能助手', 
    status: 'planning', 
    color: '#e67e22',
    description: '基于AI的智能客服助手',
    teams: ['team-3', 'team-1'],
    releaseDate: '2024-12',
    pattern: 'stripes'
  },
  { 
    id: 'project-8', 
    name: '微服务架构', 
    status: 'planning', 
    color: '#34495e',
    description: '系统微服务化改造',
    teams: ['team-2', 'team-5'],
    releaseDate: '2024-12',
    pattern: 'stripes'
  },
];

const defaultTimePoints: TimePoint[] = [
  { id: 'time-1', name: 'Q1启动期', date: '2024-01', description: '项目启动和需求分析', type: 'current' },
  { id: 'time-2', name: 'Q2开发期', date: '2024-04', description: '核心功能开发阶段', type: 'release' },
  { id: 'time-3', name: 'Q3发布期', date: '2024-07', description: '产品发布和上线', type: 'release' },
  { id: 'time-4', name: 'Q4优化期', date: '2024-10', description: '性能优化和下轮规划', type: 'planning' },
];

export const useConfigStore = create<ConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        teams: defaultTeams,
        projects: defaultProjects,
        timePoints: defaultTimePoints,

        // 团队管理操作
        addTeam: (team) => set((state) => ({
          teams: [...state.teams, { ...team, id: generateId() }]
        }), false, 'addTeam'),

        updateTeam: (id, updates) => set((state) => ({
          teams: state.teams.map(team => 
            team.id === id ? { ...team, ...updates } : team
          )
        }), false, 'updateTeam'),

        removeTeam: (id) => set((state) => ({
          teams: state.teams.filter(team => team.id !== id)
        }), false, 'removeTeam'),

        // 项目管理操作
        addProject: (project) => set((state) => ({
          projects: [...state.projects, { ...project, id: generateId() }]
        }), false, 'addProject'),

        updateProject: (id, updates) => set((state) => ({
          projects: state.projects.map(project => 
            project.id === id ? { ...project, ...updates } : project
          )
        }), false, 'updateProject'),

        removeProject: (id) => set((state) => ({
          projects: state.projects.filter(project => project.id !== id)
        }), false, 'removeProject'),

        // 时间点管理操作
        addTimePoint: (timePoint) => set((state) => ({
          timePoints: [...state.timePoints, { ...timePoint, id: generateId() }]
        }), false, 'addTimePoint'),

        updateTimePoint: (id, updates) => set((state) => ({
          timePoints: state.timePoints.map(timePoint => 
            timePoint.id === id ? { ...timePoint, ...updates } : timePoint
          )
        }), false, 'updateTimePoint'),

        removeTimePoint: (id) => set((state) => ({
          timePoints: state.timePoints.filter(timePoint => timePoint.id !== id)
        }), false, 'removeTimePoint'),

        // 工具方法
        getTeamById: (id) => get().teams.find(team => team.id === id),
        getProjectById: (id) => get().projects.find(project => project.id === id),
        getTimePointById: (id) => get().timePoints.find(timePoint => timePoint.id === id),
        getTotalCapacity: () => get().teams.reduce((total, team) => total + team.capacity, 0),

        // 重置操作
        resetAll: () => set({
          teams: defaultTeams,
          projects: defaultProjects,
          timePoints: defaultTimePoints,
        }, false, 'resetAll'),

        importConfig: (config) => set({
          teams: config.teams,
          projects: config.projects,
          timePoints: config.timePoints,
        }, false, 'importConfig'),
      }),
      {
        name: 'manpower-config-storage',
        version: 6, // 更新为星云科技示例数据
        migrate: () => {
          // 强制使用新的星云科技示例数据
          return {
            teams: defaultTeams,
            projects: defaultProjects,
            timePoints: defaultTimePoints
          };
        },
      }
    ),
    {
      name: 'config-store',
    }
  )
); 