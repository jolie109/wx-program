
var express = require('express');
var router = express.Router();
var wxUser = require('../../models/jiedan/wxUser')
var wxGoods = require('../../models/jiedan/goods')
var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../../config/mailconfig.js')
//加密
var crypto = require('crypto');
//发送http请求
var request = require('request');
//发送邮件 function
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
// 上传文件function
//获取时间
const multer = require('multer');
var moment = require('moment');
var timestamp = '';
var timepath = moment().format('YYYY-MM-DD');
var destination = '/public/';
var filename = '';

var storage = multer.diskStorage({
    //这里destination是一个字符串
    destination: '.' + destination,
    filename: function (req, file, cb) {
        //自定义设置文件的名字
        timestamp = new Date().getTime();
        filename = 'upload-' + timestamp + '.' + file.originalname.split('.')[1];
        cb(null, filename)
    }
});

var upload = multer({
    storage: storage
});

//查询 未发货
router.get('/unshippedOrderList', function (req, res, next) {
    wxUser.find({}, function (err, doc) {
        if (err) {
            res.json({
                status: '500',
                msg: err.message,
                result: '查询失败'
            })
        } else {
            if (doc) {
                let dataorder = []
                doc.forEach(item => {
                    item.orderList.forEach(item2 => {
                        if (item2.orderStatus == "2") {
                            item2["openId"] = item.openId
                            dataorder.push(item2)
                        }
                    })
                })
                res.json({
                    status: '200',
                    msg: '查询成功',
                    result: dataorder
                })
            }
        }
    })
});

//查询 已发货
router.get('/shippedOrderList', function (req, res, next) {
    var queryData = {}
    if (req.query.orderId) {
        queryData = {
            orderId: req.query.orderId
        }
    }
    wxUser.find({}, function (err, doc) {
        if (err) {
            res.json({
                status: '500',
                msg: err.message,
                result: '查询失败'
            })
        } else {
            if (doc) {
                let dataorder = []
                doc.forEach(item => {
                    item.orderList.forEach(item2 => {
                        if (item2.orderStatus == "3") {
                            item2["openId"] = item.openId
                            dataorder.push(item2)
                        }
                    })
                })
                res.json({
                    status: '200',
                    msg: '查询成功',
                    result: dataorder
                })
            }
        }
    })
});
//查询 已发货 单个订单
router.get('/singleShippedOrder', function (req, res, next) {
    var queryData = {}
    if (req.query.orderId) {
        queryData = {
            orderId: req.query.orderId
        }
    }
    wxUser.find({}, function (err, doc) {
        if (err) {
            res.json({
                status: '500',
                msg: err.message,
                result: '查询失败'
            })
        } else {
            if (doc) {
                let dataorder = []
                doc.forEach(item => {
                    item.orderList.forEach(item2 => {
                        if (item2.orderStatus == "3" && item2.orderId == req.query.orderId) {
                            item2["openId"] = item.openId
                            dataorder.push(item2)
                        }
                    })
                })
                res.json({
                    status: '200',
                    msg: '查询成功',
                    result: dataorder
                })
            }
        }
    })
});
//点击发货
router.post("/unshippedOrderListdo", function (req, res, next) {
    let orderId = req.body.orderId
    let openId = req.body.openId
    var shipNum = req.body.shipNum
    var shipCompany = req.body.shipCompany
    wxUser.findOne({ openId: openId }).then(doc => {
        if (doc) {
            doc.orderList.forEach(item => {
                if (item.orderId == orderId) {
                    item.orderStatus = "3"
                    item.shipCompany = shipCompany
                    item.shipNum = shipNum
                }
            })
            doc.save(function (err, doc) {
                if (err) {
                    res.json({
                        status: '1',
                        msg: err.message,
                        result: ''
                    })
                } else {
                    sendMail('778034569@qq.com', '您有新的已发货订单！', '请登录后台管理系统查看');
                    res.json({
                        status: '0',
                        msg: '发货成功',
                        result: doc
                    })
                }
            })
        }

    })
})
//查询
router.get("/searchListData", function (req, res) {
    let productName = req.query.productName
    if (productName === "全部") {
        wxGoods.find({}, function (err, doc) {
            if (doc) {
                res.json({
                    status: '200',
                    msg: "获取列表成功",
                    result: doc
                })
            } else {
                res.json({
                    status: "404",
                    result: ''
                })
            }
        })
    } else {
        wxGoods.find({ productName: productName }, function (err, doc) {
            if (doc) {
                res.json({
                    status: '200',
                    msg: "获取列表成功",
                    result: doc
                })
            } else {
                res.json({
                    status: "404",
                    result: ''
                })
            }
        })
    }
});
//增加商品
router.post('/addProductList', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'productDescImages', maxCount: 4 }]), function (req, res, next) {
    var productId = req.body.productId
    let productName = req.body.productName
    // let productImage=filename
    let productImage = req.files.productImage[0].filename
    let productdesctext = req.body.productdesctext
    let productTypes = JSON.parse(req.body.productTypes)
    let productDescImages = [];
    // let productDescImages=JSON.parse(req.body.productDescImages)
    req.files.productDescImages.forEach(item => {
        productDescImages.push(item.filename)
    })
    let salePrice = JSON.parse(req.body.salePrice)
    let productpricedata = []
    productTypes.forEach((item2, index) => {
        salePrice.forEach((item) => {
            if (item2.metiralName == item.metiralName) {
                let a = {
                    "pageWeight": item.pageWeight,
                    "pageType": item.pageType,
                    "price": item.price
                }
                productpricedata.push(a)
            }
        })
        item2 = Object.assign(item2, { salePrice: productpricedata })
        productpricedata = []
    })
    var newWeight = []
    var newType = []
    var finalType = []
    var needIndex = 0
    productTypes.forEach((item, index) => {
        item.salePrice.forEach(subitem => {
            if (newType.indexOf(subitem.pageType)) {
                var needPush = { id: needIndex++, type: subitem.pageType }
                newType.push(subitem.pageType)
                finalType.push(needPush)
            }
            finalType.forEach(item4 => {
                if (subitem.pageType == item4.type) {
                    var needPushWeight = { id: item4.id, type: subitem.pageWeight }
                    newWeight.push(needPushWeight)
                }
            })
        })
        item = Object.assign(item, { pageType: finalType }, { pageWeight: newWeight })
        finalType = []
        newType = []
        needIndex = 0
        newWeight = []

    })
    wxGoods.insertMany({
        "productId": productId,
        "productName": productName,
        "productImage": productImage,
        "metiralType": productTypes,
        "productDesc": productDescImages,
        "productDescText": productdesctext
    }, (err, data) => {
        if (err) {
            res.json({
                status: "500",
                result: err
            })
        }
        if (data) {
            res.json({
                status: "200",
                result: data
            })
        }
    })
});

