<template>
  <section class="container font-sans">
    <div class="m:flex mb-4">
      <projects class="w-full m:w-1/3 px-2"/>
      <nuxt class="w-full m:w-2/3 px-4 mt-4"/>
    </div>
  </section>
</template>

<script>
import Projects from '~/components/Projects/List.vue'

export default {
  components: {
    Projects,
  }
}
</script>

<style>
html{
  color: #a0a0a0;
  background-color: #222222;
}

:focus:not(:focus-visible) { outline: none }

.container {
  @apply my-6 mx-auto;
}
</style>

