// import { loginByUsername, logout, getUserInfo, getPermissionList, getThirdWechatToken } from '@/api/login'

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    openid: '',
    token:  "",
    name: '',
    username:'',
    areaNumber:'',
    avatar: '',
    introduction: '',
    roles: [],
    setting: {
      articlePlatform: []
    },
    list: []
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ACCESS_TOKEN: (state, token) => {
      state.accessToken = token
    },
    SET_OPENID: (state, openid) => {
      state.openid = openid
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_USERNAME: (state, username) => {
      state.username = username
    },
    SET_AREANUMBER: (state, areaNumber) => {
      state.areaNumber = areaNumber
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_LIST: (state, list) => {
      state.list = list
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(response => {
          const data = response.data
          commit('SET_TOKEN', data.token)
          setToken(response.data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const data = response.data
          if (data.result && data.result.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.result)
          } else {
            console.log(11111);
            commit('SET_ROLES',['norole'])
          }
          commit('SET_AVATAR', '')
          commit('SET_NAME', data.name)
          commit('SET_USERNAME', data.username)
          commit('SET_AREANUMBER', data.areaNumber)
          // commit('SET_AVATAR', localStorage.getItem('avatar'))
          commit('SET_INTRODUCTION', '')
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    GetPermissionList({ commit, state }) {
      return new Promise((resolve, reject) => {
        getPermissionList(state.token).then(response => {
          if (!response.data) {
            reject('error')
          }
          const data = response.data
          commit('SET_LIST', data.acl)
          resolve(response)
        })
      })
    }
  }
}

export default user