<!--奖金池-->
<template>
  <v-container>
    <div class="bg">
       
      <v-layout align-center ml-5>
        <v-flex xs12 sm6 md2>
          <v-subheader style="letter-spacing:10px">所属周期:</v-subheader>
        </v-flex>
        <v-flex xs12 sm6 md2>
          <v-menu
        v-model="menu1"
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
            v-model="date1"
            label="请输入起始日期"
            prepend-icon="event"
            readonly
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker v-model="date1" locale="zh-cn" @input="menu1 = false"></v-date-picker>
      </v-menu>
        </v-flex>
        <v-flex xs12 sm6 md2>
        <v-menu
        v-model="menu2"
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
            v-model="date2"
            label="请输入终止日期"
            prepend-icon="event"
            readonly
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker v-model="date2" locale="zh-cn" @input="isSmall()"></v-date-picker>
      </v-menu>
        </v-flex>
      </v-layout>
      <v-layout align-center ml-5>
        <v-flex xs12 sm6 md2>
          <v-subheader>员工绩效奖金池:</v-subheader>
        </v-flex>
        <v-flex xs12 sm6 md2>
          <v-text-field placeholder="请输入" :items="itemsemployeePerfor"  v-model="bonusList.employeePerfor"></v-text-field>(人民币/元)
        </v-flex>
      </v-layout>
      <v-layout align-center ml-5>
        <v-flex xs12 sm6 md2>
          <v-subheader>主管绩效奖金池:</v-subheader>
        </v-flex>
        <v-flex xs12 sm6 md2>
          <v-text-field placeholder="请输入" :items="itemschargePerfor"  v-model="bonusList.chargePerfor"></v-text-field>(人民币/元)
        </v-flex>
      </v-layout>
      <v-layout align-center ml-5>
        <v-flex xs12 sm6 md2>
          <v-subheader>项目勋章奖金池:</v-subheader>
        </v-flex>
        <v-flex xs12 sm6 md2>
          <v-text-field placeholder="请输入" :items="itemsprojectMedal"  v-model="bonusList.projectMedal"></v-text-field>(人民币/元)
        </v-flex>
      </v-layout>
      <v-layout align-center ml-5>
        <v-flex xs12 sm6 md2>
          <v-subheader>一般分红奖金池:</v-subheader>
        </v-flex>
        <v-flex xs12 sm6 md2>
          <v-text-field placeholder="请输入" :items="itemsnormalShare" v-model="bonusList.normalShare"></v-text-field>(人民币/元)
        </v-flex>
      </v-layout>
      <v-layout align-center ml-5>
        <v-flex xs12 sm6 md2>
          <v-subheader>股权分红奖金池:</v-subheader>
        </v-flex>
        <v-flex xs12 sm6 md2>
          <v-text-field placeholder="请输入" :items="itemsequityShare"  v-model="bonusList.equityShare"></v-text-field>(人民币/元)
        </v-flex>
      </v-layout>
      <v-layout class="returnback">
        <v-flex md6>
          <v-btn small color="info" @click="clear()" >重置</v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn small color="info" @click="submit()">提交</v-btn>
        </v-flex>
      </v-layout>
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
  name: "bonus",
  data: () => ({
    date1: new Date().toISOString().substr(0, 10),
    date2: new Date().toISOString().substr(0, 10),
    menu1: false,
    menu2:false,
    // /弹框信息
    top: true,
      right: false,
      color: "",
      titleTip: "",
      snackbar: false,
    period:"",
    itemsemployeePerfor:[],
    itemschargePerfor:[],
    itemsprojectMedal:[],
    itemsnormalShare:[],
    itemsequityShare:[],
    bonusList:{
    employeePerfor:"",
    chargePerfor:"",
    projectMedal:"",
    normalShare:"",
    equityShare:""
    }
      // 表单验证
    //  periodRules: [
    //             v => !!v || '不能为空！',
    //             v => (v && v.length <= 4) || '超过四个字符了！',
    //              v => /^(19|20)\d{2}$/.test(v) || '年份必须有效！'
    //         ],
      // employeePerforRules: [
      //           v => !!v || '不能为空！',
      //            v => /^[0-9]*$/.test(v) || '必须是数字！',
      //            v => (v && v.length <= 8) || '不能超过8个字符！'
      //       ],
      //       projectMedalRules: [
      //           v => !!v || '不能为空！',
      //            v => /^[0-9]*$/.test(v) || '必须是数字！',
      //            v => (v && v.length <= 8) || '不能超过8个字符！'
      //       ],
      //       chargePerforRules: [
      //           v => !!v || '不能为空！',
      //            v => /^[0-9]*$/.test(v) || '必须是数字！',
      //            v => (v && v.length <= 8) || '不能超过8个字符！'
      //       ],
      //       normalSharedRules: [
      //           v => !!v || '不能为空！',
      //            v => /^[0-9]*$/.test(v) || '必须是数字！',
      //            v => (v && v.length <= 8) || '不能超过8个字符！'
      //       ],
      //       equityShareRules: [
      //           v => !!v || '不能为空！',
      //            v => /^[0-9]*$/.test(v) || '必须是数字！',
      //            v => (v && v.length <= 8) || '不能超过8个字符！'
      //       ],
  }),

  computed: {},
  mounted() {
    this.initialize();
  },
  methods: {
    isSmall(){
      this.menu2 = false;
      if(this.date2<=this.date1){
        alert("截止时间应大于开始时间")
      }
    },
    initialize() {
       this.$axios
          .get("/api/salaryStructure/BonusPool")
          .then(res => {
            if(res.data.status=='200'){
          this.bonusList=res.data.result
          this.date1=this.bonusList.period.split("~")[0]
           this.date2=this.bonusList.period.split("~")[1]
            }else{
              this.bonusList={
                employeePerfor:"",
                chargePerfor:"",
                projectMedal:"",
                normalShare:"",
                equityShare:""
    }
            }
          });
    },
    submit(){
        this.period=this.date1+"~"+this.date2
      if(this.period=="" || this.bonusList.employeePerfor==""|| this.bonusList.chargePerfor==""|| this.bonusList.projectMedal==""|| this.bonusList.normalShare==""||this.bonusList.equityShare==undefined){
        alert("不能有空！")
      }else{
        this.$axios
          .post("/api/salaryStructure/addBonusPool", {
            period:this.period,
            employeePerfor:this.bonusList.employeePerfor,
            chargePerfor:this.bonusList.chargePerfor,
            projectMedal:this.bonusList.projectMedal,
            normalShare:this.bonusList.normalShare,
            equityShare:this.bonusList.equityShare
          })
          .then(res => {
            //弹框提示
            this.titleTip = "提交成功！";
        this.snackbar = true;
        this.right = true;
        this.color = "info";
          });
      }
          
      

    },
    clear () {
        this.date1 = ''
        this.date2=''
        this.bonusList={}
      }
  }
};
</script>
<style scoped>
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 30px;
}
.returnback {
  text-align: right;
  padding-top: 40px;
}
.returnback button {
  cursor: pointer;
}
</style>
