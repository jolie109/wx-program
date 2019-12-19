/*
 * @Author: your name
 * @Date: 2019-11-13 14:49:28
 * @LastEditTime: 2019-11-18 10:11:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /wechat/e-portWX/utils/http.js
 */
const apiRequest = (url, method, data) => {
  const app = getApp()
  //接收所需要的参数，如果不够还可以自己自定义参数
  let promise = new Promise(function (resolve, reject) {
    // https://et.belstar.com.cn/api  这是线上地址
    var api ='http://172.18.1.191:3000'
    wx.request({
      url: api+url,
      data: data ? data : null,
      method: method,
      header: { 'authorization': wx.getStorageSync('eletoken') },
      success: function (res) {
        if (res.data.status == "401") {
          wx.removeStorageSync('eletoken');
          wx.request({
            url: api+'/users/refreshToken',
            //服务器的地址，现在微信小程序只支持https请求，所以调试的时候请勾选不校监安全域名
            header: {
              'content-type': 'application/json'
            },
            method: "GET",
            success: function (res) {
              wx.setStorageSync('eletoken', res.data.token);
              // apiRequest(url, method, data)
              if (wx.getStorageSync('eletoken') && url !=='/users/wxReg'){
                wx.request({
                  url: api + url,
                  data: data ? data : null,
                  method: method,
                  header: { 'authorization': wx.getStorageSync('eletoken') },
                  success:function(res){
                    resolve(res);
                  }
                })
              }
            }
          })

        } else {
          resolve(res);
        }
        //接口调用成功
        //根据业务需要resolve接口返回的json的数据
      },
      fail: function (res) {
        // fail调用接口失败
        reject({ errormsg: '网络错误,请稍后重试', code: -1 });
      }
    })
  });
  return promise;  //注意，这里返回的是promise对象
}
module.exports = apiRequest