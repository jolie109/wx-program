var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Employees = require("../models/employeeManagement/employee")
var Departments = require('../models/departmentMananement/department')
var Employee_salary_structure = require('../models/salaryList/employee_salary_structure')
var Sarlary = require('../models/salaryManagement/salary')
var Category = require("../models/classify/category")
var Grade = require("../models/classify/grade")
var Level = require("../models/classify/level")
var Users = require("../models/admin/users")
var ObjectId = mongoose.mongo.ObjectId;
//员工信息管理页面
//获取所有的部门名称
router.get("/allDepartmentName", function (req, res) {
  Departments.find({}, function (err, data) {
      if (err) {
          console.log(err)
      } else {
          res.json({
              status: '200',
              result: data,
              _total: data.length
          })
      }
  })
})
/********************* 获取数据 ***********************/
//获取所有员工信息
router.get("/allEmployeeInfo", function (req, res) {
  Employees.find({}, function (err, data) {
    if (err) {
      res.json({
        status: '403',
        msg: '出错啦'
      })
    } else {
      res.json({
        status: '200',
        result: data,
        _total: data.length
      })
    }
  })
})
// 员工信息表与部门表连接,在员工信息界面显示部门
router.get("/getEmployee_department", function (req, res) {
  Employees.aggregate([{
    $lookup: {
      from: "departments",
      localField: "department_id",
      foreignField: "_id",
      as: "itemEmployee"
    },
  }, ], function (err, data) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
      return;
    }
    res.json({
      status: 200,
      result: data,
      msg: '搜索成功！'
    })
  })
})
/********************* 编辑 ***********************/
router.post("/updateEmployee", function (req, res) {
  var updateList = req.body.updateList;
  var _id = req.body._id;
  var selectDepartment = req.body.selectDepartment;
  var updateSalary = req.body.updateSalary;
  var updateMonth = req.body.updateMonth;
  var desserts = [...updateSalary, ...updateMonth];
  var department_id = '';
  var structureId = [];
  var deleteSalaryId=req.body.deleteSalaryId;
  var userId=req.body.userId
  Users.findOneAndUpdate({"_id":userId},{$set:{employee_id:_id}},function(err,data){
    (async function () {
      for (const iterator of desserts) {
        if (iterator._id !== "") {
          Category.findOne({
            name: iterator.category.name
          }, function (err, datas1) {
            if (err) {
              res.json({
                status: 403,
                msg: '出错啦'
              })
              return
            }
            Grade.findOne({
              name: iterator.grade.name
            }, function (err, datas2) {
              if (err) {
                res.json({
                  status: 403,
                  msg: '出错啦'
                })
                return
              }
              if (iterator.category.category_type == '基本薪资') {
                Level.findOne({
                  name: iterator.level.name
                }, function (err, datas3) {
                  if (err) {
                    res.json({
                      status: 403,
                      msg: '出错啦'
                    })
                    return
                  }
                  Employee_salary_structure.findByIdAndUpdate({
                    "_id": iterator._id
                  }, {
                    $set: {
                      grade_id: datas2._id,
                      _id: iterator._id,
                      amount: iterator.amount,
                      category_id: datas1._id,
                      level_id: datas3._id,
                    }
                  }, function (err, data1) {
                    if (err) {
                      res.json({
                        status: 400,
                        msg: "出错啦"
                      })
                    } else {
                    }
                  })
                })
              } else if (iterator.category.category_type == '每月加给') {
                Employee_salary_structure.findByIdAndUpdate({
                  "_id": iterator._id
                }, {
                  $set: {
                    grade_id: datas2._id,
                    _id: iterator._id,
                    amount: iterator.amount,
                    category_id: datas1._id,
                  }
                }, function (err, data1) {
                  if (err) {
                    res.json({
                      status: 400,
                      msg: "出错啦"
                    })
                  } else {}
                })
              }
            })
          })
  
        } else {
          let type = '';
          if (iterator.LevelSalary) {
            type = '基本薪资'
          } else {
            type = '每月加给'
          }
          await Category.findOne({
            name: iterator.category.name
          }, function (err, data1) {
            if (err) {
              res.json({
                status: 403,
                msg: '出错啦'
              })
            } else {
              Grade.findOne({
                name: iterator.grade.name
              }, function (err, data2) {
                if (err) {
                  res.json({
                    status: 403,
                    msg: '出错啦'
                  })
                } else {
                  if (type == '基本薪资') {
                    Level.findOne({
                      name: iterator.level.name
                    }, function (err, data3) {
                      Employee_salary_structure.insertMany({
                        category_id: data1._id,
                        grade_id: data2._id,
                        level_id: data3._id,
                        category_type: type,
                        employee_id: _id,
                        amount: iterator.amount
                      }, function (err, data4) {
                        if (err) {
                          res.json({
                            status: 403,
                            msg: '出错啦'
                          })
                          return
                        }
                      })
                    })
                  } else if (type == '每月加给') {
                    Employee_salary_structure.insertMany({
                      category_id: data1._id,
                      grade_id: data2._id,
                      category_type: type,
                      employee_id: _id,
                      amount: iterator.amount,
                   
                    }, function (err, data5) {
                      if (err) {
                        res.json({
                          status: 403,
                          msg: '出错啦'
                        })
                        return;
                      }
                    })
                  }
                }
              })
            }
  
          })
          // })
  
        }
      }
      Employees.findOne({
        _id: updateList._id
      }, function (err, data) {
        if (err) {
          res.json({
            status: 403,
            msg: '出错啦'
          })
        } else {
          var newList = Object.assign({
            _id: data._id
          }, updateList)
          Departments.findOne({
            name: selectDepartment
          }, function (err, dataDepartment) {
            if (err) {
              res.json({
                status: 403,
                msg: '出错啦'
              })
              return
            }
            // 通过员工employee_id在Employee_salary_structure中找到所有的_id  push到employee集合中的数组中
            Employee_salary_structure.find({
              employee_id: updateList._id
            }, (err, dataStructure) => {
              newList.department_id = dataDepartment._id;
              for (let i=0; i<deleteSalaryId.length;i++) {
                for (let j=0; j<dataStructure.length;j++) {
                  if(deleteSalaryId[i]==dataStructure[j]._id){
                    dataStructure.splice(j,1);
                  }
                }
                Employee_salary_structure.deleteOne({
                  _id:deleteSalaryId[i]
                },function(err,datas){
                  if(err){
                    console.log(err)
                  }
                })
              }
            
              dataStructure.map(item => {
                structureId.push(item._id)
              })
              newList.employee_salary_structure_ids=structureId;
    
              Employees.findByIdAndUpdate(_id, newList, function (err, data1) {
                if (err) {
                  res.json({
                    status: 0,
                    msg: "出错啦！"
                  })
                } else {
                  res.json({
                    result: data1,
                    status: 200,
                    msg: '编辑成功！'
                  })
                }
              })
            })
            
          })
        }
      })
    })()
  })
 
})

