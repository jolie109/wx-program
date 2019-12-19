<template>
  <v-container fluid grid-list-xl>
    <v-layout class="search">
      <v-flex xs12 sm6 md2>
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker type="month" v-model="date" @input="menu = false" locale="zh-cn"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="primary" @click="searchPayslipByMonth">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>

    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>查看薪资单</p>
      </v-flex>
      <v-flex md12>
        <v-data-table
          :headers="headers"
          :items="desserts"
          class="elevation-1"
          no-data-text="本月暂无薪资单"
        >
          <template v-slot:items="props">
            <!-- <td>{{ props.item.create_date }}</td>
            <td>{{ props.item.department.name }}</td>
            <td>{{ props.item.entry_time }}</td>
            <td>{{ props.item.salarySum.basicSum }}</td>
            <td>{{ props.item.salarySum.addedSum }}</td>
            <td>{{ props.item.status }}</td>-->
            <!-- <td>
              <v-btn
                small
                color="primary"
                @click="editItem(props.item)"
              >{{props.item.monthly_payslip.status=="草稿"?"编辑":"查看"}}</v-btn>
            </td>-->
          </template>
        </v-data-table>
      </v-flex>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "employees",
  data: () => ({
    basesum: 0, //基本薪资总和
    addsum: 0, //每月加给总和
    adjustsum: 0, //特殊调整总和
    total: 0, //合计
    employeeid: "5d8866dcad02afb9906a4397",
    date: "",
    menu: false,
    headers: [
      {
        text: "薪资月份",
        sortable: false,
        width: 100,
        value: "create_date"
      },
      { text: "基本薪资", value: "department", sortable: false },
      { text: "每月加给", value: "date", sortable: false },
      { text: "特别调整", value: "cash", sortable: false },
      { text: "合计", value: "monthAdd", sortable: false },
      { text: "状态", value: "month", sortable: false },
      { text: "操作", align: "center", width: "100px", sortable: false }
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      department: "",
      month: "",
      status: ""
    },
    defaultItem: {
      name: "",
      department: "",
      month: "",
      status: ""
    }
  }),
  created() {
    this.getEmployeePayslip();
  },
  methods: {
    getEmployeePayslip() {
      this.$axios
        .get("/api/salaryList/employeeAllPasiply", {
          params: {
            employeeid: this.employeeid
          }
        })
        .then(res => {
          this.desserts = res.data.result;
          this.desserts.forEach(item2 => {
            if (item2.salarydata) {
              item2.salarydata.forEach(item => {
                if (item.category_type == "基本薪资") {
                  this.basesum += item.amount;
                } else if (item.category_type == "每月加给") {
                  this.addsum += item.amount;
                }
              });
            }
            if (item2.special_adjust) {
              let additem = 0;
              let reduceitem = 0;
              item2.special_adjust.forEach(item => {
                if (item.amount.indexOf("-") != -1) {

                  reduceitem += Number(item.amount.substr(1));
                } else {
                  additem += Number(item.amount);
                }
              });

              this.adjustsum = additem - reduceitem;
            }
          });
        });
    },
    searchPayslipByMonth() {
      this.getEmployeePayslip();
    },
    editItem(item) {
      this.$router.push({
        path: "/xinzi/Salary_list/checkList",
        query: {
          nameCode: item.name,
          departmentCode: item.department.name,
          monthCode: item.monthly_payslip.create_date,
          statusCode: item.monthly_payslip.status,
          employeeId: item._id,
          employee_salary_structure_ids: item.employee_salary_structure_ids
        }
      });
    }
  }
};
</script>
<style scoped>
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