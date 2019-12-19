

let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var acl = new Schema({
   "name":String,
   "path":String
});
module.exports = mongoose.model("acls", acl)