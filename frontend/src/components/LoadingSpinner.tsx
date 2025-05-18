import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'purple' | 'gray';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'blue',
  text
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 'w-4 h-4';
      case 'large': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const getColor = () => {
    switch (color) {
      case 'purple': return 'border-purple-600';
      case 'gray': return 'border-gray-600';
      default: return 'border-blue-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`spinner ${getSize()} border-2 ${getColor()} border-t-2`}></div>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
