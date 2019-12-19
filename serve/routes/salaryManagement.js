var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');

var Category = require('../models/classify/category')
var Grade = require('../models/classify/grade')
var Salary = require('../models/salaryManagement/salary')


var ObjectId = mongoose.mongo.ObjectId;



/*-------------------基本薪资-------------------*/ 

//获取所有薪资信息 category_type="基本薪资"
//获取所有每月加给 category_type="每月加给"
router.get('/getSalaryAccount',function(req,res){
  var category_type = req.query.category_type;
  Category.find({"category_type" : category_type},(err,data)=>{
    if(err){
      console.log(err);
      res.json({
        status:"400",
        msg:"获取不到"
      })
    }else{
        res.json({
            status:'200',
            result:data
        })
    }
  })
})

//获取所有基本薪资
router.get("/getSalary",function(req,res){
  var category_type = req.query.category_type;
  Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_category.category_type":category_type
    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
   },
],function(err,data){
      if(err){
          res.json({
            status:400,
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
          result:data
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})


// ListenGradeByCategory
router.get("/ListenGradeByCategory",function(req,res){
  let category_id = req.query.category_id;
  // let grade_id =req.query.grade_id;
  var category_type = req.query.category_type;
  Grade.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_grade"
      }
  }, 
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_grade.category_type":category_type
    }
  },
  {
      $lookup:{
          from:"levels",
          localField:"_id",
          foreignField:"grade_id",
          as:"item_level"
      }
  },
  {
    $unwind:{
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $lookup:{
        from:"salaries",
        localField:"category_id",
        foreignField:"category_id",
        as:"item_salary"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_salary",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
   },
{
    $match: {
        category_id: ObjectId(category_id)
    }
}
],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '404',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })

    }      
  }) 
})

//监听分类的ID，找到等级的name
router.get("/ListengetCategoryByGrade",function(req,res){ 
  let category_id = req.query.category_id;

  Grade.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item"
      }
  },
  // {
  //     $unwind: { // 拆分子数组
  //       path: "$item",
  //       preserveNullAndEmptyArrays: true // 空的数组也拆分
  //     }
  // },
  {
      $match:{
          "category_id":ObjectId(category_id)
      }
  },
],function(err,data){
 
      if(err){
          console.log(err);
          return;
      }else if(data.length==0){

        res.json({
          status: '404',
          msg:"没有找到"
      })
      }else{
        res.json({
          status: '200',
          result:data
      })
      }
      
  }) 
})



// ----------------点击增加--------------------------
//获取等级下面的级别
// ListenLevelByGrade  在第三个select 中赋值

router.get("/ListenLevelByGrade",function(req,res){
  let grade_id = req.query.grade_id;
  let category_id =req.query.category_id;
  var category_type = req.query.category_type;

  Grade.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_grade"
      }
  }, 
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_grade.category_type":category_type
    }
  },
  {
      $lookup:{
          from:"levels",
          localField:"_id",
          foreignField:"grade_id",
          as:"item_level"
      }
  },
  {
    $unwind:{
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_level.grade_id":ObjectId(grade_id)
    }
  },
  {
    $lookup:{
        from:"salaries",
        localField:"category_id",
        foreignField:"category_id",
        as:"item_salary"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_salary",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
   },
{
    $match: {
        category_id: ObjectId(category_id)
    }
}
],function(err,data){
 
      if(err){

          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '404',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})


// "全部、全部、X" 
router.get("/search_qqx",function(req,res){

  let level_name = req.query.level_name;
  var category_type = req.query.category_type;

    Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,

    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_level.name":level_name
    }
  },
  ],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})


/**--------------------搜索---------------------- */
//quan  _  quan 第三个select 中赋值

router.get("/selectAllLevel",function(req,res){
  let grade_id = req.query.grade_id;
  // let category_id =req.query.category_id;
  var category_type = req.query.category_type;
  
  Grade.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_grade"
      }
  }, 
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_grade.category_type":category_type
    }
  },
  {
      $lookup:{
          from:"levels",
          localField:"_id",
          foreignField:"grade_id",
          as:"item_level"
      }
  },
  {
    $unwind:{
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },

  {
    $match:{
      "name":grade_id
    }
  },
  {
    $lookup:{
        from:"salaries",
        localField:"category_id",
        foreignField:"category_id",
        as:"item_salary"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_salary",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
   },

],function(err,data){

      if(err){
         
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '200',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})


//  全部、X 、 X、

router.get("/search_qxx",function(req,res){
  let grade_name = req.query.grade_name;
  let level_id = req.query.level_id;
  var category_type = req.query.category_type;

    Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,
    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_grade.name":grade_name
    }
  },
  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_level._id":ObjectId(level_id)
    }
  },
  ],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})


