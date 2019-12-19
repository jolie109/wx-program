<template>
  <div class="addEmployee">
    <h1>增加员工</h1>
    <v-layout>
      姓 名
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field
          label="请输入姓名"
          :rules="nameRules"
          v-model="EmployeeInfoName"
          class="pleaseInput1"
          :error-messages="nameErrors"
          @change="$v.EmployeeInfoName.$touch()"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      入职日期
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="datePosition">
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
          <template v-slot:activator="{  on  }">
            <v-text-field v-model="date" label="请选择日期" readonly v-on="on"  :error-messages="dateErrors"
          @change="$v.date.$touch()"></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="menu  =  false"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-spacer></v-spacer>
    </v-layout>
    <v-layout>
      所在部门
      <!-- <span class="star">*</span> -->
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择部门" :items="department" item-text="name" item-value="_id" v-model="DepartmentName" ></v-select>
      </v-flex>
    </v-layout>
    <v-layout>
    上级主管
      <!-- <span class="star">*</span> -->
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput" label="请选择部门">{{EmployeeInfo.manager}}</v-flex>
    </v-layout>

    <v-layout>
      是否为主管
      <span class="star">*</span>
      <v-switch v-model="EmployeeInfoIsExecutiveDirector" class="pleaseInput" ></v-switch>
    </v-layout>
    <v-layout v-if="EmployeeInfoIsExecutiveDirector">
      调整权限
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput authority">
        <v-text-field label="权限" class v-model="EmployeeInfoAuthority" ></v-text-field>
        <span class="auth">%</span>
      </v-flex>
    </v-layout>
    <v-layout class="salaryClass">
      基本薪资
      <span class="star">*</span>

      <span @click="addBasicSalary()" class="addBasicSalary star">+</span>
    </v-layout>
    <v-layout class="selectP" v-for="(items,indx)  in  dessertBasicData" :key="'info-'+  indx">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择分类"
          :items="items.BasicCategoryData"
          item-text="name"
          item-value="_id"
          v-model="items.category"
          @change="getByBasicCatogry(items,indx)"
        ></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择等级"
          :items="items.BasicGradeData"
          item-text="name"
          item-value="_id"
          v-model="items.grade"
          @change="getLevelByGraCat(items,indx)"
          :disabled="items.disable"
        ></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择级别"
          :items="items.BasicLevelData"
          item-text="name"
          item-value="_id"
          v-model="items.level"
          @change="getBasicSalary(items,indx)"
          :disabled="items.disable"
        ></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="金额" v-model="items.amount" :disabled="items.disable" ></v-text-field>
      </v-flex>
      <span @click="delBasicSalary(indx)" class="delBasicSalary"></span>
    </v-layout>
    <v-layout>
      每月加给
      <span class="star">*</span>

      <span class="star addBasicSalary" @click="addSupply()">+</span>
    </v-layout>
    <v-layout class="selectP" v-for="(item, indexx) in dessertSupplyData" :key="'info1-'+ indexx">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择分类"
          :items="item.CategoryData"
          item-text="name"
          item-value="_id"
          v-model="item.category"
          @change="getByCatogry(item,indexx)"
        ></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择等级"
          :items="item.gradeData"
          item-text="name"
          item-value="_id"
          v-model="item.grade"
          @change="getSalary(item,indexx)"
          :disabled="item.disable"
        ></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="金额" v-model="item.amount" :disabled="item.disable"></v-text-field>
      </v-flex>
      <span @click="delSupply(indexx)" class="delBasicSalary delSupply"></span>
    </v-layout>

    <v-layout>
      办公地点
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field
          label="请输办公地点"
          :rules="placeRules"
          v-model="EmployeeInfoPlace"
          class="pleaseInput1"
           :error-messages="placeErrors"
          @change="$v.EmployeeInfoPlace.$touch()"
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
          v-model="EmployeeInfoEmail"
          class="pleaseInput1"
           :error-messages="emailErrors"
          @change="$v.EmployeeInfoEmail.$touch()"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      手机号码
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field
          label="请输入手机号码"
          :rules="telRules"
          v-model="EmployeeInfoTel"
          class="pleaseInput1"
           :error-messages="telErrors"
          @change="$v.EmployeeInfoTel.$touch()"
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
    <v-layout class="layoutBtn" right>
      <v-btn color="primary" @click="handleCloseAdd">取消</v-btn>
      <v-btn color="primary" @click="saveInfo">保存</v-btn>
    </v-layout>
    <!-- 增加后的预览弹框 -->
    <v-dialog v-model="dialog" persistent max-width="1000px">
      <v-card>
        <v-layout wrap>
          <v-flex xs6>姓名：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.name }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>入职日期：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.date }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>所在部门：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.DepartmentName | getdepartment}}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>上级主管</v-flex>
          <v-flex xs6>{{ EmployeeInfo.manager}}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>是否为主管：</v-flex>
          <v-flex xs6>{{EmployeeInfoIsExecutiveDirector ? '是' : '否' }}</v-flex>
        </v-layout>
        <v-layout wrap v-if="EmployeeInfoIsExecutiveDirector==true">
          <v-flex xs6>调整权限：</v-flex>
          <v-flex xs6>{{EmployeeInfoAuthority}}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>基本薪资：</v-flex>
        </v-layout>
        <div class="supplyLay">
          <v-layout v-for="(items, index) in this.dessertBasicData" :key="'info3-'+ index">
            <v-flex xs6>{{ items.category | getCategryname}}</v-flex>
            <v-flex xs6>{{ items.grade | getGradename }}</v-flex>
            <v-flex xs6>{{ items.level | getlevelname}}</v-flex>
            <v-flex xs6>{{ items.amount }}</v-flex>
          </v-layout>
        </div>
        <v-layout wrap>
          <v-flex xs6>每月加给：</v-flex>
        </v-layout>
        <div class="supplyLay">
          <v-layout v-for="(items, index) in this.dessertSupplyData" :key="'info4-'+ index">
            <v-flex xs6>{{ items.category | getSupplyCname }}</v-flex>
            <v-flex xs6>{{items.grade | getSupplyGname}}</v-flex>
            <v-flex xs6>{{ items.amount }}</v-flex>
          </v-layout>
        </div>

        <v-layout wrap>
          <v-flex xs6>办公地点：</v-flex>
          <v-flex xs6>
            <v-input>{{ EmployeeInfo.place }}</v-input>
          </v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>邮箱：</v-flex>
          <v-flex xs6>
            <v-input>{{ EmployeeInfo.email }}</v-input>
          </v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>手机号码：</v-flex>
          <v-flex xs6>
            <v-input>{{ EmployeeInfo.tel }}</v-input>
          </v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>绑定用户：</v-flex>
          <v-flex xs6>{{userName | getUserName}}</v-flex>
        </v-layout>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="handleAddClose">取消</v-btn>
          <v-btn color="info" @click="handleAdd">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 弹框 -->
    <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>

