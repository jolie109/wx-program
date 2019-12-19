<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="items" label="请选择" v-model="name_selected"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>部门员工待发奖金</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.department.name}}</td>
            <td class="text-xs-center">{{ props.item.bonuswait.estimate_pay_date}}</td>
            <td class="text-xs-center">{{ props.item.bonuswait.status}}</td>
            <td class="text-xs-center">{{ props.item.bonuswait.bonus_type}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
              <v-btn small color="info" @click="confirmItem(props.item)" :disabled="props.item.isclick==true">确认</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "departmentManagement",
  data: () => ({
    name_selected: "",
    items: [],
    headers: [
      { text: "员工姓名", align: "center", sortable: false },
      { text: "所属部门", align: "center", sortable: false },
      { text: "预计发放日期", align: "center", sortable: false },
      { text: "状态", align: "center", sortable: false },
      { text: "奖金类型", align: "center", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    desserts: [],
    isdisabled:true,
    employeeid:"5d8866dcad02afb9906a4397"
  }),

  computed: {},
  created() {
    this.getBonusDepartment();
  },
  methods: {
    getBonusDepartment() {
      this.$axios.get("/api/salaryStructure/departmentInfo", {
        params:{
          employeeid:this.employeeid
        }
      }).then(res => {
        if(res.data.status=='200'){
        var data_ = res.data.result;
        for (const i of data_) {
           let b={
              isclick:true
             }
          if (i.bonuswait) {
            if(i.bonuswait.status=="草稿"){
                b={
              isclick:false
             }
            }
            Object.assign(i,b)
            this.desserts.push(i);
            this.items.push(i.name);
          }
        }
        this.items.unshift("全部");
      }
      else if(res.data.status=='401'){
            alert(res.data.msg)
          }
    });
    },
    confirmItem(item) {
        const index = this.desserts.indexOf(item);
        this.desserts[index].isclick=true
     if( item.bonuswait.status=="草稿"){
         this.$axios
        .put("/api/salaryStructure/updateStatus", {
          _id: item.bonuswait._id,
          status: "确认"
        })
        .then(res => {
          item.bonuswait.status = "确认";
        });
    
     }
    },
    search() {
      if (this.name_selected =="全部") {
        this.getBonusDepartment();
      } else {
        this.$axios
          .get("/api/salaryStructure/departmentSearch", {
            params: { name: this.name_selected }
          })
          .then(res => {
            this.desserts = res.data.result;
          });
      }
    },
    checkClick(item) {
      if (item.bonuswait.bonus_type == "双薪") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentDetail",
          query: {
            nameCode: item.name,
            detail_data: item.bonuswait._id,
            auditconfirm: "show"
          }
        });
      } else if (item.bonuswait.bonus_type == "绩效") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentPerfor",
          query: {
            detail_data: item.bonuswait._id,
            nameCode: item.name,
            auditconfirm: "show"
          }
        });
      } else if (item.bonuswait.bonus_type == "一般分红") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentShare",
          query: {
            detail_data: item.bonuswait._id,
            nameCode: item.name,
            auditconfirm: "show"
          }
        });
      } else if (item.bonuswait.bonus_type == "股权分红") {
        this.$router.push({
          path: "/xinzi/Salary_structure/departmentShare",
          query: {
            detail_data: item.bonuswait._id,
            nameCode: item.name,
            auditconfirm: "show",
            show_edit_1: "unshow"
          }
        });
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
