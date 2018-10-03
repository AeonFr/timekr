<template>
  <div>
    
    <h1 class="text-xl tracking-wide uppercase font-light leading-loose">
      Projects
    </h1>

    <ul class="list-reset">
      <li
        v-for="(project, slug) in projects"
        :key="slug">
        <nuxt-link
          :to="'/project/' + slug"
          :class="{ 'border-l-2 border-blue': (slug == $route.params.slug) }"
          class="no-underline block text-1 p-2 bg-1 hover:bg-2">
          {{ project.name }}
        </nuxt-link>
      </li>
    </ul>

    <form
      class="w-full max-w-sm"
      @submit.prevent="addProject">
      <div class="flex items-center py-2">
        <input
          v-model="newProjectName"
          :class="{ 'input-error': invalidProjectName }"
          class="input mr-2"
          type="text"
          placeholder="New project's name"
          aria-label="Project Name"
          @input="invalidProjectName = 0">
        <button
          class="flex-no-shrink btn btn-primary"
          type="submit">
          Add
        </button>
      </div>
    </form>
  </div>
</template>
<script>

export default {
  name: 'Projects',
  data(){
    return {
      newProjectName: '',
      invalidProjectName: 0,
    }
  },
  computed: {
    projects(){
      return this.$store.state.projects;
    }
  },
  methods: {
    addProject(){
      if (!this.newProjectName)
        return this.invalidProjectName = 1;
      
      this.$store.commit('addProject', { name: this.newProjectName });
      this.newProjectName = '';
    }
  }
}
</script>
