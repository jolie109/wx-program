let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var workCenter = new Schema({
    
    "workName":String,


});
module.exports = mongoose.model("WorkCenters", workCenter)