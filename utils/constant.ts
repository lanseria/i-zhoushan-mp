const { baseUrl, releaseBaseUrl } = require("../env")
let host = ''
// 获取小程序当前版本信息 https://developers.weixin.qq.com/miniprogram/dev/api/open-api/account-info/wx.getAccountInfoSync.html
// 自动根据版本切换接口请求地址
const { miniProgram: { envVersion } } = wx.getAccountInfoSync();

console.log(envVersion, 'envVersion');
if (envVersion === 'release') {
  host = releaseBaseUrl;
}
if (envVersion === 'trial') {
  host = releaseBaseUrl;
}
if (envVersion === 'develop') {
  host = baseUrl;
  // host = 'https://dev-zawx-gateway.vip.cpolar.top';
}

export const baseUrls = host