import Vuex from 'vuex';
import { sortBy } from 'lodash';

const createStore = () => {
  return new Vuex.Store({
    state: {
      projects: JSON.parse(localStorage.getItem('projects') || '{}'),
    },
    mutations: {
      addProject (state, { name }) {
        if (state.projects.name)
            return alert('Theres already a project with this name.',
            'Try another name, or edit the existing project instead.');

        state.projects[name] = {
            name: name,
            time: 0,
            commits: [],
            created_at: + new Date(),
            updated_at: + new Date()
        };
        
        // commit
        localStorage.setItem('projects', JSON.stringify(state.projects));
      },
      updateProject (state, {id, name}){
        state.projects[id].name = name;
        state.projects[id].updated_at = + new Date();

        // commit
        localStorage.setItem('projects', JSON.stringify(state.projects));
      },
      deleteProject (state, { name }) {
        delete state.projects[name];
        state.projects = Object.assign({}, state.projects);
        
        // commit
        localStorage.setItem('projects', JSON.stringify(state.projects));
      },
      commitTime(state, { project_id, amount }) {
        
        state.projects[project_id].commits.push({
          amount,
          commited_at: + new Date()
        });

        state.projects[project_id].commits = sortBy(state.projects[project_id].commits, ['commited_at']).reverse();

        let assign = {};
        assign[project_id] = Object.assign(state.projects[project_id], {
          time: state.projects[project_id].time + amount,
          updated_at: + new Date()
        });

        state.projects = Object.assign({}, state.projects, assign);

        // commit
        localStorage.setItem('projects', JSON.stringify(state.projects));
      },
      editProjectSettings(state, { project_id, timeBudget, deadline }) {
        if (timeBudget) {
          let assign = {};
          assign[project_id] = Object.assign(state.projects[project_id], {
            time_budget: timeBudget,
            updated_at: + new Date()
          });
          state.projects = Object.assign({}, state.projects, assign);
        }

        if (deadline) {
          let assign = {};
          assign[project_id] = Object.assign(state.projects[project_id], {
            deadline,
            updated_at: + new Date()
          });
          state.projects = Object.assign({}, state.projects, assign);
        }

        // commit
        localStorage.setItem('projects', JSON.stringify(state.projects));
      }
    }
  })
}

export default createStore