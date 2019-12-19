module.exports={
  //获取今天的前一天
getDay(){
  var today=new Date();
  var yesterday_milliseconds=today.getTime()-1000*60*60*24;
   
  var yesterday=new Date();      
  yesterday.setTime(yesterday_milliseconds);      
      
  var strYear=yesterday.getFullYear();   
  var strDay=yesterday.getDate();   
  var strMonth=yesterday.getMonth()+1;   
  if(strMonth<10)   
  {   
      strMonth="0"+strMonth;   
  }  
  if(strDay<10)   
  {   
      strDay="0"+strDay;   
  }  
  var strYesterday=strYear+"-"+strMonth+"-"+strDay; 
  return strYesterday;
},
//判断时间间隔是否是一个月
getD(sDate, endDate) {
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
},
//获取任意一天的前一天
getPreDay(s){
  var y = parseInt(s.substr(0,4), 10);
  var m = parseInt(s.substr(4,2), 10)-1;
  var d = parseInt(s.substr(6,2), 10);
  var dt = new Date(y, m, d-1);
  y = dt.getFullYear();
  m = dt.getMonth()+1;
  d = dt.getDate();
  m = m>10?m:"0"+m;
  d = d>10?d:"0"+d;
  return y + "-" + m + "-" + d;
},
//将数据按时间排序
sortDataArray(dataArray){
  return dataArray.sort(function(a,b) {
      return Date.parse(b.cate.printDate.replace(/-/g,"/"))-Date.parse(a.cate.printDate.replace(/-/g,"/"));
  });
},
checkTime(stime,etime){
  　　 //通过replace方法将字符串转换成Date格式
      var sdate= new Date(Date.parse(stime.replace(/-/g,   "/")));    
      var edate= new Date(Date.parse(etime.replace(/-/g,   "/")));
      //获取两个日期的年月日
      var smonth=sdate.getMonth()+1;
      var syear =sdate.getFullYear();
      var sday = sdate.getDate();
       
      var emonth=edate.getMonth()+1;
      var eyear =edate.getFullYear();
      var eday = edate.getDate();
       //从年，月，日，分别进行比较
      if(syear>eyear){
          return false;
      }else{
          if(smonth>emonth){
              return false;
          }else{
              if(sday>eday){
                  return false;
              }else{
                  return true;
              }
          }
      }
  },
   //获取两个时间段内的时间
getDiffDate(start, end) {
var startTime = getDate(start);
var endTime = getDate(end);
var dateArr = [];
while ((endTime.getTime() - startTime.getTime()) > 0) {
    var year = startTime.getFullYear();
    var month = (parseInt(startTime.getMonth().toString(),10) + 1).toString().length === 1 ? "0" + (parseInt(startTime.getMonth().toString(),10) + 1) : (startTime.getMonth() + 1);
    var day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate();
    dateArr.push(year + "-" + month + "-" + day);
    startTime.setDate(startTime.getDate() + 1);
}
function getDate (datestr) {

  var temp = datestr.split("-");

  if (temp[1] === '01') {

      temp[0] = parseInt(temp[0],10) - 1;

      temp[1] = '12';

  } else {
      temp[1] = parseInt(temp[1],10) - 1;
  }

  //new Date()的月份入参实际都是当前值-1

  var date = new Date(temp[0], temp[1], temp[2]);

  return date;

}
return dateArr;
},
//date1<=date2返回true，判断两个时间大小
dateCompare(date1, date2) {
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
},
//date1<=date2返回true，判断两个时间大小
 dateCompare(date1, date2) {
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
}