//删除
router.delete('/deletepro', function (req, res, next) {
    let iy = req.body.productId
    wxGoods.deleteOne({ productId: iy }).then(doc => {
        if (doc) {
            res.json({
                status: '200',
                msg: '',
                result: '成功'
            })
        }
    })
});
//搜索订单
router.post("/getOrderIds", function (req, res, next) {
    var orderIds = req.body.orderId
    wxUser.find({}).then(doc => {
        let list = []
        doc.forEach(item => {
            item.orderList.forEach(item2 => {
                if (item2.orderId == orderIds) {
                    list.push(item2)
                }
            })
        })
        res.json({
            status: "200",
            msg: "success",
            result: list
        })

    })
})
//修改发票hasInvo 1已开票，2开票中
router.post("/OrderIsInvoice", function (req, res) {
    let orderid = req.body.orderId
    let openId = req.body.openId
    wxUser.findOne({ openId: openId }, (err, doc) => {
        if (doc) {
            doc.orderList.forEach(item => {
                if (item.orderId == orderid) {
                    item.hasInvo = "1"
                }
            })
            doc.save(function (err, doc) {
                if (err) {
                    res.json({
                        status: '400',
                        msg: err.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: '200',
                        msg: 'success',
                        result: ''
                    })
                }
            })
        }
    })
})
//修改未发货的订单信息
router.post("/updateOrderinfos", (req, res) => {
    let openId = req.body.openId
    let orderId = req.body.orderId
    let address = req.body.address
    let message = req.body.message
    let tel = req.body.tel
    let userName = req.body.userName
    let ordertotal=req.body.ordertotal
    let freightPay=req.body.freightPay
     let  sinceAddress=req.body.sinceAddress
    wxUser.findOne({ openId: openId }, (err, doc) => {
        if (doc) {
            doc.orderList.forEach(item => {
                if (item.orderId === orderId) {
                    item.addressInfo.address =address
                    item.message = message
                    item.addressInfo.tel = tel
                    item.addressInfo.userName = userName
                    item.orderTotal=ordertotal
                    item.freightPay=freightPay
                    item.sinceAddress=sinceAddress
                }
            })
            doc.save(function (err, data) {
                if (err) {
                    res.json({
                        status: '400',
                        msg: err.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: '200',
                        msg: 'success',
                        result: data
                    })

                }
            })
        }
    })
})
//点击待提取->以提取
//点击待提取->以提取
router.post("/sinceStatus", function (req, res, next) {
    let orderId = req.body.orderId
    let openId = req.body.openId
    wxUser.findOne({ openId: openId }).then(doc => {
        if (doc) {
            doc.orderList.forEach(item => {
                if (item.orderId == orderId) {
                    item.orderStatus = "4"
                    
                }
            })
            doc.save(function (err, doc) {
                if (err) {
                    res.json({
                        status: '500',
                        msg: err.message,
                        result: ''
                    })
                } else {
                    sendMail('778034569@qq.com', '订单已被提取！', '请登录后台管理系统查看');
                    res.json({
                        status: '200',
                        msg: '提取成功',
                        result: ''
                    })
                }
            })
        }

    })
})

