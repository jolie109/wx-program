//奖金池

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bonuspool = new Schema({
     "period":String,
     "employeePerfor":Number, 
     "companyMedal":Number,
     "chargePerfor":Number, 
     "projectMedal":Number,
     "normalShare":Number,
     "equityShare":Number,
     // "departPerforRate":Number,
     // "departMedalRate":Number

});
module.exports = mongoose.model("bonuspool", bonuspool)