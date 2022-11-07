// components/sample_subscribe/index.ts
import dayjs from "dayjs";
import { getCreateSampleUser, updateSampleUser } from "../../utils/api";
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showIdeas: false,
    dateVisible: false,
    countVisible: false,
    timeVisible: false,
    tipVisible: false,
    counts: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
      { label: '4', value: '4' },
      { label: '5', value: '5' },
      { label: '6', value: '6' },
      { label: '7', value: '7' },
    ],

    prevDateStr: dayjs().format('YYYY/MM/DD'),
    minDate: dayjs().subtract(15, 'day').valueOf(),
    maxDate: dayjs().add(9, 'day').valueOf(),

    countValue: ['3'],

    time: dayjs().format('HH:mm'),

    isSubscribe: false,

    openid: '',

    predictNextDate: 0,
    predictNextDateStr: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleCancel() {
      this.setData({
        tipVisible: false,
      });
    },
    handleContinue() {
      const { predictNextDate } = this.data
      this.setData({
        prevDateStr: dayjs().format('YYYY/MM/DD'),
        minDate: dayjs().subtract(15, 'day').valueOf(),
        maxDate: dayjs().add(9, 'day').valueOf(),
        time: dayjs.unix(predictNextDate).format('HH:mm'),
        tipVisible: false,
      })
      this.handleSubscribe()
    },
    handleTipPopup() {
      this.setData({
        tipVisible: true,
      });
    },
    onTipVisibleChange(e) {
      this.setData({
        visible: e.detail.visible,
      });
    },
    setPredictNextDate(dateNum: number) {
      this.setData({
        predictNextDate: dateNum,
        predictNextDateStr: dayjs.unix(dateNum).format('YYYY/MM/DD HH:mm')
      })
      this.handleTipPopup()
    },
    async handleCancelSubscribe() {
      const updateUserSubscribeDto = {
        openid: this.data.openid,
        isSubscribe: false,
      }
      const res = await updateSampleUser(updateUserSubscribeDto)
      wx.showToast({
        title: '取消订阅成功'
      })
      this.fetchData()
    },
    handleSubscribe() {
      wx.requestSubscribeMessage({
        tmplIds: ['rloHiweZ2j-enAm6lNUwIuIjl3bEIWyZpvG-5Nvk9D0'],
        success: (res) => {
          console.log(res)
          if (res['rloHiweZ2j-enAm6lNUwIuIjl3bEIWyZpvG-5Nvk9D0'] === 'accept') {
            this.updateSubscribe()
          }
        }
      })
    },
    async updateSubscribe() {
      const updateUserSubscribeDto = {
        openid: this.data.openid,
        isSubscribe: true,
        currentSampleDateTime: dayjs(this.data.prevDateStr + ' ' + this.data.time, 'YYYY/MM/DD HH:mm').unix(),
        intervalDay: +this.data.countValue[0],
      }
      const res = await updateSampleUser(updateUserSubscribeDto)
      console.log(res)
      wx.showToast({
        title: '订阅成功'
      })
      this.fetchData()
    },

    setShowOrHide(setToggle: boolean = true) {
      if (setToggle)
        this.setData({
          showIdeas: !this.data.showIdeas
        })
      else
        this.setData({
          showIdeas: false
        })
    },

    onConfirm(e) {
      const { value } = e.detail;
      this.setData({
        time: value
      })
      this.hidePicker();
    },
    hidePicker() {
      this.setData({
        timeVisible: false,
      });
    },
    handleTime() {
      this.setData({ timeVisible: true });
    },

    onPickerChange(e) {
      this.setData({
        countValue: e.detail.value
      })
    },
    onPickerCancel() {
      this.setData({
        countVisible: false
      })
    },
    handleCount() {
      this.setData({ countVisible: true });
    },

    handleCalendarConfirm(e) {
      this.setData({
        dateVisible: false,
        prevDateStr: dayjs(e.detail.value).format('YYYY/MM/DD')
      })
      console.log(e.detail.value);
    },
    handleCalendar() {
      this.setData({ dateVisible: true });
    },
    fetchData() {
      wx.login({
        success: async (r: any) => {
          if (r.code) {
            //发起网络请求
            const res = await getCreateSampleUser(r.code)
            console.log('lifetimes attached')
            // console.log(res)
            this.setData({
              prevDateStr: dayjs.unix(res.currentSampleDateTime).format('YYYY/MM/DD'),
              countValue: [res.intervalDay + ''],
              time: dayjs.unix(res.currentSampleDateTime).format('HH:mm'),
              isSubscribe: res.isSubscribe,
              openid: res.openid,
              predictNextDateStr: dayjs.unix(res.nextSampleDateTime).format('YYYY/MM/DD HH:mm')
            })
          } else {
            console.log('登录失败！' + r.errMsg)
          }
        }
      })
    }
  },
  lifetimes: {
    attached: function () {
      this.fetchData()
    }
  }
})
