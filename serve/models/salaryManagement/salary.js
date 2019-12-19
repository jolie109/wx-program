// salary

let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var salary = new Schema({
    "grade_id":mongoose.Types.ObjectId,
    "level_id":mongoose.Types.ObjectId,
    "amount":Number,
    "category_id":mongoose.Types.ObjectId,
    "category_type":String
});
module.exports = mongoose.model("salaries", salary)