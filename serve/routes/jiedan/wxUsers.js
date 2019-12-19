var express = require('express');
var router = express.Router();
var wxUser = require('../../models/jiedan/wxUser')
var request = require('request');
var wxGoods = require('../../models/jiedan/goods')
require( './../../util/util');

var md5=require('md5-node');
var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../../config/mailconfig.js')

var fs = require('fs');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();

smtpTransport = nodemailer.createTransport(smtpTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
}));
var sendMail = function (recipient, subject, html) {
 
    smtpTransport.sendMail({
 
        from: config.email.user,
        to: recipient,
        subject: subject,
        html: html
 
    }, function (error, response) {
        if (error) {
            console.log(error);
        }
        console.log('发送成功')
    });
}
//测试发送订单提醒邮件
router.get('/a',function(res,req,next){
    sendMail('1844883911@qq.com','您有新的已发货订单！', '请登录后台管理系统查看');
})

    /* GET users listing. */

//用户注册加登录状态
router.post('/wxReg', function(req, res, next) {
    var code = req.body.code
    const APP_ID = 'wx661649acca0bd494';
    const APP_SECRET = 'e12c0a6f0cb67e043c4b591f80ce2d5d'
    var options = {
        url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + APP_ID + '&secret=' + APP_SECRET + '&js_code=' + code + '&grant_type=authorization_code',
        method: 'GET'
  };
  request(options, callback);
  function callback(error, response, data) {
      if (!error && response.statusCode == 200) {
          var openId=JSON.parse(data).openid
        wxUser.findOne({openId:openId}, function(err, doc) {
            if (err) {
                console.log(err);
            } 
            else {
                if (doc) {                   
                    res.json({
                        status: '200',
                        msg: '老用户登录成功',
                        result: openId
                    })
                } 
                else {
                    var user = {
                      openId:openId
                    }
                    wxUser(user).save(function(err, data) {
                        if (err) {
                            res.json({
                                status: '503',
                                msg: '登录失败',
                                result: ''
                            })
                        } 
                        else {
                            res.json({
                                status: '200',
                                msg: '登录成功',
                                result:openId
                            })
                        }
                    })
    
                }
            }
        })
    
      }
  }
  
});
//商品列表
router.get("/wxGetProductList",function(req,res){

    wxGoods.find({},function(err,doc){
        if(doc){
            res.json({
                status:'200',
                msg:"获取列表成功",
                result:doc
            })
        }else{
            res.json({
                status:"404",
                result:''
            })
        }
    })

})


//模糊查询产品
router.post("/wxSearchProduct",function(req,res){
     searchquery=new RegExp(req.body.productName);
     wxGoods.find({productName: searchquery}).then(doc=>{
         if(doc){
            res.json({
                status:'200',
                msg:"查询数据成功",
                result:doc
            })
         }else{
            res.json({
                status:'404',
                msg:"无数据",
                result:''
            })
         }
     })
})
//点击跳转详情界面 按id来实现
router.post("/toProductDetail",function(req,res){
    let productId=req.body.productId
    wxGoods.find({"productId":productId}).then(doc=>{

        if(doc){
            res.json({
                status:"200",
                msg:"success",
                result:doc
            })
        }else{
            res.json({
                status:"404",
                msg:"err",
                result:''
            })
        }
    })
})
router.get('/getDetailTypeByName',function(req,res){
    let productId=req.query.productId;
    var metiralName=req.query.metiralName;
    wxGoods.findOne({"productId":productId}).then(doc=>{
        doc.metiralType.forEach(item=>{
            if(metiralName==item.metiralName){

                res.json({
                    status: '0',
                    msg: '',
                    result: item
                })
            }
        })

        
    })
})