//  全部、X 、全部、
router.get("/search_qxq",function(req,res){
  let grade_name = req.query.grade_name;

  var category_type = req.query.category_type;

    Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,
    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_grade.name":grade_name
    }
  },
  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  }
  ],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})

// X 、 全部、 X、
router.get("/search_xqx",function(req,res){
  let category_id = req.query.category_id;
  let level_id = req.query.level_id;
  var category_type = req.query.category_type;
    Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,
      "item_category._id":ObjectId(category_id)
    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },

  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_level.name" : level_id
    }
  },
  ],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})

// X 、 全部、 全部、
router.get("/search_xqq",function(req,res){
  let category_id = req.query.category_id;
  let level_id = req.query.level_id;
  var category_type = req.query.category_type;

    Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,
      "item_category._id":ObjectId(category_id)
    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  ],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})


// X 、 X、 全部、
router.get("/search_xxq",function(req,res){
  let category_id = req.query.category_id;
  let grade_id = req.query.grade_id;
  var category_type = req.query.category_type;

    Salary.aggregate([{
      $lookup:{
          from:"categorys",
          localField:"category_id",
          foreignField:"_id",
          as:"item_category"
      }
  }, 
  {
    $unwind:{
      path: "$item_category",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,
      "item_category._id":ObjectId(category_id)
    }
  },
  {
      $lookup:{
          from:"grades",
          localField:"grade_id",
          foreignField:"_id",
          as:"item_grade"
      }
  },
  {
    $unwind:{
      path: "$item_grade",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "item_grade._id":ObjectId(grade_id)
    }
  },
  {
    $lookup:{
        from:"levels",
        localField:"level_id",
        foreignField:"_id",
        as:"item_level"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$item_level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  ],function(err,data){
      if(err){
          res.json({
            status:"400",
            msg:"出错啦"
          })
      }else if(data.length==0){
        res.json({
          status: '400',
          msg:"没有匹配到的",
        })
      }else{
        res.json({
          status:'200',
          result:data,
      })
    }      
  }) 
})




// 四个表关联显示所有相互对应的薪资
// salary 去关联其余的三个表 
router.get("/getSalary_list",function(req,res){
  let category_id = req.query.category_id;
  let grade_id =req.query.grade_id;
  let level_id = req.query.level_id;
  var category_type = req.query.category_type;
 
  Salary.aggregate([{
    $lookup:{
        from:"categorys",
        localField:"category_id",
        foreignField:"_id",
        as:"item_category"
    }
}, 
{
  $unwind:{
    path: "$item_category",
    preserveNullAndEmptyArrays: true // 空的数组也拆分
  }
},
{
  $match:{
    "category_type":category_type,
    "category_id":ObjectId(category_id),
    "grade_id":ObjectId(grade_id),
    "level_id":ObjectId(level_id)
  }
},
{
    $lookup:{
        from:"grades",
        localField:"grade_id",
        foreignField:"_id",
        as:"item_grade"
    }
},
{
  $unwind:{
    path: "$item_grade",
    preserveNullAndEmptyArrays: true // 空的数组也拆分
  }
},
{
  $lookup:{
      from:"levels",
      localField:"level_id",
      foreignField:"_id",
      as:"item_level"
  }
},
{
  $unwind: { // 拆分子数组
    path: "$item_level",
    preserveNullAndEmptyArrays: true // 空的数组也拆分
  }
 },
],function(err,data){
    if(err){
        res.json({
          status:"400",
          msg:"出错啦"
        })
    }else if(data.length==0){
      res.json({
        status: '200',
        msg:"没有匹配到的",
      })
    }else{
      res.json({
        status:'200',
        result:data,
    })
  }      
}) 
})


// 基本薪资里新增薪资
//传入新增内容的类别的_id
router.post('/addSalary',(req,res)=>{
  var grade_id = req.body.grade_id ;
  var category_id = req.body.category_id ;
  var level_id = req.body.level_id;
  var amount = req.body.amount ;

  Salary.find({category_id:category_id,grade_id:grade_id,level_id:level_id},(err,data)=>{
    

    if(data.length > 0){

      res.json({
        status:"400",
        msg:"已经存在"
      })
    }else{

      Salary.create({
        category_type:"基本薪资",
        category_id:category_id,
        grade_id:grade_id,
        level_id:level_id,
        amount:amount
      },(err,data)=>{
        if(err){
          console.log(err);
        }else{
    
          res.json({
            status:'200',
            result:data,
            msg:"插入成功"
          })
        }
      })
    }
  }) 
})

//编辑基本薪资
router.post('/editBaseSalary',(req,res)=>{
  var category_id = req.body.category_id;
  var grade_id = req.body.grade_id;
  var level_id= req.body.level_id;
  var newAmount = req.body.amount;
  Salary.find({category_id:category_id,grade_id:grade_id,level_id:level_id},(err,data)=>{

      Salary.findOneAndUpdate(
        { category_id : category_id,grade_id:grade_id,level_id:level_id},
        {
        $set: {
            "amount": newAmount
            }
        },
        {
            new: true
        }
        ,(err,data)=>{
          if(err){
            res.json({
              status:"400",
              msg:'更新成功'
            })
          }else{
            res.json({
              status:"200",
              result:data
            })
          }
        })
  })
})



/* ------------------------------------ 每月加给---------------------------------- */

//每月加给对应薪资列表
// 分类、等级、薪资 一一对应
router.get('/PermonthSalary',(req,res)=>{
  var category_type = req.query.category_type; //传入‘每月加给’
  Salary.aggregate([{
    $lookup:{
      from:"categorys",
      localField:"category_id",
      foreignField:"_id",
      as:"categorysItem"
    }
  },
  {
    $unwind:{
      path: "$categorysItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "categorysItem.category_type":category_type
    }
  },
  {
    $lookup:{
      from:"grades",
      localField:"grade_id",
      foreignField:"_id",
      as:"gradeItem"
    }
  },
  {
    $unwind:{
      path: "$gradeItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },

  ],(err,data)=>{
    if(err){
      res.json({
        status:400,
        msg:'error'
      })
    }else if(data.length==0){
      res.json({
        status:"404",
        msg:"没有找到"
      })
     
    }else{
      res.json({
        status:"200",
        result:data
      })
    }
  })
})

// 新增的接口如下：
//获取所有的分类名字（ 通过category 的 category_type来区分是基本薪资 还是 每月加给 ）


//根据分类的ID进行查询等级中的name
// 级别搜索中选择分类名时获取此分类名下的所有等级名
router.get("/getCategoryByGrade",(req,res)=>{ 
  var grade_id = req.query.grade_id;
  var category_type = req.query.category_type;

  Salary.aggregate([{
    $lookup:{
      from:"categorys",
      localField:"category_id",
      foreignField:"_id",
      as:"categorysItem"
    }
  },
  {
    $unwind:{
      path: "$categorysItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,
      // "grade_id":ObjectId(grade_id),
    }
  },
  {
    $lookup:{
      from:"grades",
      localField:"grade_id",
      foreignField:"_id",
      as:"gradeItem"
    }
  },
  {
    $unwind:{
      path: "$gradeItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "gradeItem.name":grade_id
    }
  },
  ],(err,data)=>{
    if(err){
      res.json({
        status:"400",
        msg:'没有数据了'
      })
    }else{
      res.json({
        status:"200",
        result:data
      })
    }
  })
})



//////...............................
//获取每月加给中所有的等级
//获取所有每月加给 
router.get('/getGradeAccount',(req,res)=>{
  var category_type = req.query.category_type; //传入‘每月加给’

  Category.aggregate([
  {
    $lookup:{
      from:"grades",
      localField:"_id",
      foreignField:"category_id",
      as:"gradeItem"
    }
  },
  {
    $unwind:{
      path: "$gradeItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type
    }
  },
  ],(err,data)=>{
    if(err){
      res.json({
        status:"400",
        msg:'没有数据了'
      })
    }else{
      res.json({
        status:"200",
        result:data
      })
    }
  })
})

// 搜索功能
// 通过传入的每月加给下面的分类去查询 两个select 都选中
router.get('/perMonthSalary_list',(req,res)=>{
  var category_type = req.query.category_type; //传入‘每月加给’
  var category_id = req.query.category_id;//
  var grade_id = req.query.grade_id; //等级的name
 
  Salary.aggregate([{
    $lookup:{
      from:"categorys",
      localField:"category_id",
      foreignField:"_id",
      as:"categorysItem"
    }
  },
  {
    $unwind:{
      path: "$categorysItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,

    }
  },
  {
    $lookup:{
      from:"grades",
      localField:"grade_id",
      foreignField:"_id",
      as:"gradeItem"
    }
  },
  {
    $unwind:{
      path: "$gradeItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_id":ObjectId(category_id),
      "grade_id":ObjectId(grade_id)
    }
  },
  ],(err,data)=>{
    if(err){
      res.json({
        status:"400",
        msg:'没有数据了'
      })
    }else{
      res.json({
        status:"200",
        result:data
      })
    }
  })
})

// 通过传入的每月加给下面的分类的ID  去查找下面对应的所有grade
router.get('/getGradeByCategory',(req,res)=>{
  var category_type = req.query.category_type; //传入‘每月加给’
  var category_id = req.query.category_id;//
  
  Salary.aggregate([{
    $lookup:{
      from:"categorys",
      localField:"category_id",
      foreignField:"_id",
      as:"categorysItem"
    }
  },
  {
    $unwind:{
      path: "$categorysItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_type":category_type,

    }
  },
  {
    $lookup:{
      from:"grades",
      localField:"grade_id",
      foreignField:"_id",
      as:"gradeItem"
    }
  },
  {
    $unwind:{
      path: "$gradeItem",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match:{
      "category_id":ObjectId(category_id),

    }
  },
  ],(err,data)=>{
    if(err){
      res.json({
        status:"400",
        msg:'没有数据了'
      })
    }else{
      res.json({
        status:"200",
        result:data
      })
    }
  })
})

// 每月加给
// 通过传入的category_type 返回出所有的category下面的数据
router.get("/searchCategoryAccount", (req, res) => {
  var category_type = req.query.category_type;
  Category.find({category_type:category_type},(err,data)=>{
      if(err){
          res.json({
              status: '400',
              msg:"出错啦"
          })
      }else{
          res.json({
              status: '200',
              msg:"查询成功",
              result:data
          })
      }     
  })
});




//修改每月加给 传入现在select选中的name对应的_id值
router.post('/editPerMonthSalary',(req,res)=>{
  var category_id = req.body.category_id;
  var grade_id = req.body.grade_id;
  var newAmount = req.body.amount;

  Salary.find({category_id:category_id,grade_id:grade_id},(err,data)=>{

      Salary.findOneAndUpdate(
        { category_id : category_id , grade_id:grade_id},
        {
        $set: {
            "amount": newAmount
            }
        },
        {
            new: true
        }
        ,(err,data)=>{
          if(err){
            res.json({
              status:400,
              msg:'更新成功'
            })
          }else{
            res.json({
              status:"200",
              result:data
            })
          }
        })
  })
})


//增加每月加给的薪资
router.post('/addPerMonthSalary',(req,res)=>{
  var category_id = req.body.category_id;
  var grade_id = req.body.grade_id;
  var newAmount = req.body.amount;
  var category_type = req.body.category_type;

  Salary.find({category_id:category_id,grade_id:grade_id},(err,data)=>{
      if(data.length > 0){

        res.json({
          status:"400",
          msg:"已经存在"
        })
      }else{
        Salary.insertMany(
          {
            category_type:category_type,
            category_id:category_id,
            grade_id:grade_id,
            amount:newAmount
          }
          ,(err,data)=>{
            if(err){
              console.log(err);
            }else{
              res.json({
                status:'200',
                result:data
              })
            }
          })
      }
    })
      
})


/*-------------------------------员工薪资结构----------------------------------*/

// 通过改变category集合中is_use 的true和false值

router.post('/salary_Structure',(req,res) => {
  var category_id = req.body.category_id;
  var is_use = req.body.is_use;

  Category.findByIdAndUpdate(
    { _id : ObjectId(category_id)},
    {
    $set: {
        "is_use": is_use
      }
    },
    {
        new: true
    },
    (err,data)=>{
      if(err){
        res.json({
          status:400,
          msg:'更新成功'
        })
      }else{
        res.json({
          status:"200",
          result:data
        })
      }
  })
})

// 删除薪资
// 根据id
router.delete('/deleteSalary',function(req,res){
  var _id = req.body._id ;
  Salary.deleteOne({_id:_id},function(err,data){
      if(err){
          console.log(err)
      }else{
          res.json({
              status:'200',
              msg:"删除成功",
              result:data,
          })
      }      
  })
})


module.exports = router