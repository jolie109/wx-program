<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 class="searchSelect">
          <v-autocomplete v-model="secrchSelect" :items="newArr"  label="请选择/输入分类"></v-autocomplete>
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
              <span class="headline">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap  v-if="isAble==false">
                  <span class="baseTitle">薪资组成</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="dessertsAll"
                      item-text="category_type"
                      v-model="categoryType"
                      label="请选择"
                      required
                      :disabled="isAble"
                        @change="$v.categoryType.$touch()"
                       :error-messages="typeErrors"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">类别名称</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入分类名称"
                     v-model="editedItem.name"
                       @change="$v.editedItem.name.$touch()"
                         :error-messages="nameErrors"
                     ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="save">确定</v-btn>
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
        <p>分类管理</p>
        <p>分类</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <!-- <td class="text-xs-left">{{ props.item.is_use==true ? "是":"否" }}</td> -->
          <td><v-switch v-model="props.item.is_use" @change="isUse(props.item)"></v-switch></td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item)">删除</v-btn>
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
  name: "ClassifyManagement",
  validations: {
      categoryType: { required },
      editedItem:{
        name: { required },
      }
  },
  data() {
    return {
      dialog: false,
      editedIndex: -1,
      isAble: false,
      addShow: false,
      delShow: false,
      categoryId: "",
      color: "info",
      titleTip: "",
      secrchSelect: "",
      // 弹框信息
      top: true,
      right: true,
      snackbar: false,
      categoryType:'',
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "是否使用", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      desserts: [],
      dessertsAll:['基本薪资','每月加给'],
      newArr: ["全部"]
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "增加分类" : "编辑内容";
    },
    typeErrors() {
      const errors = [];
      if (!this.$v.categoryType.$dirty) return errors;
      !this.$v.categoryType.required &&
        errors.push("不能为空。");
      !this.$v.categoryType.required;
      return errors;
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required &&
        errors.push("不能为空。");
      !this.$v.editedItem.name.required;
      return errors;
    },
  },
  created() {
    this.getCategoryAccount();
  },
  watch:{
    categoryType:function(newVal,oldVal){
    }
  },
  methods: {
    // 获取数据
    getCategoryAccount() {
      this.$axios.get("/api/classify/getCategoryAccount").then(res => {
        this.desserts = res.data;
        for (let i = 0; i < this.desserts.length; i++) {
          this.newArr.push(this.desserts[i].category_type);
        }
      });
    },
    handleAdd() {
      this.dialog = true;
      this.isAble = false;
      this.addShow = true;
      this.delShow = false;
    },
    handleEdit(item) {
      this.dialog = true;
      this.isAble = true;
      this.addShow = true;
      this.delShow = false;
      this.editedIndex = this.desserts.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      this.categoryType=this.editedItem.category_type
    },
    handleDelete(item) {
      this.dialog = true;
      this.addShow = false;
      this.delShow = true;
      this.item = item;
    },
    handleDelSave() {
      this.$axios
        .delete("/api/classify/deleteCategory", {
          data: {
            _id: this.item._id
          }
        })
        .then(res => {
          if (res.data.status == 200) {
            // 前端页面上的假删除
            var index = this.desserts.indexOf(this.item);
            this.desserts.splice(index, 1);
            this.close();
            //弹框提示
            this.titleTip = res.data.msg;
            this.snackbar = true;
            this.color = "info";
          }else{
              this.titleTip = res.data.msg;
              this.snackbar = true;
              this.color = "error";
               this.close();
          }
        });
    },
    //增、改,
    save() {
        this.$v.$touch();
     
         // if编辑else增加
      if (this.editedIndex > -1) {
        if(this.editedItem.name=='' ){
        return false
        }else{
           this.$axios
          .post("/api/classify/update", {
            name: this.editedItem.name,
            _id: this.editedItem._id
          })
          .then(res => {
            if (res.data.status == 200) {
              this.titleTip = res.data.msg;
              this.color = "info";
              this.snackbar = true;
              this.right = true;
              // 在前端页面上编辑，不需要在重新调用获取所有数据的方法 this.getCategoryAccount();
              for (const v of this.desserts) {
                if (v._id === this.editedItem._id) {
                  const index = this.desserts.indexOf(v);
                  this.desserts.splice(index, 1, this.editedItem);
                  break;
                }
              }
            } else {
              this.titleTip = "编辑失败！";
              this.color = "error";
            }
               this.close();
          });

        }
       
          
      } else {
       if(this.categoryType=='' ||this.editedItem.name=='' ){
        return false
      }else{
         var dataCategory = {
          category_type: this.categoryType,
          name: this.editedItem.name
        };
        this.$axios
          .post("/api/classify/addCategory", dataCategory)
          .then(res => {
            this.categoryType=''
            if (res.data.status == 0) {
              this.titleTip = res.data.msg;
              this.color = "error";
              this.snackbar = true;
            } else if (res.data.status == 200) {
              this.titleTip = res.data.msg;
              this.snackbar = true;
              this.color = "info";
              // 在前端页面上增加，不需要在重新调用获取所有数据的方法
              var updateData = { _id:res.data.result[0]._id,name: res.data.result[0].name ,is_use:res.data.result[0].is_use};
              this.desserts.push(updateData);
              //  this.getCategoryAccount();
            }
          });
           this.close();

      }
       
      }
     
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 200);
    },
    handleSearch() {
      if (this.secrchSelect == "全部") {
        this.getCategoryAccount();
      } else {
        this.$axios
          .get("/api/classify/searchCategoryAccount", {
            params: {
              category_type: this.secrchSelect
            }
          })
          .then(res => {
            this.desserts = res.data.result;
          });
      }
    },
    isUse(item){
      this.$axios.post('/api/classify/salary_Structure',{
        category_id : item._id,
        is_use : item.is_use
      }).then(res=>{
        if(res.data.status == '200'){
          this.titleTip=res.data.msg;
          this.color='info';
          this.snackbar=true;
          this.right=true;

        }              
      })
    }
  }
};
</script>
<style scoped>
.searchSelect
  /deep/
  .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
  > .v-input__control
  > .v-input__slot {
  box-shadow: none;
  border-bottom: 1px solid #ccc;
  background: #f9f9f9;
}
.searchSelect /deep/ .theme--light.v-chip {
  background: none;
  font-size: 16px;
}
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
.elevation-1 /deep/ .v-input--selection-controls:not(.v-input--hide-details) .v-input__slot{
  margin-top: 12px!important;
  margin-bottom: 0px!important;
}
.elevation-1 /deep/ .accent--text{
       color: rgb(37, 72, 226)!important;
   }
</style>

