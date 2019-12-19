<template>
  <v-container wrap grid-list-xl> 
    <v-layout align-center justify-start class="container" mb-5>
      <v-flex xs12 sm2 md3 d-flex>
        <v-autocomplete
          label="请选择/输入生产中心"
          :items="allWork"
          item-text="workName"
          v-model="pro_chosen"
          no-data-text="无结果"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 d-flex>
        <v-autocomplete
          label="请选择/输入机器"
          :items="allNickname"
          item-text="nickName"
          v-model="mac_chosen"
          no-data-text="无结果"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 offset-xs1>
        <v-btn color="info" round @click="getMachineList()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm2 md2>
        <v-btn color="info" round @click="handleClickAddMachine()">
          <v-icon>add</v-icon>新增机器
        </v-btn>
      </v-flex>
    </v-layout>
    <!-- topBar end -->
    <v-card class="margin_card" style="padding-bottom: 10px">
      <v-flex xs12 md12 d-flex>
        <div class="mytitle">
          <p class="title_h">生产管理</p>
          <p class="text">打印机器列表</p>
        </div>
      </v-flex>
     <v-flex xs12 sm12 md12 d-flex>
      <v-card class="margin_card">
          <v-data-table
            :headers="headers"
            :items="allMachine"
            class="elevation-1"
            no-data-text="该制作中心内暂无机器"
          >
            <template v-slot:items="props">
              <td class="text-xs-center">{{ props.item.serialNumber }}</td>
              <td class="text-xs-center">{{ props.item.nickName }}</td>
              <td class="text-xs-center">{{ props.item.item[0].workName}}</td>
              <td class="text-xs-center">{{ props.item.category }}</td>
               <td class="text-xs-center" id="td">
                  <div  id="type">
                 <p v-for="(types,index2) in props.item.type" :key="index2">
                    {{types|filterKey}} 
                  </p>
                  </div>
                </td>
              <td class="text-xs-center" id="td">
                <div id="p">
                   <p  v-for="(value, key) in props.item.click_count" :key="key">
                    {{key|filterKey}}&nbsp;&nbsp;{{value}} 
                  </p>
                </div>
                </td>
              <td class="text-xs-center">
                <v-icon
                  :color="props.item.status==='1'?'success':(props.item.status==='0'?'error':'disabled')"
                >fiber_manual_record</v-icon>
              </td>
              <td class="text-xs-center">
                <v-btn color="info" @click="handleClickEditMachine(props.item)" small>编辑</v-btn>
                <v-btn color="info" @click="deleteMachine(props.item)" small>删除</v-btn>
                <v-btn color="info" @click="downloadMiniProCode(props.item)" small>下载录入码</v-btn>
              </td>
            </template>
          </v-data-table>
    <v-layout class="absoluted">
      <div >
        <v-icon
         color="success"
          >fiber_manual_record</v-icon>
         <span> 开机</span>
      </div>
      <div >
        <v-icon
         color="error"
          >fiber_manual_record</v-icon>
         <span> 关机</span>
      </div>
       <div >
        <v-icon
         color="disabled"
          >fiber_manual_record</v-icon>
         <span> 报废</span>
      </div>
    </v-layout>
    </v-card>
   </v-flex>
    </v-card>
    <!-- add/edit machine dialog start -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <v-flex md3 class="dialog_title">{{ this.operate }}机器</v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">所属打印中心*</div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select
                  :items="allWork"
                  item-text="workName"
                  label
                  placeholder="请选择"
                  v-model="workName"
                  :error-messages="workNameErrors"
                  @change="$v.workName.$touch()"
                  @blur="$v.workName.$touch()"
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center v-show="this.showStep">
              <v-flex xs12 md3>
                <div class="subtitle-2">机器序列号*</div>
              </v-flex>
              <v-flex xs12 md8>
                <v-text-field
                  v-model="serialNumber"
                  label
                  type="text"
                  required
                  :error-messages="serialNumberErrors"
                  @blur="$v.serialNumber.$touch()"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center mb-5>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">设备分类*</div>
              </v-flex>
              <v-flex xs12 sm6 md8>
                <v-select
                  :items="categoryList"
                  label
                  placeholder="请选择"
                  v-model="category"
                  :error-messages="categoryErrors"
                  @change="$v.category.$touch()"
                  @blur="$v.category.$touch()"
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 md3>
                <div class="subtitle-2">机器小名*</div>
              </v-flex>
              <v-flex xs12 md8>
                <v-text-field
                  label
                  type="text"
                  required
                  v-model="nickName"
                  :error-messages="nickNameErrors"
                  @blur="$v.nickName.$touch()"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">设备状态*</div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select
                  :items="status_mac"
                  label
                  placeholder="请选择"
                  v-model="status"
                  :error-messages="statusErrors"
                  @change="$v.status.$touch()"
                  @blur="$v.status.$touch()"
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center v-show="this.category=='打印机'?true:false">
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">设备类型*</div>
              </v-flex>
               <v-flex xs12 sm6 md4>
                  <v-select
                    :items="machineType"
                    v-model="type"
                    label="请选择"
                    required
                    multiple
                    :class="type.length===0 ? 'tip':''"
                    ></v-select>
               </v-flex>
            </v-layout>
            <v-layout
              wrap
              align-center
              v-show="(category=='打印机')?true:false"
              v-for="(item,index) in type" :key="index"
            >
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">{{item}}&nbsp;&nbsp; 计数值*</div>
              </v-flex>
              <v-flex xs12 md8>
                <v-text-field
                  label
                  type="text"
                  required
                  v-model="clickCount[changeItem(item)]"
                  :error-messages="clickCountErrors"
                  :data-index="index"
                  :class="!clickCount[changeItem(item)]?'tip':'tips'"
                ></v-text-field>
                {{clickCount[item]}}
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="close" mr-2>取消</v-btn>
          <v-btn color="info" @click="saveInfo()">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- enable delete -->
    <v-layout row justify-center>
      <v-dialog v-model="deleteDialog" persistent max-width="663">
        <v-card>
          <v-card-title class="message">您确定要删除吗？</v-card-title>
          <v-btn icon class="close" @click="deleteDialog=false">
            <v-icon size="40">close</v-icon>
          </v-btn>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info darken-1" flat @click="deleteDialog = false">取消</v-btn>
            <v-btn color="info darken-1" flat @click="enableDeleteMachine()">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout> 
    <!-- snackBar -->
    <v-snackbar :color="color" top right v-model="snackbar">
      <v-icon color="white" mr-3 size="20">add_alert</v-icon>
      {{ info }}
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>
<script>
import { log } from "util";
import { required, alphaNum, numeric} from "vuelidate/lib/validators";
export default {
  name: "productionManagement",
  validations: {
    serialNumber: {required, alphaNum},
    nickName: { required },
    workName: { required },
    category: { required },
    type:{required},
    status: { required },
    clickCount: {required}
  },
  data() {
    return {
      eindex:'',
      isIndex:false,
      isCount:false,//判断计数值对象是否 有空值
      machineId: "", //编辑、删除时要用的机器id
      fullWork: {
        //制作中心“全部”选项
        workName: "全部"
      },
      fullMachine: {
        //机器“全部”选项
        nickName: "全部"
      },
      allMachine: [], //所有的机器
      allWork: [], //所有制作中心
      status_mac: ["开机", "关机", "损坏"],
      machineList: [], //机器列表
      pro_chosen: "", //制作中心选中
      mac_chosen: "", //机器选中
      machineByPro: [], //从制作中心获取的机器
      dialog: false, //弹框
      operate: "", //判断新增还是编辑
      showStep: false,
      serialNumber: "",
      nickName: "",
      workName: "",
      category: "",
      status: "",
      type: [],
      color: "",
      snackbar: false,
      info: "", //snackbar里的字
      allNickname: [], //所有机器小名
      deleteDialog: false, //删除的确认弹框
      categoryList: ["打印机", "覆膜机", "胶装机","其它"],
      machineType: ["黑白A3", "彩色A3", "黑白A4","彩色A4"], //设备类型为打印机时的类别
      headers: [
        {
          text: "序列号",
          value: "",
          sortable: false,
          align: "center"
        },
        { text: "小名", value: "nikeName", sortable: false, align: "center" },
        {
          text: "制作中心",
          value: "",
          sortable: false,
          align: "center"
        },
        {
          text: "设备分类",
          value: "",
          sortable: false,
          align: "center"
        },
         { text: "类型", value: "", sortable: false, align: "center" },
        {
          text: "计数值",
          value: "",
          sortable: false,
          align: "center",
        },
        { text: "状态", value: "", sortable: false, align: "center" },
        {
          text: "操作",
          value: "",
          sortable: false,
          align: "center",
          width: "360px"
        }
      ],
      access_token: "", // 小程序token
      clickCount:{
        type:Object,
        required: true
      },
    };
  },
  filters:{
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
    filterCount(item,count){
     if(item==='黑白A3'){
        return count.blackA3
      }
      if(item==='黑白A4'){
        return count.blackA4
      }
      if(item==='彩色A3'){
        return count.colorA3
      }
      if(item==='彩色A4'){
        return count.colorA4
      }
    }
  },
  computed: {
    pro_term: function() {
      //judge select content
      return (
        this.pro_chosen &&
        this.pro_chosen !== "全部" &&
        (!this.mac_chosen || this.mac_chosen == "全部")
      );
    },
    serialNumberErrors() {
      const errors = [];
      if (!this.$v.serialNumber.$dirty) return errors;
      !this.$v.serialNumber.required && errors.push("机器序列号不能为空");
      !this.$v.serialNumber.alphaNum && errors.push("非法机器序列号");
      return errors;
    },
    nickNameErrors() {
      const errors = [];
      if (!this.$v.nickName.$dirty) return errors;
      !this.$v.nickName.required && errors.push("机器小名不能为空");
      return errors;
    },
    workNameErrors() {
      const errors = [];
      if (!this.$v.workName.$dirty) return errors;
      !this.$v.workName.required && errors.push("请选择制作中心");
      return errors;
    },
    categoryErrors() {
      const errors = [];
      if (!this.$v.category.$dirty) return errors;
      !this.$v.category.required && errors.push("请选择设备类型");
      return errors;
    },
    statusErrors() {
      const errors = [];
      if (!this.$v.status.$dirty) return errors;
      !this.$v.status.required && errors.push("请选择设备状态");
      return errors;
    },
    clickCountErrors(val) {
      const errors = [];
      if (!this.$v.clickCount.$dirty) return errors;
      !this.$v.clickCount.required && errors.push("打印总量不能为空");
      return errors;
    }
  },
  methods: {
    // countError(e,index){
    //  this.eindex = Number(e.target.dataset.index)
    //   if(Number(this.eindex)===index){
    //     this.isIndex = true
    //   }else{
    //      this.isIndex = false
    //   }
    //   for(let key in this.clickCount){
    //     if(!this.clickCount[key]){
    //       this.isCount = true
    //     }else{
    //       this.isCount = false
    //     }

    //   }
    // },
    changeItem(item){
      if(item==='黑白A3'){
        return 'blackA3'
      }
      if(item==='黑白A4'){
        return 'blackA4'
      }
      if(item==='彩色A3'){
        return 'colorA3'
      }
      if(item==='彩色A4'){
        return 'colorA4'
      }

    },
    getWorkMachine(){
       this.$axios.get("/api/productionManagement/getAllMachine",{
        params:{
          workCenters:this.allWork
        }
      }).then(res => {
        let allMachine = res.data.result;
         this.allNickname = []
         if(this.pro_chosen && this.pro_chosen!='全部'){
           allMachine.forEach(machine=>{
             if(machine.item[0].workName===this.pro_chosen){
                this.allNickname.push(machine.nickName);
             }
           })
         }else if(!this.pro_chosen || this.pro_chosen==='全部'){
           allMachine.forEach(machine=>{
                this.allNickname.push(machine.nickName);
           })
         }
        // 在获取全部机器的时候把所有小名循环到一个新数组中，让选择机器select循环这个数组，给数组加上"全部"，不和allMachine打交道
        this.allNickname.unshift('全部');
      });
    },
    //   send request to get all machine
    getAllMachine() {
      this.$axios.get("/api/productionManagement/getAllMachine",{
        params:{
          workCenters:this.allWork
        }
      }).then(res => {
        this.allMachine = res.data.result;
         this.allNickname = []
         if(this.pro_chosen && this.pro_chosen!='全部'){
           this.allMachine.forEach(machine=>{
             if(machine.item[0].workName===this.pro_chosen){
                this.allNickname.push(machine.nickName);
             }
           })
         }else if(!this.pro_chosen || this.pro_chosen==='全部'){
           this.allMachine.forEach(machine=>{
                this.allNickname.push(machine.nickName);
           })
         }
        // 在获取全部机器的时候把所有小名循环到一个新数组中，让选择机器select循环这个数组，给数组加上"全部"，不和allMachine打交道
        this.allNickname.unshift('全部');
      });
    },
    handleClickAddMachine() {
      this.nickName = "";
      this.workName = "";
      this.category = "";
      this.type =[];
      this.serialNumber = "";
      this.status = "";
      // this.clickCount = 0;
      this.dialog = true;
      this.operate = "新增";
      this.showStep = true;
      if (this.allWork[0]=== "全部") {
        this.allWork.shift();
      }
    },
    handleClickEditMachine(item) {
      console.log(item)
      this.dialog = true;
      this.operate = "编辑";
      this.showStep = false;
      this.machineId = item._id;
      this.clickCount=item.clickCount;
      if (this.allWork[0] === "全部") {
        this.allWork.shift();
      }
      //default data
      this.nickName = item.nickName;
      this.category = item.category;
       if(this.category=='打印机'){
      this.type = item.type;
      let list=[]
      item.type.forEach(doc=>{
        if(doc==='blackA3'){
          list.push('黑白A3')
        }if(doc==='blackA4'){
          list.push('黑白A4')
        }if(doc==='colorA3'){
          list.push('彩色A3')
        }if(doc==='colorA4'){
          list.push('彩色A3')
        }
      })
      this.type=list;
      }else{
        this.type=[]
      }
      this.workName = item.item[0].workName;
      this.serialNumber = item.serialNumber;
      this.clickCount = item.click_count;
      console.log(this.clickCount)
      if (item.status === "1") {
        this.status = "开机";
      } else if (item.status === "0") {
        this.status = "关机";
      } else {
        this.status = "损坏";
      }
    },
    //search
    getMachineList() {
      if (this.pro_term) {
        //如果只选择了生产中心,按照制作中心查找机器
        this.$axios
          .get("/api/productionManagement/getMachineBypro", {
            params: { workName: this.pro_chosen }
          })
          .then(res => {
            if (res.data.status !== "200") {
            } else {
              this.allMachine = res.data.result[0].item;
            }
          });
      } else if (this.mac_chosen && this.mac_chosen !== "全部") {
        //没有选生产中心只选了小名或者选了生产中心和小名，按照小名查找
        this.$axios
          .get("/api/productionManagement/getMachineByName", {
            params: { nickName: this.mac_chosen }
          })
          .then(res => {
            this.allMachine = res.data.result;
          });
      } else {
        this.getAllMachine();
      }
    },
    saveInfo() {
      this.$v.$touch();
      for(let key in this.clickCount){
        if(!this.clickCount[key]){
         return false;
        }
      }
      if (
        this.serialNumber == "" ||
        this.serialNumber == false ||
        !/^[0-9a-zA-Z]*$/g.test(this.serialNumber) ||
        this.nickName == "" ||
        this.nickName == false ||
        this.workName == "" ||
        this.category == "" ||
        this.status == "" 
      ) {
        return false;
      }
      if(this.category==='打印机'&& this.type.length===0){
        return false;
      }
      this.dialog = false;
      if (this.status === "开机") {
        this.status = "1";
      } else if (this.status === "关机") {
        this.status = "0";
      } else {
        this.status = "2";
      }

      if (this.operate === "新增") {
        this.addMachine();
      } else {
        this.editMachine();
      }
      this.$v.$reset();
    },
    close() {
      this.dialog = false;
      this.$v.$reset();
    },
    addMachine() {
      let list=[]
      this.type.forEach(el=>{
        if(el==='黑白A3'){
       list.push('blackA3')
      }
      if(el==='黑白A4'){
         list.push('blackA4')
      }
      if(el==='彩色A3'){
         list.push('colorA3')
      }
      if(el==='彩色A4'){
        list.push('colorA4')
      }
      })
      let query={
          nickName: this.nickName,
          workName: this.workName,
          serialNumber: this.serialNumber,
          category: this.category,
          status: this.status,
        }
        if(this.type.length){
          query.type=list
          query.click_count=this.clickCount
        }
      //send request to add machine
      this.$axios
        .post("/api/productionManagement/addMachine", query)
        .then(res => {
          if(res.data.status=='400'){
           this.snackbar = true;
           this.info = "机器小名或序列号重复！";
           this.color = "error";
           return;
          }
          this.snackbar = true;
          this.info = "添加成功！";
          this.color = "info";
          this.clickCount={}
          if (this.allWork[0]!== "全部") {
            this.allWork.unshift('全部');
          }
          this.getMachineList();
        });
    },
    editMachine() {
      //send request to update machine info
      if (this.category != "打印机") {
        this.type =[];
      }else{
         for(let key in this.clickCount){
        if(!this.clickCount[key]){
          return;
        }
      }
      }
       let list=[]
      this.type.forEach(el=>{
        if(el==='黑白A3'){
       list.push('blackA3')
      }
      if(el==='黑白A4'){
         list.push('blackA4')
      }
      if(el==='彩色A3'){
         list.push('colorA3')
      }
      if(el==='彩色A4'){
        list.push('colorA4')
      }
      })
      this.$axios
        .post("/api/productionManagement/updateMachine", {
          machineId: this.machineId,
          workName: this.workName,
          updateList: {
            nickName: this.nickName,
            category: this.category,
            status: this.status,
            type: list,
            click_count: this.clickCount
          }
        })
        .then(res => {
          if(res.data.status==='400'){
          this.snackbar = true;
          this.info = `${res.data.msg}`;
          this.color = "error";  
          return false;
          }
          this.getMachineList();
          this.snackbar = true;
          this.info = "编辑成功！";
          this.color = "info";
        })
        .catch(() => {
          this.snackbar = true;
          this.info = "编辑失败！";
          this.color = "error";
        });
    },
    deleteMachine(item) {
      this.deleteDialog = true;
      this.machineId = item._id;
    },
    enableDeleteMachine() {
      this.deleteDialog = false;
      this.$axios
        .delete("/api/productionManagement/delMachine", {
          data: {
            machineId: this.machineId
          }
        })
        .then(res => {
          if (res.data.status !== "200") {
            this.snackbar = true;
            this.info = "删除失败！";
            this.color = "error";
          } else {
            this.getAllMachine();
            this.snackbar = true;
            this.info = "删除成功！";
            this.color = "info";
          }
        });
    },
    //获取用户权限内的制作中心
     _getUserCenters() {
      const tel = localStorage.getItem("tel");
      this.$axios
        .get("/api/productionManagement/getUserCenters", {
          params: { tel: tel }
        })
        .then(res => {
          this.allWork = res.data.result;
      if (this.allWork[0]!== "全部") {
        this.allWork.unshift('全部');
      }
      this.getAllMachine()
        });
    },
    // 下载该机器的小程序码
    downloadMiniProCode(item) {
      // 发送请求获取小程序的access_token
      this.$axios
        .get("/wx/cgi-bin/token", {
          params: {
            grant_type: "client_credential",
            appid: "wxcf0528db896ba86c",
            secret: "8bf21be806fd5877d765e3fdfb72b929"
          }
        })
        .then(res => {
          this.access_token = res.data.access_token;
          // 获取当前机器的小程序录入码
          this.$axios({
            method: "post",
            url: `/wx/wxa/getwxacodeunlimit?access_token=${res.data.access_token}`, // 请求URL
           data: {
             scene:`id=${item._id}`,
             page  :'pages/index/index'
            },
            responseType: "blob" // 设置返回的数据类型为二进制数据
          }).then(response => {
            this.downloadFile(response, item); // 将返回结果作为参数调用本地下载文件方法
          });
        });
    },
    downloadFile(data, item) {
      var _that = this;
      if (!data) {
        return;
      }
      let url = window.URL.createObjectURL(new Blob([data.data])); // 后台返回结果data是个对象，其中的data属性才是文件的二进制数据
      let link = document.createElement("a"); // 创建a标签
      link.style.display = "none"; // 设置a标签不可见
      link.href = url; // 设置a标签的URL属性
      link.setAttribute("download", `${item.nickName}.jpg`); // 给a标签添加download属性并指定下载的文件名
      document.body.appendChild(link); // 将a标签节点添加在DOM中
      link.click(); // 触发a标签
    }
  },
  mounted() {
    //send request to get allWork
    this. _getUserCenters()
  },
  watch:{
    type(val){
          let click_count={}
      let clickCount = this.clickCount
      val.forEach(el=>{
       let ele = this.changeItem(el)
       click_count[ele]=clickCount[ele]
      })
      this.clickCount =  click_count
    },
     pro_chosen(val) {
      this.getWorkMachine()
    },
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
.tips{
  position: relative;
  color: rgb(135, 135, 135)
}
.tips::after {
  position: absolute;
  top: 75%;
  content: "【注：一旦执行复位操作，将会影响该台机器当天的计数，请谨慎操作。】";
  font-size: 16px;
}
.tip{
  position: relative;
  color: rgb(135, 135, 135)
}
.tip::after {
  position: absolute;
  top: 75%;
  content: "请填写机器类型或计数值";
  font-size: 16px;
  color:red;
}

.absoluted{
  position: absolute;
  bottom:27px;
  left:36px;
  font-size:0;
}
.absoluted div span{
  font-size:16px;
  margin-right:40px!important;
  vertical-align: top;
}
.flex{
  display: flex;
  flex-direction: column;

}
#td{
  padding:0;
}
#type{
  width:70px;
}
#p{
  width:110px;
}
#type,#p{
  width:100%;

}
/* #type p,#p p{
  padding:0 20px;
} */
</style>