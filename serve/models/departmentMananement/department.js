//部门

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var department = new Schema({
    "name": String,
    "manager_id": mongoose.Types.ObjectId
});
module.exports = mongoose.model("department", department)