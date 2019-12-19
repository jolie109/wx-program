<template>
  <v-container fluid grid-list-xl>
    <div class="bg">
      <v-layout class="topTitle">
        <v-flex md12>
          <span>{{tableName}}待发奖金内容</span>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md4>
          <span>双薪</span>
        </v-flex>
      </v-layout>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period}}</td>
            <td class="text-xs-center">{{props.item.amount}}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout class="returnback" v-if="show_btn_2">
        <v-flex md12>
          <v-btn small color="info" @click="Hrcancel()">取消</v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn small color="info" @click="audit()">审核</v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn small color="info" @click="toBack()">退回</v-btn>
        </v-flex>
      </v-layout>
      <div v-if="show_btn_1">
        <v-layout class="returnback">
          <v-flex md12>
            <v-btn small color="info" @click="cancel()">取消</v-btn>
          </v-flex>
          <v-flex md1>
            <v-btn small color="info" @click="confirmItem()">确认</v-btn>
          </v-flex>
        </v-layout>
      </div>
      <v-layout class="returnback" v-if="show_btn_3">
        <v-flex>
          <v-btn small color="info" @click="goback()">取消</v-btn>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "departmentDetail",
  data: () => ({
    tableName: "",
    headers: [
      { text: "所属周期", align: "center", value: "period", sortable: false },
      { text: "金额", align: "center", value: "amount", sortable: false }
    ],
    desserts: [],
    show_edit: true,
    show_btn_1: true,
    show_btn_2: false,
    show_btn_3: false
  }),

  computed: {},
  mounted() {
    this.initialize();
    this.getBonusDepartDetail();
  },
  methods: {
    initialize() {
      this.tableName = this.$route.query.nameCode;
      if (this.$route.query.auditconfirm == "show") {
        this.show_btn_1 = true;
      } else if (this.$route.query.auditconfirm == "unshow") {
        this.show_btn_1 = false;
        this.show_btn_2 = true;
      } else if (this.$route.query.display == "unshow") {
        this.show_btn_1 = false;
        this.show_btn_3 = true;
      }
    },
    getBonusDepartDetail() {
      // 双薪 详情页
      var employee_id = this.$route.query.employee_id;
      var bonus_type = this.$route.query.typeCode;
      var period = this.$route.query.period;
      this.$axios
        .get("/api/salaryStructure/bonusDetail", {
          params: {
            _id: this.$route.query.detail_data
          }
        })
        .then(res => {
          this.desserts = res.data.result;
        });
    },
   confirmItem() {
      this.desserts.forEach(i =>{
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: i._id,
            status: "确认"
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/departmentMoment"
            });
          });
      })
    },
    Hrcancel() {
      this.$router.push({
        path: "/xinzi/Salary_structure/deMoment"
      });
    },
    // 退回按钮
    toBack() {
      this.desserts.forEach(i => {
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: i._id,
            status: "草稿"
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/deMoment"
            });
          });
      });
    },
    // 审核按钮
    audit() {
      this.desserts.forEach(i => {
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: i._id,
            status: "核准"
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/deMoment"
            });
          });
      });
    },
    cancel() {
      for (const iterator of this.desserts) {
        iterator.status = "草稿";
        this.$axios
          .put("/api/salaryStructure/updateStatus", {
            _id: iterator.employee_id,
            status: iterator.status
          })
          .then(res => {
            this.$router.push({
              path: "/xinzi/Salary_structure/departmentMoment"
            });
          });
      }
    },
    goback() {
      this.$router.push({
        path: "/xinzi/Salary_structure/hrDepartmoment"
      });
    }
  }
};
</script>
<style scoped>
.topTitle {
  text-align: center;
  font-size: 25px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
}
.returnback {
  text-align: right;
  padding-right: 40px;
  padding-top: 40px;
}
.returnback span {
  cursor: pointer;
}
</style>