//根据orderid来查订单信息
router.get("/getupdateOrder", (req, res) => {
    let orderid = req.query.orderid
    let openId = req.query.openId
    let data = {}
    wxUser.findOne({ openId: openId }, (err, doc) => {
        if (err) {
            res.json({
                status: 404,
                result: err
            })

        } else if (doc) {
            doc.orderList.forEach(item => {
                if (item.orderId == orderid) {
                    data = Object.assign(item, {})
                }
            })
            res.json({
                status: 200,
                result: data
            })
        }

    })
})
//查询单一商品
router.get("/singleProduct", (req, res) => {
    let id = req.query.id
    wxGoods.findOne({ _id: id }, function (err, data) {
        res.json({
            status: 200,
            msg: "查询成功",
            result: data
        })
    })
})
//修改商品信息
router.post('/updateProduct', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'productDescImages', maxCount: 4 }]), function (req, res, next) {
    var productId = req.body.productId
    let productName = req.body.productName
    let productImage = req.files.productImage[0].filename
    let productdesctext = req.body.productdesctext
    let productTypes = JSON.parse(req.body.productTypes)
    let productDescImages = [];
    req.files.productDescImages.forEach(item => {
        productDescImages.push(item.filename)
    })
    let salePrice = JSON.parse(req.body.salePrice)
    let productpricedata = []
    productTypes.forEach((item2, index) => {
        salePrice.forEach((item) => {
            if (item2.metiralName == item.metiralName) {
                let a = {
                    "pageWeight": item.pageWeight,
                    "pageType": item.pageType,
                    "price": item.price
                }
                productpricedata.push(a)
            }
        })
        item2 = Object.assign(item2, { salePrice: productpricedata })
        productpricedata = []
    })
    var newWeight = []
    var newType = []
    var finalType = []
    var needIndex = 0
    productTypes.forEach((item, index) => {
        item.salePrice.forEach(subitem => {
            if (newType.indexOf(subitem.pageType)) {
                var needPush = { id: needIndex++, type: subitem.pageType }
                newType.push(subitem.pageType)
                finalType.push(needPush)
            }
            finalType.forEach(item4 => {
                if (subitem.pageType == item4.type) {
                    var needPushWeight = { id: item4.id, type: subitem.pageWeight }
                    newWeight.push(needPushWeight)
                }
            })

        })
        item = Object.assign(item, { pageType: finalType }, { pageWeight: newWeight })
        finalType = []
        newType = []
        needIndex = 0
        newWeight = []

    })
    let list = {
        "productId": productId,
        "productName": productName,
        "productImage": productImage,
        "metiralType": productTypes,
        "productDesc": productDescImages,
        "productDescText": productdesctext
    }
    wxGoods.findOneAndUpdate({ "productId": productId }, { $set: list }, function (err, doc) {
        res.json({
            status: '200',
            msg: '',
            result: doc
        })
    })
});
// 快宝查询快递 改聚合
// const KBAPPID = '100460'
// const KBMETHOD = 'express.info.get'
// const KBAPIKEY = 'fb286d58c149b48b3cde4a7b785acdc6c0ec2106'
router.post('/kb', function (req, res, next) {
    var mailNo = req.body.mailNo
    var company = req.body.company
    const JHKEY="d7ceb685ea82dca4c9be01c0be6385a5"
    // var data = {
    //     "waybill_no": mailNo,
    //     "exp_company_code": company,
    //     "result_sort": "0"
    // }
    // var requestData = JSON.stringify(data)
    // var timestamp = Math.round(new Date().getTime() / 1000); // 时间戳
    // const md5 = crypto.createHash('md5');
    // var sign = crypto.createHash('md5').update(KBAPPID + KBMETHOD + timestamp + KBAPIKEY, 'utf-8').digest('hex');
    var options = {
        method: 'POST',
        url:'http://v.juhe.cn/exp/index',
        form:{
            com:company,
            no:mailNo,
            key:JHKEY
        },
        // url: 'https://kop.kuaidihelp.com/api',
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        // form:
        // {
        //     app_id: KBAPPID,
        //     method: KBMETHOD,
        //     ts: timestamp,
        //     data: requestData,
        //     sign: sign
        // }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        res.json({
            status: "200",
            msg: "查询成功",
            result: JSON.parse(body)
        });
    });
})




