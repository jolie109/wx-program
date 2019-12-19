 // 级别

let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var level = new Schema({
    "grade_id":mongoose.Types.ObjectId,
    "name":String
});
module.exports = mongoose.model("levels", level)