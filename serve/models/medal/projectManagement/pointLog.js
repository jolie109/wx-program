// 点数记录表
let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pointLog = new Schema({
    "project_id": mongoose.Types.ObjectId,
    "status": String,
    "point_sum": Number,
    "issue_stage": String
});
module.exports = mongoose.model("point_logs", pointLog)