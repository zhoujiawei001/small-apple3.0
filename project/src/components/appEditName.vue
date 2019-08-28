<template>
  <div class="appEditName">
    <div class="container">
      <div class="title">{{$t('setting.control_name')}}</div>
      <div class="input-box scale-1px">
        <input
          ref="input"
          type="text"
          :placeholder="$t('setting.form_placeholder')"
          v-model="inputValue"
          @input="handleInput">
      </div>
      <div class="btn-groups__ios">
        <span class="left" @click="cancelModify">{{$t('pub.cancel')}}</span>
        <span class="middle"></span>
        <span class="right" @click="confirmModify">{{$t('pub.sure')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "appEditName",
  data () {
    return {
      inputValue: ''
    }
  },
  mounted () {
    setTimeout(() => {
      this.$refs.input.focus()
    }, 500)
  },
  methods: {
    handleInput () {
      console.log(this.inputValue)
    },
    cancelModify () {
      console.log('取消')
      this.$emit('handleCancel')
    },
    confirmModify () {
      console.log('确定')
      this.$emit('handleConfirm')
    }
  }
}
</script>

<style scoped lang="stylus">
  @import "../style/mixin.styl"
  .appEditName
    position absolute
    background rgba(0, 0, 0, .3)
    z-index: 99;
    setWH()
    top 0
    .container
      position absolute
      background #fff
      border-radius 1.4rem
      animation fadeIn .3s linear
      setWH(68vw, auto)
      top 50%
      left 50%
      transform translate(-50%, -50%)
      padding 1rem 0 0 0

      .title
        setFont(1.6rem, black, center)

      .input-box
        padding 1.2rem 2rem
        position relative
        input
          position relative
          setWH(100%, 2.4rem)
          background-color #fff
          border-radius initial
          border: 1px solid rgba(0,0,0,.2);
          setFont(1.33rem, black, left, 500)
          caret-color rgb(0, 91, 186)
          -webkit-appearance: none;
          appearance: none;

          &:focus
            outline-color transparent
          &::-webkit-input-placeholder
            color: rgba(0,0,0,.2)
        .warn
          margin-top .2rem
          setFont(1.2rem, rgb(255,51,32), left)
      .btn-groups__ios
        display: flex
        justify-content space-between
        align-items center
        span.left,
        span.right
          width 50%
          height 4rem
          line-height 4rem
          setFont(1.5rem, rgb(0, 91, 186), center)
        span.middle
          width 1px!important
          height 4rem
          background-color: #ddd;
          transform scaleX(.5)

</style>
