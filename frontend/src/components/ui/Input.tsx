import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = "", ...props }: InputProps) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>}
      
      <input
        className={`
          w-full p-3 rounded-xl bg-gray-900 border-2 
          text-white placeholder-gray-500 focus:outline-none transition-colors
          ${error 
            ? "border-red-500 focus:border-red-500" 
            : "border-gray-700 focus:border-blue-500"
          }
          ${className}
        `}
        {...props}
      />
      
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};