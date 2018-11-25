<template>
  <div>


    <form
      class="max-w-xs"
      aria-labelledby="title1">
      <h1 id="title1">Create an account</h1>
      
      <div class="field">
        <label for="email">
          <span class="field-label">Email address</span>
        </label>
        <input
          id="email"
          type="email"
          class="input"
          name="email">
      </div>

      <div class="field">
        <label for="password">
          <span class="field-label">Choose Password</span>
          <span class="field-hint">Must contain 8+ characters.</span>
        </label>
        <div class="flex">
          <input
            id="password"
            :type=" !showPassword ? 'password' : 'text' "
            class="input"
            name="password"
            autocomplete="off">
          <button
            type="button"
            class="btn btn-default"
            @click="showPassword = !showPassword">
            {{ !showPassword ? 'Show' : 'Hide' }}
          </button>
        </div>
      </div>

      <div class="field">
        label
      </div>

    </form>
    
  </div>
</template>
<script>
export default {
  data(){
    return {
      showPassword: false,
    }
  },
}
</script>
<style>

  label, .field-label{
    @apply block;
  }
  .field{
    @apply mt-4;  
  }
  .field-label{
    @apply font-bold;
  }
  .field .input{
    @apply mt-2;
  }

  /* Hide password reveal in IE */
  input[type="password"]::-ms-reveal{
    display: none;
  }

</style>
