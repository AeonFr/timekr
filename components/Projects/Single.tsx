import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import PomodoroTimer from '../PomodoroTimer';
import Icon from '../Icon';
import CommitHistoryGraph from './CommitHistoryGraph';
import TimeInput from '../TimeInput';

interface Commit {
  commited_at: number;
  amount: number | string;
}

interface Project {
  name: string;
  time: number;
  commits: Commit[];
  created_at: number;
  time_budget?: number | string;
}

interface RootState {
  projects: {
    [key: string]: Project;
  };
}

const Single: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [invalidProjectName, setInvalidProjectName] = useState(0);
  const [showInsertTimeForm, setShowInsertTimeForm] = useState(0);
  const [insertedTime, setInsertedTime] = useState<number | string>(0);
  const [showEditProjectSettings, setShowEditProjectSettings] = useState(0);
  const [projectTimeBudget, setProjectTimeBudget] = useState<number | string>('');
  
  const project = useSelector((state: RootState) => 
    state.projects[slug || ''] || -1
  );

  useEffect(() => {
    if (project !== -1 && project.time_budget) {
      setProjectTimeBudget(project.time_budget);
    }
  }, [project]);

  // Helper functions
  const twoDigits = (num: number): string => {
    if ((num + "").length <= 2)
      return ("0" + num).slice(-2);
    else 
      return (num + "");
  };

  const prettyTime = (amount: number): string => {
    return twoDigits(Math.floor(amount/60)) + ':' + twoDigits(amount % 60);
  };

  // Computed properties as memoized values
  const prettyTotal = useMemo(() => {
    if (project === -1) return '00:00';
    return prettyTime(project.time);
  }, [project]);

  const timeBudget = useMemo(() => {
    if (project === -1 || !project.time_budget) return 0;
    return Math.round(project.time * 100 / Number(project.time_budget));
  }, [project]);

  // Event handlers
  const editProjectName = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName) {
      return setInvalidProjectName(1);
    }
    
    dispatch({
      type: 'updateProject',
      payload: { id: slug, name: newProjectName }
    });
    
    setNewProjectName('');
    setEditingProjectName(false);
  };

  const commitTime = ({ amount }: { amount: number | string }) => {
    if (slug) {
      dispatch({
        type: 'commitTime',
        payload: { project_id: slug, amount }
      });
    }
  };

  const commitTimeManually = (e: React.FormEvent) => {
    e.preventDefault();
    commitTime({ amount: insertedTime });
    setInsertedTime('');
    setShowInsertTimeForm(0);
  };

  const editProjectSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch({
      type: 'editProjectSettings',
      payload: {
        project_id: slug,
        timeBudget: projectTimeBudget,
      }
    });

    setShowEditProjectSettings(0);
  };

  const deleteProject = () => {
    if (!window.confirm(`Are you sure you want to delete ${slug}?`)) {
      return false;
    }
    
    dispatch({
      type: 'deleteProject',
      payload: { name: slug }
    });
    
    navigate('/');
  };

  if (project === -1) {
    return <main className="text-center">This project doesn't exist or was deleted.</main>;
  }

  return (
    <main className="text-center">
      {!editingProjectName ? (
        <h1 className="flex items-start mb-3 font-light text-xl m:text-xxl text-left">
          <span className="leading-tight">{project.name || slug}</span>
          <span
            className="ml-auto btn btn-default text-xs"
            onClick={() => setEditingProjectName(true)}
          >
            Rename
          </span>
        </h1>
      ) : (
        <form
          className="pb-3 m:flex items-center"
          onSubmit={editProjectName}
        >
          <input
            value={newProjectName}
            className={`input mr-3 ${invalidProjectName ? 'input-error' : ''}`}
            type="text"
            autoFocus
            placeholder="New Name"
            aria-label="Project Name"
            onChange={(e) => {
              setNewProjectName(e.target.value);
              setInvalidProjectName(0);
            }}
          />
          <button
            className="flex-no-shrink btn btn-primary"
            type="submit"
          >
            Update
          </button>
          <button
            className="flex-no-shrink btn btn-default ml-1"
            type="button"
            onClick={() => setEditingProjectName(false)}
          >
            Cancel
          </button>
        </form>
      )}
      
      <PomodoroTimer onCommitTime={commitTime} />

      <section
        id="stats"
        className="my-4 m:flex justify-center text-lg text-center"
      >
        <div className="leading-normal px-4">
          <div className="text-1 text-2xl">{prettyTotal}</div>
          <div className="text-sm">Time commited</div>
        </div>
        {project.time_budget && (
          <div className="leading-normal px-4">
            <div className="text-1 text-2xl">{timeBudget}%</div>
            <div className="text-sm">
              Of the time budget
            </div>
          </div>
        )}
      </section>

      <CommitHistoryGraph
        commits={project.commits}
        startOfProject={project.created_at}
      />

      <hr className="mt-6" />

      {project.commits.length > 0 && (
        <Link
          to={`/project/${slug}/commits`}
          className="block btn btn-primary no-underline mt-2"
        >
          Commit History
          <Icon name="chevron-right" />
        </Link>
      )}

      <button
        className={`block mt-2 btn btn-default ${showInsertTimeForm ? 'shadow-md' : ''}`}
        onClick={() => setShowInsertTimeForm(1)}
      >
        <Icon name="plus-circle" />        
        Insert time manually
      </button>
      
      {showInsertTimeForm ? (
        <form
          className="m:flex items-end p-2 bg-1 shadow-md my-2 rounded-lg"
          onSubmit={commitTimeManually}
        >
          <TimeInput 
            value={insertedTime} 
            onChange={(value) => setInsertedTime(value)} 
          />
          <button
            type="submit"
            className="mt-2 btn btn-primary"
          >
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

      <button
        className={`block mt-2 btn btn-default ${showEditProjectSettings ? 'shadow-md' : ''}`}
        onClick={() => setShowEditProjectSettings(1)}
      >
        <Icon name="clock" /> 
        Define time budget
      </button>
      
      {showEditProjectSettings ? (
        <form
          className="m:flex items-end p-2 bg-1 shadow-md my-2 rounded-lg"
          onSubmit={editProjectSettings}
        >
          <TimeInput 
            value={projectTimeBudget} 
            onChange={(value) => setProjectTimeBudget(value)} 
          />
          <button
            type="submit"
            className="mt-2 btn btn-primary"
          >
            Save
          </button>
          <button
            type="button"
            className="mt-2 btn btn-default ml-1"
            onClick={() => setShowEditProjectSettings(0)}
          >
            Cancel
          </button>
        </form>
      ) : null}

      <button
        className="block mt-2 btn btn-danger"
        onClick={deleteProject}
      >
        <Icon name="trash" /> 
        Delete project
      </button>
    </main>
  );
};

export default Single;
