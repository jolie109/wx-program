var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');
var Bonuswait = require('../models/salaryStructure/bonus_wait')
var Employees = require('../models/employeeManagement/employee')
var Salarys = require('../models/salaryManagement/salary')
var Departments = require('../models/departmentMananement/department')
var Monthly_payslips = require('../models/salaryList/monthly_payslip')
var Employee_salary_structures = require('../models/salaryList/employee_salary_structure')
var Users = require("../models/admin/users")
var Category = require('../models/classify/category')
var ObjectId = mongoose.mongo.ObjectId;
//生成薪资单页面
//默认显示当前月份的员工薪资单/按月份查找员工薪资单
//1. 先用月份在薪资单里找这个月有薪资单的人，返回data
//2. 聚合查询到所有员工的信息和部门，返回data1
//3. 判断如果这个月所有人都没有薪资单（data为空数组），则给所有的员工data1都加“未生成”的status
//4. 循环每个员工，如果薪资单数据data里有他的薪资单，status变成“已发布”，没有则为“未生成”
router.get("/employeePayslipInCreate", (req, res) => {
    var create_date = req.query.create_date;
    Monthly_payslips.find({
        create_date: create_date
    }, (err, data) => {
        Employees.aggregate([{
                $lookup: {
                    from: 'departments',
                    localField: 'department_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                }
            }
        ], (err, data1) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            var result = [];
            if (data == false) {
                data1.forEach((item) => {
                    item.status = "未生成"
                    result.push(item)
                })
                res.json({
                    status: 200,
                    result: result
                })
            } else {
                data1.forEach((item1) => {
                    data.some(item2 => {
                        if (item1._id.toString() == item2.employee_id.toString() && item2.create_date == create_date) {
                            item1.status = "已生成"
                            return true
                        } else {
                            item1.status = "未生成"
                        }
                    })
                    result.push(item1)
                });
                res.json({
                    status: 200,
                    result: result
                })
            }
        })
    })
})

//根据员工姓名和月份查找薪资单
router.get("/employeePayslipByNameAndMonthInCreate", (req, res) => {
    var create_date = req.query.create_date;
    var name = req.query.name;
    Monthly_payslips.find({
        create_date: create_date
    }, (err, data) => {
        Employees.aggregate([{
                $lookup: {
                    from: 'departments',
                    localField: 'department_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                }
            },
            {
                $match: {
                    "name": name
                }
            }
        ], (err, data1) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            var result = [];
            if (data == false) {
                data1.forEach((item) => {
                    item.status = "未生成"
                    result.push(item)
                })
                res.json({
                    status: 200,
                    result: result
                })
            } else {
                data1.forEach((item1) => {
                    data.some(item2 => {
                        if (item1._id.toString() == item2.employee_id.toString() && item2.create_date == create_date) {
                            item1.status = "已生成"
                            return true
                        } else {
                            item1.status = "未生成"
                        }
                    })
                    result.push(item1)
                });
                res.json({
                    status: 200,
                    result: result
                })
            }
        })
    })
})


