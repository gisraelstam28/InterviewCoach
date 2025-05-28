import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient'; // Add more variants as needed
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  let baseStyle = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'px-4 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition';
      break;
    case 'secondary':
      variantStyle = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition';
      break;
    case 'ghost':
      variantStyle = 'px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50';
      break;
    case 'gradient':
      variantStyle = 'px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md font-medium shadow hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition';
      break;
    default:
      variantStyle = 'px-4 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition';
  }

  return (
    <button
      type="button" // Default to button, can be overridden by props
      className={`${baseStyle} ${variantStyle} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
