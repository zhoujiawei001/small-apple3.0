<template>
  <div class="dev-tp">
    <appHeader2
      style="background-color: #f2f2f2"
      :title="$t('type.select_dev')"
      @back-icon="$router.go(-1)"></appHeader2>
    <main
      :style="styObj"
      class="wrapper">
      <div class="content" v-show="typeData.length > 0">
        <ul class="content_ul ul01">
          <li>红外遥控设备</li>
          <li
            v-for="(item, i) in typeListIR"
            :key="i"
            :class="{removeRgBd: (i + 1)%3 === 0}"
            @click="handleItem(item)">
            <img :src="require(`../assets/devIcon2/${item.tid}.png`)" alt="">
            <p>{{$t(`pub.${typeName[item.tid]}`)}}</p>
            <span>IR</span>
          </li>
        </ul>
        <ul class="content_ul ul02">
          <li>RF(433/315)射频遥控设备</li>
          <li
            v-for="(item, i) in typeListRF"
            :key="i"
            :class="{removeRgBd: (i + 1)%3 === 0}"
            @click="handleItem(item)">
            <img :src="require(`../assets/devIcon2/${item.tid}.png`)" alt="">
            <p>{{$t(`pub.${typeName[item.tid]}`)}}</p>
            <span>RF</span>
          </li>
        </ul>
      </div>
    </main>
    <transition name="fade">
      <appTipsBox :hintText="$t(`type.${hintText}`)" v-if="tipsBox" @handle-sure="tipsBox = false"></appTipsBox>
    </transition>
  </div>
</template>

<script>
import appHeader2 from '@/components/appHeader2'
import appTipsBox from '@/components/appTipsBox'
import { mapState, mapGetters } from 'vuex'
import BScroll from 'better-scroll'
export default {
  name: 'type',
  components: {
    appHeader2,
    appTipsBox
  },
  data () {
    return {
      tipsBox: false,
      hintText: 'ac_tips'
    }
  },
  computed: {
    ...mapState(['statusBarHg', 'addedDevList', 'typeData', 'typeName']),
    ...mapGetters(['screenRem', 'typeListIR', 'typeListRF']),
    styObj () {
      return {
        position: 'absolute',
        top: 4.8 * this.screenRem + this.statusBarHg + 'px',
        left: 0,
        width: '100%',
        height: `calc(100% - ${4.8 * this.screenRem + this.statusBarHg + 'px'})`
      }
    },
    airIndexArr () {
      return this.addedDevList.filter(item => item.index > 28)
    },
    otherDevNum () {
      return this.addedDevList.length
    },
    // typeName () {
    //   return val => {
    //     let obj = {
    //       1: 'set_box',
    //       2: 'tv',
    //       3: 'dvd',
    //       5: 'projector',
    //       6: 'fan',
    //       7: 'ac',
    //       8: 'light',
    //       10: 'tv_box',
    //       12: 'sweeper',
    //       13: 'sound',
    //       14: 'camera',
    //       15: 'air_cleaner',
    //       21: 'switch',
    //       22: 'socket',
    //       23: 'curtain',
    //       24: 'clothes_hanger',
    //       40: 'calorifier'
    //     }
    //     return obj[val]
    //   }
    // }
  },
  created () {
    this.$store.dispatch('getDevTypeList')
  },
  mounted () {
    this.$nextTick(() => {
      this.scrollFun()
    })
  },
  methods: {
    scrollFun () {
      // const wrapper = document.querySelector('.wrapper')
      const scroll = new BScroll('.wrapper', {
        probeType: 3,
        click: true,
        bounce: {
          top: true,
          bottom: true
        }
      })
      scroll.on('scroll', pos => {})
    },
    handleItem (item) {
      if (this.otherDevNum >= 15) {
        this.hintText = 'dev_tips'
        this.tipsBox = true
      } else if (item.tid === 7 && this.airIndexArr.length >= 2) {
        this.hintText = 'ac_tips'
        this.tipsBox = true
      } else if (item.tid === 1) {
        this.$store.commit('setTid', item.tid)
        this.$router.push('/operator')
      } else {
        this.$store.commit('setTid', item.tid)
        this.$store.commit('setIsRForIR', +item.rf)
        console.log('item.rf',item.rf)
        this.$router.push('/brands')
      }
    }
  }
}
</script>

<style scoped lang="stylus">
  @import "../style/mixin.styl"
  .dev-tp
    setWH()
    position relative
    .wrapper
      background-color $bgColorTheme
      .content
        .content_ul
          display flex
          flex-wrap wrap
          background-color $bgColorTheme
          box-sizing border-box
          border-top 1px solid $borderColor2
          li
            position relative
            width calc(100% / 3)
            height calc(100vw / 3)
            border-right 1px solid $borderColor2
            border-bottom 1px solid $borderColor2
            box-sizing border-box
            display flex
            align-items: center
            justify-content center
            flex-direction column
            font-size 1.2rem
            img
              width 6.4rem
            p
              margin-top 1rem
            span
              position absolute
              top .5rem
              right .5rem
              width 2.4rem
              height 1.2rem
              font-size 1rem
              color $fontColorHalfTrans
              background-color: #fff;
              text-align center
              border-radius .2rem;
          li:first-child
            width 100%
            background-color: #fff;
            height 3.6rem;
            font-size 1.4rem;
          li:last-child
            border-bottom none;
          .removeRgBd
            border-right none
        .ul02
          li:last-child
            border-bottom 1px solid $borderColor2
          li
            span
              color #fff;
              background-color: $fontColorTheme;
</style>
