//股票管理

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stock = new Schema({
     "employee_id":mongoose.Types.ObjectId,
     "transaction_type":String, 
     "transaction_time":String, 
     "qty":Number,
     "remain_qty":Number
});
module.exports = mongoose.model("stock", stock)