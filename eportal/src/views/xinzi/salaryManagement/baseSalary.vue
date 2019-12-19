<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs4 sm2 md2 d-flex>
          <v-autocomplete
            :items="item_grade"
            item-text="name"
            item-value="_id"
            v-model="searchCategoryID"
            label="请选择分类"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs4 sm2 md2 d-flex v-if="isGradeName">
          <v-autocomplete
            :items="allGradeName"
            item-text="name"
            item-value="_id"
            v-model="searchGradeId"
            label="请选择等级"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs4 sm2 md2 d-flex v-else>
          <v-autocomplete 
            :items="allGradeName" 
            item-text="name" 
            v-model="searchGradeId" 
            label="请选择等级"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs4 sm2 md2 d-flex v-if="islevelName">
          <v-autocomplete
            :items="item_level"
            item-text="name"
            item-value="_id"
            v-model="searchLevelId"
            label="请选择级别"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs4 sm2 md2 d-flex v-else>
          <v-autocomplete 
            :items="item_level" 
            item-text="name" 
            v-model="searchLevelId" 
            label="请选择级别"
          ></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSelect">
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
                <v-layout wrap v-if="addDisplay">
                  <span class="baseTitle">类别名称</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="allCategory"
                      item-text="name"
                      item-value="_id"
                      v-model="categoryId"
                      label="请选择分类"
                      required
                       :error-messages="categoryErrors" 
                      @blur="$v.categoryId.$touch()"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap v-if="addDisplay">
                  <span class="baseTitle">类别等级</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="addGradeName"
                      item-text="name"
                      item-value="_id"
                      v-model="gradeId"
                      label="请选择等级"
                      required
                       :error-messages="gradeErrors" 
                      @blur="$v.gradeId.$touch()"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap v-if="addDisplay">
                  <span class="baseTitle">等级级别</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="addLevelName"
                      item-text="name"
                      item-value="_id"
                      v-model="levelId"
                      label="请选择级别"
                      required
                        :error-messages="levelErrors" 
                      @blur="$v.levelId.$touch()"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">金 额</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field 
                      v-model="editedItem.amount"
                      :rules="rules"
                      required
                      :error-messages="amountErrors" 
                      @blur="$v.editedItem.amount.$touch()"
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
        <p>基本薪资</p>
        <p>基本薪资列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.item_category.name }}</td>
          <td class="text-xs-left">{{ props.item.item_grade.name }}</td>
          <td class="text-xs-left">{{ props.item.item_level.name }}</td>
          <td class="text-xs-left">{{ props.item.amount }}</td>
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
  name: "baseSalary",
   validations: {
   
      categoryId: { required, numeric },
      gradeId: { required , numeric },
      levelId: { required, numeric},
      editedItem:{
        amount:{required,numeric}
      },
  
  },
  data() {
    return {
      dialog: false,
      editedIndex: -1,
      isAble: false,
      addShow: false,
      delShow: false,
      addDisplay: true,
      titleTip: "",
      // 弹框信息
      top: true,
      right: false,
      color:"",
      snackbar: false,
      //编辑弹框绑定数据
      editedItem: {
        categoryName: "",
        gradeName: "",
        levelName: "",
        amount: "",
        category_id: "",
        grade_id: "",
        level_id: ""
      },
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "分类", sortable: false, value: "name" },
        { text: "等级", sortable: false, value: "name" },
        { text: "级别", sortable: false, value: "name" },
        { text: "金额", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      desserts: [],
      item_grade: ["全部"],
      item_level: ["全部"],
      allGradeName: [],
      gradesItem: {
        name: "全部"
      },
      categoryId: "",
      gradeId: "",
      levelId: "",
      //搜索时的ID
      searchCategoryID: "",
      searchGradeId: "",
      searchLevelId: "",
      newCategory_id: "",
      //增加时的数组
      allCategory: [],
      addGradeName: [],
      addCategory_id: "",
      addLevelName: [],
      deleteItem: {
        _id: ""
      },

      //判断是否是全部时监听name
      islevelName: true, //第一个select
      isGradeName: true, //第二个select
      rules: [
                value => !!value ,//首字母不能为空
                value => {
                const pattern = /^[0-9]*$/;
                return pattern.test(value) || '请输入正确的薪资.'
                },
            ],
      valid: true,
    };
  },
  computed: {
    //增加、编辑弹框标题
    formTitle() {
      return this.editedIndex === -1 ? "增加薪资" : "编辑薪资";
    },
    categoryErrors() {
      const errors = [];
      if (!this.$v.categoryId.$dirty) return errors;
      !this.$v.categoryId.required &&
        errors.push("不能为空。");
      !this.$v.categoryId.numeric ;
      return errors;
    },
    gradeErrors() {
      const errors = [];
      if (!this.$v.gradeId.$dirty) return errors;
      !this.$v.gradeId.required &&
        errors.push("不能为空。");
      !this.$v.gradeId.numeric ;
      return errors;
    },
    levelErrors() {
      const errors = [];
      if (!this.$v.levelId.$dirty) return errors;
      !this.$v.levelId.required &&
        errors.push("不能为空。");
      !this.$v.levelId.numeric ;
      return errors;
    },
    amountErrors() {
      const errors = [];
      if (!this.$v.editedItem.amount.$dirty) return errors;
      !this.$v.editedItem.amount.required &&
        errors.push("不能为空。");
      !this.$v.editedItem.amount.numeric ;
      return errors;
    },
  },
  methods: {
    handleAdd() {
      this.dialog = true;
      //点击增加时select可用
      this.isAble = false;
      this.addShow = true;
      this.delShow = false;
      this.addDisplay = true;
    },
    handleSelect() {
      if (this.searchCategoryID && this.searchGradeId && this.searchLevelId) {
        if (this.searchCategoryID == "全部") {
          if (this.searchGradeId == "全部") {
            if (this.searchLevelId == "全部") {
              this.getAllSalary1();
            } else {
              this.$axios
                .get("/api/salaryManagement/search_qqx", {
                  params: {
                    level_name: this.searchLevelId,
                    category_type: "基本薪资"
                  }
                })
                .then(res => {
                  this.desserts = res.data.result;
                });
            }
          } else {
            if (this.searchLevelId == "全部") {
              this.$axios
                .get("/api/salaryManagement/search_qxq", {
                  params: {
                    grade_name: this.searchGradeId,
                    category_type: "基本薪资"
                  }
                })
                .then(res => {
                  this.desserts = res.data.result;
                });
            } else {
              this.$axios
                .get("/api/salaryManagement/search_qxx", {
                  params: {
                    grade_name: this.searchGradeId,
                    level_id: this.searchLevelId,
                    category_type: "基本薪资"
                  }
                })
                .then(res => {
                  this.desserts = res.data.result;
                });
            }
          }
        } else {
          if (this.searchGradeId == "全部") {
            if (this.searchLevelId == "全部") {
              this.$axios
                .get("/api/salaryManagement/search_xqq", {
                  params: {
                    category_id: this.searchCategoryID,
                    // level_id:this.searchLevelId,
                    // level_id: this.searchLevelId,
                    category_type: "基本薪资"
                  }
                })
                .then(res => {
                  this.desserts = res.data.result
                });
            } else {
              this.$axios
                .get("/api/salaryManagement/search_xqx", {
                  params: {
                    category_id: this.searchCategoryID,
                    // level_id:this.searchLevelId,
                    level_id: this.searchLevelId,
                    category_type: "基本薪资"
                  }
                })
                .then(res => {
                  this.desserts = res.data.result
                });
            }
          } else {
            if (this.searchLevelId == "全部") {
              this.$axios
                .get("/api/salaryManagement/search_xxq", {
                  params: {
                    category_id: this.searchCategoryID,
                    grade_id:this.searchGradeId,
                    // level_id: this.searchLevelId,
                    category_type: "基本薪资"
                  }
                })
                .then(res => {
                  this.desserts = res.data.result
                });
            } else {
                this.$axios.get('/api/salaryManagement/getSalary_list',{
                    params:{
                        category_id : this.searchCategoryID,
                        grade_id : this.searchGradeId,
                        level_id : this.searchLevelId,
                        category_type : "基本薪资"
                    }
                }).then(res=>{
                    this.desserts = res.data.result
                })
            }
          }
        }
      }
    },
    handleEdit(item) {
      this.dialog = true;
      this.addShow = true;
      this.delShow = false;
      this.addDisplay = false;
      this.editedIndex = this.desserts.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      //select禁用
      this.isAble = true;
      this.editedItem = {
        category_id: item.item_category._id,
        grade_id: item.item_grade._id,
        level_id: item.item_level._id,
        amount: item.amount
      };
    },
    handleDelete(value) {
      this.deleteItem._id = value._id;
      this.dialog = true;
      this.addShow = false;
      this.delShow = true;
    },
    handleDelSave(value) {
      let index = this.desserts.indexOf(value);
      this.desserts.splice(index, 1);
      this.close();
      this.$axios
        .delete("/api/salaryManagement/deleteSalary", {
          data: {
            _id: this.deleteItem._id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.snackbar = true;
            this.titleTip = "删除成功！";
            this.color = "info";
            this.right = true;
            this.getAllSalary1();
          } else {
            this.snackbar = true;
            this.titleTip = "删除失败！";
            this.color = "error";
            this.right = true;
          }
        });
    },
    //增、改
    save() {
       this.$v.$touch();
      // if(this.editedItem.amount==''||this.categoryId==""||this.geadeId=="" ||this.levelId==""){
      //   console.log(1111);
      //   return false
      // }else{
        if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
        //   console.log(this.editedItem.category_id,this.editedItem.grade_id,this.editedItem.level_id,this.editedItem.amount);
        this.$axios
          .post("/api/salaryManagement/editBaseSalary", {
            category_id: this.editedItem.category_id,
            grade_id: this.editedItem.grade_id,
            level_id: this.editedItem.level_id,
            amount: this.editedItem.amount
          })
          .then(res => {
            if(res.data.status == '200'){
              // console.log(res.data.result);
              this.getAllSalary1();
              this.close()
              //弹框提示
              this.titleTip = "编辑成功！";
              this.snackbar = true;
              this.color = "info";
              this.right = true;
            }
          });
      } else {
        // this.desserts.push(this.editedItem);
        // console.log(this.categoryId , this.gradeId,this.levelId,this.editedItem.amount);
         if(this.editedItem.amount==''||this.categoryId==""||this.geadeId=="" ||this.levelId==""){
        return false
         }
       else{this.$axios
          .post("/api/salaryManagement/addSalary", {
            category_id: this.categoryId,
            grade_id: this.gradeId,
            level_id: this.levelId,
            amount: this.editedItem.amount,
            category_type: "基本薪资"
          })
          .then(res => {
            if (res.data.status == "400") {
              //弹框提示
              this.titleTip = "增加失败，该数据已存在";
              this.color = "error"
              this.snackbar = true;
              this.right = true;

            } else if (res.data.status == "200") {
              //弹框提示
              this.titleTip = "增加成功";
              this.snackbar = true;
              this.right = true;
              this.color = "info";

              this.getAllSalary1();
              this.close();
            }

              this.categoryId = '';
              this.gradeId = '';
              this.levelId = '';
              this.editedItem.amount = '';
          });
      }
      }

      
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    //渲染前端页面
    getAllSalary1() {
      this.$axios
        .get("/api/salaryManagement/getSalary", {
          params: {
            category_type: "基本薪资"
          }
        })
        .then(res => {
         if(res.data.status=="200"){
            this.desserts = res.data.result;
          for (const iterator of res.data.result) {

            this.allGradeName.push(iterator.item_grade);
            this.item_level.push(iterator.item_level);

            // add
            this.addGradeName.push(iterator.item_grade);
            this.addLevelName.push(iterator.item_level);
          }
          this.allGradeName.unshift(this.gradesItem);

         }
         
        });

      //增加时每个select的值
      this.$axios
        .get("/api/salaryManagement/getSalaryAccount", {
          params: {
            category_type: "基本薪资"
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            for (const iterator of res.data.result) {
              this.allCategory.push(iterator);
              this.item_grade.push(iterator);
            }
          }
        });
    },
    // 监听时绑定的id
    // 增加全部
    watchCategoryAdd(newVal) {
      this.$axios
        .get("/api/salaryManagement/ListenGradeByCategory", {
          params: {
            category_type: "基本薪资",
            category_id: newVal //分类的id
          }
        })
        .then(res => {
          if(res.data.status=="200"){
              this.allGradeName.length = 0;
              for (const iterator of res.data.result) {
                this.allGradeName.push(iterator);
              }
              this.allGradeName.unshift(this.gradesItem);

          }
          // this.allGradeName.unshift(this.gradesItem);
        });
    },

    watchCategoryAdd2(newVal,categoryId) {

      if (this.newAllCate == "全部") {

        this.$axios
          .get("/api/salaryManagement/selectAllLevel", {
            params: {
              category_type: "基本薪资",
              grade_id: newVal //等级的id
            }
          })
          .then(res => {
            this.item_level.length = 0;
            for (const iterator of res.data.result) {
              this.item_level.push(iterator.item_level);
            }
            this.item_level.unshift(this.gradesItem);
          });
      } else if (newVal !== "全部") {
        // console.log("重新获取level的name");
        this.$axios
          .get("/api/salaryManagement/ListenLevelByGrade", {
            params: {
              category_type: "基本薪资",
              category_id: this.newCategory_id,
              grade_id: newVal //等级的id
            }
          })
          .then(res => {
            // console.log(res.data.result);
            this.item_level.length = 0;
            for (const iterator of res.data.result) {
              this.item_level.push(iterator.item_level);
            }
            this.item_level.unshift(this.gradesItem);
          });
      }
    },
    //点击增加按钮
    watchCategory(newVal) {
      // console.log(newVal);
      this.addGradeName.length = 0;
      this.addLevelName.length = 0;
      if(newVal){
          this.$axios
        .get("/api/salaryManagement/ListengetCategoryByGrade", {
          params: {
            category_type: "基本薪资",
            category_id: newVal //分类的id
          }
        })
        .then(res => {
          // console.log(res.data.status)
          if(res.data.status=="200"){
            this.addLevelName.length = 0;
           for (const iterator of res.data.result) {
            this.addGradeName.push(iterator);
          }
          }else if(res.data.status=="404"){
             this.addGradeName=[];
             this.addLevelName=[];
          }
         
        });
      }
      
    },
    watchGrade(newVal) {
      // console.log(newVal);
      if(newVal){
        this.$axios
        .get("/api/salaryManagement/ListenLevelByGrade", {
          params: {
            category_type: "基本薪资",
            category_id: this.addCategory_id,
            grade_id: newVal //等级的id
          }
        })
        .then(res => {

          this.addLevelName.length = 0;
          if(res.data.status=="200"){
          this.addLevelName.length = 0;
          for (const iterator of res.data.result) {
            if(iterator.item_level){
              this.addLevelName.push(iterator.item_level);
            }
            
          }
          }else if(res.data.status=="404"){
              this.addLevelName=[]
          }
          
        });
      }
      
    },
    //select中第一个选中全部时
    watchCategory_grade(newVal) {
    //   console.log("object" + newVal);
      //根据 grade 的 name 去获取以下所有的级别
    }
  },
  mounted() {
    this.getAllSalary1();
  },
  watch: {
    // 搜索时监听v-model绑定的值传给后端
    searchCategoryID: function(newVal, oldVal) {
    //   console.log(newVal);

      if (newVal == "全部") {
        // this.getAllSalary1();
        this.newAllCate = newVal;
        this.isGradeName = false;
        this.watchCategory_grade(newVal);
      } else {
        this.isGradeName = true;
        this.newCategory_id = newVal;
        this.watchCategoryAdd(newVal);
      }
    },

    //监听弹框中分类的ID
    searchGradeId: function(newVal, oldVal) {
    //   console.log(newVal);
      if (newVal == "全部") {
        this.getAllSalary1();
        this.islevelName = false;
      } else {
        this.watchCategoryAdd2(newVal,this.newCategory_id);
        this.islevelName = true;
      }
    },
    //监听等级ID
    searchLevelId: function(newVal, oldVal) {
    //   console.log(newVal);
      if (newVal == "全部") {
        // console.log("12333");
      }
    },

    //点击增加弹框
    categoryId: function(newVal, oldVal) {
      // console.log(newVal);
      if(newVal){
        this.addCategory_id = newVal;
        this.watchCategory(newVal);
      }
      
    },
    gradeId: function(newVal, oldVal) {
    //   console.log(newVal);
      // if (newVal == "全部") {
      // }
      if(newVal){
        this.watchGrade(newVal);
      }
      
    },
    // levelId:function(newVal,oldVal){
    //  if(newVal){
    //     this.watchGrade(newVal);
    //   }
      
    // }
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
  margin-top: 22px;
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
</style>
