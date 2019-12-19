/*
 * @Author: your name
 * @Date: 2019-10-16 15:38:16
 * @LastEditTime: 2019-12-04 17:26:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Editwx
 * @FilePath: /wechat/server/models/machine.js
 */
let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var machine = new Schema({
    "serialNumber":String,
    "nickName": String,
    "workCenterId":mongoose.Types.ObjectId, //与生产中心表相关联，当与某个中心相同时，就是属于哪个中心下的机器
    "category":String,
    "type":[],
    "status":String,
    "click_count":Object
});
module.exports = mongoose.model("Machines", machine,'machines')