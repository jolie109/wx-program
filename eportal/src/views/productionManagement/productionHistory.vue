<!--
 * @Author: your name
 * @Date: 2019-11-28 09:19:39
 * @LastEditTime: 2019-12-03 16:09:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /eportal11.26/eportal/src/views/productionManagement/productionHistory.vue
 -->
<template>
  <v-container wrap grid-list-xl>
    <!-- topBar start -->
    <v-layout align-center justify-start class="container">
      <v-flex xs12 sm2 md3 d-flex>
        <v-autocomplete
          label="请选择/输入生产中心"
          item-text="currentWork"
          no-data-text="无结果"
          :items="allWork"
          v-model="currentWork"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 d-flex>
        <v-autocomplete
          label="请选择/输入机器"
          item-text="nickName"
          no-data-text="无结果"
          :items="allMachines"
          v-model="currentMachine"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md3>
        <v-menu
          v-model="menu_start"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="100px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="period_start"
              label="请选择开始日期"
              prepend-icon="event"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="period_start" locale="zh-cn" @input="menu_start = false" :max="maxDate"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm2 md3>
        <v-menu
          v-model="menu_end"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="100px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="period_end"
              label="请选择结束日期"
              prepend-icon="event"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            :min="period_start"
            :max="countDate"
            v-model="period_end"
            locale="zh-cn"
            @input="menu_end = false"
          ></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
      <v-card class="margin_card" style="padding-bottom: 10px">
      <v-flex xs12 sm12 md12 d-flex>
        <div class="mytitle">
          <p class="title_h">生产管理</p>
          <p class="text">日印量记录列表</p>
        </div>
      </v-flex>
     <v-flex xs12 sm12 md12 d-flex>
      <v-card class="margin_card">
        <v-data-table :items="records" :headers="headers" no-data-text="该制作中心内暂无机器" id="border"  class="elevation-1">
          <template v-slot:items="props">
            <tr>
              <td
                :rowspan="props.item.cate.type.length+1"
                class="text-xs-center"
              >{{props.item.nickName}}</td>
              <td
                :rowspan="props.item.cate.type.length+1"
                class="text-xs-center"
              >{{props.item.serialNumber}}</td>
              <td
                :rowspan="props.item.cate.type.length+1"
                class="text-xs-center"
              >{{props.item.cate.printDate}}</td>
            </tr>
            <template v-for="(child) in props.item.cate.type">
              <tr>
                <td id="border-left" class="text-xs-center">{{child.type|filterKey}}</td>
                <td class="text-xs-center">{{child.last_day_click | changeNum(child.last_day_click)}}</td>
                <td class="text-xs-center">{{child.click_count|changeNum(child.click_count)}}</td>
              </tr>
            </template>
          </template>
        </v-data-table>
       </v-card>
        </v-flex>
      </v-card>
  </v-container>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      maxDate:new Date().toISOString().substr(0, 10),
      prop: Math.random(),
      currentWork: "", //当前制作中心
      allMachines: [], //所有机器列表
      currentMachine: "", //当前机器
      allWork: [],
      // 周期开始
      period_start: "",
      menu_start: false,
      // 周期结束
      period_end: "",
      menu_end: false,
      menu: false,
      records: [],
      query: {},
      headers: [
        { text: "小名", value: "nickName", align: "center", sortable: false },
        { text: "序列号", value: "serialNumber", align: "center",sortable: false },
        { text: "打印日期", value: "cate.printDate", align: "center",sortable: false },
        { text: "类型", value: "", align: "center",sortable: false },
        { text: "日印量", value: "", align: "center",sortable: false},
        { text: "总计数值", value: "", align: "center",sortable: false}
      ]
    };
  },
  watch: {
    period_start(val) {
      this.period_end = val;
      this._getRecordRequired();
    },
    currentWork(val) {
      this._getAllMachines(val);
      this._getAllHistory(val);
    },
    period_end(val) {

      this._getRecordRequired();
    },
    currentMachine(val) {

      this._getRecordRequired();
    }
  },
  computed: {
    //计算属性获取开始时间一个月以后的日期，
    countDate: function() {
      if(this.maxDate===new Date().toISOString().substr(0, 10)){
        return this.maxDate
      }
      let dd = new Date(this.period_start);
      //获取AddDayCount天后的日期
      dd.setDate(dd.getDate() + 30);
      let y = dd.getFullYear();
      //获取当前月份的日期，不足10补0
      let m =
        dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
      //获取当前几号，不足10补0
      let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
      let firstDistribution = y + "-" + m + "-" + d;
      return firstDistribution;
    }
  },
  methods: {
    //   获取该用户权限内的制作中心
    _getUserCenters() {
      const tel = localStorage.getItem("tel");
      this.$axios
        .get("/api/productionManagement/getUserCenters", {
          params: { tel: tel }
        })
        .then(res => {
          this.allWork = res.data.result;
          this.allWork.unshift('全部')
           this.currentWork = '';
          this._getAllMachines(this.currentWork);
          this._getAllHistory(this.currentWork);
        });
    },
    _getAllMachines(workName) {
      let params={}
      if(this.currentWork==='全部' || this.currentWork===''){
       params =  { workCenters: this.allWork}
      }else{
         params = {workName: this.currentWork }
      }
      this.$axios
        .get("/api/productionManagement/getMachineBypro", {
          params: params
        })
        .then(res => {
          this.allMachines = [];
          if (res.data.status == "200") {
            let allMachine = res.data.result;
            let newMachine = []
              allMachine.forEach(machine=>{
               newMachine.push(...machine.item)
             })
            allMachine = newMachine.filter(el => {
               return el.category == "打印机";
            });
              allMachine.forEach(el => {
              this.allMachines.push(el.nickName);
            });
            this.allMachines.unshift("全部");
            this.currentMachine = "";
          } else {
            this.allMachines = [];
            this.currentMachine=[]
          }
        });
    },
    _getAllHistory(workName) {
       let params ={}
      if(this.currentWork === '全部'|| this.currentWork===''){
        params = { workCenters: this.allWork }
      }else{
         params = { workName: this.currentWork }
      }
      this.$axios
        .get("/api/productionManagement/getAllByYesterday", {
          params:params
        })
        .then(res => {
        if (res.data.status == "404") {
          this.records=[]
        return;
      }
      if(res.data.status==200){
        let result =  res.data.result
         this.records =result.filter(record => {
            return record.category === "打印机";
          });
      } 
        });
    },
    //按条件查询
    _getRecordRequired() {
      if (this.currentMachine !== "全部" && this.currentMachine) {
        //判断机器
        this.query.nickName = this.currentMachine;
      } else {
        this.query.nickName = "";
      }
      if (this.period_start && this.period_end) {
        this.query.startTime = this.period_start;
        this.query.endTime = this.period_end;
      } else {
        this.query.startTime = "";
        this.query.endTime = "";
      }
       let params={}
      if(this.currentWork==='全部' || this.currentWork===''){
         params= {
            list: this.query,
            workCenters: this.allWork
          }
      }else{
        params= {
            list: this.query,
            workName: this.currentWork
          }
      }
      this.$axios
        .get("/api/productionManagement/findHistory", {
          params: params
        })
        .then(res => {
          if (res.data.status == "404") {
            this.records = [];
          }
          if (res.data.status == "200") {
            this.records = res.data.result.filter(record => {
              return record.category === "打印机";
            });
          }
        });
    }
  },
  filters: {
    //添加逗号
    changeNum(num) {
      var result = [],
        counter = 0;
      num = (num || 0).toString().split("");
      for (var i = num.length - 1; i >= 0; i--) {
        counter++;
        result.unshift(num[i]);
        if (!(counter % 3) && i != 0) {
          result.unshift(",");
        }
      }
      return result.join("");
    },
    //将blackA3过滤黑白A3
      filterKey(item){
       if(item==='blackA3'){
        return '黑白A3'
      }
      if(item==='blackA4'){
        return '黑白A4'
      }
      if(item==='colorA3'){
        return '彩色A3'
      }
      if(item==='colorA4'){
        return '彩色A4'
      }
     

    },
  },
  created() {},
  mounted() {
    this._getUserCenters();
  }
};
</script>
<style scoped>
.mytitle {
  width: 100%;
  height: 67px;
  background-color: #e0e1e2;
  margin: -46px 20px 10px;
  border-radius: 11px;
}
.title_h,
.text {
  line-height: 20px;
  color: #333300;
  letter-spacing: 4px;
  margin-left: 30px;
  cursor: pointer;
}
.title_h {
  margin-top: 15px;
  margin-bottom: 5px;
  font-size: 16px;
}
.text {
  font-size: 16px;
}
.margin_card {
  margin: 20px;
  position: relative;
}
.message {
  font-size: 22px;
  padding: 30px;
  padding-bottom: 100px;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
}
.dialog_title {
  font-size: 30px;
  margin-left: 20px;
  margin-top: 30px;
}
#border-left {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}
/* #border{
    border:1px solid rgba(0,0,0,.12);
} */
/* #border td{
      border-right:1px solid rgba(0,0,0,.12);
} */
</style>