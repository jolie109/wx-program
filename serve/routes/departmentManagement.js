var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');

var Department = require('../models/departmentMananement/department')
var Employee = require('../models/employeeManagement/employee')

var ObjectId = mongoose.mongo.ObjectId;
// 拿到两个表数据
router.get("/departmentInfo", (req, res) => {
    Department.aggregate([{
        $lookup: {
            from: "employees",
            localField: "manager_id",
            foreignField: "_id",
            as: "manager_name"
        },
    },
    {
        $unwind: {
            path: "$manager_name",
            preserveNullAndEmptyArrays: true
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
});
//显示所有员工
router.get("/allEmployeeInfo", (req, res) => {
    Employee.find({}, (err, data) => {
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
//通过部门名称搜索
router.get("/departmentName", (req, res) => {
    var name = req.query.name
    Department.aggregate([{
        $lookup: {
            from: "employees",
            localField: "manager_id",
            foreignField: "_id",
            as: "manager_name"
        },
    },
    {
        $unwind: {
            path: "$manager_name",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $match: {
            "name": name,
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
//同时增加部门名称和改变主管
router.put('/departmentAdd', function (req, res) {
    var charge_id = req.body.charge_id;
    var name = req.body.name; //部门名称
    var _id = ObjectId();
    Department.find({
        name: name
    }, function (err, data) {
        if (data.length > 0) {
            res.json({
                status: "204",
                msg: "添加失败，该部门已存在"
            })
        } else if (data.length == 0) {
            if (charge_id == "") {
                Department.insertMany({
                    "name": name,
                    "manager_id": null
                }, function (err, data1) {
                    res.json({
                        status: "200",
                        msg: "添加成功",
                        result: data1
                    })
                })
            } else {
                Employee.findOneAndUpdate({
                    "_id": charge_id
                }, {
                        $set: {
                            "is_manager": true,
                        }
                    }, function (err, data) {
                        objId = ObjectId(data._id)
                        if (data) {
                            Department.create({
                                "name": name,
                                "manager_id": objId
                            }, function (err, data) {
                                Employee.findOneAndUpdate({
                                    "_id": charge_id
                                }, {
                                        $set: {
                                            "department_id": data._id,
                                        }
                                    }, (err, dataEmployee) => {
                                        res.json({
                                            status: "200",
                                            msg: "添加成功",
                                            result: dataEmployee
                                        })
                                    })

                            })
                        }
                    })
            }

        }
    })
})


/**********************Alice的方法 *****************/
//编辑员工时，要更改该部门的主管名字，以及他对应的部门id和ismanager的修改
router.put('/departmentUpdate', function (req, res) {
    var departmentName = req.body.departmentName
    var employee_id = req.body.employee_id
    var department_id = req.body.department_id;
    var departmentmanage_ids = []
    var ismanagerids = []
    var list=[]     
      Employee.findOneAndUpdate({
        _id: employee_id
    }, {
            $set: {
                "is_manager": true
            }
        }, {
            new: true
        }, (err, data) => {
            Department.findOneAndUpdate({
                name: departmentName
            }, {
                    $set: {
                        manager_id: employee_id
                    }
                }, {
                    new: true
                }).then(department => {
                    Employee.find({ is_manager: true }, (err, data2) => {
                        if(data2.length>0){
                        data2.forEach(item2 => {
                            ismanagerids.push((item2._id).toString())
                        })
                    }
                        Department.find({
                        }, (err, data1) => {
                            if(data1.length>0){
                            data1.forEach(item => {
                                if(item.manager_id!=null){
                                departmentmanage_ids.push((item.manager_id).toString())
                                }
                            })
                        }
                            ismanagerids.forEach(item3 => {
                                if (departmentmanage_ids.indexOf(item3) == -1) {  //未匹配
                                    list.push(ObjectId(item3))
                                }
                            })
                       if(list.length==0){
                           res.json({
                               status:200,
                               msg:"修改成功"
                           })
                       }else{
                        Employee.findOneAndUpdate(
                            {
                                "_id": {$in:list}
                            },
                            {
                                $set: { "is_manager": false }
                            }, function (err, doc) {
                              if(doc){
                                  res.json({
                                      status:200,
                                      result:doc
                                      
                                  })
                              }else if(err){
                                res.json({
                                    status:500,
                                })
                              }
                            })
                       }
                        })
                    })

                })
        })
});

// 删除部门
router.delete("/departmentDelete", (req, res) => {

    var _id = req.body._id;
    var charge_id = req.body.charge_id;
    Department.aggregate([{
        $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "department_id",
            as: "item"
        },
    },
    {
        $match: {
            "_id": ObjectId(_id),
        },
    }
    ], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }

        if (data[0].item.length <= 0) {
            Employee.findOneAndUpdate({
                "_id": ObjectId(charge_id)
            }, {
                    $set: {
                        "is_manager": false
                    }
                }, function (err, data) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    Department.deleteOne({
                        _id: req.body._id
                    },
                        function (err, data) {
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
        } else {
            res.json({
                status: 201,
                result: data,
                msg: '不能删除！'
            })
        }

    })

});
module.exports = router