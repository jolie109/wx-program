<template>
  <v-container fluid grid-list-xl>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete
          :items="Employee_name"
          label="请选择/输入员工"
          v-model="name_chosen"
          no-data-text="无结果"
        ></v-autocomplete>
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
      <v-flex xs12 sm6 md1 ml-2>
        <v-btn color="primary" @click="searchPayslip">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2 ml-5>
        <v-btn color="primary" @click="createPayslipAll">批量生成薪资单</v-btn>
      </v-flex>
    </v-layout>

    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>生成薪资单</p>
      </v-flex>
      <v-flex md12>
        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="desserts"
          class="elevation-1"
          select-all
          item-key="name"
          no-data-text="本月暂无未生成薪资单"
        >
          <template v-slot:items="props">
            <td>
              <v-checkbox
                v-model="props.selected"
                primary
                hide-details
                v-show="props.item.status=='未生成'"
              ></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department.name }}</td>
            <td>{{ props.item.status }}</td>
            <td>
              <v-btn
                small
                color="primary"
                @click="editItem(props.item)"
                :disabled="props.item.status=='已生成'?true:false"
              >生成薪资单</v-btn>
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
import { log } from "util";
import { filter } from "minimatch";
export default {
  name: "create",
  data: () => ({
    selected: [],
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    modal: false,
    Employee_name: [],
    name_chosen: "",
    headers: [
      {
        text: "员工姓名",
        sortable: false,
        value: "name"
      },
      { text: "所在部门", value: "department", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", width: "100px", sortable: false }
    ],
    desserts: [], //所有员工薪资单
    color: "",
    info: "",
    snackbar: false,
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
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "新建项目" : "Edit Item";
    },
    created() {
      this.initialize();
    }
  },
  methods: {
    //获取全部员工的薪资单
    getEmployeeSalaryList() {
      this.$axios
        .get("/api/salaryList/employeePayslipInCreate", {
          params: {
            create_date: this.date
          }
        })
        .then(res => {
          switch (res.data.status) {
            case 200:
              this.desserts = res.data.result;
              //将所有姓名添加到数组中并加入“全部”字段
              for (let i = 0; i < res.data.result.length; i++) {
                this.Employee_name.push(res.data.result[i].name);
              }
              this.Employee_name.unshift("全部");
              break;
            case 500:
              this.snackbar = true;
              this.color = "error";
              this.info = "获取列表数据失败！";
            default:
              break;
          }
        });
    },
    searchPayslip() {
      if (this.name_chosen && this.name_chosen != "全部") {
        this.$axios
          .get("/api/salaryList/employeePayslipByNameAndMonthInCreate", {
            params: {
              name: this.name_chosen,
              create_date: this.date
            }
          })
          .then(res => {
            switch (res.data.status) {
              case 200:
                this.desserts = res.data.result;
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
        this.$axios
          .get("/api/salaryList/employeePayslipInCreate", {
            params: {
              create_date: this.date
            }
          })
          .then(res => {
            switch (res.data.status) {
              case 200:
                this.desserts = res.data.result;
                break;
              case 500:
                this.snackbar = true;
                this.color = "error";
                this.info = "搜索失败！";
              default:
                break;
            }
          });
      }
    },
    //批量生成薪资单
    createPayslipAll() {
      var notPayslips = this.selected.filter(function(element) {
        return element.status == "未生成";
      });
      this.$axios
        .post("/api/salaryList/createPayslipAll", {
          create_date: this.date,
          selected: notPayslips
        })
        .then(res => {
          switch (res.data.status) {
            case 200:
              this.selected = [];
              this.snackbar = true;
              this.color = "info";
              this.info = "批量生成薪资单成功！";
              this.searchPayslip();
              break;
            case 500:
              this.snackbar = true;
              this.color = "error";
              this.info = "批量生成薪资单失败！";
            default:
              break;
          }
              this.getEmployeeSalaryList();
        });
    },
    editItem(item) {
      this.$router.push({
        path: "/xinzi/Salary_list/addList",
        query: {
          nameCode: item.name,
          departmentCode: item.department.name,
          monthCode: this.date,
          statusCode: item.status,
          employeeId: item._id,
          employee_salary_structure_ids: item.employee_salary_structure_ids
        }
      });
    }
  },
  mounted: function() {
    this.getEmployeeSalaryList();
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
