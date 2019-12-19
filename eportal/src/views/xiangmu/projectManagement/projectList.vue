<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex md2 d-flex>
          <v-select :items="items" v-model="selected" label="请选择分类" @change="tr()"></v-select>
        </v-flex>
        <v-flex md3 d-flex>
          <div id="item2" style="display:none;">
            <v-text-field v-model="selected2" label="请输入" v-show="isShow"></v-text-field>
            <v-select :items="item2" v-model="selected2" label="请选择" v-show="!isShow"></v-select>
          </div>
        </v-flex>
        <v-flex md1>
          <v-btn small round color="primary" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout wrap align-center>
        <v-flex md d-flex>
          <div class="table_title">
            <v-flex class="table_titleFlex">
              <div class="xmgl">项目管理</div>
              <div class="xmlb">项目列表</div>
            </v-flex>
            <div class="table">
              <v-data-table
                :headers="headers"
                :items="desserts"
                class="elevation-1"
                no-data-text="无对应信息，请检查输入的内容。"
              >
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
  name: "projectList",
  data() {
    return {
      selected: "",
      selected2: "",
      isShow: true,
      error: "",
      timeout0: 6000,
      snackbar0: false,
      items: [
        "全部",
        "项目经理",
        "项目编号",
        "项目状态",
        "项目等级",
        "项目名称"
      ],
      item2: [],
      level: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "DX"],
      status: [
        "PMO设定完成",
        "项目执行中",
        "PM结案申请阶段",
        "已结案（成功）",
        "已结案（失败）"
      ],
      headers: [
        { text: "项目编号", align: "left" },
        { text: "项目名称" },
        { text: "预计结案日期" },
        { text: "项目经理" },
        { text: "项目状态" },
        { text: "项目等级" },
        { text: "功能", align: "center", sortable: false }
      ],
      desserts: []
    };
  },
  methods: {
    tr() {
      if (this.selected == "项目等级") {
        document.getElementById("item2").style.display = "block";
        this.isShow = false;
        this.item2 = this.level;
      } else if (this.selected == "项目状态") {
        document.getElementById("item2").style.display = "block";
        this.isShow = false;
        this.item2 = this.status;
      } else if (this.selected == "全部") {
        document.getElementById("item2").style.display = "none";
      } else {
        document.getElementById("item2").style.display = "block";
        this.isShow = true;
      }
    },
    search() {
      this.$axios
        .get("/api/projectManagement/projectList", {
          params: {
            item1: this.selected,
            item2: this.selected2
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
    },
    lookFunction(item) {
      const index = item._id;
      if (item.status == "PMO设定完成") {
        this.$router.push({
          path: "/xiangmu/projectManagement/projectList/checkoutPMO",
          query: {
            index: index
          }
        });
      } else {
        this.$router.push({
          path: "/xiangmu/projectManagement/projectList/checkout",
          query: {
            index: index
          }
        });
      }
    }
  },
  created() {
    this.search();
  }
};
</script>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 150px;
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
.xmgl {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
  padding-left: 18px;
  padding-top: 8px;
}
.xmlb {
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
</style>