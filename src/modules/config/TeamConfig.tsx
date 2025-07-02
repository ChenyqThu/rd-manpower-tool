import React, { useState } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { TeamBadge } from '../../components/TeamBadge';
import type { Team } from '../../types/data';

interface TeamFormData {
  name: string;
  capacity: string;
  description: string;
  color: string;
  badge: string;
}

  const initialFormData: TeamFormData = {
    name: '',
    capacity: '',
    description: '',
    color: '#3498db',
    badge: '',
  };

export const TeamConfig: React.FC = () => {
  const { teams, addTeam, updateTeam, removeTeam } = useConfigStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<TeamFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<TeamFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '团队名称不能为空';
    } else if (teams.some(team => team.name === formData.name && team.id !== editingTeam?.id)) {
      newErrors.name = '团队名称已存在';
    }
    
    const capacityNum = parseFloat(formData.capacity);
    if (!formData.capacity || isNaN(capacityNum) || capacityNum <= 0) {
      newErrors.capacity = '人力容量必须大于0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const teamData = {
      name: formData.name,
      capacity: parseFloat(formData.capacity),
      description: formData.description,
      color: formData.color,
      badge: formData.badge,
    };
    
    if (editingTeam) {
      updateTeam(editingTeam.id, teamData);
    } else {
      addTeam(teamData);
    }
    
    handleCloseModal();
  };

  const handleOpenModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        capacity: team.capacity.toString(),
        description: team.description || '',
        color: team.color,
        badge: team.badge || '',
      });
    } else {
      setEditingTeam(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleDelete = (teamId: string) => {
    if (window.confirm('确定要删除这个团队吗？')) {
      removeTeam(teamId);
    }
  };

  const colorOptions = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085'
  ];

  const badgeOptions = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">团队配置</h2>
        <Button onClick={() => handleOpenModal()}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加团队
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <TeamBadge team={team} size="md" />
                <h3 className="font-medium text-gray-900 text-sm">{team.name}</h3>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleOpenModal(team)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="编辑"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
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
              <div>
                <span className="font-medium">容量:</span> {team.capacity}人
              </div>
              {team.description && (
                <div>
                  <span className="font-medium">职责:</span> {team.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTeam ? '编辑团队' : '添加团队'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="团队名称"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            placeholder="请输入团队名称"
            required
          />

          <Input
            label="人力容量"
            type="number"
            min="0"
            step="0.5"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
            error={errors.capacity}
            placeholder="请输入人力容量"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">团队颜色</label>
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
              <label className="block text-sm font-medium text-gray-700">团队标号</label>
              <div className="flex flex-wrap gap-2">
                {badgeOptions.map((badge) => (
                  <button
                    key={badge || 'none'}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, badge }))}
                    className={`w-8 h-8 rounded border-2 transition-all flex items-center justify-center text-sm font-bold ${
                      formData.badge === badge ? 'border-gray-900 scale-110 bg-gray-100' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title={badge ? `标号: ${badge}` : '无标号'}
                  >
                    {badge || '无'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              职责描述（可选）
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入团队职责描述"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              取消
            </Button>
            <Button type="submit">
              {editingTeam ? '更新' : '添加'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}; 