//查询购物车商品
//查找商品
router.get('/cart', function(req, res, next) {
    let openId=req.query.openId
    wxUser.findOne({ openId: openId }, function(err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                res.json({
                    status: '0',
                    msg: '',
                    result: doc.cartList
                })
            }
        }
    })
})
//商品添加购物车·
router.post('/cart', function(req, res, next) {
    let openId=req.body.openId
    let productId = req.body.productId
    let productNum=Number(req.body.productNum)
    let metiralName=req.body.metiralName
    let pageWeight = req.body.pageWeight;
    let pageType = req.body.pageType;
    let singlePrice=req.body.singlePrice;
    let wy = []
    wxUser.findOne({ openId: openId })
        .then(function(doc) {
            if (doc) {
                wy = doc
                gooditem = ''
                wy.cartList.forEach(function(item) {
                    if (item.productId == productId&&item.pageType==pageType&&item.pageWeight==pageWeight&&item.metiralName==metiralName) {
                        gooditem = item
                        item.productNum=Number(productNum)+Number(item.productNum)
                    }
                })
                if (gooditem) {
                    return wy.save()
                        .then(function() {
                            res.json({
                                status: '0',
                                msg: '',
                                result: 'successfully'
                            })
                        })
                } else {
                    return wxGoods.findOne({ productId: productId })
                        .then(function(doc2) {
                            newdoc = { //新创建一个对象，实现转换mongoose不能直接增加属性的坑
                                productNum: productNum,
                                checked:false,
                                productId: doc2.productId,
                                productName: doc2.productName,
                                salePrice: Number(singlePrice),
                                 metiralName:req.body.metiralName,
                                 pageWeight :req.body.pageWeight,
                                 pageType :req.body.pageType,
                                productImage:doc2.productImage
                            }
                            wy.cartList.push(newdoc)
                            
                            return wy.save()
                        })
                        .then(function() {
                            res.json({
                                status: '0',
                                msg: '',
                                result: 'successfully'
                            })
                        })
                }
            }
        }).catch(function(err) {
            console.log(err);
        })
})


//修改购物车商品
router.post('/changeCart', function(req, res, next) {
    let openId=req.body.openId
    let _id = req.body._id
    let productNum=Number(req.body.productNum)
    let pageType=req.body.pageType
    let pageWeight=req.body.pageWeight
    let metiralName=req.body.metiralName
    let singlePrice = req.body.singlePrice
    wxUser.findOne({ openId: openId })
        .then(doc => {
            if (doc) {
                doc.cartList.forEach(item => {
                    if (item._id == _id) {
                       item.productNum=productNum
                       item.pageType=pageType
                       item.pageWeight=pageWeight
                       item.metiralName=metiralName
                       item.salePrice = singlePrice
                    }                
                })
               
                doc.save(function(err, doc) {
                    if (err) {
                        res.json({
                            status: '1',
                            msg: err.message,
                            result: ''
                        })
                    } else {
                        res.json({
                            status: '0',
                            msg: '保存成功',
                            result:doc
                        })
                    }
                })
            }
        }).catch(err => {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        })
})

//删除购物车商品
router.delete('/cartDel', function(req, res, next) {
    let openId=req.body.openId
    let _id= req.body._id
    wxUser.findOne({ openId: openId },function(err,doc){
        _id.forEach((item,index)=>{
           doc.cartList.forEach((item2,index)=>{
               if(item==item2._id){
                   doc.cartList.splice(index,1)
               }
           })
        })
        doc.save(function(err,doc){
            if(err){
                res.json({
                    status:500,
                    result:err.message
                })
            }else{
                res.json({
                    status:200,
                    result:'删除成功'
                })
            }
        })
    })
})
// 更改购物车商品选中状态
router.post('/changeChecked', function(req, res, next) {
    let openId=req.body.openId
    let selarr= req.body.selarr
    wxUser.findOne({ openId: openId },function(err,doc){

        selarr.forEach((item,index)=>{
           doc.cartList.forEach((item2,index)=>{
               if(item._id==item2._id){
                   item2.checked=item.checked
               }
           })
        })
        doc.save(function(err,doc){
            if(err){
                res.json({
                    status:500,
                    result:err.message
                })
            }else{
                res.json({
                    status:200,
                    result:doc.cartList
                })
            }
        })

    })
})

//获取当前点击购物车商品的规格
router.get("/showProductChoose",function(req,res){
    let productId=req.param("productId")
    wxGoods.find({productId:productId},function(err,doc){
        if(doc){
            res.json({
                status:'200',
                msg:"获取列表成功",
                result:doc
            })
        }else{
            res.json({
                status:"404",
                result:''
            })
        }
    })
})
//删除去结算的商品
//订单部分
//查看全部订单
router.get('/orderList', function(req, res, next) {
    let openId=req.param('openId')
    wxUser.findOne({ openId: openId }, function(err, doc) {

        if(doc.orderList.length>0){
            res.json({
                status:200,
                msg:'success',
                result:doc.orderList
            })
             }else if(doc.orderList.length===0){
                res.json({
                    status:404,
                    msg:'没有订单',
                    result:''
                })
             }else if(err){
                 console.log(err)
             }
    })
})

