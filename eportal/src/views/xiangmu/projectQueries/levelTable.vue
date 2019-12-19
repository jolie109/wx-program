<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
         <v-flex md2 d-flex>
          <v-select :items="categroyitems" v-model="selectedcategory" label="请选择分类" @change="getLevels"></v-select>
        </v-flex>
        <v-flex md2 d-flex>
          <v-select :items="items" v-model="selected" label="请选择等级"></v-select>
        </v-flex>

        <v-btn small round color="primary" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
        <v-btn small round color="primary" @click="addLevel()">
          <v-icon>add</v-icon>新增等级
        </v-btn>
      </v-layout>
      <v-layout justify-center>
        <v-dialog v-model="dialogAddLevel" persistent max-width="700px">
          <v-card>
            <v-card-title style="padding:40px 0 15px 60px;">
              <span class="headline">增加等级</span>
            </v-card-title>
             <v-card-text>
              <v-container>
                <v-layout wrap >
                  <span class="baseTitle">勋章类别</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                     :items="categroyitems"
                      :error-messages="typeErrors" 
                      @blur="$v.editedItem.type.$touch()"
                      v-model="editedItem.type"
                      label="请选择分类"
                      required
                    ></v-select>
                  </v-flex>
                </v-layout>
                 <v-layout>
                  <span class="baseTitle">项目点数起</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field 
                       v-model="editedItem.start"
                  :error-messages="startErrors"
                  required
                  @blur="$v.editedItem.start.$touch()"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">项目点数讫</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field 
                      v-model="editedItem.end"
                  :error-messages="endErrors"
                  required
                  @blur="$v.editedItem.end.$touch()"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                  <v-layout>
                  <span class="baseTitle">等级</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field 
                      v-model="editedItem.level"
                  :error-messages="levelErrors"
                  required
                  @blur="$v.editedItem.level.$touch()"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                  <v-layout>
                  <span class="baseTitle">等级补贴</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field 
                     v-model="editedItem.amount"
                  :error-messages="amountErrors"
                  required
                  @blur="$v.editedItem.amount.$touch()"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
             </v-card-text>
            <v-card-actions style="padding-bottom:60px;">
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="close()">取消</v-btn>
              <v-btn color="primary" flat @click="save()">确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classifyBg">
              <v-flex class="classifyBgFlex">
                <p>项目查询</p>
                <p>勋章等级对照表</p>
              </v-flex>
              <div class="table">
                <v-data-table :headers="headers" :items="desserts" class="elevation-1">
                  <template v-slot:items="props">
                    <td>{{ props.item.start }}</td>
                    <td>{{ props.item.end }}</td>
                    <td>{{ props.item.level }}</td>
                    <td>{{ props.item.amount }}</td>
                    <td>{{ props.item.type }}</td>
                    <td class="text-xs-center">
                      <v-btn small color="primary" @click="edit(props.item)">编辑</v-btn>
                      <v-btn small color="primary" @click="del(props.item)">删除</v-btn>
                    </td>
                  </template>
                </v-data-table>
                <v-layout justify-center>
                  <v-dialog v-model="dialogEdit" persistent max-width="700px">
                    <v-card>
                      <v-card-title style="padding:40px 0 15px 60px;">
                        <span class="headline">编辑内容</span>
                      </v-card-title>
                      <v-layout wrap align-center>                                                                   
                        <v-flex md2></v-flex>
                        <v-flex md2>
                          <label>等级补贴</label>
                        </v-flex>
                        <v-flex md6>
                          <v-text-field  v-model="editedItem.amount" required :error-messages="amountErrors" @blur="$v.editedItem.amount.$touch()"></v-text-field>
                        </v-flex>
                        <v-flex md2></v-flex>
                      </v-layout>
                      <v-card-actions style="padding-bottom:60px;">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" flat @click="dialogEdit = false">取消</v-btn>
                        <v-btn color="primary" flat @click="save()">确定</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-layout>
                <v-layout justify-center>
                  <v-dialog v-model="dialogDelete" persistent max-width="700">
                    <v-card>
                      <v-btn icon @click="dialogDelete = false" class="icon_close">
                        <v-icon>close</v-icon>
                      </v-btn>
                      <v-card-title class="headline" style="padding:50px 0 0 100px;">您确定要删除吗？</v-card-title>
                      <v-card-actions style="padding:30px 50px;">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" flat @click="dialogDelete = false">取消</v-btn>
                        <v-btn color="primary" flat @click="confirmDel()">确定</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-layout>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
      <v-snackbar :color="color" :timeout="timeout" top right v-model="snackbar">
        <v-icon color="white" class="mr-3" size="20">check_circle</v-icon>
        <div>{{info}}</div>
        <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
      </v-snackbar>
      <v-snackbar color="error" top right :timeout="timeout0" v-model="snackbar0">
        <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
        <div>{{error}}</div>
        <v-icon color="white" size="16" @click="snackbar0 = false">clear</v-icon>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { required, numeric } from "vuelidate/lib/validators";
