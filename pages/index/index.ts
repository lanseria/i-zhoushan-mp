// index.ts
const { key } = require("../../env")
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
import { queryList } from "../../utils/api";
import { statusList } from "../../utils/const";
const qqmapsdk = new QQMapWX({
  key // 必填
});

Page({
  data: {
    statusList: statusList,
    key,
    mapControlPaddingBottom: 400,
    showPosition: true,
    location: {
      latitude: 30.040415,
      longitude: 122.273511
    },
    myLocation: {
      latitude: 30.040415,
      longitude: 122.273511
    },
    dragLocation: {
      latitude: 30.040415,
      longitude: 122.273511
    },
    currentMarker: {
      id: 37922,
      latitude: 29.996967,
      longitude: 122.19234,
      title: "桃湾路采样点",
      workTime: "周一至周日(08:00-11:30,14:00-18:00);(含法定节假日)"
    },
    minScale: 8,
    maxScale: 16,
    scale: 8,
    showMarkerList: true,
    showMarkerDetail: false,
    showMapSelect: false,
    rawData: [],
    markers: [],
    filter: 'all',
    city: '',
    district: '',
    town: "",
    areaList: [],
    mapList: [
      {
        cover: '../../asset/sample_cover.jpeg',
        path: '/pages/index/index',
        active: true
      }, {
        cover: '../../asset/parking_cover.jpeg',
        path: '/pages/parking/index',
        active: false
      }
    ],
    markerCallbackTxt: ''
  },

  handleSwitchMap(e) {
    const { currentTarget } = e
    const { dataset } = currentTarget
    const { item } = dataset
    wx.redirectTo({
      url: item.path
    })
  },

  _bgSelect(idx) {
    console.log(idx, this.data.city)
    if (idx == 0 && this.data.city) {
      return true
    } else {
      return false
    }
  },
  setArea(e) {
    const { currentTarget } = e
    const { dataset } = currentTarget
    const { idx } = dataset
    if (idx === 2) {
      if (this.data.district) {
        this.setData({
          town: this.data.town ? '' : this.data.areaList[2]
        })
        this.fetchData()
      }
    }
    if (idx === 1) {
      this.setData({
        town: this.data.district ? '' : this.data.areaList[2],
        district: this.data.district ? '' : this.data.areaList[1]
      })
      this.fetchData()
    }

  },
  // 标注点击回调
  onTapMarker(event) {
    const markers = this.data.markers;
    for (let i = 0; i < markers.length; i++) { // 本示例只有一个marker，可用于处理单marker和多marker情况
      if (event.markerId === markers[i].id) {
        const item = markers[i]
        this.handleShowMarkerDetail(item)
        this._setLocation(item.latitude, item.longitude)
        this.moveToLocation(item.latitude, item.longitude)
      }
    }
  },
  onRegionChange(e) {
    if (e.type === 'end') {
      // console.log(e.detail.centerLocation)
      this.setData({
        dragLocation: e.detail.centerLocation
      })
      // const { latitude, longitude } = e.detail.centerLocation
      // this._setLocation(latitude, longitude)
    }
  },
  handleOpenApp(e) {
    const { currentTarget } = e
    const { dataset } = currentTarget
    const { item } = dataset
    console.log(item)
    this.openMapApp(item)
  },
  // 逆解析
  reverseGeocoder(item, cb) {
    qqmapsdk.reverseGeocoder({ // 调用逆地址解析
      location: {
        latitude: item.latitude,
        longitude: item.longitude
      },
      success: res => {
        cb(res)
      }
    }
    )
  },
  openMapApp(item: any) {
    this.reverseGeocoder(item, (res) => {
      if (res.result && res.result.formatted_addresses) { // 避免名称无数据处理
        this.setData({
          markerCallbackTxt: res.result.formatted_addresses.recommend
        });
      } else {
        this.setData({
          markerCallbackTxt: res.result.address
        });
      }
      const mapCtx = wx.createMapContext('map', this);
      mapCtx.openMapApp({
        latitude: item.latitude,
        longitude: item.longitude,
        destination: this.data.markerCallbackTxt
      })
    })

  },
  setScale(value: number) {
    const mapCtx = wx.createMapContext('map', this);
    mapCtx.getScale({
      success: (res) => {
        const scale = res.scale.toFixed(0)
        // console.log(scale)
        this.setData({
          scale: +scale + value,
          location: this.data.dragLocation
        })
      }
    })
  },
  setCenter(e) {
    const { currentTarget } = e
    const { dataset } = currentTarget
    const { item } = dataset
    this._setLocation(item.latitude, item.longitude)
    this.moveToLocation(item.latitude, item.longitude)
    this.handleShowMarkerDetail(item)
  },
  setFilter(e) {
    const { currentTarget } = e
    const { dataset } = currentTarget
    let { filter } = this.data
    filter === dataset.id ? (filter = 'all') : (filter = dataset.id)
    this.setData({
      filter
    })
    this.setMarkers()
  },
  _iconPath(status) {
    if (status !== null) {
      return '../../asset/' + status + '.png'
    } else {
      return '../../asset/3.png'
    }
  },
  setMarkers() {
    const { rawData, filter } = this.data
    let data = []
    if (filter === 'all') {
      data = rawData
    } else {
      data = rawData.filter(i => i.serviceStatus === filter)
    }
    const markers = data.map((item: any) => {
      return {
        title: item.orgName,
        id: +item.orgId,
        latitude: +item.gisLat,
        longitude: +item.gisLng,
        width: 18,
        height: 18,
        status: item.serviceStatus,
        iconPath: this._iconPath(item.serviceStatus),
        workTime: item.workTime
      }
    })
    this.setData({
      markers: markers
    })
    const points = this.data.markers.map(m => ({
      latitude: m.latitude,
      longitude: m.longitude
    }))
    this.includePoints(points)
  },
  async fetchData() {
    const areaName = `${this.data.city}${this.data.district}${this.data.town}`
    const res = await queryList(areaName, this.data.location.latitude, this.data.location.longitude)
    this.setData({
      rawData: res
    })
    this.setMarkers()
  },
  onIncreaseScale() {
    this.setScale(+1)
  },
  onDecreaseScale() {
    this.setScale(-1)
  },
  handleShowIdeas() {
    this.setData({
      showMarkerList: false,
      showMarkerDetail: false,
      showMapSelect: false,
      mapControlPaddingBottom: this.data.showMarkerList ? 35 : 400
    })
    this.handleSetIdeas(true)
  },
  handleSetIdeas(value) {
    const sampleSubscribe = this.selectComponent("#sample_subscribe")
    sampleSubscribe.setShowOrHide(value) //子组件的方法
  },
  handleShowMapSelect() {
    this.setData({
      showMarkerList: false,
      showMarkerDetail: false,
      showMapSelect: !this.data.showMapSelect,
      mapControlPaddingBottom: this.data.showMarkerList ? 35 : 400
    })
    this.handleSetIdeas(false)
  },
  handleShowMarkerList() {
    this.setData({
      showMarkerList: !this.data.showMarkerList,
      showMarkerDetail: false,
      showMapSelect: false,
      mapControlPaddingBottom: this.data.showMarkerList ? 35 : 400
    })
    this.handleSetIdeas(false)
    this.includePoints(this.data.markers)
  },
  handleShowMarkerDetail(item) {
    this.setData({
      showMarkerList: false,
      showMarkerDetail: true,
      showMapSelect: false,
      mapControlPaddingBottom: this.data.showMarkerList ? 35 : 300,
      currentMarker: item
    })
    this.handleSetIdeas(false)
  },
  _setLocation(latitude, longitude) {
    this.setData({
      location: {
        latitude,
        longitude
      }
    });
  },
  _setMyLocation(latitude, longitude) {
    this.setData({
      myLocation: {
        latitude,
        longitude
      }
    });
  },
  getLocation(cb) {
    console.log('获取当前位置')
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        const { latitude, longitude } = res;
        this._setLocation(latitude, longitude)
        this._setMyLocation(latitude, longitude)
        this.reverseGeocoder(this.data.location, (res) => {
          // console.log(res)
          // console.log(res.result.ad_info.city, res.result.ad_info.district, res.result.address_reference.town.title)
          const { city, district } = res.result.ad_info
          const { title } = res.result.address_reference.town
          this.setData({
            city,
            district,
            town: title,
            areaList: [city, district, title],
          })
          cb()
        })
        this.moveToLocation(latitude, longitude)
      },
    })
  },
  moveToLocation(latitude, longitude) {
    const mapCtx = wx.createMapContext('map', this);
    mapCtx.moveToLocation({
      latitude,
      longitude,
    })
  },
  includePoints(points) {
    const mapCtx = wx.createMapContext('map', this);
    mapCtx.includePoints({
      points,
      padding: [36, 36, this.data.mapControlPaddingBottom, 36]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getLocation(() => {
      this.fetchData()
    })
    // 如何从订阅里来的
    const { predictNextDate } = options
    if (predictNextDate) {
      this.handleShowIdeas()
      const sampleSubscribe = this.selectComponent("#sample_subscribe")
      sampleSubscribe.setPredictNextDate(+predictNextDate)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '舟山核酸采样点查询',
      imageUrl: '../../asset/sample_cover.jpeg' // 图片 URL
    }
  }
})