<script>
import { required, numeric,email } from "vuelidate/lib/validators";
import { request } from "https";
import { truncate, truncateSync } from "fs";
import { type } from "os";

export default {
  name: "addEmployee",
 validations: {
   
      EmployeeInfoName: { required },
      menu: { required },
      date: { required},
      EmployeeInfoPlace:{required},
      EmployeeInfoEmail:{required,email},
      EmployeeInfoTel:{required}
  
  },
  props: ["desserts"],
  data() {
    return {
      //输入框验证验证
      nameRules: [
        v => !!v || "姓名是必填项",
        v => (v && v.length <= 10) || "Name must be less than 10 characters"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      telRules: [
        v => !!v || "必填项",
        v =>
          /^1(3|4|5|6|7|8|9)\d{9}$/.test(v) ||
          "格式有误,必须是13、14、15、16、17、18、19开头的11位数字"
      ],
      placeRules: [v => !!v || "必填项"],
      item: {
        name: ""
      },

      dialog: false,
      titleTip: "",
      color: "",
      // 日期
      date: '',
      menu: false,
      // 员工信息
      deserts: [],
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      //每月加给数组数据
      dessertSupplyData: [],
      gradeData: [],
      CategoryData: [],
      //基本薪资数组数据
      dessertBasicData: [],
      BasicCategoryData: [],
      BasicGradeData: [],
      BasicLevelData: [],
      //判断分类是否已存在
      supply: "",
      categoryName: "",
      LevelsData: [],
      EmployeeInfoName: "",
      EmployeeInfoPlace: "",
      EmployeeInfoEmail: "",
      EmployeeInfoTel: "",
      EmployeeInfoIsExecutiveDirector: false,
      EmployeeInfoAuthority: "",
      DepartmentId: "",
      DepartmentName: "",
      Department: [],
      users: [],
      userName: "",
      userId: "",
      categoryId: "",
      categoryId2: "",
      amount: "",
      levelsId: "",
      Salary: [],
      Salary2: "",
      EmployeeInfo: {
        name: "",
        date: "",
        manager: "",
        isExecutiveDirector: false,
        basicSalary: [],
        place: "",
        email: "",
        tel: ""
      },
      supplySalary: [],
      department: []
    };
  },
  created() {
    this.deserts = this.$route.params.desserts;
    this.getAlldepartments();
  },
  mounted() {
    this.getDataByBasic();
    this.getGradeData();
    this.getAllLevels();
    this.getAllUser();
  },
  methods: {
   
    //获取全部分类
    getDataByBasic() {
      this.$axios.get("/api/employee/getByCatogry").then(res => {
        res.data.result.forEach(item => {
          if (item.category_type === "每月加给") {
            this.CategoryData.push(item);
            localStorage.setItem(
              "CategoryData",
              JSON.stringify(this.CategoryData)
            );
            let data = {
              category: "",
              grade: "",
              amount: "",
              disable: false,
              category_type:"每月加给"
            };
            this.dessertSupplyData.push(data);
            for (const item of this.dessertSupplyData) {
              item.CategoryData = [...this.CategoryData];
            }
          } else if (item.category_type == "基本薪资") {
            // this.dessertBasicData.push(item)
            this.BasicCategoryData.push(item);
            localStorage.setItem(
              "BasicCategoryDatas",
              JSON.stringify(this.BasicCategoryData)
            );
            let data = {
              category: "",
              grade: "",
              level: "",
              amount: "",
              disable: false,
              category_type:"基本薪资"
            };
            this.dessertBasicData.push(data);
            for (const inter of this.dessertBasicData) {
              inter.BasicCategoryData = [...this.BasicCategoryData];
            }
          }
        });
      });
    },
    //获取全部等级
    getGradeData() {
      this.$axios.get("/api/employee/getGradeByMonth").then(res => {
        var data = res.data.result;
        for (const iter of data) {
          if (iter.categorys) {
            if (iter.categorys.category_type == "每月加给") {
              this.gradeData.push(iter);
              localStorage.setItem("gradeData", JSON.stringify(this.gradeData));
              for (const item of this.dessertSupplyData) {
                item.gradeData = [...this.gradeData];
              }
            } else if (iter.categorys.category_type == "基本薪资") {
              this.BasicGradeData.push(iter);
              localStorage.setItem(
                "BasicGradeData",
                JSON.stringify(this.BasicGradeData)
              );
              for (const inter of this.dessertBasicData) {
                inter.BasicGradeData = [...this.BasicGradeData];
              }
            }
          }
        }
      });
    },
    //根据基本薪资分类获取等级
    getByBasicCatogry(value, index) {
      //切换分类重新获取分类，金额
      let currData = [...this.dessertBasicData];
      currData[index].BasicLevelData = ["请选择分类"];
      currData[index].amount = "";
      this.dessertBasicData = [...currData];
      // 等级联动
       value.disable = false;
      for (let i=0; i < this.dessertBasicData.length; i++) {
        if (i !== index) {
          if (this.dessertBasicData[i].category == value.category) {
            value.disable = true;
            this.titleTip = "此分类已存在";
            this.snackbar = true;
            this.right = true;
            this.color = "error";
            break;
          }
        }
      }
      if (!value.disable) {
        this.$axios
          .get("/api/employee/getGradeByCn", {
            params: {
              categoryId: value.category
            }
          })
          .then(res => {
            if (res.data.result.length) {
              let currData = [...this.dessertBasicData];
              currData[index].BasicGradeData = [...res.data.result];
              this.dessertBasicData = [...currData];
              return;
            } else {
              let currData = [...this.dessertBasicData];
              currData[index].BasicGradeData = ["无"];
              this.dessertBasicData = [...currData];
            }
          }); 
      }
    },
    //根据分类，等级获取级别
    getLevelByGraCat(items, indx) {
      let currData = [...this.dessertBasicData];
      currData[indx].amount = "";
      currData[indx].BasicLevelData = [];
      this.dessertBasicData = [...currData];
      if (items.grade !== "无") {
        this.$axios
          .get("/api/employee/getLevelByGraCat", {
            params: {
              categoryId: items.category,
              gradeId: items.grade
            }
          })
          .then(res => {
            let basicLevel = [];
            for (const iterator of res.data.result) {
              basicLevel.push(iterator.levels);
              let currData = [...this.dessertBasicData];
              currData[indx].BasicLevelData = [...basicLevel];
              this.dessertBasicData = [...currData];
            }
          });
        return;
      } else {
        let currData = [...this.dessertBasicData];
        currData[indx].BasicLevelData = ["无"];
        this.dessertBasicData = [...currData];
      }
    },
    //获取基本薪资金额
    getBasicSalary(value, index) {
      if (value.level == "") {
        let currData = [...this.dessertBasicData];
        currData[index].amount = 0;
        this.dessertBasicData = [...currData];
      } else {
       
        this.$axios
          .get("/api/employee/getBasicSalary", {
            params: {
              categoryId: value.category,
              gradeId: value.grade,
              levelId: value.level
            }
          })
          .then(res => {
            if(res.data.result.length<=0){
              let currData = [...this.dessertBasicData];
                currData[index].amount = 0;
                this.dessertBasicData = [...currData];
            }else{
              for (const iterator of res.data.result) {
                let currData = [...this.dessertBasicData];
                currData[index].amount = iterator.amount;
                this.dessertBasicData = [...currData];
              }
            }
            
          });
      }
    },
    //得到所有级别
    getAllLevels() {
      this.$axios.get("/api/employee/getAllLevels", {}).then(res => {
        for (const item of res.data.result) {
          this.BasicLevelData.push(item);
          //所有级别保存在本地
          localStorage.setItem(
            "BasicLevelData",
            JSON.stringify(this.BasicLevelData)
          );
        }
        for (const item of this.dessertBasicData) {
          item.BasicLevelData = [...this.BasicLevelData];
        }
      });
    },
    //获取所有部门
    getAlldepartments() {
      this.$axios.get("/api/employee/getAlldepartments", {}).then(res => {
        this.department = res.data.result;
       localStorage.setItem("department", JSON.stringify(this.department));

      });
    },
    //根据选择部门显示该部门主管
    getManagerByName() {
      this.$axios
        .get("/api/employee/getManagerByName", {
          params: {
            department_name: this.EmployeeInfo.DepartmentName
          }
        })
        .then(res => {
          if (res.data.result[0].manager_id != null) {
             this.EmployeeInfo.manager = res.data.result[0].name;
          } else {
            alert("该部门暂无主管")
            this.EmployeeInfo.manager = "无";
          }
        });
    },
    //获取每月加给下的等级
    getByCatogry(value, index) {
      let currData = [...this.dessertSupplyData];
      currData[index].amount = "";
      this.dessertSupplyData = [...currData];
      value.disable = false;
      for(let i=0;i<this.dessertSupplyData.length;i++){
        if (i !== index) {
          if (this.dessertSupplyData[i].category == value.category) {
            (this.titleTip = "此分类已存在"),
              (this.snackbar = true),
              (this.right = true),
              (this.color = "error");
            value.disable = true;
            break;
          }
        }
      }
      if(!value.disable){
        this.$axios
          .get("/api/employee/getGradeByCn", {
            params: {
              categoryId: value.category
            }
          })
          .then(res => {
            if (res.data.result.length <= 0) {
              let currData = [...this.dessertSupplyData];
              currData[index].gradeData = ["无"];
              currData[index].amount = "";
              this.dessertSupplyData = [...currData];
            } else {
              let currData = [...this.dessertSupplyData];
              currData[index].gradeData = [...res.data.result];
              this.dessertSupplyData = [...currData];
            }
          });
      }
    },
    //获取每月加给金额
    getSalary(item, index) {
      this.$axios
        .get("/api/employee/getSalary", {
          params: {
            categoryId: item.category,
            gradeId: item.grade
          }
        })
        .then(res => {
          if (res.data.result.length > 0) {
            for (const iterator of res.data.result) {
              let currData = [...this.dessertSupplyData];
              currData[index].amount = iterator.amount;
              this.dessertSupplyData = [...currData];
            }
          } else {
            let currData = [...this.dessertSupplyData];
            currData[index].amount = 0;
            this.dessertSupplyData = [...currData];
          }
        });
    },

    // 添加基本薪资
    addBasicSalary() {
      const basicSalary = {
        category: "",
        grade: "",
        level: "",
        BasicCategoryData:[...this.BasicCategoryData],
        BasicGradeData: [...this.BasicGradeData],
        BasicLevelData: [...this.BasicLevelData],
        amount: "",
        category_type:"基本薪资"
      };
      this.dessertBasicData.push(basicSalary);
    },
    // 删除基本薪资
    delBasicSalary(index) {
      this.dessertBasicData.splice(index, 1);
    },
    //添加每月加给
    addSupply() {
      const supplySalary = {
        category: "",
        grade: "",
        CategoryData:[...this.CategoryData],
        gradeData: [...this.BasicGradeData],
        amount: "",
        category_type: "每月加给"
      };
      this.dessertSupplyData.push(supplySalary);
    },
    //删除每月加给
    delSupply(index) {
      this.dessertSupplyData.splice(index, 1);
    },
    // 保存
    saveInfo() {
      // 显示弹框
       this.$v.$touch();
      if(this.EmployeeInfoName=='' ||
       this.date=='' ||
        this.EmployeeInfoPlace=='' ||
        this.EmployeeInfoEmail=='' ||
        this.EmployeeInfoTel==''
        ){
          return false
      }else{
           this.dialog = true;
      }
    },

    handleAddClose() {
      this.dialog = false;
    },
    handleCloseAdd() {
      this.$router.push({
        path: "/xinzi/EmployeeManagement/Employee"
      });
    },
    handleAdd() {
      // 弹框提示
      // this.titleTip = "添加成功！";
      // this.snackbar = true;
      // this.right = true;
      this.handleAddClose();
      this.createEmployee();
    },
    //获取用户
    getAllUser() {
      this.$axios.get("/api/employee/getAllUser", {}).then(res => {
        this.users = res.data.result;
        localStorage.setItem("users", JSON.stringify(this.users));
      });
    },
    //增加员工
    createEmployee() {
    //  else{
     
        let params = {
        name: this.EmployeeInfo.name,
        entry_time: this.EmployeeInfo.date,
        is_manager: this.EmployeeInfoIsExecutiveDirector,
        workplace: this.EmployeeInfo.place,
        tel: this.EmployeeInfo.tel,
        email: this.EmployeeInfo.email,
        departmentName: this.EmployeeInfo.DepartmentName,
        adjust_permissions: this.EmployeeInfoAuthority,
        basicdata: this.dessertBasicData,
        supplydata: this.dessertSupplyData,
        userId: this.userId
      };
      this.$axios.post("/api/employee/newEmployee", params).then(res => {
        if (res.data.status == "202") {
          this.titleTip = "此员工已存在";
          this.snackbar = true;
          this.right = true;
          this.color = "error";
          return;
        } else if (res.data.status == "200") {
          this.titleTip = "员工增加成功";
          this.snackbar = true;
          this.right = true;
          this.color = "info";
          this.$router.push({
            path: "/xinzi/EmployeeManagement/Employee",
            params: {
              desserts: this.desserts
            }
          });
        }
      });
      // }
    }
  },

  filters: {
    //预览框内基本薪资分类
    getCategryname: function(value) {
      for (const iterator of JSON.parse(
        localStorage.getItem("BasicCategoryDatas")
      )) {
        if (iterator._id == value) {
          return iterator.name;
        }
      }
    },
    //预览框内基本薪资等级
    getGradename(val) {
      for (const item of JSON.parse(localStorage.getItem("BasicGradeData"))) {
        if (item._id == val) {
          return item.name;
        }
      }
    },
    //预览框内基本薪资级别
    getlevelname(value) {
      for (const item of JSON.parse(localStorage.getItem("BasicLevelData"))) {
        if (item._id == value) {
          return item.name;
        }
      }
    },
    //  //预览框内每月加给分类（id）
    getSupplyCname(value) {
      for (const item of JSON.parse(localStorage.getItem("CategoryData"))) {
        if (item._id == value) {
          return item.name;
        }
      }
    },
    //预览框内每月加给等级（id）
    getSupplyGname(value) {
      for (const item of JSON.parse(localStorage.getItem("gradeData"))) {
        if (item._id == value) {
          return item.name;
        }
      }
    },
    //预览框内绑定用户
    getUserName(value) {
      
      for (const item of JSON.parse(localStorage.getItem("users"))) {
      
        if (item._id == value) {
          return item.name;
        }
      }
    },
     getdepartment(value) {
      
      for (const item of JSON.parse(localStorage.getItem("department"))) {
      
        if (item._id == value) {
          return item.name;
        }
      }
    }
  },

  watch: {
    //增加员工姓名
    EmployeeInfoName(val) {
      this.EmployeeInfo.name = val;

    },
    //增加员工入职日期
    date(val) {
      this.EmployeeInfo.date = val;

    },

    //办公地点
    EmployeeInfoPlace(val) {
      this.EmployeeInfo.place = val;

    },
    //获取邮箱的值
    EmployeeInfoEmail(val) {
      this.EmployeeInfo.email = val;

    },
    //监听获取手机号码的值
    EmployeeInfoTel(val) {
      this.EmployeeInfo.tel = val;

    },
    //监听是否为主管值
    EmployeeInfoIsExecutiveDirector(val) {
      this.EmployeeInfo.isExecutiveDirector = val;
      if (val == false) {
        this.EmployeeInfoAuthority = 0;
      }

    },
    //获取权限的值
    EmployeeInfoAuthority(el) {
      if (el > 20) {
        this.titleTip = "权限设置区间为[0%-20%]";
        this.snackbar = true;
        this.right = true;
        this.color = "error";
        return;
      } else if (el < 0) {
        this.titleTip = "权限设置区间为[0%-20%]";
        this.snackbar = true;
        this.right = true;
        this.color = "error";
        return;
      } else {
        this.EmployeeInfoAuthority = el;
      }
    },
    //根据部门名称获取主管值
    DepartmentName(val) {
      this.EmployeeInfo.DepartmentName = val;
      this.getManagerByName();
    },
    //获取绑定用户值
    userName(val) {
      this.userId = val;
    }
  },
    computed: {
   nameErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoName.$dirty) return errors;
      !this.$v.EmployeeInfoName.required &&
        errors.push("姓名不能为空。");
      !this.$v.EmployeeInfoName.required && errors.push("请输入姓名");
      return errors;
    },
    dateErrors() {
      const errors = [];
      if (!this.$v.date.$dirty) return errors;
      !this.$v.date.required &&
        errors.push("日期不能为空");
      !this.$v.date.required && errors.push("请选择日期");
      return errors;
    },
     placeErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoPlace.$dirty) return errors;
      !this.$v.EmployeeInfoPlace.required &&
        errors.push("办公地点不能为空");
      !this.$v.EmployeeInfoPlace.required && errors.push("请输入办公地点");
      return errors;
    },
      emailErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoEmail.$dirty) return errors;
      !this.$v.EmployeeInfoEmail.email &&
        errors.push("邮箱不能为空");
      !this.$v.EmployeeInfoEmail.required && errors.push("请输入邮箱");
      return errors;
    },
   telErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoTel.$dirty) return errors;
      !this.$v.EmployeeInfoTel.required &&
        errors.push("手机号码不能为空");
      !this.$v.EmployeeInfoTel.required && errors.push("请输入手机号码");
      return errors;
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
.addEmployee h2 span {
  color: red;
}
.star {
  color: red;
  display: inline-block;
  padding: 20px;
}
.pleaseInput {
  display: inline-block !important;
  margin-left: 50px;
}
.authority {
  display: flex !important;
}
.pleaseInput1 {
  width: 800px !important;
}
.auth {
  margin: auto 0;
}

.addEmployee .selectP {
  position: relative;
}
.addEmployee .selectP span {
  display: inline-block;
  line-height: 10px;
  margin-left: 20px;
  width: 15px;
  border-bottom: 2px solid red;
  position: absolute;
  right: 10%;
  top: 40px;
  cursor: pointer;
}
.delSupply {
  right: 30% !important;
}
.addEmployee /deep/ .theme--light.v-icon {
  color: #2886c8;
  font-size: 40px;
}
.layoutBtn {
  margin-right: 150px;
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
/* 增加后的预览效果 */
.theme--light.v-sheet {
  padding: 55px;
}
.layout {
  font-size: 18px !important;
  display: flex !important;
  align-items: center !important;
  margin-bottom: 20px !important;
}
.salaryClass {
  margin-bottom: 20px;
}
.theme--light.v-btn {
  margin-right: 60px !important;
}
.supplyLay {
  padding-left: 55px !important;
  color: rgb(88, 87, 87) !important;
}
.supplyLay .flex.xs6 {
  font-size: 16px !important;
}
/* 日期 */
.datePosition {
  position: relative;
  margin-left: 48px;
}
.v-menu__content {
  position: absolute !important;
  top: 298px !important;
  left: 538px !important;
}
</style>