//生成订单
router.post("/orders",function(req,res,next){
    let openId=req.body.openId
    let goods=req.body.goodsList
   let addressInfo=req.body.addressinfo
    let orderPrice=req.body.orderPrice
    let isInvoice=req.body.isInvoice
    let hasInvo=req.body.hasInvo
    let freightPay=req.body.freightPay
    let message=req.body.message
    let distributionType=req.body.distributionType
    let sinceAddress=req.body.sinceAddress  
    wxUser.findOne({openId:openId}).then(doc=>{
        if(doc){
            var goodsList=[]
            goods.forEach((item)=>{
                  goodsList.unshift(item)
            })
              var platform="189";
              var rand1=Math.floor(Math.random()*10);
              var rand2=Math.floor(Math.random()*10);
              var date=new Date().Format('yyyyMMddhhmmss');
              var orderId=platform+rand1+date+rand2
              var orderCreateDate=new Date().Format('yyyy-MM-dd hh:mm:ss');
              var newOrder={
                  orderId:orderId,
                  orderTotal:orderPrice,
                  addressInfo:addressInfo,
                  freightPay:freightPay,
                  message:message,
                  isInvoice:isInvoice,
                  hasInvo:hasInvo,
                  orderCreateDate:orderCreateDate,
                  goodsList:goodsList,
                  orderStatus:"1",//success
                  distributionType:distributionType,
                  sinceAddress:sinceAddress 
              }
              doc.orderList.push(newOrder)
              goodsList.forEach((item,index)=>{
                  doc.cartList.forEach((item2,index2)=>{
                      if(item._id==item2._id){
                          doc.cartList.splice(index2,1)
                      }
                  })
              })
              return doc.save(function(error,doc1){
                  if(error){
                      res.json({
                          status:"500",
                          msg:error.message,
                          result:''
                      })
                  }else{
                      res.json({
                          status:"200",
                          msg:"success",
                          result:newOrder
                      })
                
                  }
              })
        }
    })
})

//修改订单信息
router.post('/changeOrder', function(req, res, next) {
  let openId=req.body.openId;
  let hasInvo= req.body.hasInvo;
  let orderId = req.body.orderId;
  let isInvoice = req.body.isInvoice;
  var orderStatus = req.body.orderStatus;
  wxUser.findOne({openId:openId},function(err,doc){
         doc.orderList.forEach((item)=>{
             if(item.orderId==orderId){
                 item.hasInvo=hasInvo;
                 item.isInvoice = isInvoice
                 item.orderStatus=orderStatus
             }
         })
      doc.save(function(err,doc){
          if(err){
              res.json({
                  status:500,
                  result:err.message
              })
          }else{
              res.json({
                  status:200,
                  result:doc.orderList
              })
          }
      })

  })
})
//订单详情界面
router.post("/orderDetail",function(req,res){
    let orderId=req.body.orderId
    let openId=req.body.openId
    wxUser.findOne({openId:openId},function(err,doc){
        doc. orderList.forEach(item=>{
            if(item.orderId===orderId){
                res.json({
                    status:200,
                    msg:"success",
                    result:item
                })
            }
        })
    })
})

//全部订单，待发货，待付款，待收货

router.get("/orderTypeList",function(req,res){
    let openId=req.param("openId")
    let orderStatus=req.param("orderStatus")
    let list=[]
    wxUser.findOne({openId:openId},function(err,doc){
        if(doc){
        switch(orderStatus) {
            case "0":
                doc. orderList.forEach(item=>{
                           return list.unshift(item)
                        })
               break;
            case "1":
                doc. orderList.forEach(item=>{
                        if(item.orderStatus=="1"){
                            return list.unshift(item)
                        }
                })
               break;
            case "2":
                doc. orderList.forEach(item=>{
                        if(item.orderStatus=="2"){
                            return list.unshift(item)
                        }
                })
                break;
            case "3":
                    doc. orderList.forEach(item=>{
                            if(item.orderStatus=="3"){
                                return list.push(item)
                            }
                    })
                break; 
       } 

       res.json({
            result:list
        })
    }
    })
})
//生成发票信息
router.post("/invoice",function(req,res,next){
    let invoiceList=req.body.invoiceList;
        wxUser.findOne({ openId: invoiceList.openId})
            .then(doc => {
                if (doc) {
                    doc.invoiceList.push(invoiceList)
                    doc.save(function(err, data) {
                        if (err) {
                            res.json({
                                status: '1',
                                msg: err.message,
                                result: '添加发票失败'
                            })
                        } else {
                            res.json({
                                status: '0',
                                msg: '生成发票成功',
                                result: data
                            })
                        }
                    })
                
                }
            })
    })
    //按orderID获取订单信息
    router.get('/getOrderById',function(req,res){
        var orderId = req.query.orderId;
        var openId=req.query.openId;
        wxUser.findOne({openId:openId},function(err,doc){
            if(err){
                console.log(err)
                res.send(err)
            }else if(doc){
                doc.orderList.forEach(item=>{
                    if(item.orderId==orderId){
                        res.json({
                            status:200,
                            msg:"success",
                            result:item
                        })
                    }
                })

            }
        })

    })
