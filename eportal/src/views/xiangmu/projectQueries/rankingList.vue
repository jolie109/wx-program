<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md4 d-flex>
          <v-select :items="items" v-model="selected2" label="请选择勋章类别"></v-select>
        </v-flex>
        <v-flex md3 d-flex>
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
      <div v-show="!isPm">
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classifyBg">
              <v-flex class="classifyBgFlex">
                <p>勋章</p>
                <p>勋章排行榜</p>
              </v-flex>
              <div class="table">
                <v-data-table
                  :headers="headers"
                  :items="desserts"
                  class="elevation-1"
                  no-data-text="该员工暂无点数信息。"
                >
                  <template v-slot:items="props">
                    <td>{{ desserts.indexOf(props.item) + 1 }}</td>
                    <td>{{ props.item._id | getName }}</td>
                    <td>{{ props.item.point_sum }}</td>
                    <td>{{ props.item.point_sum | getLevel }}</td>
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
      <div v-show="isPm">
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classifyBg">
              <v-flex class="classifyBgFlex">
                <p>勋章</p>
                <p>勋章排行榜</p>
              </v-flex>
              <div class="table">
                <v-data-table
                  :headers="headers"
                  :items="desserts"
                  class="elevation-1"
                  no-data-text="该员工暂无点数信息。"
                >
                  <template v-slot:items="props">
                    <td>{{ desserts.indexOf(props.item) + 1 }}</td>
                    <td>{{ props.item._id | getName}}</td>
                    <td>{{ props.item.point_sum }}</td>
                    <td>{{ props.item.point_sum | getLevel }}</td>
                  </template>
                </v-data-table>
              </div>
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
  name: "rankingList",
  data() {
    return {
      snackbar0: false,
      error: "",
      timeout0: 6000,
      items: ["项目协作点数（cc）", "项目管理点数（pm）"],
      selected2: "项目协作点数（cc）",
      selected: "全部",
      components: ["全部"],
      isPm: false,
      headers: [
        { text: "排名", sortable: false },
        { text: "用户", sortable: false },
        { text: "点数", sortable: false },
        { text: "等级", sortable: false }
      ],
      desserts: []
    };
  },
  methods: {
    compare(params) {
      return function(a, b) {
        var value1 = a[params];
        var value2 = b[params];
        return value2 - value1;
      };
    },
    getRankingList_cc() {
      this.$axios.get("/api/projectQueries/rankingList_cc", {}).then(res => {
        if (res.data.status == "200") {
          var array = res.data.result.sort(this.compare("point_sum"));
          this.desserts = array;
        }
      });
    },
    getRankingList_pm() {
      this.$axios.get("/api/projectQueries/rankingList_pm", {}).then(res => {
        if (res.data.status == "200") {
          var array = res.data.result.sort(this.compare("point_sum"));
          this.desserts = array;
          (  this.desserts)
        }
      });
    },
    search() {
      if (this.selected2 == "项目管理点数（pm）") {
        if (this.selected == "全部") {
          this.isPm = true;
          this.getRankingList_pm();
          
        } else {
          this.isPm = true;
          this.$axios
            .get("/api/projectQueries/rankingList_pm1", {
              params: {
                _id: this.selected
              }
            })
            .then(res => {

              if (res.data.status == "200") {
                
                this.desserts = res.data.result;
                (this.desserts)
              } else if (res.data.status == "404") {
                this.desserts = [];
              } else if (res.data.status == "500") {
                this.error = "搜索失败！";
                this.snackbar0 = true;
              }
            });
        }
      } else if (this.selected2 == "项目协作点数（cc）") {
        if (this.selected == "全部") {
          this.isPm = false;
          this.getRankingList_cc();
        } else {
          this.isPm = false;
          this.$axios
            .get("/api/projectQueries/rankingList_cc1", {
              params: {
                _id: this.selected
              }
            })
            .then(res => {
              if (res.data.status == "200") {
                this.desserts = res.data.result;
              } else if (res.data.status == "404") {
                this.desserts = [];
              } else if (res.data.status == "500") {
                this.error = "搜索失败！";
                this.snackbar0 = true;
              }
            });
        }
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
            localStorage.setItem("members", JSON.stringify(res.data.result));
          } else if (res.data.status == "500") {
            this.error = "员工信息转换失败。";
            this.snackbar0 = true;
          }
        });
    },
    getLevelTable() {
      this.$axios
        .get("/api/projectQueries/checkout_levelTables", {})
        .then(res => {
          if (res.data.status == "200") {
            localStorage.setItem(
              "levelTables",
              JSON.stringify(res.data.result)
            );
          } else if (res.data.status == "500") {
            this.error = "等级信息转换失败。";
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
    },
    getLevel: function(value) {
      for (const iterator of JSON.parse(localStorage.getItem("levelTables"))) {
        if (iterator.end !== "-") {
          if (value >= iterator.start && value <= iterator.end) {
            var level = iterator.level;
          }
        } else {
          if (value >= iterator.start) {
            var level = iterator.level;
          }
        }
      }
      return level;
    }
  },
  mounted() {
    this.getRankingList_cc();
    this.getMembers();
    this.getLevelTable();
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
  /* box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5); */
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
