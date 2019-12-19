<template>
  <div class="container">
    <div class="cont_middle_Bg">
      <v-flex lg12 class="cont_middle">
        <p>PMO</p>
        <p>点数发放申请单</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td>{{ props.item.number }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.status }}</td>
          <td>{{ props.item.expect_close_date }}</td>
          <td>{{ props.item.product.status }}</td>
          <td>{{ props.item.product1.name }}</td>
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
      select_status: "",
      items_status: [
        "全部",
        "PMO设定完成",
        "项目执行中",
        "PM结案申请阶段",
        "已结案",
        "草稿"
      ],
      headers: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "预定结案日期", value: "expect_close_date", sortable: false },
        { text: "申请单状态", value: "form_status", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        {
          text: "功能",
          align: "center",
          value: "function",
          sortable: false,
          width: "260px"
        }
      ],
      desserts: [
      ]
    };
  },
  mounted() {
    // 发放点数列表信息
    this.getProjectList();
  },
  
  methods: {
    // 发放点数列表信息
    getProjectList() {
      this.$axios.get("/api/pmo/applyGrantPoint", {

      }).then(res => {
          if (res.data.status == "200") {
            res.data.result.filter((item)=>{
              if(!item.product){
                return item
              }
              this.desserts.push(item)
            })
          }
        });
    },
    check(item) {
      this.$router.push({
        name: "grantappformdetail",
        query: {
          id: item._id,
          point_log_id : item.product._id,
          status:item.product.status
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
.cont_middle_Bg {
  margin-top: 50px;
  padding: 40px 20px 30px;
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
</style>