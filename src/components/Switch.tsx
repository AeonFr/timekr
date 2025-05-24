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
  className = "",
}) => {
  return (
    <div
      className={`inline-flex border border-1 border rounded overflow-hidden ${className}`}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`cursor-default px-2 py-1 text-xs tracking-wide uppercase ${
            value === option ? "text-blue bg-1" : "text-1 hover:bg-2"
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
