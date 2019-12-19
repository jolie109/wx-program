//  pages/entering/entering.js
const util = require("../../utils/util.js");
const preventClick = require("../../utils/preventMoutclick.js");
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime');
var apiRequest = require("../../utils/http.js");
const app = getApp();
Page({
  /**
   *  页面的初始数据
   */
  data: {
    //机器选择器参数
    array: [],
    index: 0,
    firstAdd: false,
    displayN: "none",
    displayP: "block",
    newType: [],
    //按钮属性
    disabled: true,
  },
  /**
   *  生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      nowTime: util.getNowDate()
    });
    if (options && options.workCenter) {
      //直接扫码进来
      app.globalData.workCenter = options.workCenter;
      this.setData({
        workCenter: options.workCenter
      });
      this.getDate();
      if (this.data.workCenter) {
        this.getMachineBypro();
        this.setData({
          currentMachines: options.nickName,
          option: 1,
          equipment: options.category,
          Bound: "请输入"
        });

        this.getRecordByMachine();
        this.getCategoryByNick();
      }
      if (this.data.equipment == "打印机") {
        this.setData({
          displayP: "block",
          displayN: "none"
        });
      } else {
        this.setData({
          displayP: "none",
          displayN: "block"
        });
      }
    } else {
      //首页进来
      this.setData({
        workCenter: app.globalData.workCenter,
        option: 0,
        date: "请输入"
      });
      this.getMachineBypro();
    }
    this.setData({
      currentDate: this.data.date
    });
  },
  //机器选择器触发事件
  bindPickerChange: function(e) {
    if (e.detail.value === 0) {
      return;
    }
    this.setData({
      index: e.detail.value,
      currentMachines: this.data.array[e.detail.value],
      invalid_click: ""
    });
    this.getCategoryByNick();
    this.judgeDisabled(this.data.currentMachines);
  },
  //日期选择器触发事件
  //获取打印日期
  bindDateChange: function(e) {
    var getDateM = new Date(e.detail.value).getTime();
    var preDate = parseInt(getDateM) - parseInt(24 * 60 * 60 * 1000);
    var getDateR = new Date(preDate);
    this.changeTime(getDateR);
    if (!this.data.currentMachines || this.data.currentMachines === "请输入") {
      let title = "请先选择机器";
      this.minTip(title);
      return;
    }
    this.setData({
      currentDate: e.detail.value,
      date: e.detail.value
    });
    if (this.data.equipment === "打印机") {
      if (this.data.firstAdd) {} else {
        this.getHistoryByMachine(this.data.preDate);
      }
    } else if (this.data.equipment !== "打印机") {
      return
    }
    this.judgeDisabled(this.data.preDate);
  },
  //获取当前计数值
  curentPrintvalueb3: function(e) {
    let type = e.target.dataset.type;
    let currValue = e.detail.value;
    this.isNumber(e.detail.value)
    this.islegal(e.detail.value);
    this.setData({
      ['curr' + type]: currValue
    })
  },
  // 获取装订量
  Boundvalue: function (e) {
    var _that = this;
    var value = e.detail.value;
    if (!/^[0-9]*$/.test(value)) {
      let title = "只能为数字"
      this.minTip(title);
      _that.setData({
        bound: ""
      });
    } else {
      _that.setData({
        bound: value,
      });
    }
    _that.islegal(value);
    _that.judgeDisabled(value);
  },
  //获取报废数量
  invalidclick: function (e) {
    var _that = this;
    var value = e.detail.value;
    if (!/^[0-9]*$/.test(value)) {
      let title = "只能为数字"
      this.minTip(title);
      _that.setData({
        invalid_click: ""
      });
    } else {
      _that.setData({
        invalid_click: e.detail.value
      });
    }
    _that.judgeDisabled(value);
    _that.invalidThanCurr(_that.data.currblackA3, value);
    _that.invalidThanCurr(_that.data.currblackA4, value);
    _that.invalidThanCurr(_that.data.currcolorA3, value);
    _that.invalidThanCurr(_that.data.currcolorA4, value);
  },
  //判断报废量是否大于当前计数值
  invalidThanCurr(currValue, invalid) {
    if (currValue - invalid < 0) {
      let title = "报废数量不可大于当前打印量"
      this.minTip(title);
      this.setData({
        invalid_click: ""
      });
      return;
    }
  },
  //选择机器时判断是否第一次录入
  getRecordByMachine: async function() {
    let res = await apiRequest("/productionManagement/getRecordByMachine", "GET", {
      nickName: this.data.currentMachines
    });
    if (res.data.status === "404") {
      let data = res.data.result;
      let title = "第一次录入打印量";
      this.minTip(title);
      //数据转换
      this.convertData(data.type);
      this.setData({
        machineId: data._id,
        firstAdd: true,
      });
    } else if (res.data.status == "200") {
      let data = res.data.result[res.data.result.length-1];
      this.convertData(data.type);
      this.setData({
        firstAdd: false,
        machineId: res.data.machineId
      });
    } else {
      return
    }

  },
  //获取打印机的所有历史记录中的最近日期的一条
  getLastByMachine: async function() {
    var _that = this;
    let res = await apiRequest("/productionManagement/getHistoryByMachine", "GET", {
      nickName: _that.data.currentMachines
    });
    if (res.data.status == "404") {
      _that.minTip(res.data.msg);
    }
    if (_that.data.equipment === "打印机") {
      let {
        printDate,
        type
      } = res.data.result[0].cate;
      let hasPrintDate = res.data.result[0].cate.printDate; //此机器最大打印日期
      let length = res.data.result.length;
      hasPrintDate = util.getNextDate(hasPrintDate, 1);
      let nowDate = _that.data.preDate; //当前所选时间的前一天，
      let period = " ";
      _that.setData({
        firstDate: res.data.result[length - 1].cate.printDate,
      });
      if (_that.data.firstDate > nowDate) {
        let title = "不可隔天录入，请重新选择日期";
        return;
      } else if (_that.data.firstDate === _that.data.currentDate) {}
      if (hasPrintDate === nowDate) {
        period = hasPrintDate;
      } else {
        period = ` ${hasPrintDate} 至${nowDate}`;
      }
      wx.showModal({
        title: "警告",
        content: `${period},尚未录入打印量，是否强制设置打印量为0`,
        cancelText: "手动补全",
        success(res) {
          if (res.confirm) {
            _that.addPrint(hasPrintDate, printDate, type);
          }
        }
      });
    }
  },

  judgeDisabled: function(value) {
    // 判断信息是不是都填好了
    var that = this;
    if (that.data.equipment === "打印机") {
      if (
        that.data.currentMachines !== "请输入" && that.data.currentDate !== "请输入" &&
        value !== "" && value !== undefined && that.data.invalid_click) {
        that.setData({
          disabled: false
        });
      } else {
        that.setData({
          disabled: true
        });
      }
    } else {
      if (
        that.data.currentMachines !== "请输入" &&
        that.data.currentDate !== "请输入" &&
        that.data.bound &&
        that.data.invalid_click
      ) {
        that.setData({
          disabled: false
        });
      } else {
        that.setData({
          disabled: true
        });
      }
    }
  },
  //处理数据，上一次计数值千分位显示，当前计数显示前三位
  convertData(data) {
    data.forEach((items) => {
      let click_count = items.click_count
      items.typeText = items.type === "blackA3" ? "黑白A3" : items.type === "blackA4" ? "黑白A4" : items.type === "colorA3" ? "彩色A3" : "彩色A4"
      items.click_countthound = util.changeNum(items.click_count); //千分位显示
      items.click_countpre3 = String(click_count).slice(0, 3)
      this.setData({
        [items.type]: items.click_count
      })
    })
    this.setData({
      lastCount: data
    })
  },
  //根据机器设备分类决定显示页面
  getCategoryByNick: async function() {
    let res = await apiRequest("/productionManagement/getCate", "GET", {
      nickName: this.data.currentMachines
    });
    if (res.data.status == "200") {
      this.setData({
        equipment: res.data.result
      });
      if (res.data.result === "打印机") {
        this.setData({
          displayP: "block",
          displayN: "none"
        });
      } else {
        this.setData({
          displayP: "none",
          displayN: "block"
        });
      }
      if (this.data.equipment && this.data.equipment === "打印机") {
        if (this.data.date && this.data.date !== '请输入') {
          this.getHistoryByMachine(this.data.preDate);
          return;
        }
        this.getRecordByMachine();
      } else if (this.data.equipment && this.data.equipment !== "打印机") {
        let res = await apiRequest("/productionManagement/getMachineByName", "GET", {
          nickName: this.data.currentMachines
        });
        this.setData({
          machineId: res.data.result[0]._id
        })
      }
    } else {
      this.minTip('取消，重新添加!!')
    }
  },
  //根据机器名，打印日期获得上一次打印量及machineId
  getHistoryByMachine: async function(date) {
    if (!this.data.currentMachines || !date) {
      return;
    }
    let res = await apiRequest("/productionManagement/getHistoryByDay", "GET", {
      nickName: this.data.currentMachines,
      printDate: date
    });
    if (res.data.status === "404") {
      let data = res.data.result;
      if (data.length === 0) {
        this.setData({
          blackA3: 0,
          blackA4: 0,
          colorA3: 0,
          colorA4: 0,
          bound: "",
        });
      }
      this.getLastByMachine();
    } else if (res.data.status === "200") {
      if (this.data.currentDate !== "请输入" && this.data.equipment === "打印机") {
        let data = res.data.result
        this.setData({
          machineId: data[0].machineId
        })
        if (data[0].type.length > 0) {
          this.convertData(data[0].type);
        }else{}
      } else {
        return
      }
    }
  },
  //验证打印量只能为数字
  isNumber(value) {
    if (!/^[0-9]*$/.test(value)) {
      let title = "打印量只能为数字";
      this.minTip(title);
      this.setData({
        text: ""
      });
    }
  },
  //判断当前计数值是否超过9位数
  islegal(value) {
    if (util.changeSym(value) > 999999999) {
      let title = "当前打印量超过千万";
      this.minTip(title);
      if (this.data.equipment === "打印机") {
        this.setData({
          text: ""
        });
      } else {
        this.setData({
          bound: ""
        });
      }
    }
  },
  //提示框
  minTip(title) {
    wx.showToast({
      title: title,
      icon: "none",
      duration: 2000
    });
  },
  
  //获取指定日期的后一天
  getNextDate: function(date, day) {
    var dd = new Date(date);
    dd.setDate(dd.getDate() + day);
    var y = dd.getFullYear();
    var m =
      dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + "-" + m + "-" + d;
  },
  // 日印量隶属最高判断
  judgeMostDailyPrint:async function(thisCatergory, thisData) {
    var _that = this;
    var lastday = util.getLastday(_that.data.currentDate);
    var currentPrintNumber = thisData;
    var arg = {
      nickName: _that.data.currentMachines,
      printDate: lastday,
      category: thisCatergory,
      currentPrint: currentPrintNumber
    };
    // 如果当前输入的打印量大于一个月之内日打印量最高的一次  则提示用户
    let res =await apiRequest("/productionManagement/judgeMostDailyPrint", "GET", arg);
        if (res.data.result === true) {
          wx.showModal({
            title: "警告",
            content: "当前打印日期下的日印量为30天内历史最高，确认录入吗？",
            cancelText: "核对一下",
            success(res) {
              if (res.confirm) {
                _that.putPrint(thisData);
              }
            }
          });
        } else {
          _that.putPrint(thisData);
        }
  },
  //type数组中数据
  datafortype(type, click, last) {
    var obj = {
      type: type,
      last_day_click: Number(click) - Number(last),
      click_count: Number(click)
    }
    let lastCount = this.data.lastCount;
    lastCount.forEach(items => {
      if (obj.type === items.type) {
        this.data.newType.push(obj)
      }
    });
  },
  //判断当前计数值是否大于上一次
  canbeAdd() {
    var last = [];
    for (var l in this.data.newType) {
      last.push(this.data.newType[l].last_day_click)
    }
    if (Math.min.apply(null, last) < 0) {
      let title = "当前打印量小于上一次打印量"
      this.minTip(title);
      this.setData({
        newType: [],
        invalid_click: ''
      })
      return
    } else if (last.indexOf(null) !== -1) {
      this.minTip("数据录入错误");
    } else {
      this.havenextDay()
    }
  },
  //添加打印量
  clickAdd: preventClick.noDoubleClick(function(e){
    if (!wx.getStorageSync("userId")) {
      let title = "用户id为空，请先登录";
      that.minTip(title)
      return;
    }
    if (this.data.equipment === "打印机") {
      this.datafortype("blackA3", this.data.currblackA3, this.data.blackA3);
      this.datafortype("blackA4", this.data.currblackA4, this.data.blackA4);
      this.datafortype("colorA3", this.data.currcolorA3, this.data.colorA3);
      this.datafortype("colorA4", this.data.currcolorA4, this.data.colorA4);
      this.canbeAdd();
    } else if (this.data.equipment !== "打印机") {
      if (this.data.bound - this.data.invalid_click < 0) {
        let title = "报废数量不可大于装订量"
        this.minTip(title);
        this.setData({
          invalid_click: ""
        });
        return;
      }
      this.islegal(this.data.bound);
      let invalid_click = this.data.bound;
      this.judgeMostDailyPrint("非打印机", this.data.bound);
    }
  },3000),
  // 判断该机器所选日期的后一天有没有历史记录，有则不可更新
  havenextDay: async function() {
    var _that = this
    var nextDate = _that.getNextDate(_that.data.currentDate, 1);
    let res = await apiRequest("/productionManagement/getHistoryByDay", "GET", {
      nickName: _that.data.currentMachines,
      printDate: nextDate
    });
    if (res.data.result.length !== 0) {
      let title = "此日期打印量不可更新！";
      this.minTip(title);
      _that.setData({
        text: "",
        invalid_click: " "
      });
    } else {
      _that.putPrint();
    }
  },
  addPrint: async function(hasPrintDate, currentDate, type) {
    let res = await apiRequest("/productionManagement/addPrint", "POST", {
      machineId: this.data.machineId,
      currentDate: currentDate, //有记录的那一天时间
      startDate: hasPrintDate,
      endDate: this.data.currentDate,
      addat: util.getNowDate(),
      addby: wx.getStorageSync("userId"),
      category: this.data.equipment,
      type: type
    })
    if (res.data.status == "404") {
      this.minTip(res.data.msg);
      return;
    }
    if (res.data.status == "200") {
      this.minTip(res.data.msg);
      let data = res.data.result
      this.convertData(data);
    }
  },
  putPrint: function() {
    var _that = this;
    let print = {
      machineId: _that.data.machineId,
      printDate: _that.data.currentDate,
      addat: util.getNowDate(),
      addby: wx.getStorageSync("userId"),
      category: _that.data.equipment,
      invalid_click: _that.data.invalid_click,
      type: _that.data.newType
    }

    if (_that.data.equipment === "打印机") {
      apiRequest("/productionManagement/addClick", "POST", print).then(res => {
        if (res.data.status == "404") {
          _that.minTip(res.data.msg);
          return;
        }
        _that.minTip(res.data.msg);
        _that.toCount();
      });
    } else {
      apiRequest("/productionManagement/addClick", "POST", {
        machineId: _that.data.machineId,
        printDate: _that.data.currentDate,
        addat: util.getNowDate(),
        addby: wx.getStorageSync("userId"),
        category: _that.data.equipment,
        invalid_click: _that.data.invalid_click,
        last_day_click: _that.data.bound,
      }).then(res => {
        if (res.data.status == "404") {
          _that.minTip(res.data.msg);
          return;
        }
        _that.minTip(res.data.msg);
        _that.toCount();
      });
    }

  },

  //定时器跳转首页
  toCount() {
    var _that = this
    var timer = setTimeout(function() {
      wx.reLaunch({
        url: "../count/count?printDate=" +
          _that.data.currentDate +
          "&workCenter=" +
          app.globalData.workCenter +
          "&nickName=" +
          _that.data.currentMachines +
          "&centerIndex=" +
          app.globalData.centerIndex +
          "&category=" +
          _that.data.equipment
      });
    }, 2000);
  },
  //取消
  close: function() {
    var _that = this;
    _that.setData({
      currentPrint: "请输入当前打印量",
      text: "",
      addby: "",
      lastPrint: ""
    });
    wx.reLaunch({
      url: "../count/count?workCenter=" + _that.data.workCenter
    });
    _that.getDate();
  },
  //获取当前日期时间
  getDate: function() {
    var time = util.formatTime(new Date(), 0);
    this.setData({
      adddate: time,
      date: time
    });
  },
  getMachineBypro: async function() {
    var _that = this;
    let res = await apiRequest("/productionManagement/getMachineBypro", "GET", {
      workName: _that.data.workCenter
    })
    if (res.data.status == "404") {
      _that.minTip(res.data.msg);
      return;
    }
    var newArray = ["请输入"];
    if (res.data.result[0] && res.data.result[0].item) {
      let data = res.data.result[0].item;
      for (var i in data) {
        newArray.push(data[i].nickName);
      }
      _that.setData({
        array: newArray,
        index: 0
      });
      if (newArray.length != 0 && _that.data.option === 1) {
        var index = _that.data.array.findIndex(val => {
          return val == _that.data.currentMachines;
        });
        _that.setData({
          index: index
        });
      } else if (newArray.length !== 0 && _that.data.option === 0) {
        _that.setData({
          index: 0,
          currentMachines: "请输入"
        });
        if (typeof _that.data.currentMachines == "undefined") {
          return;
        } else if (_that.data.currentMachines == "请输入") {
          return;
        } else {
          _that.getRecordByMachine();
          _that.getCategoryByNick();
        }
      }
    }
  },
  //将毫秒转换为日期
  changeTime: function(time) {
    var oDate = new Date(time * 1),
      oYear = oDate.getFullYear(),
      oMonth = oDate.getMonth() + 1,
      oDay = oDate.getDate(),
      oTime = oYear + "-" + this.getBz(oMonth) + "-" + this.getBz(oDay); //拼接时间
    this.setData({
      preDate: oTime
    });
  },
  getBz(num) {
    if (parseInt(num) < 10) {
      num = "0" + num;
    }
    return num;

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var getDateM = new Date(this.data.date).getTime();
    var preDate = parseInt(getDateM) - parseInt(24 * 60 * 60 * 1000);
    var getDateR = new Date(preDate);
    this.changeTime(getDateR);
    this.getHistoryByMachine(this.data.preDate);
    this.setData({
      workCenter: app.globalData.workCenter
    });
    this.getMachineBypro();
    if (this.data.equipment == "打印机") {
      this.setData({
        displayP: "block",
        displayN: "none"
      });
    } else {
      this.setData({
        displayP: "none",
        displayN: "block"
      });
    }
  },
  /*
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
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