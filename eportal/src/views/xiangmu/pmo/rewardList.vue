<template>
  <div>
    <div>
      <div class="header">
        <span>项目信息</span>
      </div>
      <v-layout>
        <v-data-table :headers="headers_pro_info" :items="desserts" class="cont_tab" hide-actions>
          <template v-slot:items="props">
            <td>{{ props.item.number }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.status }}</td>
            <td>{{ props.item.product.name }}</td>
            <td>{{ props.item.level }}</td>
            <td>{{ props.item.score }}</td>
            <td>{{ parseInt(props.item.reward_cc_point) + parseInt(props.item.reward_pm_point)}}</td>
          </template>
        </v-data-table>
      </v-layout>
    </div>
    <div>
      <div class="header">
        <span>勋章点数状态</span>
      </div>
      <v-layout>
        <v-data-table
          :headers="headers_medal_status"
          :items="medal_data"
          class="cont_tab"
          hide-actions
        >
          <template v-slot:items="props">
            <tr>
              <td>Collaboration</td>
              <td>{{ props.item.progress_cc_point }}</td>
              <td>{{ already_sum.progress_cc_sum }}</td>
              <td>{{ props.item.complete_cc_point + props.item.reward_cc_point}}</td>
              <td>{{ already_sum.complete_cc_sum }}</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>Management</td>
              <td>{{ props.item.progress_pm_point }}</td>
              <td>{{ already_sum.progress_pm_sum }}</td>
              <td>{{ props.item.complete_pm_point + props.item.reward_cc_point}}</td>
              <td>{{ already_sum.complete_pm_sum }}</td>
              <td>勋章管理委员会</td>
            </tr>
          </template>
        </v-data-table>
      </v-layout>
    </div>
    <div>
      <div class="header">
        <span>项目成员</span>
      </div>
      <v-layout>
        <v-data-table :headers="headers_pro_member" :items="proMember_data" class="cont_tab">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.email }}</td>
          </template>
        </v-data-table>
      </v-layout>
    </div>
    <div>
      <div class="header">
        <span>点数发放记录</span>
      </div>
      <v-layout>
        <v-data-table :headers="headers_issue_record" :items="issRecord_data" class="cont_tab">
          <template v-slot:items="props">
             <td>{{ props.item.issue_date }}</td>
            <td>{{ props.item.employee.name }}</td>
            <td>{{ props.item.point_type }}</td>
            <td>{{ props.item.issue_stage }}</td>
            <td>{{ props.item.issue_owner }}</td>
            <td>{{ props.item.point }}</td>
          </template>
        </v-data-table>
      </v-layout>
    </div>
    <div class="back">
      <v-btn color="info" dark class="back_btn" @click="back_to_list()">返回</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pro_lineData: {},
      record_lineData: {},
      headers_pro_info: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        { text: "结案分数", value: "score", sortable: false },
        { text: "奖励点数", sortable: false }
      ],
      headers_medal_status: [
        { text: "勋章类别", value: "category", sortable: false },
        {
          text: "可发放总额-执行中",
          value: "canIssuePerform",
          sortable: false
        },
        {
          text: "已发放总额-执行中",
          value: "alreadyIssuePerform",
          sortable: false
        },
        { text: "可发放总额-结案", value: "canIssueCase", sortable: false },
        { text: "已发放总额-结案", value: "alreadyIssueCase", sortable: false },
        { text: "发放角色", value: "issueRole", sortable: false }
      ],
      headers_pro_member: [
        { text: "用户名", value: "username", sortable: false },
        { text: "电子邮件信箱", value: "email", sortable: false }
      ],
      headers_issue_record: [
        { text: "发放日期", value: "issueDate", sortable: false },
        { text: "用户名", value: "username", sortable: false },
        { text: "勋章类别", value: "category", sortable: false },
        { text: "发放点数时点", value: "issueTimePoint", sortable: false },
        { text: "项目单位", value: "issueMan", sortable: false },
        { text: "发放点数额度", value: "issueLimit", sortable: false }
      ],
      desserts: [],
      medal_data: [],
      already_sum: {},
      proMember_data: [],
      issRecord_data: []
    };
  },
  mounted() {
    if (this.$route.query.id) {
      // 项目信息
      this.getProjectDetail();
      // 项目成员
      this.getProjectMember();
      // 勋章点数状态中PM发放的点数
      this.getPointSum();
      // 点数发放记录
      this.getTables_log();
    }
  },
  methods: {
    // 项目信息
    getProjectDetail() {
      this.$axios
        .get("/api/pmo/projectListDetail", {
          params: {
            _id: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result;
            this.medal_data = res.data.result
          }
        });
    },
    // 项目成员
    getProjectMember() {
      this.$axios
        .get("/api/pmo/project_employee", {
          params: {
            _id: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.proMember_data = res.data.result;
          }
        });
    },
    // 勋章点数状态中PM发放的点数
    getPointSum() {
      this.$axios
        .get("/api/projectManagement/pointSum", {
          params: {
            index: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.already_sum = res.data.result;
          }
        });
    },
    // 点数发放记录
    getTables_log() {
      this.$axios
        .get("/api/projectManagement/checkout_logs", {
          params: {
            index: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.issRecord_data = res.data.result;
          }
        });
    },
    back_to_list() {
      this.$router.push({
        name: "奖励项目"
      });
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
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.back {
  background: pink;
  position: relative;
}
.back_btn {
  position: absolute;
  top: 10px;
  right: 46px;
}
</style>