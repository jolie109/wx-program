// 分类

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var category = new Schema({
    "category_type":String,
    "name":String,
    "is_use":Boolean,
});
module.exports = mongoose.model("categorys", category)