<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete v-model="name_chosen" :items="employees" label="请选择/输入员工" no-data-text="无结果"></v-autocomplete>
      </v-flex>
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
        <v-btn color="primary" @click="searchDepartmentEmployeePayslip">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>部门员工薪资单</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1" no-data-text="本月暂无薪资单">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department.name }}</td>
            <td>{{ props.item.entry_time }}</td>
            <td>{{ props.item.salarySum.basicSum }}</td>
            <td>{{ props.item.salarySum.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td>
              <v-btn small color="primary" @click="checkItem(props.item)">查看</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "departmentList",
  data: () => ({
    "employeeId":"5d9ea51492f22a52921ab5a6",
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    employees: [],
    name_chosen: "",
    headers: [
      {
        text: "员工姓名",
        sortable: false,
        width: 100,
        value: "name"
      },
      { text: "所在部门", value: "department", sortable: false },
      { text: "入职日期", value: "date", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", width: "100px", sortable: false }
    ],
    desserts: [],
    editedIndex: -1,
    dialog: false,
    editedItem: {
      name: "",
      department: "",
      month: "",
      status: ""
    }
  }),
  mounted() {
    this.getDepartmentPayslips();
  },
  methods: {
    getDepartmentPayslips() {
      this.$axios
        .get("/api/salaryList/departmentPayslips", {
          params: {
            employeeId:this.employeeId,
            create_date: this.date
          }
        })
        .then(res => {
         if(res.data.status=='200'){
          this.desserts = res.data.result;
          res.data.result.forEach(element => {
            this.employees.push(element.name);
          });
            this.employees.unshift("全部");
          }else if(res.data.status=='401'){
            alert(res.data.msg)
          }

        });
    },
    searchDepartmentEmployeePayslip() {
      if (this.name_chosen && this.name_chosen !== "全部") {
        this.$axios
          .get("/api/salaryList/departmentEmployeePayslipByName", {
            params: {
              employeeId:this.employeeId,
              create_date: this.date,
              name: this.name_chosen
            }
          })
          .then(res => {
            this.desserts = res.data.result;
            res.data.result.forEach(element => {
              this.employees.push(element.name);
            });
            this.employees.unshift("全部");
          });
      } else {
        this.getDepartmentPayslips();
      }
    },
    checkItem(item) {
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
<style scoped>
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
