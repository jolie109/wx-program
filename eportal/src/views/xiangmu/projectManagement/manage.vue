<template>
  <div class="container">
    <v-flex md12 d-flex>
      <div class="table_title">项目内容</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <table v-for="(items,i) in desserts_content" :key="i" class="table1">
          <tr class="th1">
            <td style="width:25%;">项目编号</td>
            <td>{{items.number}}</td>
          </tr>
          <tr>
            <td>项目名称</td>
            <td>{{items.name}}</td>
          </tr>
          <tr>
            <td>项目说明</td>
            <td>{{items.desc}}</td>
          </tr>
          <tr>
            <td>预计结案日期</td>
            <td>{{items.expect_close_date}}</td>
          </tr>
          <!-- <tr>
            <td>预算</td>
            <td>{{items.budget}}</td>
          </tr>-->
          <tr>
            <td>项目单位</td>
            <td>{{items.unit}}</td>
          </tr>
          <tr>
            <td>项目经理</td>
            <td>{{items.employee.name}}</td>
          </tr>
          <tr>
            <td>项目等级</td>
            <td>{{items.level}}</td>
          </tr>
          <tr>
            <td>点数上限</td>
            <td>{{items.max_point}}</td>
          </tr>
          <tr>
            <td>项目状态</td>
            <td>{{items.status}}</td>
          </tr>
          <tr style="height:10px;">
            <td></td>
          </tr>
        </table>
      </div>
    </v-layout>
    <v-flex md12 d-flex>
      <div class="table_title">勋章点数状态</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table
          :headers="headers_medal"
          :items="desserts_medal"
          class="elevation-1"
          hide-actions
        >
          <template v-slot:items="props">
            <tr>
              <td>Collaboration</td>
              <td>{{ props.item.progress_cc_point }}</td>
              <td >{{ already_sum.progress_cc_sum }}</td>
           
              <td>{{ props.item.complete_cc_point }}</td>
              <td >{{ already_sum.complete_cc_sum }}</td>
              <!-- <td v-else>0</td> -->
              <td>项目经理</td>
            </tr>
            <tr>
              <td>Management</td>
              <td>{{ props.item.progress_pm_point }}</td>
              <td >{{ already_sum.progress_pm_sum }}</td>
               <!-- <td v-else>0</td> -->
              <td>{{ props.item.complete_pm_point }}</td>
              <td >{{ already_sum.complete_pm_sum }}</td>
               <!-- <td v-else>0</td> -->
              <td>勋章管理委员会</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-layout>
    <v-layout justify-center>
      <v-dialog v-model="dialogDian" persistent max-width="792px">
        <v-card>
          <v-layout wrap align-center>
            <div style="width:100%">
              <v-data-table
                :headers="headers_dianCheckout"
                :items="desserts_dianCheckout"
                class="elevation-1"
                hide-actions
              >
                <template v-slot:items="props">
                  <td>{{ props.item.employee.name}}</td>
                  <td>{{ props.item.employee.email }}</td>
                  <td>{{ props.item.point_type }}</td>
                  <td>{{ props.item.issue_stage }}</td>
                  <td>{{ props.item.issue_owner }}</td>
                  <td>{{ props.item.point }}</td>
                </template>
                <template v-slot:footer>
                  <td class="text-md-right" :colspan="headers_dianCheckout.length">
                    <v-btn color="primary" flat @click="dialogDian = false">关闭</v-btn>
                  </td>
                </template>
              </v-data-table>
            </div>
          </v-layout>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-flex md12 d-flex>
      <div class="table_title">点数发放申请列表</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="headers_dianList" :items="desserts_dianList" class="elevation-1">
          <template v-slot:items="props">
            <td>{{ desserts_dianList.indexOf(props.item) + 1 }}</td>
            <td>{{ props.item.status }}</td>
            <td>{{ props.item.issue_stage }}</td>
            <td>{{ props.item.point_sum}}</td>
            <td class="text-xs-center">
              <v-btn small color="primary" @click="checkoutDian(props.item)">查看</v-btn>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-layout>
    <v-flex md12 d-flex>
      <div class="table_title">
        <div>项目成员</div>
        <div class="btn-addMember">
          <v-btn normal color="primary" @click="addMember()">添加成员</v-btn>
        </div>
      </div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="headers_member" :items="desserts_member" class="elevation-1">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.email }}</td>
            <td class="text-xs-center">
              <v-btn small color="primary" @click="removeMember(props.item)">移除成员</v-btn>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-layout>
    <v-layout justify-center>
      <v-dialog v-model="dialogAddMember" persistent max-width="700px">
        <v-card>
          <v-card-title style="padding:40px 0 15px 60px;">
            <span class="headline">添加项目成员</span>
          </v-card-title>
          <v-layout wrap align-center>
            <v-flex md2></v-flex>
            <v-flex md2>
              <label>项目成员</label>
            </v-flex>
            <v-flex md6>
              <v-autocomplete
                label="请选择"
                :items="allmembers"
                item-text="name"
                item-value="_id"
                v-model="editedItem._id"
                @change="getEmail()"
              ></v-autocomplete>
            </v-flex>
            <v-flex md2></v-flex>
            <v-flex md2></v-flex>
            <v-flex md2>
              <label>电子邮箱</label>
            </v-flex>
            <v-flex md6>
              <v-text-field label="请输入" required v-model="editedItem.email"></v-text-field>
            </v-flex>
            <v-flex md2></v-flex>
          </v-layout>
          <v-card-actions style="padding:20px 85px 60px 0;">
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="dialogAddMember = false">取消</v-btn>
            <v-btn color="primary" flat @click="save()">添加</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-layout justify-center>
      <v-dialog v-model="dialogRemoveMember" persistent max-width="700">
        <v-card>
          <v-btn icon @click="dialogRemoveMember = false" class="icon_close">
            <v-icon>close</v-icon>
          </v-btn>
          <v-card-title class="headline" style="padding:75px 0 0 100px;">您确定要移除该成员吗？</v-card-title>
          <v-card-actions style="padding:30px 50px;">
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="dialogRemoveMember = false;">取消</v-btn>
            <v-btn color="primary" flat @click="confirmRemove()">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <v-flex md12 d-flex>
      <div class="table_title">
        <div>点数发放记录</div>
        <div class="btn-application">
          <v-btn normal color="primary" @click="application()">发放点数申请</v-btn>
        </div>
      </div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="headers_dian" :items="desserts_dian" class="elevation-1">
          <template v-slot:items="props">
            <td>{{ props.item.issue_date }}</td>
            <td>{{ props.item.employee.name }}</td>
            <td>{{ props.item.point_type }}</td>
            <td>{{ props.item.issue_stage }}</td>
            <td>{{ props.item.issue_owner }}</td>
            <!-- <td>{{ props.item.发放人员 }}</td>-->
            <td>{{ props.item.point }}</td>
          </template>
        </v-data-table>
      </div>
    </v-layout>
    <v-layout justify-center>
      <v-dialog v-model="dialogApplication" persistent max-width="980px">
        <v-card>
          <v-flex md12 d-flex>
            <div class="table_title2">
              <div>点数发放申请单</div>
            </div>
          </v-flex>
          <v-layout wrap align-center>
            <div style="width:100%;">
              <v-data-table
                :headers="headers_dianForm"
                :items="desserts_dianForm"
                class="elevation-1"
                hide-actions
              >
                <template v-slot:items="props">
                  <td width="150px;">
                    <v-autocomplete
                      label="成员列表"
                      :items="components1"
                      v-model="props.item.name"
                      item-value="_id"
                      item-text="name"
                      @change="getEmail1()"
                    ></v-autocomplete>
                  </td>
                  <td width="250px;">
                    <v-text-field label="请输入" required v-model="props.item.email"></v-text-field>
                  </td>
                  <td width="150px;">
                    <v-select
                      :items="['Management', 'Collaboration']"
                      label="勋章类别"
                      v-model="props.item.point_type"
                      required
                    ></v-select>
                  </td>
                  <td>项目执行中</td>
                  <td>百星</td>
                  <td>
                    <v-text-field label="请输入" v-model="props.item.point"  required></v-text-field>
                  </td>
                  <td class="text-xs-center">
                    <v-icon color="#e12015" @click="deleteAppForm(props.item)">remove</v-icon>
                  </td>
                </template>
                <template v-slot:footer>
                  <td :colspan="headers_dianForm.length-1">
                    <strong>本次申请发放点数合计：{{ point_sum }}</strong>
                    <!-- <strong>本次申请发放点数合计：{{ point_sum }}, cc：{{ cc_sum }}, pm：{{ pm_sum }}</strong> -->
                  </td>
                  <td class="text-md-center">
                    <v-btn small color="primary" :disabled="pmoalreadysend" @click="submitApplication()">提交申请</v-btn>
                  </td>
                </template>
              </v-data-table>
              <v-card-actions style="padding:30px 20px;">
                <v-spacer></v-spacer>
                <v-btn color="primary" flat @click="cancel()">取消</v-btn>
                <v-btn color="primary" flat   @click="addAppForm()">添加人员</v-btn>
              </v-card-actions>
            </div>
          </v-layout>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-layout style="padding:50px 10px 40px 0;">
      <v-spacer></v-spacer>
      <v-btn small color="primary" @click="goBack()">返回</v-btn>
    </v-layout>
    <v-snackbar color="info" top right :timeout="timeout" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">check_circle</v-icon>
      <div>{{info}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
    <v-snackbar color="error" top right :timeout="timeout0" v-model="snackbar0">
      <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
      <div>{{error}}</div>
      <v-icon color="white" size="16" @click="snackbar0 = false">clear</v-icon>
    </v-snackbar>
    <!-- 用于点数提示的snackbar -->
     <!-- 弹框 -->
    <v-snackbar color="error" top right v-model="snackbars">
      <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
      <div>{{pointTip}}</div>
      <v-icon color="white" size="16" @click="snackbars = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>

<script>
import { CLIENT_RENEG_LIMIT } from "tls";
export default {
  // name: "myProject/manage",
  data() {
    return {
      pointTip:"",
      snackbars:false,
      pmosenddoingcc:0,
      pmosenddoingpm:0,
      pmosendothercc:0,
      pmosendotherpm:0,
      moredoingcc:false,
      moredoingpm:false,
      moreendcc:false,
      moreendpm:false,
      pmosendpoint:[],
      pmoalreadysend:false,
      already_sum: {},
      dialogDian: false,
      pointLogId: "",
      dialogAddMember: false,
      dialogRemoveMember: false,
      dialogApplication: false,
      editedIndex: -1,
      index: "",
      i: "",
      info: "",
      error: "",
      timeout: 3000,
      snackbar: false,
      snackbar0: false,
      timeout0: 6000,
      members: [],
      allmembers:[],
      editedItem: {
        name: "",
        email: "",
        _id: ""
      },
      defaultItem: {
        name: "",
        email: ""
      },
      // components: [],
      components1: [],
      desserts_content: [],
      headers_medal: [
        {
          text: "勋章类别",
          align: "left",
          sortable: false
        },
        {
          text: "可发放总额-执行中",
          align: "left",
          sortable: false
        },
        {
          text: "已发放总额-执行中",
          align: "left",
          sortable: false
        },
        {
          text: "可发放总额-结案",
          align: "left",
          sortable: false
        },
        {
          text: "已发放总额-结案",
          align: "left",
          sortable: false
        },
        { text: "发放角色", align: "left", sortable: false }
      ],
      desserts_medal: [],
      headers_dianForm: [
        {
          text: "项目成员",
          align: "left",
          sortable: false
        },
        { text: "电子邮箱", align: "left", sortable: false },
        {
          text: "勋章类别",
          align: "left",
          sortable: false
        },
        {
          text: "发放点数时点",
          align: "left",
          sortable: false
        },
        {
          text: "项目单位",
          align: "left",
          sortable: false
        },
        { text: "发放点数额度", align: "left", sortable: false },
        { text: "功能", align: "center", sortable: false }
      ],
      desserts_dianForm: [],
      headers_dianList: [
        { text: "序号", align: "left", sortable: false },
        { text: "发放状态", align: "left", sortable: false },
        {
          text: "发放点数时点",
          align: "left",
          sortable: false
        },
        { text: "发放额度合计", align: "left", sortable: false },
        { text: "功能", align: "center", sortable: false }
      ],
      desserts_dianList: [],
      headers_dianCheckout: [
        { text: "用户名", align: "left", sortable: false },
        {
          text: "电子邮件信箱",
          align: "left",
          sortable: false
        },
        {
          text: "勋章类别",
          align: "left",
          sortable: false
        },
        {
          text: "发放点数时点",
          align: "left",
          sortable: false
        },
        {
          text: "项目单位",
          align: "left",
          sortable: false
        },
        { text: "发放总额度", align: "left", sortable: false }
      ],
      desserts_dianCheckout: [],
      headers_member: [
        { text: "用户名", align: "left", sortable: false },
        {
          text: "电子邮件信箱",
          align: "left",
          sortable: false
        },
        { text: "功能", align: "center", sortable: false }
      ],
      desserts_member: [],
      headers_dian: [
        { text: "发放日期", align: "left", sortable: false },
        { text: "用户名", align: "left", sortable: false },
        { text: "勋章类别", align: "left", sortable: false },
        { text: "发放点数时点", align: "left", sortable: false },
        { text: "项目单位", align: "left", sortable: false },
        // { text: "发放人员", align: "left", sortable: false },
        { text: "发放点数额度", align: "left", sortable: false }
      ],
      desserts_dian: [],
      log_id: "",
      project_stage: ""
    };
  },
  methods: {
    getTables_project() {
      this.$axios
        .get("/api/projectManagement/checkout_project", {
          params: {
            index: this.index
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts_content = res.data.result;
            this.projectId= this.desserts_content[0]._id 
            this.projectStatus=this.desserts_content[0].status
            this.desserts_medal = res.data.result;
            this.project_stage = res.data.result[0].status;
          } else if (res.data.status == "500") {
            this.error = "获取项目内容和勋章点数状态数据失败。";
            this.snackbar0 = true;
          }
        });
    },
    getTables_appFormList() {
      this.$axios
        .get("/api/projectManagement/checkout_logList", {
          params: {
            index: this.index
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts_dianList = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "获取点数发放申请列表数据失败。";
            this.snackbar0 = true;
          }
        });
    },
    getTables_member() {
      this.$axios
        .get("/api/projectManagement/checkout_member", {
          params: {
            index: this.index
          }
        })
        .then(res => {
          var names = [];
          this.members = res.data.result;
          for (const iterator of this.members) {
            names.push(iterator.name);
          }
          if (res.data.status == "200") {
            this.desserts_member = res.data.result;
            this.components1 = names;
          } else if (res.data.status == "500") {
            this.error = "获取项目成员数据失败。";
            this.snackbar0 = true;
          }
        });
    },
    getMembers() {
      this.$axios
        .get("/api/projectManagement/checkout_members", {})
        .then(res => {  
          // var names = [];
          // this.allmembers = res.data.result;
          // for (const iterator of this.allmembers) {
          //   names.push(iterator.name);
          // }
          if (res.data.status == "200") {
            this.allmembers = res.data.result;
            // this.components = names;
          } else if (res.data.status == "500") {
            this.error = "获取员工数据失败。";
            this.snackbar0 = true;
          }
        });
    },
    getEmail() {
      this.allmembers.forEach(item => {
        if (item._id == this.editedItem._id) {
          this.editedItem.email = item.email;
        }
      });
    },
    getTables_log() {
      this.$axios
        .get("/api/projectManagement/checkout_logs", {
          params: {
            index: this.index
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts_dian = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "获取点数发放记录数据失败。";
            this.snackbar0 = true;
          }
        });
    },
    checkoutDian(item) {
      this.dialogDian = true;
      this.getCheckoutDian(item._id);
    },
    getCheckoutDian(_id) {
      this.$axios
        .get("/api/projectManagement/checkout_dian", {
          params: {
            index: _id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts_dianCheckout = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "获取点数发放记录详情数据失败。";
            this.snackbar0 = true;
          }
        });
    },
    addMember() {
      this.dialogAddMember = true;
    },
    save() {
      // this.desserts_member.push(this.editedItem);
      this.members.forEach(item => {
        if (item.name == this.editedItem.name) {
          this.editedItem._id = item._id;
        }
      });
      this.$axios
        .post("/api/projectManagement/memberAdd", {
          index: this.index,
          id: this.editedItem._id
        })
        .then(res => {
          if (res.data.status == "200") {
            this.getTables_member();
            this.info = "添加成功！";
            this.snackbar = true;
            this.close();
          } else if (res.data.status == "500") {
            this.error = "添加失败！";
            this.snackbar0 = true;
          } else if (res.data.status == "304") {
            this.error = "该成员已存在。"
            this.snackbar0 = true;
          } 
        });
    },
    close() {
      this.dialogAddMember = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    removeMember(item) {
      this.dialogRemoveMember = true;
      this.i = this.desserts_member.indexOf(item);
    },
    confirmRemove() {
      this.dialogRemoveMember = false;
      this.$axios
        .post("/api/projectManagement/memberRemove", {
          index: this.index,
          id: this.desserts_member[this.i]._id
        })
        .then(res => {
          if (res.data.status == "200") {
            this.getTables_member();
            this.info = "删除成功！";
            this.snackbar = true;
          } else if (res.data.status == "500") {
            this.error = "删除失败！";
            this.snackbar0 = true;
          }
        });
    },
    application() {
      this.dialogApplication = true;
      //判读是否有可发放的点数
       this.pmosenddoingcc=0
       this.pmosenddoingpm=0
         this.pmosendothercc=0
          this.pmosendotherpm=0
        this.$axios
                .post("/api/pmo/cansendpoint", {
                  projectId:this.projectId
                }).then(res=>{
                  this.pmosendpoint=res.data.result
                  if(this.pmosendpoint.length==0){
                    this.pmoalreadysend=true
                  }else{
                     this.pmoalreadysend=false
                       res.data.result.forEach(item=>{
                         if(item.stage="项目执行中" ){
                          this.pmosenddoingcc=item.cc_point
                          this.pmosenddoingpm=item.pm_point
                         }else{  //包括了结案和奖励
                           this.pmosendothercc+=item.cc_point
                           this.pmosendotherpm+=item.pm_point
                         }
                          
                        })
                  }
                })         
    },
    getEmail1() {
      this.members.forEach(item => {
        if (item.name == this.editedItem1.name) {
          this.editedItem1.email = item.email;
          this.editedItem1.employee_id = item._id;
        }
      });
    },
    addAppForm() {
      (this.editedItem1 = {
        name: "",
        email: "",
        point_type: "",
        point: ""
      }),
        this.desserts_dianForm.push(this.editedItem1);
    },
    deleteAppForm(item) {
      const index1 = this.desserts_dianForm.indexOf(item);
      this.desserts_dianForm.splice(index1, 1);
      this.info = "删除成功！";
      this.snackbar = true;
    },
    cancel() {
      this.dialogApplication = false;
      this.desserts_dianForm = [];
    },
    submitApplication() {
      if (this.desserts_dianForm.length == 0) {
        this.error = "请添加成员！！";
        this.snackbar0 = true;
      } else {
  //根据项目的状态来判断金额
  // 1.pmo的可以比较
  // 2.拿到的添加的数据
  // 3.拿到已发的数据
  //拿已经发放的数据c c+计划发放的数据c c<=pmo发放的c c
  //拿已经发放的数据pm+计划发放的数据pm<=pmo发放的pm
         let PMalreadysenddoingcc=0
        let PMalreadysenddoingpm=0
        let PMalreadysendothercc=0
        let PMalreadysendotherpm=0
        let PMsendcc=0
        let PMsendpm=0
         this.$axios .get("/api/projectManagement/alreadysendtypesum", {  //已发放的
          params: {
            projectId: this.projectId
          }
        }).then(res=>{
         let  pomsenddata= res.data.result
               pomsenddata.forEach(item=>{
                if(item._id.issue_stage=="项目执行中"){
                  if(item._id.point_type=="Collaboration"){ //doing一发放
                    PMalreadysenddoingcc+=item.pointsum
                  }else{
                    PMalreadysenddoingpm+=item.pointsum
                  }
                }else {
                   if(item._id.point_type=="Collaboration"){//finished已发放
                    PMalreadysendothercc+=item.pointsum
                  }else{
                    PMalreadysendotherpm+=item.pointsum
                  }
                }
              })    

         this.desserts_dianForm.forEach(i=>{   //计划发放的
          if(this.projectStatus=="项目执行中"){
            if(i.point_type=="Collaboration"){
           
              this.moredoingcc=false
              PMsendcc+=Number(i.point)
              if( (PMsendcc+PMalreadysenddoingcc)>this.pmosenddoingcc){
                let a=PMsendcc+PMalreadysenddoingcc-this.pmosenddoingcc
                // alert("执行中超出cc合计"+s)
                this. snackbars=true
                this.pointTip="Collaboration点数超出可分配值"+a
                this.moredoingcc=true
              }
            }else {
               PMsendpm+=Number(i.point)
               this.moredoingpm=false
               if((PMsendpm+PMalreadysenddoingpm) > this.pmosenddoingpm){
                 let b=PMsendpm+PMalreadysenddoingpm-this.pmosenddoingpm
                 this. snackbars=true
                this.pointTip="Management点数超出可分配值"+b
                 this.moredoingpm=true
               }
            }
          }else {
             if(i.point_type=="Collaboration"){
                PMsendcc+=Number(i.point)
                this.moreendcc=false
              if( (PMsendcc+PMalreadysendothercc)>this.pmosendothercc){
                 let c=PMsendcc+PMalreadysendothercc-this.pmosendothercc
                 this.snackbars=true
                this.pointTip="Collaboration点数超出分配值"+c
                this.moreendcc=true
              }
            }else {
               PMsendpm+=Number(i.point)
               
               this.moreendpm=false
               if((PMsendpm+PMalreadysendotherpm)>this.pmosendotherpm){
                //  alert("结案超出pm合计")
                let d=PMsendpm+PMalreadysendotherpm-this.pmosendotherpm
                 this.snackbars=true
                this.pointTip="Management点数超出可分配值"+d
               this.moreendpm=ture
               }
            }
          }
        })
  
        if(this.moredoingcc==true||this.moredoingpm==true||this.moreendcc==true||this.moreendpm==true){
            // this.pmoalreadysend=true
        }else{
            this.$axios
          .post("/api/projectManagement/pointLogAdd", {
            index: this.index,
            point_sum: this.point_sum,
            issue_stage: this.project_stage
          })
          .then(res => {
            if (res.data.status == "200") {
              this.log_id = res.data.result._id;
              this.dialogApplication = false;
              this.getTables_appFormList();
              this.snackbar = true;
              this.info = "提交成功！";
              var issue_date = this.getNowDate();
              this.desserts_dianForm.forEach(item => {
                item["issue_date"] = issue_date;
                item["issue_owner"] = "百星";
                item["issue_stage"] = "项目执行中";
                item["project_id"] = this.index;
                item["point_log_id"] = this.log_id;
                item["status"] = "待审核";
              });
              this.$axios
                .post("/api/projectManagement/pointUserLogAdd", {
                  form: this.desserts_dianForm
                })
                .then(res => {
                  this.dialogApplication = false;
                  this.getTables_log();
                   this.snackbar = true;
                  this.info = "提交成功！";
                 
                });
              this.dialogApplication = false;
              this.desserts_dianForm = [];
            } else if (res.data.status == "500") {
               this.snackbar0 = true;
              this.error = "提交失败！";
             
            }
          });

        }
       
        })
     
       
      }
    },
    getPointSum() {
      this.$axios
        .get("/api/projectManagement/pointSum", {
          params: {
            index: this.index
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.already_sum = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "勋章点数求和失败！";
            this.snackbar0 = true;
          }
        });
    },
    goBack() {
      this.$router.go(-1);
    },
    getNowDate() {
      var date = new Date();
      var seperator1 = "-";
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      var currentdate = year + seperator1 + month + seperator1 + strDate;
      return currentdate;
    }
  },
  computed: {
    point_sum() {
      var result = 0;
      this.desserts_dianForm.forEach(item => {
        result += Number(item.point);
      });
      return result;
    }

  },
  mounted() {
    this.index = this.$route.query.index;
    this.getTables_project();
    this.getTables_appFormList();
    this.getTables_member();
    this.getMembers();
    this.getTables_log();
    this.getPointSum();
  }
};
</script>

<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
}
.table_title {
  background: #e0e1e2;
  font-family: PingFangSC-Regular;
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  color: #333300;
  height: 50px;
  margin-top: 42px;
}
.table_title2 {
  background: #e0e1e2;
  font-family: PingFangSC-Regular;
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  color: #333300;
  height: 50px;
}
.table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.table1 {
  width: 100%;
  border-collapse: collapse;
}
.table1 tr {
  text-indent: 25px;
  line-height: 30px;
  border-bottom: 1px solid #e0e1e2;
}
.th1 {
  font-weight: bold;
}
.btn-addMember,
.btn-application {
  float: right;
  position: relative;
  top: -50px;
}
.btn-addMember > button,
.btn-application > button {
  line-height: 28px !important;
}
.icon_close {
  float: right;
}
</style>