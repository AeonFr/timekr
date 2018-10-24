<template>
  <section>
    <div class="block my-3 p-4 shadow-md bg-1 rounded-lg text-center">
      <div class="m:inline-block mb-4 m:mb-0 px-4 text-3xl text-1 font-mono">
        {{ prettyTime }}
      </div>

      <button
        type="button"
        class="btn btn-primary align-top"
        @click="startTimer">
        <icon name="play"/>
        Start
      </button>

      <button
        type="button"
        class="btn btn-default align-top"
        @click="stopTimer">
        <icon name="pause"/>
        Stop
      </button>

      <button
        type="button"
        class="btn btn-danger align-top"
        @click="resetTimer">
        <icon name="refresh-ccw"/>
        Reset
      </button>

    </div>
    <form
      v-if="partialTimeCommiter != false"
      class="m:flex items-center p-2 bg-1 shadow-md my-2 rounded-lg show-ltr"
      @submit.prevent="commitPartialTime">
      <div class="font-bold text-left m-2">
        Commit {{ partialTimeCommiter }} minute{{ (partialTimeCommiter > 1) ? 's' : '' }}
        and reset?
      </div>
      <button
        type="submit"
        class="ml-auto btn btn-primary">
        Commit
      </button>
      <button
        type="button"
        class="btn btn-default ml-1"
        @click="partialTimeCommiter = false">
        Cancel
      </button>
    </form>
  </section>
  
</template>
<script>

import Icon from "~/components/Icon.vue";

export default {
  name: 'PomodoroTimer',
  components: {
    Icon
  },
  data() {
    return {
      time: 1500,
      timerStopped: false,
      partialTimeCommiter: false,
    }
  },
  computed: {
    prettyTime() {
      return this.twoDigits(Math.floor(this.time/60)) + ':' + this.twoDigits(this.time % 60);
    }
  },
  created(){
    if (localStorage.getItem('currentTimer'))
      {
        this.time = localStorage.getItem('currentTimer');
        localStorage.removeItem('currentTimer');
      }
  },
  destroyed(){
    if (this.time > 0 && this.time < 1500){
      localStorage.setItem('currentTimer', this.time);
      this.timerStopped = 1;
    }
  },
  methods: {
    twoDigits(num){
      return ("0" + num).slice(-2)
    },
    startTimer() {
      if (this.timerStopped = false) return;
      if (this.time == 0) this.time = 1500;
      this.timerStopped = false;
      window.setTimeout(this.tick,1000);
      this.partialTimeCommiter = false;
    },
    stopTimer(){
      if (this.timerStopped) return;
      this.timerStopped = true;
      if (this.time <= 1500)
        this.partialTimeCommiter = Math.max(1, Math.round((1500 - this.time) / 60));
    },
    resetTimer(){
      this.timerStopped = true;
      this.time = 1500;
      this.partialTimeCommiter = false;
    },
    tick() {
      if (this.time > 0 && !this.timerStopped) {
        this.time--;
        window.setTimeout(this.tick,1000);
        window.document.title = '(' + this.prettyTime + ') Timekr';
      } else if (this.time == 0) {
        this.commitOnePomodoro();
        window.document.title = 'Timekr';
        this.timerStopped = true;
      }
    },
    beep(){
      var context = new AudioContext();
      var o = context.createOscillator();
      o.type = "square";
      o.frequency.value = 830.6;
      var  g = context.createGain();
      o.connect(g);
      g.connect(context.destination);
      o.start(0);
      window.setTimeout(function(){
        g.gain.exponentialRampToValueAtTime(
          0.00001, context.currentTime + 0.04
        );
      }, 500);
    },
    commitOnePomodoro(){
      this.$emit('commitTime', { amount: 25 });
      // Audio Effect
      this.beep();
      var vm = this;
      var interval = 800;
      window.setTimeout(function(){
        vm.beep();
        window.setTimeout(function(){
          vm.beep();
          window.setTimeout(vm.beep, interval);
        }, interval);
      }, interval);
    },
    commitPartialTime(){
      this.$emit('commitTime', { amount: this.partialTimeCommiter });
      this.resetTimer();
      this.partialTimeCommiter = false;
    }
  },
  
}
</script>