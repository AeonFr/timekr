<template>
  <div>
    <project-commits-list/>
  </div>
</template>
<script>
import ProjectCommitsList from '~/components/Projects/Commits.vue'

export default {
  name: 'ProjectCommits',
  components: { ProjectCommitsList }
}
</script>