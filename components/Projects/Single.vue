<template>
  <main class="text-center">
    <template v-if="project == -1">
      This project doesn't exist or was deleted.
    </template>
    <template v-else>
      <h1
        v-if="!editingProjectName"
        class="flex items-start mb-3 font-light text-xl m:text-xxl text-left">
        <span class="leading-tight">{{ project.name || $route.params.slug }}</span>
        <span
          class="ml-auto btn btn-default text-xs"
          @click="editingProjectName = true">
          Rename
        </span>
      </h1>
      <form
        v-else
        class="pb-3 m:flex items-center"
        @submit.prevent="editProjectName">
        <input
          v-model="newProjectName"
          :class="{ 'input-error': invalidProjectName }"
          class="input mr-3"
          type="text"
          autofocus="on"
          placeholder="New Name"
          aria-label="Project Name">
        <button
          class="flex-no-shrink btn btn-primary"
          type="submit">
          Update
        </button>
        <button
          class="flex-no-shrink btn btn-default ml-1"
          type="button"
          @click="editingProjectName = false">
          Cancel
        </button>
      </form>

      
      <pomodoro-timer @commitTime="commitTime"/>

      <section
        id="stats"
        class="my-4 m:flex justify-center text-lg text-center">
        <div class="leading-normal px-4">
          <div class="text-1 text-2xl">{{ prettyTotal }}</div>
          <div class="text-sm">Time commited</div>
        </div>
        <div
          v-if="project.time_budget"
          class="leading-normal px-4">
          <div class="text-1 text-2xl">{{ timeBudget }}%</div>
          <div class="text-sm">
            Of the time budget
          </div>
        </div>
      </section>

      <commit-history-graph
        :commits="project.commits"
        :start-of-project="project.created_at"/>

      <hr class="mt-6">

      <nuxt-link
        v-if="project.commits.length"
        :to="'/project/' + $route.params.slug + '/commits'"
        class="block btn btn-primary no-underline mt-2">
        Commit History
        <icon name="chevron-right"/>
      </nuxt-link>


      <button
        :class="{ 'shadow-md': showInsertTimeForm }"
        class="block mt-2 btn btn-default"
        @click="showInsertTimeForm = 1">
        <icon name="plus-circle"/>        
        Insert time manually
      </button>
      <form
        v-if="showInsertTimeForm"
        class="m:flex items-end p-2 bg-1 shadow-md my-2 rounded-lg"
        @submit.prevent="commitTimeManually">
        <time-input :value.sync="insertedTime"/>
        <button
          type="submit"
          class="mt-2 btn btn-primary">Insert</button>
        <button
          type="button"
          class="mt-2 btn btn-default ml-1"
          @click="showInsertTimeForm = 0">Cancel</button>
      </form>

      <button
        :class="{ 'shadow-md': showEditProjectSettings }"
        class="block mt-2 btn btn-default"
        @click="showEditProjectSettings = 1">
        <icon name="clock"/> 
        Define time budget
      </button>
      <form
        v-if="showEditProjectSettings"
        class="m:flex items-end p-2 bg-1 shadow-md my-2 rounded-lg"
        @submit.prevent="editProjectSettings">
        <time-input :value.sync="projectTimeBudget"/>
        <button
          type="submit"
          class="mt-2 btn btn-primary">
          Save
        </button>
        <button
          type="button"
          class="mt-2 btn btn-default ml-1"
          @click="showEditProjectSettings = 0">
          Cancel
        </button>
      </form>

      <button
        class="block mt-2 btn btn-danger"
        @click="deleteProject">
        <icon name="trash"/> 
        Delete project
      </button>

      

    </template>
  </main>
</template>
<script>

import PomodoroTimer from '~/components/PomodoroTimer.vue';
import Icon from '~/components/Icon.vue';
import CommitHistoryGraph from '~/components/Projects/CommitHistoryGraph.vue';
import TimeInput from '~/components/TimeInput.vue';

var moment = require('moment');

export default {
  name: 'ProjectDetails',
  components: {
    PomodoroTimer,
    Icon,
    CommitHistoryGraph,
    TimeInput
  },
  data(){
    return {
      editingProjectName: false,
      newProjectName: '',
      invalidProjectName: 0,
      showInsertTimeForm: 0,
      insertedTime: 0,
      showEditProjectSettings: 0,
      projectTimeBudget: '',
    }
  },
  computed: {
    project(){
      if (!this.$store.state.projects[this.$route.params.slug])
        return -1;
      return this.$store.state.projects[this.$route.params.slug];
    },
    prettyTotal(){
      return this.prettyTime(this.project.time);
    },
    timeBudget(){
      return Math.round(this.project.time * 100 / this.project.time_budget);
    },
  },
  mounted(){
    this.projectTimeBudget = this.project.time_budget || '';
  },
  methods: {
    twoDigits(num){
      return ("0" + num).slice(-2)
    },
    prettyTime(amount){
      return this.twoDigits(Math.floor(amount/60)) + ':' + this.twoDigits(amount % 60);
    },
    editProjectName(){
      if (!this.newProjectName)
        return this.invalidProjectName = 1;
      this.$store.commit('updateProject', { id: this.$route.params.slug, name: this.newProjectName })
      this.newProjectName = '';  
      this.editingProjectName = false;
    },
    commitTime({ amount }){
      this.$store.commit('commitTime', { project_id: this.$route.params.slug, amount });
    },
    commitTimeManually(){
      this.commitTime({ amount: this.insertedTime });
      this.insertedTime = '';
      this.showInsertTimeForm = 0;
    },
    editProjectSettings(){
      
      this.$store.commit('editProjectSettings', {
        project_id: this.$route.params.slug,
        timeBudget: this.projectTimeBudget,
      });

      this.showEditProjectSettings = 0;

    },
    deleteProject(){
      if (!confirm('Are you sure you want to delete ' + this.$route.params.slug + '?'))
        return false;
      
      this.$store.commit('deleteProject', { name: this.$route.params.slug });
      this.$router.push('/');
    },
  }
}

</script>
