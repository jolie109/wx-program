//员工薪资构成

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employee_salary_structure = new Schema({
    "employee_id": mongoose.Types.ObjectId,
    "salary_id": mongoose.Types.ObjectId,
    "category_id": mongoose.Types.ObjectId,
    "grade_id": mongoose.Types.ObjectId,
    "level_id": mongoose.Types.ObjectId,
    "amount": Number,
    "category_type":String

});
module.exports = mongoose.model("employee_salary_structure", employee_salary_structure)