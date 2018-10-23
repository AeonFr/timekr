<template>
  <div>

    <section class="text-lg">

      <nuxt-link
        :to="'/project/' + $route.params.slug"
        class="text-1 no-underline hover:underline">
        {{ project.name || $route.params.slug }}
      </nuxt-link>
      > Commit History

    </section>

    <section class="text-left mt-4">
      <h2 class="leading-loose mb-0">Commit History</h2>
      <div class="list-reset">
        <div
          v-if="project.commits.length == 0"
          class="text-sm leading-normal">
          There are no commits yet. Run the pomodoro timer*
          or commit time manually to start tracking time spent in this project.
          <br>
          *Time tracked with the pomodoro timer will
          appear here once the timer gets to 0.
        </div>
        <div
          v-for="(commits, date) in commitsByDate"
          :key="date">
          <h3 class="leading-loose font-normal mt-4">
            {{ date }}
            <b class="float-right text-1 opacity-75 text-lg font-light">
              +{{ totalTimeForDate(date) }}
            </b>
          </h3>
          <li
            v-for="(commit, i) in commits"
            :key="i"
            class="group p-2 bg-1">
            <div
              class="m:flex"
              @click="editCommit = Object.assign({}, commit)">
              <div>
                <span class="text-1">
                  {{ prettyTime(commit.amount) }}
                </span>
                commited at
                <span class="text-1">{{ prettyDate(commit.commited_at, 'minutes') }}</span>
              </div>
              <div
                :class="{ 'font-bold': (editCommit.commited_at == commit.commited_at) }"
                class="ml-auto group-hover:opacity-75 opacity-25 cursor-default text-right"
                tabindex="0">
                <icon name="edit-3"/>
                Edit
              </div>
            </div>
            <form
              v-if="(editCommit.commited_at == commit.commited_at)"
              class="m:flex items-end mt-4 pb-2 border-b"
              @submit.prevent="submitEditedCommit">
              <time-input :value.sync="editCommit.amount"/>
              <button
                type="submit"
                class="btn btn-primary">
                Edit
              </button>
              <button
                type="button"
                class="btn btn-default"
                @click="editCommit = false">
                Cancel
              </button>
            </form>
          </li>
        </div>
      </div>
    </section>

  </div>
</template>
<script>

import { groupBy, sumBy } from 'lodash';
import moment from 'moment';

import TimeInput from '~/components/TimeInput.vue';
import Icon from '~/components/Icon.vue';

export default {
  name: 'ProjectCommitsList',
  components: {
    TimeInput,
    Icon
  },
  data(){
    return {
      editCommit: false,
    }
  },
  computed:{
    project(){
      if (!this.$store.state.projects[this.$route.params.slug])
        return -1;
      return this.$store.state.projects[this.$route.params.slug];
    },
    commitsByDate(){
      var commits = this.project.commits;
      return groupBy(commits, function (result) {
        return moment(result['commited_at']).startOf('day').format('LL');
      });
    }
  },
  methods: {
    prettyDate(time, format){
      return moment(time).format( format == 'minutes' ? 'LTS' : 'LL');
    },
    twoDigits(num){
      return (num < 0 ? '-' : '') + ("0" + Math.abs(num)).slice(-2)
    },
    prettyTime(amount){
      if (amount > 60 || amount < -60) {
        return this.twoDigits((amount > 0) ? Math.floor(amount/60) : Math.ceil(amount/60))
          + ':' + this.twoDigits(Math.abs(amount) % 60)
          + ' hour' + ((amount > 60 || amount < -60) ? 's' : '');
      } else {
        return amount + ' minutes';
      }
    },
    totalTimeForDate(date){
      return this.prettyTime(sumBy(this.commitsByDate[date], function(n){ return parseInt(n.amount) }));
    },
    submitEditedCommit(){
      this.$store.commit('editCommit',
      {
        project_slug: this.$route.params.slug,
        commitData: this.editCommit
      });
      this.editCommit = false;
    }
  }
}
</script>