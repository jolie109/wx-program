<template>
  <div class="container">
    <v-layout class="cont_top">
      <v-flex lg2 d-flex class="top_item">
        <v-autocomplete label="请选择/输入分类" :items="items_status" v-model="select_status"></v-autocomplete>
      </v-flex>
      <v-flex xs2 md2 lg1 d-flex class="top_item">
        <v-btn round color="info" dark @click="search(select_status)">
          <v-icon dark>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs2 md2 lg1 d-flex class="top_item">
        <v-btn round color="info" dark @click="add_pro()">
          <v-icon dark>add</v-icon>新增项目
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="cont_middle_Bg">
      <v-flex lg12 class="cont_middle">
        <p>PMO</p>
        <p>项目列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td>{{ props.item.number }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.expect_close_date }}</td>
          <td>{{ props.item.product.name }}</td>
          <td>{{ props.item.status }}</td>
          <td>{{ props.item.level }}</td>
          <td class="text-xs-center">
            <v-btn color="info" dark @click="edit(props.item)">编辑</v-btn>
            <v-btn
              color="info"
              dark
              v-show="props.item.status == '草稿' ? false : true "
              @click="check(props.item)"
            >查看</v-btn>
            <v-btn
              color="info"
              dark
              v-show="props.item.status == '草稿' ? true : false"
              @click="setting(props.item)"
            >项目设定</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 弹框 -->
    <v-snackbar :color="color" top right v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>
<script>
import { log } from "util";
export default {
  data() {
    return {
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      titleTip: "",
      color: "",
      select_status: "",
      items_status: [
        "全部",
        "草稿",
        "PMO设定完成",
        "项目执行中",
        "PM结案申请阶段",
        "已结案（成功）",
        "已结案（失败）"
      ],
      headers: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "预定结案日期", value: "expect_close_date", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        {
          text: "功能",
          align: "center",
          value: "function",
          sortable: false,
          width: "260px"
        }
      ],
      desserts: []
    };
  },
  mounted() {
    this.getProjectList();
    // 新增项目或编辑新增项目显示
    if (this.$route.params.tips1) {
      this.snackbar = true;
      this.color = "error";
      this.right = true;
      this.titleTip = this.$route.params.tips1;
    } else if (this.$route.params.tips2) {
      this.snackbar = true;
      this.color = "info";
      this.right = true;
      this.titleTip = this.$route.params.tips2;
    }
  },
  methods: {
    // 项目列表页显示所有的项目
    getProjectList() {
      this.$axios
        .get("/api/pmo/AllprojectList", {
          params: {
            status: ""
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result;
          }
        });
    },
    search(item) {
      if (item == "全部") {
        this.$axios
          .get("/api/pmo/AllprojectList", {
            params: {
              status: ""
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
               this.snackbar = true;
               this.color = "info";
               this.titleTip = "搜索成功";
            }
          });
      } else {
        this.$axios
          .get("/api/pmo/projectList", {
            params: {
              status: item
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
               this.desserts = res.data.result;
               this.snackbar = true;
               this.color = "info";
               this.titleTip = "搜索成功";
            }
          });
      }
    },
    add_pro() {
      this.$router.push({
        name: "addpro",
        query: {
          index:'增加'
        }
      });
    },

    check(item) {
      if (item.status == "已结案（成功）") {
        this.$router.push({
          name: "editcase",
          query: {
            btn_edit: "false",
            id: item._id
          }
        });
      } else if (item.status == "已结案（失败）") {
        this.$router.push({
          name: "editcase",
          query: {
            btn_edit: "false",
            id: item._id
          }
        });
      } else if (item.status == "项目执行中") {
        this.$router.push({
          name: "editproexecute",
          query: {
            btn_edit: "false",
            id: item._id
          }
        });
      } else if (item.status == "PMO设定完成") {
        this.$router.push({
          name: "editsetupcomplete",
          query: {
            btn_edit: "false",
            id: item._id
          }
        });
      } else if (item.status == "PM结案申请阶段") {
        this.$router.push({
          name: "closecaseapply",
          query: {
            btn_edit: "false",
            id: item._id
          }
        });
      }
    },
    edit(item) {
      if (item.status == "草稿") {
        this.$router.push({
          name: "addpro",
          query: {
            id: item._id
          }
        });
      } else if (
        item.status == "已结案" ||
        item.status == "已结案（成功）" ||
        item.status == "已结案（失败）"
      ) {
        this.$router.push({
          name: "editcase",
          query: {
            id: item._id
          }
        });
      } else if (item.status == "项目执行中") {
        this.$router.push({
          name: "editproexecute",
          query: {
            id: item._id
          }
        });
      } else if (item.status == "PMO设定完成") {
        this.$router.push({
          name: "editsetupcomplete",
          query: {
            id: item._id
          }
        });
      } else if (item.status == "PM结案申请阶段") {
        this.$router.push({
          name: "closecaseapply",
          query: {
            id: item._id
          }
        });
      }
    },
    setting(item) {
      // 当点击项目设定后，先改为PMO设定完成，需要项目经理点击启动后项目变为项目执行中（点击启动转换项目执行中未完成）
      item.status = "PMO设定完成";
      let data = {
        status: item.status,
        _id: item._id
      };
      this.$axios
        .put("/api/pmo/projectListById", { data: data })
        .then(res => {
          if(res.data.status == 400){
              this.snackbar = true;
              this.color = "error";
              this.right = true;
              this.titleTip = "项目设定失败！";
            }else if(res.data.status == 200){
              this.snackbar = true;
              this.color = "info";
              this.right = true;
              this.titleTip = "项目设定成功！";
            }
        });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
.cont_top {
  background: rgba(255, 255, 255, 0.1);
  line-height: 26.4px;
  margin-bottom: 50px;
}
.top_item {
  margin-right: 55px;
}
.cont_middle_Bg {
  padding: 40px 20px 30px;
  margin-bottom: 278.2px;
  box-shadow: 0px 0px 6px 1px #ccc;
  position: relative;
}
.cont_middle {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.cont_middle p {
  margin-bottom: 0px;
}
.cont_middle p:nth-of-type(1) {
  color: #333300;
  font-size: 20px;
  margin-bottom: 5px;
}
.cont_middle p:nth-of-type(1) {
  color: #333333;
  font-size: 15px;
}
</style>