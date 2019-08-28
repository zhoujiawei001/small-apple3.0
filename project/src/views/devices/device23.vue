<template>
  <!-- 窗帘 -->
  <div class="dev-curtain">
    <appHeader
      :title="title"
      :curPageType="rc.pageType"
      @back-icon="onClickBack"
      @set="moreSet"></appHeader>
    <appBanner></appBanner>
    <div class="container" :style="styObjCont2">
      <div class="normal_fn">
        <div class="power-box1">
          <span
            class="switch-on btn"
            @click="sendBody('1')"
            @touchstart="longClickStart('1')"
            @touchend="longClickEnd('1')"
            :class="{ 'learnActive': isLearn && curLearnKey === '1'}"></span>
          <span
            class="switch-off btn"
            @click="sendBody('2')"
            @touchstart="longClickStart('2')"
            @touchend="longClickEnd('2')"
            :class="{ 'learnActive': isLearn && curLearnKey === '2'}"></span>
        </div>
        <div class="power-box2">
          <span
            class="power"
            @click="sendBody('3')"
            @touchstart="longClickStart('3')"
            @touchend="longClickEnd('3')"
            :class="{ 'learnActive': isLearn && curLearnKey === '3'}"></span>
        </div>
      </div>
      <!-- 扩展键 -->
      <div class="expends">
        <ul>
          <li v-for="(item, index) in expandKeys" :key="index">
            <span
              class="item btn"
              @click="sendBody(4 + index + '')"
              @touchstart="longClickStart(4 + index + '')"
              @touchend="longClickEnd(4 + index + '')"
              :class="{ 'learnActive': isLearn && curLearnKey === 4 + index + ''}"><i>{{item}}</i></span>
          </li>
        </ul>
      </div>
    </div>
    <!-- learn底层提示 -->
    <appLearnTips
      v-if="rc.pageType === 'learnPage'"
      :learnBoxText="learnBoxText"
      :stage="learnStage"
      :btnText="isLearn? $t('component.end') : $t('component.finish')"
      @handle-end="handleEnd"></appLearnTips>
    <appEditName
      v-if="isShowEditName"
      @handleCancel="isShowEditName = false"
      @handleConfirm="isShowEditName = false"></appEditName>
  </div>
</template>

