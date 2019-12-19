<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs4 sm2 md2 d-flex>
          <v-autocomplete
            :items="items"
            label="请选择/输入部门"
            v-model="department_selected"
            no-data-text="无结果"
          ></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="search()">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd()">
          <v-icon left>add</v-icon>新增部门
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="addShow">
            <v-card-title>
              <v-flex class="headline">新增部门</v-flex>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md3 offset-md1>
                    <v-subheader class="baseTitle">部门名称</v-subheader>
                  </v-flex>

                  <v-flex xs12 sm6 md4>
                    <v-text-field label="请输入部门名称" :rules="nameRules" v-model="departmentName"></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex xs12 sm6 md3 offset-md1>
                    <v-subheader class="baseTitle">主管名称</v-subheader>
                  </v-flex>

                  <v-flex xs12 sm6 md4>
                    <v-autocomplete
                      :items="itemsCharge"
                      item-text="name"
                      item-value="_id"
                      label="请选择"
                      
                      v-model="charge_id"
                    ></v-autocomplete>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="saveAdd">确定</v-btn>
            </v-card-actions>
          </v-card>
          <!-- 编辑弹框 -->
          <v-card v-show="editShow">
            <v-card-title>
              <span class="headline">编辑</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md3 offset-md1>
                    <v-subheader class="baseTitle">主管名称</v-subheader>
                  </v-flex>

                  <v-flex xs12 sm6 md4>
                    <v-autocomplete :items="itemsChargeEdit" label="请选择" v-model="employeeManager"   item-text="name" item-value="_id"></v-autocomplete>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="saveEdit">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="delShow">
            <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="handleClose">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="handleSave()">确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classifyBg">
      <v-flex xs12 class="classifyBgFlex">
        <p class="departmentP">部门管理</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-center" v-if="props.item.manager_name && props.item.manager_name.is_manager==true">{{ props.item.manager_name.name}}</td>
          <td class="text-xs-center" v-else-if="!(props.item.manager_name &&props.item.manager_name.is_manager==true)"></td>
          <td class="text-xs-center">
            <v-btn small color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn small color="info" @click="handleDelete(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 弹框 -->
    <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>
