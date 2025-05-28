import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-100 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
};
