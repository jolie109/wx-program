// pages/count/count.js
const util = require('../../utils/util.js');
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime');
var apiRequest = require('../../utils/http.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShow: false, //控制计数值日印量的显示隐藏
    //设备分类为打印机
    displayP: 'block',
    displayN: 'block',
    //显示打印中心
    arrayCenter: [],
    index: 0,
    //登录
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //切换制作中心
  bindPickerChange: function(e) {
    var value = e.detail.value
    //获取前一天时间
    var time = util.formatTime(new Date(), -1);
    this.setData({
      index: value,
      currentCenter: this.data.arrayCenter[value],
      date: time
    })
    app.globalData.workCenter = this.data.currentCenter
    app.globalData.centerIndex = this.data.index
    this.getAllByYesterday();
  },

  //获取所有打印制作中心
  getAllWork: function(e) {
    var newArrary = [];
    var data = wx.getStorageSync('userInfo')
    for (var i in data) {
      newArrary.unshift(data[i])
    }
    this.setData({
      arrayCenter: newArrary
    })
    if (this.data.arrayCenter.length != 0) {
      app.globalData.workCenter = this.data.arrayCenter[this.data.index]
      if (app.globalData.workCenter && this.data.date) {
        this.getAllByYesterday()
      }
    }
  },

  //某个打印中心下所有前一天录入信息
  getAllByYesterday:async function() {
    var that = this;
    let res =await apiRequest('/productionManagement/getAllByYesterday', 'GET', {
      printDate: that.data.date,
      workName: this.data.currentCenter
    });
      if (res.data.status == "404") {
        this.minTip(res.data.msg, 2000);
        var data = res.data.result
        that.setData({
          countP: [],
          countN: [],
          displayP: 'block',
          displayN: 'block'
        })
        return;
      }
      var data = res.data.result
      if(data.length===0){
        return;
      }
      data.forEach(doc => {
        doc.type = doc.cate.type
        doc.printDate = doc.cate.printDate
        let newList = {
          type: doc.cate.type,
          serialNumber: doc.serialNumber,
          nickName: doc.nickName,
          category: doc.category,
          click_count: doc.click_count
        }
        doc.item[0] = Object.assign({}, doc.item[0], newList)
      })
      var countP = []
      var countN = []
      data.forEach(item => {
        if (item.category == '打印机') {
          countP.push(item)
        } else {
          countN.push(item)
        }
        that.setData({
          countP: countP,
          countN: countN,
          displayP: 'block',
          displayN: 'block'
        })
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.statusCode) {
      this.getAllWork();
      // 获取前一天时间
      if (!options.printDate) {
        //获取当前日期
        var time = util.formatTime(new Date(), -1);
        this.setData({
          date: time
        })
      } else {
        this.setData({
          date: options.printDate
        })
      }
      if (!options.workCenter) {
        this.setData({
          currentCenter: app.globalData.workCenter,
        })
      } else if (options.workCenter && !options.nickName) {
        var index = this.data.arrayCenter.findIndex(val => {
          return options.workCenter === val
        })
        app.globalData.workCenter = options.workCenter
        this.setData({
          currentCenter: options.workCenter,
          index: index
        })
        if (this.data.currentCenter && this.data.date) {
          this.getAllByYesterday();
        }
      } else {
        var index = this.data.arrayCenter.findIndex(val => {
          return options.workCenter === val
        })
        this.setData({
          currentCenter: options.workCenter,
          index: index,
          nickName: options.nickName
        })
        app.globalData.workCenter = this.data.currentCenter
        this.getHistoryByDay();
      }
      if (options.category == '打印机') {
        this.setData({
          displayP: 'block',
          displayN: 'block'
        })
      } else if (!options.category) {
        this.setData({
          displayP: 'block',
          displayN: 'block'
        })
      } else {
        this.setData({
          displayP: 'block',
          displayN: 'block'
        })
      }
    } else {
      let title = '请先登录';
      this.minTip(title, 2000);
      wx.switchTab({
        url: '../index/index',
      })
    }
    
  },
  getHistoryByDay:async function() {
    let res = await apiRequest('/productionManagement/getHistoryByDay', 'GET', { //getAllByYesterday
      nickName: this.data.nickName,
      printDate: this.data.date
    });
      if (res.data.status == "404") {
        this.minTip(res.data.msg, 2000);
        this.setData({
          count: res.data.result
        })
        return;
      }
      var data = res.data.result
      data.forEach(item => {
        var countP = []
        var countN = []
        if (item.item[0].category == '打印机') {
          countP.push(item)
          this.setData({
            countP: countP,
            displayP: 'block',
            displayN: 'block'
          })
        } else {
          countN.push(item)
          this.setData({
            countN: countN,
            displayP: 'block',
            displayN: 'block'
          })
        }
      })
  },
  //提示框
  minTip(title,duration){
    wx.showToast({
      title: title,
      icon: "none",
      duration: duration,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.statusCode) {
      this.getAllByYesterday();
      return;
    }
    let title = '请先登录';
    this.minTip(title,4000);
    wx.switchTab({
      url: '../index/index',
    });
  },
  toggleCount: function(e) {
    this.setData({
      isShow: !this.data.isShow,
      cindex: e.currentTarget.dataset.index
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
})