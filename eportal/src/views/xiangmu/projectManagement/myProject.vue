<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex md2 d-flex>
          <v-select :items="items" v-model="selected" label="请选择类别"></v-select>
        </v-flex>
        <v-flex md1>
          <v-btn small round color="primary" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <div v-show="!isJoin">
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="table_title">
              <v-flex class="table_titleFlex">
                <div class="text1">项目管理</div>
                <div class="text2">我的项目</div>
              </v-flex>
              <div class="table">
                <v-data-table :headers="headers" :items="desserts" class="elevation-1">
                  <template v-slot:items="props">
                    <td>{{ props.item.number}}</td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.expect_close_date }}</td>
                    <td>{{ props.item.employee.name}}</td>
                    <td>{{ props.item.status}}</td>
                    <td>{{ props.item.level}}</td>
                    <td class="text-xs-center">
                      <v-btn
                        small
                        color="primary"
                        @click="manage(props.item)"
                        v-show="props.item.status=='PMO设定完成' || props.item.status=='已结案（成功）' || props.item.status=='已结案（失败）' || props.item.status=='PM结案申请阶段'?false:true"
                      >管理</v-btn>
                      <v-btn
                        small
                        color="primary"
                        @click="end(props.item)"
                        v-show="props.item.status=='项目执行中'?true:false"
                      >结案申请</v-btn>
                      <v-btn
                        small
                        color="primary"
                        @click="managePMO(props.item)"
                        v-show="props.item.status=='PMO设定完成'?true:false"
                      >管理</v-btn>
                      <v-btn
                        small
                        color="primary"
                        @click="managePM(props.item)"
                        v-show="props.item.status=='PM结案申请阶段'?true:false"
                      >管理</v-btn>
                      <v-btn
                        small
                        color="primary"
                        @click="manageEnd(props.item)"
                        v-show="props.item.status=='已结案（成功）'|| props.item.status=='已结案（失败）' ?true:false"
                      >管理</v-btn>
                    </td>
                  </template>
                </v-data-table>
                <v-layout>
                  <v-dialog v-model="dialogEnd" persistent max-width="650">
                    <v-card>
                      <v-btn icon @click="dialogEnd = false" class="icon_close">
                        <v-icon>close</v-icon>
                      </v-btn>
                      <v-card-title class="headline" style="padding:50px 0 0 50px;">结案申请确认</v-card-title>
                      <v-card-text style="padding-left: 80px">
                        <p>您确认送出结案申请吗？</p>
                        <p>申请后「过程点数」将不能再进行发放动作，请确定该额度已发放完毕。</p>
                      </v-card-text>
                      <v-card-actions style="padding:0 40px 40px 0">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" flat @click="dialogEnd = false">取消</v-btn>
                        <v-btn color="primary" flat @click="confirmEnd()">确定</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-layout>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
      <div v-show="isJoin">
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="table_title">
              <v-flex class="table_titleFlex">
                <div class="text1">项目管理</div>
                <div class="text2">我的项目</div>
              </v-flex>
              <div class="table">
                <v-data-table :headers="headers" :items="desserts" class="elevation-1">
                  <template v-slot:items="props">
                    <td>{{ props.item.number}}</td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.expect_close_date }}</td>
                    <td>{{ props.item.employee.name}}</td>
                    <td>{{ props.item.status}}</td>
                    <td>{{ props.item.level}}</td>
                    <td class="text-xs-center">
                      <v-btn small color="primary" @click="lookFunction(props.item)">查看</v-btn>
                    </td>
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
      <v-snackbar color="info" top right :timeout="timeout" v-model="snackbar">
        <v-icon color="white" class="mr-3" size="20">check_circle</v-icon>
        <div>{{info}}</div>
        <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
      </v-snackbar>
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
  name: "myProject",
  data() {
    return {
      //此userId注释内容为模拟登录状态，对应用户身份，显示我管理的和我参与的内容：（对应数据库里的employees表的_id）
      userId: "5d6a657bedbd665dc012ce35",//paul
      // userId: "5d6db5a992f5bdedf5bf80d8",//张朋
      selected: "我管理的项目",
      isJoin: false,
      statu: "",
      dialogEnd: false,
      index: "",
      info: "",
      error: "",
      timeout: 3000,
      timeout0: 6000,
      snackbar: false,
      snackbar0: false,
      items: ["我管理的项目", "我参与的项目"],
      headers: [
        { text: "项目编号",value: "number", align: "left" },
        { text: "项目名称" ,value: "name"},
        { text: "预计结案日期" ,value: "date"},
        { text: "项目经理" ,value: "manager"},
        { text: "项目状态" ,value: "status"},
        { text: "项目等级",value:"level" },
        {
          text: "功能",
          align: "center",
          sortable: false
        }
      ],
      desserts: []
    };
  },
  methods: {
    search() {
      if (this.selected == "我参与的项目") {
        this.isJoin = true;
        this.$axios
          .get("/api/projectManagement/projectListJoin", {
            params: {
              userId: this.userId
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
            } else if (res.data.status == "500") {
              this.error = "搜索失败！";
              this.snackbar0 = true;
            }
          });
      } else {
        this.isJoin = false;
        this.$axios
          .get("/api/projectManagement/projectListManage", {
            params: {
              userId: this.userId
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
            } else if (res.data.status == "500") {
              this.error = "搜索失败！";
              this.snackbar0 = true;
            }
          });
      }
    },
    manage(item) {
      const index = item._id;
      this.$router.push({
        path: "/xiangmu/projectManagement/myProject/manage",
        query: {
          index: index
        }
      });
    },
    end(item) {
      this.dialogEnd = true;
      this.index = item._id;
    },
    confirmEnd() {
      this.dialogEnd = false;
      this.$axios
        .put("/api/projectManagement/end", {
          index: this.index
        })
        .then(res => {
          if (res.data.status == "200") {
            this.search();
            this.info = "结案申请发送成功！";
            this.snackbar = true;
          } else if (res.data.status == "500") {
            this.error = "结案申请发送失败！";
            this.snackbar0 = true;
          }
        });
    },
    managePMO(item) {
      const index = item._id;
      this.$router.push({
        path: "/xiangmu/projectManagement/myProject/managePMO",
        query: {
          index: index
        }
      });
    },
    managePM(item) {
      const index = item._id;
      this.$router.push({
        path: "/xiangmu/projectManagement/myProject/managePM",
        query: {
          index: index
        }
      });
    },
    manageEnd(item) {
      const index = item._id;
      this.$router.push({
        path: "/xiangmu/projectManagement/myProject/manageEnd",
        query: {
          index: index
        }
      });
    },
    lookFunction(item) {
      const index = item._id;
      if (item.status == "PMO设定完成") {
        this.$router.push({
          path: "/xiangmu/projectManagement/myProject/checkoutPMO",
          query: {
            index: index
          }
        });
      } else {
        this.$router.push({
          path: "/xiangmu/projectManagement/myProject/checkout",
          query: {
            index: index
          }
        });
      }
    }
  },
  mounted() {
    this.search();
  }
};
</script>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 140px;
}
.table_title {
  background: #ffffff;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.5);
  margin-top: 20px;
  padding: 40px 20px 45px 20px;
  position: relative;
}
.table_titleFlex {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.text1 {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
  padding-left: 18px;
  padding-top: 8px;
}
.text2 {
  font-family: PingFangSC-Regular;
  font-size: 15px;
  color: #333333;
  letter-spacing: 4px;
  padding-left: 18px;
}
.table {
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.td-btn {
  padding: 0px !important;
}
.icon_close {
  float: right;
}
</style>
