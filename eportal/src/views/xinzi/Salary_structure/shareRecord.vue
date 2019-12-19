<template>
  <v-container fluid grid-list-xl>
        <v-flex class="headerList" md12>
        <p>{{tableName}}的分红记录</p>
      </v-flex>
    <div class="bg">
        <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.bonus_type}}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date}}</td>
            <td class="text-xs-center">{{ props.item.amount}}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout class="returnback">
          <v-flex><span @click="returnback()">
            <v-btn
                color="info"
              >返回</v-btn>
              </span></v-flex>
      </v-layout>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "shareRecord",
  data: () => ({
    tableName:"",
    _id:"",
    period:"",
    headers: [
       { text: "分红类型",align: 'center', value: "bonus_type", sortable: false },
        { text: "分红时间",align: 'center', value: "estimate_pay_date", sortable: false },
         { text: "分红金额", align: 'center',value: "origin_amount", sortable: false },
    ],
    desserts: [],
  }),

  computed: {
  },
    created() {
      this.initialize();
      this.getBonuswait();
  },
  methods: {
    initialize() {
        this.tableName = this.$route.query.nameCode;
        this._id = this.$route.query._id;
        this.period = this.$route.query.period;
    },
    getBonuswait() {
      this.$axios.get("/api/salaryStructure/bonuswaitShareDetail",{
        params:{
          _id:this._id,
          period:this.period
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