//alice 客户管理模块
//客户管理模块的内容

router.get("/customerinfo", (req, res) => {
    wxUser.find({}, (err, data) => {
        if (data.length > 0) {
            data.forEach(item => {
                // let k={
                //     orderSum:0,//下单单数
                //     orderProductNum:0,//下单的商品总数量
                // }
                let orderSum = 0;
                let orderProductNum = 0;
                orderSum = item.orderList.length
                item.orderList.forEach(item2 => {
                    orderProductNum += item2.goodsList.length
                })
                let k = {
                    orderSum: orderSum,
                    orderProductNum: orderProductNum
                }
                let obj = JSON.stringify(k)
                let h = JSON.parse(obj)
                item = Object.assign(item, h)
            })

            res.json({
                status: "200",
                msg: "success",
                result: data
            })
        } else {
            res.json({
                status: "404",
                msg: '',
                result: err
            })
        }
    })
})
//下载客户的下单单数和下单时间  
//获取表格信息
router.get("/downloadcustomerdata", (req, res) => {
    let cid=req.query.cid;
    let p={}
    if(cid!=""){
        p={
            _id:cid
        }
    }else{
        p={}
    }
    wxUser.find(p, (err, data) => {
        if (data.length > 0) {
            let cusdata=[]
            data.forEach(item => {
                let k = {
                    ordernum: 0
                }
                if( item.orderList.length>0){
                    item.orderList.forEach(item2 => {
                        k.ordernum += item2.goodsList.length
                    })
                    item = Object.assign(item, k)
                    cusdata.push(item)
                }
            })
            res.json({
                status: "200",
                msg: "查询成功",
                result: cusdata
            });
        }else{
            res.json({
                status: "404",
                msg: "失败",
                result:err
            });
        }
    })
})
//获取全部订单和  物流管理获取列表的接口
router.get('/allorderlist', function (req, res, next) {
    var hanopay = req.query.hanopay
    wxUser.find({}, function (err, doc) {
        if (err) {
            res.json({
                status: '404',
                msg: err.message,
                result: '查询失败'
            })
        } else {
            if (doc) {
                let orderdata = []
                if (hanopay) {//物流管理
    
                    doc.forEach(item => {
                        let openId = item.openId
                        let userid= (item._id).toString()
                        item.orderList.forEach(item2 => {
                            let obj = {
                                userid:userid,
                                openId:openId
                            }
                            if (item2.orderStatus === "3" || item2.orderStatus === "2" || item2.orderStatus === "4") {
                                item2=JSON.parse(JSON.stringify(item2))
                                item2 = Object.assign(item2, obj)
                                orderdata.push(item2)
                                
                            }

                        })
                    })
                 
                }else{
  
                    doc.forEach(item => {//全部订单
                        let userid= (item._id).toString()
                        let openId = item.openId
                        item.orderList.forEach(item2 => {
                            let obj = {
                                userid:userid,
                                openId:openId
                            }
                            item2=JSON.parse(JSON.stringify(item2))
                            item2 = Object.assign(item2, obj)
                            orderdata.push(item2)
                        })
                    })

                }
            
                res.json({
                    status: "200",
                    msg: "查询成功",
                    result: orderdata
                })
            }
        }
    })
});
//全部订单的搜索
router.post("/statusidSearch", (req, res) => {
    let searchStatus = req.body.orderStatus
    let orderId = req.body.orderId
    let hasnopay = req.body.hasnopay
    wxUser.find({}, (err, data) => {
        if (err) {
            res.json({
                status: "404",
                mag: "查询失败",
                result: err
            })
            return
        }
        if (data) {
            
            let orderdata = []
            if (orderId) {
                data.forEach(item => {
                    let openId = item.openId
                        let userid= (item._id).toString()
                    item.orderList.forEach(item2 => {
                        let obj = {
                            userid:userid,
                            openId:openId
                        }
                        if (item2.orderStatus === searchStatus && item2.orderId === orderId) {
                            item2=JSON.parse(JSON.stringify(item2))
                            item2 = Object.assign(item2, obj)
                            orderdata.push(item2)
                            return 
                        }
                        if(searchStatus==="0" &&item2.orderId===orderId){
                            item2=JSON.parse(JSON.stringify(item2))
                            item2 = Object.assign(item2, obj)
                            orderdata.push(item2)
                        }
                    })
                })
            } else {
                data.forEach(item => {
                    let openId = item.openId
                        let userid= (item._id).toString()
                    item.orderList.forEach(item2 => {
                        let obj = {
                            userid:userid,
                            openId:openId
                        }
                        if (item2.orderStatus === searchStatus) {
                            item2=JSON.parse(JSON.stringify(item2))
                                    item2 = Object.assign(item2, obj)
                                    orderdata.push(item2)
                        }
                        if(hasnopay){
                            if(searchStatus==="0"){
                                if (item2.orderStatus === "3" || item2.orderStatus === "2" || item2.orderStatus === "4") {
                                    item2=JSON.parse(JSON.stringify(item2))
                                    item2 = Object.assign(item2, obj)
                                    orderdata.push(item2)
                                }
                            }
                        }
                        else if(searchStatus==="0"){
                            let obj = {
                                userid:userid,
                                openId:openId
                            }
                            item2=JSON.parse(JSON.stringify(item2))
                            item2 = Object.assign(item2, obj)
                            orderdata.push(item2)
                        }
                    })
                    
                })
            }
            res.json({
                status: "200",
                msg: "查询成功",
                result: orderdata
            })

        }
    })
})
//物流管理的的搜索
router.post("/findOrderbyId", (req, res) => {
    let orderId = req.body.orderId
    wxUser.find({}, (err, data) => {
        if (err) {
            res.json({
                status: "404",
                mag: "查询失败",
                result: err
            })
            return;
        }
        if (data) {
            var obj={};
            let orderdata = []
            if (orderId) {
                data.forEach(item => {
                    item.orderList.forEach(item2 => {
                        let obj = {
                            userid: item._id.toString(),
                            openId:item.openId
                        }
                        item2 = Object.assign(item2, obj)
  
                        if ( item2.orderId === orderId) {
                            orderdata.push(item2)
                            return 
                        }
                    })
                })
            } else {
                data.forEach(item => {
                    item.orderList.forEach(item2 => {
                      
                        if (item2.orderStatus === searchStatus) {
                            orderdata.push(item2)
                            return 
                        }
                        if(searchStatus==="0"){
                            orderdata.push(item2)
                        }
                    })

                })
            }
            res.json({
                status: "200",
                msg: "查询成功",
                result: orderdata
            })

        }
    })
})
router.post('/editInvoiceLogistic', function (req, res, next) {
        let orderId = req.body.orderId;
        let openId = req.body.openId;
        var invoiceNumber = req.body.invoiceNumber;
        var invoiceCompany = req.body.invoiceCompany;
        wxUser.findOne({ openId: openId }).then(doc => {
            if (doc) {
                doc.orderList.forEach(item => {
                    if (item.orderId == orderId) {
                        item.invoiceCompany = invoiceCompany
                        item.invoiceNumber = invoiceNumber
                    }
                })
                doc.save(function (err, doc) {
                    if (err) {
                        res.json({
                            status: '1',
                            msg: err.message,
                            result: ''
                        })
                    } else {
                        res.json({
                            status: '0',
                            msg: '填写物流信息成功',
                            result: ''
                        })
                    }
                })
            }

        })
})
//根据订单编号查看订单信息
router.get('/getInvoiceByOrderId',function(req,res){
    let orderId = req.query.orderid;
    let openId = req.query.openid;

    wxUser.findOne({ openId: openId }).then(doc => {
        if (doc) {
            var invoiceList=doc.invoiceList.filter(item => {
                return item.orderId===orderId
            })
            res.json({
                status: '0',
                msg: '查看成功',
                result: invoiceList
            })
        }

    })


})
module.exports = router;