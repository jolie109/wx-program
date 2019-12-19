var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var request = require('request');
var wxGoods = require('../../models/jiedan/goods')
require('../../../util/util')
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
            console.log(err)
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

    wxUser.find({"_id":productId}).then(doc=>{

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
module.exports = router;