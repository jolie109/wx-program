<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md2 d-flex>
          <v-autocomplete
            label="请输入员工姓名"
            :items="components"
            item-text="name"
            item-value="_id"
            v-model="selected"
          ></v-autocomplete>
        </v-flex>
        <v-flex md1>
          <v-btn small round color="primary" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classifyBg">
              <v-flex class="classifyBgFlex">
                <p>项目查询</p>
                <p>个人点数统计</p>
              </v-flex>
              <v-data-table
                :headers="headers"
                :items="desserts"
                class="elevation-1"
                no-data-text="该员工暂无点数信息。"
              >
                <template v-slot:items="props">
                  <td>{{ props.item.name }}</td>
                  <td>{{( props.item.issue_date ).substr(0,4)}}</td>
                  <td >{{ props.item.ccsumpoint?props.item.ccsumpoint:0}}</td>
                  <td>{{ props.item.managesumpoint?props.item.managesumpoint:0}}</td>
                  <td >{{ props.item.cclevel?props.item.cclevel:"static"}}</td>
                  <td >{{ props.item.managelevel?props.item.managelevel:"static"}}</td>
                </template>
              </v-data-table>
            </div>
          </v-flex>
        </v-layout>
      </div>
      <v-snackbar color="error" top right :timeout="timeout0" v-model="snackbar0">
        <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
        <div>{{error}}</div>
        <v-icon color="white" size="16" @click="snackbar0 = false">clear</v-icon>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "personalPoints",
  data() {
    return {
      snackbar0: false,
      timeout0: 6000,
      error: "",
      selected: "",
      statu: "",
      components: ["全部"],
      headers: [
        { text: "用户名", sortable: false },
        {
          text: "本年度",
          sortable: false
        },
        { text: "Collaboration", sortable: false },
        { text: "Management", sortable: false },
        { text: "Collaboration等级", sortable: false },
        { text: "Management等级", sortable: false }
      ],
      desserts: []
    };
  },
  methods: {
    getPersonalPoints() {
      this.$axios.get("/api/projectQueries/personalpoint", {}).then(res => {
        if (res.data.status == "200") {
          this.desserts = res.data.result;
        //   (this.desserts)
        }
      });
    },
    search() {
      if (this.selected == "全部") {
        this.getPersonalPoints()
      } else {
        //搜索功能
        (this.selected)
         let params={
           employeeId:this.selected
         }
       this.$axios.post("/api/projectQueries/searchpersonalpoint",params).then(res=>{
         this.desserts = res.data.result;
       }) 
      }
    },
    getMembers() {
      this.$axios
        .get("/api/projectManagement/checkout_members", {})
        .then(res => {
          this.members = res.data.result;
          if (res.data.status == "200") {
            for (const iterator of this.members) {
              this.components.push(iterator);
            }
          } else if (res.data.status == "500") {
            this.error = "员工列表获取失败。";
            this.snackbar0 = true;
          }
        });
    }
  },
  mounted() {
    this.getPersonalPoints();
    this.getMembers();
  }
};
</script>

<style scoped>
@import "../../../assets/css/classify.css";
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 160px;
}
.table {
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.td-btn {
  padding: 0px !important;
}
.classifyBgFlex p:nth-of-type(1) {
  padding-left: 12px;
}
.classifyBgFlex p:nth-of-type(2) {
  letter-spacing: 4px;
  padding-left: 12px;
}
</style>
