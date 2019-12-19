
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');


var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false)
var Users = require('./models/admin/users.js')
var app = express();


//小程序引入

var vertoken = require('./utils/token_vertify.js');
var expressJwt = require('express-jwt');


//引入routes
var productionManagementRouter = require('./routes/prductionManagement')
var classifyRouter = require('./routes/classify')
var usersRouter = require('./routes/users')
var salaryListRouter = require('./routes/salaryList')
var projectManagementRouter = require('./routes/medal/projectManagement')
var projectQueriesRouter = require('./routes/medal/projectQueries')
var pmoRouter = require('./routes/medal/PMO')
var departmentManagementRouter = require('./routes/departmentManagement')
var salaryStructureRouter = require('./routes/salaryStructure')
var salartManagementRouter = require('./routes/salaryManagement')
var employeeRouter=require("./routes/employee")
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
//物流
var logisticsRouter = require('./routes/logistic');
//接单
var wxUserRouter = require('./routes/jiedan/wxUsers');
var wxAdminRouter = require('./routes/jiedan/admin');
var feedBackRouter = require('./routes/jiedan/feedback');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/jiedanusers',wxUserRouter);
app.use('/jiedanadmin',wxAdminRouter);
app.use("/jiedanfeedback",feedBackRouter);

//解析token获取用户信息
app.use(function(req, res, next) {
	var token = req.headers['authorization'];
	if(token == undefined){
		return next();
	}else{
		vertoken.verToken(token).then( async(data)=> {
			req.data = data;
			var bingo= await Users.findOne({tel:req.data.phone})
			var refresh='etr8499302he3910'
			var product=await Users.findOne({openid:req.data.phone})
			if(bingo||product||req.data.phone==refresh){
			return next()
		}else{
			return res.status(401).send('token失效');
		}
		
		}).catch((error)=>{
			return next();
		})
	}
});
// //验证token是否过期并规定哪些路由不用验证
app.use(expressJwt({
	secret: 'mes_qdhd_mobile_xhykjyxgs'
}).unless({
	path: ['/getCode','/login_code','/isAuth','/captcha','/login_captcha','/users/wxReg','/users/refreshToken','/getQrCode','/productionManagement/getMachineById','/productionManagement/getAllMachine','/jiedanadmin/','/jiedanusers/*','/jiedanfeedback/']//除了这个地址，其他的URL都需要验证
}));
app.use(session({
	secret :  'secret', // 对session id 相关的cookie 进行签名
	resave : true,
	saveUninitialized: false, // 是否保存未初始化的会话
	cookie : {
		maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
	},
  }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//使用路由

app.use('/productionManagement', productionManagementRouter);
app.use('/classify', classifyRouter);
app.use('/users', usersRouter);
app.use('/salaryList', salaryListRouter);
app.use('/projectManagement',projectManagementRouter);
app.use('/projectQueries',projectQueriesRouter);
app.use('/pmo',pmoRouter);
app.use("/employee",employeeRouter)
//部门管理原来的为 '/department'
app.use('/departmentManagement',departmentManagementRouter);

//员工薪资结构模块原来的'/bonuswait'  '/employee'  '/stock'
app.use('/salaryStructure', salaryStructureRouter);

app.use('/salaryManagement',salartManagementRouter );
app.use('/', userRouter);
app.use('/admin', adminRouter);
//物流查询
app.use('/logistics', logisticsRouter);
//接单
app.use(function(err, req, res, next) {
	if (err.status == 401) {
		return res.status(401).send('token失效');
	}
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


bodyParser = require('body-parser');/*post方法*/
app.use(bodyParser.json()) /*添加json解析*/
app.use(bodyParser.urlencoded({ extended: false}))

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/wxeportal', {useNewUrlParser: true})
mongoose.connection.on('connected', function() {
    console.log('数据库连接成功');
})
mongoose.connection.on('error', function() {
    console.log('数据库出错了');
})
mongoose.connection.on('disconnected', function() {
        console.log('数据库连接断开');
})

// module.exports = app;
var port = process.env.PORT || 3000

module.exports = app;
