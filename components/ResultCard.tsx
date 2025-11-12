
import React from 'react';

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ icon, title, children }) => {
  return (
    <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
