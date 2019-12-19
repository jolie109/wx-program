/*
 * @Description: In User Settings Edit存到缓存
 * @Author: your name
 * @Date: 2019-10-21 08:29:03
 * @LastEditTime: 2019-10-21 08:59:30
 * @LastEditors: Please set LastEditors
 */
//获取应用实例
var apiRequest = require('../../utils/http.js')
const app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    category:''
  },
  onLoad: function (options) {
    if (options.id || options.scene) {
      if (options.scene){
       let scene = decodeURIComponent(options.scene);
       let arrPara = scene.split("&");
       let arr = [];
       for (var i in arrPara) {
         arr = arrPara[i].split("=");
         this.setData({
           id: arr[1]
         })
         wx.setStorageSync('indexId', this.data.id)
       }
     }else{
        wx.setStorageSync('indexId', options.id)
        this.setData({
          id: options.id
        })
     }
    }
    if (this.data.id) {
      var that = this
      apiRequest('/productionManagement/getMachineById', 'GET', {
        id: that.data.id
      }).then(res => {
        if (res.data.result.length !== 0) {
          that.setData({
            workCenter: res.data.result[0].item[0].workName,
            currentMachines: res.data.result[0].nickName,
            category: res.data.result[0].category
          })
          wx.setStorageSync('currentCenter', that.data.workCenter)
          wx.setStorageSync('currentMachines', that.data.currentMachines)
          wx.setStorageSync('category', that.data.category)
          that.havUsrMsg()
        } else {
          // wx.removeStorageSync('currentCenter')
          // wx.removeStorageSync('currentMachines')
          // wx.setStorageSync('category', that.data.category)
          wx.redirectTo({
            url: '../logs/logs?msg=1'
          })
        }
      })
    }
    var eltoken = wx.getStorageSync('eletoken')
  },
  getUserInfo: function (e) {
    var that = this
    // app.globalData.userInfo = e.detail.userInfo 
    if (e.detail.userInfo){
      wx.setStorageSync('userMsg', e.detail.userInfo)
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      wx.showLoading({ title: '登陆中' })
      //登录业务用户
      that.handleLogin()
    }
  
  },
  //判断是否有用户信息缓存
  havUsrMsg:function(){
    if (wx.getStorageSync('userMsg')) {
      app.globalData.statusCode = '200'
      this.getUserMsg()
      this.setData({
        userInfo: wx.getStorageSync('userMsg'),
        hasUserInfo: true
      })
      if (this.data.workCenter && this.data.id && this.data.category && this.data.currentMachines) {
        var workCenters = wx.getStorageSync('userInfo');
        var currentCenter = wx.getStorageSync('currentCenter');
        var currentMachines = wx.getStorageSync('currentMachines');
        var category = wx.getStorageSync('category');
        if (workCenters && currentCenter && currentMachines) {
          var index = workCenters.indexOf(currentCenter)
          if (index !== -1) {
            wx.redirectTo({
              url: '../entering/entering?workCenter=' + currentCenter + '&nickName=' + currentMachines + '&category=' + category
            })
          } else {
            wx.redirectTo({
              url: '../404/404'
            })
          }
        }
      }
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      if (wx.getStorageSync('userMsg')) {
        app.globalData.statusCode = '200'
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          // app.globalData.userInfo = res.userInfo
          app.globalData.statusCode = '200'
          wx.setStorageSync('userMsg', res.userInfo)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
    //登录业务用户
  handleLogin:function(){
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; //发送给服务器的code 
        // var scode = wx.getStorageSync("code");
        wx.setStorageSync("code", code)
        wx.getUserInfo({
          success: function (res) {
            var userNick = res.userInfo.nickName; //用户昵称 
            var avataUrl = res.userInfo.avatarUrl; //用户头像地址 
            var gender = res.userInfo.gender; //用户性别
            var encryptedData = res.encryptedData;
            var iv = res.iv;
            that.setData({
              nick: userNick,
              avataUrl: avataUrl
            })
            if (code) {
              apiRequest('/users/wxReg', 'POST', {
                code: code,
                userName: userNick,
                encryptedData: encryptedData,
                iv: iv
              }).then(res => {
                wx.hideLoading()
                if (res.data.status && res.data.status == '200') {
                  wx.setStorageSync('token', res.data.access_token)
                  wx.setStorageSync('openid', res.data.openid);
                  wx.setStorageSync('eletoken', res.data.token);
                  wx.setStorageSync('userInfo', res.data.result);
                  wx.setStorageSync('userId', res.data.userId);
                  wx.setStorageSync('sessionKey', res.data.sessionKey);
                  wx.setStorageSync('role', res.data.role)
                  that.setData({
                    role: res.data.role
                  })
                  if (res.data.result) {
                    app.globalData.works = res.data.result;
                  }
                  app.globalData.statusCode = res.data.status
                  wx.setStorageSync('statusCode', res.data.status);
                  var workCenters = wx.getStorageSync('userInfo');
                  var currentCenter = wx.getStorageSync('currentCenter');
                  var currentMachines = wx.getStorageSync('currentMachines');
                  var category = wx.getStorageSync('category');
                  if (workCenters && currentCenter && currentMachines) {
                    //扫码进入
                    var index = workCenters.indexOf(currentCenter)
                    if (index != -1) {
                      wx.redirectTo({
                        url: '../entering/entering?workCenter=' + currentCenter + '&nickName=' + currentMachines + '&category=' + category
                      })
                    } else {
                      wx.redirectTo({
                        url: '../404/404'
                      })
                    }
                  } else {
                    //搜索进入
                    wx.reLaunch({
                      url: '../count/count'
                    })
                  }
                } else if (res.data.status && res.data.status == '402') {
                  wx.removeStorageSync('userMsg')
                  that.setData({
                    userInfo: {}
                  })
                  wx.redirectTo({
                    url: '../404/404'
                  })
                  return
                } else if (res.data.status == '404') {
                  wx.redirectTo({
                    url: '../logs/logs'
                  })
                }
              }).catch(err => {
                return err;
              })
            } else {
              wx.showToast({
                title: '获取用户登录态失败!',
                icon: "none",
                duration: 2000,
              })
            }
          }
        })
      },
      fail: function (error) {
        wx.hideLoading()
      }
    })
  },
  getUserMsg:function(){
    // /getUserInfo
    apiRequest("/users/getUserInfo", "GET", {
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if (res.data.status == "404") {
        this.minTip(res.data.msg);
        return;
      }
      if (res.data.status == "200") {
        wx.setStorageSync('userInfo', res.data.result);
      }
    });
  },
  onShow:function(){
    if (wx.getStorageSync('role')){
      let role = wx.getStorageSync('role');
      this.setData({
        role:role
      })
    }
   this.havUsrMsg()
  }
})