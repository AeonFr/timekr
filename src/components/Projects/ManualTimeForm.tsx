import React, { useState } from "react";
import Icon from "../Icon";
import TimeInput from "../TimeInput";

interface ManualTimeFormProps {
  onCommitTime: (data: { amount: number | string }) => void;
}

const ManualTimeForm: React.FC<ManualTimeFormProps> = ({ onCommitTime }) => {
  const [showInsertTimeForm, setShowInsertTimeForm] = useState(0);
  const [insertedTime, setInsertedTime] = useState<number | string>(0);

  const handleCommitTimeManually = (e: React.FormEvent) => {
    e.preventDefault();
    onCommitTime({ amount: insertedTime });
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
          className="m:flex items-end p-2 bg-1 shadow-md my-2 rounded-lg"
          onSubmit={handleCommitTimeManually}
        >
          <TimeInput
            value={insertedTime}
            onChange={(value) => setInsertedTime(value)}
          />
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
        </form>
      ) : null}
    </>
  );
};

export default ManualTimeForm;
