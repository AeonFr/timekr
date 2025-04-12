import React, { useState } from "react";
import Icon from "../Icon";
import TimeInput from "../TimeInput";

interface ManualTimeFormProps {
  onCommitTime: (data: { amount: number | string; date?: Date }) => void;
}

const ManualTimeForm: React.FC<ManualTimeFormProps> = ({ onCommitTime }) => {
  const [showInsertTimeForm, setShowInsertTimeForm] = useState(0);
  const [insertedTime, setInsertedTime] = useState<number | string>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split(".")[0]
  );

  const handleCommitTimeManually = (e: React.FormEvent) => {
    e.preventDefault();
    onCommitTime({ 
      amount: insertedTime,
      date: selectedDate ? new Date(selectedDate) : undefined
    });
    setInsertedTime("");
    setShowInsertTimeForm(0);
  };

  return (
    <>
      <button
        className={`block mt-2 btn btn-default ${
          showInsertTimeForm ? "shadow-md" : ""
        }`}
        onClick={() => setShowInsertTimeForm(1)}
      >
        <Icon name="plus-circle" />
        {" Insert time manually"}
      </button>

      {showInsertTimeForm ? (
        <form
          className="p-2 bg-1 shadow-md my-2 rounded-lg"
          onSubmit={handleCommitTimeManually}
        >
          <div className="mb-2">
            <label className="block text-sm mb-1">Time amount:</label>
            <TimeInput
              value={insertedTime}
              onChange={(value) => setInsertedTime(value)}
            />
          </div>
          
          <div className="mb-2">
            <label className="block text-sm mb-1">Date and Time:</label>
            <input
              type="datetime-local"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div className="flex">
            <button type="submit" className="mt-2 btn btn-primary">
              Insert
            </button>
            <button
              type="button"
              className="mt-2 btn btn-default ml-1"
              onClick={() => setShowInsertTimeForm(0)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </>
  );
};

export default ManualTimeForm;
