var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');

var Project_list = require('../../models/medal/projectManagement/projectList')
var Point_project = require('../../models/medal/PMO/pointProject')
var Point_user_log = require('../../models/medal/projectManagement/pointUserLog')
var Employee = require('../../models/employeeManagement/employee')
var Point_log = require('../../models/medal/projectManagement/pointLog')
var Bonuspool = require('../../models/salaryStructure/bonus_pool')

var ObjectId = mongoose.mongo.ObjectId;

// 列表页通过项目状态查找
router.get("/projectList", (req, res) => {
  var status = req.query.status;
  Project_list.aggregate([{
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      // 空的数组也拆分
      preserveNullAndEmptyArrays: true
    },
  },
  {
    $match: {
      // 匹配status
      "status": status
    }
  }
  ], function (err, doc) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: "200",
        result: doc
      })
    }
  })
});

// 列表页显示全部
router.get("/AllprojectList", (req, res) => {
  Project_list.aggregate([{
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      // 空的数组也拆分
      preserveNullAndEmptyArrays: true
    },
  },
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: "200",
        result: data
      })
    }
  })
});

// 新增项目

router.post("/projectList", (req, res) => {
  // 新增项目输入的data
  let project_data = req.body.data;
  Employee.findOne({
    "name": project_data.manager
  }, function (err, data) {
    employee_id = ObjectId(data._id)
    // 将获取到的employee的id赋给project_list的manager
    project_data.manager = employee_id
    if (data) {
      project_list_data = project_data
      // 新增一条project_list数据
      Project_list.create(project_list_data, function (err, data) {
        if (err) {
          res.json({
            status: 400
          })
        } else {
          let num = data.level.substring(1)
          let max_point = parseInt(num) * 200
          data.max_point = max_point
          data.save()
          res.json({
            status: 200,
            result: data
          })
        }
      })
    }
  })
})

// 编辑新增项目

router.put("/projectList", (req, res) => {
  let project_data = req.body.data;
  let _id = req.body.data._id;
  Employee.findOne({
    name: project_data.manager
  }, function (err, data) {
    employee_id = ObjectId(data._id)
    project_data.manager = employee_id
    let listdata = []
    if (data) {
      listdata = project_data
      Project_list.findOneAndUpdate({
        _id: _id
      }, {
          $set: listdata
        }, {
          new: true
        }, (err, data) => {
          if (err) {
            res.json({
              status: 400
            })
          } else {
            res.json({
              status: 200,
              result: data
            })
          }
        })
    }
  })
})

// 编辑详情页项目
router.put("/projectDetail", (req, res) => {
  let project_data = req.body.data;
  let _id = req.body.data._id;
  Employee.findOne({
    name: project_data.product.name
  }, function (err, data) {
    employee_id = ObjectId(data._id)
    project_data.manager = employee_id
    let listdata = []
    if (data) {
      listdata = project_data
      Project_list.findOneAndUpdate({
        _id: _id
      }, {
          $set: listdata
        }, {
          new: true
        }, (err, data) => {


          if (err) {
            res.json({
              status: 400
            })
          } else {
            let num = data.level.substring(1)
            let max_point = parseInt(num) * 200
            data.max_point = max_point
            data.save()
            res.json({
              status: 200,
              result: data
            })
          }
        })
    }
  })
})


// 列表页跳转详情页时通过id查找显示一条数据的项目信息
router.get("/projectListDetail", (req, res) => {
  var _id = req.query._id;
  Project_list.aggregate([{
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    },
  },
  {
    $match: {
      "_id": ObjectId(_id)
    }
  }
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      let num = data[0].level.substring(1)
      let max_point = parseInt(num) * 200
      data[0].max_point = max_point
      res.json({
        status: 200,
        result: data
      })
    }
  })
});

// 详情页获取项目成员
router.get('/project_employee', (req, res) => {
  var id = req.query._id;
  if (id) {
    var searchData = {
      "_id": id
    };
  }
  Project_list.findOne(searchData, (err, data) => {
    var arr = data.members;
    Employee.find({
      "_id": {
        "$in": arr
      }
    }, (err, data1) => {
      if (err) {
        res.json({
          status: 400
        })
      } else {
        res.json({
          status: 200,
          result: data1
        })
      }
    })
  })

})

