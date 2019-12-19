//奖金计算的记录

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bonuslog = new Schema({
    "bonus_type": String,
    "period": String,
    "estimate_pay_date": String
});
module.exports = mongoose.model("bonuslog", bonuslog)