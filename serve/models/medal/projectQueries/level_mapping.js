// 等级对照表

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var levelMapping = new Schema({
    "amount": String,
    "start": String,
    "end": String,
    "level": String,
    "name": String,
    "type":String
});
module.exports = mongoose.model("level_mappings", levelMapping)