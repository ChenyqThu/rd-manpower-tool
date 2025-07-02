// 核心数据类型定义
export interface ManpowerData {
  metadata: {
    title: string;
    version: string;
    totalPersons: number;
    lastUpdated: string;
  };
  teams: Team[];
  projects: Project[];
  timePoints: TimePoint[];
  allocations: AllocationMatrix;
}

export interface Team {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  color: string;
  badge?: string; // 团队标号，如①②③
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  color: string;
  description?: string;
  teams?: string[]; // 关联的团队ID列表
  releaseDate?: string; // 发布时间，格式：YYYY-MM
  pattern?: 'solid' | 'stripes' | 'dots'; // 图案类型，用于视觉区分
}

export interface TimePoint {
  id: string;
  name: string;
  date: string;
  description?: string;
  type: 'current' | 'planning' | 'release';
}

export interface AllocationMatrix {
  [timePointId: string]: {
    [projectId: string]: {
      [teamId: string]: {
        occupied: number;
        prerelease: number;
      };
    };
  };
}

export type ProjectStatus = 'development' | 'planning' | 'release' | 'completed';

// 验证相关类型
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  type: 'team_overallocation' | 'data_inconsistency' | 'missing_data';
  message: string;
  details: {
    teamId?: string;
    timePointId?: string;
    projectId?: string;
    expected?: number;
    actual?: number;
  };
}

export interface ValidationWarning {
  id: string;
  type: 'capacity_warning' | 'resource_inefficiency';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// 桑基图相关类型
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyNode {
  id: string;
  name: string;
  value: number;
  category: 'team' | 'project';
  color: string;
  x?: number;
  y?: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

// 人力流动计算类型
export interface ManpowerFlow {
  from: {
    type: 'team' | 'project';
    id: string;
    name: string;
  };
  to: {
    type: 'team' | 'project';
    id: string;
    name: string;
  };
  value: number;
  timePoint: string;
}

export interface InheritanceFlow {
  projectId: string;
  fromTimePoint: string;
  toTimePoint: string;
  inheritedPersons: number;
  newPersons: number;
  releasedPersons: number;
} 