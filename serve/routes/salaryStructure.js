var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');
var Users = require('../models/admin/users.js')
var Bonuswait = require('../models/salaryStructure/bonus_wait')
var Employee = require('../models/employeeManagement/employee')
var Stock = require('../models/salaryStructure/stock')
var Category = require('../models/classify/category')
var Department = require("../models/departmentMananement/department")
var Bonuslog = require('../models/salaryStructure/bonus_log')
var Bonuspool = require('../models/salaryStructure/bonus_pool')
var Employee_salary_structure = require('../models/salaryList/employee_salary_structure')
var LavalMapping = require('../models/medal/projectQueries/level_mapping')
var PointUserLog = require('../models/medal/projectManagement/pointUserLog')
var ObjectId = mongoose.mongo.ObjectId;

//(绩效管理)界面的接口
//通过employee_id查找员工表渲染界面数据
router.get("/bonuswaitInfoPerfor", (req, res) => {
  var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $match: {
      "bonus_type": {
        $regex: bonus_type
      },
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    }

  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
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
});
//   通过员工(_id)和分红类型（绩效）搜索
router.get("/bonuswaitNsearch", (req, res) => {
  var _id = req.query._id
  var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $match: {
      "bonus_type": {
        $regex: bonus_type
      },
      "employee_id": ObjectId(_id)
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
});
//通过周期搜索
router.get("/bonuswaitPsearch", (req, res) => {
  var bonus_type = req.query.bonus_type
  var period = req.query.period
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $match: {
      period: {
        $regex: period
      },
      "bonus_type": {
        $regex: bonus_type
      },
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
});

//通过员工id和周期和分红类型（绩效）搜索
router.get("/bonuswaitSearch", (req, res) => {

  var _id = req.query._id
  var period = req.query.period
  var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $match: {
      "item._id": ObjectId(_id),
      period: {
        $regex: period
      },
      "bonus_type": {
        $regex: bonus_type
      },
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
});
// 绩效详情页
router.get("/bonuswaitPerforDetail", (req, res) => {
  var _id = req.query._id
  Bonuswait.find({
    "_id": _id
  }, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});
//*****************************************************//
//(分红管理)
//通过employee_id查找员工表渲染界面数据
router.get("/bonuswaitInfoShare", (req, res) => {
  var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $match: {
      "bonus_type": {
        $regex: bonus_type
      },
      "status":"核准"
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    }

  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },

  {
    $group: {
      "_id": {
        employee_id: "$employee_id",
      },
      employeename: {
        $first: "$item.name"
      },
      sum: {
        $sum: "$amount"
      },
      estimate_pay_date: {
        $first: "$estimate_pay_date"
      },
      period: {
        $first: "$period"
      }

    }
  },
  {
    $project: {
      id: true,
      employeename: "$employeename",
      sum: "$sum",
      estimate_pay_date: "$estimate_pay_date",
      period: "$period"

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
});
//   通过员工(_id)和分红类型（一般分红和股权分红）搜索
router.get("/bonuswaitShareNsearch", (req, res) => {
  var _id = req.query._id
  var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $match: {
      "bonus_type": {
        $regex: bonus_type
      },
      "employee_id": ObjectId(_id)
    }
  },
  {
    $group: {
      "_id": {
        employee_id: "$employee_id",
      },
      employeename: {
        $first: "$item.name"
      },
      sum: {
        $sum: "$amount"
      },
      estimate_pay_date: {
        $first: "$estimate_pay_date"
      },
      period: {
        $first: "$period"
      }
    }
  },
  {
    $project: {
      id: true,
      employeename: "$employeename",
      sum: "$sum",
      estimate_pay_date: "$estimate_pay_date",
      period: "$period"
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
});
//   通过周期和分红类型（一般分红和股权分红）搜索
router.get("/bonuswaitSharePsearch", (req, res) => {
  var bonus_type = req.query.bonus_type
  var period = req.query.period
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $match: {
      period: {
        $regex: period
      },
      "bonus_type": {
        $regex: bonus_type
      },
    }
  },
  {
    $group: {
      "_id": {
        employee_id: "$employee_id",
      },
      employeename: {
        $first: "$item.name"
      },
      sum: {
        $sum: "$amount"
      },
      estimate_pay_date: {
        $first: "$estimate_pay_date"
      },
      period: {
        $first: "$period"
      }
    }
  },
  {
    $project: {
      id: true,
      employeename: "$employeename",
      sum: "$sum",
      estimate_pay_date: "$estimate_pay_date",
      period: "$period"
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
});
//   通过员工id和周期和分红类型（一般分红和股权分红）搜索
router.get("/bonuswaitShareSearch", (req, res) => {

  var _id = req.query._id
  var period = req.query.period
  var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$item",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match: {
      "item._id": ObjectId(_id),
      period: {
        $regex: period
      },
      "bonus_type": {
        $regex: bonus_type
      },
    }
  },
  {
    $group: {
      "_id": {
        employee_id: "$employee_id",
      },
      employeename: {
        $first: "$item.name"
      },
      sum: {
        $sum: "$amount"
      },
      estimate_pay_date: {
        $first: "$estimate_pay_date"
      },
      period: {
        $first: "$period"
      }
    }
  },
  {
    $project: {
      id: true,
      employeename: "$employeename",
      sum: "$sum",
      estimate_pay_date: "$estimate_pay_date",
      period: "$period"
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
});
//  分红详情页
router.get("/bonuswaitShareDetail", (req, res) => {
  var _id = req.query._id
  var period = req.query.period
  Bonuswait.find({
    "employee_id": _id,
    "bonus_type": {
      $regex: "分红"
    },
    period: {
      $regex: period
    },
    "status":"核准"
  }, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});
/**--------------以上为分红管理和绩效管理------------------**/
// 计算分红  
router.get("/calculaCompanyShare", (req, res) => {
  Bonuspool.find({}, (err, data) => {
    for (const i of data) {
      // 公司的performance分红
      var comPerformanceShare = i.employeePerfor / i.projectMedal * i.normalShare
      // 公司的勋章点数分红
      var comMedalShare = i.normalShare - comPerformanceShare
      // 部门一般performance分红
      var departNormalPerforShare = i.departPerforRate * comPerformanceShare
      // 部门一般勋章点数分红
      var departNormalMedalShare = i.departMedalRate * comMedalShare
      // 部门一般分红
      var departNormalShare = departNormalPerforShare + departNormalMedalShare
    }
  },
    // 个人一般分红
    Employee.aggregate([{
      $group: {
        _id: '$department_id',
        departTaskCount: {
          $sum: '$task_count'
        }
      }
    },
    {
      $project: {
        _id: 1,
        departTaskCount: 1
      }
    }
    ], (err, data) => {
      if (err) {
        res.json({
          status: "404",
        })
      } else {
        var depart_id = []
        for (const i of data) {
          depart_id.push(i._id)
        }
        Employee.aggregate([{
          // 员工的department_id与部门的_id匹配
          $match: {
            "department_id": {
              $in: depart_id
            }
          },
        }], function (err, data1) {
          if (err) {
            res.json({
              status: "400",
            })
          } else {
            var taskCount = []
            var personTaskCount = {}
            for (const j of data) {
              for (const k of data1) {
                if ((j._id).toString() == (k.department_id).toString()) {
                  // 个人任务点数在部门的占比（个人任务点数 / 部门任务点数）
                  var perInDepartTaskCount = k.task_count / j.departTaskCount
                  // 一个含有 员工_id，员工所属部门任务点数，员工个人任务点数在部门的占比 的数组
                  personTaskCount = {
                    "_id": k._id,
                    "departmentTaskCount": j.departTaskCount,
                    "perInDepartTaskCount": perInDepartTaskCount.toFixed(2),
                  }
                  taskCount.push(personTaskCount)
                }
              }
            }
            res.json({
              status: "200",
              result: taskCount
            })

          }
        })
      }
    })
  )
});
// 计算个人绩效
router.get("/performanceCalculate", (req, res) => {
  var per = 0; //部门performance在总公司的占比
  var perProject = 0; //部门勋章点数在总公司的占比
  var departmentPercent = []; //用来存放部门performance在总公司的占比的数组
  var departmentProPercent = []; //用来存放部门勋章点数在总公司的占比的数组
  var companyPerfor = 0; //公司全部人的performance
  var companyProject = 0; //公司全部人的勋章点数
  var perforPercent = []; //将算出来的每个部门的绩效奖金值以字段形式存入数组中
  var projectPercent = []; //将算出来的每个部门的项目奖金值以字段形式存入数组中
  var eachPerformance = []; //全局拿到个人绩效奖金
  var eachProject = []; //全局拿到个人项目奖金
  var eachFinalPerformance = [];


  // 部门performance计算
  Employee.aggregate([{
    $match: {
      "is_manager": false
    }
  },
  {
    $group: {
      "_id": {
        department_id: "$department_id"
      },
      "performance": {
        $sum: {
          $sum: ["$value_index", "$task_count"]
        } //performance是部门所有人的performance总和

      }
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

      // 公司所有部门的performance总和
      data.forEach(item => {
        companyPerfor += (item.performance);
      })
      // 部门绩效
      for (const iterator of data) {
        per = parseFloat((iterator.performance / companyPerfor).toFixed(2))
        departmentPercent.push(per);
      }

      // 奖金池中的值
      Bonuspool.find({
        period: "2018-09-01~2019-09-01"
      }, (err, data1) => {
        if (err) {
          res.json({
            status: "404",
          })
        } else {
          for (let i = 0; i < departmentPercent.length; i++) {
            // 部门绩效奖金 
            departPer = data1[0].chargePerfor * departmentPercent[i]; //每个部门的绩效奖金值

            var departPer = {
              "departPer": departPer
            }
            perforPercent.push(departPer) //将每个部门的绩效奖金值以字段形式存入数组中

          }
          var obj = data.map((item, index) => {

            return {
              ...item,
              ...perforPercent[index]
            } //将每个部门的绩效奖金值对应芬芳到每个部门集合中
          })
          // 个人绩效
          Employee.aggregate([ //匹配不是主管的，然后员工id分组

            {
              $match: {
                "is_manager": false
              }
            },
            {
              $group: {
                "_id": {
                  _id: "$_id"
                },
                "employeeId": {
                  $first: "$_id"
                },
                "eachValue_index": {
                  $sum: "$value_index"
                },
                "eachTask_count": {
                  $sum: "$task_count"
                },
                "departmentId": {
                  $first: "$department_id"
                }
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
          ], (err, data) => {
            if (err) {
              res.json({
                status: "404",
              })
            } else {
              obj.forEach(item => {
                data.forEach(item2 => {
                  if ((item2.departmentId).toString() === (item._id.department_id).toString()) {
                    let eachPer = {
                      eachPer: item.departPer * ((item2.eachValue_index + item2.eachTask_count) / item.performance)
                    }
                    item2 = Object.assign(item2, item, eachPer)
         
                    eachPerformance.push(item2);
                  }
                })
              }) //将这里的每个员工的值对应到相应部门中来，最后将obj和data放到一个数组中


              // 部门勋章点数计算
              Employee.aggregate([{
                $lookup: {
                  from: "point_user_logs",
                  localField: "_id",
                  foreignField: "employee_id",
                  as: "points"
                }
              },
              {
                $unwind: {
                  path: "$points",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $match: {
                  "points.status": "同意"
                }
              },
              {
                $group: {
                  "_id": {
                    department_id: "$department_id"
                  },
                  "departPoint": {
                    $sum: {
                      $sum: ["$points.point"]
                    }
                  } //departPoint是整个部门所有人相加勋章点数和
                }
              },
              {
                $project: {
                  "_id": true,
                  "departPoint": "$departPoint"
                }
              }
              ], (err, data) => {
                if (err) {
                  res.json({
                    status: "404",
                  })
                } else {
                  // 部门项目奖金
                  data.forEach(item => {
                    companyProject += (item.departPoint); //公司所有部门的勋章点数总和
                  })

                  for (const iterator of data) {
                    perProject = parseFloat((iterator.departPoint / companyProject).toFixed(2)) //  部门勋章点数在公司的占比

                    departmentProPercent.push(perProject);
                  }
                  Bonuspool.find({
                    period: "2018-09-01~2019-09-01"
                  }, (err, data2) => {
                    if (err) {
                      res.json({
                        status: "404",
                      })
                    } else {
                      for (let i = 0; i < departmentProPercent.length; i++) {
                        // 部门项目奖金 
                        departProPer = data2[0].projectMedal * departmentProPercent[i]; //每个部门对应的算出来的项目奖金

                        var departProPer = {
                          "departProPer": departProPer
                        }
                        projectPercent.push(departProPer)
                      }
                      var qty = data.map((item, index) => {

                        return {
                          ...item,
                          ...projectPercent[index]
                        }
                      })

                      // 个人项目奖金

                      Employee.aggregate([{
                        $lookup: {
                          from: "point_user_logs",
                          localField: "_id",
                          foreignField: "employee_id",
                          as: "perPoints"
                        }
                      },
                      {
                        $unwind: {
                          path: "$perPoints",
                          preserveNullAndEmptyArrays: true
                        }
                      },
                      {
                        $match: {
                          "is_manager": false
                        }
                      },
                      {
                        $group: {
                          "_id": {
                            _id: "$_id"
                          }, //用员工_id去分组
                          "employeeId": {
                            $first: "$_id"
                          },
                          "eachPoint": {
                            $sum: "$perPoints.point"
                          }, //每个人的pm+cc总和
                          "departmentId": {
                            $first: "$department_id"
                          } //显示这个人的部门_id
                        }
                      },
                      {
                        $project: {
                          "_id": true,
                          _id: 1,
                          "eachPoint": "$eachPoint",
                          "departmentId": "$departmentId",
                          "employeeId": "$employeeId"
                        }
                      }
                      ], (err, data) => {
                        if (err) {
                          res.json({
                            status: "404",
                          })
                        } else {
                          qty.forEach(item => {
                            data.forEach(item2 => {
                              if ((item2.departmentId).toString() === (item._id.department_id).toString()) {
                                let eachProPer = {
                                  eachProPer: item.departProPer * ((item2.eachPoint) / item.departPoint)
                                }
                                item2 = Object.assign(item2, item, eachProPer)
                                eachProject.push(item2)

                              }

                            })
                          })
                          eachProject.forEach(item => {
                            eachPerformance.forEach(item2 => {
                              if ((item2.employeeId).toString() === (item.employeeId).toString()) {
                                let eachFinalProPer = {
                                  eachFinalProPer: item.eachProPer + item2.eachPer
                                }
                                item2 = Object.assign(item2, item, eachFinalProPer)
                                eachFinalPerformance.push(item2)

                              }

                            })
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
});
// 计算双薪
router.get("/calculaDoubelSalary", (req, res) => {
  var allId = req.query._id;
  var newArr = [];
  for (const iterator of allId) {
    newArr.push(ObjectId(iterator))
  }
  Employee_salary_structure.aggregate([{
    $match: {
      "employee_id": {
        $in: newArr
      }
    }
  },
  {
    $group: {
      "_id": {
        employee_id: "$employee_id"
      },
      "allSalaryAmount": {
        $sum: "$amount"
      },
    }
  },
  {
    $project: {
      "_id": true,
      "allSalaryAmountPoint": "$allSalaryAmount",
    }
  }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
     
    }
  })
})
//通过employee_id查找员工表中的name
router.get("/bonuswaitInfo", (req, res) => {
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$item",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
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
});

// 列表详情页----绩效
// 通过name查找分红表中的项
router.get("/bonuswaitName", (req, res) => {
  // var name = req.query.name
  var employee_id = req.query.employee_id
  var bonus_type = req.query.bonus_type
  var period = req.query.period
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$item",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match: {
      "employee_id": ObjectId(employee_id),
      "period": period,
      "bonus_type": bonus_type
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
});
//   通过姓名和周期搜索（不同表查询）
router.get("/bonuswaitSearch", (req, res) => {
  var name = req.query.name
  var period = req.query.period
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$item",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match: {
      "item.name": name,
      "period": period
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
});
//  改变很多项
//  传的参数 ：_id
//  请求方式 put
router.put('/updateItem', function (req, res) {
  var _id = req.body._id;
  var estimate_pay_date = req.body.date
  var type = req.body.type;
  Bonuswait.findOneAndUpdate({
    employee_id: ObjectId(_id)
  }, {
    $set: {
      "estimate_pay_date": estimate_pay_date,
      "bonus_type": type
    }
  }, {
    new: true
  },
    function (err, data) {
      if (err) {
        console.log(err)
      } else {
        res.json({
          status: '200',
          msg: "修改成功",
          result: data,
        })
      }
    })

});
//改变日期
router.put('/updatePaydate', function (req, res) {

  var _id = req.body._id;
  var estimate_pay_date = req.body.estimate_pay_date
  Bonuswait.findOneAndUpdate({
    employee_id: ObjectId(_id)
  }, {
      $set: {
        "estimate_pay_date": estimate_pay_date
      }
    }, {
      new: true
    },
    function (err, data) {
      if (err) {
        console.log(err)
      } else {
        res.json({
          status: '200',
          msg: "修改成功",
          result: data,
        })
      }
    })
});
//********************员工待发奖金档列表 *********************************//
//分红表中聚合查询员工表和部门表
router.get("/employeeShareInfo", (req, res) => {
  Bonuswait.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  },
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "employee"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$employee",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $match: {
      "status": {
        "$in": ["确认", "核准"]
      }
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
});
//分红表中通过员工姓名和周期来搜索
router.get("/employeeShareSearch", (req, res) => {
  var employeeid = req.query.name
  var chooseMonth = req.query.chooseMonth.substr(0, 7)
  Bonuswait.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  }, {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "employee"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$employee",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $match: {
      "employee._id": ObjectId(employeeid),
      "estimate_pay_date": {
        $regex: chooseMonth
      }
    },
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
});
//   通过姓名搜索（不同表查询）
router.get("/bonuswaitNsearch", (req, res) => {

  var name = req.query.name
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$item",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match: {
      "item.name": name,
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
});
//   通过周期搜索（不同表查询）
router.get("/bonuswaitPsearch", (req, res) => {
  var period = req.query.period
  Bonuswait.aggregate([{
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$item",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
  },
  {
    $match: {
      "period": period
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
});
//********************股票 *********************************//
//以员工姓名查询
router.get("/employeeInfo", (req, res) => {
  var name = req.query.name
  Employee.find({
    name: name
  }, (err, data) => {
    if (err) {
      res.json({
        status: "404",
      })
    } else {
      res.json({
        status: "200",
        result: data
      })
    }
  })
});
//   找到员工对应的股票
router.get("/employeeStock", (req, res) => {
  Employee.find({
    "remain_stock": {
      $gt: 0
    }
  }, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});
//选择员工
router.get("/chooseEmployee", (req, res) => {
  Employee.find({
    "remain_stock": 0
  }, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.json({
      status: '200',
      result: data,
    })
  })
});
//增加股票人员
router.post('/addEmployee', function (req, res) {
  var remain_stock = req.body.remain_stock;
  var _id = req.body._id;
  Employee.findOneAndUpdate({
    _id: req.body._id
  }, {
    $set: {
      "remain_stock": remain_stock
    }
  }, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})
// 删除操作
router.delete("/deleteEmployee", (req, res) => {
  Employee.findOneAndUpdate({
    _id: req.body._id
  }, {
    $set: {
      "remain_stock": 0
    }
  }, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })

});
//员工搜索接口
router.get("/searchEmployee", (req, res) => {
  var _id = req.query._id
  Employee.find({
    _id: _id
  }, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      res.json({
        status: 200,
        result: data
      })
    }
  })
});
//通过department_id查找部门表中的name
router.get("/departmentInfo", (req, res) => {
  var tel=req.data.phone
  var employeeid=''
 Users.findOne({"tel":tel},function(err,data){
     if(data){
   employeeid=data.employee_id
   Employee.aggregate([
    {
      $lookup: {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "department"
      },
    },
    {
      $unwind: { // 拆分子数组
        path: "$department",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "department.manager_id": employeeid
      }
    },
    {
      $lookup: {
        from: "bonuswaits",
        localField: "_id",
        foreignField: "employee_id",
        as: "bonuswait"
      }
    },

    {
      $unwind: { // 拆分子数组
        path: "$bonuswait",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    }
  ], function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    if(data.length>0){
    res.json({
      status: '200',
      result: data,
    })
  }
  else{
    res.json({
      status: 401,
      result: [],
      msg:"您不是部门主管无法管理部门员工奖金情况"
  })
  }
  })
     }})
 
});

//valueIndex中用到的部分
router.get("/allValueIndex", (req, res) => {
  Employee.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
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
});
//   通过员工_id搜索（不同表查询）
router.get("/departmentSearchvi", (req, res) => {
  var _id = req.query._id;
  Employee.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  }, {
    $lookup: {
      from: "bonuswaits",
      localField: "_id",
      foreignField: "employee_id",
      as: "bonuswait"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$bonuswait",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $match: {
      "_id": ObjectId(_id),
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
});
// 个人股票数详情 
router.get("/managestock", (req, res) => {
  Stock.find({
    employee_id: req.query._id
  }, (err, data) => {
    if (err) {
      res.json({
        status: "404",
      })
    } else {
      res.json({
        status: "200",
        result: data
      })
    }
  })
});
// //编辑是按index来计算前面的数据的remain_stock 更改的后面的的所有数据的remain_qty都将会发生变化
router.put("/updateStock", (req, res) => {
  var employeeid = req.body.employee_id
  var stockid = req.body._id
  var transaction_time = req.body.transaction_time
  var qty = req.body.qty
  var transaction_type = req.body.type
  var lastqtydata = 0
  Stock.find({ "employee_id": employeeid }, (err, data1) => {
    if (data1) {
      let currrindex = 0
      let loadcurr = []
      let arr = []
      data1.forEach((item, index) => {
        if (stockid.toString() == (item._id).toString()) {
          currrindex = index
          data1[currrindex].qty = qty
          data1[currrindex].transaction_type = transaction_type
          data1[currrindex].transaction_time = transaction_time
          for (let i = currrindex; i < data1.length; i++) {
            let k = i
            if (data1[k].transaction_type == "购买" || data1[k].transaction_type == "发放") {
              if (k == 0) {
                data1[k].remain_qty = qty
                data1[k].qty = qty
              } else {

                data1[k].remain_qty = Number(data1[k - 1].remain_qty) + data1[k].qty
              }
            } else if (data1[k].transaction_type == "卖出" || data1[k].transaction_type == "转移") {
              if (k == 0) {
                data1[k].remain_qty = qty
                data1[k].qty = qty
              } else {
                data1[k].remain_qty = Number(data1[k - 1].remain_qty) - data1[k].qty
              }
            }
            lastqtydata = data1[data1.length - 1].remain_qty
            loadcurr.push(data1[k])
            arr.push(data1[k]._id)
          }
        }
        return loadcurr, arr
      })
      Employee.findOneAndUpdate({
        _id: employeeid
      },
        {
          $set: {
            remain_stock: lastqtydata,
          }
        },
        function (err, da) {
          if (err) {
            res.json({
              msg: "失败"
            })
          } else if (da) {
            Stock.find({ _id: { $in: arr } }, function (err, data) {
              if (data) {
                let k = 0

                data.forEach((item, index) => {
                  loadcurr.forEach(item2 => {
                    if ((item2._id).toString() == (item._id).toString()) {
                      item.transaction_type = item2.transaction_type,
                        item.transaction_time = item2.transaction_time,
                        item.remain_qty = item2.remain_qty,
                        item.qty = item2.qty
                    }
                  })
                  item.save()
                })
                res.json({
                  status: '200'
                })
              }
            })
          }
        })

    }
  })
})
//增加股票交易记录 添加的一个和上面的一个数据的remain_qty来计算改条数据的remain_qty
router.post('/addStock', function (req, res) {
  var datetime = new Date()
  // 前端传过来的参数
  var _id = req.body._id;
  var transaction_type = req.body.transaction_type;
  var qty = req.body.qty;
  var transaction_time = req.body.transaction_time;
  var remain_qty = req.body.remain_qty;
  // 定义的两个中间变量
  var totalStock;
  var last_remain_qty;
  // var last_remain_stock;
  Stock.find({
    employee_id: _id
  }, function (err, data) {
    // 先去股票表中找是否存在数据
    if (data.length > 0) {
      var L = data.length;
      for (let i = 0; i < data.length; i++) {
        // 循坏所有的data再拿到数据的最后一条中的remain_qty
        last_remain_qty = data[L - 1].remain_qty;
        // last_remain_stock=data[L].remain_qty;
      }
      if (transaction_type == "购买" || transaction_type == "发放") {
        totalStock = Number(qty) + Number(last_remain_qty);
      } else {
        totalStock = Number(last_remain_qty) - Number(qty);
     
      }
      Stock.insertMany({
        employee_id: _id,
        transaction_type: transaction_type,
        transaction_time: transaction_time,
        remain_qty: totalStock,
        qty: qty,
      }, function (err, data) {
        if (err) {
          console.log(err)
        } else {
          Employee.findOneAndUpdate({
            _id: _id
          }, {
            $set: {
              remain_stock: data[0].remain_qty
            }
          },
            function (err, data) {
              res.json({
                status: '200',
                msg: "插入成功",
                result: data,
              })
            })

        }
      })
    }
    //  如果没有数据,要用传过来的值首次进行计算
    else if (data.length <= 0) {
      totalStock = parseInt(qty);
      Stock.insertMany({
        employee_id: _id,
        transaction_type: transaction_type,
        transaction_time: transaction_time,
        remain_qty: totalStock,
        qty: qty,
      }, function (err, data) {
        if (err) {
          console.log(err)
        } else {
          Employee.findOneAndUpdate({
            _id: _id
          }, {
            $set: {
              remain_stock: data[0].remain_qty
            }
          },
            function (err, data) {
              res.json({
                status: '200',
                msg: "插入成功",
                result: data,
              })
            })
        }
      })
    }

  })
});
//// 删除操作
router.delete("/deleteStock", (req, res) => {
  let stockid = req.body._id
  let employee_id = req.body.employee_id
  let updata = []
  let currindex = 0
  Stock.find({
    "employee_id": employee_id
  }, function (err, data) {
    if (err) {
      console.log(err)
    } else if (data) {
      data.forEach((item, index) => {
        if ((item._id).toString() == stockid.toString()) {
          currindex = index;
          data.splice(index, 1)
        }
      })

      Stock.deleteOne({
        _id: req.body._id
      }, function (err, data1) {
        if (err) {
          console.log(err)
        }
      })
      for (let i = currindex; i < data.length; i++) {

        if (data[i].transaction_type == "购买" || data[i].transaction_type == "发放") {
          if (i == 0) {
            data[i].remain_qty = data[i].qty
          } else {
            data[i].remain_qty = data[i - 1].remain_qty + data[i].qty
          }
        } else if (data[i].transaction_type == "转移" || data[i].transaction_type == "卖出") {
          if (i == 0) {
            data[i].remain_qty = -data[i].qty
          } else {
            data[i].remain_qty = data[i - 1].remain_qty - data[i].qty
          }
        }
        updata.push(data[i])
      }
      if (updata.length > 0) {

        if (updata.length == data.length) {
          const finalStock = updata[updata.length - 1].remain_qty
          Employee.findOneAndUpdate({
            _id: employee_id
          }, {
            $set: {
              "remain_stock": finalStock
            }
          }, function (err, data) {
          })
          var isShow = false;
          (async function () {
            await new Promise((resolve, reject) => {
              updata.forEach(item => {
                Stock.findOneAndUpdate({
                  _id: ObjectId(item._id)
                }, {
                  $set: {
                    transaction_type: item.transaction_type,
                    transaction_time: item.transaction_time,
                    remain_qty: item.remain_qty,
                    qty: item.qty
                  }
                }, {
                  new: true
                },
                  function (err, data6) {
                    if (err) {
                      console.log(err)
                    } else {
                      resolve(isShow = true)
                    }
                  })
              })
            })
            if (isShow == true) {
              res.json({
                status: "200"
              })
            }
          })()
        }


        else {
          const finalStock = updata[updata.length - 1].remain_qty
          Employee.findOneAndUpdate({
            _id: employee_id
          }, {
            $set: {
              "remain_stock": finalStock
            }
          }, function (err, data) {
          })
          var isShow = false;
          (async function () {
            await new Promise((resolve, reject) => {
              updata.forEach(item => {
                Stock.findOneAndUpdate({
                  _id: ObjectId(item._id)
                }, {
                  $set: {
                    transaction_type: item.transaction_type,
                    transaction_time: item.transaction_time,
                    remain_qty: item.remain_qty,
                    qty: item.qty
                  }
                }, {
                  new: true
                },
                  function (err, data6) {
                    if (err) {
                      console.log(err)
                    } else {
                      resolve(isShow = true)
                    }
                  })
              })
            })
            if (isShow == true) {
              res.json({
                status: "200"
              })
            }
          })()
        }
      } else if (updata.length == 0) {
        if (data.length > 0) {
          const finalStock = data[data.length - 1].remain_qty
          Employee.findOneAndUpdate({
            _id: employee_id
          }, {
            $set: {
              "remain_stock": finalStock
            }
          }, function (err, data) {
            res.json({
              status: 200
            })
          })
        } else {
          if (data.length == 0) {
            Employee.findOneAndUpdate({
              _id: employee_id
            }, {
              $set: {
                "remain_stock": 0
              }
            }, function (err, data) {
              res.json({
                status: "200"
              })
            })
          }
        }
      }
    }
  })
});
//---------------------奖金部分---------------------------------------
// 奖金池创建
router.post("/addBonusPool", (req, res) => {
  var bonusData = {
    period: req.body.period,
    employeePerfor: req.body.employeePerfor,
    chargePerfor: req.body.chargePerfor,
    projectMedal: req.body.projectMedal,
    normalShare: req.body.normalShare,
    equityShare: req.body.equityShare
  }
  Bonuspool.create(bonusData, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      res.json({
        status: 200,
        result: data
      })
    }

  })
})
// 检查奖金池是否有已录入数据，有则显示最后一条
router.get("/BonusPool", (req, res) => {
  Bonuspool.find({},function (err, data) {
    if (err) {
      console.log(err)
    } if(data.length>0){
      res.json({
        status: 200,
        result: data[data.length-1]
      })
    }else{
      res.json({
        status: 400,
        result:{}
      })
    }

  })
})
// ------------------奖金计算开始 ------------------------
//   奖金计算页面   通过姓名和周期搜索（不同表查询）
router.get("/departmentSearch", (req, res) => {
  var name = req.query.name
  Employee.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  }, {
    $lookup: {
      from: "bonuswaits",
      localField: "_id",
      foreignField: "employee_id",
      as: "bonuswait"
    }
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$bonuswait",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $match: {
      "name": name,
      // "bonuswait.period":period
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
});
// 奖金计算 
router.get("/calculateList", (req, res) => {
  Employee.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
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
});
// 奖金计算存储记录
//  奖金计算存储记录
router.put('/createRecord', function (req, res) {
  var employee_id = req.body._id
  var employee_ids = []
  employee_id.forEach(item => {
    employee_ids.push(ObjectId(item._id))
  })
  var companyPerfor = 0;  //公司全部人的performance
  var companyPoint = 0;  //公司全部人的部门勋章点数
  var bonus_type = req.body.type
  var period = req.body.period
  var estimate_pay_date = req.body.date
  
  var bonus_id = ""
  var bonuslog_data = {
    estimate_pay_date: estimate_pay_date,
    period: period,
    bonus_type: bonus_type
  }
  let isusedataarr = []
  Category.find({ "is_use": true }, function (err, data) {
    if (data) {
      data.forEach(item => {
        isusedataarr.push((item._id).toString())
      })
    }
  })
  Bonuswait.find({
    "employee_id": { $in: employee_ids },
    "period": period,
    "bonus_type": bonus_type
  }, (err, data) => {
    if (data.length > 0) {
      data.forEach(item => {
        let k = employee_ids.indexOf(item.employee_id)
        employee_ids.splice(k, 1)
      })
    }
    return
  })
  Bonuslog.create(bonuslog_data, function (err, data) {
    if (data) {
      bonus_id = data._id
      if (bonus_type) {
        if (bonus_type == "双薪") {
          Employee_salary_structure.aggregate([{
            $match: {
              "employee_id": {
                "$in": employee_ids
              }
            }
          },
          {
            $group: {
              _id: "$employee_id",
              basedata: {
                $push: {
                  category_id: "$category_id",
                  amount: "$amount",
                  grade_id: "$grade_id",
                  category_type: "$category_type"
                }
              },
            }
          },
          {
            $project: {
              //  这里的_id是员工的employee
              "_id": true,
              "basedata": true,

              "period": data.period,
              "bonus_type": data.bonus_type,
              "estimate_pay_date": data.estimate_pay_date
            }
          },
          {
            $lookup: {
              from: "employees",
              localField: "_id",
              foreignField: "_id",
              as: "product"
            }
          },
          {
            $unwind: {
              path: "$product",
              preserveNullAndEmptyArrays: true
            }
          },
          ], function (err, data1) {
            let isShow = false;
            (async function () {
              await new Promise((resolve, reject) => {
                data1.forEach(i => {
                  let allSalaryAmountPoint = 0
                  i.basedata.forEach(k => {
        
                    if (isusedataarr.indexOf((k.category_id).toString()) != -1) {
                      allSalaryAmountPoint += k.amount
                    }
                  })
                  var bonuswait_data = {
                    period: i.period,
                    amount: allSalaryAmountPoint,
                    employee_id: ObjectId(i._id),
                    estimate_pay_date: i.estimate_pay_date,
                    is_paid: false,
                    status: "草稿",
                    bonus_type: i.bonus_type,
                    department_id: ObjectId(i.product.department_id),
                    origin_amount: i.allSalaryAmountPoint,
                    bonus_log_id: ObjectId(bonus_id)
                  }
                  Bonuswait.create(bonuswait_data, function (err, data) {
                    if (err) {
                      reject(err)
                    } else if (data) {
                      resolve(isShow = true)
                    }
                  })
                })
              })
              if (isShow == true) {
                res.json({
                  status: "200",
                  msg: "success",
                  result: data
                })
              } else {
                res.json({
                  status: "500"
                })
              }
            })()
          })

        } else if (bonus_type == "一般分红") {
          //  先找两个占比
          //    部门performance在公司的占比
          Employee.aggregate([{
            $group: {
              "_id": {
                department_id: "$department_id"
              },
              "performance": {
                $sum: {
                  $sum: ["$value_index", "$task_count"]
                }  //performance是部门所有人的performance总和
              }
            }
          },
          {
            $project: {
              "_id": true,
              //  部门performance
              "performance": "$performance"
            }
          }
          ], (err, data3) => {
            if (err) {
              res.json({
                status: "404",
              })
            } else {
              // 公司所有部门的performance总和
              var alldepartmentid = []
              data3.forEach(item => {
                companyPerfor += (item.performance)

                alldepartmentid.push(item._id.department_id)
              })
              var obj = {
                "companyPerfor": companyPerfor
              }
     
              data3.forEach(i => {
                // 部门performance在公司的占比（部门performance / 全公司的performance）
                var departPerforScale = i.performance / companyPerfor
                var obj1 = {
                  "departPerforScale": departPerforScale
                }
                Object.assign(i, obj, obj1)
              })
              // 部门勋章点数计算
              Employee.aggregate([{
                $lookup: {
                  from: "point_user_logs",
                  localField: "_id",
                  foreignField: "employee_id",
                  as: "points"
                }
              },
              {
                $unwind: {
                  path: "$points",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $match: {
                  "points.status": "同意"
                }
              },
              {
                $group: {
                  "_id": {
                    department_id: "$department_id"
                  },
                  //departPoint是整个部门所有人相加勋章点数和
                  "employeeinfoa": {
                    $push: {
                      employeeid: "$_id",
                      issue_date: "$points.issue_date",
                      point: "$points.point",
                      department_id: "$department_id"
                    }
                  }
                }
              },
              
              {
                $project: {
                  "_id": 1,
                  "period": "$period",
                  "employeeinfoa": true,
                  "departPoint": true
                }
              }
              ], (err, data4) => {
                if (err) {
                  res.json({
                    status: "404",
                  })
                } else if (data4) {
                  if (data4.length > 0) {
                    let tag = period.indexOf("~")
                    let begintime = period.slice(0, tag).replace(/-/g, "/")
                    let endtime = period.slice(tag + 1).replace(/-/g, "/")
                    let departPoint = 0
                    data4.forEach(s => {
                      if (s.employeeinfoa) {
                        s.employeeinfoa.forEach(k => {
                          k.issue_date = (k.issue_date).replace(/-/g, "/")
                          if (k.issue_date <= endtime && k.issue_date >= begintime) {
                            departPoint += k.point
                          }
                        })
                        Object.assign(s,{"departPoint":departPoint})
                      }
                    })
                    data4.forEach(item => {
                      //公司所有部门的勋章点数总和
                      companyPoint += (item.departPoint);
                    })
                    data4.forEach(item => {
                      //针对有pm，cc的部门
                      // if(companyPoint!==0){
                      // 部门勋章点数在公司的占比（部门勋章点数 / 全公司的勋章点数）
                      var departPointScale = item.departPoint / companyPoint
                      // }else{
                      // var departPointScale=0
                      // }
                      var obj3 = {
                        "departPointScale": departPointScale
                      }
                      Object.assign(item, obj3)

                    })
                  }

                  Bonuspool.find({
                    period: period
                  }, (err, data5) => {

                    if (data5.length > 0) {
                      // 公司的performance分红
                      var comPerformanceShare = data5[0].employeePerfor / data5[0].projectMedal * data5[0].normalShare

                      // 公司的勋章点数分红
                      var comMedalShare = data5[0].normalShare - comPerformanceShare
                      data3.forEach(j => {
                        // 部门一般performance分红 = 部门performance在公司的占比（部门performance / 全公司的performance）* 公司的 performance分红
                        var departNormalPerforShare = {
                          "departNormalPerforShare": j.departPerforScale * comPerformanceShare
                        }

                        Object.assign(j, departNormalPerforShare)
                      })
                      data4.forEach(k => {
                        // 部门一般勋章点数分红 = 部门勋章点数在公司的占比（部门勋章点数 / 全公司的勋章点数）* 公司的 勋章点数分红
                        var departNormalMedalShare = {
                          "departNormalMedalShare": k.departPointScale * comMedalShare
                        }
                        Object.assign(k, departNormalMedalShare)
                      })
                      data3.forEach(i => {
                        if (data4.length > 0) {
                          var pcdata=[]
                         
                          //有pm，cc的部门数据
                          data4.forEach(j => {
                            if (i._id.department_id.toString() == j._id.department_id.toString()) {
                              // 部门一般分红
                          
                              pcdata.push((j._id.department_id).toString())
                              var departNormalShare = {
                                "departNormalShare": i.departNormalPerforShare + j.departNormalMedalShare
                              }
                              Object.assign(i, departNormalShare)
                              Object.assign(j, departNormalShare)
                            }
                          })
                          //针对于没有pm，cc点数的部门
                         if(pcdata.indexOf((i._id.department_id).toString())==-1){   //没有的数据
                        
                          var departNormalShare = {
                            "departNormalShare": i.departNormalPerforShare
                          }
                          Object.assign(i, departNormalShare)
                         }
                        }

                      })
          
                      // 个人一般分红
                      Employee.aggregate([{
                        $group: {
                          _id: '$department_id',
                          departTaskCount: {
                            $sum: '$task_count'
                          }
                        }
                      },
                      {
                        $project: {
                          _id: 1,
                          departTaskCount: 1
                        }
                      }
                      ], (err, data6) => {
                        if (err) {
                          res.json({
                            status: "404",
                          })
                        } else {
                          var depart_id = []
                          for (const i of data6) {
                            depart_id.push(i._id)
                          }
                  
                          Employee.find({
                            "_id": {
                              "$in": employee_ids
                            }
                          }, (err, data7) => {
                            if (err) {
                              res.json({
                                status: "404",
                                msg: "没有数据",
                              })
                            } else {
                          
                              let isShow = false;
                              (async function go() {
                                await new Promise((resolve, reject) => {
                                  for (const j of data6) {
                                    for (const k of data7) {
                                      if ((j._id).toString() == (k.department_id).toString()) {
                                        // 个人任务点数在部门的占比（个人任务点数 / 部门任务点数）
                                        if (j.departTaskCount == 0) {
                                          var perInDepartTaskCount = 0
                                        } else {
                                          var perInDepartTaskCount = k.task_count / j.departTaskCount
                                        }


                                        data3.forEach(a => {
                                          if (a._id.department_id.toString() == j._id.toString()) {
                                            //  个人一般分红
                            
                                            var personNormalShare = +(a.departNormalShare * perInDepartTaskCount).toFixed(2)
                                            var bonuswait_data = {
                                              period: req.body.period,
                                              amount: personNormalShare,
                                              employee_id: ObjectId(k._id),
                                              estimate_pay_date: estimate_pay_date,
                                              is_paid: false,
                                              status: "草稿",
                                              bonus_type: req.body.type,
                                              department_id: ObjectId(k.department_id),
                                              origin_amount: personNormalShare,
                                              bonus_log_id: ObjectId(bonus_id)
                                            }
                                            Bonuswait.create(bonuswait_data, function (err, data) {
                                              if (err) {
                                                reject(err)
                                              } else if (data) {
                                                resolve(isShow = true)
                                              }
                                            })
                                          }
                                        })
                                      }
                                    }
                                  }
                                })
                                if (isShow == true) {
                                  res.json({
                                    status: "200",
                                    msg: "计算成功",
                                    result: data
                                  })
                                } else {
                                  res.json({
                                    status: "400",
                                    msg: "计算失败"
                                  })
                                }
                              })()

                            }
                          })
                        }
                      })

                    } else {
                      res.json({
                        status: "400",
                        msg: "没有对应的奖金池金额"
                      })

                    }
                  })
                }
              })
            }
          })
        } else if (bonus_type == "绩效") {
          // 先找两个占比
          //  部门performance在公司的占比
          Employee.aggregate([
            {
              $match: {
                is_manager: false
              }
            },
            {

              $group: {
                "_id": {
                  department_id: "$department_id"
                },
                //performance是部门所有人的performance总和
                "performance": {
                  $sum: {
                    $sum: ["$value_index", "$task_count"]
                  }
                }
              }
            },
            {
              $project: {
                "_id": true,
                //  部门performance
                "performance": "$performance"
              }
            }
          ], (err, data3) => {
            if (err) {
              res.json({
                status: "404",
              })
            } else {
              // 公司所有部门的performance总和
              data3.forEach(item => {
                companyPerfor += (item.performance)
              })
              var obj = {
                "companyPerfor": companyPerfor
              }
              data3.forEach(i => {
                // 部门performance在公司的占比
                var departPerforScale = i.performance / companyPerfor
                var obj1 = {
                  "departPerforScale": departPerforScale
                }
                Object.assign(i, obj, obj1)
              })
              // 部门勋章点数计算
              Employee.aggregate([{
                $lookup: {
                  from: "point_user_logs",
                  localField: "_id",
                  foreignField: "employee_id",
                  as: "points"
                }
              },
              {
                $unwind: {
                  path: "$points",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $match: {
                  "points.status": "同意"
                }
              },
              {
                $group: {
                  "_id": {
                    department_id: "$department_id"
                  },
                  //departPoint是整个部门所有人相加勋章点数和
                  "employeeinfoa": {
                    $push: {
                      employeeid: "$_id",
                      issue_date: "$points.issue_date",
                      point: "$points.point",
                      department_id: "$department_id"
                    }
                  }
                }
              },
                  {
                    $project: {
                      "_id": 1,
                      "period": "$period",
                      "employeeinfoa": true,
                      "departPoint": true
                    }
                  }
              ], (err, data4) => {
                if (err) {
                  res.json({
                    status: "404",
                  })
                } else if (data4) {
                  let tag = period.indexOf("~")
                  let begintime = period.slice(0, tag).replace(/-/g, "/")
                  let endtime = period.slice(tag + 1).replace(/-/g, "/")
                  let departPoint = 0
                  data4.forEach(s => {
                    if (s.employeeinfoa) {
                      s.employeeinfoa.forEach(k => {
                        k.issue_date = (k.issue_date).replace(/-/g, "/")
                        if (k.issue_date <= endtime && k.issue_date >= begintime) {
                          departPoint += k.point
                        }
                      })
                      Object.assign(s,{"departPoint":departPoint})
                    }
                  })
                
                  data4.forEach(item => {
                    //公司所有部门的勋章点数总和
                    companyPoint += (item.departPoint);
                  })
                  var obj2 = {
                    "companyPoint": companyPoint
                  }
                  data4.forEach(i => {
                    // 部门勋章点数在公司的占比
                    var departPointScale = i.departPoint / companyPoint
                    var obj3 = {
                      "departPointScale": departPointScale
                    }
                    Object.assign(i, obj2, obj3)
                  })
                  Bonuspool.find({
                    period: period
                  }, (err, data5) => {
                    if (data5.length > 0) {
                      // 部门绩效奖金
                      data3.forEach(i => {
                        var departPerformanceBonus = {
                          "departPerformanceBonus": data5[0].employeePerfor * i.departPerforScale
                        }
                        Object.assign(i, departPerformanceBonus)
                      })
                  
                      // 部门项目奖金
                      data4.forEach(j => {
                        var departProjectBonus = {
                          "departProjectBonus": data5[0].projectMedal * j.departPointScale
                        }
                        Object.assign(j, departProjectBonus)
                      })
     
                      PointUserLog.find({}, (err, data10) => {
                        let point_arr = [];
                        data10.forEach(i => {
                          point_arr.push(i.employee_id.toString())
                        })
                        let isShow = false;
                        (async function () {
                          await new Promise((resolve, reject) => {
                            employee_ids.forEach(i => {
                              // 没有 PM 和 CC 的时候 
                              if (point_arr.indexOf(i.toString()) == -1) {
                       
                                Employee.aggregate([{
                                  $match: {
                                    "_id": ObjectId(i),
                                    "is_manager": false,
                                  }
                                },
                                ], (err, data7) => {
                                  // if(data4.length>0){
                                  data7.forEach(k => {
                                    data3.forEach(i => {
                                      // data4.forEach(j => {
                                      if (((k.department_id).toString()) == ((i._id.department_id).toString()) && ((k.department_id).toString())) {
                                        let personalPerformanceBonus = i.departPerformanceBonus * ((k.value_index + k.task_count) / i.performance)
                                        let personlProjectBonus = 0
                                        let personalPerformance = +(personalPerformanceBonus + personlProjectBonus).toFixed(2)
                                  

                                        var bonuswait_data = {
                                          period: req.body.period,
                                          amount: personalPerformance,
                                          employee_id: ObjectId(k._id),
                                          estimate_pay_date: estimate_pay_date,
                                          is_paid: false,
                                          status: "草稿",
                                          bonus_type: req.body.type,
                                          department_id: ObjectId(k.department_id),
                                          origin_amount: personalPerformance,
                                          bonus_log_id: ObjectId(bonus_id)
                                        }
                                        Bonuswait.create(bonuswait_data, function (err, data) {
                                          if (err) {
                                            res.json({
                                              status: 400,
                                            })
                                          } else {
                          
                                            resolve(isShow = true)
                                          }
                                        })
                                      }
                                      // })
                                    })
                                  })

                                  // }else{

                                  // }

                                })
                              } else {
                                // 正常有 PM 和 CC 的时候
                           

                                Employee.aggregate([{
                                  $match: {
                                    "_id": ObjectId(i),
                                    "is_manager": false,
                                  }
                                },
                                {
                                  $lookup: {
                                    from: "point_user_logs",
                                    localField: "_id",
                                    foreignField: "employee_id",
                                    as: "points"
                                  }
                                },
                                {
                                  $unwind: {
                                    path: "$points",
                                    preserveNullAndEmptyArrays: true
                                  }
                                },
                                {
                                  $match: {
                                    "points.status": "同意"
                                  }
                                },
                                {
                                  $group: {
                                    "_id": {
                                      _id: "$_id",
                                    }, //用员工_id去分组
                                    "employee_id": {
                                      $first: "$_id"
                                    },
                                    "eachPoint": {
                                      $sum: "$points.point"
                                    }, //每个人的pm+cc总和
                                    "department_id": {
                                      $first: "$department_id"
                                    }, //显示这个人的部门_id
                                    "value_index": {
                                      $first: "$value_index"
                                    },
                                    "task_count": {
                                      $first: "$task_count"
                                    }
                                  }
                                }
                                ], (err, data7) => {
                                  data7.forEach(k => {
                                    data3.forEach(i => {
                                      data4.forEach(j => {
                                        if (((k.department_id).toString()) == ((i._id.department_id).toString()) && ((k.department_id).toString()) == ((j._id.department_id).toString())) {
                                          let personalPerformanceBonus = i.departPerformanceBonus * ((k.value_index + k.task_count) / i.performance)
                                          let personlProjectBonus = j.departProjectBonus * (k.eachPoint / j.departPoint)
                                          let personalPerformance = +(personalPerformanceBonus + personlProjectBonus).toFixed(2)

                                          var bonuswait_data = {
                                            period: req.body.period,
                                            amount: personalPerformance,
                                            employee_id: ObjectId(k.employee_id),
                                            estimate_pay_date: estimate_pay_date,
                                            is_paid: false,
                                            status: "草稿",
                                            bonus_type: req.body.type,
                                            department_id: ObjectId(k.department_id),
                                            origin_amount: personalPerformance,
                                            bonus_log_id: ObjectId(bonus_id)
                                          }
                                          Bonuswait.create(bonuswait_data, function (err, data) {
                                            if (err) {
                                              res.json({
                                                status: 400,
                                              })
                                            } else {
                                              resolve(isShow = true)

                                            }
                                          })
                                        }
                                      })
                                    })
                                  })
                                })
                              }
                            })

                          })
                          if (isShow == true) {
                            res.json({
                              status: "200",
                              result: data
                            })
                          } else if (isShow == false) {
                            res.json({
                              msg: "计算失败"
                            })
                          }
                        })()
                      })
                    } else {
                      res.json({
                        status: "400",
                        msg: "没有对应的奖金池金额"
                      })
                    }
                  })
                }
              })
            }
          })
        } else if (bonus_type == "股权分红") {
          Bonuspool.find({
            period: period
          }, (err, data5) => {
            if (data5.length > 0) {
              Employee.find({}, (err, data8) => {
                var totalStock = 0
                data8.forEach(i => {
                  // 总股票数
                  totalStock += i.remain_stock
                })
                Employee.aggregate([{
                  $match: {
                    "_id": {
                      "$in": employee_ids
                    }
                  }
                }], (err, data9) => {
                  let isShow = false;
                  (async function go() {
                    await new Promise((resolve, reject) => {
                      data9.forEach(j => {
                        // 个人股权分红
                        var personalStockShare = +(((j.remain_stock) / totalStock) * data5[0].equityShare).toFixed(2)
                        var bonuswait_data = {
                          period: req.body.period,
                          amount: personalStockShare,
                          employee_id: ObjectId(j._id),
                          estimate_pay_date:estimate_pay_date,
                          is_paid: false,
                          status: "草稿",
                          bonus_type: req.body.type,
                          department_id: ObjectId(j.department_id),
                          origin_amount: personalStockShare,
                          bonus_log_id: ObjectId(bonus_id)
                        }
                        Bonuswait.create(bonuswait_data, function (err, data) {
                          if (err) {
                            res.json({
                              status: 400
                            })
                          } else {
                            resolve(isShow = true)
                          }
                        })
                      })
                    })
                    if (isShow == true) {
                      res.json({
                        status: "200",
                        result: data

                      })
                    } else if (isShow == false) {
                      res.json({
                        msg: "失败"
                      })
                    }
                  })()

                })
              })

            } else {
              res.json({
                status: "400",
                msg: "没有对应的奖金池金额"
              })
            }
          })
        }
      }
    }
  })
})

//
// 列表详情页----双薪 / 一般分红 / 绩效
//部门员工待发奖金档详情页（列表页传employee_id、bonus_type、 period）
router.get("/bonusDetail", (req, res) => {
  var _id = req.query._id
  Bonuswait.find({
    "_id": _id
  }, (err, data) => {
    if (data) {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})
// 编辑列表详情页的Amount时判断是否超出部门总的Origin_Amount
router.get("/beyondDepartAmount", (req, res) => {
  var period = req.query.period
  var bonus_type = req.query.bonus_type
  var department_id = req.query.department_id
  let curr = []
  Bonuswait.aggregate([
    {
      $group: {
        "_id": {
          period: "$period",
          bonus_type: "$bonus_type",
          department_id: "$department_id"
        },
        "departAllAmount": {
          $sum: "$amount"
        },

      }
    },
    {
      $match: {
        "_id.bonus_type": bonus_type
      }
    }
  ], (err, data) => {

    if (data) {
      res.json({
        status: 200,
        result: data
      })
    }
  })
})
//  编辑修改奖金的分红金额
router.put('/updateAmount', function (req, res) {
  var _id = req.body._id;
  var amount = req.body.amount;
  Bonuswait.findOneAndUpdate({
    _id: ObjectId(_id)
  }, {
    $set: {
      "amount": amount
    }
  }, {
    new: true
  },
    function (err, data) {
      if (err) {
        console.log(err)
      } else {
        res.json({
          status: '200',
          msg: "修改成功",
          result: data,
        })
      }
    })

});
// 部门员工待发奖金档 和 员工待发奖金档页面的状态改变
router.put('/updateStatus', function (req, res) {
  var _id = req.body._id;
  var status = req.body.status

  Bonuswait.findOneAndUpdate({
    _id: ObjectId(_id)
  }, {
    $set: {
      "status": status
    }
  }, {
    new: true
  },
    function (err, data) {
      if (err) {
        console.log(err)
      } else {
        res.json({
          status: '200',
          msg: "修改成功",
          result: data,
        })
      }
    })

});
//   员工信息
//多表同时增加人员
//请求方式post 
router.post('/employeeAddHard', function (req, res) {
  var name = req.body.name;
  var _id = ObjectId();
  Employee.findOne({
    name: name
  }, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      Employee.insertMany({
        name: name,
      }, function (err, data) {
        if (err) {
          console.log(err)
        } else {
          Department.insertMany({
            name: chargeName,
            department_id: _id
          }, function (err, data) {
            if (err) {
              console.log(err)
            } else {
              Department.aggregate([{
                $lookup: {
                  from: "employees",
                  localField: "_id",
                  foreignField: "department_id",
                  as: "employee"
                },
              },
              {
                $unwind: {
                  path: "$employee",
                  preserveNullAndEmptyArrays: true
                }
              },

              ], function (err, data) {
                if (err) {
                  console.log(err);
                  return;
                } else {
                  res.json({
                    status: '200',
                    result: data,
                  })
                }
              })
            }
          })
        }
      })
    }
  })
})


// 调整部分拿到各部门到各类型奖金 的总和
router.get("/bonusTypeAmount", function (req, res) {
  var period = req.query.period
  //部门绩效奖金=部门绩效奖金+部门项目奖金
  //  部门performance计算= 部门（valueIndex+任务点数）之和
  // 部门勋章点数计算= 部门（pm点数+collaboration点数）之和
  // 部门绩效奖金=公司绩效奖金池 * 部门performance在公司的占比（部门performance/全公司的performance）
  // 部门项目奖金=公司项目勋章奖金池 * 部门勋章点数在公司的占比（部门勋章点数/全公司的勋章点数）
  var companyPerfor = 0;  //公司全部人的performance，包括主管
  var nomanagercompanyPerfor = 0;  //公司全部人的performance，不包括主管
  var companyPoint = 0;  //公司全部人的部门勋章点数
  let Departmentids = []
  //判断无pointPuser——log的情况
  Department.find({}, (err, data) => {
    if (data) {
      data.forEach(item => {
        Departmentids.push(item._id)
      })
    }
  })
  //计算员工部门的点数合计
  Employee.aggregate([
    {
      $lookup: {
        from: "point_user_logs",
        localField: "_id",
        foreignField: "employee_id",
        as: "points"
      }
    },
    {
      $unwind: {
        path: "$points",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        "points.status": "同意"
      }
    },
    {
      $group: {
        "_id": {
          department_id: "$department_id"
        },
        //departPoint是整个部门所有人相加勋章点数和
        "departPoint": {
          $sum: {
            $sum: ["$points.point"]
          }
        },
      }
    },
  ], function (err, data1) {
    if (err) {
      res.json({
        status: "404",
      })
    } else if (data1) {
      Employee.aggregate([
        {
          $group: {
            "_id": {
              department_id: "$department_id"
            },
            //performance是部门所有人的performance总和
            "performance": {
              $sum: {
                $sum: ["$value_index", "$task_count"]
              }
            },
            employeeinfo: {
              $push: {
                _id: "$_id",
                is_manager: "$is_manager",
                value_index: "$value_index",
                task_count: "$task_count",
                department_id: "$department_id"
              }
            }
          }
        },
      ], (err, data3) => {
        if (err) {
          res.json({
            status: "404",
          })
        } else if (data3) {
          data1.forEach(item => {
            data3.forEach(item2 => {
              if (Departmentids.indexOf(item._id.department_id) == -1) {  //针对于有点数合计的部门
                if ((item._id.department_id).toString() == (item2._id.department_id).toString()) {
                  let departPoint = {
                    departPoint: item.departPoint
                  }
                  item2 = Object.assign(item2, departPoint)
                }
              } else {
                let departPoint = {
                  departPoint: 0
                }
                item2 = Object.assign(item2, departPoint)
              }

            })
          })

          data3.forEach(item => {
            let ll = 0;
            companyPerfor += (item.performance)// 公司所有部门的performance总和  包括主管的
            companyPoint += (item.departPoint);
            item.employeeinfo.forEach(i => {
              if (i.is_manager == false && ((item._id.department_id).toString() == (i.department_id).toString())) {
                nomanagercompanyPerfor += i.value_index + i.task_count
              } else if (i.is_manager == true && ((item._id.department_id).toString() == (i.department_id).toString())) {
                ll = item.performance
                ll -= (i.value_index + i.task_count)

              }
            })
            let k = {
              nomanagercompanyPerfor: nomanagercompanyPerfor,
              nomanagerperformance: ll
            }


            Object.assign(item, k)
          })
          // 公司所有部门的performance总和  不包括主管

          data3.forEach(i => {
            // 部门performance在公司的占比  有主管的数据
            var departPerforScale = i.performance / companyPerfor
            // 部门performance在公司的占比  无主管的数据
            var nomanagerdepartPerforScale = i.nomanagerperformance / i.nomanagercompanyPerfor
            // 部门勋章点数在公司的占比
            var departPointScale = i.departPoint / companyPoint
            var obj1 = {
              "departPerforScale": departPerforScale,
              "companyPerfor": companyPerfor,
              "departPointScale": departPointScale,
              "companyPoint": companyPoint,
              "nomanagerdepartPerforScale": nomanagerdepartPerforScale
            }
            Object.assign(i, obj1)
          })
          Bonuspool.find({
            period: period
          }, (err, data5) => {
            // 公司的performance分红
            var comPerformanceShare = data5[0].employeePerfor / data5[0].projectMedal * data5[0].normalShare
            // 公司的勋章点数分红
            var comMedalShare = data5[0].normalShare - comPerformanceShare
            data3.forEach(i => {
              var departPerformanceBonus = {
                "departPerformanceBonus": data5[0].employeePerfor * i.nomanagerdepartPerforScale,//部门绩效奖金
                "departProjectBonus": data5[0].projectMedal * i.departPointScale,//部门勋章奖金
                "departNormalPerforShare": i.departPerforScale * comPerformanceShare,//performance分红
                "departNormalMedalShare": i.departPointScale * comMedalShare//勋章分红
              }
              Object.assign(i, departPerformanceBonus)
            })
      
            res.json({
              status: "200",
              result: data3
            })

          })
        }
      })

    }
  })

 

})
//valueindex的 部分

/**------------------------新增的valueIndex计算的接口------------------------  */
//计算valueIndex
//valueIndex的计算=基本薪资加总*基本薪资系数（0.246）  
//                                +PM等级补贴*pm等级系数（0.99）
//                                +协作等级补贴*协作等级系数（0.33）
//  拿到员工的薪资总和  +  pm  +  cc
router.get("/employeeSumpoint", (req, res) => {
  var last_value_index_time = req.query.last_value_index_time;
  var allId = req.query.allId;
  var newArr = [];
  var isuse = [];
  var salaryData = [];
  var hasSalary = [];
  for (const iterator of allId) {
    newArr.push(ObjectId(iterator))
  }
 
  Category.find({ "is_use": true }, function (err, datas) {
    if(err){console.log(err);}
    //如果返回了datas  ,有值返回值，没值返回空
    if (datas) {
      datas.forEach(item => {
        isuse.push((item._id).toString())  //将is_use为true的分类对应的ID放入isuse  中。
      })
    }
  })
  Employee_salary_structure.aggregate([
    {
      $match: {
        "employee_id": { $in: newArr }
      }
    },
    {
      $group: {
        "_id": { employee_id: "$employee_id" },
        category_ids: {
          $push: {
            category_id: "$category_id",
            amount: "$amount"
          }
        },
      }
    },
    {
      $project: {
        "_id": true,
        "category_ids": 1,
      }
    }
  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      //此时还没有判断is_use  ，data为所有employee  的salary
      if (data.length < 0) {
        return res.json({
          data:'500',
          msg:"计算失败"

        })
      } else {
        data.forEach(item => {  //  !=-1    存在
          let sTotal = 0;
          let s = 0;
          let sId = ''
          item.category_ids.forEach(item1 => {
            if (isuse.indexOf((item1.category_id).toString()) != -1) {
              sTotal += item1.amount;
              sId = item1.category_id;
            }
          })
          let a = {
            "_id": { "employee_id": item._id.employee_id },
            category_id: sId,
            allSalaryAmountPoint: sTotal
          }
          // console.log(a, "a");
          salaryData.push(a)
        })
        //此时选中的所有员工都有薪资
 
        //将选中的员工的ID  放到一个数组中，方便下面的代码中使用。
        for (var iterator of salaryData) {
          hasSalary.push((iterator._id.employee_id).toString())
        }
        //将is_use为true时的salary的id放入hasSalary数组中。

        //  获取传入员工的的cc和pm
        let date = last_value_index_time
        let yeardate = date.substr(0, 4)
        PointUserLog.aggregate([
          {
            $match: {
              "status": "同意",
              issue_date: { $regex: yeardate },
              "employee_id": { $in: newArr }
            }
          },
          {
            $lookup: {
              from: "employees",
              localField: "employee_id",
              foreignField: "_id",
              as: "employeeinfo"
            }
          },
          {
            $unwind: {  //  拆分子数组
              path: "$employeeinfo",
              preserveNullAndEmptyArrays: true  //  空的数组也拆分
            },
          },
          {
            $group: {
              "_id": { point_type: "$point_type", employee_id: "$employee_id" },
              "firstsumpoint": { $sum: "$point" },
              "employee_id": { $first: "$employeeinfo._id" }
            }
          },
          {
            $project: {
              "_id": true,
              "firstsumpoint": "$firstsumpoint",
            }
          }
        ], function (err, data1) {
          if (err) {
            console.log(err);
          }
          else {
            //判断pm,cc是否存在 ？
            if (data1.length == 0) {
       
              let isHasPmcc = false;
              (async function go() {
                await new Promise((resolve, reject) => {
                  for (const iterator of salaryData) {
                    Employee.findOneAndUpdate(
                      {
                        _id: ObjectId(iterator._id.employee_id)
                      },
                      {
                        $set: {
                          "value_index": Number((iterator.allSalaryAmountPoint) * 0.246).toFixed(2),
                          "last_value_index_time": yeardate
                        }
                      },
                      {
                        new: true
                      }, function (err, data) {
                        if (err) {
                          console.log(err);
                        } else {
           
                          resolve(isHasPmcc = true)
                        }
                      })
                  }
                })
                if (isHasPmcc == true) {
               
                  res.json({
                    status: "200"
                  })

                } else if (isHasPmcc == false) {
                  res.json({
                    msg: "计算失败"
                  })
                }
              })()

            }
            // pm，cc 存在 
            else if (data1.length > 0) {

              let testdata = []
              let popdata = []
              var test = []
              var caches = [];
              var finalObj = [];
              var lastValueIndex = [];
              for (let i = 0; i <= data1.length - 1; i++) {
                testdata.push(data1[i])
                testdata.forEach((item1, index) => {
                  if ((item1._id.employee_id).toString() == (data1[i]._id.employee_id).toString()) {
                    if (item1._id.point_type !== data1[i]._id.point_type) {
                      test = testdata.splice(index, 1)
                   
                      test.forEach(item7 => {
                        popdata.push(item7)
                      })
   
                      let a = {

                        otherpoint_type1: data1[i]._id.point_type,
                        point_employee_id: data1[i]._id.employee_id,
                        otherpoint: data1[i].firstsumpoint
                      }
                      item1 = Object.assign(item1, a)
                    }
                  }
                })
              }
              testdata.forEach(p => {
                popdata.forEach(i => {
                  if ((p._id.employee_id).toString() == (i._id.employee_id).toString()) {
                    for (var key in i) {
                      p[key] = i[key]
                    }
                  }
                })
              })
             
              var finalValue1 = {};
              var finalValue2 = {};
              let iscollect = false;
              (async function go() {
                await LavalMapping.find({}, (err, data2) => {
                  testdata.forEach(item1 => {
                    data2.forEach(item2 => {
                      //要从level的type 来和item1的pointtype来匹配
                      if (item2.type == "Collaboration") {
                        if (item1._id.point_type == "Collaboration") {
                          if ((item1.firstsumpoint >= item2.start) && (item1.firstsumpoint < item2.end)) {
                            finalValue1 = {
                              "cctype": "Collaboration",
                              "ccamount": item2.amount,
                              "cclevel": item2.level
                            }
                            item1 = Object.assign(item1, finalValue1)
                          }
                        } else if (item1.otherpoint_type1 == "Collaboration") {
                          if ((item1.otherpoint >= item2.start) && (item1.otherpoint < item2.end)) {
                            finalValue1 = {
                              "cctype": "Collaboration",
                              "ccamount": item2.amount,
                              "cclevel": item2.level
                            }
                            item1 = Object.assign(item1, finalValue1)
                          }
                        }
                      } else {
                        if (item1._id.point_type == "Management") {
                          if ((item1.firstsumpoint >= item2.start) && (item1.firstsumpoint < item2.end)) {
                            finalValue2 = {
                              "managetype": "Management",
                              "manageamount": item2.amount,
                              "managelevel": item2.level
                            }
                            item1 = Object.assign(item1, finalValue2)
                          }
                        } else if (item1.otherpoint_type1 == "Management") {
                          if ((item1.otherpoint >= item2.start) && (item1.otherpoint < item2.end)) {
                            finalValue2 = {
                              "managetype": "Management",
                              // "id" : item1._id.employee_id,
                              "manageamount": item2.amount,
                              "managelevel": item2.level
                            }
                            item1 = Object.assign(item1, finalValue2)
                          }
                        }
                      }
                    })
                  })
                })
                
                if (testdata.length == hasSalary.length) {
   
                  for (var i = 0; i < hasSalary.length; i++) {
                    for (var j = 0; j < testdata.length; j++) {
                      caches.length = 0;
                      finalObj.length = 0;
                      if (testdata[j].ccamount == null) {
                        testdata[j].ccamount = 0;
                      }
                      if (testdata[j].manageamount == null) {
                        i.manageamount = 0;
                        testdata[j].manageamount = 0;
                      } let finalObj1 = {
                        employee_id: testdata[j]._id.employee_id,
                        totalPmCc: Number((parseInt(testdata[j].ccamount) * 0.33 + parseInt(testdata[j].manageamount) * 0.99))
                      }
                      finalObj.push(finalObj1);
             
                      for (let iterator1 of finalObj) {
                        if (salaryData.length == 0) {

                        } else {
                          for (let iterator2 of salaryData) {
                            lastValueIndex.length = 0;
                            if ((iterator1.employee_id.toString() == (iterator2._id.employee_id).toString())) {
                              let ll = {
                                "employee_id": iterator2._id.employee_id,
                                "valueIndex": Number((iterator1.totalPmCc + Number((iterator2.allSalaryAmountPoint) * 0.246)).toFixed(2))
                              }
                              lastValueIndex.push(ll)
                              //                          
                              for (let iterator of lastValueIndex) {
                                Employee.findOneAndUpdate(
                                  {
                                    _id: ObjectId(iterator.employee_id)
                                  },
                                  {
                                    $set: {
                                      "value_index": Number(iterator.valueIndex),
                                      "last_value_index_time": yeardate
                                    }
                                  },
                                  {
                                    new: true
                                  }, function (err, data) {
                                    if (err) {
                                      console.log(err);
                                    } else {
                                      iscollect = true
                                                                
                                    }
                                  })
                              }
                            }
                          }
                        }
                      }
                    }
                  }

                } else {
        
                  var result = [];
                  //补全不一样的  testdata <  hasSalary 取出不一样的 把pm,cc 之和 补0 
                  for (var i = 0; i < hasSalary.length; i++) {
                    var obj = hasSalary[i];
                    var num = obj;
                    var isExist = false;
                    for (let j = 0; j < testdata.length; j++) {
                      var aj = testdata[j];
                      var n = aj._id.employee_id;
                      if (n == num) {
                        isExist = true;
                        break;
                      }
                    }
                    //取出在hasData中不存在的数据，将不存在的数据进行补0
                    if (!isExist) {
                      result.push({ "_id": { "employee_id": obj } }); //result 中存放的就是不在hasSalary 数组中的值
                    }
                  }
                  for (var i = 0; i < hasSalary.length; i++) {
                    for (let j = 0; j < testdata.length; j++) {
                      finalObj.length = 0;
                      if (testdata[j].ccamount == null) {
                        testdata[j].ccamount = 0;
                      }
                      if (testdata[j].manageamount == null) {
                        i.manageamount = 0;
                      }
                      for (const iterator of result) {
                        let noPmCc = {
                          employee_id: ObjectId(iterator._id.employee_id),
                          totalPmCc: 0
                        }
                        finalObj.push(noPmCc)
                      }
                      let finalObj1 = {
                        employee_id: testdata[j]._id.employee_id,
                        totalPmCc: Number((parseInt(testdata[j].ccamount) * 0.33 + parseInt(testdata[j].manageamount) * 0.99))
                      }
                      finalObj.push(finalObj1);
                      for (let iterator1 of finalObj) {
                        if (salaryData.length == 0) {

                        } else {
                          //遍历salaryData ，finalObj ，双层循环将employee_id相等的进行值相加求和，放入lastValueIndex
                          for (let iterator2 of salaryData) {
                            lastValueIndex.length = 0;
                            if ((iterator1.employee_id.toString() == (iterator2._id.employee_id).toString())) {
                              let ll = {
                                "employee_id": iterator2._id.employee_id,
                                "valueIndex": Number((iterator1.totalPmCc + Number((iterator2.allSalaryAmountPoint) * 0.246)).toFixed(2))
                              }
                              lastValueIndex.push(ll)
                   
                              // lastValueIndex就是最后的值，将其遍历，每次根据id 去进行修改ValueIndex
                              for (let iterator of lastValueIndex) {
                                Employee.findOneAndUpdate(
                                  {
                                    _id: ObjectId(iterator.employee_id)
                                  },
                                  {
                                    $set: {
                                      "value_index": Number(iterator.valueIndex),
                                      "last_value_index_time": yeardate
                                    }
                                  },
                                  {
                                    new: true
                                  }, function (err, data) {
                                    if (err) {
                                      console.log(err);
                                    } else {
                                      iscollect = true
                                    }
                                  })
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                

                if (iscollect == true) {
                  res.json({
                    status: "200",
                    result: data
                  })
                } else if (iscollect == false) {
                  res.json({
                    msg: "计算失败"
                  })
                }
              })()
            }
          }
        })
      }
    }
  })
});
//valueIndex页面的搜索功能 -- 根据传入的ID
router.get("/valueIndexSearch", (req, res) => {
  var _id = req.query._id;
  Employee.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "department"
    },
  },
  {
    $unwind: { // 拆分子数组
      path: "$department",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    },
  },
  {
    $match: {
      "_id": ObjectId(_id),
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
});

//---------------- 员工个人界面信息-------------------------------
/**股票管理，绩效管理，分红管理 */
//----------------------------------------------------------
// 个人的绩效部分
router.get("/bonuswaitInfoPerforPersonal", (req, res) => {

  var employee_id = ""
  var tel=req.data.phone
 Users.findOne({"tel":tel},function(err,data){
     if(data){
     employee_id= data.employee_id
    var bonus_type = req.query.bonus_type
  Bonuswait.aggregate([{
    $match: {
      "bonus_type": {
        $regex: bonus_type
      },
      "employee_id": ObjectId(employee_id),
      "status":"核准"
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    }

  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
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
}})
});

// 个人分红
router.get("/bonuswaitInfoSharePersonal", (req, res) => {
  
  var bonus_type = req.query.bonus_type
  var employee_id = ""
  var tel=req.data.phone
 Users.findOne({"tel":tel},function(err,data){
     if(data){
       employee_id=data.employee_id
  Bonuswait.aggregate([{
    $match: {
      "bonus_type": {
        $regex: bonus_type
      },
      "employee_id": ObjectId(employee_id),
      status:"核准"
    }
  },
  {
    $lookup: {
      from: "employees",
      localField: "employee_id",
      foreignField: "_id",
      as: "item"
    }

  },
  {
    $unwind: {
      path: "$item",
      preserveNullAndEmptyArrays: true
    }
  },

  {
    $group: {
      "_id": {
        employee_id: "$employee_id"
      },
      employeename: {
        $first: "$item.name"
      },
      sum: {
        $sum: "$amount"
      },
      estimate_pay_date: {
        $first: "$estimate_pay_date"
      },
      period: {
        $first: "$period"
      }

    }
  },
  {
    $project: {
      id: true,
      employeename: "$employeename",
      sum: "$sum",
      estimate_pay_date: "$estimate_pay_date",
      period: "$period"
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
//   找到个人员工对应的股票
router.get("/employeeStockPersonal", (req, res) => {
  var employee_id = ""
  var tel=req.data.phone
 Users.findOne({"tel":tel},function(err,data){
     if(data){
     employee_id= data.employee_id
  Employee.find({
    "_id": employee_id
  }, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.json({
      status: '200',
      result: data,
    })
  })
}
})
});
//个人一般分红的搜索  已完成
router.get("/periodshare", (req, res) => {
  //根据周期来搜索
  let perioddate=req.query.period;
  var employee_id = req.query.employee_id;
  let bonus_type=req.query.bonus_type;
  Bonuswait.aggregate([
    {
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employeeinfo"
      }
  
    },
    {
      $unwind: {
        path: "$employeeinfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        bonus_type:{
          $regex:bonus_type
        },
        period:{
          $regex:perioddate
        },
        status:"核准",
        "employeeinfo._id":ObjectId(employee_id)
      }
    },
    {
      $group:{
        _id:"$bonus_type",
        sum:{$sum:"$amount"},
        employee_id:{$first:"$employeeinfo._id"},
        employee_name:{$first:"$employeeinfo.name"},
        period:{$first:perioddate},
        estimate_pay_date:{$first:"$estimate_pay_date"},
        is_paid:{$first:"$is_paid"}
      },
     
    },
    {
      $project:{
        _id:true,
        sum:true,
        employee_id:"$employee_id",
        employee_name:"$employee_name",
        period:"$period",
        estimate_pay_date:"$estimate_pay_date",
        is_paid:"$is_paid"
      }
    }
  ],(err,data)=>{
    if(data){
     res.json({
       status:200,
       result:data
     })
    }
  })
})
//个人绩效的搜索
router.get("/personaldateperforBonus",(req,res)=>{
  let perioddate=req.query.period;
  var employee_id = req.query.employee_id;
  let bonus_type=req.query.bonus_type;
  Bonuswait.aggregate([
    {
      $lookup: {
        from: "employees",
        localField: "employee_id",
        foreignField: "_id",
        as: "employeeinfo"
      }
  
    },
    {
      $unwind: {
        path: "$employeeinfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        bonus_type:bonus_type,
        period:{
          $regex:perioddate
        },
        status:"核准",
        "employeeinfo._id":ObjectId(employee_id)
      }
    },
    {
      $group:{
        _id:"$bonus_type",
        amount:{$sum:"$amount"},
        employee_id:{$first:"$employeeinfo._id"},
        employee_name:{$first:"$employeeinfo.name"},
        period:{$first:perioddate},
        estimate_pay_date:{$first:"$estimate_pay_date"},
        is_paid:{$first:"$is_paid"}
      },
     
    },
    {
      $project:{
        _id:true,
        amount:true,
        employee_id:"$employee_id",
        employee_name:"$employee_name",
        period:"$period",
        estimate_pay_date:"$estimate_pay_date",
        is_paid:"$is_paid"
      }
    }
  ],(err,data)=>{
    if(data){
      res.json({
        status:200,
        result:data
      })
    }
  })
})
module.exports = router