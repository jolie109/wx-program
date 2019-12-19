<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-text-field label="请输入周期" v-model="period_seleted"></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout> -->
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>股票管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.remain_stock}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
  </v-container>
</template>
<script>
import { log } from "util";
export default {
  name: "stockManagement_employee",
  data: () => ({
    employee_id: "5d88672ead02afb9906a43a7",
    item_id: "",
    items: [],
    nameAdd: "",
    info: "",
    itemsName: [],
    dialog: false,
    editCard: false,
    deleteCard: false,
    editedItem: {
      _id: "",
      remain_stock: ""
    },
    editedIndex: -1,
    defaultItem: {},
    headers: [
      { text: "员工姓名", sortable: false, align: "center", value: "name" },
      {
        text: "剩余股票数",
        value: "remain_stock",
        align: "center",
        sortable: false
      },
      { text: "功能", align: "center", sortable: false }
    ],
    desserts: []
  }),

  created() {
    this.getEmployees();
  },
  methods: {
    getEmployees() {
      this.$axios
        .get("/api/salaryStructure/employeeStockPersonal", {
          params: {
            employee_id: this.employee_id
          }
        })
        .then(res => {
          this.desserts = res.data.result;
        });
    },

    close() {
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    checkClick(item) {
      this.$router.push({
        path: "/xinzi/Salary_structure/checkStock",
        query: {
          nameCode: item.name,
          remain_stockCode: item.remain_stock,
          _idCode: item._id,
          is_show: "unshow"
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
.deleteTitle {
  padding: 40px;
  font-size: 20px;
  display: inline-block;
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
