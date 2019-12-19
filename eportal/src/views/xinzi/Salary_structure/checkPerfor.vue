<template>
  <v-container fluid grid-list-xl>
        <v-flex class="headerList" md12>
        <p>{{tableName}}的绩效</p>
      </v-flex>
    <div class="bg">
        <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period}}</td>
            <td class="text-xs-center">{{ props.item.amount}}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date}}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout class="returnback">
          <v-flex><span @click="returnback()"><v-btn  color="info">返回</v-btn></span></v-flex>
      </v-layout>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "checkPerfor",
  data: () => ({
    tableName:"",
    headers: [
       { text: "绩效迄止日期", align: 'center',value: "startDate", sortable: false },
        { text: "绩效金额", align: 'center',value: "origin_amount", sortable: false },
         { text: "绩效计算日期",align: 'center', value: "calculateDate", sortable: false },
    ],
    desserts: [],
  }),

  computed: {
  },
    created() {
      this.initialize();
      this.getCheckPerfor();
  },
  methods: {
    initialize() {
        this.tableName = this.$route.query.nameCode;//员工name
        this._id = this.$route.query._idCode;//bonuswait的id
    },
    getCheckPerfor() {
      this.$axios.get("/api/salaryStructure/bonuswaitPerforDetail",{
        params:{
          _id:this._id
        }
      }).then(res => {
        this.desserts = res.data.result;
      });
    },
    returnback(){
        history.go(-1)
    }
  }
};
</script>
<style scoped>
.headerList {
  background-color: #e0e1e2;
  padding: 10px 20px;
  text-align: center;
}
.headerList p{
  color: #333333;
  font-size: 15px;
  margin-top: 15px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
}
.returnback{
   text-align: right;
   padding-right: 40px;
   padding-top: 40px;
}
.returnback span{cursor: pointer;}

</style>
