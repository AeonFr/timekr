<template>
  <div class="block my-3 p-4 shadow-lg bg-black rounded-lg text-center">
    <div class="m:inline-block mb-4 m:mb-0 px-4 text-3xl text-grey font-mono">
      {{ prettyTime }}
    </div>

    <button
      type="button"
      class="btn btn-primary align-top"
      @click="startTimer">
      Start
    </button>

    <button
      type="button"
      class="btn btn-default align-top"
      @click="stopTimer">
      Stop
    </button>

    <button
      type="button"
      class="btn btn-danger align-top"
      @click="resetTimer">
      Reset
    </button>

  </div>
</template>
<script>
export default {
  name: 'PomodoroTimer',
  data() {
    return {
      time: 1500,
      timerStopped: false,
    }
  },
  computed: {
    prettyTime() {
      return this.twoDigits(Math.floor(this.time/60)) + ':' + this.twoDigits(this.time % 60);
    }
  },
  methods: {
    twoDigits(num){
      return ("0" + num).slice(-2)
    },
    startTimer() {
      if (this.time == 0) this.time = 1500;
      this.timerStopped = false;
      window.setTimeout(this.tick,1000);
    },
    stopTimer(){
      this.timerStopped = true;
    },
    resetTimer(){
      this.timerStopped = true;
      this.time = 1500;
    },
    tick() {
      if (this.time > 0 && !this.timerStopped) {
        this.time--;
        window.setTimeout(this.tick,1000);
      } else if (this.time == 0) {
        this.commitOnePomodoro();
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
    }
  }
}
</script>