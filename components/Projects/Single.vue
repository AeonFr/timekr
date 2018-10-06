<template>
  <main class="text-center">
    <div v-if="project == -1">
      This project doesn't exist or was deleted.
    </div>
    <div v-else>
      <h1
        v-if="!editingProjectName"
        class="pb-3 font-light border-b border-transparent hover:border-blue"
        @click="editingProjectName = true">
        {{ project.name || $route.params.slug }}
      </h1>
      <form
        v-else
        class="pb-3 flex items-center border-b border-b-2"
        @submit.prevent="editProjectName">
        <input
          v-model="newProjectName"
          :class="{ 'input-error': invalidProjectName }"
          class="input mr-3"
          type="text"
          placeholder="New Name"
          aria-label="Project Name">
        <button
          class="flex-no-shrink btn btn-primary"
          type="submit">
          Update
        </button>
        <button
          class="flex-no-shrink btn btn-default"
          type="button"
          @click="editingProjectName = false">
          Cancel
        </button>
      </form>
      
      <pomodoro-timer @commitTime="commitTime"/>

      <button
        class="block w-full btn btn-primary"
        @click="showInsertTimeForm = 1">
        Insert time manually
      </button>

      <form
        v-if="showInsertTimeForm"
        class="flex p-2 bg-1 shadow-md my-2 rounded-lg"
        @submit.prevent="commitTimeManually">
        <input
          v-model="insertedTime"
          type="number"
          class="input mr-3"
          placeholder="Minutes"
          aria-label="Minutes">
        <button
          type="submit"
          class="btn btn-primary">Insert</button>
        <button
          type="button"
          class="btn btn-danger"
          @click="showInsertTimeForm = 0">Cancel</button>
      </form>


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
        <div
          v-if="project.deadline"
          class="leading-normal px-4">
          <div class="text-1 text-2xl">{{ prettyDate(project.deadline, 'day') }}</div>
          <div class="text-sm">
            Next deadline {{ nextDeadline }}
          </div>
        </div>
      </section>

      <div class="mv-4 text-left">
        
        <nuxt-link
          :to="'/project/' + $route.params.slug + '/commits'"
          class="btn btn-default mt-4 no-underline inline-block">
          Commit History
        </nuxt-link>
        <br>
        <button
          class="btn btn-primary mt-4"
          @click="showEditProjectSettings = 1">
          Edit Project Settings
        </button>
        <button
          class="btn btn-default mt-4"
          @click="deleteProject">
          Delete project
        </button>
      </div>

      <form
        v-if="showEditProjectSettings"
        class="my-2 p-2 bg-1 shadow-md rounded-lg text-left"
        @submit.prevent="editProjectSettings">
        <div class="mt-2">
          <label
            for="time-budget"
            class="block">Time Budget (in minutes)</label>
          <input
            id="time-budget"
            v-model="projectTimeBudget"
            type="number"
            class="input mt-2"
            placeholder="Time Budget (in minutes)">
        </div>
        <div class="mt-2">
          <label
            for="deadline"
            class="block">Next deadline</label>
          <input 
            id="deadline"
            v-model="projectDeadline"
            type="date"
            class="input mt-2">
        </div>
        <div class="mt-2 text-center">
          <button
            type="submit"
            class="btn btn-primary">
            Save
          </button>
          <button
            type="button"
            class="btn btn-default"
            @click="showEditProjectSettings = 0">
            Cancel
          </button>
        </div>
      </form>

    </div>
  </main>
</template>
<script>

import PomodoroTimer from '~/components/PomodoroTimer.vue';

var moment = require('moment');

export default {
  name: 'ProjectDetails',
  components: {
    PomodoroTimer
  },
  data(){
    return {
      editingProjectName: false,
      newProjectName: '',
      invalidProjectName: 0,
      showInsertTimeForm: 0,
      insertedTime: '',
      showEditProjectSettings: 0,
      projectTimeBudget: '',
      projectDeadline: '',
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
    nextDeadline(){
      return moment(this.project.deadline).fromNow();
    }
  },
  mounted(){
    this.projectTimeBudget = this.project.time_budget || '';
    this.projectDeadline   = !this.project.deadline ? '' : moment(this.project.deadline).format('YYYY-MM-DD')
  },
  methods: {
    twoDigits(num){
      return ("0" + num).slice(-2)
    },
    prettyTime(amount){
      return this.twoDigits(Math.floor(amount/60)) + ':' + this.twoDigits(amount % 60);
    },
    prettyDate(time, format){
      return moment(time).format( format == 'minutes' ? 'LTS' : 'L');
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

      var deadline = + new Date(this.projectDeadline + 'T12:00:00');

      this.$store.commit('editProjectSettings', {
        project_id: this.$route.params.slug,
        timeBudget: this.projectTimeBudget,
        deadline
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