// 点数发放申请单的详情页展示
router.get('/grantApply_pointUserLogs', (req, res) => {
  var _id = req.query._id; //project_id
  var point_log_id = req.query.point_log_id

  Point_user_log.aggregate([{
    $lookup: {
      from: "point_logs",
      localField: "point_log_id",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "product1"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    },
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product1",
      preserveNullAndEmptyArrays: true
    },
  },
  {
    $match: {
      "point_log_id": point_log_id
    }
  }
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})

// 点数发放申请单 Point_user_log 同意/驳回
router.put('/grantApply_pointUserLogs', (req, res) => {
  var agreeStatus = req.body.data_agree
  Point_user_log.find({
    point_log_id: agreeStatus.point_log_id
  }, function (err, data) {
    for (const i of data) {
      i.status = agreeStatus.status_agree
      i.save()
    }
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})

// 点数发放申请单 Point_log 同意/驳回
router.put('/grantApply_pointLogs', (req, res) => {
  var agreeStatus = req.body.data_agree
  Point_log.find({
    _id: agreeStatus.point_log_id
  }, function (err, data) {
    for (const i of data) {
      i.status = agreeStatus.status_agree
      i.save()
    }
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})

// 通过Project_list的id查找Point_user_logs的表内容 
// 在勋章点数状态中显示pm发放的点数和
router.get('/pointUserLogs', (req, res) => {
  var project_id = req.query.project_id;
  var searchAddPro = {};
  if (project_id) {
    searchAddPro = {
      "project_id": project_id
    }
  }
  Point_user_log.find(searchAddPro, (err, data) => {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})

// 新增为草稿后点击项目设定改变项目状态
router.put('/projectListById', function (req, res) {
  let data = req.body.data
  let _id = req.body.data._id;
  let status = req.body.data.status;
  Project_list.findOneAndUpdate({
    _id: _id
  }, {
      $set: {
        status: status
      }
    }, {
      new: true
    }, (err, data) => {
      if (err) {
        res.json({
          status: 400
        })
      } else {
        res.json({
          status: 200,
          result: data
        })
      }
    })
})

// 奖励项目列表页（结案分数超过4.8）
router.get("/rewardProjectList", (req, res) => {
  Project_list.aggregate([{
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    },
  },
  {
    $match: {
      "status": "已结案（成功）",
    }
  }
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
});


// 结案申请单列表页（项目状态 为 PM结案申请阶段 的所有）
router.get("/applyComplete", (req, res) => {
  Project_list.aggregate([{
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    },
  },
  {
    $match: {
      "status": "PM结案申请阶段"
    }
  }
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
});

// 审核 结案申请单
router.put('/applyComplete', function (req, res) {
  let data = req.body.data
  Project_list.findOneAndUpdate({
    _id: data._id
  }, {
      $set: {
        score: data.score,
        status: data.status
      }
    }, {
      new: true
    }, (err, data) => {
      if (err) {
        res.json({
          status: 400
        })
      } else {
        res.json({
          status: 200,
          result: data
        })
      }
    })
})

// 发放点数申请单列表页
// 先通过point_log的project_id去查对应的project_list表显示在列表页
// 后通过point_log的_id去查对应的point_user_log表显示在详情页
router.get("/applyGrantPoint", (req, res) => {
  Project_list.aggregate([{
    $lookup: {
      from: "point_logs",
      localField: "_id",
      foreignField: "project_id",
      as: "product"
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product1"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true
    },
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product1",
      preserveNullAndEmptyArrays: true
    },
  },


  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
});

// pmo发放点数列表页通过项目状态查找
router.get("/pmoProjectList", (req, res) => {
  var status = req.query.status;
  Project_list.aggregate([
    {
      $lookup: {
        from: "employees",
        localField: "manager",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      // 拆分子数组
      $unwind: {
        path: "$product",
        // 空的数组也拆分
        preserveNullAndEmptyArrays: true
      },
    },
    {
      $match: {
        // 匹配status
        "status": status
      }
    }
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
});

// // pmo发放点数列表页显示全部（已结案（成功）、已结案（失败）、项目执行中）
router.get("/AllPMOProjectList", (req, res) => {
  Project_list.aggregate([{
    $lookup: {
      from: "employees",
      localField: "manager",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    // 拆分子数组
    $unwind: {
      path: "$product",
      // 空的数组也拆分
      preserveNullAndEmptyArrays: true
    },
  },
  {
    $match: {
      "status": {
        $in: ["项目执行中", "已结案（成功）", "已结案（失败）"]
      }
    }
  }
  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
});

// 详情页的 pmo点数发放记录表（展示）
router.get('/pmoPointProject', (req, res) => {
  var _id = req.query._id;
  var searchAddPro = {};
  if (_id) {
    searchAddPro = {
      "project_id": _id
    }
  }
  Point_project.find(searchAddPro, (err, data) => {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})

// 新增 pmo点数发放记录 到 point_project表 和 project_list表
router.post("/pmoPointProject", (req, res) => {
  let project_data = req.body.data;
  Point_project.create(project_data, (err, data) => {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      Project_list.findOne({
        "_id": project_data.project_id
      }, function (err, data1) {
        if (project_data.stage == "项目执行中") {
          data1.progress_pm_point = project_data.pm_point
          data1.progress_cc_point = project_data.cc_point
        } else if (project_data.stage == "已结案（成功）") {
          data1.complete_pm_point = project_data.pm_point
          data1.complete_cc_point = project_data.cc_point
        } else if (project_data.stage == "奖励项目") {
          data1.reward_pm_point = project_data.pm_point
          data1.reward_cc_point = project_data.cc_point
        } else if (project_data.stage == "已结案（失败）") {
          data1.complete_pm_point = project_data.pm_point
          data1.complete_cc_point = project_data.cc_point
        }

        data1.save(function (err, data2) {
          res.json({
            status: 200,
            result: data2
          })
        })
      })
    }
  })
})




//判断是否有可发放的点数
//把各个阶段的不同类型综合
router.post("/cansendpoint", (req, res) => {
  // let projectId="5d6ba11bf65750aea5c87215"
  let projectId = req.body.projectId
  Point_project.aggregate([
    {
      $match: {
        project_id: ObjectId(projectId)
      }
    },

  ], function (err, data) {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      console.log(data)
      res.json({
        status: 200,
        result: data
      })
    }
  })
});





//  部门Performance计算

router.get("/performanceCalculate", (req, res) => {
  var per = 0;//部门performance在总公司的占比
  var perProject = 0;//部门勋章点数在总公司的占比
  var departmentPercent = [];//用来存放部门performance在总公司的占比的数组
  var departmentProPercent = [];//用来存放部门勋章点数在总公司的占比的数组
  var companyPerfor = 0;//公司全部人的performance
  var companyProject = 0;//公司全部人的勋章点数
  var perforPercent = [];//将算出来的每个部门的绩效奖金值以字段形式存入数组中
  var projectPercent = [];//将算出来的每个部门的项目奖金值以字段形式存入数组中
  var eachPerformance = [];//全局拿到个人绩效奖金
  var eachProject = [];//全局拿到个人项目奖金
  var eachFinalPerformance = [];
  //  部门performance计算
//这个是部门含有部门performance占比和部门绩效的数组，知识把最后的结果再存到这边
  var departmenthasper=[]
  Employee.aggregate([
    {
      $match: {
        "is_manager": false
      }
    },
    {
      $group: {
        "_id": { department_id: "$department_id" },
        "performance": { $sum: { $sum: ["$value_index", "$task_count"] } },//performance是部门所有人的performance总和
      }
    },
    {
      $project: {
        "_id": true,
        "performance": "$performance"
      }
    }
  ], (err, data) => {
    if (err) {
      res.json({
        status: "404",
      })
    } else {

      //  公司所有部门的performance总和
      data.forEach(item => {
        companyPerfor += (item.performance);
      })
      //  部门绩效
      data.forEach(item2 => {
        per = parseFloat((item2.performance / companyPerfor).toFixed(2))
        let dePerformancePercnet = {
          per: per
        }
        iterator = Object.assign(item2, dePerformancePercnet)
        // departmentPercent.push(per)
      })
      // console.log(data)
      Bonuspool.find({ period: "2019" }, (err, data1) => {
        if (err) {
          res.json({
            status: "404",
          })
        }else if(data1){
          // return res.json({
          //   result:data
          // })
          data.forEach(item3=>{
            //  部门绩效奖金  
            departPer = data1[0].chargePerfor *item3.per//每个部门的绩效奖金值
            let departmentperformanceMoney={
              departPer:departPer   //  部门绩效奖金
            }
            item3=Object.assign(item3,departmentperformanceMoney)
            departmenthasper.push(item3)
          })

          // console.log("含有绩效的部门数据")
          // console.log(data)

          //计算员工的个人绩效奖金  匹配不是主管的，然后员工id分组
          Employee.aggregate([
            {
              $match: {
                "is_manager": false
              }
            },
            {
              $group: {
                "_id": { _id: "$_id" },
                "employeeId": { $first: "$_id" },
                "eachValue_index": { $sum: "$value_index" },
                "eachTask_count": { $sum: "$task_count" },
                "departmentId": { $first: "$department_id" }
              }
            },
            {
              $project: {
                "_id": true,
                "eachValue_index": "$eachValue_index",
                "eachTask_count": "$eachTask_count",
                "departmentId": "$departmentId",
                "employeeId": "$employeeId"
              }
            }
          ],(err,data4)=>{
            data4.forEach(item4=>{
              data.forEach(item5=>{
                if((item4.departmentId).toString()==(item5._id.department_id).toString()){
                  console.log("same")
                 //  个人绩效奖金=部门绩效奖金 * 个人performance在部门的占比（个人performance/部门的performance）
                  let personalperformanceMoney= item5.departPer*((item4.eachValue_index+item4.eachTask_count)/item5.performance)
                  let eachPer={
                    eachPer:personalperformanceMoney
                  }
                  item4=Object.assign(item4,eachPer)
                }
              })
            })
            拿到个人绩效的数据
            console.log("item4")
            console.log("yuangonh ")
            console.log(data4)
          })
        }
      })
   


      //  奖金池中的值
      // Bonuspool.find({ period: "2019" }, (err, data1) => {
      //   if (err) {
      //     res.json({
      //       status: "404",
      //     })
      //   } else {

      //    
      //     //  个人绩效
      //     Employee.aggregate([//匹配不是主管的，然后员工id分组

      //       {
      //         $match: {
      //           "is_manager": false
      //         }
      //       },
      //       {
      //         $group: {
      //           "_id": { _id: "$_id" },
      //           "employeeId": { $first: "$_id" },
      //           "eachValue_index": { $sum: "$value_index" },
      //           "eachTask_count": { $sum: "$task_count" },
      //           "departmentId": { $first: "$department_id" }
      //         }
      //       },
      //       {
      //         $project: {
      //           "_id": true,
      //           "eachValue_index": "$eachValue_index",
      //           "eachTask_count": "$eachTask_count",
      //           "departmentId": "$departmentId",
      //           "employeeId": "$employeeId"
      //         }
      //       }
      //     ], (err, data) => {
      //       if (err) {
      //         res.json({
      //           status: "404",
      //         })
      //       } else {
      //         obj.forEach(item => {
      //           data.forEach(item2 => {
      //             if ((item2.departmentId).toString() === (item._id.department_id).toString()) {
      //               let eachPer = {
      //                 eachPer: item.departPer * ((item2.eachValue_index + item2.eachTask_count) / item.performance)
      //               }
      //               item2 = Object.assign(item2, item, eachPer)
      //               // console.log(item2);
      //               eachPerformance.push(item2);
      //             }
      //           })
      //         })//将这里的每个员工的值对应到相应部门中来，最后将obj和data放到一个数组中


      //         // 部门勋章点数计算
      //         Employee.aggregate([
      //           {
      //             $lookup: {
      //               from: "point_user_logs",
      //               localField: "_id",
      //               foreignField: "employee_id",
      //               as: "points"
      //             }
      //           },
      //           {
      //             $unwind: {
      //               path: "$points",
      //               preserveNullAndEmptyArrays: true
      //             }
      //           },
      //           {
      //             $match: {
      //               "points.status": "同意"
      //             }
      //           },
      //           {
      //             $group: {
      //               "_id": { department_id: "$department_id" },
      //               "departPoint": { $sum: { $sum: ["$points.point"] } }//departPoint是整个部门所有人相加勋章点数和
      //             }
      //           },
      //           {
      //             $project: {
      //               "_id": true,
      //               "departPoint": "$departPoint"
      //             }
      //           }
      //         ], (err, data) => {


      //           if (err) {
      //             res.json({
      //               status: "404",
      //             })
      //           } else {
      //             // 部门项目奖金


      //             data.forEach(item => {
      //               companyProject += (item.departPoint); //公司所有部门的勋章点数总和
      //             })

      //             for (const iterator of data) {
      //               perProject = parseFloat((iterator.departPoint / companyProject).toFixed(2))//  部门勋章点数在公司的占比

      //               departmentProPercent.push(perProject);
      //             }
      //             Bonuspool.find({ period: "2019" }, (err, data2) => {
      //               if (err) {
      //                 res.json({
      //                   status: "404",
      //                 })
      //               } else {
      //                 for (let i = 0; i < departmentProPercent.length; i++) {
      //                   // 部门项目奖金 
      //                   departProPer = data2[0].projectMedal * departmentProPercent[i];//每个部门对应的算出来的项目奖金

      //                   var departProPer = {
      //                     "departProPer": departProPer
      //                   }
      //                   projectPercent.push(departProPer)
      //                 }
      //                 var qty = data.map((item, index) => {

      //                   return { ...item, ...projectPercent[index] }
      //                 })
      //                 // console.log(qty);

      //                 // 个人项目奖金

      //                 Employee.aggregate([
      //                   {
      //                     $lookup: {
      //                       from: "point_user_logs",
      //                       localField: "_id",
      //                       foreignField: "employee_id",
      //                       as: "perPoints"
      //                     }
      //                   },
      //                   {
      //                     $unwind: {
      //                       path: "$perPoints",
      //                       preserveNullAndEmptyArrays: true
      //                     }
      //                   },
      //                   {
      //                     $match: {
      //                       "is_manager": false
      //                     }
      //                   },
      //                   {
      //                     $group: {
      //                       "_id": { _id: "$_id" },//用员工_id去分组
      //                       "employeeId": { $first: "$_id" },
      //                       "eachPoint": { $sum: "$perPoints.point" },//每个人的pm+cc总和
      //                       "departmentId": { $first: "$department_id" }//显示这个人的部门_id
      //                     }
      //                   },
      //                   {
      //                     $project: {
      //                       "_id": true,
      //                       _id: 1,
      //                       "eachPoint": "$eachPoint",
      //                       "departmentId": "$departmentId",
      //                       "employeeId": "$employeeId"
      //                     }
      //                   }
      //                 ], (err, data) => {
      //                   if (err) {
      //                     res.json({
      //                       status: "404",
      //                     })
      //                   } else {
      //                     qty.forEach(item => {
      //                       data.forEach(item2 => {
      //                         if ((item2.departmentId).toString() === (item._id.department_id).toString()) {
      //                           let eachProPer = {
      //                             eachProPer: item.departProPer * ((item2.eachPoint) / item.departPoint)
      //                           }
      //                           item2 = Object.assign(item2, item, eachProPer)
      //                           eachProject.push(item2)

      //                         }

      //                       })
      //                     })
      //                     eachProject.forEach(item => {
      //                       eachPerformance.forEach(item2 => {
      //                         if ((item2.employeeId).toString() === (item.employeeId).toString()) {
      //                           let eachFinalProPer = {
      //                             eachFinalProPer: item.eachProPer + item2.eachPer
      //                           }
      //                           item2 = Object.assign(item2, item, eachFinalProPer)
      //                           eachFinalPerformance.push(item2)

      //                         }

      //                       })
      //                     })
      //                     console.log(eachFinalPerformance);




      //                     res.json({
      //                       status: 200,
      //                       result: eachFinalPerformance
      //                     })

      //                   }
      //                 })
      //               }
      //             })
      //           }
      //         })
      //       }
      //     })
      //   }
      // })
    }
  })
});
//获取员工列表pm选项用
router.get('/allEmployeeForPM', (req, res) => {
  
  Employee.find({}, (err, data) => {
    if (err) {
      res.json({
        status: 400
      })
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})





module.exports = router