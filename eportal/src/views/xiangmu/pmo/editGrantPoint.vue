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
            <td>{{ props.item.max_point }}</td>
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
              <td>{{ props.item.category_cc }}</td>
              <td>{{ props.item.progress_cc_point }}</td>
              <td>{{ props.item.al_progress_cc_point }}</td>
              <td>{{ props.item.complete_cc_point }}</td>
              <td>{{ props.item.al_complete_cc_point }}</td>
              <td>{{ props.item.issueRole_cc }}</td>
            </tr>
            <tr>
              <td>{{ props.item.category_pm }}</td>
              <td>{{ props.item.progress_pm_point }}</td>
              <td>{{ props.item.al_progress_pm_point }}</td>
              <td>{{ props.item.complete_pm_point }}</td>
              <!-- 已发放总额-结案 -->
              <td>{{ props.item.al_complete_pm_point }}</td>
              <td>{{ props.item.issueRole_pm }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-layout>
    </div>
    <div>
      <div class="header">
        <span>点数发放记录</span>
        <v-btn color="info" class="addbtn_sty" dark @click="show_add()" v-if="show_addPoint">发放点数</v-btn>
      </div>
      <v-layout>
        <v-data-table :headers="headers_issue_record" :items="record_data" class="cont_tab">
          <template v-slot:items="props">
            <td>{{ props.item.issue_date }}</td>
            <td>{{ props.item.cc_point }}</td>
            <td>{{ props.item.pm_point }}</td>
            <td>{{ props.item.stage }}</td>
            <td>{{ desserts[0].product.name }}</td>
            <td>{{ Number(props.item.cc_point) + Number( props.item.pm_point) }}</td>
          </template>
        </v-data-table>
      </v-layout>
    </div>
    <div>
      <v-layout justify-center>
        <v-dialog v-model="dialog" persistent max-width="700">
          <v-card>
            <v-card-title class="row_title">编辑</v-card-title>
            <v-layout>
              <v-flex lg4 class="row_lab_sty">
                <v-subheader>点数发放时点</v-subheader>
              </v-flex>
              <v-flex xs6>
                <v-select :items="items_stage" label="请选择时点" v-model="pro_lineData.stage"></v-select>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex lg4 class="row_lab_sty">
                <v-subheader>Collaboration</v-subheader>
              </v-flex>
              <v-flex xs6>
                <v-text-field v-model="pro_lineData.cc_point"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex lg4 class="row_lab_sty">
                <v-subheader>Management</v-subheader>
              </v-flex>
              <v-flex xs6>
                <v-text-field v-model="pro_lineData.pm_point"></v-text-field>
              </v-flex>
            </v-layout>
            <v-card-actions class="row_btn">
              <v-btn color="info" dark @click="dialog = false" class="btn_sty">取消</v-btn>
              <v-btn
                color="info"
                :disabled="btn_submit"
                @click="savePoint()"
                class="btn_sty"
              >确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </div>
     <!-- 弹框 -->
    <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
    <div class="back">
      <v-btn color="info" dark class="back_btn" @click="back_to_list()">返回</v-btn>
    </div>
  </div>
</template>

<script>
import { truncate } from "fs";
export default {
  data() {
    return {
      btn_submit: false,
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      titleTip: "",
      color: "",
      dialog: false,
      show_addPoint: true,
      pro_lineData: {
        stage: "",
        cc_point: null,
        pm_point: null,
        project_id: this.$route.query.id
      },
      judgementProgressPoint: 0,
      judgementCompletePoint: 0,
      headers_pro_info: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        { text: "点数上限", value: "max_point", sortable: false }
      ],
      headers_medal_status: [
        { text: "勋章类别", value: "category", sortable: false },
        { text: "可发放总额-执行中", value: "progress_point", sortable: false },
        {
          text: "已发放总额-执行中",
          value: "al_progress_point",
          sortable: false
        },
        { text: "可发放总额-结案", value: "complete_point", sortable: false },
        {
          text: "已发放总额-结案",
          value: "al_complete_point",
          sortable: false
        },
        { text: "发放角色", value: "issueRole", sortable: false }
      ],
      headers_issue_record: [
        { text: "发放日期", value: "issue_date", sortable: false },
        { text: "合作点数", value: "cc_point", sortable: false },
        { text: "管理点数", value: "pm_point", sortable: false },
        { text: "发放点数时点", value: "stage", sortable: false },
        { text: "发放人员", value: "manager", sortable: false },
        { text: "发放点数额度", sortable: false }
      ],
      medal_data: [
        {
          category_cc: "Collaboration",
          category_pm: "Management",
          issueRole_cc: "项目经理 勋章管理委员会",
          issueRole_pm: "勋章管理委员会",
          complete_cc_point: 0,
          complete_pm_point: 0,
          progress_cc_point: 0,
          progress_pm_point: 0,
          al_progress_cc_point: 0,
          al_progress_pm_point: 0,
          al_complete_cc_point: 0,
          al_complete_pm_point: 0
        }
      ],
      desserts: [],
      record_data: [],
      items_stage: []
    };
  },
  mounted() {
    if (this.$route.query.btn_edit) {
      // 编辑按钮
      this.show_addPoint = !this.$route.query.btn_edit;
    }
    if (this.$route.query.id) {
      // 项目信息
      this.getProjectList();
      // 从 后端读取 pm 的勋章点数状态
      this.getPMPoint();
    }
    // 点数发放记录列表
    this.getRecordList();
  },
  methods: {
    // 发放点数后从 后端读取 pmo 的已结案点数和奖励项目点数相加
    getsum() {
      
      this.medal_data[0].complete_cc_point += Number(
        this.desserts[0].reward_cc_point
      );
      this.medal_data[0].complete_pm_point += Number(
        this.desserts[0].reward_pm_point
      );
    },
    // 点数发放记录列表
    getRecordList() {
      this.$axios
        .get("/api/pmo/pmoPointProject", {
          params: {
            _id: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.record_data = res.data.result;
          }
        });
    },
    // 从 后端读取 pm 的勋章点数状态
    getPMPoint() {
      this.$axios
        .get("/api/pmo/pointUserLogs", {
          params: {
            project_id: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            var pm_data = res.data.result;
            for (const i of pm_data) {
              if (
                i.point_type == "Collaboration" &&
                i.issue_stage == "项目执行中"
              ) {
                this.medal_data[0].al_progress_cc_point += parseInt(i.point);
              } else if (
                i.point_type == "Management" &&
                i.issue_stage == "项目执行中"
              ) {
                this.medal_data[0].al_progress_pm_point += parseInt(i.point);
              } else if (
                i.point_type == "Collaboration" &&
                i.issue_stage == "已结案（成功）"
              ) {
                this.medal_data[0].al_complete_cc_point += parseInt(i.point);
              } else if (
                i.point_type == "Management" &&
                i.issue_stage == "已结案（成功）"
              ) {
                this.medal_data[0].al_complete_pm_point += parseInt(i.point);
              }
            }
          }
        });
    },
    // 项目信息
    getProjectList() {
      this.$axios
        .get("/api/pmo/projectListDetail", {
          params: {
            _id: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result;
          }
          // 勋章点数状态
          // 发放点数后从 后端读取 pmo 的勋章点数状态（项目执行中和已结案（成功）状态的）
          this.medal_data[0].progress_cc_point = this.desserts[0].progress_cc_point;
          this.medal_data[0].progress_pm_point = this.desserts[0].progress_pm_point;
          this.medal_data[0].complete_cc_point = this.desserts[0].complete_cc_point;
          this.medal_data[0].complete_pm_point = this.desserts[0].complete_pm_point;
          // 发放点数 的 点数发放时点 显示
          if (this.desserts[0].status == "项目执行中") {
            this.items_stage.push("项目执行中");
          } else if (
            this.desserts[0].status == "已结案（成功）" &&
            this.desserts[0].score >= "4.8"
          ) {
            this.items_stage.push("项目执行中", "已结案（成功）", "奖励项目");
            // 发放点数后从 后端读取 pmo 的已结案点数和奖励项目点数相加
            this.getsum();
          } else if (this.desserts[0].status == "已结案（成功）") {
            this.items_stage.push("项目执行中", "已结案（成功）");
          } else if (this.desserts[0].status == "已结案（失败）") {
            this.items_stage.push("项目执行中", "已结案（失败）");
          }
        });
    },
    back_to_list() {
      this.$router.push({
        name: "PMO发放点数"
      });
    },
    show_add() {
      this.dialog = true;
    },
    savePoint() {
      this.dialog = false;
      // 点数发放记录中的发放日期
      var nowDate = new Date().toISOString().substr(0, 10);
      var key = "issue_date";
      this.pro_lineData[key] = nowDate;
      // 点数发放记录中的发放人员
      var manager = this.desserts[0].manager;
      var key1 = "manager";
      this.pro_lineData[key1] = manager;
      // 发放点数后前端 暂时显示 在勋章点数状态
      if (this.pro_lineData.stage == "项目执行中") {
        this.medal_data[0].progress_cc_point = parseInt(
          this.pro_lineData.cc_point
        );
        this.medal_data[0].progress_pm_point = parseInt(
          this.pro_lineData.pm_point
        );
      } else if (this.pro_lineData.stage == "已结案（成功）") {
        this.medal_data[0].complete_cc_point = parseInt(
          this.pro_lineData.cc_point
        );
        this.medal_data[0].complete_pm_point = parseInt(
          this.pro_lineData.pm_point
        );
      } else if (this.pro_lineData.stage == "奖励项目") {
        this.medal_data[0].complete_cc_point += parseInt(
          this.pro_lineData.cc_point
        );
        this.medal_data[0].complete_pm_point += parseInt(
          this.pro_lineData.pm_point
        );
      } else if (this.pro_lineData.stage == "已结案（失败）") {
        this.medal_data[0].complete_cc_point = parseInt(
          this.pro_lineData.cc_point
        );
        this.medal_data[0].complete_pm_point = parseInt(
          this.pro_lineData.pm_point
        );
      }
      let data = this.pro_lineData;
      this.record_data.push(data);
      // 新增pmo点数发放记录存到project_list表和point_project表中对应的6个点数状态中
      this.$axios.post("/api/pmo/pmoPointProject", { data: data }).then(res => {
        this.getRecordList();
        // 清空发放点数弹框
        this.pro_lineData.stage = "";
        this.pro_lineData.cc_point = null;
        this.pro_lineData.pm_point = null;
        // 项目信息
        this.getProjectList();
        if (res.data.status == 400) {
            this.snackbar = true;
            this.color = "error";
            this.right = true;
            this.titleTip = "发放失败";
          } else if (res.data.status == 200) {
            this.snackbar = true;
            this.color = "info";
            this.right = true;
            this.titleTip = "发放成功";
          }
      });
    }
  },
  watch: {
    "pro_lineData.pm_point": {
      handler(newSubmit, oldSubmit) {
        if (this.pro_lineData.stage=="项目执行中" && this.pro_lineData.cc_point && newSubmit) {
          this.judgementProgressPoint = Number(this.pro_lineData.cc_point) + Number(this.pro_lineData.pm_point);
          localStorage.setItem('point_storage',this.judgementProgressPoint)
          if (this.judgementProgressPoint > this.desserts[0].max_point) {
            this.snackbar = true
            this.color = "error"
            this.right = true
            this.titleTip = "点数之和不能大于点数上限"
            this.btn_submit=true
          }else{
            this.btn_submit=false
          }
        }else if(this.pro_lineData.stage=="已结案（成功）" && this.pro_lineData.cc_point && newSubmit){
          this.judgementCompletePoint = Number(localStorage.getItem('point_storage'))  + Number(this.pro_lineData.cc_point) + Number(this.pro_lineData.pm_point);
          if(this.judgementCompletePoint > this.desserts[0].max_point) {
            this.snackbar = true
            this.color = "error"
            this.right = true
            this.titleTip = "点数之和不能大于点数上限"
            this.btn_submit=true
          }else{
            this.btn_submit=false
          }
        }else if(this.pro_lineData.stage=="已结案（失败）" && this.pro_lineData.cc_point && newSubmit){
          this.judgementCompletePoint = Number(localStorage.getItem('point_storage'))  + Number(this.pro_lineData.cc_point) + Number(this.pro_lineData.pm_point);
          if(this.judgementCompletePoint > this.desserts[0].max_point) {
            this.snackbar = true
            this.color = "error"
            this.right = true
            this.titleTip = "点数之和不能大于点数上限"
            this.btn_submit=true
          }else{
            this.btn_submit=false
          }
        }
      }
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
  position: relative;
}
.header span {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
}
.addbtn_sty {
  position: absolute;
  top: 5px;
  right: 0px;
}
.cont_tab {
  width: 100%;
  margin: 0 46px 0 26px;
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.row_title {
  font-family: PingFangSC-Regular;
  font-size: 40px;
  color: #2e2929;
  padding: 40px 0 0 50px;
}
.row_lab_sty {
  padding: 14px 0 16px 70px;
}
.row_btn {
  padding: 10px 0 40px 50%;
}
.btn_sty {
  margin-right: 50px;
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