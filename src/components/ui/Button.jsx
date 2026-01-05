import React from 'react';

const variants = {
  primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/20 active:scale-95",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:text-purple-600 active:bg-slate-50",
  danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:scale-95",
  success: "bg-green-600 text-white hover:bg-green-700 active:scale-95",
  ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
};

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`
        px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
        ${variants[variant] || variants.primary}
        ${props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
