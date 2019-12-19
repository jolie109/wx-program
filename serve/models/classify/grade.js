// 等级

let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var grade = new Schema({
    "category_id":mongoose.Types.ObjectId,
    "name":String
});
module.exports = mongoose.model("grades", grade)