import React, { useState } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import type { TimePoint } from '../../types/data';

interface TimeFormData {
  name: string;
  date: string;
  description: string;
  type: 'current' | 'planning' | 'release';
}

const initialFormData: TimeFormData = {
  name: '',
  date: '',
  description: '',
  type: 'planning',
};

const typeOptions: { value: TimeFormData['type']; label: string; color: string }[] = [
  { value: 'current', label: '当前状态', color: 'bg-blue-100 text-blue-800' },
  { value: 'planning', label: '规划节点', color: 'bg-gray-100 text-gray-800' },
  { value: 'release', label: '发布节点', color: 'bg-green-100 text-green-800' },
];

export const TimeConfig: React.FC = () => {
  const { timePoints, addTimePoint, updateTimePoint, removeTimePoint } = useConfigStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimePoint, setEditingTimePoint] = useState<TimePoint | null>(null);
  const [formData, setFormData] = useState<TimeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<TimeFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<TimeFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '时间点名称不能为空';
    } else if (timePoints.some(tp => tp.name === formData.name && tp.id !== editingTimePoint?.id)) {
      newErrors.name = '时间点名称已存在';
    }
    
    if (!formData.date.trim()) {
      newErrors.date = '时间日期不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const timePointData = {
      name: formData.name,
      date: formData.date,
      description: formData.description,
      type: formData.type,
    };
    
    if (editingTimePoint) {
      updateTimePoint(editingTimePoint.id, timePointData);
    } else {
      addTimePoint(timePointData);
    }
    
    handleCloseModal();
  };

  const handleOpenModal = (timePoint?: TimePoint) => {
    if (timePoint) {
      setEditingTimePoint(timePoint);
      setFormData({
        name: timePoint.name,
        date: timePoint.date,
        description: timePoint.description || '',
        type: timePoint.type,
      });
    } else {
      setEditingTimePoint(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTimePoint(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleDelete = (timePointId: string) => {
    if (window.confirm('确定要删除这个时间点吗？')) {
      removeTimePoint(timePointId);
    }
  };

  const getTypeInfo = (type: TimeFormData['type']) => {
    return typeOptions.find(option => option.value === type) || typeOptions[1];
  };

  // 按日期排序时间点
  const sortedTimePoints = [...timePoints].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">时间点配置</h2>
        <Button onClick={() => handleOpenModal()}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加时间点
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedTimePoints.map((timePoint) => {
          const typeInfo = getTypeInfo(timePoint.type);
          return (
            <div key={timePoint.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 text-sm">{timePoint.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenModal(timePoint)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="编辑"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(timePoint.id)}
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
                  <span className="font-medium">类型:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>
                <div>
                  <span className="font-medium">日期:</span> {timePoint.date}
                </div>
                {timePoint.description && (
                  <div>
                    <span className="font-medium">描述:</span> {timePoint.description}
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
        title={editingTimePoint ? '编辑时间点' : '添加时间点'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="时间点名称"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            placeholder="请输入时间点名称，如：7月、9月"
            required
          />

          <Input
            label="时间日期"
            type="month"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            error={errors.date}
            placeholder="请选择时间日期"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">时间点类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TimeFormData['type'] }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="time-description" className="block text-sm font-medium text-gray-700">
              描述说明（可选）
            </label>
            <textarea
              id="time-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="请输入时间点的关键事件或说明"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              取消
            </Button>
            <Button type="submit">
              {editingTimePoint ? '更新' : '添加'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}; 