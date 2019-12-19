<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="items" label="请选择/输入员工" item-text="employeename" item-value="_id.employee_id" v-model="editedItem._id"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2>
        <v-text-field  label="请输入周期" v-model="period_seleted"></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>分红管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" no-data-text="没有查询到相关数据!" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{props.item.employeename}}</td>
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.sum }}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date }}</td>
            <td class="text-xs-center">{{ props.item.is_paid==true?"是":"否"}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <!-- 弹框 -->
      <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
        <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
        <div>{{titleTip}}</div>
        <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
      </v-snackbar>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "shareBonus",
  data: () => ({
    period_seleted:'',
    bonus_type:"分红",
    items: [],
    // /弹框信息
    top: true,
    right: false,
    color:"",
    titleTip:"",
    snackbar: false,
    editedItem:{
      _id:"",
      name:""
    },
    headers: [
      {text: "员工姓名",align: 'center',sortable: false,value: "name"},
      { text: "所属周期", align: 'center',value: "period", sortable: false },
      { text: "分红合计金额", align: 'center',value: "amount", sortable: false },
      { text: "分红日期",align: 'center', value: "estimate_pay_date", sortable: false },
      { text: "是否发放", align: 'center',value: "is_paid", sortable: false },

      { text: "功能", align: "center",sortable: false }
    ],
    desserts: [],
  }),
    created() {
       this.getBonuswait();
  },
  methods: {
    getBonuswait() {
      this.$axios.get("/api/salaryStructure/bonuswaitInfoShare",{
        params: { bonus_type: this.bonus_type }
      }).then(res => {
        this.desserts = res.data.result;
        for (const iterator of this.desserts) {
          iterator.period = iterator.period.slice(0, 4);
          this.items.push(iterator);
        }
        this.items.unshift("全部");
      });
    },
    search() {
      // 只选择全部
      if (this.editedItem._id == "全部"&&!this.period_seleted) {
        this.getBonuswait();
            this.titleTip = "搜索成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";
      }
      // 选择全部和年份
      else if(this.editedItem._id  == "全部"&& this.period_seleted ){
        this.$axios
          .get("/api/salaryStructure/bonuswaitSharePsearch", {
            params: {
              period:this.period_seleted,
              bonus_type:this.bonus_type
              }
          })
          .then(res => {
            this.desserts = res.data.result;
          for (const iterator of this.desserts) {
            iterator.period = iterator.period.slice(0, 4);
            this.items.push(iterator);
          }
           //弹框提示
             if( this.desserts.length>0){ 
            this.titleTip = "搜索成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";
            }
            else{
              this.titleTip = "找不到哟!";
            this.snackbar = true;
            this.right = true;
            this.color = "error";
            }
          })
      }
      // 只选择姓名
      else if(this.editedItem._id && !this.period_seleted ){
        this.$axios
          .get("/api/salaryStructure/bonuswaitShareNsearch", {
            params: {
              _id:this.editedItem._id,
              bonus_type:this.bonus_type
              }
          })
          .then(res => {
            this.desserts = res.data.result;
          for (const iterator of this.desserts) {
            iterator.period = iterator.period.slice(0, 4);
            this.items.push(iterator);
          }
            //弹框提示
             if( this.desserts.length>0){ 
            this.titleTip = "搜索成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";}
            else{
              this.titleTip = "找不到哟!";
            this.snackbar = true;
            this.right = true;
            this.color = "error";
            }
          })
      }
      // 只选择年份
      else if(!this.editedItem._id && this.period_seleted ){
        this.$axios
          .get("/api/salaryStructure/bonuswaitSharePsearch", {
            params: {
              period:this.period_seleted,
              bonus_type:this.bonus_type
              }
          })
          .then(res => {
            this.desserts = res.data.result;
          for (const iterator of this.desserts) {
            iterator.period = iterator.period.slice(0, 4);
            this.items.push(iterator);
          }
            //弹框提示
             if( this.desserts.length>0){ 
            this.titleTip = "搜索成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";}
            else{
              this.titleTip = "找不到哟!";
            this.snackbar = true;
            this.right = true;
            this.color = "error";
            }
          })
      }
      // 选择姓名和年份
       else if(this.editedItem._id && this.period_seleted){
        this.$axios
          .get("/api/salaryStructure/bonuswaitShareSearch", {
            params: {_id:this.editedItem._id,period:this.period_seleted,bonus_type:this.bonus_type}
          })
          .then(res => {
             this.desserts = res.data.result;
          for (const iterator of this.desserts) {
            iterator.period = iterator.period.slice(0, 4);
            this.items.push(iterator);
          }
             //弹框提示
             if( this.desserts.length>0){ 
            this.titleTip = "搜索成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";}
            else{
              this.titleTip = "找不到哟!";
            this.snackbar = true;
            this.right = true;
            this.color = "error";
            }
           
          })
      }
    },
    checkClick(item){
       this.$router.push({ 
       path:"/xinzi/Salary_structure/shareRecord",
       query: {
           nameCode:item.employeename,
           _id:item._id.employee_id,
           period:item.period
       }
       })}
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.search {
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerList p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
}
</style>
