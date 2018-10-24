<template>
  <div>
    <template v-if="!allCommits">
      <h1 class="leading-loose">Welcome to Timekr</h1>
      <p>This App can keep a score of the total time you spent in a project.</p>
      <p>
        Acording to the Pomodoro technique, 25 minutes is the optimal time concentration and
        focus can be kept.
      </p>
      <p>
        The Pomodoro timer incorporated in the Project Details View
        will count backwards from 25 minutes to zero, and beep multiple times afterwards.
        Your 25 minutes will be added automatically to your current project.
      </p>
      <p>
        <b>To start, add a new Project or select an existing one.</b>
      </p>
    </template>
    <template v-else>
      <h1 class="leading-loose">Welcome back</h1>
      <div>
        <commit-history-graph :commits="allCommits"/>
      </div>
    </template>
  </div>
</template>

<script>

import { flatMap } from 'lodash';

import CommitHistoryGraph from '~/components/Projects/CommitHistoryGraph.vue';

export default {
  components: {
    CommitHistoryGraph
  },
  computed: {
    projects(){
      return this.$store.state.projects
    },
    allCommits(){
      if (!Object.keys(this.projects).length)
        return false;
      return flatMap(this.projects, function(n){
        return n.commits;
      })
    }
  }
}
</script>

