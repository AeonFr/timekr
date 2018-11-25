<template>
  <div class="py-2 px-4 bg-1 rounded-lg text-grey-darker">
    <icon name="server"/>
    <template v-if="userIsLoggedIn">
      Cloud sync is enabled.
    </template>
    <template v-else>
      Log in to Cloud Sync
    </template>
  </div>
</template>
<script>
import Icon from '~/components/Icon.vue';
export default {
  components: {
    Icon
  },
  data (){
    return {
      userIsLoggedIn: false,
    }
  },
  mounted (){
    let vm = this;
    firebase.auth().onAuthStateChanged(function(user) {
      vm.userIsLoggedIn = user;
    });
  }
}
</script>