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
            <td class="text-xs-center" v-if="show_edit">
              <v-btn color="info" dark @click="proInfo_edit(props.item)">编辑</v-btn>
            </td>
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
              <td v-if="already_sum.length==0">{{ already_sum.progress_cc_sum }}</td>
              <td v-else>0</td>
              <td >{{ props.item.complete_cc_point +  props.item.reward_cc_point}}</td>
              <td v-if="already_sum.length==0">{{ already_sum.complete_cc_sum }}</td>
              <td v-else>0</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>Management</td>
              <td>{{ props.item.progress_pm_point }}</td>
              <td v-if="already_sum.length==0">{{ already_sum.progress_pm_sum }}</td>
              <td v-else>0</td>
              <td>{{ props.item.complete_pm_point + props.item.reward_cc_point}}</td>
              <td v-if="already_sum.length==0">{{ already_sum.complete_pm_sum }}</td>
              <td v-else>0</td>
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
      <v-layout justify-center>
        <v-dialog v-model="dialog" persistent max-width="700">
          <v-card>
            <v-card-title class="row_title">编辑</v-card-title>
            <v-layout>
              <v-flex lg4 class="row_lab_sty">
                <v-subheader>项目名称</v-subheader>
              </v-flex>
              <v-flex xs6>
                <v-text-field v-model="pro_lineData.name"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex lg4 class="row_lab_sty">
                <v-subheader>项目经理</v-subheader>
              </v-flex>
              <v-flex xs6>
                <v-text-field v-model="pro_lineData.product.name" readonly="true"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex lg4 class="row_lab_sty">
                <v-subheader>项目等级</v-subheader>
              </v-flex>
              <v-flex xs6>
                <v-select :items="items" v-model="pro_lineData.level"></v-select>
              </v-flex>
            </v-layout>
            <v-card-actions class="row_btn">
              <v-btn color="info" dark @click="dialog = false" class="btn_sty">取消</v-btn>
              <v-btn color="info" dark @click="saveProject()" class="btn_sty">确定</v-btn>
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
export default {
  data() {
    return {
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      titleTip: "",
      color: "",
      dialog: false,
      show_edit: true,
      pro_lineData: {
        product:{}
      },
      record_lineData: {},
      headers_pro_info: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        {
          text: "功能",
          align: "center",
          value: "function",
          sortable: false
        }
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
      desserts: [],
      medal_data: [],
      already_sum: {},
      proMember_data: [],
      items: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]
    };
  },
  mounted() {
    // 编辑按钮
    if (this.$route.query) {
      this.show_edit = !this.$route.query.btn_edit;
      if (!this.show_edit) {
        this.headers_pro_info.pop();
      }
    }

    if (this.$route.query.id) {
      // 项目信息
      this.getProjectDetail();
      // 项目成员
      this.getProjectMember();
      // 勋章点数状态中PM发放的点数
      this.getPointSum();
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
    back_to_list() {
      this.$router.push({
        name: "项目列表"
      });
    },
    proInfo_edit(item) {
      this.dialog = true;
      // this.pro_lineData = item;
      this.pro_lineData = {
        level : item.level,
        manager: item.manager,
        members: item.members,
        name: item.name,
        number: item.number,
        product: item.product,
        score: item.score,
        status: item.status,
        _id: item._id
      }
    },
    saveProject() {
      this.dialog = false;
      let data = this.pro_lineData;
      let _id = this.pro_lineData._id;
      // 编辑项目信息
      this.$axios
        .put("/api/pmo/projectDetail", { data: data, _id })
        .then(res => {
          this.desserts[0].name = this.pro_lineData.name
          this.desserts[0].product.name = this.pro_lineData.product.name
          this.desserts[0].level = this.pro_lineData.level
          if (res.data.status == 400) {
            this.snackbar = true;
            this.color = "error";
            this.right = true;
            this.titleTip = "编辑失败";
          } else if (res.data.status == 200) {
            this.snackbar = true;
            this.color = "info";
            this.right = true;
            this.titleTip = "编辑成功";
          }
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