<template>
  <div>
    <div class="header">
      <span>点数发放申请单</span>
    </div>
    <v-layout>
      <v-data-table :headers="headers" :items="desserts" class="cont_tab" hide-actions>
        <template v-slot:items="props">
          <td>{{ props.item.product1.name }}</td>
          <td>{{ props.item.product1.email }}</td>
          <td>{{ props.item.point_type }}</td>
          <td>{{ props.item.issue_stage }}</td>
          <td>{{ props.item.issue_owner }}</td>
          <td>{{ props.item.point }}</td>
        </template>
      </v-data-table>
    </v-layout>
    <v-layout wrap class="footer">
      <v-flex xs8 md6 lg4 >
        <p>本次申请发放点数合计：<span>{{total_point}}</span></p>
      </v-flex>
      <v-flex xs8 md6 lg4 btn>
           <v-btn color="info" dark @click="agree()" :disabled="status=='待审核'?false:true">同意</v-btn>
            <v-btn color="info" dark @click="disagree()"  :disabled="status=='待审核'?false:true">驳回</v-btn>
            <v-btn color="info" dark @click="goback()">返回</v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { constants } from 'crypto';
export default {
  data() {
    return {
      headers: [
        { text: "项目成员", value: "member", sortable: false },
        { text: "电子邮箱", value: "email", sortable: false },
        { text: "勋章类别", value: "category", sortable: false },
        { text: "发放点数时点", value: "issueTimePoint", sortable: false },
        { text: "项目单位", value: "company", sortable: false },
        { text: "发放点数额度", value: "issueLimit", sortable: false }
      ],
      desserts: [],
      total_point: 0,
      status:""
    };
  },
  created(){
    this.status=this.$route.query.status
  },
  methods: {
    //  发放点数申请单详情页
    getPointDetail(){
      this.$axios.get("/api/pmo/grantApply_pointUserLogs", {
          params: {
            _id: this.$route.query.id,
            point_log_id : this.$route.query.point_log_id
          }
        }).then(res => {
        if (res.data.status == "200") {
          this.desserts = res.data.result;
          
        } 
        for(const i of this.desserts){
          this.total_point += i.point 
        }
      })
    },
    // 同意/驳回后和PM端的交互
     agree(){
       let data_agree = {
         point_log_id : this.$route.query.point_log_id,
         status_agree : "同意"
       };
      //  同意之后修改point_user_log的status
       this.$axios
        .put("/api/pmo/grantApply_pointUserLogs", { data_agree })
        .then(res => {
        });
        //  同意之后修改point_log的status
        this.$axios
        .put("/api/pmo/grantApply_pointLogs", { data_agree })
        .then(res => {
        });

      this.$router.push({
        name: "发放点数申请单",
        params: {}
      });
    },
    disagree(){
      let data_agree = {
         point_log_id : this.$route.query.point_log_id,
         status_agree : "驳回"
       };

      this.$axios
        .put("/api/pmo/grantApply_pointUserLogs", { data_agree })
        .then(res => {
        });
        //  同意之后修改point_log的status
        this.$axios
        .put("/api/pmo/grantApply_pointLogs", { data_agree })
        .then(res => {
        });
      this.$router.push({
        name: "发放点数申请单",
        params: {}
      });
    },
    goback(){
      this.$router.push({
        name: "发放点数申请单",
        params: {}
      });
    }
  },
  mounted(){
     if(this.$route.query.id){
      //  发放点数申请单详情页
      this.getPointDetail()
    }
  }
};
</script>

<style scoped>
.header {
  margin: 38.7px 46px 0 26px;
  background: rgba(224, 225, 226, 0.28);
  height: 52px;
  text-align: center;
  padding-top: 12px;
}
.header span {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
}
.cont_tab {
  width: 100%;
  margin: 0 46px 0 26px;
  background: rgba(0, 0, 0, 0);
  box-shadow: 0px 0px 3px 1px #ccc;
}
.footer {
  margin: 0px 46px 0 26px;
  background: #ffffff;
  border: 1px solid #979797;
  box-shadow: 0px 1px 3px 1px #ccc;
  position: relative;
}
.footer p {
  font-family: PingFangSC-Regular;
  font-size: 16px;
  color: #000000;
  padding-top: 15px;
  padding-left: 12px;
}
.btn{
  position: absolute;
  top: 5px;
  right:10px;
}
</style>