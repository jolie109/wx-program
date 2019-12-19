var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false)
var User = require('../models/admin/users.js')
var Role = require('../models/admin/role.js')
var Acl = require('../models/admin/acl.js')
var workCenter = require('../models/productionManagement/workCenter.js')
var Machine = require('../models/productionManagement/machine.js')
var ObjectId= mongoose.mongo.ObjectId;
//查看所有用户
router.get('/users', function(req, res, next) {
    User.aggregate([
        
        {
        $lookup:{
            from:"roles",
            localField:"roles_id",
            foreignField:"_id",
            as:"item",
        }     
    },
    {
        $lookup:{
            from:"workcenters",
            localField:"workCenterId",
            foreignField:"_id",
            as:"item2",
        }
    }
],function(err,data){
        if(err){
            console.log(err);
            return;
        }
        res.json({
            status: '200',
            result:data,
        })
    }) 
});
//添加新用户
router.post('/users', function(req, res, next) {
    var myData=req.body.roleList;
    var insert=[]
    var center=[]
    myData.item.forEach(element => {
       insert.push( ObjectId(element))
    })
    if(myData.item2){
    myData.item2.forEach(element => {
        center.push( ObjectId(element))
     })
    }
     User.findOne({"tel":myData.tel},function(err,data){
         if(data){
           return  res.json({
                 status:0,
                 msg:"添加失败，用户名已存在"
             })
         }
         else{
            User.create({"name":myData.name,"roles_id":insert,"tel":myData.tel,"workCenterId":center},function(err,data){
                if(err){
                    console.log('err',err.message);
                    res.json({
                        status:"500",
                        message:"添加失败"
                    })
                }
                if(data){
                    res.json({
                        status:"200",
                        msg:"添加成功"
                    })
                }
            })
            
         }
     })
   
});
//删除用户
router.delete('/users', function(req, res, next) {
    var userId=req.body._id

   User.findByIdAndRemove({"_id":userId},function(err,data){
    if(err){
        console.log('err',err.message);
        res.json({
            status:"500",
            msg:"删除失败"
        })
    }
    if(data){

        res.json({
            status:"200",
            msg:"删除成功"
        })
    }
   })
});
//修改用户
router.post('/updateUser', function(req, res, next) {
    var data=req.body.roleList;
    var name=req.body.name;
    var tel=req.body.tel;
    var insert=[]
    var center=[]
    data.item.forEach(item=>{
        if(typeof(item)=='string'){
        insert.push(ObjectId(item))
        }else{
            insert.push(ObjectId(item._id))
        }
    })
    if(data.item2){
    data.item2.forEach(item=>{
        if(typeof(item)=='string'){
        center.push(ObjectId(item))
        }else{
            center.push(ObjectId(item._id))
        }
    })
}
    User.findOneAndUpdate({"_id":data._id},{$set:{"roles_id":insert,"name":name,"tel":tel,"workCenterId":center}},function(err,data){
        if(err){
            console.log('err',err.message);
            res.json({
                status:"500",
                message:"修改失败"
            })
        }
        if(data){

            res.json({
                status:"200",
                msg:"修改成功"
            })
        }
    })
    
});
//查看所有路由
router.get('/acls', function(req, res, next) {
   Acl.find(({}),function(err,data){
        if(err){
            console.log(err);
            return;
        }
        res.json({
            status: '200',
            result:data,
        })
    }) 
});
//添加新路由
router.post('/acls', function(req, res, next) {
   var data=req.body.data
    Acl.create(data,function(err,data){
        if(err){
            console.log('err',err.message);
            res.json({
                status:"500",
                message:"添加失败"
            })
        }
        if(data){
   
            res.json({
                status:"200",
                msg:"添加成功"
            })
        }
    })
    
});
//删除路由
router.delete('/acls', function(req, res, next) {
    var aclId=req.body._id
   Acl.findByIdAndRemove({"_id":aclId},function(err,data){
    if(err){
        console.log('err',err.message);
        res.json({
            status:"500",
            msg:"删除失败"
        })
    }
    if(data){

        res.json({
            status:"200",
            msg:"删除成功"
        })
    }
   })
});
//修改路由
router.post('/updateAcl', function(req, res, next) {
    var data=req.body.data;
    Acl.findOneAndUpdate({"_id":data._id},data,function(err,data){
        if(err){
            console.log('err',err.message);
            res.json({
                status:"500",
                message:"修改失败"
            })
        }
        if(data){
            res.json({
                status:"200",
                msg:"修改成功"
            })
        }
    })
    
});
//查询角色（用户页面用）
router.get('/userRoles', function(req, res, next) {
   Role.find({},function(err,data){
       if(err){
        return   res.json({
               status:'400',
               message:"查询失败"
           })
       }
       if(data){
        res.json({
            status:'200',
            message:"查询成功",
            result:data
        })
       }
   })
});
//查看所有角色权限
router.get('/roles', function(req, res, next) {
    Role.aggregate([
        
        {
        $lookup:{
            from:"acls",
            localField:"acls_id",
            foreignField:"_id",
            as:"item",
        },
      
    }],function(err,data){
        if(err){
            console.log(err);
            return;
        }
        res.json({
            status: '200',
            result:data,
        })
    }) 
});
//添加新角色权限
router.post('/roles', function(req, res, next) {
    var data=req.body.roleList;
    var insert=[]
    data.item.forEach(element => {
       insert.push( ObjectId(element))
    })
    Role.create({"name":data.name,"acls_id":insert},function(err,data){
        if(err){
            console.log('err',err.message);
            res.json({
                status:"500",
                message:"添加失败"
            })
        }
        if(data){
            res.json({
                status:"200",
                msg:"添加成功"
            })
        }
    })
    
});
//删除角色
router.delete('/roles', function(req, res, next) {
    var userId=req.body._id
   Role.findByIdAndRemove({"_id":userId},function(err,data){
    if(err){
        console.log('err',err.message);
        res.json({
            status:"500",
            msg:"删除失败"
        })
    }
    if(data){

        res.json({
            status:"200",
            msg:"删除成功"
        })
    }
   })
});
//修改角色权限
router.post('/updateRole', function(req, res, next) {
    var data=req.body.roleList;
    var name=req.body.name
    var insert=[]
    data.item.forEach(item=>{
        if(typeof(item)=='string'){
        insert.push(ObjectId(item))
        }else{
            insert.push(ObjectId(item._id))
        }
    })
    Role.findOneAndUpdate({"_id":data._id},{"acls_id":insert,"name":name},function(err,data){
        if(err){
            console.log('err',err.message);
            res.json({
                status:"500",
                message:"修改失败"
            })
        }
        if(data){

            res.json({
                status:"200",
                msg:"修改成功"
            })
        }
    })
    
});
//查看所有打印中心
router.get('/workCenters', function(req, res, next) {
    workCenter.find(({}),function(err,data){
         if(err){
             console.log(err);
             return;
         }
         res.json({
             status: '200',
             result:data,
         })
     }) 
 });
 //添加打印中心
 router.post('/workCenters', function(req, res, next) {
    var data=req.body.data
     workCenter.create({"workName":data.workName},function(err,data){
         if(err){
             console.log('err',err.message);
             res.json({
                 status:"500",
                 message:"添加失败"
             })
         }
         if(data){

             res.json({
                 status:"200",
                 msg:"添加成功"
             })
         }
     })
     
 });
 //删除打印中心
 router.delete('/workCenters', function(req, res, next) {
     var aclId=req.body._id
     Machine.find({"workCenterId":aclId},function(err,data){
         if(err){
            console.log('err',err.message);
            res.json({
                status:"500",
                msg:"删除失败"
            })
         }

         if(data.length>0){

          return  res.json({
                status:"200",
                msg:"禁止删除，请先清空打印中心下打印机"
            })
        }
        workCenter.findByIdAndRemove({"_id":aclId},function(err,data1){
                if(err){
                    console.log('err',err.message);
                    res.json({
                        status:"500",
                        msg:"删除失败"
                    })
                }
                if(data1){
                    res.json({
                        status:"200",
                        msg:"删除成功"
                    })
                }
               })
     })
 });
 //修改打印中心
 router.post('/updateworkCenters', function(req, res, next) {
     var data=req.body.data;
     workCenter.findOneAndUpdate({"_id":data._id},data,function(err,data){
         if(err){
             console.log('err',err.message);
             res.json({
                 status:"500",
                 message:"修改失败"
             })
         }
         if(data){
      
             res.json({
                 status:"200",
                 msg:"修改成功"
             })
         }
     })
     
 });
module.exports = router;