<script>
import appHeader from '@/components/appHeader'
import appBanner from '@/components/appBanner'
import appLearnTips from '@/components/appLearnTips'
import appEditName from '@/components/appEditName'
import { mapState, mapActions } from 'vuex'
import { numArr, sendBodyToDev } from '../../utils/pub'
export default {
  name: "device23",
  components: {
    appHeader,
    appBanner,
    appLearnTips,
    appEditName
  },
  data () {
    return {
      rc: JSON.parse(JSON.stringify(this.$route.query.rc)),
      expandKeys: ['自定义1', '自定义2', '自定义3', '自定义4', '自定义5', '自定义6', '自定义7', '自定义8', '自定义9'],
      isLearn: false,
      curLearnKey: '', // 当前学习的按键
      learnBoxText: this.$t('component.learn_txt1'),
      longClickTimer: null, // 长按定时器
      learnTimeoutTimer: null, // 学习超时定时器
      learnTimeoutCount: 0, // 学习时间
      learnStage: 0, // 学习阶段 0-开始学习/学习失败/学习成功， 1-正在学习
      allowIndexArr: [], // 可选index集合
      isShowEditName: false, // 是否显示修改名称弹出框
      learnCode: '' // 射频设备发码
    }
  },
  watch: {
    'controlKey.rfKey': {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal)
        if (this.rc.pageType !== 'learnPage') return
        if (newVal === 2) {
          window.hilink.toast('2', this.$t('component.learn_success'))
          this.learnBoxText = this.$t('component.learn_txt3')
          this.learnStage = 0
          this.isShowEditName = true
        } else if (newVal === 3) {
          this.learnBoxText = this.$t('component.learn_txt4')
          this.learnStage = 0
          window.hilink.toast('2', this.$t('component.learn_failed'))
        }
        this.isLearn = false
        clearInterval(this.learnTimeoutTimer)
        this.learnTimeoutTimer = null
        this.learnTimeoutCount = 0
      },
      deep: true
    },
  },
  computed: {
    ...mapState(['lang', 'typeName', 'tid', 'addedDevList', 'controlKey', 'isRForIR']),
    title () {
      return this.$route.query[this.lang] + ' ' + this.$t(`pub.${this.typeName[this.tid]}`)
    },
    styObjCont2 () {
      return {
        paddingBottom: this.rc.pageType === 'controlPage' ? 0 : '5.8rem'
      }
    }
  },
  created (){
    this.initSomeData()
    this.getBrandRfCode().then(res => {
      console.log(res)
      this.learnCode = res.c1
    })
  },
  methods: {
    ...mapActions(['getBrandRfCode']),
    /** 初始化一些数据 **/
    initSomeData () {
      let arr = this.addedDevList.map(item => item.index)
      if (this.tid !== 7) {
        this.allowIndexArr = this._.difference(numArr(28), arr)
      } else {
        this.allowIndexArr = this._.difference([29, 30], arr)
      }
    },
    onClickBack () {
      this.$router.go(-1)
    },
    moreSet () {
    },
    sendBody (val) {
      let body = {
        batch: {
          controlKey: {
            controlKey: val
          },
          deviceList: {
            list: [{
              index: this.allowIndexArr[0]
            }]
          }
        }
      }
      sendBodyToDev(body)
    },
    longClickStart (val) {
      console.log('touchstart', val)
      if (this.rc.pageType === 'learnPage') {
        if (this.isLearn) return
        this.longClickTimer = setTimeout(() => {
          this.learnBoxText = this.$t('component.learn_txt2')
          this.learnStage = 1
          let body = {
            batch: {
              controlKey: {
                controlKey: val,
                rfkey: 1,
                // code: this.learnCode,
              },
              deviceList: {
                list: [{
                  index: this.allowIndexArr[0]
                }]
              }
            }
          }
          sendBodyToDev(body)
          this.curLearnKey = val
          this.isLearn = true
          this.handleLearnTimeout(val)
        }, 1000)
      }
    },
    handleLearnTimeout(val) {
      this.learnTimeoutTimer = setInterval(() => {
        this.learnTimeoutCount += 1
        if (this.learnTimeoutCount >= 10) {
          clearInterval(this.learnTimeoutTimer)
          this.learnTimeoutTimer = null
          this.isLearn = false
          this.learnTimeoutCount = 0
          let body = {
            batch: {
              controlKey: {
                controlKey: val,
                rfKey: 0
              },
              deviceList: {
                list: [{
                  index: this.allowIndexArr[0]
                }]
              }
            }
          }
          sendBodyToDev(body)
          this.learnBoxText = this.$t('component.learn_txt4')
          this.learnStage = 0
          window.hilink.toast('2', this.$t('component.learn_failed'))
        }
      }, 1000)
    },
    longClickEnd (val) {
      console.log('touchend', val)
      if (this.rc.pageType === 'learnPage') {
        if (this.isLearn) return
        clearTimeout(this.longClickTimer)
        this.longClickTimer = null
      }
    },
    handleEnd () {
      console.log('handleEnd', this.curLearnKey,)
      if (this.isLearn) {
        clearInterval(this.learnTimeoutTimer)
        this.learnTimeoutTimer = null
        this.isLearn = false
        this.learnTimeoutCount = 0
        let body = {
          batch: {
            controlKey: {
              controlKey: this.curLearnKey,
              rfKey: 0
            },
            deviceList: {
              list: [{
                index: this.allowIndexArr[0]
              }]
            }
          }
        }
        sendBodyToDev(body)
        this.learnBoxText = this.$t('component.learn_txt1')
        this.learnStage = 0
        window.hilink.toast('2', this.$t('component.learn_end'))
      } else {
        console.log('这里是要注册的')
      }
    }
  }
}
</script>

<style scoped lang="stylus">
  @import "../../style/mixin.styl"
  .dev-curtain
    setWH()
    background #F2F2F2
    -webkit-overflow-scrolling: touch
    overflow-scrolling: touch
    .container
      position absolute
      top: 25.2rem
      height calc(100% - 25.2rem)
      width 100%
      padding-top 2.4rem
      overflow scroll
      .normal_fn
        width 100%
        .power-box1
          padding 0 6rem
          display: flex
          justify-content space-between
          .switch-on, .switch-off
            display inline-block
          .switch-on
            setIcon('../../assets/black/cur-open.png', '../../assets/white/fan-switch.png', 8rem, 4rem)
          .switch-off
            setIcon('../../assets/black/cur-close.png', '../../assets/white/fan-switch.png', 8rem, 4rem)
        .power-box2
          display flex
          justify-content center
          margin-top 2rem
          border-radius 50%
          .power
            display inline-block
            setIcon('../../assets/black/cur-pause.png', '../../assets/white/fan-switch.png', 8rem, 4rem)
            transform rotate(90deg)
      .expends
        padding: 2.4rem 4.2rem 0 4.2rem
        ul
          display flex
          flex-wrap wrap
          li
            width calc(100% / 3)
            margin-bottom 2rem
            setPosUseFlexInit(row, center, center, wrap)
            span.item
              setFont(1.5rem, $fontColorTheme2, center)
              setWH(7.6rem, 4.4rem)
              border-radius 4.4rem
              setPosUseFlexInit(row, center, center, wrap)
              i
                display inline-block
                width 6.4rem
                height 3.6rem
                line-height 3.6rem
                setEllipsisOne()
                font-style:normal
</style>
