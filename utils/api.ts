import { baseUrls } from "./constant"
var Abi = require('wx-axios-promise');
const URL_PREFIX = baseUrls

let api = Abi({
  url: URL_PREFIX,//默认的接口后缀
  dataType: 'json',//默认的返回类型
  header: {
    'Accept': "application/json;v=0.1.0"
  }
})

api.interceptors.response.use((config: any) => {
  wx.hideLoading()
  return config.data || config
}, function (error: any) {
  return error
})

api.interceptors.request.use(function (config: any) {
  try {
    wx.showLoading({
      title: api.req || '加载中'
    })
  } catch (e) {
  }
  return config;
}, function (error: any) {
  return error
})

export const queryList = async (areaName: string, gisLat = '', gisLng = '') => {
  const paramData = {
    orgName: '',
    pageNum: 1,
    pageSize: 1000,
    areaName: areaName,
    levelName: '',
    serviceStatus: '',
    gisLat,
    gisLng,
    isFree: '',
    isRed: '',
    isYellow: '',
    isNeedHs: '',
    isLive: '0',
  }
  const r = await api({
    url: `/sample/points`,
    method: 'POST',
    data: paramData
  })
  return r.data
}

export const getCreateSampleUser = async (code: string) => {
  const r = await api({
    url: '/sample/user',
    method: 'GET',
    data: {
      code
    }
  })
  return r
}

export const updateSampleUser = async (data: any) => {
  const r = await api({
    url: '/sample/user',
    method: 'PUT',
    data
  })
  return r
}