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
            <v-btn color="info" dark @click="check(props.item)">查看</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      select_status: "",
      items_status: ["全部", "项目执行中", "已结案（成功）", "已结案（失败）"],
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
    // pmo发放点数列表页（已结案，项目执行中）
    this.getGrantPointList();
  },
  methods: {
    // pmo发放点数列表页（已结案，项目执行中）
    getGrantPointList() {
      this.$axios
        .get("/api/pmo/AllPMOProjectList", {
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
          .get("/api/pmo/AllPMOProjectList", {
            params: {
              status: ""
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
            }
          });
      } else {
        this.$axios
          .get("/api/pmo/pmoProjectList", {
            params: {
              status: item
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
            }
          });
      }
    },
    check(item) {
      this.$router.push({
        name: "editgrantpoint",
        query: {
          id: item._id,
          btn_edit: "false"
        }
      });
    },
    edit(item) {
      this.$router.push({
        name: "editgrantpoint",
        query: {
          id: item._id
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