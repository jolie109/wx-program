import { asyncRouterMap, constantRouterMap } from '@/router'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    // console.log('!!! => ' + roles.some(role => route.meta.roles.indexOf(role) >= 0))
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

function myPermission(acl, route) {
  if (route.meta && route.meta.ac) {
    if (route.meta.ac.indexOf(':') == -1) {
      return acl.some(acl => route.meta.ac == acl)
    }
    if (route.meta.ac.indexOf(':') > 0) {
      return route.meta.ac.split(':')[0]
    }
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    // console.log('route => ' + JSON.stringify(route))
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        // console.log('----------------------')
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

function filterMyRouter(asyncRouterMap, acl) {
  const accessedRouters = asyncRouterMap.filter(route => {
    // console.log('route => ' + JSON.stringify(route))
    if (myPermission(acl, route)) {
      if (route.children && route.children.length) {
        route.children = filterMyRouter(route.children, acl)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    // GenerateRoutes({ commit }, data) {
    //   return new Promise(resolve => {
    //     const { roles } = data
    //     // 使admin也能設定權限
    //     // let accessedRouters
    //     // if (roles.indexOf('admin') >= 0) {
    //     //   accessedRouters = asyncRouterMap
    //     // } else {
    //     const accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
    //     // }
    //     // console.log('!!!accessedRouters is => ' + JSON.stringify(accessedRouters))
    //     commit('SET_ROUTERS', accessedRouters)
    //     resolve()
    //   })
    // },
    MyRoutes({ commit }, data) {
      return new Promise(resolve => {
        const acl = data
        const accessedRouters = filterMyRouter(asyncRouterMap, acl)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
