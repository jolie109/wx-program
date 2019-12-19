<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 d-flex class="searchSelect">
          <v-autocomplete
            v-model="categorySelectId"
            :items="filterCategory"
            item-text="name"
            item-value="_id"
            label="请选择/输入类别"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs3 d-flex class="searchSelect">
          <v-autocomplete
            :items="dessertsAddGrade"
            v-model="gradeSelectId"
            item-text="name"
            item-value="_id"
            chips
            label="请选择/输入等级"
          ></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="searchLevel">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="addShow">
            <v-card-title>
              <span class="headline">增加级别</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <span class="baseTitle">类别名称</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="addDessertsCategory"
                      item-text="name"
                      item-value="_id"
                      v-model="categoryAddSelectId"
                      label="请选择"
                      required
                        @blur="$v.categoryAddSelectId.$touch()"
                         :error-messages="categoryErrors"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap>
                  <span class="baseTitle">类别等级</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="addDessertsGrade"
                      item-text="name"
                      item-value="_id"
                      v-model="gradeAddSelectId"
                      label="请选择"
                      required
                       @blur="$v.gradeAddSelectId.$touch()"
                         :error-messages="gradeErrors"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">等级级别</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.name" label="输入级别名称"  @blur="$v.editedItem.name.$touch()"
                         :error-messages="rankErrors"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="addSave">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="editShow">
            <v-card-title>
              <span class="headline">编辑内容</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="baseTitle">等级级别</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="level.name" label="输入级别名称" @blur="$v.editedItem.name.$touch()"
                         :error-messages="rankErrors"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="editSave">确定</v-btn>
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
        <p>级别管理</p>
        <p>级别</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-left" v-if="props.item.category">{{ props.item.category.name }}</td>
          <td class="text-xs-left" v-else-if="!props.item.category"></td>
          <td class="text-xs-left" v-if="props.item">{{ props.item.name }}</td>
          <td class="text-xs-left" v-else-if="!props.item"></td>
          <td class="text-xs-left" v-if="props.item.level">{{ props.item.level.name }}</td>
          <td class="text-xs-left" v-else-if="!props.item.level"></td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item,props.item.key)">删除</v-btn>
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
  name: "gradeManagement",
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
      addShow: false,
      editShow: false,
      delShow: false,
      titleTip: "",
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      color: "info",
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      editedIndex: -1,

      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "等级名称", sortable: false, value: "name" },
        { text: "级别名称", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      desserts: [],
      dessertsAdd: [],
      dessertsAddCategoryName: [],
      currSelectName: "",
      dessertsGradeName: [],
      dessertsAddName: [],
      categorySelectId: "", //搜索select绑定的值
      categoryAddSelectId: "",
      gradeSelectId: "",
      gradeAddSelectId: "",
      dessertsAddGrade: ["全部"],
      addDessertsCategory: [],
      addDessertsGrade: [],
      category:{
        name:""
      },
      level:{
        name:"",
        "_id":''
      }
    };
  },
  mounted() {
    this.getLevelAccount();
    this.getLevelByCategoryGrade();
    this.getAddDessertsCategory();
  },
  methods: {
    // 获取页面所有数据
    getLevelAccount() {
      this.$axios.get("/api/classify/getLevelAccount").then(res => {
        // for (const iterator of res.data.result) {
          this.desserts=res.data.result
          // if(iterator.category){
          //   if(iterator.category.category_type=='基本薪资'){
          //     this.desserts.push(iterator);
          //   }
          // }
        // }
      });
    },
    getAddDessertsCategory() {
      this.$axios.get("/api/classify/getCategoryAccount").then(res => {
        for (const iterator of res.data) {
          if(iterator.category_type=='基本薪资'){
             this.addDessertsCategory.push(iterator);
          }
        }
       
      });
    },
    getAddDessertsGrade() {
      this.$axios.get("/api/classify/getGradeAccount").then(res => {
        this.addDessertsGrade = res.data.result;
      });
    },
    // 三表连接查询
    getLevelByCategoryGrade() {
      this.$axios.get("api/classify/getLevelByCategoryGrade").then(res => {
        this.dessertsAdd = [...res.data.result];
        // this.dessertsAddGrade = ["全部", ...res.data.result];
        // 页面加载完后在搜索的第2个select中显示所有的等级名（判断将不重名的加进去）
        const addArr = [];
        for (const iterator of res.data.result) {
          if (addArr.indexOf(iterator.name) === -1) {
            addArr.push(iterator.name);
            this.dessertsAddGrade.push(iterator);
            this.addDessertsGrade.push(iterator);
          }
        }
        this.dessertsAddCategoryName = [...this.dessertsAdd];
      });
    },
    handleAdd() {
      this.dialog = true;
      this.addShow = true;
      this.editShow = false;
      this.delShow = false;
      // this.getLevelByCategoryGrade();
    },
    // 增加
    addSave() {
       this.$v.$touch();
      if(this.categoryAddSelectId=='' ||this.editedItem.name=='' || this.gradeAddSelectId==""){
        return false
      }else{
        var data = {
        category_id: this.categoryAddSelectId,
        grade_id: this.gradeAddSelectId,
        name: this.editedItem.name
      };
      this.$axios.post("/api/classify/addLevel", data).then(res => {

          this.categoryAddSelectId='';
          this.gradeAddSelectId='';
        if (res.data.status == 200) {
          this.titleTip = res.data.msg;
          this.snackbar = true;
          this.right = true;
          this.color='info';
          // 在前端页面上增加，不需要在重新调用获取所有数据的方法
          var updateData = {
            name: res.data.result[0].grade.name,
            _id: res.data.result[0].level._id,
            category: {
              name: res.data.result[0].category.name
            },
            level: {
              name: res.data.result[0].level.name
            }
          };
          this.desserts.push(updateData);
        } else if (res.data.status == 0) {
          this.titleTip = res.data.msg;
          this.color = "error";
          this.snackbar = true;
          this.right = true;
        }
        // this.getLevelAccount();
      });
      this.close();
      }
   
    },
    handleEdit(item) {
      this.dialog = true;
      this.addShow = false;
      this.editShow = true;
      this.delShow = false;
      this.level.name=item.level.name
      this.level._id=item.level._id
      this.editedIndex = this.desserts.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
    },
    handleDelete(value) {
      this.dialog = true;
      this.addShow = false;
      this.editShow = false;
      this.delShow = true;
      this.value = value;
    },
    handleDelSave(value) {
      this.$axios
        .delete("/api/classify/deleteLevel", {
          data: {
            category_id: this.value.category_id,
            _id: this.value._id
          }
        })
        .then(res => {
          var index = this.desserts.indexOf(this.value);
          this.desserts.splice(index, 1);
          this.close();
          //弹框提示
          this.titleTip = res.data.msg;
          this.snackbar = true;
          this.right = true;
          this.color = "info";
        });
      this.close();
    },

    // 编辑
    editSave() {
       this.$v.$touch();
      if(this.level.name==''){
        return false
      }else{
        this.$axios
        .put("api/classify/updateLevel", {
          _id: this.level._id,
          name: this.level.name
        })
        .then(res => {
          if (res.data.status == 200) {
            this.titleTip = res.data.msg;
            this.snackbar = true;
            this.right = true;
            for (const iterator of this.desserts) {
              if (iterator._id === this.editedItem._id) {
                const index = this.desserts.indexOf(iterator);
                this.desserts.splice(index, 1, this.editedItem);
                break;
              }
            }
          } else {
            this.titleTip = "编辑失败！";
            this.color = "error";
            this.right = true;
          }
          this.close();
        });
        this.getLevelAccount()
      }
      
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 200);
    },
    // 搜索
    searchLevel() {
      if (this.categorySelectId && this.gradeSelectId) {
        if (this.categorySelectId == "全部" && this.gradeSelectId == "全部") {
          this.getLevelAccount();
        } else if (
          this.categorySelectId == "全部" &&
          !(this.gradeSelectId == "全部")
        ) {
          this.$axios
            .get("api/classify/getGradeByLevel", {
              params: {
                _id: this.gradeSelectId
              }
            })
            .then(res => {
              this.desserts = res.data.result;
            });
        } else {
          this.$axios
            .get("api/classify/getLevelByCategoryGrade_list", {
              params: {
                _id: this.gradeSelectId, //grade_id
                category_id: this.categorySelectId
              }
            })
            .then(res => {
              if ((res.data.status = 200)) {
                this.desserts = res.data.result;


                this.titleTip = res.data.msg;
                this.snackbar = true;
                this.right = true;
                this.color = "info";
              }
            });
        }
      } else {
        this.snackbar = true;
        this.titleTip = "搜索失败！";
        this.color = "error";
        this.right = true;
      }
    },
    // 监听时绑定的id
    watchCategoryAdd(newVal) {
      this.$axios
        .get("api/classify/getCategoryByGrade", {
          params: {
            _id: newVal //分类的id
          }
        })
        .then(res => {
          this.dessertsAddGrade = [...res.data.result];
        });
    }
  },

  computed: {
    filterData() {
      const arr = [];
      for (const iterator of this.dessertsAddCategoryName) {
        if (iterator.item_category) {
          for (const iterator of iterator.item_category) {
            arr.push(iterator);
          }
        }
      }
      return arr;
    },
    filterCategory() {
      const arrCategory = ["全部"];
      for (const iterator of this.dessertsAdd) {
        for (const iterator of iterator.item_category) {
          if (iterator.category_type == "基本薪资") {
            arrCategory.push(iterator);
          }
        }
      }
      return arrCategory;
    },

    categoryErrors() {
      const errors = [];
      if (!this.$v.categoryAddSelectId.$dirty) return errors;
      !this.$v.categoryAddSelectId.required &&
        errors.push("不能为空。");
      !this.$v.categoryAddSelectId.numeric ;
      return errors;
    },
    gradeErrors() {
      const errors = [];
      if (!this.$v.gradeAddSelectId.$dirty) return errors;
      !this.$v.gradeAddSelectId.required &&
        errors.push("不能为空。");
      !this.$v.gradeAddSelectId.numeric ;
      return errors;
    },
    rankErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required &&
        errors.push("不能为空。");
      !this.$v.editedItem.name.numeric ;
      return errors;
    },
  },
  watch: {
    currSelectName: function(newVal, oldVal) {
      for (const iterator of this.dessertsAddCategoryName) {
        if (
          iterator.item_category &&
          iterator.item_category.name === this.currSelectName
        ) {
          this.dessertsAdd.push(iterator.name);
        }
      }
    },
    // 搜索时监听v-model绑定的值传给后端
    categorySelectId: function(newVal, oldVal) {
      if (newVal == "全部") {
        this.getLevelByCategoryGrade();
        this.dessertsAddGrade.splice(0, 0, "全部");
      } else {
        this.watchCategoryAdd(newVal);
      }
    },
    categoryAddSelectId: function(newVal, oldVal) {
      this.categoryAddSelectId=newVal;
      this.$axios
        .get("/api/classify/getCategoryByGrade", {
          params: {
            _id: this.categoryAddSelectId
          }
        })
        .then(res => {
          this.addDessertsGrade = res.data.result;
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
