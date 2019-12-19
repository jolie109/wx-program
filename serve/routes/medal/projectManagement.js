var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');

var ProjectList = require('../../models/medal/projectManagement/projectList')
var PointUserLog = require('../../models/medal/projectManagement/pointUserLog')
var PointLog = require('../../models/medal/projectManagement/pointLog')
var Employee = require('../../models/employeeManagement/employee')
var pointProject = require('../../models/medal/PMO/pointProject')
var ObjectId = mongoose.mongo.ObjectId;
var Users = require('../../models/admin/users.js')
//项目列表中全部分类
//请求方式 :GET
//按照具体类别展示表数据
router.get('/projectList', function (req, res) {
  var item1 = req.query.item1;
  var item2 = req.query.item2;
  var category = {};
  if (item1 == "全部" || item1 == "") {
    category = {}
  } else if (item1 == "项目经理") {
    category = {
      "employee.name": item2
    }
  } else if (item1 == "项目编号") {
    category = {
      "number": item2
    }
  } else if (item1 == "项目状态") {
    category = {
      "status": item2
    }
  } else if (item1 == "项目等级") {
    category = {
      "level": item2
    }
  } else if (item1 == "项目名称") {
    category = {
      "name": item2
    }
  }
  //项目列表——带项目经理名
  ProjectList.aggregate([{
      $lookup: {
        from: "employees",
        localField: "manager",
        foreignField: "_id",
        as: "employee"
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$employee",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: category
    },
    {
      $match: {
        $or: [{
          "status": "PMO设定完成"
        }, {
          "status": "项目执行中"
        }, {
          "status": "PM结案申请阶段"
        }, {
          "status": "已结案（成功）"
        }, {
          "status": "已结案（失败）"
        }]
      }
    }
  ], function (err, data) {
    if (err) {
      // console.log(err);
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});

//项目列表“查看”
//项目内容+勋章点数状态
router.get("/checkout_project", (req, res) => {
  var index = req.query.index;
  //项目内容——带项目经理名
  ProjectList.aggregate([{
      $lookup: {
        from: "employees",
        localField: "manager",
        foreignField: "_id",
        as: "employee"
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$employee",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "_id": ObjectId(index)
      }
    }
  ], function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});
//点数发放申请列表
router.get("/checkout_logList", (req, res) => {
  var id = {
    "project_id": req.query.index
  }
  PointLog.find(id, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: "200",
      result: data
    })
  })
});
//点数发放申请列表——查看
router.get('/checkout_dian', (req, res) => {
  var id = req.query.index;
  PointUserLog.aggregate([{
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employee"
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$employee",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "point_log_id": id
      }
    }
  ], function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
})

//项目成员
router.get("/checkout_member", (req, res) => {
  var index = req.query.index;
  var id = {
    "_id": index
  }
  ProjectList.findOne(id, function (err, data) {
    var arr = data.members;
    Employee.find({
      "_id": {
        "$in": arr
      }
    }, function (err, data1) {
      if (err) {
        res.json({
          status: '500',
        })
        return;
      }
      res.json({
        status: "200",
        result: data1
      })
    })
  })
});

//点数发放记录——带用户名
router.get('/checkout_logs', (req, res) => {
  var id = req.query.index;
  PointUserLog.aggregate([{
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employee"
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$employee",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "project_id": ObjectId(id),
        "status": "同意"
      }
    }
  ], function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
})
//点数发放记录 根据勋章类别 点数求和
router.get("/pointSum", (req, res) => {
  var project_id = req.query.index
  PointUserLog.find({
    project_id: project_id,
    status: "同意"
  }, (err, data) => {
    var progress_cc_sum = 0;
    var progress_pm_sum = 0;
    var complete_cc_sum = 0;
    var complete_pm_sum = 0;
    var sum = {}
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    // return console.log(data)
    data.forEach(element => {
      console.log(element)
      if (element.point_type == "Collaboration" && element.issue_stage == "项目执行中") {
        progress_cc_sum += parseInt(element.point); //400
      } else if (element.point_type == "Management" && element.issue_stage == "项目执行中") {
        progress_pm_sum += parseInt(element.point);//100
      // } else if ((element.point_type == "Collaboration" && element.issue_stage == "已结案（成功）") || (element.point_type == "Collaboration" && element.issue_stage == "已结案（失败）")) {
      } else if ((element.point_type == "Collaboration" && element.issue_stage == "已结案") ) {

        complete_cc_sum += parseInt(element.point);
      } else {
        complete_pm_sum += parseInt(element.point);
      }
      console.log(progress_cc_sum)
      console.log(progress_pm_sum)
      console.log(complete_cc_sum)
      console.log(complete_pm_sum)
      sum.progress_cc_sum = progress_cc_sum;
      sum.progress_pm_sum = progress_pm_sum;
      sum.complete_cc_sum = complete_cc_sum;
      sum.complete_pm_sum = complete_pm_sum;

    });
    res.json({
      status: '200',
      result: sum
    })
  })
});

//项目成员下拉菜单显示
router.get("/checkout_members", (req, res) => {
  var id = {};
  Employee.find(id, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: "200",
      result: data
    })
  })
});

