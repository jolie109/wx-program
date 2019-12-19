<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="items" label="请选择/输入员工姓名" v-model="name_selected" item-text="name" item-value="_id" ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2>
        <!-- 日期选择器 -->
        <v-menu
          v-if="name_selected!='全部'"
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
            <v-text-field v-model="date" label="请选择预计发放日期" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date" locale="zh-cn" @input="menu = false"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>部门员工薪资信息</p>
        <p>员工待发奖金档</p>
      </v-flex>
      <v-flex md12>
        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="desserts"
          :pagination.sync="pagination"
          select-all
          item-key="_id"
          class="elevation-1"
           no-data-text="没有查询到相关数据!"
        >
          <template v-slot:headers="props"  >
            <tr>
              <th v-for="header in props.headers" :key="header.text">{{ header.text }}</th>
            </tr>
          </template>
          <template v-slot:items="props">
              <tr>
              <td class="text-xs-center">{{ props.item.employee.name}}</td>
              <td class="text-xs-center">{{ props.item.department.name}}</td>
              <td class="text-xs-center">{{ props.item.bonus_type }}</td>
              <td class="text-xs-center">{{ props.item.amount}}</td>
              <td class="text-xs-center">{{ props.item.estimate_pay_date.substr(0,7) }}</td>
              <td class="text-xs-center">{{ props.item.status}}</td>
              <td class="text-xs-center">
                <v-btn small color="info" @click="checkClick(props.item)">查看</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </div>
  </v-container>
</template>
<script>
export default {
  data: () => ({
    name_selected: "",
    date: new Date().toISOString().substr(0, 10),
    menu: false,
    pagination: {
      sortBy: "employee.name"
    },
    selected: [],
    items: [],
    headers: [
      { text: "员工姓名", align: "center", sortable: false, value: "name" },
      {
        text: "所属部门",
        align: "center",
        value: "department",
        sortable: false
      },
      { text: "类型", align: "center", value: "type", sortable: false },
      { text: "金额", align: "center", value: "cash", sortable: false },
      { text: "预计发放日期", align: "center", value: "date", sortable: false },
      { text: "状态", align: "center", value: "status", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    desserts: []
  }),
  computed: {},
  created() {
    this.initialize();
    this.getBonusDeMoment();
  },
  watch: {
    selected: function(newval, oldval) {}
  },
  methods: {
    initialize() {},
    checkClick(item) {
      if (item.bonus_type == "双薪") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentDetail",
          query: {
            nameCode: item.employee.name,
            detail_data: item._id,
            display: "unshow"
          }
        });
      } else if (item.bonus_type == "绩效") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentPerfor",
          query: {
            nameCode: item.employee.name,
            detail_data: item._id,
            display: "unshow"
          }
        });
      } else if (item.bonus_type == "一般分红") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentShare",
          query: {
            nameCode: item.employee.name,
            detail_data: item._id,
            display: "unshow"
          }
        });
      } else if (item.bonus_type == "股权分红") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentShare",
          query: {
            detail_data: item._id,
            nameCode: item.employee.name,
            display: "unshow"
          }
        });
      }
    },
    getBonusDeMoment() {
      this.$axios
        .get("/api/salaryStructure/employeeShareInfo", {})
        .then(res => {
          this.desserts = res.data.result;
          for (let index = 0; index < res.data.result.length; index++) {
            this.items.push(res.data.result[index].employee);
          }
          this.items.unshift("全部");
        });
    },
    search() {
      if (this.name_selected == "全部") {
        this.getBonusDeMoment();
      } else {
        this.$axios
          .get("/api/salaryStructure/employeeShareSearch", {
            params: {
              name: this.name_selected,
              chooseMonth: this.date
            }
          })
          .then(res => {
            this.desserts = res.data.result;
          });
      }
    },
    toggleAll() {
      if (this.selected.length) {
        this.selected = [];
      } else {
        this.selected = this.desserts;
      }
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
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
