var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var request = require('request');
var wxFeedBack = require('../..//models/jiedan/feedback')
//获取列表
router.get("/feedbacklist", (req, res) => {
    wxFeedBack.find({}, (err, data) => {
        if (data) {
            res.json({
                status: "200",
                msg: "获取列表成功",
                result: data
            })
        } else {
            res.json({
                status: "404",
                msg: "获取列表失败",
                result: err
            })
        }
    })
})
//搜索客户
router.post("/feedSerach", (req, res) => {
    let name = req.body.customerName;
    wxFeedBack.find({ customerName: name }, (err, data) => {
        if (data) {
            res.json({
                status: "200",
                msg: "查询成功",
                result: data
            })
        } else {
            res.json({
                status: "404",
                msg: "查询失败",
                result: err
            })
        }
    })
})
//点击查看信息
router.post("/feedTextInfo", (req, res) => {
    let callType = req.body.feedcall;
    wxFeedBack.findOne({ callType: callType }, (err, data) => {
        if (data) {
            res.json({
                status: "200",
                msg: "获取成功",
                result: data.feedBackText
            })
        } else {
            res.json({
                status: "404",
                msg: "查询失败",
                result: err
            })
        }
    })
})

//提交客户反馈信息
router.post("/submitFeedinfo", (req, res) => {
    let name = req.body.name;
    let contact = req.body.contact;
    let content = req.body.content;
    wxFeedBack.insertMany({
        "callType": contact,
        "customerName": name,
        "feedBackText": content
    }, (err, data) => {
        if (data) {
            res.json({
                status: "200",
                msg: "提交成功",
                result: data
            })
        }else{
            res.json({
                status: "500",
                msg: "提交失败",
                result: err
            })
        }
    })
})
module.exports = router;