//添加成员
//请求方式post
router.post("/memberAdd",(req,res)=>{
  let memberid = req.body.id
  let projectid = req.body.index
  ProjectList.findOne({"_id": projectid}, function(err,data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    var num = data.members.indexOf(memberid)
    if(num == -1) {
      data.members.push(memberid)
      res.json({
        status: '200',
        result: data,
      })
    } else {
      res.json({
        status: "304"
      })
    }
    data.save() 
  })
})


////不要删除！！这是原始的正确的添加成员
// router.post('/memberAdd', (req, res) => {
//   var index = req.body.index;
//   var id = {
//     "_id": index
//   }
//   var employee_id = req.body.id;
//   ProjectList.findOne(id, function (err, data) {
//     if (err) {
//       res.json({
//         status: '500',
//       })
//       return;
//     }
//     res.json({
//       status: "200",
//       result: data
//     })
//     data.members.push(employee_id)
//     data.save(function (err, data) {})
//   })
// });
//移除成员
router.post('/memberRemove', (req, res) => {
  var index = req.body.index;
  var employee_id = req.body.id;
  ProjectList.findOneAndUpdate({
    _id: index
  }, {
    $pull: {
      members: employee_id
    }
  }, {
    new: true
  }, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
})
// 计算这个项目已经发放的各类型的合计
// 思路：  通过project——id拿到该项目的各个阶段的各类型的点数和
//        拿到该项目个阶段pmo发放的各个类型点数
//        将这个值返回，前端根据添加人员时，判断各类型有没有超过总点数
router.get('/alreadysendtypesum', (req, res) => {
  var projectId = req.query.projectId;
  PointUserLog.aggregate([
    {
      $match:{
        project_id:ObjectId(projectId),
        "status": {
          $in: ["同意","待审核"]
        },
      }
    }, 
   {
     $group:{
       "_id":{"issue_stage":"$issue_stage","point_type":"$point_type"},
       "pointsum":{$sum:"$point"}
     }
   },
   {
     $project:{
       "_id":true,
       pointsum:"$pointsum"
     }
   }
  ], function (err, data) {
    if(err){
      console.log("2")
      console.log(err)
    }
     res.json({
       status:"200",
       result:data
     })
        
  })
})
//点数发放申请
//存入point_log表
router.post('/pointLogAdd', (req, res) => {
  var index = req.body.index;
  var point_sum = req.body.point_sum;
  var issue_stage = req.body.issue_stage;
  PointLog.create({
    project_id: index,
    status: "待审核",
    point_sum: point_sum,
    issue_stage: issue_stage
  }, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      msg: "插入成功",
      result: data
    })
  })
});
//存入point_user_log表
router.post('/pointUserLogAdd', (req, res) => {
  var form = req.body.form
  PointUserLog.insertMany(form, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      msg: "插入成功",
      result: data
    })
  })
});

//"我管理的项目"
router.get("/projectListManage", (req, res) => {
  var tel=req.data.phone
  var mg=''
 Users.findOne({"tel":tel},function(err,data){
   if(data){
     mg=data.employee_id
     ProjectList.aggregate([{
      $lookup: {
        from: "employees",
        localField: "manager",
        foreignField: "_id",
        as: "employee"
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$employee",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "manager": mg,
        $or: [{
          "status": "PMO设定完成"
        }, {
          "status": "项目执行中"
        }, {
          "status": "PM结案申请阶段"
        }, {
          "status": "已结案（成功）"
        }, {
          "status": "已结案（失败）"
        }]
      }
    }
  ], function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
   }
 })
});
//"我参与的项目"
router.get("/projectListJoin", (req, res) => {
  var tel=req.data.phone
  var mb=''
 Users.findOne({"tel":tel},function(err,data){
   if(data){
     mb=data.employee_id
     console.log('mb',mb); 
     mb=mb.toString()
     ProjectList.aggregate([{
      $lookup: {
        from: "employees",
        localField: "manager",
        foreignField: "_id",
        as: "employee"
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$employee",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "members": {
          $in: [mb]
        },
        $or: [{
          "status": "PMO设定完成"
        }, {
          "status": "项目执行中"
        }, {
          "status": "PM结案申请阶段"
        }, {
          "status": "已结案（成功）"
        }, {
          "status": "已结案（失败）"
        }]
      }
    }
  ], function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
   }
 })
  
});

//“我的项目”PMO状态点击启动，改变项目状态
router.put("/start", (req, res) => {
  var index = req.body.index;
  ProjectList.findOneAndUpdate({
    _id: index
  }, {
    "$set": {
      status: "项目执行中"
    }
  }, {
    "new": true
  }, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});
//“我的项目”点击申请结案，改变项目状态
router.put("/end", (req, res) => {
  var index = req.body.index;
  ProjectList.findOneAndUpdate({
    _id: index
  }, {
    "$set": {
      status: "PM结案申请阶段"
    }
  }, {
    "new": true
  }, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});

module.exports = router