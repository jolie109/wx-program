// 项目
let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var projectList = new Schema({
    "name": String,
    "desc": String,
    "close_date": String,
    "expect_close_date": String,
    "manager": mongoose.Types.ObjectId,
    "unit": String,
    "level": String,
    "status": String,
    "score": Number,
    "members": Array,
    "reward_cc_point": Number,
    "number": String,
    "progress_pm_point": Number,
    "progress_cc_point": Number,
    "complete_pm_point": Number,
    "complete_cc_point": Number,
    "reward_pm_point": Number,
    "max_point": Number
});
module.exports = mongoose.model("project_lists", projectList)