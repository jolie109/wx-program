import Router from 'vue-router'
import Vue from 'vue'
import Layout from '@/views/Layout/layout'
import Login from '../views/login/index'
import ConctWchat from '../views/login/conctWchat'
import Authredirect from '../views/login/authredirect'
Vue.use(Router)
export const constantRouterMap = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/conctWchat',
    name: 'ConctWchat',
    component: ConctWchat
  },
  {
    path: '/authredirect',
    name: 'Authredirect',
    component: Authredirect 
  },
  {
    path: '/',
    component: Layout,
    redirect:'/search',
    meta: {
      title: '首页'
    },
    children: [
      {path: '/search', component: () => import('../views/home/index'),   name:'首页',meta: {
        title: '首页'
      }}
    ]
  },
  {
    path: "/404",
    name: "404",
    component: () => import('@/views/404'),
    meta: { title: '404', noCache: true, ac: '/404'},
    },
  
]

export default new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/admin',
    component: Layout,
    name: 'Admin',
    redirect:'/admin/user',
    meta: {
      title: '系统管理',
      icon: 'admin',
      ac: '/admin'
    },
    children: [
      {path: 'user',component: () => import('@/views/admin/userMgmt'),name: '用户列表',meta: { title: '用户管理', noCache: true, ac:'/admin/user'}},
      {path: 'userrole',component: () => import('@/views/admin/roleMgmt'),name: '角色权限',meta: { title: '角色权限管理', noCache: true, ac:'/admin/role'}},
      {path: 'acl',component: () => import('@/views/admin/aclMgmt'),name: '路由列表',meta: { title: '路由列表管理', noCache: true, ac:'/admin/acl'}},
      {path: 'workCenters',component: () => import('@/views/admin/workCenter'),name: '打印中心',meta: { title: '打印中心管理', noCache: true, ac:'/admin/workCenter'}},
    ]
  },
  {
    path:  '/productionManagement',
    component:  Layout,
    redirect:  '/productionManagement/machineList',
    meta: {
      title: '生产管理',
      ac: '/productionManagement'
    },
    children:  [{
        path:  'machineList',
        component:  ()  =>  import('@/views/productionManagement/productionManagement'),
        name:  '打印机器列表',
        meta: { title: '机器管理', noCache: true, ac: '/productionManagement/machineList'}
    },
    {
      path:  'recordhistory',
      component:  ()  =>  import('@/views/productionManagement/productionHistory'),
      name:  '工作量历史记录',
      meta: { title: '工作量历史记录', noCache: true, ac: '/productionManagement/recordhistory'}
  }
  ]
},
{
  path:'/xinzi',
  component:Layout,
  meta: { title: '总薪资管理', noCache: true, ac: '/xinzi'},
  redirect:'/xinzi/Salary_structure',
  children:[
    {
      path: '/xinzi/ClassifyManagement',
      meta: { title: '类别管理', noCache: true, ac: '/ClassifyManagement'},
      component: () => import("@/views/xinzi/index/index"),
      redirect:'/xinzi/ClassifyManagement/ClassifyManagement',
      children: [{
          path: 'ClassifyManagement',
          component: () => import('@/views/xinzi/classify/ClassifyManagement'),
          name: '分类管理',
          meta: { title: '分类管理', noCache: true, ac: '/ClassifyManagement/ClassifyManagement'}
        },
        {
          path: 'rankManagement',
          component: () => import('@/views/xinzi/classify/rankManagement'),
          name: '等级管理',
          meta: { title: '等级管理', noCache: true, ac: '/ClassifyManagement/rankManagement'}
        },
        {
          path: 'gradeManagement',
          component: () => import('@/views/xinzi/classify/gradeManagement'),
          name: '级别管理',
          meta: { title: '级别管理', noCache: true, ac: '/ClassifyManagement/gradeManagement'}
        },
      ]
    },
    {
      path: '/xinzi/salaryManagement',
      meta: { title: '薪资管理', noCache: true, ac: '/salaryManagement'},
      component: () => import("@/views/xinzi/index/index"),
      redirect:"/xinzi/salaryManagement/baseSalary",
      children: [{
          path: 'baseSalary',
          component: () => import('@/views/xinzi/salaryManagement/baseSalary'),
          name: '基本薪资',
          meta: { title: '基本薪资', noCache: true, ac: '/salaryManagement/baseSalary'}
        },   
        {
          path: 'supply',
          component: () => import('@/views/xinzi/salaryManagement/supply'),
          name: '每月加给',
          meta: { title: '每月加给', noCache: true, ac: '/salaryManagement/supply'}
        }
      ]
    },
    {
      path: '/xinzi/department',
      meta: { title: '部门管理', noCache: true, ac: '/department'},
      component: () => import("@/views/xinzi/index/index"),
      redirect:"/xinzi/department/department",
      children: [
        {
          path: 'department',
          component: () => import('@/views/xinzi/department/department'),
          name: '部门信息',
          meta: { title: '部门信息', noCache: true, ac: '/department/department'}
        }
      ]
    },
    {
      path: '/xinzi/EmployeeManagement',   
      meta: { title: '员工管理', noCache: true, ac: '/EmployeeManagement'},
      component: () => import("@/views/xinzi/index/index"),
      redirect:'/xinzi/EmployeeManagement/Employee',
      children: [{
          path: 'Employee',
          component: () => import('@/views/xinzi/EmployeeManagement/Employee'),
          name: '员工信息',
          meta: { title: '员工信息', noCache: true, ac: '/EmployeeManagement/Employee'},
        },
        {
          path: 'valueIndex',
          component: () => import('@/views/xinzi/EmployeeManagement/valueIndex'),
          name: 'valueIndex计算',
          meta: { title: 'valueIndex计算', noCache: true, ac: '/EmployeeManagement/valueIndex'},
        },
        {
          path: 'detailEmployee',
          component: () => import('@/views/xinzi/EmployeeManagement/detailEmployee'),
          name: 'detailEmployee',
          hidden:true,
          meta: { title: '员工信息详情', noCache: true, ac: '/EmployeeManagement/detailEmployee'},
        },
        {
          path: 'addEmployee',
          component: () => import('@/views/xinzi/EmployeeManagement/addEmployee'),
          name: 'addEmployee',
          hidden:true,
          meta: { title: '员工信息', noCache: true, ac: '/EmployeeManagement/addEmployee'}
        }
      ]
    },
    {
      path: '/xinzi/Salary_structure',
      meta: { title: '奖金管理', noCache: true, ac: '/Salary_structure'},
      component: () => import("@/views/xinzi/index/index"),
      redirect:"/xinzi/Salary_structure/performance_employee",
      children: [
        {
          path: 'performance_employee',
          component: () => import('@/views/xinzi/Salary_structure/performance_employee'),
          name: '绩效管理_员工',
          meta: { title: '绩效管理_员工', noCache: true, ac: '/Salary_structure/performance_employee'},
        },
        {
          path: 'shareBonus_employee',
          component: () => import('@/views/xinzi/Salary_structure/shareBonus_employee'),
          name: '分红管理_员工',
          meta: { title: '分红管理_员工', noCache: true, ac: '/Salary_structure/shareBonus_employee'},
        },
        {
          path: 'stockManagement_employee',
          component: () => import('@/views/xinzi/Salary_structure/stockManagement_employee'),
          name: '股票管理_员工',
          meta: { title: '股票管理_员工', noCache: true, ac: '/Salary_structure/stockManagement_employee'},
        },
        {
          path: 'bonus',
          component: () => import('@/views/xinzi/Salary_structure/bonus'),
          name: '奖金池',
          meta: { title: '奖金池', noCache: true, ac: '/Salary_structure/bonus'},
        },
        {
          path: 'bonusCalculation',
          component: () => import('@/views/xinzi/Salary_structure/bonusCalculation'),
          name: '奖金计算',
          meta: { title: '奖金计算', noCache: true, ac: '/Salary_structure/bonusCalculation'},
        },
        {
          path: 'departmentMoment',
          component: () => import('@/views/xinzi/Salary_structure/departmentMoment'),
          name: '部门员工待发奖金档',
          meta: { title: '部门员工待发奖金档', noCache: true, ac: '/Salary_structure/departmentMoment'},
        },
       {
          path: 'deMoment',
          component: () => import('@/views/xinzi/Salary_structure/deMoment'),
          name: '员工待发奖金档',
          meta: { title: '员工待发奖金档', noCache: true, ac: '/Salary_structure/deMoment'},
        },
        {
          path: 'hrDepartMoment',
          component: () => import('@/views/xinzi/Salary_structure/hrDepartMoment'),
          name: '员工待发奖金档(HR)',
          meta: { title: '员工待发奖金档（HR）', noCache: true, ac: '/Salary_structure/hrDepartMoment'},
        },
        {
        path: 'stockManagement',
        component: () => import('@/views/xinzi/Salary_structure/stockManagement'),
        name: '股票管理',
        meta: { title: '股票管理', noCache: true, ac: '/Salary_structure/stockManagement'},
      },
      {
        path: 'perforMance',
        component: () => import('@/views/xinzi/Salary_structure/perforMance'),
        name: '绩效管理',
        meta: { title: '绩效管理', noCache: true, ac: '/Salary_structure/perforMance'},
      },
      {
        path: 'shareBonus',
        component: () => import('@/views/xinzi/Salary_structure/shareBonus'),
        name: '分红管理',
        meta: { title: '分红管理', noCache: true, ac: '/Salary_structure/shareBonus'},
      }, 
      {
        path: 'departmentDetail',
        component: () => import('@/views/xinzi/Salary_structure/departmentDetail'),
        name: '双薪待发奖金档详细内容',
        hidden:true,
        meta: { title: '双薪待发奖金档详细内容', noCache: true, ac: '/Salary_structure/departmentDetail'},
      },
      {
        path: 'departmentShare',
        component: () => import('@/views/xinzi/Salary_structure/departmentShare'),
        name: '分红待发奖金档详细内容',
        hidden:true,
        meta: { title: '分红待发奖金档详细内容', noCache: true, ac: '/Salary_structure/departmentShare'},
      },
      {
        path: 'departmentPerfor',
        component: () => import('@/views/xinzi/Salary_structure/departmentPerfor'),
        name: '绩效待发奖金档详细内容',
        hidden:true,
        meta: { title: '绩效待发奖金档详细内容', noCache: true, ac: '/Salary_structure/departmentPerfor'},
      },
      {
        path: 'checkStock',
        component: () => import('@/views/xinzi/Salary_structure/checkStock'),
        name: '查看股票管理的详细内容',
        hidden:true,
        meta: { title: '查看股票管理的详细内容', noCache: true, ac: '/Salary_structure/checkStock'},
      },
      {
        path: 'checkPerfor',
        component: () => import('@/views/xinzi/Salary_structure/checkPerfor'),
        name: '查看绩效管理的详细内容',
        hidden:true,
        meta: { title: '查看绩效管理的详细内容', noCache: true, ac: '/Salary_structure/checkPerfor'},
      },
      {
        path: 'shareRecord',
        component: () => import('@/views/xinzi/Salary_structure/shareRecord'),
        name: '查看分红管理的详细内容',
        hidden:true,
        meta: { title: '查看分红管理的详细内容', noCache: true, ac: '/Salary_structure/shareRecord'},
      }
    ]
    },
    {
      path:'/xinzi/Salary_list',
      meta: { title: '薪资单管理', noCache: true, ac: '/Salary_list'},
      component: () => import("@/views/xinzi/index/index"),
      redirect:"/xinzi/Salary_list/forms",
      children:[
        {
          path: 'forms',
          component: () => import('@/views/xinzi/Salary_list/forms'),
          name: '员工薪资结构',
          meta: { title: '员工薪资结构', noCache: true, ac: '/Salary_list/forms'},
        },
        {
          path: 'create',
          component: () => import('@/views/xinzi/Salary_list/create'),
          name: '生成薪资单',
          meta: { title: '生成薪资单', noCache: true, ac: '/Salary_list/create'},
        },
        {
          path: 'employees',
          component: () => import('@/views/xinzi/Salary_list/employees'),
          name: '员工薪资单',
          meta: { title: '员工薪资单', noCache: true, ac: '/Salary_list/employees'},
        },
        {
          path: 'perEmployees',
          component: () => import('@/views/xinzi/Salary_list/perEmployees'),
          name: '员工个人薪资单',
          meta: { title: '员工个人薪资单', noCache: true, ac: '/Salary_list/perEmployees'},
        },
        {
          path: 'departmentList',
          component: () => import('@/views/xinzi/Salary_list/departmentList'),
          name: '部门员工薪资单',
          meta: { title: '部门员工薪资单', noCache: true, ac: '/Salary_list/departmentList'},
        },
        {
          path: 'payOut',
          component: () => import('@/views/xinzi/Salary_list/payOut'),
          name: '员工薪资发放',
          meta: { title: '员工薪资发放', noCache: true, ac: '/Salary_list/payOut'},
        },
        {
          path: 'managementList',
          component: () => import('@/views/xinzi/Salary_list/managementList'),
          name: '薪资单管理1',
          meta: { title: '薪资单管理', noCache: true, ac: '/Salary_list/managementList'},
      },
      {
        path: 'checkList',
        component: () => import('@/views/xinzi/Salary_list/checkList'),
        name: '薪资单管理详情',
        hidden:true,
        meta: { title: '薪资单管理详情', noCache: true, ac: '/Salary_list/checkList'},
    },
    {
      path: 'addList',
      hidden:true,
      component: () => import('@/views/xinzi/Salary_list/addList'),
      name: '生成薪资单详情',
      meta: { title: '生成薪资单详情', noCache: true, ac: '/Salary_list/addList'},
    }
    ]
    }
  ]
},
{
  path:'/xiangmu',
  component:Layout,
  meta: { title: '总项目管理', noCache: true, ac: '/xiangmu'},
  redirect:'/xiangmu/projectManagement',
  children:[
    {
      path:  '/xiangmu/pmo',
      meta: { title: 'PMO管理', noCache: true, ac: '/pmo'},
      component: () => import("@/views/xiangmu/index/index"),
      redirect:'/xiangmu/pmo/index',
      children:  [
          {
              //  项目列表
              path:  'index',
              component:  ()  =>  import('@/views/xiangmu/pmo/index'),
              name:  'pmo项目列表',
              meta: { title: '项目列表', noCache: true, ac: '/pmo/index'},
          },
          
          {
              //  新增项目
              path:  'addpro',
              component:  ()  =>  import('@/views/xiangmu/pmo/addPro.vue'),
              name:  'addpro',
              hidden:true,
              meta: { title: '新增项目', noCache: true, ac: '/pmo/addpro'},
          },
          {
              //  已结案查看编辑
              path:  'editcase',
              component:  ()  =>  import('@/views/xiangmu/pmo/editCase.vue'),
              name:  'editcase',
              hidden:true,
              meta: { title: '已结案查看编辑', noCache: true, ac: '/pmo/editcase'},
          },
          {
              //  项目执行中查看编辑
              path:  'editproexecute',
              component:  ()  =>  import('@/views/xiangmu/pmo/editProExecute.vue'),
              name:  'editproexecute',
              hidden:true,
              meta: { title: '项目执行中查看编辑', noCache: true, ac: '/pmo/editproexecute'},
          },
          {
              //  pmo设定完成查看编辑
              path:  'editsetupcomplete',
              component:  ()  =>  import('@/views/xiangmu/pmo/editSetupComplete.vue'),
              name:  'editsetupcomplete',
              hidden:true,
              meta: { title: 'pmo设定完成查看编辑', noCache: true, ac: '/pmo/editsetupcomplete'},
          },
          {
              //  pm结案申请阶段查看编辑
              path:  'closecaseapply',
              component:  ()  =>  import('@/views/xiangmu/pmo/closeCaseApply.vue'),
              name:  'closecaseapply',
              hidden:true,
              meta: { title: 'pm结案申请阶段查看编辑', noCache: true, ac: '/pmo/closecaseapply'},
          },
          {
              //  奖励项目
              path:  'rewardpro',
              component:  ()  =>  import('@/views/xiangmu/pmo/rewardPro.vue'),
              name:  '奖励项目',
              meta: { title: '奖励项目', noCache: true, ac: '/pmo/rewardpro'},
          },
          {
              //  奖励项目列表
              path:  'rewardlist',
              component:  ()  =>  import('@/views/xiangmu/pmo/rewardList.vue'),
              name:  'rewardlist',
              hidden:true,
              meta: { title: '奖励项目列表', noCache: true, ac: '/pmo/rewardlist'},
          },
          {
            //  发放点数
            path:  'grantpoint',
            component:  ()  =>  import('@/views/xiangmu/pmo/grantPoint.vue'),
            name:  'PMO发放点数',
            meta: { title: 'PMO发放点数', noCache: true, ac: '/pmo/grantpoint'}, 
          },
          {
              //  发放点数查看编辑
              path:  'editgrantpoint',
              component:  ()  =>  import('@/views/xiangmu/pmo/editGrantPoint.vue'),
              name:  'editgrantpoint', 
              hidden:true,
              meta: { title: '发放点数查看编辑', noCache: true, ac: '/pmo/editgrantpoint'},
            },
            {
              //  申请单
              path:  'applyform',
              component:  ()  =>  import('@/views/xiangmu/pmo/applyForm.vue'),
              name:  '结案申请单',
              meta: { title: '结案申请单', noCache: true, ac: '/pmo/applyform'},
          },
          {
              //  查看申请单
              path:  'applyformdetail',
              component:  ()  =>  import('@/views/xiangmu/pmo/applyFormDetail.vue'),
              name:  'applyformdetail',
              hidden:true,
              meta: { title: '查看申请单', noCache: true, ac: '/pmo/applyformdetail'},
          },
          {
              //  点数发放申请单
              path:  'grantappform',
              component:  ()  =>  import('@/views/xiangmu/pmo/grantApplyForm.vue'),
              name:  '发放点数申请单',
              meta: { title: '发放点数申请单', noCache: true, ac: '/pmo/grantappform'},
          },
          {
              //  查看点数发放申请单
              path:  'grantappformdetail',
              component:  ()  =>  import('@/views/xiangmu/pmo/grantApplyFormDetail.vue'),
              name:  'grantappformdetail',
              hidden:true,
              meta: { title: '查看点数发放申请单', noCache: true, ac: '/pmo/grantappformdetail'},
          }, 
    ]
    },
    {
      path: '/xiangmu/projectManagement',
      meta: { title: '项目管理', noCache: true, ac: '/projectManagement'},
      component: () => import("@/views/xiangmu/index/index"),
      redirect:'/xiangmu/projectManagement/projectList',
      children: [{
        path: 'projectList',
        component: () => import('@/views/xiangmu/projectManagement/projectList'),
        name: '项目列表',
        meta: { title: '项目列表', noCache: true, ac: '/projectManagement/projectList'},
      },
      {
        path: 'projectList/checkout',
        component: () => import('@/views/xiangmu/projectManagement/checkout'),
        name: 'chekcout',
        hidden:true,
        meta: { title: 'checkout', noCache: true, ac: '/projectManagement/projectList/checkout'},
      },
      {
        path: 'projectList/checkoutPMO',
        component: () => import('@/views/xiangmu/projectManagement/checkoutPMO'),
        name: 'chekcoutPMO',
        hidden:true,
        meta: { title: 'chekcoutPMO', noCache: true, ac: '/projectManagement/projectList/chekcoutPMO'},
      },
      {
        path: 'myProject',
        component: () => import('@/views/xiangmu/projectManagement/myProject'),
        name: '我的项目',
        meta: { title: '我的项目', noCache: true, ac: '/projectManagement/myProject'},
      },
      {
        path: 'myProject/manage',
        component: () => import('@/views/xiangmu/projectManagement/manage'),
        name: 'manage',
        hidden:true,
        meta: { title: 'manage', noCache: true, ac: '/projectManagement/myProject/manage'},
      },
      {
        path: 'myProject/managePMO',
        component: () => import('@/views/xiangmu/projectManagement/managePMO'),
        name: 'managePMO',
        hidden:true,
        meta: { title: 'managePMO', noCache: true, ac: '/projectManagement/myProject/managePMO'},
      },
      {
        path: 'myProject/managePM',
        component: () => import('@/views/xiangmu/projectManagement/managePM'),
        name: 'managePM',
        hidden:true,
        meta: { title: 'managePM', noCache: true, ac: '/projectManagement/myProject/managePM'},
      },
      {
        path: 'myProject/manageEnd',
        component: () => import('@/views/xiangmu/projectManagement/manageEnd'),
        name: 'manageEnd',
        hidden:true,
        meta: { title: 'manageEnd', noCache: true, ac: '/projectManagement/myProject/manageEnd'},
      },
      {
        path: 'myProject/checkout',
        component: () => import('@/views/xiangmu/projectManagement/checkout'),
        name: 'checkout',
        hidden:true,
        meta: { title: 'checkout', noCache: true, ac: '/projectManagement/myProject/checkout'},
      },
      {
        path: 'myProject/checkoutPMO',
        component: () => import('@/views/xiangmu/projectManagement/checkoutPMO'),
        name: 'checkoutPMO',
        hidden:true,
        meta: { title: 'checkoutPMO', noCache: true, ac: '/projectManagement/myProject/checkoutPMO'},
      }
    ]
    },
    {
      path: '/xiangmu/projectQueries',
      meta: { title: '项目查询', noCache: true, ac: '/projectQueries'},
      component: () => import("@/views/xiangmu/index/index"),
      redirect:'/xiangmu/projectQueries/rankingList',
      children: [{
        path: 'rankingList',
        component: () => import('@/views/xiangmu/projectQueries/rankingList'),
        name: '勋章排行榜',
        meta: { title: '勋章排行榜', noCache: true, ac: '/projectQueries/rankingList'},
      },
      {
        path: 'personalPoints',
        component: () => import('@/views/xiangmu/projectQueries/personalPoints'),
        name: '个人点数统计',
        meta: { title: '个人点数统计', noCache: true, ac: '/projectQueries/personalPoints'},
      },
      {
        path: 'companyRecord',
        component: () => import('@/views/xiangmu/projectQueries/companyRecord'),
        name: '公司勋章记录',
        meta: { title: '公司勋章记录', noCache: true, ac: '/projectQueries/companyRecord'},
      },
      {
        path: 'levelTable',
        component: () => import('@/views/xiangmu/projectQueries/levelTable'),
        name: '勋章等级对照表',
        meta: { title: '勋章等级对照表', noCache: true, ac: '/projectQueries/levelTable'},
      }]
    }
  ]
},

