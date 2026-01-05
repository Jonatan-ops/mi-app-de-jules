import React from 'react';

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`
        w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
};

export const Select = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`
        bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
};
