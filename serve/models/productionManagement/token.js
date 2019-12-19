let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tokenSchema = new Schema({
   "token":String,
   "create_time":String
});
module.exports = mongoose.model("AccessToken", tokenSchema )