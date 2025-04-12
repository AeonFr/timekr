import React from "react";

interface SwitchProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ 
  options, 
  value, 
  onChange,
  className = ""
}) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`px-3 py-1 text-xs font-medium ${
            value === option
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          } ${
            options.indexOf(option) === 0
              ? "rounded-l-md"
              : options.indexOf(option) === options.length - 1
              ? "rounded-r-md"
              : ""
          }`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default Switch;