router.get('/getEmployeeSalaryEdit', function (req, res) {
  var _id = req.query._id;
  Employees.find({
    "_id": _id
  }, function (err, data) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
      return;
    } else {
      Employee_salary_structure.aggregate([{
          $lookup: {
            from: "employees",
            localField: "employee_id",
            foreignField: "_id",
            as: "employee"
          }
        },

        {
          $lookup: {
            from: "categorys",
            localField: "category_id",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $unwind: { // 拆分子数组
            path: "$category",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
        },
        {
          $lookup: {
            from: "grades",
            localField: "grade_id",
            foreignField: "_id",
            as: "grade"
          }
        },
        {
          $unwind: { // 拆分子数组
            path: "$grade",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
        },
        {
          $lookup: {
            from: "levels",
            localField: "level_id",
            foreignField: "_id",
            as: "level"
          }
        },
        {
          $unwind: { // 拆分子数组
            path: "$level",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
        },
        {
          $match: {
            "employee_id": ObjectId(_id)
          }
        },

      ], function (err, data1) {
        if (err) {
          res.json({
            status: 403,
            msg: '出错啦'
          })
          return;
        }
        res.json({
          result: data1
        })

      })
    }
  })
})

// 根据分类选择的值找等级
router.get("/getCategoryGrade", function (req, res) {
  var name = req.query.name;

  Category.find({
    "name": name
  }, function (err, data) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
    } else {
      for (const iterator of data) {
        var _id = iterator._id;
        Category.aggregate([{
            $lookup: {
              from: "grades",
              localField: "_id",
              foreignField: "category_id",
              as: "item"
            },
          },
          {
            $match: {
              "_id": ObjectId(_id)
            }
          },
        ], function (err, data) {
          if (err) {
            res.json({
              status: 403,
              msg: '出错啦'
            })
            return;
          }
          res.json({
            status: '200',
            result: data,
            msg: '搜索成功！'
          })
        })
      }
    }
  })
})
// 根据等级选择的值获取级别
router.get("/getGradeLevel", function (req, res) {
  var category_name = req.query.category_name;
  var grade_name = req.query.grade_name;
  var dataId1 = '';
  var dataId2 = '';
  Category.find({
    "name": category_name
  }, function (err, data1) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
    } else {
      for (const iterator of data1) {
        dataId1 = iterator._id;
      }
      Grade.find({
        "name": grade_name,
        "category_id": dataId1
      }, function (err, data2) {
        if (err) {
          res.json({
            status: 400,
            msg: '出错啦！'
          })
        } else {
          for (const iterator of data2) {
            dataId2 = iterator._id;
          }
          Grade.aggregate([{
              $lookup: {
                from: "levels",
                localField: "_id",
                foreignField: "grade_id",
                as: "item"
              },
            },
            {
              $match: {
                "_id": dataId2
              }
            },
          ], function (err, data) {
            if (err) {
              res.json({
                status: 403,
                msg: '出错啦'
              })
              return;
            }
            res.json({
              status: '200',
              result: data,
              msg: '查找成功！'
            })
          })
        }
      })
    }
  })
})
// 基本薪资根据级别找金额
router.get("/getGradeLevelSalary", function (req, res) {
  var category_name = req.query.category_name;
  var grade_name = req.query.grade_name;
  var level_name = req.query.level_name;

  var dataId = '';
  var data1Id = '';
  var data2Id = '';
  Category.find({
    "name": category_name
  }, function (err, categoryData) {
    if (err) {
      res.json({
        status: 400,
        msg: '出错啦！'
      })
    } else {
      for (const iterator of categoryData) {
        dataId = iterator._id;
      }
      Grade.find({
        "name": grade_name,
        "category_id": dataId
      }, function (err, gradeData) {
        if (err) {
          res.json({
            status: 400,
            msg: '出错啦！'
          })
        } else {
          for (const iterator of gradeData) {
            data1Id = iterator._id;
          }
          Level.find({
            "name": level_name,
            "grade_id": data1Id
          }, function (err, levelData) {
            if (err) {
              res.json({
                status: 400,
                msg: '出错啦！'
              })
            } else {
              for (const iterator of levelData) {
                data2Id = iterator._id;
              }
              Sarlary.find({
                "category_id": dataId,
                "grade_id": data1Id,
                "level_id": data2Id
              }, function (err, dataSalary) {
                if (err) {
                  res.json({
                    status: 400,
                    msg: '出错啦！'
                  });
                } else {
                  res.json({
                    status: 200,
                    msg: '搜索成功！',
                    result: dataSalary
                  })
                }
              })
            }
          });
        }
      });
    }
  });



})
// 每月加给根据分类找到等级
router.get("/getGradeMonth", function (req, res) {
  var name = req.query.name;
  Category.find({
    "name": name
  }, function (err, data) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
    } else {
      for (const iterator of data) {
        var _id = iterator._id;
        Category.aggregate([{
            $lookup: {
              from: "grades",
              localField: "_id",
              foreignField: "category_id",
              as: "item"
            },
          },
          {
            $match: {
              "_id": ObjectId(_id)
            }
          },
        ], function (err, data) {
          if (err) {
            res.json({
              status: 403,
              msg: '出错啦'
            })
            return;
          }
          res.json({
            status: '200',
            result: data,
            msg: '查找成功！'
          })
        })
      }
    }
  })
})
// 每月加给根据等级找金额
router.get("/getGradeMonthMoney", function (req, res) {
 
  var category_name = req.query.category_name;
  var grade_name = req.query.grade_name;
  var dataId = '';
  var data1Id = '';
  Category.find({
    "name": category_name
  }, function (err, categoryData) {
    if (err) {
      res.json({
        status: 400,
        msg: '出错啦！'
      })
    } else {
      for (const iterator of categoryData) {
        dataId = iterator._id;
      }
      Grade.find({
        "name": grade_name
      }, function (err, dataGrade) {
        if (err) {
          res.json({
            status: 400,
            msg: '出错啦！'
          });
        } else {
          for (const iterator of dataGrade) {
            data1Id = iterator._id
          }
          Sarlary.find({
            "category_id": dataId,
            "grade_id": data1Id
          }, function (err, dataMonth) {
            if (err) {
              res.json({
                status: 400,
                msg: '出错啦！'
              });
            } else {
              res.json({
                status: 200,
                msg: '搜索成功！',
                result: dataMonth
              })
            }
          })
        }
      })
    }
  })

})
// 获取所有的等级
router.get("/getGradeCountSalary", function (req, res) {
  Category.aggregate([{
    $lookup: {
      from: "grades",
      localField: "_id",
      foreignField: "category_id",
      as: "grade"
    },
  }, ], function (err, data) {
    if (err) {
      res.json({
        status: 400,
        msg: "查找失败！"
      })
      return;
    }
    res.json({
      result: data
    })
  })
})
// 获取所有的级别
router.get("/getLevelCountSalary", function (req, res) {
  Grade.aggregate([{
    $lookup: {
      from: "Levels",
      localField: "_id",
      foreignField: "grade_id",
      as: "level"
    },
  }, ], function (err, data) {
    if (err) {
      res.json({
        status: 400,
        msg: "查找失败！"
      })
      return;
    }
    res.json({
      result: data
    })
  })
})
/******************************* 搜索 *****************************/
//根据员工姓名搜索员工信息（根据Name查找，之后与部门匹配）
router.get("/employeeInfoByName", function (req, res) {
  var _id = req.query._id;
  Employees.aggregate([{
      $lookup: {
        from: "departments",
        localField: "department_id",
        foreignField: "_id",
        as: "itemEmployee"
      }
    },
    {
      $match: {
        "_id": ObjectId(_id)
      }
    },
  ], function (err, data) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
})
/**************************** 获取部门主管 ***********************/
router.get('/getDepartmentManger', (req, res) => {
  var departmentName = req.query.departmentName;
  Departments.findOne({
    name: departmentName
  }, (err, data) => {
    Employees.aggregate([{
        $lookup: {
          from: "departments",
          localField: "department_id",
          foreignField: "_id",
          as: "itemEmployee"
        }
      },
      {
        $match: {
          "_id": data.manager_id
        }
      },
    ], function (err, data) {
      if (err) {
        res.json({
          status: 403,
          msg: '出错啦'
        })
        return;
      }
      res.json({
        status: '200',
        result: data,
      })
    })

  })
})
/**************************** 删除 *****************************/
// 删除员工信息
router.delete("/deleteEmployee", (req, res) => {
  Employees.deleteOne({
    _id: req.body._id
  }, function (err, data) {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
    } else {
      Employee_salary_structure.deleteMany({
        employee_id: req.body._id
      },function(err,data1){
        if(err){
          res.json({
            status: 403,
            msg: '出错啦！'
          })
        }else{
          res.json({
            status: 200,
            msg: '删除成功！',
            result: data
          })
        }
      })
    }
  })

});
// 删除员工信息中的基本薪资
router.delete("/deleteBasicSalary", (req, res) => {
  var _id = req.body._id;
  var employee_id = req.body.employee_id;
  let data = []
  Employees.findOne({
    _id: employee_id
  }, (err, dataEmployee) => {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
    } else {
      for (let i = 0; i < dataEmployee.employee_salary_structure_ids.length; i++) {
        if (dataEmployee.employee_salary_structure_ids[i].toString() !== _id.toString()) {
          data.push(dataEmployee.employee_salary_structure_ids[i])
        }
      }

      Employees.findByIdAndUpdate({
        _id: employee_id
      }, {
        $set: {
          employee_salary_structure_ids: data
        }
      }, (err, data) => {
      })

      Employee_salary_structure.deleteOne({
        _id: _id
      }, function (err, data) {
        if (err) {
          res.json({
            status: 403,
            msg: '删除失败！'
          })
        } else {
          res.json({
            status: 200,
            msg: '删除成功！'
          })

        }
      })
    }
  })


});

