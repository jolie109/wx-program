//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    log:''
  },
  onLoad: function (options) {
    if(options.msg){
      this.setData({
        log:'机器id不存在'
      })
      return;
    }
    this.setData({
      log:'没有unionid,请先在eportal绑定微信号'
    })
  }
})
