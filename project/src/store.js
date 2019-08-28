import Vue from 'vue'
import Vuex from 'vuex'
import $http from './utils/requset'
import { parseHilinkData, getExtendToServe } from './utils/pub'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    appDevId: '',
    devName: '',
    roomName: '', // 房间名称
    appStatus: 0, // 小苹果状态 0-关，1-开
    statusBarHg: 20, // 手机状态栏高度
    screenWd: 0, // 获取屏幕宽度
    tid: 1, // 设备类型ID
    bid: 0, // 设备品牌ID
    typeData: [], // 设备类型数据
    addedDevList: [], // 已经添加的遥控设备
    brandScrollPos: null, // brand页面滚动的距离
    cmdList: {}, //码库
    loadRes: {
      isFinish: 0 // 码库下载状态 0-未下载 1-已下载
    },
    delay: [
      {
        id: 29,
        enable: 0,
        endTime: 0,
        duration: 0,
        sid: 'airKey',
        para: 'power',
        paraValue: 2 // 1-倒计时开，2-倒计时关
      },
      {
        id: 30,
        enable: 0,
        endTime: 0,
        duration: 0,
        sid: 'airKey',
        para: 'power',
        paraValue: 2 // 1-倒计时开，2-倒计时关
      }
    ],
    controlKey: {
      feedKey: 0,
      rfKey: 0
    }, // 学习返回码 0-学习失败/超时， 1-开始学习，2-学习成功
    secondListTotal: '--', // 二级匹配总数
    secondList: [],// 二级匹配rid集合
    proIndex: 18, // 省的位置
    citiesIndex: 14, // 市的位置
    operatorIndex: 0, // 运营商的位置
    lang: window.navigator.language.split('-')[0] || 'zh',
    isRForIR: 0, // 判断是红外还是射频设备？0-红外，1-射频
    typeName: {
      1: 'set_box',
      2: 'tv',
      3: 'dvd',
      5: 'projector',
      6: 'fan',
      7: 'ac',
      8: 'light',
      10: 'tv_box',
      11: 'satellite',
      12: 'sweeper',
      13: 'sound',
      14: 'camera',
      15: 'air_cleaner',
      21: 'switch',
      22: 'socket',
      23: 'curtain',
      24: 'clothes_hanger',
      25: 'lamp_control',
      38: 'fan_lamp',
      40: 'calorifier',
      41: 'cool',
      42: 'fan'
    }
    // lang: 'en'
  },
  getters: {
    screenRem (state) { // 当前手机屏幕下1rem为多少px
      let h = state.screenWd
      if (h >= 750) {
        return 20.83
      } else if (h >= 480) {
        return 13.33
      } else if (h >= 414) {
        return 11.5
      } else if (h >= 400) {
        return 11.11
      } else if (h >= 375) {
        return 10.42
      } else {
        return 10
      }
    },
    typeListIR (state) {
      return state.typeData.filter(item => !+item.rf)
    },
    typeListRF (state) {
      return state.typeData.filter(item => +item.rf)
    }
  },
  mutations: {
    setIsRForIR (state, payload) {
      state.isRForIR = payload
    },
    setProIndex (state, payload) {
      state.proIndex = payload
    },
    setCitiesIndex (state, payload) {
      state.citiesIndex = payload
    },
    setOperatorIndex (state, payload) {
      state.operatorIndex = payload
    },
    setSecondList (state, payload) {
      state.secondList = payload
    },
    setSecondListTotal (state, payload) {
      state.secondListTotal = payload
    },
    setStatusBarHg (state, payload) {
      state.statusBarHg = payload
    },
    setScreenWd (state, payload) {
      state.screenWd = payload
    },
    setTid (state, payload) {
      state.tid = payload
    },
    setBid (state, payload) {
      state.bid = payload
    },
    setTypeData (state, payload) {
      state.typeData = payload
    },
    setAddedDevList (state, payload) {
      state.addedDevList = payload
    },
    setBrandScrollPos (state, payload) {
      state.brandScrollPos = payload
    },
    updateCmdList(state, payload) {
      Object.assign(state.cmdList, payload)
    },
    setDevName (state, payload) {
      state.devName = payload
    },
    setAppStatus (state, payload) {
      state.appStatus = payload
    },
    setLoadRes (state, payload) {
      state.loadRes = payload
    },
    setDelay (state, payload) {
      state.delay = payload
    },
    setFeedKey (state, payload) {
      state.controlKey = payload
    },
    setRoomName (state, payload) {
      state.roomName = payload
    }
  },
  actions: {
    initFun ({ commit, state }) {
      window.onResume = () =>{
        // window.hilink.getDevCacheAll('0', '', 'app.getDevInfoAllCallback')
        console.warn('onResume')
      }
      window.deviceEventCallback = res => {
        let data = parseHilinkData(res)
        window.app.changeSerData(data)
        console.log('设备上报', JSON.parse(JSON.stringify(data)))
        console.log('123')
      }
      window.app = {
        getDevInfoAllCallback (res) {
          let data = parseHilinkData(res)
          state.appDevId = data.devId
          commit('setDevName', data.devName)
          commit('setRoomName', data.roomName)
          console.log('状态全集', data)
          data.services.forEach(item => {
            window.app.changeSerData(item)
          })
        },
        /** 服务数据上报转化 **/
        changeSerData (obj) {
          switch (obj.sid) {
            case 'ledOnoff':
              commit('setAppStatus', obj.data.on)
              break
            case 'loadRes':
              commit('setLoadRes', obj.data.loadRes)
              break
            case 'delay':
              commit('setDelay', obj.data.delay)
              break
            case 'controlKey':
              commit('setFeedKey', obj.data.controlKey)
          }
        },
        setTitleCallback (res) {
          console.log(res)
        },
        setDeviceInfoCallback (res) {
          console.log('setDeviceInfoCallback', res)
        },
        getBarCallback (res) {
          console.log(JSON.parse(res))
          let data = JSON.parse(res)
          commit('setStatusBarHg', data.statusBarHeight)
        },
        /** 获取设备类型返回函数 **/
        getRCTypeResultCallback (res) {
          let data = parseHilinkData(res)
          const numArr = [16, 17]
          let allList  = JSON.parse(JSON.stringify(data.result))
          console.log('所有类型', JSON.parse(JSON.stringify(data.result)))
          let select = allList.filter(item => !numArr.includes(item.tid))
          commit('setTypeData', select)
        },
        /** 修改房间名 **/
        modifyRoomCallback (res) {
          console.log('modifyRoomCallback', res)
        },
        /** 修改名称回调 **/
        modifyDeviceNameByDevIdCallback2 (res) {
          console.log('modifyDeviceNameByDevIdCallback2', res)
        }
      }
    },
    /** 获取设备类型数据 **/
    getDevTypeList ({ commit, state}) {
      if (state.typeData.length > 0) return
      // $http.get('/huawei/l.php', {
      //   params: {
      //     m: 'live',
      //     c: 'be_rc_type'
      //   }
      // }).then(res => {
      //   console.log('getDevTypeList', res.data.result)
      //   commit('setTypeData', res.data.result)
      // })

      let reqParams = {
        domain: 'http://hwapi.yaokantv.com',
        path: '/huawei/l.php',
        method: 'GET',
        param: {
          m: 'live',
          c: 'be_rc_type'
        }
      }
      window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'app.getRCTypeResultCallback')
    },
    /** 获取设备品牌数据 **/
    getDevBrandList ({ commit, state }) {
      return new Promise(resolve => {
        // $http.get(
        //   `/huawei/l.php?m=live&c=fname_list&rc_type=${state.tid}`
        // ).then(res => {
        //   console.log('getDevBrandList', res.data.result)
        //   resolve(res.data.result)
        // })

        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: `/huawei/l.php?m=live&c=fname_list&rc_type=${state.tid}`,
          method: 'POST',
          param: {
            m: 'live',
            c: 'fname_list',
            rc_type: state.tid
          }
        }
        window.getBrandResultCallback = res => {
          let data = parseHilinkData(res)
          console.log('获取设备品牌', data.result.slice(0, 10))
          resolve(data.result)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getBrandResultCallback')
      })
    },
    /** 获取一级匹配数据 **/
    getDevModeList ({commit, state}, bid) {
      return new Promise(resolve => {
        // $http.get('/huawei/l.php', {
        //   params: {
        //     c: 'matching1',
        //     be_rc_type: state.tid,
        //     bid: bid,
        //     zip:1,
        //     vl: 1
        //   }
        // }).then(res => {
        //     console.log('getDevModeList', res.data.result)
        //     resolve(res.data.result)
        // })
        let reqParams = {}
        if (state.tid === 7) {
          reqParams = {
            domain: 'http://hwapi.yaokantv.com',
            path: `/huawei/l.php?c=area_fname&rc_type=7&bid=${bid}&zip=1&lang=${state.lang}`,
            method: 'POST',
            param: {
              c: 'area_fname',
              rc_type: state.tid,
              bid: bid,
              zip: 1,
              lang: state.lang
            }
          }
        } else {
          reqParams = {
            domain: 'http://hwapi.yaokantv.com',
            path: `/huawei/l.php?c=matching1&bid=${bid}&be_rc_type=${state.tid}&zip=1&vl=1`,
            method: 'POST',
            param: {
              c: 'matching1',
              bid: bid,
              be_rc_type: state.tid,
              zip: 1,
              vl: 1
            }
          }
        }
        // let reqParams = {
        //   domain: 'http://hwapi.yaokantv.com',
        //   path: `/huawei/l.php?c=matching1&be_rc_type=${state.tid}&bid=${bid}`,
        //   method: 'POST',
        //   param: {
        //     c: 'matching1',
        //     bid: bid,
        //     be_rc_type: state.tid
        //   }
        // }
        console.log('getDevModeList_body', reqParams)
        window.getMatchResultCallback = res => {
          let data = parseHilinkData(res)
          console.log('getDevModeList_result', data)
          resolve(data.result)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getMatchResultCallback')
      })
    },
    /** 获取二级匹配数据 **/
    getSecondLevelMatchData ({commit, state}, groupId) {
      return new Promise(resolve => {
        // $http.get('/huawei/l.php', {
        //   params: {
        //     c: 'matching2',
        //     be_rc_type: state.tid,
        //     bid: state.bid,
        //     group_id: groupId,
        //     vl: 1
        //   }
        // }).then(res => {
        //   console.log('getSecondLevelMatchData', res.data.result)
        //   resolve(res.data.result)
        // })

        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: `/huawei/l.php?c=matching2&bid=${state.bid}&be_rc_type=${state.tid}&group_id=${groupId}&zip=1&vl=1`,
          method: 'POST',
          param: {
            c: 'matching2',
            be_rc_type: state.tid ,
            bid: state.bid,
            group_id: groupId,
            zip: 1,
            vl: 1
          }
        }
        window.getMatchResultCallback = res => {
          let data = parseHilinkData(res)
          resolve(data.result)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getMatchResultCallback')
      })
    },
    /** 获取设备码库和基本信息 **/
    getDevCodeLibAndInfo ({commit, state}, rid) {
      return new Promise(resolve => {
        let $url = state.tid === 1? `/huawei/l.php?c=remote_details_stb&rid=${rid}&lang=${state.lang}` : `/huawei/l.php?c=remote_details&rid=${rid}&zip=1&real_key=1&lang=${state.lang}`
        // $http.get(
        //   $url
        // ).then(res => {
        //   console.log('getDevCodeLibAndInfo', res.data)
        //   resolve(res.data)
        // })

        let $params = state.tid === 1? {c: 'remote_details_stb', rid: rid, lang: state.lang} : {c: 'remote_details', rid: rid, zip: 1, real_key: 1, lang: state.lang}
        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: $url,
          method: 'POST',
          param: $params
        }
        console.log('getDevCodeLib_body', reqParams)
        window.getRCResultCallback = res => {
          let data = parseHilinkData(res)
          console.log('getDevCodeLib_result', data)
          resolve(data)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getRCResultCallback')
      })
    },
    /** 获取省份和市级行政单位
     * area_id 为0的时候获取省级地区列表
     * 再用获取到的省级地区的area_id得到市级地区列表
     * **/
    getAreaList ({commit, state}, area_id) {
      return new Promise(resolve => {
        // $http.get('/huawei/l.php', {
        //   params: {
        //     c: 'areas',
        //     area_id: area_id
        //   }
        // }).then(res => {
        //   // console.log('getAreaList', res.data.result)
        //   resolve(res.data.result)
        // })

        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: `/huawei/l.php?c=areas&area_id=${area_id}`,
          method: 'POST',
          param: {
            c: 'areas',
            area_id: area_id
          }
        }
        window.getAreaListResultCallback = res => {
          let data = parseHilinkData(res)
          resolve(data.result)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getAreaListResultCallback')
      })
    },
    /** 根据区域 ID获取运营商列表  **/
    getOperatorList ({commit, state}, area_id) {
      return new Promise(resolve => {
        // $http.get('/huawei/l.php', {
        //   params: {
        //     c: 'providers_area_id',
        //     area_id: area_id
        //   }
        // }).then(res => {
        //   // console.log('getOperatorList', res.data.result)
        //   resolve(res.data.result)
        // })

        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: `/huawei/l.php?c=providers_area_id&area_id=${area_id}`,
          method: 'POST',
          param: {
            c: 'providers_area_id',
            area_id: area_id
          }
        }
        window.getOperatorListResultCallback = res => {
          let data = parseHilinkData(res)
          resolve(data.result)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getOperatorListResultCallback')
      })
    },
    /** 获取空调支持的功能有哪些 **/
    getACFnList ({commit, state}, rid) {
      console.log('rid', rid)
      return new Promise(resolve => {
        // $http.get('/huawei/l.php', {
        //   params: {
        //     c: 'remote_props',
        //     rid: rid
        //   }
        // }).then(res => {
        //   console.log('getACFnList', res.data)
        //   resolve(res.data)
        // })

        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: `/huawei/l.php?c=remote_props&rid=${rid}`,
          method: 'POST',
          param: {
            c: 'remote_props',
            rid: rid
          }
        }
        window.getACFnListResultCallback = res => {
          let data = parseHilinkData(res)
          console.log('getACFnListResultCallback', data)
          resolve(data)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getACFnListResultCallback')
      })
    },
    /**
     * 获取品牌射频设备code
     * **/
    getBrandRfCode ({commit, state}) {
      console.log(state.tid, state.bid)
      return new Promise(resolve => {
        let reqParams = {
          domain: 'http://hwapi.yaokantv.com',
          path: `/huawei/l.php?c=rf_rule&be_rc_type=${state.tid}&bid=${state.bid}`,
          method: 'POST',
          param: {
            c: 'rf_rule',
            be_rc_type: state.tid,
            bid: state.bid
          }
        }
        window.getBrandRfCode = res => {
          let data = parseHilinkData(res)
          console.log('getBrandRfCode', data)
          resolve(data)
        }
        window.hilink.requestThirdPartConfig(JSON.stringify(reqParams), 'getBrandRfCode')
      })
    }
  }
})
