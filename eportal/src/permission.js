import router from './router'
import store from './store'
import {getAccessToken,removeAccessToken} from '@/utils/auth' // getToken from cookie
import axios from 'axios'
// permission judge function
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin permission passed directly
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = ['/login','/conctWchat']// no redirect whitelist

router.beforeEach((to, from, next) => {
  if (getAccessToken()){ // determine if there has token
    axios.defaults.headers.common['authorization'] =getAccessToken()
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (store.getters.roles.length === 0) { 
        // 判断当前用户是否已拉取完user_info信息
       axios.get('/api/userInfo').then(res => {
          // 拉取user_info
          if(res.data.status=="200"){
          const roles = res.data.result // note: roles must be a array! such as: ['editor','develop']
          if (res.data.result && res.data.result.length > 0) { // 验证返回的roles是否是一个非空数组
            store.commit('SET_ROLES', res.data.result)
          } else{
            store.commit('SET_ROLES', ['noRole'])
          }
          var myrole={
            "myrole":roles
          }
    
         axios.get('/api/role',{
            params:myrole
          }).then(res => {
          
            // 將回傳資料中的acl陣列存入myacl
           var myacl=res.data.result
          var finall=[];
          myacl.forEach(item => {
            finall.push(item.path)
          });
          if(finall.length>0){
            store.dispatch('MyRoutes', finall).then(() => {
              router.addRoutes(store.getters.addRouters)
              next({ ...to, replace: true })
            })
          }else{
            store.dispatch('MyRoutes', ['norole']).then(() => {
              router.addRoutes(store.getters.addRouters)
              next({ ...to, replace: true })
            })
          }
          })
        }
        else if(res.data.status=="401"){
          removeAccessToken()
            next({path:'/login'})
        }
        }).catch((err) => {
          removeAccessToken()
            next({ path: '/login' })
        })
      } else {
        next()
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        // if (hasPermission(store.getters.roles, to.meta.roles)) {
        //   next()//
        // } else {
        // }
        // // 可删 ↑
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { 
      // 在免登录白名单，直接进入
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
    }
  }
})
