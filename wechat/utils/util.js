
//比较两个时间是否大于一个月，例如20170215--到20170315 是一个月，到20170316是大于一个月
const isMonth = function isMonth(sDate, endDate) {
        var sDate = new Date(sDate);
        var eDate = new Date(endDate);
        if (eDate.getFullYear() - sDate.getFullYear() > 1) {//先比较年
              return true;
        } else if (eDate.getMonth() - sDate.getMonth() > 1) {//再比较月
              return true;
        } else if (eDate.getMonth() - sDate.getMonth() == 1) {
              if (eDate.getDate() - sDate.getDate() >= 1) {
                    return true;
              }
        }
         else if (eDate.getFullYear() - sDate.getFullYear() == 1) {
              if (eDate.getMonth() + 12 - sDate.getMonth() > 1) {
                    return true;
              }
               else if (eDate.getDate() - sDate.getDate() >= 1) {
                    return true;
              }
        }
        return false;
  }
//true   true表示大于一个月； false表示小于一个月
//去逗号
const changeSym = function changeSym(num) {
  if (typeof num == 'number'){
    num = num.toString()
  }
  return num.split(',').join('')
}
const changeNum = function toThousands(num) {
  var result = [], counter = 0;
  num = (num || 0).toString().split('');
  for (var i = num.length - 1; i >= 0; i--) {
    counter++;
    result.unshift(num[i]);
    if (!(counter % 3) && i != 0) { result.unshift(','); }
  }
  return result.join('');
}
const getNowDate=function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}
const formatTime = function getDateStr(today, addDayCount) {
  var dd;
  if (today) {
    dd = new Date(today);
  } else {
    dd = new Date();
  }
  dd.setDate(dd.getDate() + addDayCount);//获取AddDayCount天后的日期 
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期 
  var d = dd.getDate();
  if (m < 10) {
    m = '0' + m;
  };
  if (d < 10) {
    d = '0' + d;
  };
  return y + "-" + m + "-" + d;
}
//date1<=date2返回true，判断两个时间大小
const dateCompare = function dateCompare(date1, date2) {
  date1 = date1.replace(/\-/gi, "/");
  date2 = date2.replace(/\-/gi, "/");
  var time1 = new Date(date1).getTime();
  var time2 = new Date(date2).getTime();
  if (time1 > time2) {
    return false;
  } else if (time1 == time2) {
    return true;
  } else {
    return true;
  }
}
const checkTime = function checkTime(stime, etime) {
  //通过replace方法将字符串转换成Date格式
  var sdate = new Date(Date.parse(stime.replace(/-/g, "/")));
  var edate = new Date(Date.parse(etime.replace(/-/g, "/")));
  //获取两个日期的年月日
  var smonth = sdate.getMonth() + 1;
  var syear = sdate.getFullYear();
  var sday = sdate.getDate();
  var emonth = edate.getMonth() + 1;
  var eyear = edate.getFullYear();
  var eday = edate.getDate();
  //从年，月，日，分别进行比较
  if (syear > eyear) {
    return false;
  } else {
    if (smonth > emonth) {
      return false;
    } else {
      if (sday > eday) {
        return false;
      } else {
        return true;
      }
    }
  }
}
const getLastday = function getLastday(date) { // 获取指定日期前一天日期
  var dd = new Date(date);
  　　dd.setDate(dd.getDate() -1);
  　　var y = dd.getFullYear();
  　　var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
  　　var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
  　　return y + "-" + m + "-" + d;
}
const getNextDate=function (date, day) {//获取某一天的后一天，1代表后一天，-1代表前一天
  var dd = new Date(date);
  dd.setDate(dd.getDate() + day);
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
  var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
  return y + "-" + m + "-" + d;
};
module.exports = {
  formatTime: formatTime,
  getNowDate: getNowDate,
  changeNum:changeNum,
  changeSym: changeSym,
  isMonth: isMonth,
  checkTime: checkTime,
  getLastday: getLastday,
  dateCompare:dateCompare,
getNextDate:getNextDate
}
