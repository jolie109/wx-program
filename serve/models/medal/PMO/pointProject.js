let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var point_project = new Schema({
    "project_id":mongoose.Types.ObjectId,
    "pm_point":String,
    "cc_point":String,
    "stage":String,
    "issue_date":String,
    "manager":String
});
module.exports = mongoose.model("point_projects", point_project)