//按orderID获取发票信息
router.get("/invoiceMsg",function(req,res){
    let orderId=req.param('orderId');
    let openId=req.param('openId');
    wxUser.findOne({openId:openId},function(err,doc){
      doc.invoiceList.forEach(item=>{
            if(item.orderId==orderId){
                res.json({
                    status:200,
                    msg:"success",
                    result:item
                })

            }else{
                res.json({
                    status:200,
                    msg:"success",
                    result:[]
                })
            }
      })
       })
});
//按开票状态获取发票信息
router.get("/getInvoiceByStatus",function(req,res){
    let status=req.query.status
    let openId=req.query.openId;
    var invoiceDatas;
    wxUser.findOne({openId:openId},function(err,doc){
    if(status=="true"){
         invoiceDatas = doc.orderList.filter(item=>{
            if(item.hasInvo!="0" && item.isInvoice==true && item.orderStatus !='1'){
                return item
            }
        })

    }else{
        invoiceDatas=  doc.orderList.filter(item=>{
            if(item.isInvoice==false && item.orderStatus !=1){
                return item ;
            }
        })
    }
      res.json({
        status:200,
        msg:"success",
        result:invoiceDatas
    })
       })
});
//地址接口
//获得用户地址接口 我的地址用
router.get('/wxaddressList', function(req, res, next) {
    var openId = req.param('openId')
    var param = {

         openId:openId
    }
    wxUser.findOne(param, function(err, doc) {
        if (err) {
            console.log('出错了');
        } else {
            if (doc) {
                res.json({
                    status: '200',
                    msg: '地址请求成功',
                    result: doc.addressList
                })
            } else {
                console.log('没有doc');
            }
        }
    })
});
//获取默认地址
router.get('/wxdefaultAddressList', function(req, res, next) {
    var openId = req.query.openId
    var param = {

         openId:openId
    }
    wxUser.findOne(param, function(err, doc) {
        if (err) {
            console.log('出错了');
        } else {
            if (doc) {
            doc.addressList.forEach(item=>{
                if(item.isDefault){
                    res.json({
                        status: '200',
                        msg: '默认地址请求成功',
                        result: item
                    })
                }
            })
            
            } else {
                console.log('没有doc');
            }
        }
    })
});
//添加地址
router.post('/wxaddressList', function(req, res) {
    var openId = req.body.openId
    var r4 = Math.floor(Math.random() * 100)
    var addressId = '1000' + r4
    var userName = req.body.userName
    var tel = req.body.tel
    var addressName = req.body.address
    var isDefault = req.body.isDefault
    wxUser.findOne({ openId: openId })
        .then(doc => {
            if (doc) {
                var address = {
                    addressId: addressId,
                    userName: userName,
                    tel: tel,
                    address: addressName,
                    isDefault: isDefault
                }
                doc.addressList.push(address)
                if(isDefault){
                    doc.addressList.forEach(item=>{
                        if(item.addressId==addressId){
                            item.isDefault=true
                        }
                        else{
                            item.isDefault=false
                        }
                    })
                }
                doc.save(function(err, data) {
                    if (err) {
                        res.json({
                            status: '1',
                            msg: err.message,
                            result: '添加地址失败'
                        })
                    } else {
                        res.json({
                            status: '0',
                            msg: '',
                            result: '添加地址成功'
                        })
                    }
                })
            
            }
        })
});
//修改地址
router.post('/changeAddress', function(req, res, next) {
    let openId = req.body.openId
    let addressId = req.body.addressId
    var userName = req.body.userName
    var tel = req.body.tel
    var addressName = req.body.address
    var isDefault = req.body.isDefault

    wxUser.findOne({ openId: openId })
        .then(doc => {
            if (doc) {
                doc.addressList.forEach(item => {
                    if(isDefault){
                        item.isDefault=false 
                  }
                    if (item.addressId == addressId) {
                       item.userName=userName
                       item.tel =tel
                       item.address=addressName
                       item.isDefault=isDefault
                    } 
                })
                doc.save(function(err, doc) {
                    if (err) {
                        res.json({
                            status: '1',
                            msg: err.message,
                            result: ''
                        })
                    } else {
                        res.json({
                            status: '0',
                            msg: '',
                            result: ''
                        })
                    }
                })
            }
        }).catch(err => {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        })
})
//删除地址
router.delete('/wxaddressList', function(req, res, next) {
        let openId=req.body.openId
        let addressId = req.body.addressId
        wxUser.update({ openId: openId }, {
            $pull: {
                "addressList": {
                    "addressId": addressId
                }
            }
        }, function(err, doc) {
            if (err) {
                res.json({
                    status: '1',
                    msg: err.message,
                    result: ''
                })
            } else {
                res.json({
                    status: '0',
                    msg: '',
                    result: 'successfully'
                })
            }
        })
    })

