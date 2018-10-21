<template>
  <svg
    :class="name"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather"
    v-html="icons[name].contents"/>
</template>
<script>

import { icons } from 'feather-icons';

export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      default: 'x'
    }
  },
  data() {
    return {
      icons,
    }
  }
}
</script>

<style>
.feather{
  vertical-align: bottom;
}
</style>