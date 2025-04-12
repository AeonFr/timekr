import { create } from "zustand";
import { sortBy } from "lodash";
import Cookie from "js-cookie";

// Define interfaces for our state
interface Commit {
  commited_at: number;
  amount: number | string;
}

interface Project {
  name: string;
  time: number;
  commits: Commit[];
  created_at: number;
  updated_at: number;
  time_budget?: number | string;
  deadline?: number;
}

interface StoreState {
  projects: Record<string, Project>;
  addProject: (name: string) => void;
  updateProject: (id: string, name: string) => void;
  deleteProject: (name: string) => void;
  commitTime: (project_id: string, amount: number | string) => void;
  editProjectSettings: (
    project_id: string,
    timeBudget?: number | string,
    deadline?: number,
  ) => void;
  importProjects: (projects: Record<string, Project>) => void;
  editCommit: (
    project_slug: string,
    commitData: Commit & { new_commited_at?: number },
  ) => void;
}

// Helper functions for state persistence
const saveState = (projects: Record<string, Project>): void => {
  const stringifiedState = JSON.stringify(projects);
  localStorage.setItem("projects", stringifiedState);
  Cookie.set("projects", stringifiedState, { expires: 365 });
};

const retrieveState = (): Record<string, Project> => {
  const localStorageProjects = localStorage.getItem("projects");
  const cookieProjects = Cookie.get("projects");

  if (localStorageProjects || cookieProjects) {
    try {
      const parsedProjects = JSON.parse(
        localStorageProjects || cookieProjects || "{}",
      );
      if (parsedProjects) return parsedProjects;
    } catch (error) {
      console.error("JSON parsing failed", error);
    }
  }
  return {};
};

// Create the store
const useStore = create<StoreState>((set, get) => ({
  projects: retrieveState(),

  addProject: (name) => {
    const { projects } = get();

    if (projects[name]) {
      alert(
        "There's already a project with this name. Try another name, or edit the existing project instead.",
      );
      return;
    }

    const newProjects = {
      ...projects,
      [name]: {
        name,
        time: 0,
        commits: [],
        created_at: +new Date(),
        updated_at: +new Date(),
      },
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
        updated_at: +new Date(),
      },
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

  commitTime: (project_id, amount, date?: Date) => {
    const { projects } = get();

    if (!projects[project_id]) return;

    const project = projects[project_id];
    const newCommit = {
      amount,
      commited_at: date ? +date : +new Date(),
    };

    const updatedCommits = sortBy(
      [...project.commits, newCommit],
      ["commited_at"],
    ).reverse();

    const updatedProject = {
      ...project,
      commits: updatedCommits,
      time: parseInt(project.time.toString()) + parseInt(amount.toString()),
      updated_at: +new Date(),
    };

    const updatedProjects = {
      ...projects,
      [project_id]: updatedProject,
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
      [project_id]: updatedProject,
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
      console.warn(`Project ${project_slug} not found`);
      return;
    }

    const project = projects[project_slug];
    const commits = [...project.commits];

    const commitIndex = commits.findIndex(
      (c) => c.commited_at === commitData.commited_at,
    );

    if (commitIndex === -1) {
      console.warn("Commit not found on project");
      return;
    }

    commits[commitIndex] = {
      ...commits[commitIndex],
      amount: Number(commitData.amount),
      commited_at: commitData.new_commited_at
        ? Number(commitData.new_commited_at)
        : commits[commitIndex].new_commited_at,
    };

    // Recalculate total time
    const totalTime = commits.reduce(
      (sum, commit) => sum + Number(commit.amount),
      0,
    );

    const updatedProject = {
      ...project,
      commits,
      time: totalTime,
      updated_at: +new Date(),
    };

    const updatedProjects = {
      ...projects,
      [project_slug]: updatedProject,
    };

    saveState(updatedProjects);
    set({ projects: updatedProjects });
  },
}));

export default useStore;
