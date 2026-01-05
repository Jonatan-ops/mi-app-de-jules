import React from 'react';

const colors = {
  green: "bg-green-100 text-green-700 border-green-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

export const Badge = ({ children, color = 'gray', className = '' }) => {
  return (
    <span
      className={`
        px-2.5 py-0.5 rounded-full text-xs font-bold border
        ${colors[color] || colors.gray}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
