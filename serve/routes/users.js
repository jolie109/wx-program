/*
 * @Author: your name
 * @Date: 2019-11-26 10:03:10
 * @LastEditTime: 2019-12-05 09:20:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /eportal11.26/eportalBackend/routes/users.js
 */

var express = require('express');
var router = express.Router();
var request=require('request');
var mongoose = require('mongoose');
var WXBizDataCrypt = require('../utils/WXBizDataCrypt.js')
var settoken = require('../utils/token_vertify.js');
var session = require('express-session');
var Users = require('../models/admin/users.js');
var WorkCenters = require('../models/productionManagement/workCenter');
var ObjectId = mongoose.mongo.ObjectId;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//用户登录比对是否有权限登录
router.post('/wxReg', function(req, res, next) {
  let code = req.body.code
  // const APP_ID = 'wx3761a5c916a37844';
  // const APP_SECRET = '2013a73f4b74b0d5bec0e46fb30d8248';
  const APP_ID = 'wxcf0528db896ba86c';
  const APP_SECRET = '8bf21be806fd5877d765e3fdfb72b929';
  let options = {
      url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + APP_ID + '&secret=' + APP_SECRET + '&js_code=' + code + '&grant_type=authorization_code',
      method: 'GET'
};
  request(options,function(error,response,body){
  if(!error && response.statusCode === 200){	//通过前端传过来的code获取sessionKey
          var bodyJson = JSON.parse(body);
          var sessionKey = bodyJson.session_key;
          if(!sessionKey){
            return res.json({
              status:"404",
              msg:"没有unionid"
            });
          }
    if(bodyJson.unionid)return ;//用户如果有关注公众号可以直接获取到，不用再进行解密
    //获取到sessionKey后，开始进行解密，获取uninoid
    var encryptedData =req.body.encryptedData.replace(/ /g,'+');	//要把空格替换成+，不然会报错，因为前端数据传到后端时+号会被解析成空格，要再换回去
          var iv = req.body.iv.replace(/ /g,'+');
    var pc = new WXBizDataCrypt(APP_ID, sessionKey);
          var parseData = pc.decryptData(encryptedData , iv);
          var unionId = parseData.unionId
              Users.findOne({unionid:unionId}, function(err, doc) {
                        if (err) 
                        return res.json({
                          status:"404",
                          msg:"没有unionid"
                        });
                            if (doc) {
                              var workcenterIds=doc.workCenterId;
                                WorkCenters.find({}).then(data=>{
                                  var WorkCenter=[];
                                 if(data){
                                  workcenterIds.forEach(el=>{
                                    data.forEach(item=>{
                                      if(el.toString() ==  mongoose.Types.ObjectId(item._id).toString()){
                                        WorkCenter.push(item.workName)
                                      }
                                    })
                                  })
                                 }
                                settoken.setToken(parseData.openid).then((data)=>{
                                  return res.json({ 
                                      token: 'Bearer '+data,
                                      status: '200',
                                      msg: '登录成功',
                                      result: WorkCenter,
                                      userId:doc._id,
                                      role:doc.name
                                       });
                              })
                                })
                                 
                            } 
                            else {
                              return res.json({
                                    status: '402',
                                    msg: '没有小程序登录权限'
                                })
                            }
                    })
    
  }
})   
});
router.get('/refreshToken',function(req,res){
  settoken.setToken('etr8499302he3910').then((data)=>{
    return res.json({ 
        token: 'Bearer '+data
         })
})
})
router.get('/getUserInfo',function(req,res){
  const userId = req.query.userId
  let workName=[]
  Users.findOne({_id:ObjectId(userId)}).then(doc=>{
    if(doc){
      var workcenterIds=doc.workCenterId;
      WorkCenters.find({_id:{$in:workcenterIds}}).then(data=>{
        console.log(data)
        if(!data.length){
          return res.json({
            status:'404',
            msg:'打印中心不存在',
            result:[]
          })
        }
        data.forEach(da=>{
          workName.push(da.workName)
        })
        res.json({
          status:'200',
          msg:'查询成功',
          result:workName
        })
     })
    }else{
      res.json({
        status:'404',
        msg:'当前用户不存在',
        result:[]
      })
    }
})
})
module.exports = router;