router.get('/pays',function(req,res){	//小程序微信支付
	let query = req.query;	
	let time = new Date().getTime();	//商户订单号
	let nonce_str = randomStr();
	let openid = query.openId;
    let total_fee = Number(query.money)*100;
	let appid = 'wx661649acca0bd494';	//自己的小程序appid
	let mch_id ='1546077831';	//自己的商户号id
	getOpenid(query.code,appid).then(function(res1){
		let sign = createSign({	//签名
			appid: appid,
			body: '微信支付，商品详细描述',
			mch_id: mch_id,
			nonce_str: nonce_str,
			notify_url: 'http://localhost:3000/users/payBack',
			openid: openid,
			out_trade_no: time,
			spbill_create_ip: '127.0.0.1',
			total_fee: total_fee,
			trade_type: 'JSAPI'
        });
		let reqUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
	
		let formData = `<xml>
							<appid>${appid}</appid>
							<mch_id>${mch_id}</mch_id>
							<nonce_str>${nonce_str}</nonce_str>
							<sign>${sign}</sign>
							<body>微信支付，商品详细描述</body>
							<out_trade_no>${time}</out_trade_no>
							<total_fee>${total_fee}</total_fee>
							<spbill_create_ip>127.0.0.1</spbill_create_ip>
							<notify_url>http://localhost:3000/users/payBack</notify_url>
							<trade_type>JSAPI</trade_type>
							<openid>${openid}</openid>
						</xml>`;
		request({
		    url: reqUrl,
		    method: "POST",
		    json: true,
		    headers: {
		        "content-type": "application/json",
		    },
		    body: formData
		}, function(error, response, body) { 
		    if (!error && response.statusCode == 200) {
		
		        xml2js.parseString(body,function(error,result){
	
                    let reData = result.xml;
		        	if(reData.nonce_str){
                        let responseData = {
                            timeStamp: new Date().getTime(),
                            nonceStr: reData.nonce_str[0],
                            package: reData.prepay_id[0],
                            paySign: reData.sign[0]
                          
                        }
                  
                        res.send(JSON.stringify(responseData))     
                    }
		        })
		    }
		}); 
		
	});
	
})
function getOpenid(code,appid){	//发起请求获取用户的openID
	return new Promise(function(resolve,reject){	
		request('https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret=e12c0a6f0cb67e043c4b591f80ce2d5d&js_code='+code+'&grant_type=authorization_code',function(error,response,body){
			if(!error && response.statusCode == 200){
                var bodyJson = JSON.parse(body)
                
				resolve(bodyJson.openid);
			}
		})
	})
}

function createSign(obj){	//签名算法（把所有的非空的参数，按字典顺序组合起来+key,然后md5加密，再把加密结果都转成大写的即可）
	var stringA = 'appid='+obj.appid+'&body='+obj.body+'&mch_id='+obj.mch_id+'&nonce_str='+obj.nonce_str+'&notify_url='+obj.notify_url+'&openid='+obj.openid+'&out_trade_no='+obj.out_trade_no+'&spbill_create_ip='+obj.spbill_create_ip+'&total_fee='+obj.total_fee+'&trade_type='+obj.trade_type;
	
	
	var stringSignTemp = stringA+'&key=beijingbaixingdianzibelstar12345';
		stringSignTemp = md5(stringSignTemp);
	var signValue = stringSignTemp.toUpperCase();
	return signValue
}
 
function randomStr(){	//产生一个随机字符串	
    var str = "";    
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
 	
 	for(var i=1;i<=32;i++){
 		var random = Math.floor(Math.random()*arr.length);
 		str += arr[random];
 	}
		
    return str;
}
module.exports = router;