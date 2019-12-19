var express = require('express');
var router = express.Router();
//EMS加密
var crypto = require('crypto');
//发送http请求
var request = require('request');
//京东加密
// var md5=require('md5-node');
//顺丰读取文件
const fs = require('fs');
//顺丰发送请求sdk
// const httpClient = require('../lib/httpClient')
//顺丰xml转json
var parser = require('xml2json');
//--------测试邮政EMS加密---------
// var hash = crypto.createHash('SHA256').update("app_key8bd10fea96a9343253009a00ea312207formatjsonmailNo1042730740530methodems.inland.trace.querytimestamp2014-09-03 16:57:50versionV3.0145a9fdfbea2b22d8cbdf559f419d69ba").digest('base64');
// console.log(hash);
//--------顺丰测试运单号、转json---------
//SF7444400554417
//SF7444400554375
const SFURL = 'http://bsp-oisp.sf-express.com/bsp-oisp/sfexpressService'
//顺丰xml转json
// xml to json
var options = {
  object: true,
  reversible: true,
  coerce: true,
  sanitize: true,
  trim: true,
  arrayNotation: true,
  alternateTextNode: true
};
const checkcode = '4b1mfs6q4m6GMq3IeE3B2D5LJUjkUNLW'
/* POST 顺丰 */
router.post('/sf', function (req, res, next) {
  var mailNo = req.body.mailNo;
  var reqxml = "<Request service='RouteService' lang='zh-CN'><Head>LGF_PhnUL</Head><Body> <RouteRequest tracking_type='1' method_type='1' tracking_number='444000092338'/></Body></Request>"
  var myReqXml = reqxml.replace(/444000092338/, mailNo)
  //加密生成verifyCode;
  const md5 = crypto.createHash('md5');
  var verifyCode = md5.update(myReqXml + checkcode, 'utf8').digest('base64');
  request.post(SFURL, {
    form: {
      "xml": myReqXml,
      "verifyCode": verifyCode
    }
  }, function (error, response, body) {
    if (error) {
      console.error(`请求遇到问题: ${error}`);return;
    }
    var json = parser.toJson(body, options);
    var result = json.Response[0].Body;
    var mailNoArr = mailNo.split(',');
    /**
     * 分2种情况
     * 1、查询的单号都没有数据的时候(if)
     * 2、查询的单号有的有数据有的无数据(else)
     *  */ 
    if (!result[0].hasOwnProperty("RouteResponse")) {
      var RouteResponse = [];
      mailNoArr.forEach((currNo, index) => {
        RouteResponse.push({
          "mailno": currNo,
          "Route": []
        })
      })
      result[0].RouteResponse = RouteResponse;
    }else{
      mailNoArr.forEach((element, index) => {
        let isHave = false;
        result[0].RouteResponse.forEach(currData => {
          // 循环所有的单号与请求返回的数据中的单号对比，若返回的数据中有该单号，则不执行下面的if(因为该单号有数据，所以不需要再添加)
          if (currData.mailno === element) {
            isHave = true;
          }
        });
        if (!isHave) {
          // 查询的单号没有数据的时候要添加单号和空数组（Route[]）
          result[0].RouteResponse.splice(index, 0, {
            mailno: element,
            Route: []
          })
        }
      });
    }
    res.json({
      status: "200",
      msg: "SF查询成功",
      result: result
    });
  })
});


/* POST 邮政EMS */
//--------EMS测试运单号---------
//1101428676285
//1042730740530
const EMSURL = 'http://60.205.8.187:18001/api/gateway'
const APP_KEY = '8bd10fea96a9343253009a00ea312207'
const FORMAT = 'json'
const METHOD = 'ems.inland.trace.query'
const VERSION = 'V3.01'
const APP_SECRET = '45a9fdfbea2b22d8cbdf559f419d69ba'
var timestamp = Math.round(new Date().getTime() / 1000); // 时间戳
//生成签名算法
function getSign(mailNo) {
  var ret = {
    app_key: APP_KEY,
    format: FORMAT,
    mailNo: mailNo,
    method: METHOD,
    timestamp: timestamp,
    version: VERSION
  }
  var str1 = raw(ret)
  var str2 = str1 + APP_SECRET
  var hash = crypto.createHash('SHA256').update(str2).digest('base64');
  return hash

}
//拼装字符串
function raw(args) {
  var keys = Object.keys(args);
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key] = args[key];
  });

  var str = '';
  for (var k in newArgs) {
    str += k + newArgs[k];
  }
  return str;
};

