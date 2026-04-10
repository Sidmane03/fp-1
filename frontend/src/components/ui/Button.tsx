import React from 'react';

// Define what props (settings) the button accepts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; // [1] From Guidelines
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) => {
  
  // Base styles shared by ALL buttons (from your Login.tsx)
  const baseStyles = "w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center";
  
  // Styles specific to variants [3][1]
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-700 text-white hover:bg-gray-600",
    outline: "border-2 border-gray-200 text-gray-600 hover:border-gray-400",
    ghost: "text-blue-600 hover:text-blue-700 bg-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">⚪</span> // Simple spinner
      ) : null}
      {children}
    </button>
  );
};