import React from 'react';
import type { Team } from '../types/data';

interface TeamBadgeProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  title?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({ 
  team, 
  size = 'md', 
  showText = false, 
  className = '',
  title 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-4 h-4 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  const badge = (
    <div className="flex items-center space-x-1">
      <div
        className={`rounded-full flex items-center justify-center text-white font-bold relative ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: team.color }}
        title={title || `${team.name}: ${team.capacity}人`}
      >
        {team.badge && (
          <span className="text-xs font-bold">{team.badge}</span>
        )}
      </div>
      {showText && (
        <span className="text-sm text-gray-700">{team.name}</span>
      )}
    </div>
  );

  return badge;
}; 