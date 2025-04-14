import React, { useState, useEffect, useRef } from "react";

interface TimeInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ value = 0, onChange }) => {
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);

  // Calculate hours and minutes from the value
  const getHours = (val: number | string): number => {
    const numVal = Number(val);
    return numVal >= 0 ? Math.floor(numVal / 60) : Math.ceil(numVal / 60);
  };

  const getMinutes = (val: number | string): number => {
    return Number(val) % 60;
  };

  const [hours, setHours] = useState<number>(getHours(value));
  const [minutes, setMinutes] = useState<number>(getMinutes(value));

  // Update local state when prop value changes
  useEffect(() => {
    setHours(getHours(value));
    setMinutes(getMinutes(value));
  }, [value]);

  const handleInput = () => {
    const hoursValue = Number(hoursInputRef.current?.value || 0);
    const minutesValue = Number(minutesInputRef.current?.value || 0);
    const totalValue = (hoursValue * 60 || 0) + (minutesValue || 0);

    onChange(totalValue);
  };

  return (
    <div className="flex items-center" style={{ maxWidth: "280px" }}>
      <label className="block text-left">
        <div className="px-2 text-1">Hours:</div>
        <input
          ref={hoursInputRef}
          value={hours}
          type="number"
          pattern="-?\d+"
          name="hours"
          className="input text-lg font-mono"
          placeholder="00"
          onChange={handleInput}
        />
      </label>
      <label className="block text-left">
        <div className="px-2 text-1">Minutes:</div>
        <input
          ref={minutesInputRef}
          value={minutes}
          type="number"
          pattern="-?\d+"
          name="minutes"
          className="input text-lg font-mono"
          placeholder="00"
          onChange={handleInput}
        />
      </label>
    </div>
  );
};

export default TimeInput;