<script>
export default {
  name: "department",
  data() {
    return {
      dialog: false,
      editedIndex: -1,
      isAble: false,
      department_selected: "",
      addShow: false,
      item_id: "",
      itemsCharge: [],
      itemsChargeEdit: [],
      editShow: false,
      delShow: false,
      // 弹框信息
      top: true,
      right: false,
      color: "",
      titleTip: "",
      snackbar: false,
      employeeManager: "",
      charge_id: "",
      manager_id: "",
      departmentName: "",
      itemName: "",
      IndexItem: "",
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      items: [],
      headers: [
        { text: "部门名称", align: "center", sortable: false, value: "name" },
        { text: "部门主管", align: "center", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      desserts: [],
      // 表单验证
      nameRules: [
                v => !!v || '不能为空！',
            ],
      chargeRules: [
                v => !!v || '请选择一个！',
            ],
    };
  },
  activated(){
    this.getdepartment();
  },
  mounted() {
    this.getdepartment();
  },
  watch: {
    charge_id: function(newVal, oldVal) {
    },
    departmentName: function(newVal, oldVal) {}
  },
  methods: {
    getdepartment() {
      this.$axios
        .get("/api/departmentManagement/departmentInfo", {})
        .then(res => {
          this.desserts = res.data.result;
          for (const iterator of res.data.result) {
            this.items.push(iterator.name);
          }
          this.items.unshift("全部");
        });
    },
    search() {
      if (this.department_selected == "全部") {
        this.getdepartment();
        //弹框提示
        this.titleTip = "搜索成功！";
        this.snackbar = true;
        this.right = true;
        this.color = "info";
      } else if (!this.department_selected) {
        this.getdepartment();
        
      } else {
        this.$axios
          .get("/api/departmentManagement/departmentName", {
            params: { name: this.department_selected }
          })
          .then(res => {
            this.desserts = res.data.result;
            if (res.data.status == "200") {
              //弹框提示
              this.titleTip = "搜索成功！";
              this.snackbar = true;
              this.right = true;
              this.color = "info";
            } else if (res.data.status == "304") {
              this.titleTip = "搜索失败！";
              this.snackbar = true;
              this.right = true;
              this.color = "error";
            }
          });
      }
    },
    handleAdd() {
      this.$axios
        .get("/api/departmentManagement/allEmployeeInfo", {})
        .then(res => {
          for (const iterator of res.data.result) {
            this.itemsCharge.push(iterator);
          }
        });
      this.dialog = true;
      this.isAble = false;
      this.addShow = true;
      this.editShow = false;
      this.delShow = false;
    },
    handleEdit(item) {
      this.$axios
        .get("/api/departmentManagement/allEmployeeInfo", {})
        .then(res => {
          for (const iterator of res.data.result) {
            this.itemsChargeEdit.push(iterator);
            this.getdepartment()
          }
        });
      this.dialog = true;
      this.isAble = true;
      this.addShow = false;
      this.editShow = true;
      this.delShow = false;
      this.editedIndex = this.desserts.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem")
      this.editedItem = Object.assign({}, item);
      if(item.manager_name){
        this. employeeManager=item.manager_name._id
      }
    },
    handleDelete(item) {
      this.item_id = item._id;
      this.itemName = item.name;
      this.manager_id = item.manager_id;
      this.dialog = true;
      this.delShow = true;
      this.addShow = false;
      this.editShow = false;
      this.IndexItem = this.desserts.indexOf(item);
    },
    handleClose() {
      this.dialog = false;
    },
    handleSave() {
      this.$axios
        .delete("/api/departmentManagement/departmentDelete", {
          data: {
            charge_id: this.manager_id,
            _id: this.item_id
          }
        })
        .then(res => {
          this.getdepartment();
          for (const iterator of this.desserts) {
            this.items.pop(iterator.name);
          }
          if (res.data.status == "200") {
            //弹框提示
            this.titleTip = "删除成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";
          } else if (res.data.status == "201") {
            this.titleTip = "不能删除！";
            this.snackbar = true;
            this.right = true;
            this.color = "error";
          }
        });
      this.handleClose();
    },
    //增、改
    saveAdd() {
      if(this.departmentName!=""){
         this.$axios
        .put("/api/departmentManagement/departmentAdd", {
          name: this.departmentName,
          charge_id: this.charge_id
        })
        .then(res => {
          this.departmentName = "";
          this.charge_id = "";
          if(res.data.status=="200"){
            this.getdepartment();
            
            //弹框提示
            this.titleTip = "增加成功";
            this.color = "info";
            this.snackbar = true;
            this.right = true;
          }else{
            this.titleTip = "增加失败";
            this.color = "error";
            this.snackbar = true;
            this.right = true;
          }
           this.close();
        });
      }else{
         this.titleTip = "部门名称不能为空";
            this.color = "error";
            this.snackbar = true;
            this.right = true;
      }
     
     
      
    },
    saveEdit() { 
      this.$axios
        .put("/api/departmentManagement/departmentUpdate", {
          departmentName: this.editedItem.name,
          employee_id: this.employeeManager,
          department_id:this.editedItem._id,
        })
        .then(res => {
          this.getdepartment()
          this.employeeManager=''

        
          
        });
          this.close();
    },
    close() {
      this.dialog = false;
         this.employeeManager=''
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    }
  }
};
</script>
<style scoped>
.classifyBg {
  padding: 40px 20px 30px;
  box-shadow: 0px 0px 6px 1px #ccc;
  position: relative;
}
.classifyBgFlex {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.classifyBgFlex p {
  margin-bottom: 0px;
}
.classifyBgFlex p:nth-of-type(1) {
  color: #333300;
  font-size: 20px;
  margin-bottom: 5px;
}
.classifyBgFlex p:nth-of-type(1) {
  color: #333333;
  font-size: 15px;
}
.departmentP {
  padding-bottom: 15px;
}
.baseTitle {
  font-size: 18px;
}
.layout {
  align-items: center !important;
}
.delcontainer {
  padding: 30px;
  font-size: 20px;
  position: relative;
}
</style>
