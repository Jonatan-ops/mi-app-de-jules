import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
