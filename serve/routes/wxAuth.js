//微信公众号的appId和appSecret配置文件
var Users = require('../models/admin/users')
const request = require('request')
const Host = 'http://example.com'
var settoken = require('../utils/token_vertify');

exports.getCode = (req, res, next) => {
    if (req.cookies && req.cookies.openid) {
        next();
    } else {
        let appid='wx3761a5c916a37844';
        if(req.query.redirect_uri =='http://localhost/#/conctWchat'){
            let redirect_uri  = encodeURIComponent(req.query.redirect_uri );
            let  url = 'https://open.weixin.qq.com/connect/qrconnect?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_login#wechat_redirect';
        res.send({url:url}) 
        }else{
        let redirect_uri  = encodeURIComponent(req.query.redirect_uri );
        // const redirect_uri = encodeURIComponent('http://localhost/#/authredirect') 
        let  url = 'https://open.weixin.qq.com/connect/qrconnect?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_login#wechat_redirect';

        res.send({url:url})
        }
    }
}

exports.getAccessToken = (req, res, next) => {
    let APPID='wx3761a5c916a37844';
   let SECRET='331af64db81e91104147434bc80157f5'

    let code = req.query.code;

    var url=`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APPID}&secret=${SECRET}&code=${code}&grant_type=authorization_code`
    request(url, (error, response, body) => {
        let result = JSON.parse(body);

        req.access_token = result.access_token;
        req.openid = result.openid;
        res.send(result)
    });
}

exports.getUserInfo = (req, res, next) => {

    var tel=req.query.tel;
    let access_token = req.query.access_token;
    let openid = req.query.openid;

    var url=`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    request(url, (error, response, body) => {
        let result = JSON.parse(body);

        var data={
            tel:tel,
            openid: result.openid,
            nickname: result.nickname,
            sex: result.sex,
            headimgurl: result.headimgurl,
            unionid :result.unionid,
           } 
       Users.updateOne({"tel":tel},data,function(err,doc){
           if(err){
               console.log(err)
           }else{
            res.send({result:doc})
           }
       })
      
        

    });
}