/*
 * @Author: your name
 * @Date: 2019-11-13 17:13:13
 * @LastEditTime: 2019-11-15 16:20:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /wechat/e-portWX/app.js
 */
//app.js
var apiRequest = require('./utils/http.js');
App({
  onLaunch: function () {
  //  wx.clearStorageSync()
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      },
      fail:function(err){
        wx.hideLoading()
      }
    })
  },
  onHide:function(){
    wx.removeStorageSync(' currentMachines')
    wx.removeStorageSync('currentCenter')
  },
  globalData: {
    userInfo:null,
    appid:'wxcf0528db896ba86c',
    secret:'8bf21be806fd5877d765e3fdfb72b929',
    js_code:'',
    grant_type:'authorization_code',
    //制作中心
    workCenter:'',
    centerIndex:0
  }
})