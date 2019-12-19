var express = require('express');//加载模块

var router = express.Router();//引用router

var request = require('request');
var querystring = require('querystring');
//引入微信授权
var wxAuth = require('./wxAuth');
//引用数据模块

var mongoose = require('mongoose');
var ObjectId = mongoose.mongo.ObjectId;
var Users = require('../models/admin/users.js')
var Role = require('../models/admin/role.js')
var Acl = require('../models/admin/acl.js')

var settoken = require('../utils/token_vertify');

//验证码
var svgCaptcha = require('svg-captcha');
var session = require('express-session');
function randomCode(length) {
    var chars = ['0','1','2','3','4','5','6','7','8','9'];
    var result = ""; //统一改名: alt + shift + R
    for(var i = 0; i < length ; i ++) {
        var index = Math.ceil(Math.random()*9);
        result += chars[index];
    }
    return result;
}
var smsCode="123456"
router.get('/getCode',function(req, res, next){
    var phone=req.param('phone');
    var code=randomCode(6);
    Users.findOne({ 'tel': phone }, function (err, docs) {
        if(err){
          console.log(err.message);
        }else{
            if(docs){
    //          var queryData = querystring.stringify({
    //     "mobile": phone,  // 接受短信的用户手机号码
    //     "tpl_id": "195990",  // 您申请的短信模板ID，根据实际情况修改
    //     "tpl_value":`#code#=${code}`,  // 您设置的模板变量，根据实际情况修改
    //     "key": "5414e2d055b4224318d5bf96cd5556ac",  // 应用APPKEY(应用详细页查询)
    // });
    // var queryUrl = 'http://v.juhe.cn/sms/send?'+queryData;
    // request(queryUrl, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
   
    //         smsCode=code
    //           var jsonObj = JSON.parse(body); // 解析接口返回的JSON内容

    //           res.json({
    //             status:"200",
    //             result:docs.tel
    //         })
    //     } else {
      
    //         res.json({
    //           status:"400",
    //           msg:'请求异常'
    //           })
    //     }
    // })  
    res.json({
      status:"200",
      result:docs.tel
  })
        }else{
            res.json({
                status:"400",
                result:"你还不是本系统用户！"
            })
        }
    }
    });   
});
//验证图片验证码
router.post("/login_captcha",function(req,res,next){
     var captcha=req.body.captcha;
     if(captcha.toLowerCase()!=req.session.codes){
        return res.json({
            status:503,
            msg:"验证码错误"
        })
     }else{
        return res.json({
            status:200,
            msg:""
        })
     }
})
router.post('/login_code', function (req, res, next) {
    var phone = req.body.phone;
    var code = req.body.code;
    var captcha=req.body.captcha ;
    if (smsCode!=code) {
        return res.send({
            code: 1, 
            msg: '短信验证码错误'
        });
      }else{
        settoken.setToken(phone).then((data)=>{
            return res.json({ 
                token: 'Bearer '+data,
                code: 0, 
                data: 
                {_id: 2,
                phone: phone
                }
                 });
        })
      }
    
})
//验证码登录后没有绑定微信，点击微信绑定的时候调用此接口
//验证码登录后没有绑定微信，点击微信绑定的时候调用此接口
router.post('/getToken',function(req,res,next){
    var phone=req.body.phone;
    var url=req.body.url;
    //获取token
    var options = {
        url: url,
        method: 'GET'
  };
  function callback(error, response, data) {
      if(error){
          console.log(err.message)
      }else{
         var access_token=JSON.parse(response.body).access_token;
          var openid=JSON.parse(response.body).openid;
          var uri=`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
          var options = {
            url: uri,
            method: 'GET'
      };
      function cal(err,ress){
          if(err){
              console.log(err)
          }else{  
            var data={
                tel:phone,
                openid: JSON.parse(ress.body).openid,
                nickname: JSON.parse(ress.body).nickname,
                sex: JSON.parse(ress.body).sex,
                headimgurl: JSON.parse(ress.body).headimgurl
               } 
           Users.updateOne({"tel":phone},data,function(err,res){
               if(err){
                   console.log(err)
               }else{
               }
           })
          
    return res.send(Object.assign({tel:phone},JSON.parse(ress.body))); 
          }
      }
      request(options, cal);
      }
}
 request(options, callback);
 
})
//判断是否有权限扫码
router.post('/isAuth',function(req,res,next){
    var url=req.body.url;

    //获取token
    var options = {
        url: url,
        method: 'GET'
  };
  function callback(error, response, data) {
      if(error){
          console.log(err)
      }else{
         var access_token=JSON.parse(response.body).access_token;
          var openid=JSON.parse(response.body).openid;
          var uri=`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
          var options = {
            url: uri,
            method: 'GET'
      };
      function cal(err,ress){
          if(err){
              console.log(err)
          }else{  
            var openid=JSON.parse(ress.body).openid;
             
    return JSON.parse(ress.body)
          }
      }
      Users.findOne({openid:openid}, function(err, doc) {
        if(err){
            console.log(err)
        }else{
           
            if(doc){
                request(options, cal);
                settoken.setToken(doc.tel).then((data)=>{
                  return res.send( {
                    status:"200",
                    msg:"老用户登录成功",
                    result:doc,
                    data:'Bearer '+data,
                   
                }) 
              })
               
            }else{
                return res.send({
                    status: '201',
                    msg: '请使用验证码登录绑定微信',
                    result:{}
                }) 
            }
  
        }

    })
     
      }
}
 request(options, callback);
 
})
// 获得用户的信息首页用
router.get('/myinfo',function(req,res,nexr){
  var phone=req.data.phone
  Users.findOne({"tel":phone},function(err,data){
    if(err){
      res.json({
        status:"500",
        message:"服务器错误",
      })
    }
    if(data){
    
   res.json({
    status:"200",
    result:data
  })
    }else{
      res.json({
        status:"400",
       msg:"未找到该用户"
      })
    }
  })
})
// 获得用户的roles
router.get('/userInfo',function(req,res,nexr){
    var phone=req.data.phone
    Users.findOne({"tel":phone},function(err,data){
      if(err){
        res.json({
          status:"500",
          message:"服务器错误",
        })
      }
      if(data){
        var resultArr=[];
       Role.find({'_id': {$in:data.roles_id}},function(err,data1){
     data1.forEach(item=>{
     resultArr.push(item._id)
     })
     res.json({
      status:"200",
      result:resultArr
    })
    })
      }else{
        res.json({
          status:"400",
         msg:"未找到该用户"
        })
      }
    })
})
//获得用户的acls
router.get('/role',function(req,res,nexr){
var select=req.query.myrole
var insert=[]
if(select){
select.forEach(element => {
  insert.push( ObjectId(element))
})
Role.find({"_id":{$in:insert}},function(err,data){
if(err){
    console.log(err);
}else{
  var result=[]
  data.forEach(item=>{
   result=result.concat(item.acls_id)
  })
  Acl.find({"_id":{$in:result}},function(err,data2){
    res.json({
      status: '200',
      result:data2,
  })
  })
}
})
}else{
  res.json({
    status: '200',
    result:[],
})
}
})
router.get('/getQrCode',wxAuth.getCode);
router.get('/getAccess',wxAuth.getAccessToken)
router.get('/getUserInfo',wxAuth.getUserInfo)
/*
  一次性图形验证码
   */
  router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create({
      ignoreChars: '0o1l',
      noise: 2,
      color: true
    });

    req.session.codes=captcha.text.toLowerCase();
    res.type('svg');
    res.send(captcha.data)
  });
module.exports = router;
//暴露路由
