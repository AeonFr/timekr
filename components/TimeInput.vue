<template>
  <div class="flex items-center">
    <label class="block text-left">
      <div class="px-2 text-1">Hours:</div>
      <input
        ref="hoursInput"
        :value="hours"
        type="number"
        pattern="-?\d+"
        name="hours"
        class="input text-lg font-mono"
        placeholder="00"
        @input="onInput">
    </label>
    <label class="block text-left">
      <div class="px-2 text-1">Minutes:</div>
      <input
        ref="minutesInput"
        :value="minutes"
        type="number"
        pattern="-?\d+"
        name="minutes"
        class="input text-lg font-mono"
        placeholder="00"
        @input="onInput">
    </label>
  </div>
</template>
<script>
export default {
  name: 'TimeInput',
  props: {
    value: {
      type: [String, Number],
      default: 0
    }
  },
  computed: {
    hours(){
      if (this.value >= 0)
        return Math.floor(Number(this.value)/60);
      else
        return Math.ceil(Number(this.value)/60);
    },
    minutes(){
      return (Number(this.value) % 60);
    }
  },
  methods: {
    onInput($event){
      let value = (Number(this.$refs.hoursInput.value) * 60  || -0) + (Number(this.$refs.minutesInput.value) || -0);
      this.$emit('update:value', value);
    }
  }
}
</script>