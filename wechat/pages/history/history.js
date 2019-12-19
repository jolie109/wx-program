// pages/history/history.js
const app = getApp();
const util = require("../../utils/util.js");
const regeneratorRuntime = require("../../lib/regenerator-runtime/runtime");
var apiRequest = require("../../utils/http.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    query: {},
    isShow: false,
    //选择机器中选项
    array: [],
    arrayC: [],
    indexC: 0,
    index: 0,
    blackA3: 0,
    blackA4: 0,
    colorA3: 0,
    colorA4: 0,
    currentMachine: "全部",
    date2: "请选择日期",
    date3: "请选择日期"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var time = "请选择日期";
    app.globalData.date = time;
    this.setData({
      index: 0,
      indexC: 0,
      countP: [],
      currentMachine: "全部",
      date2: "请选择日期",
      date3: "请选择日期",
      displayd: "block",
      displaym: "block",
      workCenter: app.globalData.workCenter
    });
    this.getAllMachine();
    this.getHistoryByCon();
  },
  //分类选择触发器
  bindPickerChangeC: async function(e) {
    var newArray = ["全部"];
    if (this.data.arrayC[e.detail.value] === "全部") {
      this.getAllMachine();
      this.setData({
        indexC: e.detail.value
      });
    } else {
      let res = await apiRequest(
        "/productionManagement/getMachineByCategory",
        "GET",
        {
          workCenter: this.data.workCenter,
          category: this.data.arrayC[e.detail.value]
        }
      );
      res.data.result.forEach(item => {
        newArray.push(item.nickName);
      });
      this.setData({
        array: newArray,
        indexC: e.detail.value,
        index: 0,
        currentMachine: "全部",
        date2: "请选择日期",
        date3: "请选择日期"
      });
      this.getHistoryByCon();
    }
  },
  //机器选择器触发事件 根据机器查看历史记录
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value,
      currentMachine: this.data.array[e.detail.value],
      date2: "请选择日期",
      date3: "请选择日期"
    });
    this.setData({
      index: e.detail.value
    });
    this.getHistoryByCon();
  },
  bindStartChange(e) {
    this.setData({
      date2: e.detail.value,
      date3: e.detail.value,
      printDate: e.detail.value
    });
    this.getHistoryByCon();
  },
  bindEndChange(e) {
    //结束时间
    if (this.data.date2 != "请选择日期") {
      var isMonth = util.isMonth(this.data.date2, e.detail.value);
      if (isMonth) {
        let title = "请选择任意30天内数据";
        this.minTip(title, 2000);
        return;
      }
    }
    this.setData({
      date3: e.detail.value,
      printDate: e.detail.value
    });
    this.getHistoryByCon();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  toggleCount: function(e) {
    this.setData({
      isShow: !this.data.isShow,
      cindex: e.currentTarget.dataset.index
    });
  },
  // 获取某打印中心下全部机器信息
  getAllMachine: async function() {
    let res = await apiRequest("/productionManagement/getMachineBypro", "GET", {
      workName: this.data.workCenter
    });
    if (res.data.status === "404") {
      this.minTip(res.data.msg, 2000);
      return;
    }
    var newArray = [];
    var newArrayC = [];
    newArray[0] = "全部";
    newArrayC[0] = "全部";
    var data = res.data.result[0].item;
    let machines = data.filter(da => {
      return "打印机" === da.category;
    });
    machines.forEach(item => {
      newArray.push(item.nickName);
      newArrayC.push(item.category);
    });
    function unique(arr) {
      return Array.from(new Set(arr));
    }
    var arrayCEnd = unique(newArrayC);
    this.setData({
      array: newArray,
      currentMachine: data.nickName,
      nickName: data.nickName,
      arrayC: arrayCEnd
    });
  },
  //
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (!app.globalData.statusCode) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        duration: 4000
      });
      wx.switchTab({
        url: "../index/index"
      });
      return;
    }
  },
  //多条件作何查询
  getHistoryByCon: async function() {
    let _that = this;
    let indexC = _that.data.indexC;
    let index = _that.data.arrayC[indexC];
    if (
      _that.data.arrayC[_that.data.indexC] &&
      _that.data.arrayC[_that.data.indexC] !== "全部"
    ) {
      //判断分类
      _that.data.query.category = index;
    } else {
      _that.data.query.category = "";
    }
    if (_that.data.currentMachine && _that.data.currentMachine != "全部") {
      //判断机器
      _that.data.query.nickName = _that.data.currentMachine;
    } else {
      _that.data.query.nickName = "";
    }
    if (
      _that.data.date2 &&
      _that.data.date2 !== "请选择日期" &&
      _that.data.date3 &&
      _that.data.date3 !== "请选择日期"
    ) {
      _that.data.query.startTime = _that.data.date2;
      _that.data.query.endTime = _that.data.date3;
    } else {
      _that.data.query.startTime = "";
      _that.data.query.endTime = "";
    }
    let res = await apiRequest("/productionManagement/findHistory", "GET", {
      list: _that.data.query,
      workName: _that.data.workCenter
    });
    if (res.data.status == "404") {
      _that.minTip(res.data.msg, 2000);
      _that.setData({
        countP: [],
        countN: []
      });
      return;
    } else if (res.data.status == "200" && res.data.result.length === 0) {
      _that.minTip("暂无历史记录", 2000);
      _that.setData({
        countP: [],
        countN: []
      });
    }
    if (_that.data.arrayC[_that.data.indexC] == "打印机") {
      _that.setData({
        countP: res.data.result,
        countN: [],
        displayd: "none",
        displaym: "block"
      });
    } else if (_that.data.arrayC[_that.data.indexC] == "全部") {
      let data = res.data.result;
      let countP = data.filter(da => {
        return "打印机" == da.category;
      });
      let countN = data.filter(da => {
        return "打印机" !== da.category;
      });
      if (_that.data.currentMachine && _that.data.currentMachine !== "全部") {
        if (countP.length > 0) {
          _that.setData({
            countP: countP,
            countN: countN,
            displayd: "none",
            displaym: "block"
          });
        }
        if (countN.length > 0) {
          _that.setData({
            countP: countP,
            countN: countN,
            displayd: "block",
            displaym: "none"
          });
        }
      } else {
        _that.setData({
          countP: countP,
          countN: countN,
          displayd: "block",
          displaym: "block"
        });
      }
    } else {
      _that.setData({
        countP: [],
        countN: res.data.result,
        displayd: "block",
        displaym: "none"
      });
    }
    if (_that.data.countP) {
      var pLength = _that.data.countP.length;
    }
    if (pLength && pLength !== 0) {
      let blackA3 = 0;
      let blackA4 = 0;
      let colorA3 = 0;
      let colorA4 = 0;
      let countP = _that.data.countP;
      countP.forEach(p => {
        p.cate.type.forEach(el => {
          if (el.type === "blackA3") {
            blackA3 += el.last_day_click;
          } else if (el.type === "blackA4") {
            blackA4 += el.last_day_click;
          } else if (el.type === "colorA3") {
            colorA3 += el.last_day_click;
          } else if (el.type === "colorA4") {
            colorA4 += el.last_day_click;
          }
        });
      });
      this.setData({
        blackA3: blackA3,
        blackA4: blackA4,
        colorA3: colorA3,
        colorA4: colorA4
      });
    }
  },
  //提示框
  minTip(title, duration) {
    wx.showToast({
      title: title,
      icon: "none",
      duration: duration
    });
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
});
