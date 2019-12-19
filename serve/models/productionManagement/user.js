var mongoose =require('mongoose')//加载模块
var Schema =mongoose.Schema;
//定义Schema,描述该集合有哪些字段，哪些类型，只有定义过的才能被放入数据库
var userSchema =new Schema({
tel:String,
openid:String,
unionid :String,
nickname:String,
sex:Number,
headimgurl:String,
workCenterId:Array,
employee_id:mongoose.Types.ObjectId
})
module.exports =mongoose.model('users',userSchema)
