var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var pro = new Schema({
    "productId": String,
    "productName": String,
    "productImage":String,
    "metiralType":Array,
    "productDesc":Array,
    "productDescText":""
});
module.exports = mongoose.model("Wxgoods", pro)


