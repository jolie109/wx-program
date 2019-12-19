

let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var role = new Schema({
   "name":String,
   "acls_id":[]
});
module.exports = mongoose.model("roles", role)