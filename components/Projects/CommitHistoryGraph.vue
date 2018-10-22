<template v-once>
  <svg
    viewBox="0 0 335 90"
    class="text-1">
    <g
      v-for="w in 6"
      :key=" 'w-' + w "
      :transform=" 'translate(' + (((w-1)*50) + 35) +', 0)' ">

      <rect
        v-for="d in 7"
        :key=" 'w-' + w + 'd-' + d "
        :transform=" 'translate(0, ' + ((d-1)*10) + ')' "
        :fill="getFill(w, d)"
        width="49"
        height="9"/>
    
    </g>

    <g style="font-size: 8px;fill: currentColor">
      <text
        x="5"
        y="9">Mon.</text>
      <text
        x="5"
        y="29">Wed.</text>
      <text
        x="5"
        y="49">Fri.</text>
      <text
        x="5"
        y="69">Sun.</text>
      
      <g
        v-for="(l, i) in pastWeeksLabels"
        :key="l.month + l.start">
        <text
          :x="35 + (i * 50)"
          y="79">{{ l.month }}</text>
        <text
          :x="35 + (i * 50)"
          y="89">{{ l.start }}-{{ (l.end > l.start) ? l.end : '...' }}</text>
      </g>
    </g>
  </svg>
</template>
<script>

import moment from 'moment';
import { mapValues, groupBy, sumBy } from 'lodash';

export default {
  name: 'CommitHistoryGraph',
  props: {
    commits: {
      type: Array,
      default: function(){}
    },
    'start-of-project': {
      type: Number,
      default: function(){}
    }
  },
  data(){
    return {
      currentWeekday: moment().isoWeekday()
    }
  },
  computed: {
    commitsGrouped(){
      let vm = this;
      return mapValues(groupBy(this.commits, function(c){
        let indStr = vm.indStr(c.commited_at);
        return indStr[0] + '-' + indStr[1];
      }), function(gr){
        return sumBy(gr, function(c){ return Number(c.amount) });
      });
    },
    startOfProjectIndStr(){
      if (!this.startOfProject) return false;
      else return this.indStr(this.startOfProject);
    },
    pastWeeksLabels(){
      let result = [];
      for(let i = 1; i <= 6; i ++){
        let startOfWeek = moment().subtract(i, 'weeks').startOf('week');
        let index = {
          month: startOfWeek.format('MMM'),
          start:   startOfWeek.format('DD')
        };
        let endOfWeek = startOfWeek.endOf('week');
        index.end = endOfWeek.format('DD');
        result.push(index);
      }
      return result;
    }
  },
  methods: {
    getFill(weekDiff, weekday){
      if (weekDiff == 1 && weekday > this.currentWeekday)
        return 'rgba(127,127,127,0)';

      if (this.startOfProjectIndStr
        && this.startOfProjectIndStr[0] < weekDiff
        || this.startOfProjectIndStr[0] == weekDiff && this.startOfProjectIndStr[1] > weekday)
        return 'rgba(127,127,127,0.1)';
      
      let c = this.commitsGrouped[ weekDiff + '-' + weekday ];
      if (c)
        return 'hsla(207, 70%, 50%, ' + Math.min(Math.max(100 / 480 * c, 40), 100) + '%)';
      else return 'rgba(127,127,127,0.2)';
    },
    /**
     * Algorithm that compares a date under an existing one
     * and returns an array: [ $weekDiff, $weekday ]
     * $weekDiff: Week difference
     * (between current week's monday and the monday of the week of the commit)
     * $weekday: iso day of the week of the commit
     */
    indStr(timestamp){
      let commitedAt = moment(timestamp),
          startOfWeek = moment().startOf('week'),
          weekday = commitedAt.isoWeekday(),
          weekDiff = (moment.duration(commitedAt.startOf('week').diff(startOfWeek)).asWeeks()) - 1;
        return [ Math.abs(weekDiff), weekday ];
    }
  }
}
</script>