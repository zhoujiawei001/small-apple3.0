<template>
  <div class="appBanner">
    <img :src='require(`../assets/devIcon2/${tid}.png`)' alt="light.png">
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: "appBanner",
    computed: {
      ...mapState(['tid'])
    }
  }
</script>

<style scoped lang="stylus">
  @import "../style/mixin.styl"
  .appBanner
    setWH(100%, 25.2rem)
    setPosUseFlex()
    imgUrl("../assets/background.png")
    img
      setWH(18rem, 18rem)
      transform translateY(1.8rem)
</style>
