<template>
  <v-container fluid grid-list-xl>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>生成薪资单</p>
      </v-flex>
      <v-layout>
        <v-flex class="headerTitle" md12>
          <p>薪资单</p>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md4>
          <p>员工姓名:{{tableName}}</p>
        </v-flex>
        <v-flex md4>
          <p>所在部门:{{department}}</p>
        </v-flex>
        <v-flex md4>
          <p>日期:{{month}}</p>
        </v-flex>
        <v-flex md4>
          <p>状态:{{status}}</p>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex class="smallTitle" md12>
          <p>基本薪资</p>
        </v-flex>
      </v-layout>
      <!-- 添加特别调整的弹框 -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card justify-center v-show="rewardShow">
          <v-card-title>
            <v-flex class="headline" md3 offset-md5>创建内容</v-flex>
          </v-card-title>
          <v-card-text>
            <v-layout align-center ml-5>
              <v-flex xs12 sm6 md4>
                <v-subheader>内容</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field v-model="editedItem.memo" placeholder="输入嘉奖内容"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout align-center ml-5>
              <v-flex xs12 sm6 md4>
                <v-subheader>金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field placeholder="输入嘉奖金额" v-model="editedItem.amount" :rules="amountRule"></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="dialog = false">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="saveReward">创建</v-btn>
          </v-card-actions>
        </v-card>
        <!-- 第二个弹框 -->
        <v-card justify-center v-show="adjustShow">
          <v-card-title>
            <v-flex class="headline" md3 offset-md5>创建内容</v-flex>
          </v-card-title>
          <v-card-text>
            <v-layout align-center ml-5>
              <v-flex xs12 sm6 md4>
                <v-subheader>内容</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field v-model="editedAdjustItem.memo" placeholder="输入调整内容"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout align-center ml-5>
              <v-flex xs12 sm6 md4>
                <v-subheader>金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field
                  placeholder="输入调整金额"
                  v-model="editedAdjustItem.amount"
                  :rules="amountRule"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="dialog = false">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="saveAdjust">创建</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- 表格部分 -->
      <v-flex md12>
        <v-data-table
          :headers="headers"
          :items="basicPayslip"
          class="elevation-1"
          hide-actions
          no-data-text="暂无基本薪资项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.category.name }}</td>
            <td class="text-xs-center">{{ props.item.grade.name }}</td>
            <td class="text-xs-center">{{ props.item.level.name }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>每月加给</p>
          </v-flex>
        </v-layout>
        <v-data-table
          :headers="headersencond"
          :items="addedPayslip"
          class="elevation-1"
          hide-actions
          no-data-text="暂无每月加给项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.category.name }}</td>
            <td class="text-xs-center">{{ props.item.grade.name }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>绩效奖金</p>
          </v-flex>
        </v-layout>
        <v-data-table
          :headers="headerthird"
          :items="dessertthird"
          class="elevation-1"
          hide-actions
          no-data-text="暂无绩效奖金项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>双薪</p>
          </v-flex>
        </v-layout>
        <v-data-table
          :headers="headerfourth"
          :items="dessertfourth"
          class="elevation-1"
          hide-actions
          no-data-text="暂无双薪项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>分红</p>
          </v-flex>
        </v-layout>
        <v-data-table
          :headers="headerfifth"
          :items="dessertfifth"
          class="elevation-1"
          hide-actions
          no-data-text="暂无分红项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.bonus_type }}</td>
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>特别调整</p>
          </v-flex>
        </v-layout>
        <!-- ************************** -->
        <v-layout>
          <v-flex class="smallTitle" md1>
            <p>嘉奖</p>
          </v-flex>
          <v-flex md1>
            <v-btn color="primary" @click="addItem()">增加</v-btn>
          </v-flex>
        </v-layout>
        <v-data-table
          :headers="headersixth"
          :items="dessertsixth"
          class="elevation-1"
          hide-actions
          no-data-text="暂无嘉奖项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.memo }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center">
              <v-btn small color="primary" @click="deleteItem(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
        <!-- ************************* -->
        <v-layout>
          <v-flex class="smallTitle" md1>
            <p>调整</p>
          </v-flex>
          <v-flex md1>
            <v-btn color="primary" @click="addAdjustItem()">增加</v-btn>
          </v-flex>
        </v-layout>
        <v-data-table
          :headers="headerseventh"
          :items="dessertseventh"
          class="elevation-1"
          hide-actions
          no-data-text="暂无调整项"
        >
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.memo }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center">
              <v-btn small color="primary" @click="deleteAdjustItem(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
        <!-- 下标操作栏 -->
        <v-layout class="total">
          <v-flex>
            <span>本月薪资总额:{{summoney}}</span>
          </v-flex>
        </v-layout>
        <v-layout style="padding:50px 10px 40px 0;">
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="saveAll()">保存</v-btn>
          <v-btn small color="primary" @click="cancelAll()">取消</v-btn>
          <v-btn small color="primary" @click="publishAll()">发布</v-btn>
        </v-layout>
      </v-flex>
    </div>
    <!-- snackBar -->
    <v-snackbar :color="color" top right v-model="snackbar">
      <v-icon color="white" mr-3 size="20">add_alert</v-icon>
      {{ info }}
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>
<script>
import { log } from "util";
import { setTimeout } from "timers";
export default {
  name: "addList",
  data: () => ({
    summoney:0,
    basicSum:0,
    addedSum : 0,
    adjustdata:0,
    reward:0,
    adddata:0,
    strdata:[],
    /////
    totalAmount:0,
    SalaryTotal:0,
    amountRule: [v => /^[0-9]*$/.test(v) || "请输入数字"],
    color: "info",
    info: "",
    snackbar: false,
    basicPayslip: [], //基本薪资
    addedPayslip: [], //每月加给
    rewardAdd: {},
    adjustAdd: {},
    tableName: "",
    department: "",
    employeeId: "",
    month: "",
    status: "",
    employee_salary_structure_ids: [],
    special_adjust: [],
    total: 0,
    dialog: false,
    rewardShow: false,
    adjustShow: false,
    headers: [
      {
        text: "薪资组成",
        sortable: false,
        value: "composition",
        align: "center"
      },
      {
        text: "等级",
        align: "center",
        value: "class",
        sortable: false,
        align: "center"
      },
      {
        text: "级别",
        align: "center",
        value: "level",
        sortable: false,
        align: "center"
      },
      {
        text: "金额",
        align: "center",
        value: "cash",
        sortable: false,
        align: "center"
      }
    ],
    headersencond: [
      {
        text: "薪资组成",
        sortable: false,
        value: "composition",
        align: "center"
      },
      { text: "等级", value: "class", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" }
    ],
    headerthird: [
      {
        text: "绩效迄止日期",
        sortable: false,
        value: "startEnd" ,
        align: "center"
      },
      { text: "绩效金额", value: "cash", sortable: false, align: "center" },
      {
        text: "绩效计算日期",
        value: "calculate",
        sortable: false,
        align: "center"
      },
    ],
    dessertthird: [],
    headerfourth: [
      { text: "所属周期", value: "year", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" },
    ],
    dessertfourth: [],
    headerfifth: [
      { text: "分红类型", sortable: false, value: "class", align: "center" },
      { text: "所属周期", value: "year", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" },
    ],
    dessertfifth: [],
    headersixth: [
      { text: "内容", align: "center", sortable: false, value: "contain" },
      { text: "金额", align: "center", sortable: false, value: "outTime" },
      {
        text: "操作",
        align: "center",
        value: "operation",
        width: "360px",
        sortable: false
      }
    ],
    dessertsixth: [],
    headerseventh: [
      { text: "内容", align: "center", sortable: false, value: "contain" },
      { text: "金额", align: "center", sortable: false, value: "outTime" },
      { text: "操作", align: "center", sortable: false }
    ],
    dessertseventh: [],
    editedItem: [],
    editedIndex: -1,
    editedAdjustItem: [],
    defaultItem: {}
  }),
  mounted() {
    this.tableName = this.$route.query.nameCode;
    this.employeeId = this.$route.query.employeeId;
    this.month = this.$route.query.monthCode;
    this.department = this.$route.query.departmentCode;
    this.status = this.$route.query.statusCode;
    this.employee_salary_structure_ids = this.$route.query.employee_salary_structure_ids;
    this.getPayslipDetail();
    
  },
  methods: {
    getPayslipDetail() {
      // 获取某个员工的基本薪资与每月加给
        this.$axios.get("/api/salaryList/payslipDetailAdd", {
          params: {
            create_date: this.month,
            _id: this.employeeId
          }
        })
        .then(res => {
          if(res.data.status == "200"){
            this.strdata=res.data.result
            
            res.data.result.forEach(element => {
                if (element.category_type == "基本薪资") {
                  this.basicPayslip.push(element);
                } else {
                  this.addedPayslip.push(element);
                }
              this.SalaryTotal+=element.amount
              this.go(this.totalAmount);         

              });
          }else if(res.data.status == "500"){
            this.snackbar = true;
            this.color = "error";
            this.info = "获取列表失败！";
          }         
        });
        // 获取传入的员工的绩效奖金
        this.$axios.get("/api/salaryList/payslipDetailAchievementbonus", {
          params: {
            create_date: this.month,
            _id: this.employeeId
          }
        })
        .then(res => {
          if(res.data.status == "200"){
            for (const iterator of res.data.result) {
              if(iterator.bonus_type == "绩效"){
                this.dessertthird.push(iterator)
              }else if(iterator.bonus_type == "双薪"){
                this.dessertfourth.push(iterator)
              }else if(iterator.bonus_type == "一般分红" || iterator.bonus_type == "股权分红"){
                this.dessertfifth.push(iterator)
              }
              this.totalAmount += iterator.amount
            }   
            this.go(this.totalAmount);         
            
          }else if(res.data.status == "500"){
            this.snackbar = true;
            this.color = "error";
            this.info = "获取列表失败！";
          }
        })
    },
    addItem(item) {
      this.dialog = true;
      this.editIndex = this.dessertsixth.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.rewardShow = true;
      this.adjustShow = false;
    },
    addAdjustItem(item) {
      this.dialog = true;
      this.editIndex = this.dessertseventh.indexOf(item);
      this.editedAdjustItem = Object.assign({}, item);
      this.adjustShow = true;
      this.rewardShow = false;
    },
    deleteItem(item) {
      const index = this.dessertsixth.indexOf(item);
      confirm("你确定想要删除这个项目吗？") &&
        this.dessertsixth.splice(index, 1);
    },
    deleteAdjustItem(item) {
      const index = this.dessertseventh.indexOf(item);
      confirm("你确定想要删除这个项目吗？") &&
        this.dessertseventh.splice(index, 1);
    },
    //嘉奖弹框点击创建
    saveReward() {
      this.rewardAdd = this.editedItem;
      this.rewardAdd.adjust_type = "嘉奖";
      this.dessertsixth.push(this.rewardAdd);
      this.dialog = false;
    },
    //调整弹框点击创建
    saveAdjust() {
      this.adjustAdd = this.editedAdjustItem;
      this.adjustAdd.adjust_type = "调整";
      this.dessertseventh.push(this.adjustAdd);
      this.dialog = false;
    },
    //保存
    saveAll() {
      this.status = "草稿";
      this.special_adjust = [...this.dessertsixth, ...this.dessertseventh];
      this.$axios
        .post("/api/salaryList/createPayslipAdd", {
          employee_id: this.employeeId,
          status: this.status,
          create_date: this.month,
          employee_salary_structure_ids: this.employee_salary_structure_ids,
          special_adjust: this.special_adjust
        })
        .then(res => {
          switch (res.data.status) {
            case 200:
              this.snackbar = true;
              this.color = "info";
              this.info = "保存成功！";
              setTimeout(() => {
                this.$router.go(-1);
              }, 2000);
              break;
            case 500:
              this.snackbar = true;
              this.color = "error";
              this.info = "保存失败！";
            default:
              break;
          }
        });
    },
    cancelAll() {
      this.$router.go(-1);
    },
    //发布
    publishAll() {
      this.status = "待支付";
      this.special_adjust = [...this.dessertsixth, ...this.dessertseventh];
      this.$axios
        .post("/api/salaryList/createPayslipAdd", {
          employee_id: this.employeeId,
          status: this.status,
          create_date: this.month,
          employee_salary_structure_ids: this.employee_salary_structure_ids,
          special_adjust: this.special_adjust
        })
        .then(res => {
          switch (res.data.status) {
            case 200:
              this.snackbar = true;
              this.color = "info";
              this.info = "发布成功！";
              setTimeout(() => {
                this.$router.go(-1);
              }, 2000);
              break;
            case 500:
              this.snackbar = true;
              this.color = "error";
              this.info = "发布失败！";
            default:
              break;
          }
        });
    },
    go(totalAmount){
     this.addedSum=0
     this.basicSum=0
     this.strdata.forEach(item => {
                if (item.category_type == '基本薪资') {
                    this.basicSum += Number(item.amount)
                } else {
                    this.addedSum += Number(item.amount)
                }
      })
       this.summoney=(this.addedSum+ this.basicSum+ this. adddata+this.reward-this.adjustdata + Number(this.totalAmount)).toFixed(2)
   }
  },
  watch:{
     dessertsixth:function(newval,oldval){
      
      this.adddata=0
       if(newval.length>0){
         newval.forEach(item1=>{
           this. adddata += Number(item1.amount)

          })
       }
      this.go()
      return this.adddata
    },
      deep: true,
    dessertseventh:function(newval,oldval){
       this.adjustdata=0;
      this.reward=0;
      if(newval.length>0){
         newval.forEach(item1=>{
            if(item1.amount && item1.amount.indexOf("-")!==-1){
                  this. adjustdata+=Number(item1.amount.substr(1, item1.amount.length - 1)) 
               }else if(item1.amount) {
                this.reward += Number(item1.amount)
            }
          })
      }
      this.go()      
    }
  }
}
</script>
<style scoped>
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerList p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.headerTitle {
  text-align: center;
}
.headerTitle p {
  font-size: 30px;
}
.smallTitle p {
  font-size: 20px;
  margin-top: 10px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 30px;
}
.total {
  margin-top: 30px;
  text-align: right;
  margin-right: 50px;
}
.total span {
  font-size: 20px;
}
</style>

