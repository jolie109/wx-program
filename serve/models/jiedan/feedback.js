var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var pro = new Schema({
    "callType": String,
    "customerName": String,
    "feedBackText":String
});
module.exports = mongoose.model("Wxfeedbacks", pro)