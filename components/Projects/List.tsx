import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '../Icon';

interface Project {
  name: string;
}

interface RootState {
  projects: {
    [key: string]: Project;
  };
}

const List: React.FC = () => {
  const [newProjectName, setNewProjectName] = useState('');
  const [invalidProjectName, setInvalidProjectName] = useState(0);
  const { slug } = useParams<{ slug?: string }>();
  const dispatch = useDispatch();
  
  const projects = useSelector((state: RootState) => state.projects);

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName) {
      return setInvalidProjectName(1);
    }
    
    dispatch({
      type: 'addProject',
      payload: { name: newProjectName }
    });
    
    setNewProjectName('');
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
                projectSlug === slug ? 'border-l-2 border-blue' : ''
              }`}
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>

      <form
        className="w-full max-w-sm"
        onSubmit={addProject}
      >
        <div className="flex items-center py-2">
          <input
            value={newProjectName}
            className={`input mr-2 ${invalidProjectName ? 'input-error' : ''}`}
            type="text"
            placeholder="New project's name"
            aria-label="Project Name"
            onChange={handleInputChange}
          />
          <button
            className="flex-no-shrink btn btn-primary"
            type="submit"
          >
            <Icon name="plus"/>
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default List;
