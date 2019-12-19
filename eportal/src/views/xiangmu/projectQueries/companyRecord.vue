<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md2 d-flex>
          <v-select :items="items" v-model="selected1" label="请选择分类" @change="tr()"></v-select>
        </v-flex>
        <v-flex md2 d-flex>
          <div id="allIsShow" style="display:none;">
            <v-text-field label="请输入" required v-show="isShow" v-model="selected2"></v-text-field>
            <v-select
              :items="itemsMedalCategory"
              v-model="selected2"
              label="请选择勋章类别"
              v-show="!isShow"
            ></v-select>
          </div>
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
                <p>公司勋章记录</p>
              </v-flex>
              <div class="table">
                <v-data-table
                  :headers="headers"
                  :items="desserts"
                  class="elevation-1"
                  no-data-text="无对应信息，请检查输入的内容。"
                >
                  <template v-slot:items="props">
                    <td>{{ props.item.project_number }}</td>
                    <td>{{ props.item.project_name }}</td>
                    <td>{{ props.item.point_type }}</td>
                    <td>{{ props.item.project_manager | getName }}</td>
                    <td>{{ props.item.project_member }}</td>
                    <td>{{ props.item.sumpoints}}</td>
                    <td>{{ props.item.issue_date }}</td>
                    <td>{{ props.item.project_unit }}</td>
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
    <v-snackbar color="error" top right :timeout="timeout0" v-model="snackbar0">
      <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
      <div>{{error}}</div>
      <v-icon color="white" size="16" @click="snackbar0 = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "companyRecord",
  data() {
    return {
      snackbar0: false,
      timeout0: 6000,
      error: "",
      members: [],
      name: "",
      selected1: "",
      selected2: "",
      isShow: true,
      statu: "",
      items: [
        "全部",
        "项目编号",
        "勋章类别",
        "勋章单位",
        "获得年度",
        "项目名称"
      ],
      itemsMedalCategory: ["Management", "Collaboration"],
      headers: [
        { text: "项目编号", sortable: false, value: "projectID" },
        { text: "项目名称", sortable: false, value: "projectName" },
        { text: "勋章类别", sortable: false, value: "medalCategory" },
        { text: "发放人员", sortable: false, value: "grantPerson" },
        { text: "员工", sortable: false, value: "staff" },
        { text: "点数", sortable: false, value: "points" },
        { text: "获得年度", sortable: false, value: "year" },
        { text: "项目单位", sortable: false, value: "projectUtil" }
      ],
      desserts: []
    };
  },
  methods: {
    tr() {
      if (this.selected1 == "勋章类别") {
        this.isShow = false;
        document.getElementById("allIsShow").style.display = "block";
      } else if (this.selected1 == "全部") {
        document.getElementById("allIsShow").style.display = "none";
      } else {
        this.isShow = true;
        document.getElementById("allIsShow").style.display = "block";
      }
    },

    search() {
      this.$axios
        .get("/api/projectQueries/getranklist", {
          params: {
            item1: this.selected1,
            item2: this.selected2
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result;
             ( this.desserts)
            for (const i of this.desserts) {
              i.issue_date = i.issue_date.split("-")[0];
            }
          } else if (res.data.status == "500") {
            this.error = "搜索失败！";
            this.snackbar0 = true;
          }
        });
    },
     getlist() {
      this.$axios
        .get("/api/projectQueries/getranklist", {
          params: {
            item1: this.selected1,
            item2: this.selected2
          }
        })
        .then(res => {
        
          if (res.data.status == "200") {
            this.desserts = res.data.result;
             ( this.desserts)
            for (const i of this.desserts) {
              i.issue_date = i.issue_date.split("-")[0];
            }
          } else if (res.data.status == "500") {
            this.error = "搜索失败！";
            this.snackbar0 = true;
          }
        });
    },
    getMembers() {
      this.$axios
        .get("/api/projectManagement/checkout_members", {})
        .then(res => {
          if (res.data.status == "200") {
            localStorage.setItem("members", JSON.stringify(res.data.result));
          } else if (res.data.status == "500") {
            this.error = "员工信息转换失败。";
            this.snackbar0 = true;
          }
          
        });
    }
  },
  filters: {
    getName: function(value) {
      for (const iterator of JSON.parse(localStorage.getItem("members"))) {
        if (value == iterator._id) {
          var name = iterator.name;
        }
      }
      return name;
    }
  },
  created() {
    this.getlist();
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
