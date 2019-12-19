
var express = require('express')
var router = express.Router()
var utils = require('../utils/index.js');
var Machines = require('../models/productionManagement/machine');
var WorkCenters = require('../models/productionManagement/workCenter');
var SinglePrints = require('../models/productionManagement/singlePrint');
var Users = require('../models/admin/users.js')
var mongoose = require('mongoose');
var ObjectId = mongoose.mongo.ObjectId;
mongoose.set('useFindAndModify', false)
var request = require('request');


// 获取当亲用户下的制作中心
router.get('/getUserCenters',function(req,res){
    const phone = req.query.tel;
   Users.findOne({tel:phone}).then(doc=>{
    if(doc){
        WorkCenters.find({}).then(data=>{
            const workcenterIds=doc.workCenterId;
            var WorkCenter=[];
            if(data){
              workcenterIds.forEach(el=>{
                data.forEach(item=>{
                  if(el.toString() ==  ObjectId(item._id).toString()){
                    WorkCenter.push(item.workName)
                  }
                })
              })
              return res.json({ 
                status: '200',
                msg: '查询成功',
                result: WorkCenter
                 });
                }
        })
    }
   })
})
//获取所有制作心中
router.get('/getAllWork', function (req, res) {
    WorkCenters.find({}, function (err, data) {
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
// 根据机器id获取机器数据
router.get('/getMachineById', function (req, res) {
    var machineId = req.query.id;
    Machines.aggregate([{
            $lookup: {
                from: "workcenters",
                localField: "workCenterId",
                foreignField: "_id",
                as: "item"
            },

        },
        {
            $match: {
                "_id": mongoose.Types.ObjectId(machineId)
            }

        }

    ], (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        res.json({
            status: '200',
            result: data
        })
    })


})
//按照制作中心名称查找该中心下的所有机器   小程序也适用
router.get("/getMachineBypro", function (req, res) {
    var workName = req.query.workName;
    var workCenters = req.query.workCenters

    var condition = [{
        $lookup: {
            from: "machines",
            localField: "_id",
            foreignField: "workCenterId",
            as: "item"
        }
    }]
    if(workName){
        condition.push({
            $match: {
                "workName": workName
            }
    })
}
    if(workCenters){
        workCenters.shift()
        condition.push({
            $match: {
                "workName": {$in:workCenters}
            }
    })
    }
    WorkCenters.aggregate(condition, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        data.forEach(el => {
            el.item.forEach(ele => {
                ele.item = [{
                    workName: el.workName
                }]
            })
        });
        res.json({
            status: '200',
            result: data,
        })
    })
})
//获取全部机器信息
router.get('/getAllMachine', function (req, res) {
    let workCenters = req.query.workCenters;
    let condition =[{
        $lookup: {
            from: "workcenters",
            localField: "workCenterId",
            foreignField: "_id",
            as: "item"
        }
    }]
    if(workCenters){
        condition.push({
            $match:{
                "item.workName":{$in:workCenters}
            }
        })
    }

    Machines.aggregate(condition, function (err, data) {
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
//按照机器名称获取机器数据
router.get('/getMachineByName', function (req, res) {
    var nickName = req.query.nickName;
    if(!nickName || nickName=='请输入'){
        return res.json({
             status: '404',
             msg: ''
         })
     }
    Machines.findOne({
        nickName: nickName
    }).then(doc => {
        if (doc) {
            var id = doc._id;
            Machines.aggregate([{
                $lookup: {
                    from: "workcenters",
                    localField: "workCenterId",
                    foreignField: "_id",
                    as: "item"
                }
            }, {
                $match: {
                    "_id": id
                }
            }], function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                res.json({
                    status: '200',
                    result: data,
                })
            })
        } else {
            res.json({
                status: '200',
                result: data,
            })
        }

    })


})
//新增机器
router.post('/addMachine', function (req, res) {
    var workName = req.body.workName;
    const machineFiled = {};
     machineFiled.serialNumber = req.body.serialNumber;
     machineFiled.nickName = req.body.nickName;
     machineFiled.category = req.body.category;
     if(req.body.type && req.body.type.length!=0){machineFiled.type = req.body.type;}
     machineFiled.status = req.body.status;
    if (req.body.click_count && req.body.category==="打印机") machineFiled.click_count = req.body.click_count;
    Machines.findOne({$or:[{serialNumber: req.body.serialNumber},{nickName:req.body.nickName}]
    }).then(doc => {
        if (doc) {
            res.json({
                status: '400',
                msg: "此机器已经存在",
                result: []
            })
        } else {
            WorkCenters.findOne({
                workName: workName
            }, function (err, data) {
                if (err) {
                    console.log(err)
                } else {
                    const workCenterId = data._id;
                    machineFiled.workCenterId = workCenterId;
                    new Machines(machineFiled).save().then(machine => {
                        res.json({
                            status: '200',
                            result: machine
                        })
                    })
                }
            })
        }
    })



})

//删除机器
router.delete('/delMachine', function (req, res) {
    var machineId = req.body.machineId;
    Machines.findByIdAndRemove({
        _id: machineId
    }).then(machine => {
        machine.save().then(machine => {
            res.json({
                status: '200',
                msg: "删除成功",
                result: machine
            })
        })
    }).catch(err => res.status(404).json(err))
})

//编辑机器信息
router.post('/updateMachine', function (req, res) {
    var machineId = req.body.machineId;
    var workName = req.body.workName;
    var updateList = req.body.updateList; //包括更新的字段
    if(updateList.category !='打印机'){
            delete updateList.type
            delete updateList.click_count


    }
    if (workName != undefined) {
                WorkCenters.findOne({
                    workName: workName
                }, function (err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        const workCenterId = data._id;
                        var newList = Object.assign({
                            workCenterId: workCenterId
                        }, updateList)
                        Machines.findOneAndUpdate({
                            _id: req.body.machineId
                        }, {
                            $set: newList
                        }, function (err, data) {
                            if (err) {
                                console.log(err);
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
        Machines.findByIdAndUpdate(machineId, updateList, function (err, res) {
            if (err) {
                console.log(err);
            } else {}
        });
    }
})


//以下是小程序用到的API
//获取当前用户所属打印中心的机器
router.get('/getUserMachines', function (req, res) {
    var area_id = "5b3f2f696a9dfa19180c715b";
    WorkCenters.aggregate([{
        $lookup: {
            from: "machines",
            localField: "area_id",
            foreignField: "area_id",
            as: "item"
        }
    }, {
        $match: {
            "area_id": area_id
        }
    }], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        if (data.length != 0) {
            res.json({
                status: '200',
                result: data,
            })
        } else {
            res.json({
                status: '404',
                msg: "无数据",
                result: []
            })
        }
    })

})
//补全未录入的打印量
router.post('/addPrint', async function(req,res){
    const category = req.body.category;
    const type = req.body.type;
    const machineId = req.body.machineId;
    const startDate = req.body.startDate; //需要补充历史记录的第一天
    const endDate = req.body.endDate;  //需要补充历史记录的最后一天
    const currentDate = req.body.currentDate; //有历史记录的页面
    const addby = req.body.addby;
    const addat = req.body.addat;
    // const click_count = req.body.click_count;
    const invalid_click = 0
    type.forEach(el=>{
        el.last_day_click = 0
    })
    var list = [];
   const time_area= utils.getDiffDate(startDate, endDate)
 time_area.forEach( async (time)=>{
    let updateSingle = {
        addat: addat,
        addby: addby,
        printDate:time,
        machineId: machineId,
        type:type,
        invalid_click:invalid_click
    }
    list.push(updateSingle)
})
 SinglePrints.insertMany(list).then(result=>{
    if(result.length>0){
        res.json({
            status:"200",
            msg:"强制录入成功",
            result:type
        })
    }else{
        res.json({
            status:"404",
            msg:"强制录入失败，请手动补全"
        })
    }
 })

})
// //录入打印量
// router.post('/addClick', function (req, res) {
//     var category = req.body.category;
//     var machineId = req.body.machineId;
//     var printDate = req.body.printDate;
//     var addby = req.body.addby;
//     var addat = req.body.addat;
//     var invalid_click = req.body.invalid_click;
//     var last_day_click = parseInt(req.body.last_day_click);
//     if (req.body.click_count && req.body.click_count !== undefined) {
//         var nowClicks = req.body.click_count;
//         var updateList = {
//             click_count: nowClicks
//         }
//         var updateSingle = {
//             printDate: printDate,
//             last_day_click: last_day_click,
//             addat: addat,
//             addby: addby,
//             machineId: machineId,
//             click_count: nowClicks,
//             invalid_click:invalid_click
//         }
//     } else {
//         var updateSingle = {
//             printDate: printDate,
//             last_day_click: last_day_click,
//             addat: addat,
//             addby: addby,
//             machineId: machineId,
//             invalid_click:invalid_click

//         }
//     }
//     var yesDay = utils.getPreDay(printDate);
//     //如果打印日期是当前最大,就可以覆盖，如果不是就不更新
//     if (category && category == "打印机") { //如果是打印机的或，添加打印量时会生成对应的singleprint历史记录
//         SinglePrints.findOne({
//             printDate,
//             machineId: mongoose.Types.ObjectId(machineId)
//         }).then(document => {
//             if (!document) { //此条数据不存在
//                 new SinglePrints(updateSingle).save().then(data => {
//                     SinglePrints.find({machineId: mongoose.Types.ObjectId(machineId)}).then(data => {
//                         var constData = data.filter(ele => {
//                             if(printDate!==ele.printDate){
//                                 var isBiger = utils.dateCompare(printDate,ele.printDate)
//                                 return isBiger
//                             }
//                         })
//                         if (constData.length == 0) {
//                             updateList = {
//                                 click_count: nowClicks
//                             }
//                             Machines.findByIdAndUpdate(machineId, updateList, {new:true},function (err, docs) {
//                                 if (err) {
//                                     console.log(err);
//                                 } else if (docs) { //数据已经存在，更新成功,并且更新了机器表
//                                     res.json({
//                                         status: '200',
//                                         msg: "录入打印量成功",
//                                         result: docs
//                                     })
//                                 } else {
//                                     res.json({
//                                         status: '404',
//                                         msg: "录入失败",
//                                         result: []
//                                     })
//                                 }
//                             });

//                         } else { //数据已经存在，更新成功
//                             res.json({
//                                 status: '200',
//                                 msg: "录入打印量成功",
//                                 result: data
//                             })
//                         }
//                     })
//                 })
//             } else { //这条数据已经存在
//                 SinglePrints.findOneAndUpdate({
//                     printDate,
//                     machineId: mongoose.Types.ObjectId(machineId)
//                 }, updateSingle,{new:true}, function (err, data) {
//                     if (err) {
//                         console.log(err)
//                     } else {
//                         SinglePrints.find({machineId: mongoose.Types.ObjectId(machineId)}).then(data => {
//                             var constData = data.filter(ele => {
//                                 if (printDate != ele.printDate) {
//                                     var isBiger = utils.dateCompare(printDate,ele.printDate)
//                                     return isBiger
//                                 }
//                             })
//                             if (constData.length == 0) {
//                                 updateList = {
//                                     click_count: nowClicks
//                                 }
//                                 Machines.findByIdAndUpdate(machineId, updateList,{new:true}, function (err, docs) {
//                                     if (err) {
//                                         console.log(err);
//                                     } else if (docs) {
//                                         res.json({
//                                             status: '200',
//                                             msg: "更新打印量成功",
//                                             result: docs
//                                         })
//                                     } else {
//                                         res.json({
//                                             status: '404',
//                                             msg: "更新失败",
//                                             result: ''
//                                         })
//                                     }
//                                 });

//                             } else {
//                                 res.json({
//                                     status: '200',
//                                     msg: "更新打印量成功",
//                                     result: data
//                                 })
//                             }
//                         })
//                     }
//                 })

//             }
//         })
//     } else { //如果是打印机以外机器的话，
//         SinglePrints.findOne({
//             printDate,
//             machineId
//         }).then(doc => {
//             if (!doc) {
//                 new SinglePrints(updateSingle).save().then(data => {
//                     res.json({
//                         status: '200',
//                         msg: "录入装订量成功",
//                         result: data
//                     })

//                 })
//             } else { //这条数据已经存在
//                 SinglePrints.findOneAndUpdate({
//                     printDate,
//                     machineId
//                 }, updateSingle, function (err, data) {
//                     if (err) {
//                         console.log(err)
//                     } else {
//                         res.json({
//                             status: '200',
//                             msg: "更新装订量成功",
//                             result: data
//                         })
//                     }
//                 })

//             }

//         })

//     }
// })
//录入打印量
router.post('/addClick', async (req, res) => {
    let {
      printDate,
      addat,
      addby,
      type,
      invalid_click,
      machineId,
      category
    } = req.body;
    // TODO: 以下验证重构后使用，勿删
    // if (!printDate||!_.isString(printDate)||!addat||!_.isString(addat)||!addby||!_.isString(addby)
    // ||!validTool.isId(machineId)||!type||!_.isArray(type)||!invalid_click||!_.isNumber(invalid_click)) {
    //     return res.json(resTool.resParamError());
    // }
    let last_day_click;
    // if (req.body.click_count && !_.isNumber(req.body.click_count)) { // 非打印机不传type和click_count字段
    if (req.body.last_day_click) { // 非打印机不传type和click_count字段
      last_day_click = req.body.last_day_click;
    }
  
    let printDataObj = Object.create(null);
    let updateMacObj = Object.create(null);
    if (category === "打印机") {
      printDataObj = {
        printDate,
        addat,
        addby,
        type,
        machineId,
        invalid_click
      };
      updateMacObj.click_count = Object.create(null);
      type.map(item => { // 组装machine表的type字段
        let key = item.type;
        updateMacObj.click_count[key] = item.click_count;
      });
      // updateMacObj.type = typeArr;
      // updateMacObj.click_count = type.filter( item => { // 组装machine表click_count字段
      //     return item.click_count;
      // });
      // console.log(updateMacObj)
    } else {
      printDataObj = {
        printDate,
        addat,
        addby,
        machineId,
        invalid_click,
        last_day_click
      };
    }
  
    let isExist = await SinglePrints.findOne({ // 判断是否存在这一天的录入记录
      "machineId": printDataObj.machineId,
      "printDate": printDataObj.printDate
    });
    let result;
    if (isExist === null) { // 新增
      try {
        result = await new SinglePrints(printDataObj).save();
      } catch (err) {
        return err.message || "保存出错";
      }
      if (category === "打印机") {
        await Machines.findByIdAndUpdate(machineId, updateMacObj);
      }
      return res.json({
        status: 200,
        result,
        msg: "录入成功"
      });
    }
    result = await SinglePrints.findOneAndUpdate({
      "machineId": printDataObj.machineId,
      "printDate": printDataObj.printDate
    }, printDataObj, {
      new: true
    });
    if (category === "打印机") {
      await Machines.findByIdAndUpdate(machineId, updateMacObj);
    }
    return res.json({
      status: 200,
      result,
      msg: "更新成功"
    });
  });
// router.get('/getHistoryByMachine', function (req, res) {
//     var nickName = req.query.nickName;

//     Machines.aggregate([{
//             $lookup: {
//                 from: "wxsingleprints",
//                 localField: "_id",
//                 foreignField: "machineId",
//                 as: "cate"
//             }
//         },
//         {
//             $match: {
//                 "nickName": nickName,
//             }
//         },
//         {
//             $unwind: { // 拆分子数组
//                 path: "$cate",
//                 preserveNullAndEmptyArrays: true // 空的数组也拆分
//             }
//         }
//     ], function (err, data) {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         if (data) {
//             data.forEach(element => {
//                 var list = {
//                     serialNumber: element.serialNumber,
//                     nickName: element.nickName,
//                     category: element.category,
//                     type: element.type,
//                     workCenterId: element.workCenterId,
//                     status: element.status,
//                 }
//                 if (element.cate && element.cate.length != 0) {
//                     element.cate = Object.assign(element.cate, list)

//                 }
//             })
//             var result = data.filter(da => {
//                 return da.cate !== undefined
//             })
//             result =  utils.sortDataArray(result)
//             res.json({
//                 status: '200',
//                 result: result,
//             })
//         } else {
//             res.json({
//                 status: '404',
//                 msg: '暂无历史记录',
//                 result: [],
//             })
//         }
//     })


// })
router.get("/getHistoryByMachine", function (req, res) {
    var nickName = req.query.nickName;
    console.log("nickName", nickName)
    Machines.aggregate(
      [{
          $lookup: {
            from: "wxsingleprints",
            localField: "_id",
            foreignField: "machineId",
            as: "cate"
          }
        },
        {
          $match: {
            nickName: nickName
          }
        },
        {
          $unwind: {
            // 拆分子数组
            path: "$cate",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
          }
        }
      ],
      function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        if (data) {
          let list={};
          data.forEach(element => {
            list = {
              serialNumber: element.serialNumber,
              nickName: element.nickName,
              category: element.category,
              workCenterId: element.workCenterId,
              status: element.status
            };
            if (element.cate && element.cate.type) {
              list.type = element.cate.type;
            }
            if (element.cate && element.cate.length != 0) {
              element.cate = Object.assign(element.cate, list);
            }
          });
          var result = data.filter(da => {
            return da.cate !== undefined;
          });
          result = utils.sortDataArray(result);
          res.json({
            status: "200",
            result: result
          });
        } else {
          res.json({
            status: "404",
            msg: "暂无历史记录",
            result: []
          });
        }
      }
    );
  });
  router.get('/getRecordByMachine', async (req, res) => {
    let nickName = req.query.nickName;
    let result = await SinglePrints.find().populate({
        path: 'machineId',
        match: {
            nickName
        }
    });
    result = result.filter(res => {
        return res.machineId && res.machineId != null
    })
    if (result.length === 0) { // 第一次录入返回初始数据
        let first = await Machines.findOne({nickName}).lean();
        let arr =[];
        for (const key in first.click_count) {
            let item = Object.create(null)
            item.type = key;
            item.click_count = first.click_count[key];
            arr.push(item);
        }
        first.type = arr;
        res.json({
            status: "404",
            msg: "第一次录入",
            result: first
        });
    } else {
        // result = utils.sortDataArray(result);
        res.json({
            type: result[0].machineId.type,
            machineId: result[0].machineId._id,
            status: "200",
            msg: "有历史记录",
            result: result
        });
    }
})
//   router.get('/getRecordByMachine', async (req, res) => {
//         let nickName = req.query.nickName;
//         let result = await SinglePrints.find({}).populate({
//           path: 'machineId',
//           match: {
//             nickName
//           }
//         });
//         result = result.filter(res=>{
//             return res.machineId && res.machineId!=null
//         })
//         console.log(result,34)
//         if (result.length === 0) {
//           return res.json({
//             status: "404",
//             msg: "第一次录入",
//             result: {
//               lastPrint: "0"
//             }
//           });
//         } else {
//           return res.json({
//             type:result[0].machineId.type,
//             machineId: result[0].machineId._id,
//             status: "200",
//             msg: "有历史记录"
//           });
//         }
//         })
// router.get('/getRecordByMachine', function (req, res) {
//         var nickName = req.query.nickName;
//         if(!nickName || nickName=='请输入'){
//            return res.json({
//                 status: '404',
//                 msg: ''
//             })
//         }
//         SinglePrints.aggregate([{
//             $lookup: {
//                 from: "machines",
//                 localField: "machineId",
//                 foreignField: "_id",
//                 as: "item"
//             }
//         }, {
//             $match: {
//                 "item.nickName": nickName
//             }
//         }], function (err, data) {
//             Machines.findOne({
//                 nickName: nickName
//             }).then(doc => {
//                 if (data.length == 0) {
//                     res.json({
//                         machineId: doc._id,
//                         type:doc.type,
//                         status: '404',
//                         msg: '第一次录入',
//                         result: {
//                             lastPrint: '0'
//                         }
//                     })
//                 } else {
//                     res.json({
//                         machineId: doc._id,
//                         type:doc.type,
//                         status: '200',
//                         msg: '有历史记录'
//                     })
//                 }

//             })

//         })

//     }),
    router.get('/getHistoryByDay', function (req, res) {
        var nickName = req.query.nickName;
        var printDate = req.query.printDate;
        SinglePrints.aggregate([{
            $lookup: {
                from: "machines",
                localField: "machineId",
                foreignField: "_id",
                as: "item"
            }
        }, {
            $match: {
                "printDate": printDate,
                "item.nickName": nickName
            }
        }], function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if (data.length != 0) {
                res.json({
                    status: '200',
                    result: data,
                })
            } else {
                res.json({
                    status: '404',
                    msg: '暂无历史记录',
                    result: [],
                })
            }
        })

    })

router.get('/getByDay', function (req, res) {
    var printDate = req.query.printDate;
    SinglePrints.aggregate([{
        $lookup: {
            from: "machines",
            localField: "machineId",
            foreignField: "_id",
            as: "item"
        }
    }, {
        $match: {
            "printDate": printDate,

        }
    }], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        if (data.length != 0) {
            res.json({
                status: '200',
                result: data,
            })
        } else {
            res.json({
                status: '404',
                msg: '暂无历史记录',
                result: [],
            })
        }
    })

})
//更改打印机的状态
router.post('/changeStatus', function (req, res) {
    var status = req.body.status;
    var nickName = req.body.nickName;
    updateList = {
        status: status
    }
    Machines.findOneAndUpdate({
        nickName: nickName
    }, updateList, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                res.json({
                    status: '200',
                    msg: "修改成功",
                    result: data
                })
            } else {
                res.json({
                    status: '404',
                    msg: "修改失败",
                    result: []
                })
            }
        }
    });
})

router.get("/getMachineByproByDay", function (req, res) {
    var workName = req.query.workName;
    WorkCenters.aggregate([{
        $lookup: {
            from: "machines",
            localField: "area_id",
            foreignField: "area_id",
            as: "item"
        }
    }, {
        $match: {
            "workName": workName
        }
    }], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        if (data.length != 0) {
            data.forEach(el => {
                el.item.forEach(ele => {
                    ele.workName = [{
                        workName: el.workName
                    }]
                })

            });
            res.json({
                status: '200',
                result: data,
            })
        } else {
            res.json({
                status: '404',
                msg: '暂无历史记录',
                result: []
            })
        }
    })

})
//根据打印中心，机器，获取某天机器信息
router.get('/getAllByDay', function (req, res) {
    var yesDay = req.query.printDate;
    var workName = req.query.workName;
    Machines.aggregate([{
            $lookup: {
                from: "workcenters",
                localField: "workCenterId",
                foreignField: "_id",
                as: "item"
            }
        },
        {
            $lookup: {
                from: "wxsingleprints",
                localField: "_id",
                foreignField: "machineId",
                as: "cate"
            }
        },
        {
            $unwind: { // 拆分子数组
                path: "$cate",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        },
        {
            $match: {
                "item.workName": workName,
                "cate.printDate": yesDay
            }
        },


    ], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        if (data.length != 0) {
            res.json({
                status: 200,
                result: data
            })
        } else {
            res.json({
                status: '404',
                msg: '暂无历史记录',
                result: []
            })
        }
    })
})
router.get('/getAllByYesterday', function (req, res) {
    var yesDay = req.query.printDate;
    var workName = req.query.workName;
    var workCenters = req.query.workCenters
    var condition = [{
        $lookup: {
            from: "workcenters",
            localField: "workCenterId",
            foreignField: "_id",
            as: "item"
        }
    },
    {
        $lookup: {
            from: "wxsingleprints",
            localField: "_id",
            foreignField: "machineId",
            as: "cate"
        }
    },
    {
        $unwind: { // 拆分子数组
            path: "$cate",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }
]
if(workName){
    condition.push({
        $match: {
            "item.workName": workName,
        }
})

}
if(yesDay){
    condition.push({
        $match: {
            "cate.printDate": yesDay,
        }
})
}
if(workCenters && workCenters.length){
    workCenters.shift()
    condition.push({
        $match: {
            "item.workName":{
                $in:workCenters
            },
        }
})
}
    Machines.aggregate(condition, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
       data =  data.filter(el=>{
            return el.cate
        })
        if (data.length) {
            res.json({
                status: 200,
                result: data
            })
        } else {
            res.json({
                status: '404',
                msg: '暂无历史记录',
                result: []
            })
        }
    })
})
//按照分类查询历史记录
router.get('/getByCategory', function (req, res) {
    var category = req.query.category;
    var workName = req.query.workName;
    var nickName = req.query.nickName;
    //   if(category=='全部'&& nickName=='全部'){  //这里不用考虑，因为前台会调用其他方法

    //   }
    if (category != '全部' && category != '打印机' && nickName == '全部') {
        Machines.aggregate([{
                $lookup: {
                    from: "workcenters",
                    localField: "workCenterId",
                    foreignField: "_id",
                    as: "item"
                }
            },
            {
                $match: {
                    category: category
                }
            },
            {
                $lookup: {
                    from: "otherprints",
                    localField: "_id",
                    foreignField: "machineId",
                    as: "cate"
                }
            },
            {
                $unwind: { // 拆分子数组
                    path: "$cate",
                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                }
            },
            {
                $match: {
                    "item.workName": workName,
                }
            },


        ], function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if (data.length) {
                data.forEach(element => {
                    var list = {
                        serialNumber: element.serialNumber,
                        nickName: element.nickName,
                        category: element.category,
                        workCenterId: element.workCenterId,
                        status: element.status,

                    }
                    if (element.cate) {
                        var newList = {
                            printDate: element.cate.printDate,
                            last_day_click: element.cate.last_day_click,
                            addat: element.cate.addat,
                            addby: element.cate.addby,
                            machineId: element.cate.machineId,
                        }
                        element.item[0] = Object.assign(element.item[0], list, newList)
                    }

                });

                res.json({
                    status: 200,
                    result: data
                })
            } else {
                res.json({
                    status: '404',
                    msg: '暂无历史记录',
                    result: []
                })
            }



        })
    } else if (category == '打印机' && nickName == '全部') {
        Machines.aggregate([{
                $lookup: {
                    from: "workcenters",
                    localField: "workCenterId",
                    foreignField: "_id",
                    as: "item"
                }
            },
            {
                $match: {
                    category: category
                }
            },
            {
                $lookup: {
                    from: "wxsingleprints",
                    localField: "_id",
                    foreignField: "machineId",
                    as: "cate"
                }
            },
            {
                $unwind: { // 拆分子数组
                    path: "$cate",
                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                }
            },
            {
                $match: {
                    "item.workName": workName,
                }
            },


        ], function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if (data.length) {
                data.forEach(element => {
                    var list = {
                        serialNumber: element.serialNumber,
                        nickName: element.nickName,
                        category: element.category,
                        workCenterId: element.workCenterId,
                        status: element.status,

                    }
                    if (element.cate) {
                        var newList = {
                            printDate: element.cate.printDate,
                            last_day_click: element.cate.last_day_click,
                            addat: element.cate.addat,
                            addby: element.cate.addby,
                            machineId: element.cate.machineId,
                        }
                        element.item[0] = Object.assign(element.item[0], list, newList)
                    }

                });

                res.json({
                    status: 200,
                    result: data
                })
            } else {
                res.json({
                    status: '404',
                    msg: '暂无历史记录',
                    result: []
                })
            }
        })

    }
})
//查询当前打印中心下所有历史记录
//查询当前打印中心下所有历史记录(打印机)
router.get('/getHisByPro', function (req, res) {
    var workName = req.query.workName;
    Machines.aggregate([{
            $lookup: {
                from: "workcenters",
                localField: "workCenterId",
                foreignField: "_id",
                as: "item"
            }
        },
        {
            $match: {
                category: '打印机'
            }
        },
        {
            $lookup: {
                from: "wxsingleprints",
                localField: "_id",
                foreignField: "machineId",
                as: "cate"
            }
        },
        {
            $unwind: { // 拆分子数组
                path: "$cate",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        },
        {
            $match: {
                "item.workName": workName,
            }
        },
    ], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        if (data.length) {
            data.forEach(element => {
                var list = {
                    serialNumber: element.serialNumber,
                    nickName: element.nickName,
                    category: element.category,
                    type: element.type,
                    workCenterId: element.workCenterId,
                    status: element.status,

                }
                if (element.cate) {

                    var newList = {
                        printDate: element.cate.printDate,
                        last_day_click: element.cate.last_day_click,
                        addat: element.cate.addat,
                        addby: element.cate.addby,
                        machineId: element.cate.machineId,
                        click_count: element.cate.click_count,
                    }
                    element.item[0] = Object.assign(element.item[0], list, newList)
                }

            });
            var result = data.filter(val => {
                return val.cate !== undefined
            })
               result =  utils.sortDataArray(result)
            res.json({
                status: 200,
                result: result
            })
        } else {
            res.json({
                status: '404',
                msg: '暂无历史记录',
                result: []
            })
        }
    })
})
//查询当前打印中心下所有历史记录(除打印机外)
// category: {
//     $ne: '打印机'
// }
router.get('/getOtherHis', function (req, res) {
    var workName = req.query.workName;
    Machines.aggregate([{
            $lookup: {
                from: "workcenters",
                localField: "workCenterId",
                foreignField: "_id",
                as: "item"
            }
        },
        {
            $match: {
               category: {
                    $ne: '打印机'
                }
            }
        },
        {
            $lookup: {
                from: "wxsingleprints",
                localField: "_id",
                foreignField: "machineId",
                as: "cate"
            }
        },
        {
            $unwind: { // 拆分子数组
                path: "$cate",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        },
        {
            $match: {
                "item.workName": workName,
            }
        },
    ], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        if (data.length>0) {
            data.forEach(element => {
                var list = {
                    serialNumber: element.serialNumber,
                    nickName: element.nickName,
                    category: element.category,
                    workCenterId: element.workCenterId,
                    status: element.status,
                }
                if (element.cate) {
                    var newList = {
                        printDate: element.cate.printDate,
                        last_day_click: element.cate.last_day_click,
                        addat: element.cate.addat,
                        addby: element.cate.addby,
                        machineId: element.cate.machineId,
                    }
                    element.item[0] = Object.assign(element.item[0], list, newList)
                }

            });
            var result = data.filter(val => {
                return val.cate !== undefined
            })
            result =  utils.sortDataArray(result)
            res.json({
                status: 200,
                result: result
            })
        } else {
            res.json({
                status: '404',
                msg: '暂无历史记录',
                result: []
            })
        }
    })
})

router.get('/getCate', function (req, res) {
    var nickName = req.query.nickName;
    Machines.findOne({
        nickName: nickName
    }).then(doc => {
        if (doc) {
           
            res.json({
                status: '200',
                result: doc.category
            })
        }
    })
})
//根据设备分类获取该分类下的所有机器
router.get('/getMachineByCategory', (req, res) => {
    var category = req.query.category;
    var workName = req.query.workCenter;
    Machines.aggregate([{
            $lookup: {
                from: 'workcenters',
                localField: "workCenterId",
                foreignField: "_id",
                as: "workCenter"
            }
        },
        {
            $unwind: { // 拆分子数组
                path: "$workCenter",
                preserveNullAndEmptyArrays: true // 空的数组也拆分
            }
        },
        {
            $match: {
                "category": category,
                "workCenter.workName": workName
            }
        }
    ], (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        res.json({
            status: 200,
            result: data
        })
    })
})
// 输入的录入量后判断当前的日印量是不是大于30天之内每天的日印量
router.get('/judgeMostDailyPrint', (req, res) => {
    var currentPrint = req.query.currentPrint; // 当前输入的录入量
    var nickName = req.query.nickName;
    var printDate = req.query.printDate;
    var category = req.query.category;
    var thisPrint = 0; // 此次的日印量
     // 其他机器只拿输入的装订量比对30天内的last_day_click
        SinglePrints.aggregate([{
                $lookup: {
                    from: 'machines',
                    localField: "machineId",
                    foreignField: "_id",
                    as: "machine"
                }
            }, {
                $unwind: { // 拆分子数组
                    path: "$machine",
                    preserveNullAndEmptyArrays: true // 空的数组也拆分
                }
            },
            {
                $match:{
                    "machine.nickName": nickName
                }
            }
        ], (err, data2) => {
            if (err) {
                return;
            }
            if(data2.length !==0){
                var hsBig =  data2.filter(data=>{
                   return Number(data.last_day_click)>currentPrint && !utils.getD(data.printDate,printDate)
                  })  
              }
           var stepUnPrinter=true
            if(hsBig&&hsBig.length>0){
             stepUnPrinter=false
                // var stepUnPrinter = hsBig.length > 0  ? false : true; // fasle说明有比这次的值大的，不用提示用户
            }
            res.json({
                status: 200,
                result: stepUnPrinter
            })
        })
})


///按条件查询历史记录
router.get('/findHistory',(req,res)=>{
    let list = req.query.list;
    let workName = req.query.workName
    let workCenters = req.query.workCenters
        list = JSON.parse(list)    
    var condition = [{
        $lookup: {
            from: "workcenters",
            localField: "workCenterId",
            foreignField: "_id",
            as: "item"
        }
    },
    {
        $lookup: {
            from: "wxsingleprints",
            localField: "_id",
            foreignField: "machineId",
            as: "cate"
        }
    },
    {
        $unwind: { // 拆分子数组
            path: "$cate",
            preserveNullAndEmptyArrays: true // 空的数组也拆分
        }
    }
]
    if(list.nickName){
        condition.push({
            $match: {
                "nickName":list.nickName
            }
        })
    }
    if(list.category){
        condition.push({
            $match:{
                "category":list.category
            }
        })
    }
    if(workName){
        condition.push({
            $match: {
                "item.workName": workName,
            }
        })
    }
    if(workCenters){
        workCenters.shift()
        condition.push({
            $match: {
                "item.workName": {$in:workCenters}
            }
        }) 
    }
    Machines.aggregate(condition, function (err, data) {
        if (err) {
            console.log(err);
            return res.json({
                    status: '400',
                    result:err
            });
        }
        if (data) {
            data.forEach(element => {
                var list = {
                    serialNumber: element.serialNumber,
                    nickName: element.nickName,
                    category: element.category,
                    workCenterId: element.workCenterId,
                    status: element.status,
                }
                if (element.cate && element.cate.length != 0) {
                    element.cate = Object.assign(element.cate, list)

                }
            })
            let result = data.filter(da => { //cate中存的是记录，筛选出有记录的
                return da.cate !== undefined
            })
            result =  utils.sortDataArray(result) //按时间倒序
            if(list.startTime && list.endTime){//按照时间筛选介于时间参数之间的数据
                result = result.filter(item => {
                    return utils.dateCompare(list.startTime, item.cate.printDate) && utils.dateCompare(item.cate.printDate, list.endTime)
                  })
                  if(result.length>0){
                   return res.json({
                        status: '200',
                        result: result,
                    })
                  }
                  return res.json({
                        status: '404',
                        msg: '暂无历史记录',
                        result: [],
                    })
            }
               return res.json({
                    status: '200',
                    result: result,
                })
            
        } 
          return res.json({
                status: '404',
                msg: '暂无历史记录',
                result: [],
            })
    })
})
module.exports = router;