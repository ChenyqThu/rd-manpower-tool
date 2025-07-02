import React from 'react';
import type { Project } from '../types/data';

interface ProjectBadgeProps {
  project: Project;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  title?: string;
}

export const ProjectBadge: React.FC<ProjectBadgeProps> = ({ 
  project, 
  size = 'md', 
  showText = false, 
  className = '',
  title 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const getPatternStyle = () => {
    const baseStyle = { backgroundColor: project.color };
    
    switch (project.pattern) {
      case 'stripes':
        return {
          ...baseStyle,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            ${project.color},
            ${project.color} 2px,
            rgba(255,255,255,0.3) 2px,
            rgba(255,255,255,0.3) 4px
          )`
        };
      case 'dots':
        return {
          ...baseStyle,
          backgroundImage: `radial-gradient(
            circle at 25% 25%, 
            rgba(255,255,255,0.4) 1px, 
            transparent 1px
          )`,
          backgroundSize: '4px 4px'
        };
      default:
        return baseStyle;
    }
  };

  const badge = (
    <div className="flex items-center space-x-1">
      <div
        className={`rounded-full flex-shrink-0 ${sizeClasses[size]} ${className}`}
        style={getPatternStyle()}
        title={title || `${project.name}${project.releaseDate ? ` (${project.releaseDate})` : ''}`}
      />
      {showText && (
        <span className="text-sm text-gray-700 truncate">{project.name}</span>
      )}
    </div>
  );

  return badge;
}; 