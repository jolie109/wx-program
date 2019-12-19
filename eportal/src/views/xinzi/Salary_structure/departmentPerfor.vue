<template>
  <v-container fluid grid-list-xl>
    <div class="bg">
      <v-layout class="topTitle">
        <v-flex md12>
          <span>{{tableName}}待发奖金内容</span>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md4>
          <span>绩效奖金</span>
        </v-flex>
      </v-layout>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period}}</td>
            <td class="text-xs-center">{{ props.item.amount}}</td>
            <td class="text-xs-center" v-if="show_edit">
              <v-btn small color="info" @click="editItem(props.item)">编辑</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card justify-center>
          <v-card-title>
            <v-flex class="headline" md4 offset-md1>编辑内容</v-flex>
          </v-card-title>
          <v-card-text>
            <v-layout align-center ml-4>
              <v-flex xs12 sm6 md4>
                <v-subheader>绩效金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field
                  placeholder="请输入数字"
                  v-model="editedItem.amount"
                  @change="afterAmount(editedItem.amount)"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout align-center ml-4>
              <v-flex xs12 sm6 md4>
                <v-subheader>绩效金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field :disabled="disabled" label="修改前" v-model="origin_amount"></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close()">取消</v-btn>
            <v-btn color="info" flat @click="saveEdit()" :disabled="btn_submit">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-layout class="returnback" v-if="show_btn_2">
        <v-flex md12>
          <v-btn small color="info" @click="Hrcancel()">取消</v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn small color="info" @click="audit()">审核</v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn small color="info" @click="toBack()">退回</v-btn>
        </v-flex>
      </v-layout>
      <div v-if="show_btn_1">
        <v-layout class="returnback">
          <v-flex md12>
            <v-btn small color="info" @click="cancel()">取消</v-btn>
          </v-flex>
          <v-flex md1>
            <v-btn small color="info" @click="confirmItem()">确认</v-btn>
          </v-flex>
        </v-layout>
      </div>
      <v-layout class="returnback" v-if="show_btn_3">
        <v-flex>
          <v-btn small color="info" @click="goback()">取消</v-btn>
        </v-flex>
      </v-layout>
      <!-- 弹框 -->
      <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
        <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
        <div>{{titleTip}}</div>
        <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
      </v-snackbar>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "departmentPerfor",
  data: () => ({
    tableName: "",
    origin_amount: "",
    dialog: false,
    disabled: false,
    tip: "",
    // /弹框信息
    top: true,
    right: false,
    snackbar: false,
    titleTip: "",
    color: "",
    ok: null,
    topAmount: 0,
    bottomAmount: 0,
    btn_submit: false,
    editedItem: {
      _id: null,
      amount: null
    },
    editedIndex: -1,
    defaultItem: {},
    headers: [
      {
        text: "绩效所属周期",
        align: "center",
        value: "startDate",
        sortable: false
      },
      { text: "绩效金额", align: "center", value: "amount", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    desserts: [],
    show_edit: true,
    show_btn_1: true,
    show_btn_2: false,
    show_btn_3: false,
    departmentid: ""
  }),

  computed: {},
  mounted() {
    this.initialize();
    this.getBonusDepartPerfor();
  },
  methods: {
    initialize() {
      this.tableName = this.$route.query.nameCode;
      if (this.$route.query.auditconfirm == "show") {
        this.show_edit = true;
        this.show_btn_1 = true;
      } else if (this.$route.query.auditconfirm == "unshow") {
        this.show_edit = false;
        this.headers.pop();
        this.show_btn_1 = false;
        this.show_btn_2 = true;
      } else if (this.$route.query.display == "unshow") {
        this.show_edit = false;
        this.headers.pop();
        this.show_btn_1 = false;
        this.show_btn_3 = true;
      }
    },
    getBonusDepartPerfor() {
      // 绩效 详情页
      var employee_id = this.$route.query.employee_id;
      var bonus_type = this.$route.query.typeCode;
      var period = this.$route.query.period;
      this.$axios
        .get("/api/salaryStructure/bonusDetail", {
          params: {
            _id: this.$route.query.detail_data
          }
        })
        .then(res => {
          this.desserts = res.data.result;
          this.curremployeeid = this.desserts[0].employee_id;
          this.editedItem.amount = this.desserts[0].amount;
          this.curramount = this.desserts[0].amount;
          this.origin_amount = this.desserts[0].origin_amount;
          this.editedItem._id = this.desserts[0]._id;
          this.departmentid = this.desserts[0].department_id;
          this.topAmount =
            this.desserts[0].origin_amount +
            this.desserts[0].origin_amount * 0.2;
          this.bottomAmount =
            this.desserts[0].origin_amount -
            this.desserts[0].origin_amount * 0.2;
        });
    },
    afterAmount(a) {
      this.a = this.editedItem.amount;
      if (a > this.bottomAmount && a < this.topAmount) {
        this.$axios
          .get("/api/salaryStructure/bonusTypeAmount", {
            params: {
              period: this.desserts[0].period
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              res.data.result.forEach(item => {
                if (item._id.department_id == this.departmentid) {
                  this.departmentinfo = item; //该部门的数据，是一个对象
                }
              });
              this.departperformanceAmount =
                +(this.departmentinfo.departProjectBonus + this.departmentinfo.departPerformanceBonus).toFixed(2);
              this.$axios
                .get("/api/salaryStructure/beyondDepartAmount", {
                  params: {
                    period: this.desserts[0].period,
                    bonus_type: this.desserts[0].bonus_type,
                    department_id: this.desserts[0].department_id
                  }
                })
                .then(res => {
                   this.departAllAmount=0
                  res.data.result.forEach(item=>{
                    if((item._id.department_id).toString()==this.departmentid){
                     this. departAllAmount = item.departAllAmount;
                    }
                  })
                  let onecorrect=(Number(a) - this.curramount)//输入金额的差值
                  let afterdepartAllAmount=this.departAllAmount+onecorrect//调整后整个部门的合计
                  let adjustamount=afterdepartAllAmount-this.departperformanceAmount //部门调整前后的差值
                  if (
                  this.departperformanceAmount<afterdepartAllAmount
                  ) {
                    this.snackbar = true
                    this.color = "error"
                    this.right = true
                    this.titleTip = "修改奖金金额应小于部门奖金总金额,已超出"+adjustamount
                     this.btn_submit = true
                  } else {
                    this.btn_submit = false;
                    this.ok = 1;
                    this.snackbar = false
                  }
                });
            }
          });
      } else {
        (this.snackbar = true),
          (this.color = "error"),
          (this.right = true),
          (this.titleTip =
            "输入分红金额须在" +
            this.bottomAmount.toFixed(2) +
            " ~ " +
            this.topAmount.toFixed(2) +
            "之间");
        this.btn_submit = true;
        this.ok = null;
      }
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    editItem(item) {
      this.dialog = true;
      this.editedIndex = this.desserts.indexOf(item);
      this.disabled = true;
    },
    saveEdit() {
      // 判断显示发放绩效
      if (this.ok == 1) {
        this.dialog = false;
        this.$axios
          .put("/api/salaryStructure/updateAmount", {
            _id: this.editedItem._id,
            amount: this.editedItem.amount
          })
          .then(res => {
            this.getBonusDepartPerfor();
            (this.snackbar = true),
              (this.color = "info"),
              (this.right = true),
              (this.titleTip = "编辑成功！");
          });
      } else {
      }
    },
    Hrcancel() {
      this.$router.push({
        path: "/xinzi/Salary_structure/deMoment"
      });
    },
    // 退回按钮
    toBack() {
      this.desserts.forEach(i => {
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: i._id,
            status: "草稿"
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/deMoment"
            });
          });
      });
    },
    // 审核按钮
    audit() {
      this.desserts.forEach(i => {
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: i._id,
            status: "核准"
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/deMoment"
            });
          });
      });
    },
    cancel() {
      this.$router.push({
        path: "/xinzi/Salary_structure/departmentMoment"
      });
    },
    confirmItem() {
      this.desserts.forEach(i => {
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: i._id,
            status: "确认"
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/departmentMoment"
            });
          });
      });
    },
    goback() {
      this.$router.push({
        path: "/xinzi/Salary_structure/hrDepartmoment"
      });
    }
  },
  watch: {
    btn_submit: function(newvsl, old) {
      return console.log(newvsl);
    }
  }
};
</script>
<style scoped>
.topTitle {
  text-align: center;
  font-size: 25px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
}
.returnback {
  text-align: right;
  padding-right: 40px;
  padding-top: 40px;
}
.returnback span {
  cursor: pointer;
}
</style>
