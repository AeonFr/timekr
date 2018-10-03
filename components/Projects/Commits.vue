<template>
  <div>

    <section>

      <nuxt-link
        :to="'/project/' + $route.params.slug"
        class="text-1 no-underline hover:underline">
        {{ project.name }}
      </nuxt-link>
      > Commit History

    </section>

    <section class="text-left mt-4">
      <h2 class="leading-loose">Commit History</h2>
      <div class="list-reset">
        <div
          v-if="project.commits.length == 0"
          class="text-sm leading-normal">
          There are no commits yet. Start the pomodoro timer
          or commit time manually to start tracking time spent in this project.
          <br>
          Time tracked with the pomodoro timer will
          appear here once the timer gets to 0.
        </div>
        <div
          v-for="(commit, i) in project.commits"
          :key="i">
          <h3
            v-if="!project.commits[i-1]
              || prettyDate(project.commits[i-1].commited_at, 'day')
            != prettyDate(commit.commited_at, 'day')"
            class="leading-loose font-light">
            {{ prettyDate(commit.commited_at, 'day') }}
          </h3>
          <li class="p-2 bg-1">
            <span class="text-1">{{ commit.amount }}</span>
            minutes commited at
            <span class="text-1">{{ prettyDate(commit.commited_at, 'minutes') }}</span>
          </li>
        </div>
      </div>
    </section>

  </div>
</template>
<script>

var moment = require('moment');

export default {
  name: 'ProjectCommitsList',
  computed:{
    project(){
      if (!this.$store.state.projects[this.$route.params.slug])
        return -1;
      return this.$store.state.projects[this.$route.params.slug];
    },
  },
  methods: {
    prettyDate(time, format){
      return moment(time).format( format == 'minutes' ? 'LTS' : 'LL');
    },
  }
}
</script>