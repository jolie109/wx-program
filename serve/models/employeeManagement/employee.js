// emoloyee

let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var employee = new Schema({
    "name":String,
    "entry_time":String,
    "remain_stock":Number,
    "department_id":mongoose.Types.ObjectId,
    "adjust_permissions":Number,
    "value_index":Number,
    "last_value_index_time":String,
    "is_manager":Boolean,
    "workplace":String,
    "email":String,
    "employee_salary_structure_ids":Array,
    "tel":String,
    "double_pay_issued":Boolean,
    "employee_no":String,
    "task_count":Number
});
module.exports = mongoose.model("employee", employee)