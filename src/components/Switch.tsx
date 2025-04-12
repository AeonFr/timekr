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
    <div className={`inline-flex ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`px-2 py-1 text-xs ${
            value === option
              ? "bg-blue-dark text-white"
              : "bg-white text-grey-darker hover:bg-grey-lightest"
          } ${
            options.indexOf(option) === 0
              ? "rounded-l"
              : options.indexOf(option) === options.length - 1
                ? "rounded-r"
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
