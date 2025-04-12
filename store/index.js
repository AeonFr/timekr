import { create } from 'zustand';
import { sortBy } from 'lodash';
import Cookie from 'js-cookie';

// Helper functions for state persistence
const saveState = (projects) => {
  const stringifiedState = JSON.stringify(projects);
  localStorage.setItem('projects', stringifiedState);
  Cookie.set('projects', stringifiedState, { expires: 365 });
};

const retrieveState = () => {
  const localStorageProjects = localStorage.getItem('projects');
  const cookieProjects = Cookie.get('projects');
  
  if (localStorageProjects || cookieProjects) {
    try {
      const parsedProjects = JSON.parse(localStorageProjects || cookieProjects);
      if (parsedProjects) return parsedProjects;
    } catch (e) {
      console.log('JSON parsing failed');
    }
  }
  return {};
};

// Define the store
const useStore = create((set, get) => ({
  projects: retrieveState(),
  
  addProject: (name) => {
    const { projects } = get();
    
    if (projects[name]) {
      alert('There\'s already a project with this name. Try another name, or edit the existing project instead.');
      return;
    }
    
    const newProjects = {
      ...projects,
      [name]: {
        name,
        time: 0,
        commits: [],
        created_at: +new Date(),
        updated_at: +new Date()
      }
    };
    
    saveState(newProjects);
    set({ projects: newProjects });
  },
  
  updateProject: (id, name) => {
    const { projects } = get();
    
    if (!projects[id]) return;
    
    const updatedProjects = {
      ...projects,
      [id]: {
        ...projects[id],
        name,
        updated_at: +new Date()
      }
    };
    
    saveState(updatedProjects);
    set({ projects: updatedProjects });
  },
  
  deleteProject: (name) => {
    const { projects } = get();
    const newProjects = { ...projects };
    delete newProjects[name];
    
    saveState(newProjects);
    set({ projects: newProjects });
  },
  
  commitTime: (project_id, amount) => {
    const { projects } = get();
    
    if (!projects[project_id]) return;
    
    const project = projects[project_id];
    const newCommit = {
      amount,
      commited_at: +new Date()
    };
    
    const updatedCommits = sortBy([...project.commits, newCommit], ['commited_at']).reverse();
    
    const updatedProject = {
      ...project,
      commits: updatedCommits,
      time: parseInt(project.time) + parseInt(amount),
      updated_at: +new Date()
    };
    
    const updatedProjects = {
      ...projects,
      [project_id]: updatedProject
    };
    
    saveState(updatedProjects);
    set({ projects: updatedProjects });
  },
  
  editProjectSettings: (project_id, timeBudget, deadline) => {
    const { projects } = get();
    
    if (!projects[project_id]) return;
    
    const updatedProject = { ...projects[project_id], updated_at: +new Date() };
    
    if (timeBudget !== undefined) {
      updatedProject.time_budget = timeBudget;
    }
    
    if (deadline !== undefined) {
      updatedProject.deadline = deadline;
    }
    
    const updatedProjects = {
      ...projects,
      [project_id]: updatedProject
    };
    
    saveState(updatedProjects);
    set({ projects: updatedProjects });
  },
  
  importProjects: (newProjects) => {
    saveState(newProjects);
    set({ projects: newProjects });
  },
  
  editCommit: (project_slug, commitData) => {
    const { projects } = get();
    
    if (!projects[project_slug]) {
      console.warn('Project ' + project_slug + ' not found');
      return;
    }
    
    const project = projects[project_slug];
    const commits = [...project.commits];
    
    const commitIndex = commits.findIndex(c => c.commited_at === commitData.commited_at);
    
    if (commitIndex === -1) {
      console.warn('Commit not found on project');
      return;
    }
    
    commits[commitIndex] = {
      ...commits[commitIndex],
      amount: Number(commitData.amount)
    };
    
    // Recalculate total time
    const totalTime = commits.reduce((sum, commit) => sum + Number(commit.amount), 0);
    
    const updatedProject = {
      ...project,
      commits,
      time: totalTime,
      updated_at: +new Date()
    };
    
    const updatedProjects = {
      ...projects,
      [project_slug]: updatedProject
    };
    
    saveState(updatedProjects);
    set({ projects: updatedProjects });
  }
}));

export default useStore;