// 删除员工信息中的每月加给
router.delete("/deleteMonth", (req, res) => {
  var _id = req.body._id;
  var employee_id = req.body.employee_id;
  let data = []
  Employees.findOne({
    _id: employee_id
  }, (err, dataEmployee) => {
    if (err) {
      res.json({
        status: 403,
        msg: '出错啦'
      })
    } else {
      for (let i = 0; i < dataEmployee.employee_salary_structure_ids.length; i++) {
        if (dataEmployee.employee_salary_structure_ids[i].toString() !== _id.toString()) {
          data.push(dataEmployee.employee_salary_structure_ids[i])
        }
      }

      Employees.findByIdAndUpdate({
        _id: employee_id
      }, {
        $set: {
          employee_salary_structure_ids: data
        }
      }, (err, data) => {

      })

      Employee_salary_structure.deleteOne({
        _id: _id
      }, function (err, data) {
        if (err) {
          res.json({
            status: 403,
            msg: '删除失败！'
          })
        } else {
          res.json({
            status: 200,
            msg: '删除成功！'
          })

        }
      })
    }
  })

});
/****************************** 获取员工股票 **************************/
router.get("/getEmployeeStock", (req, res) => {
  var employee_id = req.query.employee_id;
  Employees.aggregate([{
      $lookup: {
        from: "stocks",
        localField: "_id",
        foreignField: "employee_id",
        as: "stock"
      }
    },
    {
      $match: {
        "_id": ObjectId(employee_id)
      }
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
})
/************************* 增加员工部分 *************************/
//获取全部，分类
router.get('/getByCatogry', (req, res) => {
  Category.find({})
    .then(category => {
      res.json({
        status: '200',
        msg: "查询成功",
        result: category
      });
    })
    .catch(err => {
      console.log(err);
      res.json({
        status: '400',
        msg: "查询失败"
      });
    });

})
router.get('/getByCatogryById', (req, res) => {
  var categoryId = req.query.categoryId
  Category.find({
      "_id": ObjectId(categoryId)
    })
    .then(category => {
      res.json({
        status: '200',
        msg: "查询成功",
        result: category
      });
    })
    .catch(err => {
      console.log(err);
      res.json({
        status: '400',
        msg: "查询失败"
      });
    });

})
//获取等级根据分类名字
router.get('/getGradeByCn', (req, res) => {
  var categoryId = req.query.categoryId

  Grade.find({
    "category_id": categoryId
  }, function (err, data) {
    if (err) {
      res.json({
        status: '404',
        result: err,
      })
    } else {
      res.json({
        status: '200',
        result: data,
      })
    }
  })

})
//根据分类，等级获取类别
router.get('/getLevelByGraCat', (req, res) => {

  var categoryId = req.query.categoryId
  var gradeId = req.query.gradeId

  Grade.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "categorys"
      }
    },
    {
      $lookup: {
        from: "levels",
        localField: "_id",
        foreignField: "grade_id",
        as: "levels"
      }
    },
    {
      $unwind: {
        path: "$categorys",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: "$levels",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {

        "categorys._id": ObjectId(categoryId),
        "levels.grade_id": ObjectId(gradeId)
      }
    }

  ], function (err, data) {
    if (err) {
      res.json({
        status: '400',
        msg: "查询失败"
      });
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })


})
//获取所有部门
router.get('/getAlldepartments', (req, res) => {
  Departments.find({}, function (err, data) {
    if (err) {
      res.json({
        status: 400,
        msg: "查询失败"
      })
    } else {
      res.json({
        status: "200",
        msg: "查询成功",
        result: data,

      })
    }
  })

})
//根据部门id获取该部门的主管
router.get('/getManagerByName', (req, res) => {
  var department_id = req.query.department_id
  var department_name = req.query.department_name
    Departments.aggregate([{
        $lookup: {
          from: "employees",
          localField: "manager_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $match: {
          "_id": ObjectId(department_name)
        }
      }

    ], (err, data2) => {
      if (err) {
        res.json({
          status: 400,
          msg: "部门主管查询失败"
        })
      }
      data2.forEach(element => {
        var data3 = element.employee
        data3.forEach(item => {
          Object.assign(element, item)
        })
      })
      res.json({
        status: 200,
        msg: "部门主管查询成功",
        result: data2
      })
    })
  // })
})
//获取金额
router.get('/getSalary', (req, res) => {
  var categoryId = req.query.categoryId

  var gradeId = req.query.gradeId

  Sarlary.find({
    "category_id": categoryId,
    "grade_id": gradeId
  }, (err, data) => {
    if (err) {
      res.json({
        status: "404",
        result: err
      })
    } else {
      res.json({
        status: "200",
        msg: "查询金额成功",
        result: data
      })
    }

  })

})
//获取基本薪资金额
router.get('/getBasicSalary', (req, res) => {
  var categoryId = req.query.categoryId
  var gradeId = req.query.gradeId
  var levelId = req.query.levelId
  Sarlary.find({
    "category_id": categoryId,
    "grade_id": gradeId,
    "level_id": levelId
  }, (err, data) => {
    if (err) {
      res.json({
        status: "404",
        result: err
      })
    } else {
      res.json({
        status: "200",
        msg: "查询金额成功",
        result: data
      })
    }
    
  })
})
//获取用户
router.get('/getAllUser', (req, res) => {
  Users.find({},(err,data)=>{
  if(err){
    res.json({
      status: '400',
      msg: "查询失败",
      result: err
    });
  }else{
    res.json({
      status: '200',
      msg: "查询成功",
      result: data
    });
  }
})
})
router.get("/getGradeMonthMoney", function (req, res) {
  var category_id = req.query.category_id;
  var grade_id = req.query.grade_id;

  Sarlary.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "category"
      },
    },
    {
      $match: {
        "category_id": ObjectId(category_id)
      }
    },
    {
      $lookup: {
        from: "grades",
        localField: "grade_id",
        foreignField: "_id",
        as: "grade"
      },
    },
    {
      $match: {
        "grade_id": ObjectId(grade_id)
      }
    },
  ], function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json({
      status: '200',
      result: data,
      msg: '搜索成功！'
    })
  })
})
//增加员工信息
router.post("/newEmployee", function (req, res) {
  var name = req.body.name;
  var entry_time = req.body.entry_time;
  var adjust_permissions = req.body.adjust_permissions;
  var is_manager = req.body.is_manager;
  var workplace = req.body.workplace;
  var tel = req.body.tel;
  var email = req.body.email;
  var departmentName = req.body.departmentName
  var departmentid = req.body.departmentName
  var department_id;
  var department_id = req.body.department_id; //前台根据部门名称传递id过来
  var newEmployeeId = ObjectId();
  var newGradeId = ObjectId(req.body.gradeId);
  var newSalaryId = ObjectId(req.body.SarlaryId);
  var newCategroyId = ObjectId(req.body.categoryId);
  var newLevelsId = ObjectId(req.body.levelsId)
  var value_index = ""; //需要计算
  
  var basicdata = req.body.basicdata;
  var supplydata = req.body.supplydata;
  var structuredata = []
  var user_id = req.body.userId
  //添加到Employee表的字段
  Employees.findOne({
    tel: tel
  }, function (err, data) {
    if (data == null) {
      //员工表添加信息
      Employees.insertMany({
        name: name,
        entry_time: entry_time,
        remain_stock: 0,
        department_id: departmentid,
        adjust_permissions: adjust_permissions,
        value_index:0,
        last_value_index_time: "",
        is_manager: is_manager,
        workplace: workplace,
        email: email,
        employee_salary_structure_ids: [],
        tel: tel,
        double_pay_issued: true,
         employee_no: "",
         task_count:0
      }, function (err, docs1) {
        if (err) {
          console.log(err);
        } else {
          employee_Id = docs1[0]._id

          async function go() {
            if(basicdata){
              basicdata.map(item => {
                Employee_salary_structure.create({
                  employee_id: docs1[0]._id,
                  salary_id: ObjectId(),
                  grade_id: item.grade,
                  amount: item.amount,
                  category_id: item.category,
                  level_id: item.level,
                  category_type: item.category_type
                }, (err, doc2) => {
   
                  if (doc2 == null) {
                    console.log('null')
                  } else {
                    structuredata.push(doc2._id)
                  }
                })
              })
            }
           if(supplydata){
            supplydata.map(item4 => {
              Employee_salary_structure.create({
                employee_id: docs1[0]._id,
                salary_id: ObjectId(),
                grade_id: item4.grade,
                amount: item4.amount,
                category_id: item4.category,
                level_id: item4.level,
                category_type: item4.category_type
              }, (err, doc3) => {
                if (doc3 == null) {
                  console.log('null')
                } else {
                  structuredata.push(doc3._id)
                }

              })
            })
           }
          }
          go().then(v => {
            var results = []
            async function go2() {
              Employee_salary_structure.find({
                "employee_id": employee_Id
              }, function (err, data) {
                data.map(item => {
                  results.push(item._id)
                })
                Employees.findByIdAndUpdate({
                  "_id": employee_Id
                }, {
                  $set: {
                    "employee_salary_structure_ids": results
                  }
                }, function (err, data2) {})

                Users.findByIdAndUpdate({
                  "_id": user_id
                }, {
                  $set: {
                    "employee_id": ObjectId(employee_Id)
                  }
                }, function (err, data3) {
   

                })
              })
            }
            go2().then(

            )
          })
          res.json({
            status: "200",
            msg: "添加成功",
            res: docs1
          })
        }

      })
    } else {
      res.json({
        status: "202",
        msg: "员工已存在",
        res: data
      })
    }
  })

})
//得到所有级别
router.get('/getAllLevels', (req, res) => {
  Level.find({}, (err, data) => {
    if (err) {
      res.json({
        "status": "404",
        res: err
      })
    } else {
      res.json({
        status: 200,
        msg: '查询所有级别',
        result: data
      })
    }


  })
  
})
//得到所有等级
router.get('/getGradeByMonth', (req, res) => {
  Grade.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "categorys"
      }
    },
    {
      $unwind: {
        path: "$categorys",
        preserveNullAndEmptyArrays: true
      }
    },
  ], (err, data) => {
    res.json({
      status: "200",
      result: data
    })
  })
})

module.exports = router

