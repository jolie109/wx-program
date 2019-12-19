/*
 * @Author: your name
 * @Date: 2019-11-26 10:03:10
 * @LastEditTime: 2019-12-03 17:11:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /eportal11.26/eportalBackend/models/productionManagement/singlePrint.js
 */
// let mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var singlePrint = new Schema({
//     "printDate":String,
//     "last_day_click":Number,
//     "addat":String,
//     "addby":String,
//     "type":[],
//     machineId: {type: mongoose.Types.ObjectId, ref: "Machines" },
//     "click_count":String,
//     "invalid_click":String
// });
// module.exports = mongoose.model("SinglePrints", singlePrint,'wxsingleprints')
let mongoose = require("mongoose");
var Schema = mongoose.Schema;
var singlePrint = new Schema({
  printDate: String,
  addat: String,
  addby: String,
  machineId: {type: mongoose.Types.ObjectId, ref: "Machines" },
  type: [],
  click_count: String,
  invalid_click: String,
  last_day_click: String
});
module.exports = mongoose.model("SinglePrints", singlePrint, "wxsingleprints");