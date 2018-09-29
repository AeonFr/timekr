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

  .btn {
    @apply border tracking-wide uppercase py-2 px-4 rounded-full;
  }
  .btn-primary {
    @apply text-blue;
  }
  .btn-primary:hover {
    @apply bg-blue-darkest;
  }
  .btn-danger{
    @apply text-red border-transparent;
  }
  .btn-danger:hover{
    @apply bg-red-darkest;
  }
  .btn-default{
    @apply text-grey-darker border-transparent;
  }
  .btn-default:hover{
    @apply bg-grey-darkest;
  }
  .btn-tab{
    /*border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;*/
    border-bottom-color: transparent!important;
  }
  .input{
    @apply text-grey appearance-none bg-transparent w-full py-1 px-2 leading-tight;
  }
  .input:focus{
    @apply outline-none;
  }
</style>

