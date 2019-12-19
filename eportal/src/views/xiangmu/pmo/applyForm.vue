<template>
  <div class="container">
    <div class="cont_middle_Bg">
      <v-flex lg12 class="cont_middle">
        <p>PMO</p>
        <p>结案申请单</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td>{{ props.item.number }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.expect_close_date }}</td>
          <td>{{ props.item.product.name }}</td>
          <td>待处理</td>
          <td>{{ props.item.level }}</td>
          <td class="text-xs-center">
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
      select_pro: "",
      dialog: false,
      desserts: [],
      pro_lineData: [],
      items_pro: ["全部", "项目编号", "项目名称"],
      headers: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "预定结案日期", value: "expect_close_date", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "申请单状态", value: "status", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        {
          text: "功能",
          align: "center",
          value: "function",
          sortable: false,
          width: "260px"
        }
      ]
    };
  },
  mounted() {
    this.getApplyForm();
  },
  methods: {
    search() {},
    check(item) {
      this.$router.push({
        name: "applyformdetail",
        query: {
          id: item._id
        }
      });
    },
    getApplyForm() {
      this.$axios
        .get("/api/pmo/applyComplete", {
          params: {
            status: ""
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result;
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
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}

.cont_middle_Bg {
  padding: 40px 20px 30px;
  margin-top: 50px;
  margin-bottom: 78.2px;
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

.row_title {
  font-family: PingFangSC-Regular;
  font-size: 40px;
  color: #2e2929;
  padding: 40px 0 0 50px;
}
.row_item_name {
  padding-top: 4%;
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
</style>