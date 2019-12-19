<template>
  <div class="addEmployee">
    <h1>编辑员工信息</h1>
    <v-layout>
      姓 名
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field v-model="desserts.name" :rules="nameRules" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      入职日期
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field label="请选择日期" v-on="on" v-model="date" class="pleaseInput1"></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="menu = false"></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
    <v-layout>
      所在部门
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择部门"
          :items="department"
          item-text="name"
          v-model="selectDepartment"
          @change="handledepartment"
        ></v-select>
      </v-flex>
    </v-layout>
    <v-layout>
      上级主管
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" readonly v-model="departmentCharge"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      是否为主管
      <span class="star">*</span>
      <v-switch v-model="isManager" class="pleaseInput"></v-switch>
    </v-layout>
    <v-layout v-if="isManager">
      调整权限
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field :rules="remain_stockRules" v-model="adjust_permissions"></v-text-field>
      </v-flex>%
    </v-layout>
    <v-layout>
      基本薪资
      <span @click="addBasicSalary()" class="addBasicSalary star">+</span>
    </v-layout>
    <v-layout class="selectP" :key="index" v-for="(item, index) in baseSalaryDesserts">
      <v-flex xs2 class="pleaseInput">
        <v-select
          label="请选择分类"
          :items="item.CategorySalary"
          item-text="name"
          v-model="item.category.name"
          @change="changeCategorySalary(item,index)"
        ></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-select
          label="请选择等级"
          :items="item.gradeSalary"
          item-text="name"
          v-model="item.grade.name"
          @change="changeGradeSalary(item,index)"
          :disabled="item.disable"
        ></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-select
          label="请选择级别"
          :items="item.LevelSalary"
          item-text="name"
          v-model="item.level.name"
          @change="changeLevelSalary(item,index)"
          :disabled="item.disable"
        ></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="金额" v-model="item.amount" :disabled="item.disable"></v-text-field>
      </v-flex>
      <span @click="delBasicSalary(item,index)" class="delBasicSalary"></span>
    </v-layout>
    <v-layout>
      每月加给
      <span class="star" @click="addSupply">+</span>
    </v-layout>
    <v-layout class="selectP" :key="'selectP-'+index" v-for="(item, index) in monthDesserts">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择分类"
          :items="item.CategoryMonth"
          item-text="name"
          v-model="item.category.name"
          @change="changeCategoryMonth(item,index)"
        ></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择等级"
          :items="item.gradeMonth"
          item-text="name"
          v-model="item.grade.name"
          @change="changeGradeMonth(item,index)"
          :disabled="item.disable"
        ></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="金额" v-model="item.amount" :disabled="item.disable"></v-text-field>
      </v-flex>
      <span @click="delSupply(item,index)" class="delBasicSalary"></span>
    </v-layout>
    <v-layout>
      股票数
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field
          class="pleaseInput1"
          v-model="desserts.remain_stock"
          readonly="true"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      任务点数
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" v-model="desserts.task_count"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      value Index
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" readonly v-model="desserts.value_index"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      上次value Index计算时间
      <span class="star">*</span>
      <v-flex xs2 class="pleaseInput">
        <v-text-field class="pleaseInput2" readonly v-model="desserts.last_value_index_time"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      办公地点
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field
          label="请输办公地点"
          :rules="nameRules"
          v-model="desserts.workplace"
          class="pleaseInput1"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      手机号码
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field
          label="请输入手机号码"
          :rules="phoneRules"
          v-model="desserts.tel"
          class="pleaseInput1"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      邮 箱
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field
          label="请输入邮箱"
          :rules="emailRules"
          v-model="desserts.email"
          class="pleaseInput1"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      绑定用户
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择用户"
          :items="users"
          item-text="name"
          item-value="_id"
          v-model="userName"
        ></v-select>
      </v-flex>
    </v-layout>
    <v-layout class="layoutBtn">
      <v-flex xs4>
        <v-btn color="primary" @click="handleCheck">查看股票数</v-btn>
      </v-flex>
      <v-flex xs4>
        <v-btn color="primary" @click="saveEmployeeDetail">保存</v-btn>
        <v-btn color="primary" right @click="closeEmployeeDetail">取消</v-btn>
      </v-flex>
    </v-layout>
    <!-- 弹框 -->
    <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
    <!-- 查看股票弹框 -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-icon class="closeClear" @click="handleClear">clear</v-icon>
        <v-data-table :headers="headers" :items="dessertsStock" class="elevation-1" hide-actions>
          <template slot="headerCell" slot-scope="props">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on">{{ props.header.text }}</span>
              </template>
            </v-tooltip>
          </template>
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.transaction_type }}</td>
            <td class="text-xs-center">{{ props.item.transaction_time }}</td>
            <td class="text-xs-center">{{ props.item.qty }}</td>
            <td class="text-xs-center">{{ props.item.remain_qty }}</td>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "detailEmployee",
  data() {
    return {
      // 表单验证
      nameRules: [v => !!v || "必填项"],
      emailRules: [
        v => !!v || "必填项",
        v => /.+@.+/.test(v) || "邮箱格式有误"
      ],
      remain_stockRules: [
        v => !!v || "必填项",
        v => /^[0-9]*$/.test(v) || "格式有误，必须是数字"
      ],
      phoneRules: [
        v => !!v || "必填项",
        v =>
          /^1(3|4|5|6|7|8|9)\d{9}$/.test(v) ||
          "格式有误,必须是13、14、15、16、17、18、19开头的11位数字"
      ],
      dialog: false,
      titleTip: "",
      desserts: {},
      isManager: false,
      // 日期
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      // 弹框信息
      top: true,
      right: true,
      snackbar: false,
      color: "info",
      department: [],
      selectDepartment: "",
      baseSalaryDesserts: [],
      monthDesserts: [],
      CategorySalary: [],
      gradeSalary: [],
      LevelSalary: [],
      CategoryMonth: [],
      categortFilter: [],
      gradeMonth: [],
      CateforyGradeMonth: [],
      departmentCharge: "",
      adjust_permissions: "",
      headers: [
        { text: "股票", align: "center", sortable: false, value: "name" },
        { text: "时间", align: "center", sortable: false, value: "calories" },
        { text: "股票数", align: "center", sortable: false, value: "fat" },
        { text: "剩余总股数", align: "center", sortable: false, value: "carbs" }
      ],
      dessertsStock: [],
      test: [],
      deldataId:[],
      userName:'',
      users:[],
      userId:''
    };
  },
  created() {
    // 路由跳转传参
    // this.desserts = this.$route.params.desserts;
    this.desserts = JSON.parse(localStorage.getItem("item"));
    this.isManager=this.desserts.is_manager;
    this.adjust_permissions = this.desserts.adjust_permissions;
    this.selectDepartment = this.desserts.itemEmployee[0].name;
    this.date = this.desserts.entry_time
    this.getDepartments(); //获取所有部门数据
    this.changeCategory(); //获取所有分类
    this.changeGrade(); //获取所有等级
    this.changeLevel(); //获取所有级别
    this.getSalary();   //获取员工的基本薪资与每月加给
    this.handledepartment();
    this.getAllUser()
  },
  watch: {
    // 监听是否为主管的v-model值==调整权限中v-if中的值
    isManager:function(newValue,oldValue){
      this.isManager=newValue
    },
    // 监听每次选择的部门
    selectDepartment: function(newValue, oldValue) {
      this.selectDepartment = newValue;
    },
    adjust_permissions: function(newValue, oldValue) {
      this.adjust_permissions = newValue;
      if (this.adjust_permissions > 20) {
        this.snackbar = true;
        this.right = true;
        this.titleTip = "不能大于20%";
        this.color = "error";
      }
    },
    userName:function(val){

      this.userId = val;
    }
  },
  methods: {
        //获取用户
    getAllUser() {
      this.$axios.get("/api/employee/getAllUser", {}).then(res => {
        this.users = res.data.result;
        this.users.forEach((item)=>{
          if(item.employee_id.toString()==this.desserts._id.toString()){
            this.userName=item._id
          }
        })
      });
    },
    // 添加基本薪资
    addBasicSalary() {
      const baseSalaryDesserts = {
        category: {
          name: ""
        },
        CategorySalary: [...this.CategorySalary],
        gradeSalary: [...this.gradeSalary],
        LevelSalary: [...this.LevelSalary],
        amount: "",
        grade: {
          name: ""
        },
        _id: "",
        level: {
          name: ""
        },
        disable: false
      };
      this.baseSalaryDesserts.push(baseSalaryDesserts);
    },
    //添加每月加给
    addSupply() {
      const monthDesserts = {
        category: {
          name: ""
        },
        CategoryMonth: [...this.CategoryMonth],
        gradeMonth: [...this.gradeMonth],
        amount: "",
        grade: {
          name: ""
        },
        _id: "",
        disable: false
      };
      this.monthDesserts.push(monthDesserts);
    },
    // 删除基本薪资
    delBasicSalary(item, index) {
     this.baseSalaryDesserts.splice(index,1)
      this.deldataId.push(item._id)
       
    },
    //删除每月加给
    delSupply(item, index) {
      this.deldataId.push(item._id)
     
        this.monthDesserts.splice(index, 1);

    },
    // 保存
    saveEmployeeDetail() {
      this.$axios
        .post("/api/employee/updateEmployee", {
          updateSalary: this.baseSalaryDesserts,
          updateMonth: this.monthDesserts,
          deleteSalaryId:this.deldataId,
          updateList: {
            name: this.desserts.name,
            entry_time: this.date,
            selectDepartment: this.selectDepartment,
            is_manager: this.isManager,
            remain_stock: this.remain_stock,
            task_count: this.desserts.task_count,
            adjust_permissions: this.adjust_permissions,
            workplace: this.desserts.workplace,
            tel: this.desserts.tel,
            email: this.desserts.email,
            _id: this.desserts._id,
            department_id: "",
            employee_salary_structure_ids: []
          },
          selectDepartment: this.selectDepartment,
          _id: this.desserts._id,
           userId:this.userId,
        })
        .then(res => {
          if (res.data.status == 200) {
            this.$router.push({
              path: '/xinzi/EmployeeManagement/Employee'
            });
            this.snackbar = true;
            this.titleTip = res.data.msg;
            this.color = "info";
          } else {
            this.snackbar = true;
            this.color = "error";
            this.titleTip = "编辑失败！";
          }
        });
    },
    closeEmployeeDetail() {
      this.$router.push({
        path: "/xinzi/EmployeeManagement/Employee"
      });
    },
    // 股票弹框事件
    handleCheck() {
      this.dialog = true;
      this.$axios
        .get("/api/employee/getEmployeeStock", {
          params: {
            employee_id: this.desserts._id
          }
        })
        .then(res => {
          this.dessertsStock = res.data.result[0].stock;
        });
    },
    handleClear() {
      this.dialog = false;
    },
    // 部门中绑定所有的部门
    getDepartments() {
      this.$axios.get("/api/employee/allDepartmentName").then(res => {
        this.department = res.data.result;
      });
    },
    // 根据员工姓名找到其对应的基本薪资与每月加给情况
    getSalary() {
      this.$axios
        .get("/api/employee/getEmployeeSalaryEdit", {
          params: {
            _id: this.desserts._id
          }
        })
        .then(res => {
          for (const iterator of res.data.result) {
            if (iterator.category.category_type == "基本薪资") {
              this.baseSalaryDesserts.push(iterator);

            }
            if (iterator.category.category_type == "每月加给") {
              this.monthDesserts.push(iterator);
            }
          }
          for (const iterator of this.baseSalaryDesserts) {
            iterator.CategorySalary = [...this.CategorySalary];
            iterator.gradeSalary = [...this.gradeSalary];
            iterator.LevelSalary = [...this.LevelSalary];
            iterator.disable = false;
          }
          for (const iterator of this.monthDesserts) {
            iterator.CategoryMonth = [...this.CategoryMonth];
            iterator.gradeMonth = [...this.gradeMonth];
            iterator.disable = false;
          }
        });
    },
    // 编辑中基本薪资、每月加给分类获取所有数据
    changeCategory() {
      this.$axios.get("/api/classify/getCategoryAccount").then(res => {

        for (const iterator of res.data) {
          if (iterator.category_type == "基本薪资") {
            this.CategorySalary.push(iterator);
          }
          if (iterator.category_type == "每月加给") {
            this.CategoryMonth.push(iterator);
          }
        }
      });
    },
    // 编辑中基本薪资、每月加给等级获取所有数据
    changeGrade() {
      this.$axios.get("/api/employee/getGradeCountSalary").then(res => {
        for (const iterator of res.data.result) {
          if (iterator.category_type == "基本薪资") {
            if (iterator.grade.length) {
              for (const iterator of iterator.grade) {
                this.gradeSalary.push(iterator);
              }
            }
          }
          if (iterator.category_type == "每月加给") {
            if (iterator.grade.length) {
              for (const iterator of iterator.grade) {
                this.gradeMonth.push(iterator);
              }
            }
          }
        }
      });
    },
    // 编辑中基本薪资级别获取所有数据
    changeLevel() {
      this.$axios.get("/api/classify/getLevelAccount").then(res => {
        for (const iterator of res.data.result) {
          if(iterator.level){
            this.LevelSalary.push(iterator.level)
          }
        }
      });
    },
    // 基本薪资分类联动
    changeCategorySalary(item, index) {
      if (this.baseSalaryDesserts.length <= 1) {
        this.changeCategorySalaryAxios(item, index);
      }else{
        item.disable=false;
        for(let i=0;i<this.baseSalaryDesserts.length;i++){
          if (i !== index) {
            if (this.baseSalaryDesserts[i].category.name == item.category.name) {
              this.snackbar = true;
              this.right = true;
              this.titleTip = "添加错误,该分类已存在";
              this.color = "error";
              item.disable = true;
              break;
            } 
          }
        }
        if(!item.disable){
        this.changeCategorySalaryAxios(item, index);
      }
      }
      
      
    },
    changeCategorySalaryAxios(item, index) {
      this.$axios
        .get("/api/employee/getCategoryGrade", {
          params: {
            name: item.category.name
          }
        })
        .then(res => {
          let currData = [...this.baseSalaryDesserts];
          currData[index].gradeSalary = [...res.data.result[0].item];
          this.baseSalaryDesserts = [...currData];
        });
    },
    // 基本薪资等级联动
    changeGradeSalary(item, index) {
      this.$axios
        .get("/api/employee/getGradeLevel", {
          params: {
            grade_name: item.grade.name,
            category_name: item.category.name
          }
        })
        .then(res => {
          if(res.data.result.length){
            if (res.data.result[0].item.length>0) {
              let currData = [...this.baseSalaryDesserts];
              currData[index].LevelSalary = [...res.data.result[0].item];
              this.baseSalaryDesserts = [...currData];
            }else if(res.data.result[0].item.length==0){
              let currData = [...this.baseSalaryDesserts];
              currData[index].LevelSalary = [];
              this.baseSalaryDesserts = [...currData];
              item.amount=0;
            }else{
              item.amount=0;
            }
          }
          
        });
    },
    // 基本薪资级别联动
    changeLevelSalary(item, index) {
      this.$axios
        .get("/api/employee/getGradeLevelSalary", {
          params: {
            category_name: item.category.name,
            grade_name: item.grade.name,
            level_name: item.level.name
          }
        })
        .then(res => {
          if (res.data.result.length == 0) {
            this.baseSalaryDesserts[index].amount = 0;
          } else if (res.data.result.length > 0) {
            this.baseSalaryDesserts[index].amount = res.data.result[0].amount;
          }
        });
    },
    //
    // 每月加给分类联动
    changeCategoryMonth(item, index) {
      if (this.monthDesserts.length <= 1) {
        this.changeCategoryMonthAxios(item, index);
      } else {
        item.disable=false;
        for(let i=0;i<this.monthDesserts.length;i++){
          if (i !== index) {
            if (this.monthDesserts[i].category.name == item.category.name) {
              this.snackbar = true;
              this.right = true;
              this.titleTip = "添加错误,该分类已存在";
              this.color = "error";
              item.disable = true;
              break;
            } 
          }
        }
        if(!item.disable){
          this.changeCategoryMonthAxios(item, index);
        }
      }
    },
    // 每月加给分类联动时发送的请求
    changeCategoryMonthAxios(item, index) {
      this.$axios
        .get("/api/employee/getGradeMonth", {
          params: {
            name: item.category.name
          }
        })
        .then(res => {
          let currData = [...this.monthDesserts];
          currData[index].gradeMonth = [...res.data.result[0].item];
          this.monthDesserts = [...currData];
        });
    },
    // 每月加给等级联动（根据等级找金额）
    changeGradeMonth(item, index) {
      this.$axios
        .get("/api/employee/getGradeMonthMoney", {
          params: {
            category_name: item.category.name,
            grade_name: item.grade.name
          }
        })
        .then(res => {
          if (!res.data.result.length) {
            this.monthDesserts[index].amount = 0;
          } else {
            this.monthDesserts[index].amount = res.data.result[0].amount;
          }
        });
    },
    // 改变部门对应的主管
    handledepartment() {
      this.$axios
        .get("/api/employee/getDepartmentManger", {
          params: {
            departmentName: this.selectDepartment
          }
        })
        .then(res => {
          if (res.data.result.length) {
            this.departmentCharge = res.data.result[0].name;
          } else {
            this.departmentCharge = "无";
          }
        });
    }
  }
};
</script>