export default {
  name: "levelTable",
  validations: {
    editedItem: {
      start: { required, numeric },
      end: { required },
      level: { required },
      amount: { required, numeric },
      type: { required }
    }
  },
  data() {
    return {
      categroyitems:["Collaboration","Management"],
      selectedcategory:'Management',
      selected: "",
      dialogAddLevel: false,
      dialogEdit: false,
      dialogDelete: false,
      editedIndex: -1,
      index: "",
      i: "",
      info: "",
      error: "",
      color: "info",
      timeout: 3000,
      timeout0: 6000,
      snackbar: false,
      snackbar0: false,
      editedItem: {
        start: "",
        end: "",
        level: "",
        amount: "",
        type:""
      },
      defaultItem: {
        start: "",
        end: "",
        level: "",
        amount: "",
        type:""
      },
      items: [],
      levelTable: [],
      headers: [
        { text: "勋章点数起", sortable: false },
        { text: "勋章点数讫", sortable: false },
        { text: "等级", sortable: false },
        { text: "等级补贴", sortable: false },
           { text: "勋章类别", sortable: false },
        { text: "功能", sortable: false, align: "center" },
     

      ],
      desserts: []
    };
  },

  methods: {
    getLevels() {
      this.$axios.get("/api/projectQueries/levels", {
        params:{
          type:this.selectedcategory
        }
      }).then(res => {
        var levels = ["全部"];
        this.levelTable = res.data.result;
        for (const iterator of this.levelTable) {
          levels.push(iterator.level);
        }
        if (res.data.status == "200") {
          this.items = levels;
        } else if (res.data.status == "500") {
          this.error = "等级信息接口调取失败。";
          this.snackbar0 = true;
        }
      });
    },
    search() {
      this.$axios
        .get("/api/projectQueries/levelTable", {
          params: {
            item: this.selected,
            type:this.selectedcategory
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result;
          } else if (res.data.status == "500") {
            this.error = "搜索失败！";
            this.snackbar0 = true;
          }
        });
    },
    addLevel() {
      this.dialogAddLevel = true;
    },
    edit(item) {
      this.dialogEdit = true;
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
    },
    save() {
      this.$v.editedItem.$touch();
      if (
        this.editedItem.start == "" ||
        this.editedItem.end == "" ||
        this.editedItem.level == "" ||
        this.editedItem.type == "" ||
        this.editedItem.amount == "" || 
        !/^[0-9]*$/.test(this.editedItem.start) ||
        !/^[0-9]*$/.test(this.editedItem.amount)
      ) {
        return false;
      }
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
        this.$axios
          .put("/api/projectQueries/levelTableUpdate", {
            index: this.editedItem._id,
            amount: this.editedItem.amount
          })
          .then(res => {
            if (res.data.status == "200") {
              this.search();
              this.info = "修改成功！";
              this.snackbar = true;
            } else if (res.data.status == "500") {
              this.error = "修改失败！";
              this.snackbar0 = true;
            }
          });
        this.dialogEdit = false;
      } else {
        // this.desserts.push(this.editedItem);
        this.$axios
          .post("/api/projectQueries/levelTableAdd", {

            index: this.editedItem._id,
            start: this.editedItem.start,
            end: this.editedItem.end,
            level: this.editedItem.level,
            amount: this.editedItem.amount,
            type:this.editedItem.type
          })
          .then(res => {
            if (res.data.status == "200") {
              this.search();
              this.getLevels();
              this.info = "添加成功！";
              this.snackbar = true;
              this.close();
            } else if (res.data.status == "500") {
              this.error = "添加失败！";
              this.snackbar0 = true;
            } else if (res.data.status == "304") {
              this.error = "该等级已存在。";
              this.snackbar0 = true;
            }
          });
        this.dialogEdit = false;
      }
    },
    close() {
      this.dialogAddLevel = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
      this.$v.$reset();
    },
    del(item) {
      this.i = this.desserts.indexOf(item);
      this.dialogDelete = true;
    },
    confirmDel() {
      this.$axios
        .delete("/api/projectQueries/levelTableDelete", {
          data: {
            id: this.desserts[this.i]._id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.search();
            this.getLevels();
            this.info = "删除成功！";
            this.snackbar = true;
          } else if (res.data.status == "500") {
            this.error = "删除失败！";
            this.snackbar0 = true;
          }
        });
      this.dialogDelete = false;
    }
  },
  computed: {
    typeErrors() {
      const errors = [];
      if (!this.$v.editedItem.type.$dirty) return errors;
      !this.$v.editedItem.type.required &&
        errors.push("勋章类别为必选字段。");
      !this.$v.editedItem.type.numeric && errors.push("请选择类别");
      return errors;
    },
    startErrors() {
      const errors = [];
      if (!this.$v.editedItem.start.$dirty) return errors;
      !this.$v.editedItem.start.required &&
        errors.push("项目点数起为必填字段。");
      !this.$v.editedItem.start.numeric && errors.push("请输入数字");
      return errors;
    },
    endErrors() {
      const errors = [];
      if (!this.$v.editedItem.end.$dirty) return errors;
      !this.$v.editedItem.end.required && errors.push("项目点数讫为必填字段。");
      return errors;
    },
    levelErrors() {
      const errors = [];
      if (!this.$v.editedItem.level.$dirty) return errors;
      !this.$v.editedItem.level.required && errors.push("等级为必填字段。");
      return errors;
    },
    amountErrors() {
      const errors = [];
      if (!this.$v.editedItem.amount.$dirty) return errors;
      !this.$v.editedItem.amount.required &&
        errors.push("等级补贴为必填字段。");
      !this.$v.editedItem.amount.numeric && errors.push("请输入数字");
      return errors;
    }
  },
  created() {
    this.getLevels();
    this.search();
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
  margin-top:20px;
  width:100px;
}

.table {
  background: #ffffff;
}
.td-btn {
  padding: 0px !important;
}
.classifyBgFlex p:nth-of-type(1) {
  padding-left: 12px;
}
.classifyBgFlex p:nth-of-type(2) {
  letter-spacing: 4px;
  padding-left: 12px;
}
.icon_close {
  float: right;
}
</style>
