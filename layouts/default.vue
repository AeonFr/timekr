<template>
  <section
    class="container font-sans">
    <div class="m:flex flex-row-reverse mb-4">
      <nuxt class="childs-animated w-full m:w-2/3 px-4 mt-4"/>
      <aside class="w-full m:w-1/3 px-4 mt-8 m:mt-2">

        <nuxt-link
          to="/"
          class="flex items-center no-underline text-1 mb-3">
          <img
            src="~/assets/logo.png"
            class="w-8 mr-4"
            alt="Logo">
          <h1 class="text-xl tracking-wide uppercase leading-loose">
            Timekr
          </h1>
        </nuxt-link>

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
              @change="setDarkInterface()">
            <icon name="sun"/>              
            Light
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
              @change="setDarkInterface()">
            <icon name="moon"/>
            Dark
          </label>
        </div>
        <h1 class="mt-4 text-xl tracking-wide uppercase font-light leading-loose">
          My Data
        </h1>
        <button
          class="btn btn-default"
          @click="exportData">
          <icon name="download-cloud"/>
          Export
        </button>
        <button
          class="btn btn-default"
          @click="showImportForm = true">
          <icon name="upload-cloud"/>
          Import
        </button>

        <form
          v-if="showImportForm"
          class="mt-2 show-ltr"
          @submit.prevent="importData">
          <input
            ref="fileInput"
            type="file"
            class="py2 btn btn-primary max-w-full overflow-hidden">
          <button
            type="submit"
            class="btn btn-primary"
            accept=".json">
            import
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="showImportForm = false">
            cancel
          </button>
        </form>

      </aside>
    </div>
    <div
      v-if="!cookieConsentAccepted"
      class="border p-4 my-4 rounded-lg leading-normal show-ltr">
      This site uses both Cookies and <code>localStorage</code> to store your user data
      (it should be safe unless you decide to clear your cache).
      Any data you provide is saved on your current browser and device <em>only</em>.
      The server doesn't store any data whatsoever,
      so you're adviced to keep regular backups using the Export function.
      <button
        class="btn btn-primary mt-2"
        @click="acceptCookieConsent">
        I understand
      </button>
    </div>
  </section>
</template>

<script>

import saveAs from 'file-saver';

import Projects from '~/components/Projects/List.vue';
import Icon from '~/components/Icon.vue';

export default {
  components: {
    Projects,
    Icon
  },
  data() {
    return {
      darkInterface: '0',
      showImportForm: false,
      cookieConsentAccepted: (localStorage.getItem('cookie_consent') || false),
    }
  },
  methods: {
    setDarkInterface() {
      if (this.darkInterface == '1') {
        document.body.classList.add('dark-interface')
      } else {
        document.body.classList.remove('dark-interface')
      }
    },
    acceptCookieConsent(){
      this.cookieConsentAccepted = true;
      localStorage.setItem('cookie_consent', 1);
    },
    exportData(){
      let data = this.$store.state.projects;
      let blob = new Blob([ JSON.stringify(data) ], {type: "application/json;charset=utf-8"});
      saveAs(blob, "timekr.json");
    },
    importData(){
      let fileInput = this.$refs.fileInput;
      if (!fileInput) return false;

      let file = fileInput.files[0];
      let fr = new FileReader();

      let vm = this;
      fr.onloadend = function(evt){
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
            alert('Error while reading file');
            return;
        }

        try{
          if (!confirm('All existing data will be replaced. Are you sure you want to continue?')){
            return;
          }
          let projects = JSON.parse(evt.target.result);
          vm.$store.commit('importProjects', projects);
          vm.showImportForm = false;
          return true;
        } catch(e) {
          alert('Error during file evaluation! The file is probably in the incorrect format -JSON.parse failed');
          console.log(e);
          return false;
        }
      };
      fr.readAsText(file);
    }
  }
}
</script>

<style>
  body{
    color: #333;
    transition: background-color .2s;
  }

  body.dark-interface{
    color: #a0a0a0;
    background-color: #222222;
  }

  p{
    margin-bottom: 1em;
  }

  :focus:not(:focus-visible) { outline: none }

  .container {
    @apply my-6 mx-auto;
  }

  .btn {
    @apply border tracking-wide uppercase py-2 px-4 rounded-full cursor-default;
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


  .childs-animated>*>*, .show-ltr{
    --delay-increm: 0.03s;
    transform: translateX(-2rem);
    opacity: 0;
    animation: show-ltr 0.2s cubic-bezier(.55,0,.1,1);
    animation-fill-mode: forwards;
    animation-delay: calc(var(--delay-increm) * 7);
  }
  @keyframes show-ltr{
    to{ opacity: 1; transform: translateX(0) }
  }
  .childs-animated>*>*:nth-child(1){ animation-delay: 0s }
  .childs-animated>*>*:nth-child(2){ animation-delay: var(--delay-increm) }
  .childs-animated>*>*:nth-child(3){ animation-delay: calc(var(--delay-increm) * 2) }
  .childs-animated>*>*:nth-child(4){ animation-delay: calc(var(--delay-increm) * 3) }
  .childs-animated>*>*:nth-child(5){ animation-delay: calc(var(--delay-increm) * 4) }
  .childs-animated>*>*:nth-child(6){ animation-delay: calc(var(--delay-increm) * 5) }
  .childs-animated>*>*:nth-child(7){ animation-delay: calc(var(--delay-increm) * 6) }

</style>