<style scoped>
.addEmployee {
  box-shadow: 0 1px 2px 2px #ccc;
  padding: 40px 60px 160px;
  color: #333;
}
.addEmployee h1 {
  text-align: center;
  opacity: 0.8;
}
.addEmployee h2 {
  margin-bottom: 20px;
}
.star {
  color: red;
  display: inline-block;
  margin-left: 20px;
}
.pleaseInput {
  display: inline-block !important;
  margin-left: 50px;
}
.pleaseInput1 {
  width: 800px !important;
}
.pleaseInput2 {
  width: 670px !important;
}
.addEmployee .selectP {
  position: relative;
}
.addEmployee .selectP span {
  display: inline-block;
  margin-left: 20px;
  width: 15px;
  border-bottom: 3px solid red;
  position: absolute;
  right: 9%;
  top: 32px;
  cursor: pointer;
}

.addEmployee /deep/ .theme--light.v-icon {
  color: #2886c8;
  font-size: 40px;
}
.layoutBtn {
  margin-top: 30px;
}
.layoutBtn button:nth-of-type(1) {
  margin-right: 40px;
}
/* 添加基本薪资按钮 */
.addBasicSalary {
  cursor: pointer;
}
/* 删除基本薪资当前行按钮 */
.delBasicSalary {
  cursor: pointer;
}
.layout {
  font-size: 18px !important;
  display: flex !important;
  align-items: center !important;
}
/* 查看股票弹框 */
.theme--light.v-sheet {
  position: relative !important;
}
.closeClear {
  position: absolute;
  top: 10px;
  right: 10px;
}
.elevation-1 /deep/ .v-table__overflow {
  padding: 35px 35px 75px;
}
.elevation-1 /deep/ table.v-table tbody tr {
  border-bottom: 1px solid #ccc;
}
</style>