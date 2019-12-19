var express = require('express')
var router = express.Router()
var mongoose = require('mongoose');

var LevelMapping = require('../../models/medal/projectQueries/level_mapping')
var PointUserLog = require('../../models/medal/projectManagement/pointUserLog')
var Employee = require('../../models/employeeManagement/employee')
var ObjectId = mongoose.mongo.ObjectId;
var LavalMapping=require("../../models/medal/projectQueries/level_mapping")

//请求方式 :GET 
//下拉菜单等级选择
router.get('/levelTable', function (req, res) {
  var item = req.query.item;
  var type=req.query.type
  var category = {};
  if (item == "全部" || item == "") {
    category = {
      type:type
    }
  }else  {
    category = {
      type:type,
      "level": item
    }
  }
  LevelMapping.find(category, function (err, data) {
// return console.log(data)
    res.json({
      status: "200",
      result: data
    })
  });
});
router.get("/levels", (req, res) => {
  
  var type=req.query.type

  LevelMapping.find({"type":type}, function (err, data) {
    // return console.log(data)
    res.json({
      status: "200",
      result: data
    })
  })
});
//levelTable
router.get("/checkout_levelTables", (req, res) => {
  var id = {};
  LevelMapping.find(id, function (err, data) {
    res.json({
      status: "200",
      result: data
    })
  })
});
//编辑项目等级对照表
router.put("/levelTableUpdate", (req, res) => {
  var index = req.body.index;
  var amount = req.body.amount;
  LevelMapping.findOneAndUpdate({
    _id: index
  }, {
    "$set": {
      "amount": amount
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
      status: "200",
      result: data
    })
  })
});
// 删除操作
//请求方式 delete
router.delete("/levelTableDelete", (req, res) => {
  var id = req.body.id;
  LevelMapping.deleteOne({
    _id: id
  }, function (err, data) {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      msg: "删除成功",
      result: data
    })
  })
});

//增加等级
router.post('/levelTableAdd', function (req, res) {
  var start = req.body.start
  var end = req.body.end;
  var level = req.body.level;
  var amount = req.body.amount;
  var type = req.body.type;
  var id = {};
  LevelMapping.find(id, function (err, data) {
    var flag = data.some(item => {
      if (item.level == level && item.type==type) {
        return true
      } else {
        return false
      }
    })
    if (!flag) {
      LevelMapping.insertMany({
        start: start,
        end: end,
        level: level,
        amount: amount,
        type:type
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
          result: data,
        })
      })
    } else {
      res.json({
        status: "304"
      })
    }
  })
});

//勋章排行榜 Collaboration
router.get('/rankingList_cc', function (req, res) {
  PointUserLog.aggregate([{
      $match: {
        "point_type": "Collaboration",
        "status": "同意"
      }
    },
    {
      $group: {
        _id: "$employee_id",
        point_sum: {
          $sum: "$point"
        }
      }
    },
  ], (err, data) => {
    if (err) {
      res.json({
        status: '500',
      })
      return;
    }
    res.json({
      status: '200',
      result: data
    })
  })
});
//勋章排行榜 Collaboration 对应某个人的

router.get('/rankingList_cc1', function (req, res) {
  var id = req.query._id;
  var data=[]
  PointUserLog.aggregate([
    {
      $match: {
        "point_type": "Collaboration",
        "status":"同意"
      }
    },
    {
      $group: {
        _id: "$employee_id",
        point_sum: { $sum: "$point" }
      }
    }
  ],(err, data1) => {
      for (const iterator of data1) {
        if(id==iterator._id){
         data.push(iterator)
        }
      }
      return res.json({
        status: '200',
        result: data
      })
  })
});

//勋章排行榜 Management
router.get('/rankingList_pm', function (req, res) {
  PointUserLog.aggregate([
    {
      $match: {
        "point_type": "Management" ,
        "status":"同意"
      }
    },
    {
      $group: {
        _id: "$employee_id",
        point_sum: { $sum: "$point" }
      }
    }
  ],(err, data) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.json({
        status: '200',
        result: data
      })
    }
  })
});
////
router.get('/rankingList_pm1', function (req, res) {
  var id = req.query._id;
  let data=[]
  PointUserLog.aggregate([
    {
      $match: {
        "point_type": "Management",
        "status":"同意"
      }
    },
    {
      $group: {
        _id: "$employee_id",
        point_sum: { $sum: "$point" }
      }
    }
  ],(err, data1) => {
      for (const iterator of data1) {
        if(id==iterator._id){
          data.push(iterator)
        }
      }
     res.json({
       status:"200",
       result:data
     })
  })
});



