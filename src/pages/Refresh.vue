<template>
  <div/>
</template>

<script>
export default {
  name: 'Refresh',
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$router.replace(from.path)
    })
  }
}
</script>
