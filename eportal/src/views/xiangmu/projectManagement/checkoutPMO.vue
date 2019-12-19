<template>
  <div class="container">
    <v-flex md12 d-flex>
      <div class="table_title">项目内容</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <table v-for="(items,i) in desserts_content" :key="i" class="table1">
          <tr class="th1">
            <td style="width:25%;">项目编号</td>
            <td>{{items.number}}</td>
          </tr>
          <tr>
            <td>项目名称</td>
            <td>{{items.name}}</td>
          </tr>
          <tr>
            <td>项目说明</td>
            <td>{{items.desc}}</td>
          </tr>
          <tr>
            <td>预计结案日期</td>
            <td>{{items.expect_close_date}}</td>
          </tr>
          <tr>
            <td>项目单位</td>
            <td>{{items.unit}}</td>
          </tr>
          <tr>
            <td>项目经理</td>
            <td>{{items.employee.name}}</td>
          </tr>
          <tr>
            <td>项目等级</td>
            <td>{{items.level}}</td>
          </tr>
          <tr>
            <td>结案分数</td>
            <td>{{items.score}}</td>
          </tr>
          <tr>
            <td>点数上限</td>
            <td>{{items.max_point}}</td>
          </tr>
          <tr>
            <td>项目状态</td>
            <td>{{items.status}}</td>
          </tr>
          <tr style="height:10px;">
            <td></td>
          </tr>
        </table>
      </div>
    </v-layout>
    <v-flex md12 d-flex>
      <div class="table_title">项目成员</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="headers_member" :items="desserts_member" class="elevation-1">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.email }}</td>
          </template>
        </v-data-table>
      </div>
    </v-layout>
    <v-layout style="padding:50px 10px 40px 0;">
      <v-spacer></v-spacer>
      <v-btn small color="primary" @click="goBack()">返回</v-btn>
    </v-layout>
    <v-snackbar color="error" top right :timeout="timeout" v-model="snackbar0">
      <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
      <div>{{error}}</div>
      <v-icon color="white" size="16" @click="snackbar0 = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  // name: "myproject/checkoutPMO",
  data() {
    return {
      snackbar0: false,
      timeout: 6000,
      error: "",
      desserts_content: [],
      headers_medal: [
        {
          text: "勋章类别",
          align: "left",
          sortable: false
        },
        {
          text: "可发放总额-执行中",
          align: "left",
          sortable: false
        },
        {
          text: "已发放总额-执行中",
          align: "left",
          sortable: false
        },
        {
          text: "可发放总额-结案",
          align: "left",
          sortable: false
        },
        {
          text: "已发放总额-结案",
          align: "left",
          sortable: false
        },
        { text: "发放角色", align: "left", sortable: false }
      ],
      desserts_medal: [
      ],
      headers_member: [
        { text: "用户名", align: "left", sortable: false },
        { text: "电子邮件信箱", align: "left", sortable: false }
      ],
      desserts_member: [
      ]
    };
  },
  methods: {
    getTables_project() {
      this.$axios
        .get("/api/projectManagement/checkout_project", {
          params: {
            index: this.index
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts_content = res.data.result;
            this.desserts_medal = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "获取项目内容和勋章点数状态数据失败。"
            this.snackbar0 = true;
          }
        });
    },
    getTables_member() {
      this.$axios
        .get("/api/projectManagement/checkout_member", {
          params: {
            index: this.index,
          }
        })
        .then(res => {
          if (res.data.status == "200") { 
            this.desserts_member = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "获取项目成员数据失败。"
            this.snackbar0 = true;
          }
        });
    },
    goBack(){
      this.$router.go(-1)
    }
  },
  mounted(){
    this.index = this.$route.query.index;
    this.getTables_project();
    this.getTables_member();
  }
};
</script>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
}
.table_title {
  background: #e0e1e2;
  font-family: PingFangSC-Regular;
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  color: #333300;
  height: 50px;
  margin-top: 42px;
}
.table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.table1 {
  width: 100%;
  border-collapse: collapse; 
}
.table1  tr {
  text-indent: 25px;
  line-height: 30px;
  border-bottom: 1px solid #E0E1E2;
}
.th1 {
  font-weight: bold;
}
</style>