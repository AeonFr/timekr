import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import useStore from "../../store";
import { useTimerStore } from "../../store/timerStore";
import Icon from "../Icon";

const List: React.FC = () => {
  const [newProjectName, setNewProjectName] = useState("");
  const [invalidProjectName, setInvalidProjectName] = useState(0);
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const projects = useStore((state) => state.projects);
  const addProject = useStore((state) => state.addProject);
  const { getTimerState } = useTimerStore();

  // Helper function to format time with leading zeros
  const twoDigits = (num: number): string => {
    return ("0" + num).slice(-2);
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName) {
      return setInvalidProjectName(1);
    }

    addProject(newProjectName);
    setNewProjectName("");
    navigate(`/project/${encodeURIComponent(newProjectName)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProjectName(e.target.value);
    setInvalidProjectName(0);
  };

  return (
    <div>
      <h1 className="text-xl tracking-wide uppercase font-light leading-loose">
        Projects
      </h1>

      <ul className="list-reset">
        {Object.entries(projects).map(([projectSlug, project]) => (
          <li key={projectSlug}>
            <Link
              to={`/project/${projectSlug}`}
              className={`no-underline block text-1 p-2 bg-1 hover:bg-2 ${
                projectSlug === slug ? "border-l-2 border-blue" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{project.name}</span>
                {(() => {
                  if (projectSlug === slug) return null;
                  const { time, timerStopped } = getTimerState(projectSlug);
                  if (!timerStopped && time > 0) {
                    return (
                      <span className="font-mono text-sm">
                        {twoDigits(Math.floor(time / 60))}:
                        {twoDigits(time % 60)}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <form className="w-full max-w-sm" onSubmit={handleSubmitProject}>
        <div className="flex items-center py-2">
          <input
            value={newProjectName}
            className={`input mr-2 ${invalidProjectName ? "input-error" : ""}`}
            type="text"
            placeholder="New project's name"
            aria-label="Project Name"
            onChange={handleInputChange}
          />
          <button className="flex-no-shrink btn btn-primary" type="submit">
            <Icon name="plus" />
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default List;