//批量生成薪资单，即根据选中的员工和月份创建其薪资单表
//循环selected数组，用每个人的_id和日期去创建本月的monthly_payslip表
router.post('/createPayslipAll', (req, res) => {
    var create_date = (req.body.create_date).substr(0, 7);
    var selectedList = req.body.selected;
    Bonuswait.aggregate([
        {
            $match: {
                "status": "核准",
                "estimate_pay_date": { $regex: create_date },
            }
        },
        {
            $group: {
                "_id": "$employee_id",
                "_ids": { $push: "$_id" }//直接将每个字段的_id放到_ids中
            }
        },
        {
            $project: {
                "_id": true,
                "_ids": 1
            }
        }
    ], (err, data) => {
        if(err){
            res.json({
                result:err
            })
        }
        let list=[]
        var arrs = [];
        let k=[] 

            if(data.length>0){
                for (var i = 0; i < selectedList.length; i++) {
                for (let j = 0; j < data.length; j++) {
                        //针对有bonus的员工
                    if ((selectedList[i]._id).toString() == (data[j]._id).toString()) {
                        k.push((data[j]._id).toString())
                        Monthly_payslips.insertMany({
                            employee_id: data[j]._id,
                            status: "草稿",
                            create_date: create_date,
                            employee_salary_structure_ids: selectedList[i].employee_salary_structure_ids,
                            special_adjust: [],
                            bonus_wait_id: data[j]._ids
                        }, (err, data1) => {
                            if (err) {
                                res.json({
                                    status: 500
                                })
                            } else {
    
                                return 
                            }
                        })
                    }
                    else{
                        list.push(selectedList[i]._id)  
                        for(let i = 0; i < list.length; i++){ 
                            if (arrs.indexOf(list[i]) == -1){ 
                                arrs.push(list[i])
                            }; 
                        } 
                        k.forEach((item,index)=>{
                            if(arrs.indexOf(item)!=-1){
                                let ll=arrs.indexOf(item)
                                arrs.splice(ll,1)
                            }
                        })
                       
                    }

                 }
                }
                selectedList.forEach(item=>{
                    arrs.forEach(item1=>{
                    if ((item._id).toString() == item1) {
                        Monthly_payslips.insertMany({
                            employee_id:item._id,
                            status: "草稿",
                            create_date: create_date,
                            employee_salary_structure_ids:item.employee_salary_structure_ids,
                            special_adjust:[],
                            bonus_wait_id: []
                        }, (err, data1) => {
                            if (err) {
                                res.json({
                                    status: 500
                                })
                            } else {
                                return 
                            }
                        })
                    }
                       
                    })
                })
            }else if(data.length==0){
                for (var i = 0; i < selectedList.length; i++) {
                Monthly_payslips.insertMany({
                    employee_id:selectedList[i]._id,
                    status: "草稿",
                    create_date: create_date,
                    employee_salary_structure_ids: selectedList[i].employee_salary_structure_ids,
                    special_adjust:[],
                    bonus_wait_id: []
                }, (err, data1) => {
                    if (err) {
                        res.json({
                            status: 500
                        })
                    } else {
                        return 
                    }
                })
            }
            }
        res.json({
            result: data
        })
    })
})

//员工薪资单页面

