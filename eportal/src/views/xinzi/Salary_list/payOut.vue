<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete
          :items="unpaidEmployees"
          label="请选择/输入员工"
          v-model="name_chosen"
          no-data-text="无结果"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 ml-2>
        <!-- 日期选择器 -->
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="100px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker
            type="month"
            v-model="date"
            @input="menu = false"
            locale="zh-cn"
            aria-placeholder="全部"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="primary" @click="searchUnpaidPayslip">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>员工薪资发放</p>
      </v-flex>
      <v-flex md12>
        <v-data-table
          :headers="headers"
          :items="desserts"
          class="elevation-1"
          no-data-text="本月暂无未支付薪资单"
        >
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department.name }}</td>
            <td>{{ props.item.salarySum.basicSum }}</td>
            <td>{{ props.item.salarySum.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.salarySum.salarySum}}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td>
              <v-btn small color="primary" class="btn_pay" @click="payclick(props.item)">支付</v-btn>
            </td>
          </template>
        </v-data-table>
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
export default {
  name: "employees",
  data: () => ({
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    headers: [
      {
        text: "员工姓名",
        sortable: false,
        width: 100,
        value: "name"
      },
      { text: "所在部门", value: "department", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "本月薪资", value: "monthCash", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", width: "100px", sortable: false }
    ],
    desserts: [],
    color: "",
    info: "",
    snackbar: false,
    unpaidEmployees: [],
    name_chosen: ""
  }),

  created() {
    this.getAllUnpaidPayslip();
  },
  methods: {
    getAllUnpaidPayslip() {
      this.$axios
        .get("/api/salaryList/allUnpaidPayslip", {
          params: {
            create_date: this.date,
            status: "待支付"
          }
        })
        .then(res => {
          switch (res.data.status) {
            case 200:
              this.unpaidEmployees = [];
              this.desserts = res.data.result;
              this.desserts.forEach(element => {
                this.unpaidEmployees.push(element.name);
              });
              this.unpaidEmployees.unshift("全部");
              break;
            case 500:
              this.snackbar = true;
              this.color = "error";
              this.info = "获取员工数据失败！";
            default:
              break;
          }
        });
    },
    searchUnpaidPayslip() {
      if (this.name_chosen && this.name_chosen !== "全部") {
        this.$axios
          .get("/api/salaryList/unpaidPayslipByNameAndMonth", {
            params: {
              name: this.name_chosen,
              create_date: this.date,
              status: "待支付"
            }
          })
          .then(res => {
            switch (res.data.status) {
              case 200:
                this.desserts = res.data.result;
                // this.unpaidEmployees = [];
                // this.desserts.forEach(element => {
                //   this.unpaidEmployees.push(element.name);
                // });
                // this.name_chosen = "";
                // this.unpaidEmployees.unshift("全部");
                break;
              case 500:
                this.snackbar = true;
                this.color = "error";
                this.info = "搜索失败！";
              default:
                break;
            }
          });
      } else {
        this.getAllUnpaidPayslip();
      }
    },
    payclick(item) {
      this.$axios
        .put("/api/salaryList/payslipStatus", {
          payslip_id: item.monthly_payslip._id,
          status: "已支付"
        })
        .then(res => {
          this.getAllUnpaidPayslip()
          switch (res.data.result) {
            case 200:
              this.snackbar = true;
              this.color = "info";
              this.info = "支付成功！";
              this.searchUnpaidPayslip();
              break;
            case 500:
              this.snackbar = true;
              this.color = "error";
              this.info = "支付失败！";
            default:
              break;
          }
        });
    }
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.search {
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
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
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
}
</style>
