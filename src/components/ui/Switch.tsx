import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red';
  className?: string;
  label?: string;
  description?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  className = '',
  label,
  description,
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: checked ? 'translate-x-4' : 'translate-x-0.5',
      thumbMargin: 'mt-0',
    },
    md: {
      container: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5',
      thumbMargin: 'mt-0.5',
    },
    lg: {
      container: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0.5',
      thumbMargin: 'mt-0.5',
    },
  };

  const colorClasses = {
    blue: checked ? 'bg-blue-600' : 'bg-gray-200',
    green: checked ? 'bg-green-600' : 'bg-gray-200',
    purple: checked ? 'bg-purple-600' : 'bg-gray-200',
    red: checked ? 'bg-red-600' : 'bg-gray-200',
  };

  const focusColorClasses = {
    blue: 'focus:ring-blue-500',
    green: 'focus:ring-green-500',
    purple: 'focus:ring-purple-500',
    red: 'focus:ring-red-500',
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color];
  const focusColor = focusColorClasses[color];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center ${currentSize.container} 
        rounded-full transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${focusColor}
        ${currentColor}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="sr-only">{label || 'Toggle switch'}</span>
      <span
        className={`
          ${currentSize.thumb} ${currentSize.thumbMargin}
          bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out
          ${currentSize.translate}
          ${disabled ? '' : 'group-hover:shadow-md'}
        `}
      />
    </button>
  );

  if (label || description) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {switchElement}
        </div>
        <div className="flex-1 min-w-0">
          {label && (
            <label
              className={`text-sm font-medium ${
                disabled ? 'text-gray-400' : 'text-gray-900'
              } cursor-pointer`}
              onClick={handleClick}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return switchElement;
}; 