router.post('/ems', function (req, res, next) {
  (async function () {
    var mailArr = req.body.mailNo.split(",");
    var traceArr = [];
    for (let i = 0; i < mailArr.length; i++) {
      var emsData = {
        app_key: APP_KEY,
        format: FORMAT,
        mailNo: mailArr[i],
        method: METHOD,
        timestamp: timestamp,
        version: VERSION,
        sign: getSign(mailArr[i])
      }
      await new Promise((resolve, reject) => {
        request.post({
          url: EMSURL,
          form: emsData
        }, function (error, response, body) {
          var result = JSON.parse(body);
          resolve(traceArr.push(result));
        })
      })
    }       
    var show = false;
    for (const iterator of traceArr) {
      if (iterator.success == "T") {
        show = true
      }
    }
    if (show == true) {
      res.json({
        status: 200,
        msg: "邮政EMS查询成功",
        result: traceArr
      })
    } else {
      res.json({
        status: 500,
        msg: "邮政EMS查询失败"
      })
    }

  })()
});

// 京东
//--------京东测试运单号---------
//VC44876421656
const JDURL = 'https://api.jd.com/routerjson'
const JDMETHOD = 'jingdong.ldop.receive.trace.get'
const JDAPP_KEY = '9900C32CE99583E39FF910ACE7541A83'
const JDVERSION = '2.0'
var jd_access_token = '0547ed0583fa4079a0d18a18c782f94bn2vk'
router.get('/jd', function (req, res, next) {
  (async function () {
    var mailArr = req.query.mailNo.split(",");
    var traceArr = [];
    for (let i = 0; i < mailArr.length; i++) {
      var jdData = {
        app_key: JDAPP_KEY,
        mailNo: mailArr[i],
        method: JDMETHOD,
        access_token: jd_access_token,
        v: JDVERSION,
        "customerCode": "020L2238",
        "waybillCode": mailArr[i]
      }
      await new Promise((resolve, reject) => {
        request.get({
          url: JDURL,
          qs: jdData
        }, function (error, response, body) {
          var result = JSON.parse(body);
          resolve(traceArr.push(result.jingdong_ldop_receive_trace_get_responce.querytrace_result));
        })
      })
    }
    var show = false;
    for (const iterator of traceArr) {
      if (iterator.messsage == "成功") {
        show = true;
      }
    }
    if (show == true) {
      res.json({
        status: "200",
        msg: "京东查询成功",
        result: traceArr
      });
    } else {
      res.json({
        status: "500",
        msg: "京东查询失败"
      })
    }
  })()
});

// 中通
//--------中通测试运单号---------
//680000000000
//680000000001
const ZTURL = "http://japi.zto.cn/traceInterfaceNewTraces";
const company_id = "9b9fda2af1d94de2957b2aa1ebb53de0";
const key = "14230f9d5e55";
const msg_type = "NEW_TRACES"
// 签名计算
function getSignZT(mailNo) {
  var requestBody = {
    company_id: company_id,
    msg_type: msg_type,
    data: mailNo
  };
  /**
   * 待签名字符串按照如下方式拼接： 
   * 业务参数的参数名和参数值以“=”分隔，多个业务参数之间之间以“&”分隔，然后拼接，
   * 在最后再拼接上签名KEY
   *  */
  var query_string = [];
  for (let k in requestBody) {
    query_string.push(k + "=" + requestBody[k]);
  };
  var str_to_digest = query_string.join("&") + key;
  return data_digest = crypto.createHash('md5')
    .update(str_to_digest)
    .digest('base64');
}

router.post('/zto', function (req, res, next) {
  var variable = '["' + req.body.mailNo + '"]';
  var mailNo = variable.split(",").join('","');
  var sign = getSignZT(mailNo);
  var ztoData = {
    company_id: company_id,
    msg_type: msg_type,
    data: mailNo
  }
  request.post({
    url: ZTURL,
    form: ztoData,
    headers: {
      "x-companyId": company_id,
      "x-dataDigest": sign
    }
  }, function (error, response, body) {
    var mailNoArr = JSON.parse(mailNo)
    var result = JSON.parse(body);
    // 以下2个循环是处理当查询的单号中没有数据时也要显示单号和traces:[]
    mailNoArr.forEach((element, index) => {
      let isHave = false;
      result.data.forEach(currData => {
        if (currData.billCode === element) {
          isHave = true;
        }
      });
      if (!isHave){
        result.data.splice(index, 0, {
          billCode: element,
          traces: []
        })
      }
    });
    if (!error) {
      res.json({
        status: "200",
        msg: "中通ZTO查询成功",
        result: result.data
      });
    } else {
      res.json({
        status: "500",
        msg: "中通ZTO查询失败"
      });
    }
  })
});
module.exports = router;