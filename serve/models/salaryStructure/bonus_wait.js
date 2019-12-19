// 分红管理

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bonuswait = new Schema({
    "employee_id":mongoose.Types.ObjectId,
    "origin_amount":Number,
    "amount":Number,
    "status":String,
    "bonus_type":String,
    "period":Object,
    "department_id":mongoose.Types.ObjectId,
    "estimate_pay_date":String, 
    "is_paid":Boolean, 
    "status":String,
    "bonus_log_id":mongoose.Types.ObjectId
});
module.exports = mongoose.model("bonuswait", bonuswait)