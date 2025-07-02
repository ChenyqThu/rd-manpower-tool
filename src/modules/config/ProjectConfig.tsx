import React, { useState } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProjectBadge } from '../../components/ProjectBadge';
import type { Project, ProjectStatus } from '../../types/data';

interface ProjectFormData {
  name: string;
  status: ProjectStatus;
  description: string;
  color: string;
  teams: string[];
  releaseDate: string;
  pattern: 'solid' | 'stripes' | 'dots';
}

const initialFormData: ProjectFormData = {
  name: '',
  status: 'planning',
  description: '',
  color: '#e74c3c',
  teams: [],
  releaseDate: '',
  pattern: 'solid',
};

const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'planning', label: '规划中', color: 'bg-gray-100 text-gray-800' },
  { value: 'development', label: '开发中', color: 'bg-blue-100 text-blue-800' },
  { value: 'release', label: '即将发布', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800' },
];

export const ProjectConfig: React.FC = () => {
  const { projects, teams, addProject, updateProject, removeProject } = useConfigStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空';
    } else if (projects.some(project => project.name === formData.name && project.id !== editingProject?.id)) {
      newErrors.name = '项目名称已存在';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const projectData = {
      name: formData.name,
      status: formData.status,
      description: formData.description,
      color: formData.color,
      teams: formData.teams,
      releaseDate: formData.releaseDate || undefined,
      pattern: formData.pattern,
    };
    
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }
    
    handleCloseModal();
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        status: project.status,
        description: project.description || '',
        color: project.color,
        teams: project.teams || [],
        releaseDate: project.releaseDate || '',
        pattern: project.pattern || 'solid',
      });
    } else {
      setEditingProject(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      removeProject(projectId);
    }
  };

  const getStatusInfo = (status: ProjectStatus) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const colorOptions = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085'
  ];

  const patternOptions = [
    { value: 'solid' as const, label: '纯色', icon: '●' },
    { value: 'stripes' as const, label: '条纹', icon: '▦' },
    { value: 'dots' as const, label: '圆点', icon: '⚫' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">项目配置</h2>
        <Button onClick={() => handleOpenModal()}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加项目
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const statusInfo = getStatusInfo(project.status);
          return (
            <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <ProjectBadge project={project} size="md" />
                  <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(project)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="编辑"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">状态:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                {project.description && (
                  <div>
                    <span className="font-medium">描述:</span> {project.description}
                  </div>
                )}
                {project.teams && project.teams.length > 0 && (
                  <div>
                    <span className="font-medium">团队:</span> {project.teams.length}个团队
                  </div>
                )}
                {project.releaseDate && (
                  <div>
                    <span className="font-medium">发布时间:</span> {project.releaseDate}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? '编辑项目' : '添加项目'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="项目名称"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            placeholder="请输入项目名称"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">项目状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">项目颜色</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">项目图案</label>
              <div className="flex flex-wrap gap-2">
                {patternOptions.map((pattern) => (
                  <button
                    key={pattern.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pattern: pattern.value }))}
                    className={`px-3 py-2 border-2 rounded-md transition-all flex items-center space-x-2 ${
                      formData.pattern === pattern.value ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title={`图案: ${pattern.label}`}
                  >
                    <span className="text-sm">{pattern.icon}</span>
                    <span className="text-xs">{pattern.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              关联团队（可选）
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
              {teams.map((team) => (
                <label key={team.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.teams.includes(team.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, teams: [...prev.teams, team.id] }));
                      } else {
                        setFormData(prev => ({ ...prev, teams: prev.teams.filter(t => t !== team.id) }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{team.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">选择此项目涉及的团队，在人力排布时只显示选中的团队</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="release-date" className="block text-sm font-medium text-gray-700">
              发布时间（可选）
            </label>
            <input
              id="release-date"
              type="month"
              value={formData.releaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500">设置项目发布时间，发布后将不再在人力排布中显示</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700">
              项目描述（可选）
            </label>
            <textarea
              id="project-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入项目描述"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              取消
            </Button>
            <Button type="submit">
              {editingProject ? '更新' : '添加'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}; 