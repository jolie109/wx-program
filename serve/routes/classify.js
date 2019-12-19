var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Category = require('../models/classify/category')
var Grade = require('../models/classify/grade')
var Level = require('../models/classify/level')

var ObjectId = mongoose.mongo.ObjectId;

/*******************************  获取所有数据  ****************************/
//1.分类管理中全部分类
//请求方式 :GET 
router.get("/getCategoryAccount", (req, res) => {
  Category.find({})
    .then(category => {
      res.json(category);
    })
    .catch(err => {
      res.json({
        status:403,
        msg:'出错啦'
      });
    });
});

//2.获取所有的等级 grade （选中全部）
router.get("/getGradeAccount", (req, res) => {
  Grade.aggregate([{
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
    
  ], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }
    res.json({
      status: '200',
      result: data
    })
  })
  
});

//3.获取所有的值 level
router.get("/getLevelAccount", (req, res) => {
    Grade.aggregate([
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
          from: "levels",
          localField: "_id",
          foreignField: "grade_id",
          as: "level"
        }
      },
      {
          $unwind: { // 拆分子数组
            path: "$level",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
      },
    ], function (err, data) {
      let newdata=[]

       data.forEach(item=>{
        if(item.level && item.category.category_type=="基本薪资"){
          newdata.push(item)
        }
      })
      if (err) {
        res.json({
          status:403,
          msg:'出错啦'
        });
        return;
      }
      res.json({
        status: '200',
        result: newdata
      })
    })   
});

/********************************  增加  ****************************/
//1.增加分类
//请求方式post 其中增加的字段is_use默认为true
// 传的参数category_type+name
router.post('/addCategory', function (req, res) {
  var category_type = req.body.category_type;
  var name = req.body.name;
  Category.find({
    name: [`${name}`],
    category_type: [`${category_type}`]
  }, function (err, data) {
    if (data.length === 0) {
      Category.insertMany({
        is_use: true,
        category_type: category_type,
        name: name
      }, function (err, docs) {
        if (err) {
          res.json({
            status:403,
            msg:'出错啦'
          });
        } else {
          res.json({
            status: 200,
            msg: "增加成功",
            result: docs,
          })
        }
      })
    } else {
      res.json({
        status: 0,
        msg: "增加失败，该数据已存在!",
      })
    }
  })
})


//2.等级的新增
//请求方式：post
//必须传的请求参数：分类的name + 新增等级的name
//增加等级，需要知道等级处于哪个分类下面，知道分类的ID。

router.post('/addGrade', function (req, res) {
  var category_name = req.body.category_name;
  var grade_name = req.body.grade_name;
    if (category_name != undefined) {
      // 先在Category中查找category_name，之后根据Category中的id(data._id)
      // 与grade中的category_id相等找到grade中的name值，将输入的name值与数据库中的name值做判断
     Category.find({
        name: category_name
      }, function (err, data) {
        if (err) {
          res.json({
            status:403,
            msg:'出错啦'
          });
        } else {
          Grade.find({
            category_id: data[0]._id
          }, function (err, dataGrade) {
            const newName = [];
            for (const iterator of dataGrade) {
              newName.push(iterator.name)
            }
            if (newName.indexOf(grade_name) === -1) {

              const category_id = data[0]._id;
              Grade.insertMany({
                category_id: category_id,
                name: grade_name
              }, function (err, docs) {
                if (err) {
                  res.json({
                    status:403,
                    msg:'出错啦'
                  });
                } else {
                  res.json({
                    status: '200',
                    msg: "插入成功！",
                    result: docs,
                  })
                }
              })
            } else {
              res.json({
                status: '0',
                msg: "插入失败，该数据已存在！"
              })
            }
          })
        }
      });
    } else {
      res.json({
        status: '0',
        msg: "插入失败"
      })
    }
})

//3.增加级别 
//传的参数 等级的_id + 新增的level_name(表中的字段是name)
//方式 ：post

router.post('/addLevel', function (req, res) {
  var category_id = req.body.category_id;
  var grade_id = req.body.grade_id;
  var name = req.body.name;
  Category.findOne({
    _id:category_id
  },function(err,category){
    if(err){
      res.json({
        status:403,
        msg:'出错啦'
      });
    }else{
      Grade.findOne({
        _id: grade_id,
        category_id:category._id
      }, function (err, grade) {
        if (err) {
          res.json({
            status:403,
            msg:'出错啦'
          });
        } else {
          Level.find({
            grade_id: grade._id
          }, function (err, dataLevel) {
            const newName = [];
            for (const iterator of dataLevel) {
              newName.push(iterator.name)
            }
            if (newName.indexOf(name) === -1) {
              const grade_id = grade._id;
              Level.insertMany({
                grade_id: grade_id,
                name: name
              }, function (err, docs) {
                if (err) {
                  res.json({
                    status:403,
                    msg:'出错啦'
                  });
                } else {
                  var level = docs[0].toObject();
                  const data2=[];
                  data2[0]={level,grade,category}
                  res.json({
                    status: 200,
                    msg: "插入成功！",
                    result: data2,
                  })
                }
              })
            } else {
              res.json({
                status: 0,
                msg: "插入失败，该数据已存在！"
              })
            }
          })
        }
      });
    }
  })
  
})
/*******************************  编辑  ****************************/

