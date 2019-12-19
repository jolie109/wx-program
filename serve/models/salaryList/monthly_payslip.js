//每月薪资单

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var monthly_payslip = new Schema({
    "employee_id": mongoose.Types.ObjectId,
    "status": String,
    "create_date": String,
    "employee_salary_structure_ids": Array,
    "special_adjust": Array,
    "bonus_wait_id" :Array
});
module.exports = mongoose.model("monthly_payslip", monthly_payslip)