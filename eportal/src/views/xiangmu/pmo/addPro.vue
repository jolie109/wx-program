<template>
  <v-container class="container">
    <p class="tit" v-text="addProTitle"></p>
    <v-form class="box">
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            项目编号
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="desserts.number" :rules="numRelus"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            项目名称
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="desserts.name" :rules="nameRelus"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            项目说明
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-textarea solo v-model="desserts.desc" :rules="descRelus"></v-textarea>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            预计结案时间
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md4 lg2>
          <v-menu
            ref="end_time"
            :close-on-content-click="false"
            :nudge-right="40"
            :return-value.sync="desserts.expect_close_date"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field v-model="desserts.expect_close_date" readonly v-on="on" label="请选择日期"></v-text-field>
            </template>
            <v-date-picker v-model="desserts.expect_close_date" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="end_time = false">Cancel</v-btn>
              <v-btn
                flat
                color="primary"
                @click="$refs.end_time.save(desserts.expect_close_date)"
              >OK</v-btn>
            </v-date-picker>
          </v-menu>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            项目单位
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6 class="show_sty">
          <v-subheader v-model="desserts.unit">{{desserts.unit}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            项目经理
            <span>*</span>
          </v-subheader>
        </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select
          label="请选择项目经理"
          :items="employees"
          v-model="desserts.manager"
        ></v-select>
      </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            项目等级
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md4 lg2>
          <v-select label="请选择等级" :items="items" v-model="desserts.level" :rules="levelRelus"></v-select>
        </v-flex>
      </v-layout>
      <v-layout row class="btn_sty">
       
        <v-flex md4 lg2 btn>
          <v-btn color="info" @click="backToCancel()" v-if="btn_cancel">取消</v-btn>
        </v-flex>
         <v-flex md4 lg2 btn>
          <v-btn color="info" @click="backToSave()" v-if="btn_save">{{this.$route.query.index=="增加"?"创建":"保存"}}</v-btn>
        </v-flex>
      </v-layout>
    </v-form>

      <v-snackbar :color="color" top right v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      numRelus: [
        v => !!v || "项目编号不能为空"
        // v => /^[0-9]*$ /.test(v) || '请输入数字'
      ],
      nameRelus: [v => !!v || "项目名称不能为空"],
      descRelus: [v => !!v || "项目说明不能为空"],
      managerRelus: [v => !!v || "项目经理不能为空"],
      levelRelus: [v => !!v || "项目等级不能为空"],
      addProTitle: "新增项目",
      desserts: {
        number: "",
        name: "",
        desc: "",
        unit: "百星",
        manager: "",
        status: "草稿",
        level: "",
        expect_close_date: new Date().toISOString().substr(0, 10),
        close_date: new Date().toISOString().substr(0, 10),
        score: 0,
        reward_cc_point: 0,
        progress_pm_point: 0,
        progress_cc_point: 0,
        complete_pm_point: 0,
        complete_cc_point: 0,
        reward_pm_point: 0,
        max_point: 0
      },
      items: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
      btn_save: true,
      btn_cancel: true,
      end_time: false,
      snackbar:"",
      color:"",
      titleTip:"",
      employees:[]
    };
  },
  mounted() {
    if (this.$route.query.desserts) {
      this.desserts = this.$route.query.desserts;
    }
    if (this.$route.query.btn_save) {
      this.btn_save = !this.$route.query.btn_save;
    }
    // 获取新增内容展示在新增页面
    this.getProjectDetail();
    //获取员工列表生成项目经理选项
    this.getEmployees()
  },
  methods: {
    backToSave() {
      this.desserts.max_point=200*Number(this.desserts.level.substring(1)) 
      let data = this.desserts;
      let _id = this.$route.query.id;
      if (_id) {
        // 编辑新增
        this.$axios
          .put("/api/pmo/projectList", { data: data, _id })
          .then(res => {
            if(res.data.status == 400){
              this.$router.push({
              path: "/xiangmu/pmo/index",
              params: {
                tips1: "编辑草稿失败！"
              }
            });
            }else if(res.data.status == 200){
              this.$router.push({
              path: "/xiangmu/pmo/index",
              params: {
                tips2: "编辑草稿成功！"
              }
            });
            }
            
          });
      } else {
        // 新增
        
        if(this.desserts.number==""|| this.desserts.name==""||this.desserts.desc==""|| this.desserts.manager==""||this.desserts.level==""){
            this.snackbar = true;
              this.color = "info";
              this.titleTip = "内容不能为空";
        }else{
          this.$axios.post("/api/pmo/projectList", { data: data }).then(res => {
          if(res.data.status == 400){
              this.$router.push({
              path: "/xiangmu/pmo/index",
              params: {
                tips1: "新增失败！"
              }
            });
            }else if(res.data.status == 200){
              this.$router.push({
             path: "/xiangmu/pmo/index",
              params: {
                tips2: "新增成功！"
              }
            });
            }
        });
        }
      }
    },
    backToCancel() {
      this.$router.push({
        path: "/xiangmu/pmo/index",
        params: {}
      });
    },
    getEmployees(){
      this.$axios.get('/api/pmo/allEmployeeForPM',{})
      .then(res=>{
        if(res.data.status=='200'){
          res.data.result.forEach(element => {
            this.employees.push(element.name)
          });
        }
      })
    },
    // 获取新增内容展示在新增页面
    getProjectDetail() {
      if (this.$route.query.id) {
        this.addProTitle = "编辑新增";
        this.$axios
          .get("/api/pmo/projectListDetail", {
            params: {
              _id: this.$route.query.id
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              res.data.result[0].manager = res.data.result[0].product.name;
              this.desserts = res.data.result[0];
            }
          });
      }
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
.tit {
  width: 80%;
  position: absolute;
  top: 40px;
  text-align: center;
  font-size: 30px;
  color: #4d4d4d;
}
.box {
  margin: 81px 31px 68px 31px;
}
.row_lab_sty {
  padding: 14px 0 16px 50px;
}
.row_lab_sty span {
  color: red;
  margin-left: 4px;
}
.select_sty {
  margin-bottom: 230px;
}
.btn_sty {
  margin: 50px 0 228px 600px;
}
.show_sty {
  padding: 14px 0 16px;
}
.btn {
  margin-right: 50px;
}
</style>