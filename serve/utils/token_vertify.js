/*
 * @Author: your name
 * @Date: 2019-10-31 15:00:21
 * @LastEditTime: 2019-10-31 19:47:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /mergeEpotal/eportalBackend/utils/token_vertify.js
 */
var jwt = require('jsonwebtoken');
var signkey = 'mes_qdhd_mobile_xhykjyxgs';

exports.setToken = function(phone){
	return new Promise((resolve,reject)=>{
		const token = jwt.sign({
		  phone:phone
		},signkey,{ expiresIn:'24h' });
		resolve(token);
	})
}
exports.verToken = function(token){
	return new Promise((resolve,reject)=>{
		var info = jwt.verify(token.split(' ')[1],signkey);
		resolve(info);
	})
}