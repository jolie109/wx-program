<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 d-flex class="searchSelect">
          <v-autocomplete
            v-model="searchSelect"
            :items="rankDesserts"
            item-text="name"
            label="请选择/输入类别"
          ></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="addShow">
            <v-card-title>
              <span class="headline">增加等级</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <span class="baseTitle">类别名称</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="rankDessertsAdd"
                      v-model="selectName"
                      item-text="name"
                      label="请选择"
                      required
                      :disabled="isAble"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">类别等级</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入等级名称" v-model="editedItem.name"></v-text-field>
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
          <v-card v-show="editShow">
            <v-card-title>
              <span class="headline">编辑内容</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <span class="baseTitle">类别名称</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select :label="rankDessertss" required :disabled="isAble"></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">类别等级</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入等级名称" v-model="editedItem.name"></v-text-field>
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
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="handleDelSave">确定</v-btn>
            </v-card-actions>
            <span class="delSpan" @click="close">X</span>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classifyBg">
      <v-flex xs12 class="classifyBgFlex">
        <p>等级管理</p>
        <p>等级</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-left" v-if="props.item.category">{{props.item.category.name}}</td>
          <td class="text-xs-left" v-else-if="!props.item.category"></td>
          <td class="text-xs-left" v-if="props.item">{{props.item.name}}</td>
          <td class="text-xs-left" v-else-if="!props.item"></td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item,props.item._key)">删除</v-btn>
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
import { required, numeric } from "vuelidate/lib/validators";
export default {
  name: "rankManagement",
  validations: {
      categoryAddSelectId: { required, numeric },
      gradeAddSelectId:{ required, numeric },
      editedItem:{
        name: { required , numeric },
      }
  },
  data() {
    return {
      dialog: false,
      isAble: false,
      addShow: false,
      editShow: false,
      delShow: false,
      titleTip: "",
      searchSelect: "",
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      editedIndex: -1,
      //items: ['学历', '新进员工工作经验', '新进员工特殊人才补贴', '新进员工其他加项', '在职员工管理加给', '新进员工其他补贴','在职'],
      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "等级名称", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      desserts: [],
      rankDesserts: [],
      rankDessertsAdd: [],
      rankDessertss: "",
      selectId: null,
      selectName: [],
      color:'',
      isChange:false,
      category:{
        name:""
      }
    };
  },
  created() {
    this.getSearchAll();
  },
  mounted(){
    this.getGradeAccount();
  },
  methods: {
    // 获取数据
    getGradeAccount() {
      this.$axios.get("/api/classify/getGradeAccount").then(res => {
        // 清空数组
        this.desserts.splice(0, this.desserts.length);
        this.desserts=res.data.result;
      });
    },
    handleAdd() {
      this.dialog = true;
      this.isAble = false;
      this.editShow = false;
      this.addShow = true;
      this.delShow = false;
    },
    handleEdit(item) {
      this.dialog = true;
      this.isAble = true;
      this.editShow = true;
      this.addShow = false;
      this.delShow = false;
      this.editedIndex = this.desserts.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      this.$axios
        .get("/api/classify/getGradeByGrade_list", {
          params: {
            category_id: this.editedItem.category_id,
            name: this.editedItem.name
          }
        })
        .then(res => {
          for (const iterator of res.data.result) {
            if (this.editedItem.name === iterator.name) {
              if (iterator.item.length > 0) {
                this.rankDessertss = iterator.item[0].name;
              }
            }
          }
        });
    },
    handleDelete(value) {
      this.dialog = true;
      this.addShow = false;
      this.editShow=false;
      this.delShow = true;
      this.value = value;
    },
    handleDelSave(value) {
      
      this.$axios
        .delete("/api/classify/deleteGrade", {
          data: {
            _id: this.value._id,
            category_id:this.value.category_id
          }
        })
        .then(res => {
          if(res.data.status == 200){
            var index=this.desserts.indexOf(this.value)
            this.desserts.splice(index,1)
            this.close();
            //弹框提示
            this.titleTip = res.data.msg;
            this.snackbar = true;
            this.right = true;
            this.color = "info";
          }else{
            this.titleTip = res.data.msg;
            this.snackbar = true;
            this.right=true;
            this.color = "error";
            this.close();
          }
          
        });
    },

    // 编辑
    saveEdit() {
      this.$axios
        .put("/api/classify/updateGrade", {
          name: this.editedItem.name,
          // _id:this.editedItem.category_id
          _id: this.editedItem._id
        })
        .then(res => {
          if (res.data.status == 200) {
            this.titleTip = res.data.msg;
            this.color = "info";
            this.snackbar = true;
            this.right = true;
            for (const v of this.desserts) {
              if (v._id === this.editedItem._id) {
                const index = this.desserts.indexOf(v)
                this.desserts.splice(index, 1, this.editedItem)
                break
              }
            }
          } else {
            this.titleTip = "编辑失败！";
            this.color = "error";
          }
        });
      this.close();
    },
    saveAdd() {
      if (this.selectName.length==0) {
        this.titleTip = "增加失败,没有选择类别名称";
        this.color = "error";
        this.snackbar = true;
        this.right = true;
      } else {
        var data={
            category_name: this.selectName,
            grade_name: this.editedItem.name
          }
        this.$axios
          .post("/api/classify/addGrade",data)
          .then(res => {
            if (res.data.status == 200) {
              this.titleTip = res.data.msg;
              this.color = "info";
              this.snackbar = true;
              this.right = true;
            // 在前端页面上增加，不需要在重新调用获取所有数据的方法
              var updateData = { 
                name: res.data.result[0].name ,
                _id:res.data.result[0]._id,
                category_id:res.data.result[0].category_id,
                category:{
                  name:this.selectName
                }
              };
              this.desserts.push(updateData);
              this.selectName='';     //增加时的清空
            } else if(res.data.status==0){
              this.titleTip = res.data.msg;
              this.snackbar = true;
              this.right = true;
              this.color = "error";
            }
            
          });
      }
      this.close();
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    // 搜索
    getSearchAll() {
      this.$axios.get("/api/classify/getGradeBycateGory").then(res => {
        this.rankDesserts = ["全部", ...res.data.result];
        this.rankDessertsAdd = res.data.result;
      });
    },
    handleSearch() {
      if (this.searchSelect === "全部") {
        this.getGradeAccount();
        return;
      }
      for (const iterator of this.rankDesserts) {
        if (iterator.name === this.searchSelect) {
          this.selectId = iterator._id;
          this.questSelect();
          break;
        }
      }
    },
    questSelect() {
      if(this.searchSelect){

      }
      this.$axios
        .get("/api/classify/getGradeBycateGory_list", {
          params: {
            _id: this.selectId
          }
        })
        .then(res => {
          this.desserts=res.data.result;
        });
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/classify.css";
.baseTitle {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
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
.delSpan {
  position: absolute;
  top: 15px;
  right: 25px;
  cursor: pointer;
}
.searchSelect /deep/ .theme--light.v-chip {
    background: none;
    font-size: 16px;
}
</style>
