// 项目记录表（项目经理发放给员工）
let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pointUserLog = new Schema({
    "project_id": mongoose.Types.ObjectId, 
    "point_type": String,
    "employee_id": mongoose.Types.ObjectId,
    "point": Number,
    "issue_date": String,
    "issue_owner": String,
    "issue_stage": String,
    "point_log_id": String,
    "status": String
});
module.exports = mongoose.model("point_user_logs", pointUserLog)