//1.分类页面编辑接口
router.post('/update', function (req, res) {
  var _id = ObjectId(req.body._id);
  var name = req.body.name;

  if (name != undefined) {
    Category.findOne({
      name: name
    }, function (err, data) {
      if (err) {
        res.json({
          status:403,
          msg:'出错啦'
        });
      } else {
        var newName = name;
        Category.findByIdAndUpdate(_id, {
          "name": newName
        }, {
          new: true
        }, function (err, data) {
          if (err) {
            res.json({
              status:403,
              msg:'出错啦'
            });
          } else {
            res.json({
              status: '200',
              msg: "修改成功",
              result: data,
            })
          }
        });
      }
    })
  } else {
    Category.findByIdAndUpdate(_id, name, function (err, res) {
      if (err) {
        res.json({
          status:403,
          msg:'出错啦'
        });
      } else {
      }
    });
  }
})
//  编辑分类中的是否使用
router.post('/salary_Structure', (req, res) => {
  var category_id = req.body.category_id;
  var is_use = req.body.is_use;
  Category.findByIdAndUpdate({
      _id: ObjectId(category_id)
    }, {
      $set: {
        "is_use": is_use
      }
    }, {
      new: true
    },
    (err, data) => {
      if (err) {
        res.json({
          status: 400,
          msg: '更新失败'
        })
      } else {
        res.json({
          status: "200",
          result: data,
          msg: '修改成功！'
        })
      }
    })
})
//2.编辑等级 
//传的参数 分类的_id + 修改后的等级的name值
// {
// 	"_id":"5d3ea26bf24b010a1ad9caf2",
// 	"name":"硕士"
// }
//请求方式：put
router.put('/updateGrade', function (req, res) {
  var _id = req.body._id;
  var name = req.body.name;
  Grade.findOneAndUpdate({
      _id: _id
    }, {
      $set: {
        name: req.body.name
      }
    }, {
      new: true
    })
    .then(grade => res.json({
      status: 200,
      result: grade,
      msg: '编辑成功！'
    }))
    .catch(err => res.json(err));

})
//下面的接口是用来绑定select的值(category与grade表关联)
router.get("/getGradeByGrade_list", function (req, res) {
  let category_id = req.query.category_id;
  // let name = req.query.name;
  Grade.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "item"
      }
    },
    {
      $match: {
        "category_id": ObjectId(category_id)
      }
    },
  ], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }
    res.json({
      status: '200',
      result: data
    })
  })
})
//3.编辑级别
//传的参数 ：分类的_id + 修改后的name值
//  请求方式 put
router.put('/updateLevel', function (req, res) {
  // var _id = req.body.grade_id;
  // var name=req.body.level_name;
  var _id = req.body._id;
  var name = req.body.name;
  Level.findOneAndUpdate({
      _id: _id
    }, {
      $set: {
        name: req.body.name
      }
    }, {
      new: true
    })
    .then(level => res.json({
      status: 200,
      msg: '编辑成功！',
      result: level
    }))
    .catch(err => res.json({
      status: 0,
      msg: '编辑失败！'
    }));
})

/*************************  删除  ****************************/
//1.分类删除

