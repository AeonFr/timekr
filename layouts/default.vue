<template>
  <section
    class="container font-sans">
    <div class="m:flex mb-4">
      <aside class="w-full m:w-1/3 px-2">
        <projects/>
        <h1 class="text-xl tracking-wide uppercase font-light leading-loose">
          Interface
        </h1>
        <div>
          <label
            :class="{
              'btn-primary': (darkInterface == '0'),
              'btn-default': (darkInterface !== '0')
            }"
            class="inline-block btn">
            <input
              v-model="darkInterface"
              class="hidden"
              type="radio"
              name="interface"
              value="0"
              @change="setDarkInterface()"> Light
          </label>
          <label
            :class="{
              'btn-primary': (darkInterface == '1'),
              'btn-default': (darkInterface !== '1')
            }"
            class="inline-block btn">
            <input
              v-model="darkInterface"
              class="hidden"
              type="radio"
              name="interface"
              value="1"
              @change="setDarkInterface()"> Dark
          </label>
        </div>
      </aside>
      <nuxt class="w-full m:w-2/3 px-4 mt-4"/>
    </div>
  </section>
</template>

<script>
import Projects from '~/components/Projects/List.vue'

export default {
  components: {
    Projects,
  },
  data() {
    return {
      darkInterface: '1'
    }
  },
  methods: {
    setDarkInterface() {
      if (this.darkInterface == '1') {
        document.body.classList.add('dark-interface')
      } else {
        document.body.classList.remove('dark-interface')
      }
    }
  }
}
</script>

<style>
  body{
    color: #333;
  }

  body.dark-interface{
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
    @apply text-blue border-grey-light;
  }

  .dark-interface .btn-primary{
    @apply border-grey-darkest;
  }

  .btn-primary:hover {
    @apply bg-blue-lightest;
  }
  .dark-interface .btn-primary:hover {
    @apply bg-blue-darkest;
  }

  .btn-danger{
    @apply text-red border-transparent;
  }
  
  .btn-danger:hover{
    @apply bg-red-lightest;
  }

  .dark-interface .btn-danger:hover{
    @apply bg-red-darkest;
  }

  .btn-default{
    @apply text-grey-darker border-transparent;
  }
  
  .btn-default:hover{
    @apply bg-grey-lighter;
  }

  .dark-interface .btn-default:hover{
    @apply bg-grey-darkest;
  }

  .btn-tab{
    border-bottom-color: transparent!important;
  }

  .input{
    @apply text-grey-darkest appearance-none bg-transparent w-full py-1 px-2 leading-tight;
  }

  .dark-interface .input{
    @apply text-grey;
  }

  .input:focus{
    @apply outline-none;
  }

  .input-error{
    @apply bg-red-lightest
  }

  .dark-interface .input-error{
    @apply bg-red-darkest;
  }

  .bg-1{
    @apply bg-grey-lightest;
  }
  
  .hover\:bg-2:hover{
    @apply bg-grey-lighter;
  }

  .dark-interface .bg-1{
    @apply bg-black;
  }

  .dark-interface .hover\:bg-2:hover{
    @apply bg-grey-darkest;
  }

  .text-1{
    @apply text-grey-darker;
  }
  .dark-interface .text-1{
    @apply text-grey;
  }
</style>

