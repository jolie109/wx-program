/*
 * @Author: your name
 * @Date: 2019-08-28 14:25:19
 * @LastEditTime: 2019-10-25 10:38:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit/
 * @FilePath: /小程序前后台综合最新/smallServer/models/wxUser.js
 */
let mongoose = require('mongoose')

let wxuser = new mongoose.Schema({
    "openId": String,
    "orderList":[
       {
        "orderId":String,
        "orderTotal":Number,
        "addressInfo":{
            tel:String,
            userName:String,
            isDefault:Boolean,
            address:String,
            userId:String
        },
        "freightPay":Number,
        "message":String,
        "isInvoice":Boolean,
        "orderCreateDate":String,
        "goodsList":Array,
        "orderStatus":String,
        "userid":String,
        "shipNum":String,
        "shipCompany":String,
        "openId":String,
        // 新增字段
        "isPay":Boolean, //是否支付
        "awbNumber":String,//运单号
        "isReceived": Boolean ,//是否收货
        "hasInvo":String,
        //发票物流信息存储字段
        "invoiceCompany":String,//发票物流公司
        "invoiceNumber":String, //发票物流单号
        "distributionType":String,//配送方式 自提/快递  
        "sinceAddress":String,//自提地址
       }
    ],
    "cartList": [{
        "productId": String,
        "productName": String,
        "salePrice": Number,
        "checked": Boolean, 
        "productNum":String,
        "productImage":String,
        "pageType":String,
        "pageWeight":String,
        "metiralName":String
    }],
    "addressList": [{
        "addressId": String,
        "userName": String,
        "address": String,
        "tel": String,
        "isDefault": Boolean,
        "isInvo":Boolean
    }],
    "invoiceList":[{
        "openId":String,
        "orderId":String,
        "telInvoice":String,
        "titleInvoice": String,
        "emailInvoice":String,
        "identyInvoice":String,
        "buyAdderssInvoice":String,
        "buyCountInvoice":String,
        "buyBackInput":String
    }]
})

module.exports = mongoose.model('Wxuser', wxuser)