// 物流查询模块 11.4 by aaron
{
  path: '/logisticsQuery',
  component:Layout,
  meta: { title: '物流查询', noCache: true, ac: '/logisticsQuery'},
  redirect:'/logisticsQuery/enter',
  children: [{
      path: 'enter',
      component: () => import('@/views/logisticsQuery/index'),
      name: '快递查询入口',
      meta: { title: '快递查询入口', noCache: true, ac: '/logisticsQuery/enter'},
    },
    {
      path: 'express',
      component: () => import('@/views/logisticsQuery/express'),
      name: '快递',
      hidden:true,
      meta: { title: '快递', noCache: true, ac: '/logisticsQuery/express'},
    },
    {
      path: 'expressInfo',
      component: () => import('@/views/logisticsQuery/expressInfo'),
      name: '快递详情',
      hidden:true,
      meta: { title: '快递详情', noCache: true, ac: '/logisticsQuery/expressInfo'},
    }
  ]
},
//接单小程序后台路由 11.4 by aaron
{
  path:'/orderSystem',
  name:"接单小程序后台管理",
  component:Layout,
  meta: { title: '接单小程序后台管理', noCache: true, ac: '/orderStystem'},
  redirect:"/orderStystem/Order",
  children:[
    {
      path: '/orderStystem/Order',
      name: '订单管理',
      meta: { title: '订单管理', noCache: true, ac: '/orderStystem/Order'},
      component: () => import("@/views/order/index/index"),
      redirect:'/orderStystem/Order/allorders',
      children: [
         {
            path: '/orderStystem/Order/allorders',
            name: '所有订单',
            component: () => import("@/views/order/allOrder"),
            meta: { title: '所有订单', noCache: true, ac: '/orderStystem/Order/allorders'},
         },
         {
            path: '/orderStystem/Order/orderDetail',
            name: '订单详情',
            component: () => import("@/views/order/orderDetail"),
            meta: { title: '订单详情', noCache: true, ac: '/orderStystem/Order/orderDetail'},
            hidden:true
         },
         {
            path: '/orderStystem/Order/logisticsMange',
            name: '物流管理',
            component:()=>import("@/views/order/logisticsMange"),
            meta: { title: '物流管理', noCache: true, ac: '/orderStystem/Order/logisticsMange'},
         },
      ]
    },
    {
      path: '/orderStystem/product',
      name:"产品管理",
      meta: { title: '产品管理', noCache: true, ac: '/orderStystem/product'},
      component: () => import("@/views/order/index/index"),
      redirect:"/orderStystem/product/subproduct",
      children: [
      {
        path: '/orderStystem/product/addProduct',
        component: () => import('@/views/order/addProduct'),
        name: '增加产品',
        hidden:true,
        meta: { title: '增加产品', noCache: true, ac: '/orderStystem/product/addProduct'},
      },
      {
         path: '/orderStystem/product/detailProduct',
         component: () => import('@/views/order/detailProduct'),
         name: '产品详情',
         hidden:true,
         meta: { title: '产品详情', noCache: true, ac: '/orderStystem/product/detailProduct'},
       },
      {
         path: '/orderStystem/product/subproduct',
         component: () => import('@/views/order/product'),
         name: '产品管理',
         meta: { title: '产品管理', noCache: true, ac: '/orderStystem/product/subproduct'},
       }
    ]
    },
    {
      path: '/orderStystem/customerManage',
      name:"客户管理",
      component: Layout,
        component: () => import('@/views/order/customerManage'),
        meta: { title: '客户管理', noCache: true, ac: '/orderStystem/customerManage'}
    },
    {
      path: '/orderStystem/invoice',
      name:"发票管理",
      component: Layout,
        component: () => import('@/views/order/invoice'),
        meta: { title: '发票管理', noCache: true, ac: '/orderStystem/invoice'},
    }
    ,{
      path: '/orderStystem/feedback',
      name:"意见反馈",
      component: Layout,
      component: () => import('@/views/order/feedback'),
      meta: { title: '意见反馈', noCache: true, ac: '/orderStystem/feedback'},
}
  ]
},
 {
  path: "*", // 此处需特别注意置于最底部
  redirect: "/404"
  }  
]