//公司勋章记录 搜索
//公司勋章排行榜单  alice
router.get("/getranklist", (req, res) => {
  var item1 = req.query.item1;
  var item2 = req.query.item2;
  var category = {};
  if (item1 == "全部" || item1 == "") {
    category = {}
  } else if (item1 == "项目编号") {
    category = {
      "project_number": item2
    }
  } else if (item1 == "勋章类别") {
    category = {
      "point_type": item2
    }
  } else if (item1 == "勋章单位") {
    category = {
      "project_unit": item2
    }
  } else if (item1 == "获得年度") {
    category = {
      "issue_date": {$regex:item2.substr(0,4)}
    }
  } else if (item1 == "项目名称") {
    category = {
      "project_name": item2
    }
  }
  PointUserLog.aggregate([
    {
      $lookup: {
        from: "project_lists",
        localField: "project_id",
        foreignField: "_id",
        as: "projectuserlog"
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
      $unwind: { // 拆分子数组
        path: "$employeeinfo",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },

    {
      $unwind: { // 拆分子数组
        path: "$projectuserlog",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $match: {
        "status": "同意"
      }
    },
    
    {
      $group: {
        "_id": { employee_id: "$employee_id", point_type: "$point_type", project_id: "$project_id" },
        sumpoint: { "$sum": "$point" },
        issue_date: { $first: "$issue_date" },
        project_name: { $first: "$projectuserlog.name" },
        product_number: { $first: "$projectuserlog.number" },
        project_manager: { $first: "$projectuserlog.manager" },
        project_unit: { $first: "$projectuserlog.unit" },
        project_member: { $first: "$employeeinfo.name" }
      }
    },
    {
      $project: {
        _id: true,
        point_type: "$_id.point_type",
        employee_id: "$_id.employee_id",
        project_name: "$project_name",
        project_number: "$product_number",
        project_manager: "$project_manager",
        sumpoints: "$sumpoint",
        issue_date: "$issue_date",
        project_unit: "$project_unit",
        project_member: "$project_member"
      },

    },
    {
      $match: category
    },
   

  ], function (err, data) {
    // return console.log(data)
    if (err) {
      console.log(err);
    } else {

      return res.json({
        status: '200',
        result: data,
      })
    }

  })
});

//个人点数统计
router.get("/personalpoint", (req, res) => {
  var date = new Date().getFullYear()

  PointUserLog.aggregate([
    {
      $match: {
        "status": "同意",
        issue_date: { $regex: date.toString() }
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
      $unwind: { // 拆分子数组
        path: "$employeeinfo",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $group: {
        "_id": { employee_id: "$employee_id", point_type: "$point_type" },
        name: { $first: "$employeeinfo.name" },
        sumpoint: { $sum: "$point" },
        issue_date: { $first: "$issue_date" }
      }
    },
    {
      $project: {
        _id: true,
        name: "$name",
        "sumpoint": "$sumpoint",
        "issue_date": "$issue_date"

      }
    }

  ], function (err, data) {
    if (err) {
      console.log(err);
    } else {
      // console.log(data)
      let testdata = []
      let popdata = []
      for (let i = 0; i <= data.length - 1; i++) {
        testdata.push(data[i])
        testdata.forEach((item1, index) => {
          if ((item1._id.employee_id).toString() == (data[i]._id.employee_id).toString()) {
            if (item1._id.point_type !== data[i]._id.point_type) {
              let test = testdata.splice(index, 1)
              test.forEach(item7 => {
                popdata.push(item7)
              })
              let a = {
                "ds": "添加进来的",
                point_type: data[i]._id.point_type,
                point: data[i].sumpoint
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
      var levelmap1 = {};
      var levelmap2 = {};
      (async function(){
       await LavalMapping.find((err, data2) => {
          testdata.forEach(item1 => {
            //要从level的type 来和item1的pointtype来匹配
            data2.forEach(item2 => {
              if (item2.type == "Collaboration") {
              
                if (item1._id.point_type == "Collaboration") {
                //  return  console.log(item1)
                  if (item2.end != "-") {
                    // console.log(22)
                    if ((item1.sumpoint >= item2.start) && (item1.sumpoint < item2.end)) {
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.sumpoint
                      }
                      item1 = Object.assign(item1,levelmap1)
                    
                    }
                  } else {
                    if (item1.sumpoint >= item2.start) {
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap1)
                    }
                  }
           
                } else if (item1.point_type == "Collaboration") {
                  // return console.log(item1)
                  if (item2.end != "-") {
                    if ((item1.point >= item2.start) && (item1.point < item2.end)) {
                      console.log("1")
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.point

                      }
                      item1 = Object.assign(item1, levelmap1)
             
                    }
                  } else {
                    if (item1.point >= item2.start) {
                      console.log("1")
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.point

                      }
                      item1 = Object.assign(item1, levelmap1)
              
                    }
                  }
                }
          
              } else {
                if (item1._id.point_type == "Management") {
               
                  if (item2.end != "-") {
                    if ((item1.sumpoint >= item2.start) && (item1.sumpoint < item2.end)) {
       
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.sumpoint
                      }
                      item1 = Object.assign(item1,levelmap2)
                    
                    }
                  } else {
                    if (item1.sumpoint >= item2.start) {
              
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap2)
             
                    }
                  }
                } else if (item1.point_type == "Management") {
  
                  // return console.log(item1)
  
                  if (item2.end != "-") {
                    if ((item1.point >= item2.start) && (item1.point < item2.end)) {
                      // return   console.log("1",item1) // console.log("1")
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.point

                      }
                      item1 = Object.assign(item1, levelmap2)
                     
                    }
    
                  } else {
                    if (item1.point >= item2.start) {
                    
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.point

                      }
                      item1 = Object.assign(item1, levelmap2)
          
                    }
                   
                  }
                }
              }
             
            })
          })
        })
        res.json({
          status:"200",
          result:testdata
        })

      })()
      
    }
  })
});
//搜索
router.post("/searchpersonalpoint", (req, res) => {
  var date = new Date().getFullYear()
  var employeeId=req.body.employeeId
  // return console.log(employeeId)
  PointUserLog.aggregate([
    {
      $match: {
        "status": "同意",
        issue_date: { $regex: date.toString() },
        "employee_id":ObjectId(employeeId)
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
      $unwind: { // 拆分子数组
        path: "$employeeinfo",
        preserveNullAndEmptyArrays: true // 空的数组也拆分
      },
    },
    {
      $group: {
        "_id": { employee_id: "$employee_id", point_type: "$point_type" },
        name: { $first: "$employeeinfo.name" },
        sumpoint: { $sum: "$point" },
        issue_date: { $first: "$issue_date" }
      }
    },
    {
      $project: {
        _id: true,
        name: "$name",
        "sumpoint": "$sumpoint",
        "issue_date": "$issue_date"

      }
    }

  ], function (err, data) {
    // return console.log(data)
    if (err) {
      console.log(err);
    } else {
      // console.log(data)
      let testdata = []
      let popdata = []
      for (let i = 0; i <= data.length - 1; i++) {
        testdata.push(data[i])
        testdata.forEach((item1, index) => {
          if ((item1._id.employee_id).toString() == (data[i]._id.employee_id).toString()) {
            if (item1._id.point_type !== data[i]._id.point_type) {
              let test = testdata.splice(index, 1)
              test.forEach(item7 => {
                popdata.push(item7)
              })
              let a = {
                "ds": "添加进来的",
                point_type: data[i]._id.point_type,
                point: data[i].sumpoint
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
      var levelmap1 = {};
      var levelmap2 = {};
      (async function(){
       await LavalMapping.find((err, data2) => {
          testdata.forEach(item1 => {
            //要从level的type 来和item1的pointtype来匹配
            data2.forEach(item2 => {
              if (item2.type == "Collaboration") {
              
                if (item1._id.point_type == "Collaboration") {
                //  return  console.log(item1)
                  if (item2.end != "-") {
                    // console.log(22)
                    if ((item1.sumpoint >= item2.start) && (item1.sumpoint < item2.end)) {
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.sumpoint
                      }
                      item1 = Object.assign(item1,levelmap1)
                    
                    }
                  } else {
                    if (item1.sumpoint >= item2.start) {
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap1)
                    }
                  }
           
                } else if (item1.point_type == "Collaboration") {
                  // return console.log(item1)
                  if (item2.end != "-") {
                    if ((item1.sumpoint >= item2.start) && (item1.sumpoint < item2.end)) {
                      console.log("1")
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap1)
             
                    }
                  } else {
                    if (item1.sumpoint >= item2.start) {
                      console.log("1")
                      levelmap1 = {
                        "cctype": "Collaboration",
                        "ccamount": item2.amount,
                        "cclevel": item2.level,
                        "ccsumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap1)
              
                    }
                  }
                }
          
              } else {
                if (item1._id.point_type == "Management") {
                  if (item2.end != "-") {
                    if ((item1.sumpoint >= item2.start) && (item1.sumpoint < item2.end)) {
       
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.sumpoint
                      }
                      item1 = Object.assign(item1,levelmap2)
                    
                    }
                  } else {
                    if (item1.sumpoint >= item2.start) {
              
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap2)
             
                    }
                  }
                } else if (item1.point_type == "Management") {
    
  
                  if (item2.end != "-") {
                    if ((item1.sumpoint >= item2.start) && (item1.sumpoint < item2.end)) {
                      console.log("1")
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap2)
                     
                    }
    
                  } else {
                    if (item1.sumpoint >= item2.start) {
                      console.log("1")
                      levelmap2 = {
                        "managetype": "Management",
                        "manageamount": item2.amount,
                        "managelevel": item2.level,
                        "managesumpoint":item1.sumpoint

                      }
                      item1 = Object.assign(item1, levelmap2)
          
                    }
                   
                  }
                }
              }
              // console.log("testdata", testdata )
            })
          })
        })
        console.log(".....")
        console.log(testdata)
        res.json({
          status:"200",
          result:testdata
        })

      })()
      
    }
  })
});
module.exports = router