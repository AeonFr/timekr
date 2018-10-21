<template>
  <svg
    width="100%"
    viewBox="0 0 400 80"
    class="text-1 o-5">
    <g
      v-for="i in 40"
      :key="i"
      :transform=" 'translate(' + ((i-1)*10) + ', 0)' ">
      <rect
        v-for="d in 7"
        :key="'d-'+d"
        :transform=" 'translate(0, ' + ((d-1)*10) + ')' "
        :fill="(commitsByWeekAndDay[i] && commitsByWeekAndDay[i][d])
        ? 'hsla(207, 71%, 53%, ' + Math.min((commitsByWeekAndDay[i][d]/4.80)+15, 100) + '%)' : '#eee'"
        stroke="white"
        stroke-width="1"
        width="10"
        height="10"/>
    </g>
    <g style="font-size: 10px">
      <text
        x="0"
        y="9">Monday</text>
      <text
        x="0"
        y="29">Wednesday</text>
      <text
        x="0"
        y="49">Friday</text>
      <text
        x="0"
        y="69">Sunday</text>
    </g>
  </svg>
</template>
<script>

import { groupBy, forEach } from 'lodash';
var moment = require('moment');

export default {
  name: 'CommitGraph',
  props: {
    commits: {
      type: Array,
      default: function(){}
    }
  },
  data(){
    return {
      commitsByWeekAndDay: {},
      monthStarts: {},
    }
  },
  mounted(){
    this.commitsByWeekAndDay = this.getCommitsByWeekAndDay();
    this.monthStarts = this.getMonthStarts()
  },
  methods: {
    getCommitsByWeekAndDay(){
      let commits = this.commits;
      let fourtyWeeksAgo = moment().subtract(40, 'weeks')
        .startOf('week').startOf('day');

      let result = {};
      forEach(commits, function({amount, commited_at}){
        let commitedAt = moment(commited_at).startOf('day');

        let dayOfWeek = commitedAt.isoWeekday();

        let weekNumber = Math.floor(
          moment.duration(commitedAt.diff(fourtyWeeksAgo))
          .asWeeks()
          );
        

        if (!result[weekNumber])
          result[weekNumber] = {};
        if (!result[weekNumber][dayOfWeek])
          result[weekNumber][dayOfWeek] = Number(amount);
        else
          result[weekNumber][dayOfWeek] += Number(amount);

      });
      return result;
    },
    getMonthStarts(){
      let fourtyWeeksAgo = moment().subtract(40, 'weeks')
        .startOf('week').startOf('day');
      let month = fourtyWeeksAgo.startOf('month');
      let monthDiff = 40;
      let result = {};
      do{
        month = month.add(32, 'days').startOf('Month');
        monthDiff = moment.duration(month.diff(fourtyWeeksAgo)).asWeeks();
        result[monthDiff] = month.format('MMM');
      }while(monthDiff <= 0);
      return result;
    }
  }
}
</script>