//hr权限，获取所有员工的薪资单
router.get('/allEmployeePayslip', (req, res) => {
    var create_date = req.query.create_date;
     let isuse=[]
    Category.find({"is_use":true},function(err,data){
        if(data){
            data.forEach(item=>{
                isuse.push((item._id).toString())
            })
        }
    })
    Employees.aggregate([{
        $lookup: {
            from: 'employee_salary_structures',
            localField: '_id',
            foreignField: 'employee_id',
            as: 'employee_salary_structure'
        }
    }, {
        $lookup: {
            from: 'monthly_payslips',
            localField: '_id',
            foreignField: 'employee_id',
            as: 'monthly_payslip'
        }
    }, {
        $lookup: {
            from: 'departments',
            localField: 'department_id',
            foreignField: '_id',
            as: 'department'
        }
    }, {
        $unwind: {
            path: "$monthly_payslip",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $match: {
            "monthly_payslip.create_date": create_date
        }
    }], (err, data) => {
        if (err) {
            res.json({
                status: 500
            })
            return;
        }
        var result = [];
        data.forEach(element => {
            var basicSum = 0;
            var addedSum = 0;
            element.employee_salary_structure.forEach(item => {
                if(isuse.indexOf((item.category_id).toString())!=-1){
                    if (item.category_type == '基本薪资') {
                        basicSum += parseInt(item.amount)
                    } else {
                        addedSum += parseInt(item.amount)
                    }
                }
            })
        
            element.salarySum = {
                "basicSum": basicSum,
                "addedSum": addedSum
            }
            result.push(element)
        });
        res.json({
            status: 200,
            result: result
        })
    })
})

//员工个人薪资单查询
//获取个人员工的薪资单
router.get('/perEmployeePayslip', (req, res) => {
    var create_date = req.query.create_date;
     let isuse=[]
     var tel=req.data.phone
     var employeeId=''
    Category.find({"is_use":true},function(err,data){
        if(data){
            data.forEach(item=>{
                isuse.push((item._id).toString())
            })
        }
    })
    Users.findOne({"tel":tel},function(err,data){
        if(data){
    employeeId=data.employee_id
    Employees.aggregate([{
        $lookup: {
            from: 'employee_salary_structures',
            localField: '_id',
            foreignField: 'employee_id',
            as: 'employee_salary_structure'
        }
    }, {
        $lookup: {
            from: 'monthly_payslips',
            localField: '_id',
            foreignField: 'employee_id',
            as: 'monthly_payslip'
        }
    }, {
        $lookup: {
            from: 'departments',
            localField: 'department_id',
            foreignField: '_id',
            as: 'department'
        }
    }, {
        $unwind: {
            path: "$monthly_payslip",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $match: {
            "monthly_payslip.create_date": create_date,
            "_id":employeeId,
            'monthly_payslip.status':{$in:["待支付","已支付"]}
        }
    }], (err, data) => {
        if (err) {
            res.json({
                status: 500
            })
            return;
        }
        var result = [];
        data.forEach(element => {
            var basicSum = 0;
            var addedSum = 0;
            element.employee_salary_structure.forEach(item => {
                if(isuse.indexOf((item.category_id).toString())!=-1){
                    if (item.category_type == '基本薪资') {
                        basicSum += parseInt(item.amount)
                    } else {
                        addedSum += parseInt(item.amount)
                    }
                }
            })
        
            element.salarySum = {
                "basicSum": basicSum,
                "addedSum": addedSum
            }
            result.push(element)
        });
        res.json({
            status: 200,
            result: result
        })
    })
}
    })
})
//编辑薪资单的详情页面
//获取薪资单“基本薪资”和“每月加给”数据
router.get('/payslipDetailEdit', (req, res) => {
    var create_date = req.query.create_date;
    var _id = req.query._id
    Employee_salary_structures.aggregate([{
        $lookup: {
            from: 'employees',
            localField: 'employee_id',
            foreignField: '_id',
            as: 'employee'
        }
    }, {
        $lookup: {
            from: 'monthly_payslips',
            localField: 'employee_id',
            foreignField: 'employee_id',
            as: 'monthly_payslip'
        }
    }, {
        $lookup: {
            from: 'categorys',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
        }
    },   {
        $match:{
            "category.is_use":true
        }
    },
    {
        $lookup: {
            from: 'grades',
            localField: 'grade_id',
            foreignField: '_id',
            as: 'grade'
        }
    }, {
        $lookup: {
            from: 'levels',
            localField: 'level_id',
            foreignField: '_id',
            as: 'level'
        }
    }, {
        $unwind: {
            path: "$monthly_payslip",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$grade",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$level",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $match: {
            "monthly_payslip.create_date": create_date,
            "employee._id": ObjectId(_id)
        }
    }], (err, data) => {
        if (err) {
            res.json({
                status: 500
            })
            return;
        }
        res.json({
            status: 200,
            result: data
        })
    })
})


//点击保存薪资单状态还是草稿，点击发布变为“待支付”
router.put('/editPayslip', (req, res) => {
    if (req.body.special_adjust) var special_adjust = req.body.special_adjust;
    var create_date = req.body.create_date;
    var employee_id = req.body.employee_id;
    var status = req.body.status;
    Monthly_payslips.findOneAndUpdate({
        employee_id: employee_id,
        create_date: create_date
    }, {
        $set: {
            special_adjust: special_adjust,
            status: status
        }
    }, {
        new: true
    }).then(data => res.json({
        status: 200,
        msg: '编辑成功',
        result: data
    })).catch(err => res.json(err))
})

//单独生成薪资单的详情页面

//获取薪资详情“基本薪资”和“每月加给”，但是此时员工还没有薪资单，所以没有特别调整项目
router.get('/payslipDetailAdd', (req, res) => {
    var create_date = req.query.create_date;
    var _id = req.query._id
    Employee_salary_structures.aggregate([{
        $lookup: {
            from: 'employees',
            localField: 'employee_id',
            foreignField: '_id',
            as: 'employee'
        }
    }, {
        $lookup: {
            from: 'categorys',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
        }
    }, {
        $lookup: {
            from: 'grades',
            localField: 'grade_id',
            foreignField: '_id',
            as: 'grade'
        }
    }, {
        $lookup: {
            from: 'levels',
            localField: 'level_id',
            foreignField: '_id',
            as: 'level'
        }
    }, {
        $unwind: {
            path: "$monthly_payslip",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$grade",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$level",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $match: {
            "employee._id": ObjectId(_id)
        }
    }], (err, data) => {
        if (err) {
            res.json({
                status: 500
            })
            return;
        }
        res.json({
            status: 200,
            result: data
        })
    })
})
// 获取传入的员工的绩效奖金
router.get('/payslipDetailAchievementbonus', (req, res) => {
    let date = (req.query.create_date)
    var totalResult = [];
    Bonuswait.find({ "status": "核准" }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
     
            for (const iterator of data) {
                if ((iterator.employee_id).toString() == (req.query._id).toString()) {
                    if (iterator.bonus_type == "绩效") {
                        let estimatedate = iterator.estimate_pay_date.substr(0, 7)//alice更改
                        if (estimatedate == req.query.create_date) {
                            var Achievement = {
                                "bonusWait_id": iterator._id,
                                "estimate_pay_date": iterator.estimate_pay_date,
                                "bonus_type": iterator.bonus_type,
                                "amount": iterator.amount,
                                "period": iterator.period
                            }
                            totalResult.push(Achievement)
                        }
                    } else if (iterator.bonus_type == "双薪") {
                        let estimatedate = iterator.estimate_pay_date.substr(0, 7)//alice更改                  
                        if (estimatedate == date) {
                            var dobuleSalary = {
                                "bonusWait_id": iterator._id,
                                "estimate_pay_date": iterator.estimate_pay_date,
                                "bonus_type": iterator.bonus_type,
                                "amount": iterator.amount,
                                "period": (iterator.period).substr(0, 4)
                            }
                            totalResult.push(dobuleSalary)
                        }
                    } else if (iterator.bonus_type == "一般分红" || iterator.bonus_type == "股权分红") {
                        let estimatedate = iterator.estimate_pay_date.substr(0, 7)//alice更改
                        if (estimatedate == date) {
                            var bonusWait = {
                                "bonusWait_id": iterator._id,
                                "estimate_pay_date": iterator.estimate_pay_date,
                                "bonus_type": iterator.bonus_type,
                                "amount": iterator.amount,
                                "period": (iterator.period).substr(0, 4)
                            }
                            totalResult.push(bonusWait)
                        }
                    }
                }
            }
            res.json({
                status: "200",
                result: totalResult
            })
        }
    })


})
//点击保存将薪资单变为草稿状态，点击发布变为“待支付”
router.post('/createPayslipAdd', (req, res) => {
    var create_date = (req.body.create_date).substr(0, 7)
    var employee_id = req.body.employee_id;
    var status = req.body.status;
    var employee_salary_structure_ids = req.body.employee_salary_structure_ids;
    var special_adjust = req.body.special_adjust
    Bonuswait.aggregate([
        {
            $match: {
                "estimate_pay_date": { $regex: create_date },
                "status": "核准",
                "employee_id": ObjectId(employee_id)

            }
        },
        {
            $group: {
                "_id": "$employee_id",
                "_ids": { $push: "$_id" }//直接将每个字段的_id放到_ids中
            }
        },
        {
            $project: {
                "_id": true,
                "_ids": 1
            }
        }
    ], (err, data) => {
        if(err){console.log(err.message);}
        if (data.length == 0) {

            Monthly_payslips.insertMany({
                employee_id: employee_id,
                status: status,
                create_date: create_date,
                employee_salary_structure_ids: employee_salary_structure_ids,
                special_adjust: special_adjust,
                bonus_wait_id: []
            }, (err, data) => {
                if (err) {
                    res.json({
                        status: 500
                    })
                    return;
                }
                res.json({
                    status: 200,
                    message: "生成薪资单成功",
                    result: data
                })
            })
            return
        } else if (data.length > 0) {
            Monthly_payslips.insertMany({
                employee_id: employee_id,
                status: status,
                create_date: create_date,
                employee_salary_structure_ids: employee_salary_structure_ids,
                special_adjust: special_adjust,
                bonus_wait_id: data[0]._ids
            }, (err, data) => {
                if (err) {
                    res.json({
                        status: 500
                    })
                    return;
                }
                res.json({
                    status: 200,
                    message: "生成薪资单成功",
                    result: data
                })
            })
        }
    })
})
// 批量发布时更改草稿状态为代支付状态
router.post('/updateMonthlyStatus_All', (req, res) => {
    var _id = req.body._id;
    Monthly_payslips.findOneAndUpdate({
            _id: ObjectId(_id)
        }, //查询条件
        {
            $set: {
                "status": "待支付"
            }
        }, //更改内容
        {
            "new": true
        },
        (err, data) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            res.json({
                status: 200,
                msg: "更改成功",
                result: data
            })
        })
})

//员工薪资发放和薪资单管理页面

//获取所有状态为“待支付”的员工薪资单
router.get('/allUnpaidPayslip', (req, res) => {
    var create_date = req.query.create_date;
    var status = req.query.status;
    let categoryisuse = [];
    let bonuswaitdata = [];
    (async function go() {
        Category.find({ "is_use": true }, function (err, data) {
            if (data) {
                data.forEach(item => {
                    categoryisuse.push((item._id).toString())
                })
            }
        })
        Bonuswait.find({ "status": "核准" }, (err, data1) => {
            if (data1) {
                // bonuswaitdata=data
                data1.forEach(item => {
                    bonuswaitdata.push(item)
                })
            }
        })
        Employees.aggregate([{
            $lookup: {
                from: 'employee_salary_structures',
                localField: '_id',
                foreignField: 'employee_id',
                as: 'employee_salary_structure'
            }
        }, {
            $lookup: {
                from: 'monthly_payslips',
                localField: '_id',
                foreignField: 'employee_id',
                as: 'monthly_payslip'
            }
        },
        {
            $unwind: {
                path: "$monthly_payslip",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        },
        {
            $lookup: {
                from: 'departments',
                localField: 'department_id',
                foreignField: '_id',
                as: 'department'
            }
        }, {
            $unwind: {
                path: "$department",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $match: {
                "monthly_payslip.create_date": create_date,
                "monthly_payslip.status": status
            }
        }], (err, data) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            if (data) {
                var result = [];
                data.forEach(element => {
                    var basicSum = 0;
                    var addedSum = 0;
                    var adjustdata = 0;
                    var reward = 0;
                    var bonusaddsum = 0
                    element.employee_salary_structure.forEach(item => {
                        if (categoryisuse.indexOf((item.category_id).toString()) != -1) {
                            if (item.category_type == '基本薪资') {
                                basicSum += parseInt(item.amount)
                            } else {
                                addedSum += parseInt(item.amount)
                            }
                        }
                    })
                    //计算调整项金额
                    element.monthly_payslip.special_adjust.forEach(item1 => {
                        if (item1.amount && item1.amount.indexOf("-") !== -1) {
                            item1.amount = item1.amount.substr(1, item1.amount.length - 1)
                            adjustdata += parseInt(item1.amount)
                        } else if (item1.amount) {
                            reward += parseInt(item1.amount)
                        }
                    })
                    //绩效
                    if (element.monthly_payslip.bonus_wait_id) {
                        element.monthly_payslip.bonus_wait_id.forEach(item3 => {
                            bonuswaitdata.forEach(item5 => {
                                if ((item5._id).toString() == item3.toString()) {
                                    bonusaddsum += item5.amount
                                }
                            })
                        })
                        element.salarySum = {
                            "basicSum": basicSum,
                            "addedSum": addedSum,
                            "salarySum": basicSum + addedSum - adjustdata + reward + bonusaddsum,
                            "specialadjustsum": reward - adjustdata,
                            "bonusaddsum": bonusaddsum
                        }
                        result.push(element)

                    } else {
                        element.salarySum = {
                            "basicSum": basicSum,
                            "addedSum": addedSum,
                            "salarySum": basicSum + addedSum - adjustdata + reward,
                            "specialadjustsum": reward - adjustdata,
                            "bonusaddsum": 0
                        }
                        result.push(element)
                    }
                });
                res.json({
                    status: 200,
                    result: result
                })
            }

        })

    })()


})

//根据名字和月份查找“待支付”的薪资单
router.get('/unpaidPayslipByNameAndMonth', (req, res) => {
    var create_date = req.query.create_date;
    var name = req.query.name;
    var status = req.query.status;
    let isuse=[]
    Category.find({"is_use":true},function(err,data){
        if(data){
            data.forEach(item=>{
                isuse.push((item._id).toString())
            })
        }
    })
    Employees.aggregate([{
        $lookup: {
            from: 'employee_salary_structures',
            localField: '_id',
            foreignField: 'employee_id',
            as: 'employee_salary_structure'
        }
    }, {
        $lookup: {
            from: 'monthly_payslips',
            localField: '_id',
            foreignField: 'employee_id',
            as: 'monthly_payslip'
        }
    }, {
        $lookup: {
            from: 'departments',
            localField: 'department_id',
            foreignField: '_id',
            as: 'department'
        }
    }, {
        $unwind: {
            path: "$monthly_payslip",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }, {
        $match: {
            "monthly_payslip.create_date": create_date,
            "monthly_payslip.status": status,
            "name": name
        }
    }], (err, data) => {
        if (err) {
            res.json({
                status: 500
            })
            return;
        }
        var result = [];
        data.forEach(element => {
            var basicSum = 0;
            var addedSum = 0;
            var adjustdata = 0;
            var reward = 0;
            element.employee_salary_structure.forEach(item => {
                if(isuse.indexOf((item.category_id).toString())!=-1){
                if (item.category_type == '基本薪资') {
                    basicSum += parseInt(item.amount)
                } else {
                    addedSum += parseInt(item.amount)
                }
             }
            })
            //计算调整项金额
            element.monthly_payslip.special_adjust.forEach(item1 => {
                if (item1.amount && item1.amount.indexOf("-") !== -1) {
                    item1.amount = item1.amount.substr(1, item1.amount.length - 1)
                    adjustdata += parseInt(item1.amount)
                } else if (item1.amount) {
                    reward += parseInt(item1.amount)
                }
            })
            element.salarySum = {
                "basicSum": basicSum,
                "addedSum": addedSum,
                "salarySum": basicSum + addedSum - adjustdata + reward,
                "specialadjustsum": reward - adjustdata
            }
            result.push(element)
        });
        res.json({
            status: 200,
            result: result
        })
    })
})
//点击更改薪资单状态
router.put('/payslipStatus', (req, res) => {
    var payslip_id = req.body.payslip_id;
    var status = req.body.status
    Monthly_payslips.findOneAndUpdate({
            _id: ObjectId(payslip_id)
        }, //查询条件
        {
            $set: {
                "status": status
            }
        }, //更改内容
        {
            "new": true
        },
        (err, data) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
           Bonuswait.findOneAndUpdate({employee_id:data.employee_id,estimate_pay_date:data.create_date}, {
            $set: {
                "is_paid":true
            }
        }, //更改内容
        {
            "new": true
        },function(err,data2){
            res.json({
                status: 200,
                msg: "发放成功",
                result: data
            })
           })
           
        })
})



//部门员工薪资单页面
//默认获取当前部门的所有员工薪资单
router.get('/departmentPayslips', (req, res) => {
    var employeeId=''
    var departmentId=''
    var create_date = req.query.create_date;
    var tel=req.data.phone
    let isusecategory=[]
    Category.find({"is_use":true},function(err,data){
        if(data){
            data.forEach(item=>{
                isusecategory.push((item._id).toString())
            })
        }
    })
 Users.findOne({"tel":tel},function(err,data){
   if(data){
     employeeId=data.employee_id
    Employees.find({"_id":employeeId},(err,data2)=>{
        if(data2&&data2[0].is_manager==true){
          departmentId=data2[0].department_id
        Employees.aggregate([{
            $lookup: {
                from: 'employee_salary_structures',
                localField: '_id',
                foreignField: 'employee_id',
                as: 'employee_salary_structure'
            }
        }, {
            $lookup: {
                from: 'monthly_payslips',
                localField: '_id',
                foreignField: 'employee_id',
                as: 'monthly_payslip'
            }
        }, {
            $lookup: {
                from: 'departments',
                localField: 'department_id',
                foreignField: '_id',
                as: 'department'
            }
        }, {
            $unwind: {
                path: "$monthly_payslip",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $unwind: {
                path: "$department",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $match: {
                "monthly_payslip.create_date": create_date,
                "department_id": ObjectId(departmentId)
            }
        }], (err, data3) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            var result = [];
            data3.forEach(element => {
                var basicSum = 0;
                var addedSum = 0;
                element.employee_salary_structure.forEach(item => {
                    if(isusecategory.indexOf((item.category_id).toString())!=-1){
                    if (item.category_type == '基本薪资') {
                        basicSum += parseInt(item.amount)
                    } else {
                        addedSum += parseInt(item.amount)
                    }
                }
                })
                element.salarySum = {
                    "basicSum": basicSum,
                    "addedSum": addedSum
                }
                result.push(element)
            });
            res.json({
                status: 200,
                result: result
            })
        })
    }else{
        res.json({
            status: 401,
            result: [],
            msg:"您不是部门主管无法查看部门员工薪资"
        })
    }
    })
    
}
})
})
//根据部门员工名字（实为id）搜索薪资单
router.get('/departmentEmployeePayslipByName', (req, res) => {
     var departmentId = "";
     var  employeeId=req.query.employeeId
     let categoryisuse=[]
     Category.find({"is_use":true},function(err,data){
         if(data){
             data.forEach(item=>{
                categoryisuse.push((item._id).toString())
             })
         }
     })

    var create_date = req.query.create_date;
    var name = req.query.name
    Employees.find({"_id":ObjectId(employeeId)},(err,data)=>{
        if(res){
            departmentId=data[0].department_id
           
        }
        Employees.aggregate([{
            $lookup: {
                from: 'employee_salary_structures',
                localField: '_id',
                foreignField: 'employee_id',
                as: 'employee_salary_structure'
            }
        }, {
            $lookup: {
                from: 'monthly_payslips',
                localField: '_id',
                foreignField: 'employee_id',
                as: 'monthly_payslip'
            }
        }, {
            $lookup: {
                from: 'departments',
                localField: 'department_id',
                foreignField: '_id',
                as: 'department'
            }
        }, {
            $unwind: {
                path: "$monthly_payslip",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $unwind: {
                path: "$department",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $match: {
                "monthly_payslip.create_date": create_date,
                "department_id": ObjectId(departmentId),
                "name": name
            }
        }], (err, data) => {
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            var result = [];
            data.forEach(element => {
                var basicSum = 0;
                var addedSum = 0;
                element.employee_salary_structure.forEach(item => {
                    if(categoryisuse.indexOf((item.category_id).toString())!=-1){
                    if (item.category_type == '基本薪资') {
                        basicSum += parseInt(item.amount)
                    } else {
                        addedSum += parseInt(item.amount)
                    }
                }
                })
                element.salarySum = {
                    "basicSum": basicSum,
                    "addedSum": addedSum
                }
                result.push(element)
            });
            res.json({
                status: 200,
                result: result
            })
        })

    })
   
})
//力导向图
router.get("/graphytu", (req, res) => {
    var tel = req.data.phone
    var employeeid = ''
    let structureids = []
    let specialadjust = []
    let basedata = []
    let reward = []
    let rewardids = []
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;

    let isusecategory = []
    if (month < 10) {
        month = "0" + month;
    }
    var dateString = year + "-" + month
    Category.find({ "is_use": true }, function (err, data) {
        if (data) {
            data.forEach(item => {
                isusecategory.push((item._id).toString())
            })
        }
    })
    Users.findOne({ "tel": tel }, function (err, data233) {
        if (data233) {
            employeeid = data233.employee_id
            Monthly_payslips.aggregate([
                {
                    $match: {
                        employee_id: employeeid,
                        "status": { $in: ["待支付", "已支付"] },
                        create_date: { $regex: dateString }
                    }
                }
            ], (err, data) => {

                if (data.length > 0) {
                    (async function go() {
                        if (data[0].employee_salary_structure_ids.length > 0) {   //10/31
                            data[0].employee_salary_structure_ids.forEach(item2 => {
                                structureids.push(ObjectId(item2))//问题
                            })
                            await Employee_salary_structures.aggregate([
                                {
                                    $match: {
                                        _id: { $in: structureids }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'categorys',
                                        localField: 'category_id',
                                        foreignField: '_id',
                                        as: 'categoryinfo'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$categoryinfo",
                                        preserveNullAndEmptyArrays: true // 空的数组也拆分
                                    }
                                },

                            ], (err, data1) => {
                                if (data1) {
                                    data1.forEach(item3 => {
                                        if (isusecategory.indexOf((item3.category_id).toString()) != -1) {
                                            basedata.push(item3)
                                        }
                                    })
                                }
                                if (data[0].special_adjust) {
                                    specialadjust = data[0].special_adjust
                                }
                                if (data[0].bonus_wait_id) {
                                    data[0].bonus_wait_id.forEach(item2 => {
                                        rewardids.push(ObjectId(item2))

                                    })
                                }
                                Bonuswait.aggregate([
                                    {
                                        $match: {
                                            "_id": { $in: rewardids }
                                        }
                                    }
                                ], (err, data2) => {

                                    if (data2) {
                                        // reward=data2
                                        reward = [...data2]
                                        let resultdata = {
                                            structuredata: basedata,
                                            specialadjust: specialadjust,
                                            rewarddata: reward
                                        }
                                        res.json({
                                            status: "200",
                                            result: resultdata
                                        })

                                    }
                                })
                            })
                        }
                    })()

                }
                else {
                    res.json({
                        status: "404",
                        msg: "无数据"
                    })
                }
            })
        }
    })

})


/**--------------------------新增的薪资单接口------------------ */

//获取员工个人所有的薪资单
router.get("/employeeAllPasiply", (req, res) => {
    let employeeid = "5d8866dcad02afb9906a4397"
    let isusecategory = []//category的id
    let basesalaryid = []
    let istrue = false
    let aa=0
    //思路
    //1.分为基本，奖金 调整
    Monthly_payslips.aggregate([
        {
            $match: {
                status: "待支付",
                employee_id: ObjectId(employeeid)
            }
        },
        //基本薪资
    ], (err, data) => {
        var ss = 0
        if (err) {
            res.json({
                status: "404",
                msg: "没有查询到数据"
            })
        } else if (data) {
            data.forEach((item, index) => {
                (async function go() {
                    await new Promise((resolve, reject) => {
                        let kk = []//存放基本薪资
                        let bonus = []//存放待发奖金档的数组
                        item.employee_salary_structure_ids.forEach(item2 => {
                            kk.push(ObjectId(item2))
                        })
                        item.bonus_wait_id.forEach(item3 => {
                            bonus.push(ObjectId(item3))
                        })
                        Employee_salary_structures.aggregate([
                            {
                                $match: {
                                    _id: { $in: kk }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'categorys',
                                    localField: 'category_id',
                                    foreignField: '_id',
                                    as: 'categoryinfo'
                                }
                            },
                            {
                                $unwind: {
                                    path: "$categoryinfo",
                                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                                }
                            },
                            {
                                $match: {
                                    "categoryinfo.is_use": true
                                }
                            },
                        ], (err, data1) => {
                            if (data1) {
                                Bonuswait.aggregate([
                                    {
                                        $match: {
                                            _id: { $in: bonus }
                                        }
                                    }
                                ], (err, data2) => {
                                    if (data2) {
                                        let k = {
                                            salarydata: data1,
                                            bonusdata: data2
                                        }
                                        Object.assign(item, k)
                 
                                        resolve(data)
                                        aa++;
                                    }
                                })
                            }
                        })
                    })
                    if(aa==data.length){
          
                        res.json({
                        status: 200,
                        result: data
                    })
                    }
                })()
            })
        }
    })
})
/**--------------------------上传和下载excel的接口------------------ */
// 批量下载
router.get('/downloadAll', (req, res) => {
    var create_date = req.query.create_date;
    var employeeId = req.query.employeeId
    var employeeIds = []
    employeeId.forEach(i => {
        employeeIds.push(ObjectId(i))
    })
    Employee_salary_structures.aggregate([{
            $lookup: {
                from: 'employees',
                localField: 'employee_id',
                foreignField: '_id',
                as: 'employee'
            }
        }, {
            $lookup: {
                from: 'monthly_payslips',
                localField: 'employee_id',
                foreignField: 'employee_id',
                as: 'monthly_payslip'
            }
        }, {
            $lookup: {
                from: 'categorys',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $match: {
                "category.is_use": true
            }
        },
        {
            $lookup: {
                from: 'grades',
                localField: 'grade_id',
                foreignField: '_id',
                as: 'grade'
            }
        }, {
            $lookup: {
                from: 'levels',
                localField: 'level_id',
                foreignField: '_id',
                as: 'level'
            }
        }, {
            $unwind: {
                path: "$monthly_payslip",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $unwind: {
                path: "$grade",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $unwind: {
                path: "$level",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        }, {
            $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        },
        {
            $match: {
                "monthly_payslip.create_date": create_date,
                "employee._id": {
                    "$in": employeeIds
                }
            }
        },
        {
            $group: {
                "_id": "$employee_id",
                "monthly_payslip": {
                    $first: "$monthly_payslip"
                }
            }
        }
    ], (err, data) => {

        Employees.aggregate([{
                $lookup: {
                    from: 'departments',
                    localField: 'department_id',
                    foreignField: '_id',
                    as: 'depart'
                }
            }, {
                $unwind: {
                    path: "$depart",
                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                }
            },
            {
                $match: {
                    "_id": {
                        "$in": employeeIds
                    }
                }
            }
        ], (err, data1) => {
            data.forEach(i => {
                data1.forEach(j => {
                    if (i._id.toString() == j._id.toString()) {
                        Object.assign(i, j)
                    }
                })
            })
            if (err) {
                res.json({
                    status: 500
                })
                return;
            }
            res.json({
                status: 200,
                result: data
            })

        })
    })
})
//批量上传
router.put('/uploadAll', function (req, res) {
    var uploadData = req.body.params.uploadData;
    uploadData.forEach(i => {
 
        Monthly_payslips.findOneAndUpdate({
                _id: ObjectId(i._id)
            }, //查询条件
            {
                $set: {
                    "special_adjust": i.special_adjust
                }
            }, //更改内容
            {
                "new": true
            },
            function (err, data) {
                if (err) {
                    console.log(err)
                } else {
                }
            })
    })
})

module.exports = router