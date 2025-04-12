import React from "react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const DateInput: React.FC<DateInputProps> = ({ 
  value, 
  onChange, 
  label = "Date and Time:" 
}) => {
  return (
    <label className="block text-left">
      <div className="px-2 text-1">{label}</div>
      <input
        type="datetime-local"
        className="input text-lg font-mono"
        value={value}
        style={{ maxWidth: "280px" }}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
};

export default DateInput;