router.delete("/deleteCategory", (req, res) => {
  var _id = req.body._id;
  Category.findOne({
    _id: _id
  }, function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
    } else {
      Grade.find({
        category_id: data._id
      }, function (err, data1) {
        if (err) {
          res.json({
            status:403,
            msg:'出错啦'
          });
        } else {
          if (data1.length <= 0) {
            Category.deleteOne({
              _id: _id
            }, function (err, data) {
              if (err) {
                res.json({
                  status:403,
                  msg:'出错啦'
                });
              } else {
                res.json({
                  status: 200,
                  result: data,
                  msg: '删除成功！'
                })
              }
            })
          } else {
            res.json({
              msg: "不能删除！",
              status: 403
            })
          }
        }
      })
    }
  })
});
//2.等级删除
router.delete("/deleteGrade", (req, res) => {
  var _id = req.body._id;
  var category_id=req.body.category_id;
  Grade.findOne({
    _id: _id,
    category_id:category_id
  }, function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
    } else {
      Level.find({
        grade_id: data._id
      }, function (err, data1) {
        if (err) {
          res.json({
            status:403,
            msg:'出错啦'
          });
        } else {
          if (data1.length <= 0) {
            Grade.deleteOne({
              _id: _id
            }, function (err, data) {
              if (err) {
                res.json({
                  status:403,
                  msg:'出错啦'
                });
              } else {
                res.json({
                  status: 200,
                  result: data,
                  msg: '删除成功！'
                })
              }
            })
          } else {
            res.json({
              msg: "不能删除！",
              status: 403
            })
          }
        }
      })
    }
  })
});
//3.级别删除
//2.等级删除
router.delete("/deleteLevel", (req, res) => {
  Level.deleteOne({
    _id: req.body._id
  }, function (err, Level) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
    } else {
      res.json({
        status: 200,
        msg: '删除成功！',
        result: Level
      })
    }
  })

});
/*************************  搜索接口  ****************************/
//1.分类管理中搜索接口
router.get("/searchCategoryAccount", (req, res) => {
  var category_type = req.query.category_type;
  Category.find({
    "category_type": category_type
  }, function (err, data) {
    res.json({
      result: data,
      status:200,
      msg:'搜索成功'
    })
  })
});
//2.等级搜索
//2.1 查询出所有的等级，以每个分类下各自对应的等级来显示
router.get("/getGradeBycateGory", function (req, res) {

  Category.aggregate([{
    $lookup: {
      from: "grades",
      localField: "_id",
      foreignField: "category_id",
      as: "item"
    }
  }], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
})
// 请求方式： get
// 请求参数： name 传入的参数：分类的_id 
router.get("/getGradeBycateGory_list", function (req, res) {
  let _id = req.query._id;
  // let category_id = req.body._id;
  // let name = req.body.name;
  Grade.aggregate([{
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
      $match: {
        "category_id": ObjectId(_id)
      }
    },
  ], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }
    res.json({
      status: '200',
      result: data,
    })
  })
})
// 3.级别管理的搜索
// 三级联动通过传值 传入等级的_id和级别的_id 
router.get("/getLevelByCategoryGrade_list", function (req, res) {
  let category_id = req.query.category_id;
  let grade_id = req.query._id;
  let result=[]
  Grade.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $match: {
        "category_id": ObjectId(category_id)
      }
    },
    {
      $lookup: {
        from: "levels",
        localField: "_id",
        foreignField: "grade_id",
        as: "level"
      }
    },
    {
      $match: {
        "_id": ObjectId(grade_id)
      }
    },
    {
      $unwind: { // 拆分子数组
        path: "$category",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      }
  },
  {
    $unwind: { // 拆分子数组
      path: "$level",
      preserveNullAndEmptyArrays: true // 空的数组也拆分
    }
},
  ], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }else if(data){
      data.forEach(item=>{
        if(item.level){
          result.push(item)
        }
      })
  
      res.json({
        status: '200',
        result: result,
        msg: '搜索成功!'
      })
    }
   

  })
})
// 搜索等级和级别连接
router.get("/getGradeByLevel", function (req, res) {
  let _id = req.query._id;
  let result=[]
  Grade.aggregate([
    {
      $lookup: {
        from: "levels",
        localField: "_id",
        foreignField: "grade_id",
        as: "level"
      },
    },
    {
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "category"
      },
    },
    {
      $match: {
        "_id": ObjectId(_id)
      }
    },
    {
        $unwind: { // 拆分子数组
          path: "$level",
          preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    },
    {
      $unwind: { // 拆分子数组
        path: "$category",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      }
  }
  ], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }else{
      data.forEach(item=>{
        if(item.level){
          result.push(item)
        }
      })
      res.json({
      status: '200',
      result: result,
      msg: '搜索成功！'
    })
    }
   
  })
})
// 级别搜索中选择分类名时获取此分类名下的所有等级名
router.get("/getCategoryByGrade", function (req, res) {
  let category_id = req.query._id;
  Grade.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "item"
      }
    },
    {
      $match: {
        "category_id": ObjectId(category_id)
      }
    },
  ], function (err, data) {
    if (err) {
      res.json({
        status:403,
        msg:'出错啦'
      });
      return;
    }
    res.json({
      status: '200',
      result: data
    })
  })
})

//编辑分类 
//请求方式 PUT
//传的参数： name + 编辑后的内容name
// (根据ID功能)

router.put('/updateCategory', function (req, res) {
  let name = req.body.name;
  Category.findOneAndUpdate({
      name: [`${name}`]
    }, {
      $set: {
        name: req.body.newName
      }
    }, {
      new: true
    })
    .then(categorys => res.json({
      status: 200,
      msg: '修改成功！',
      result: categorys
    }))
    .catch(err => res.json(err));
})

//ID
router.post('/updateCategoryById', function (req, res) {

  Category.findOneAndUpdate({
      _id: ObjectId1(req.body._id)
    }, {
      $set: {
        name: req.body.name
      }
    }, {
      new: true
    })
    .then(categorys => res.json(categorys))
    .catch(err => res.json(err));
})


//三表查询 三级联动
//全部
//请求方式 get 无需传参数
router.get("/getLevelByCategoryGrade", function (req, res) {
  Grade.aggregate([{
      $lookup: {
        from: "categorys",
        localField: "category_id",
        foreignField: "_id",
        as: "item_category"
      }
    },
    
    {
      $lookup: {
        from: "levels",
        localField: "_id",
        foreignField: "grade_id",
        as: "item_level"
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
})




module.exports = router
