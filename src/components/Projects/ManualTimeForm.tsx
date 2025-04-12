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
    new Date().toISOString().split(".")[0],
  );

  const handleCommitTimeManually = (e: React.FormEvent) => {
    e.preventDefault();
    onCommitTime({
      amount: insertedTime,
      date: selectedDate ? new Date(selectedDate) : undefined,
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
          className="text-left p-2 bg-1 shadow-md my-2 rounded-lg"
          onSubmit={handleCommitTimeManually}
        >
          <div className="mb-3">
            <TimeInput
              value={insertedTime}
              onChange={(value) => setInsertedTime(value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-left">
              <div className="px-2 text-1">Date and Time:</div>
              <input
                type="datetime-local"
                className="input text-lg font-mono"
                value={selectedDate}
                style={{ maxWidth: "280px" }}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
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
