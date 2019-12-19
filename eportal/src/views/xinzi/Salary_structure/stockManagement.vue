<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs2 sm2 md3>
        <v-autocomplete
          :items="items"
          label="请选择/输入员工姓名"
          no-data-text="无结果"
          item-text="name"
          item-value="_id"
          v-model="editedItem._id"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs1 sm1 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs1 sm1 md2 ml-5>
        <v-btn color="info" @click="addItem()">
          <v-icon>add</v-icon>新增股权人员
        </v-btn>
      </v-flex>
    </v-layout>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-show="editCard">
        <v-card-title>
          <v-flex class="headline" md4 offset-md1>添加股权人员</v-flex>
        </v-card-title>
        <v-card-text>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>员工姓名</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-autocomplete
                :items="itemsName"
                label="请选择员工"
                item-text="name"
                item-value="_id"
                v-model="nameAdd"
                :error-messages="nameAddErrors"
                  required
                  @change="$v.nameAdd.$touch()"
                 @blur="$v.nameAdd.$touch()"
              ></v-autocomplete>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股权数</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field
               v-model="editedItem.remain_stock"
                placeholder="请输入数字"
                :error-messages="amountErrors"
                :counter="10"
                required
                @input="$v.editedItem.remain_stock.$touch()"
                @blur="$v.editedItem.remain_stock.$touch()"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close()">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveAdd()">确定</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-show="deleteCard">
        <span class="deleteTitle">你确定要删除吗？</span>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close()">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveDelete()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>股票管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.remain_stock}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
              <v-btn small color="info" @click="deleteItem(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <!-- 弹框 -->
      <v-snackbar :color="color" :top="top" :info="info" :right="right" v-model="snackbar">
        <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
        <div>{{titleTip}}</div>
        <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
      </v-snackbar>
    </div>
  </v-container>
</template>
<script>
import { log } from "util";
import { required, numeric ,maxLength} from "vuelidate/lib/validators";
export default {
  
  validations: {
    editedItem: {
       remain_stock: { required, numeric,maxLength: maxLength(10) }
    },
    nameAdd:{
      required,
    }
  },

  name: "stockManagement",
  data: () => ({
    item_id: "",
    items: [],
    nameAdd: "",
    info: "",
    itemsName: [],
    dialog: false,
    editCard: false,
    deleteCard: false,
    // /弹框信息
    top: true,
    right: false,
    color: "",
    titleTip: "",
    snackbar: false,
    editedItem: 
      {
        _id: "",
        remain_stock: ""
      }
    ,
    
    editedIndex: -1,
    defaultItem: {},
    headers: [
      { text: "员工姓名", sortable: false, align: "center", value: "name" },
      {
        text: "剩余股票数",
        value: "remain_stock",
        align: "center",
        sortable: false
      },
      { text: "功能", align: "center", sortable: false }
    ],
    desserts: []
  }),

  created() {
    this.getEmployees();
  },
  computed: {
    amountErrors () {
        const errors = []
        if (!this.$v.editedItem.remain_stock.$dirty) return errors
        !this.$v.editedItem.remain_stock.maxLength && errors.push('最多输入10位！')
        !this.$v.editedItem.remain_stock.required && errors.push('必填项！')
        !this.$v.editedItem.remain_stock.numeric && errors.push('请输入数字！')
        return errors
      },
    nameAddErrors () {
        const errors = []
        if (!this.$v.nameAdd.$dirty) return errors
        !this.$v.nameAdd.required && errors.push('请选择一个！')
        return errors
      }
  },
  methods: {
    getEmployees() {
      this.$axios.get("/api/salaryStructure/employeeStock").then(res => {
        for (const iterator of res.data.result) {
          this.items.push(iterator);
        }
        this.items.unshift("全部");
        this.desserts = res.data.result;
      });
    },
    search() {
      if (this.editedItem._id == "全部" || !this.editedItem._id) {
        this.getEmployees();
        this.titleTip = "搜索成功！";
        this.snackbar = true;
        this.right = true;
        this.color = "info";
      } else {
        this.$axios
          .get("/api/salaryStructure/searchEmployee", {
            params: {
              _id: this.editedItem._id
            }
          })
          .then(res => {
            if (res.data.status == "200") {
              this.desserts = res.data.result;
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
    close() {
      this.dialog = false;
        setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
      this.$v.$reset();
      
    },
    addItem(item) {
      
      this.dialog = true;
      this.editCard = true;
      this.deleteCard = false;
      // this.editedItem.remain_stock="";
      this.nameAdd="",
      this.$axios.get("/api/salaryStructure/chooseEmployee", {}).then(res => {
        for (const iterator of res.data.result) {
          this.itemsName.push(iterator);
        }
      });
      this.editIndex = this.desserts.indexOf(item);
      // this.editedItem = Object.assign({}, item);
    },
    deleteItem(item) {
      this.item_id = item._id;
      this.dialog = true;
      this.editCard = false;
      this.deleteCard = true;
    },
    saveDelete() {
      this.$axios
        .delete("/api/salaryStructure/deleteEmployee", {
          data: { _id: this.item_id }
        })
        .then(res => {
          this.items = [];
          this.getEmployees();
        });

      this.close();
      this.titleTip = "删除成功！";
      this.snackbar = true;
      this.right = true;
      this.color = "info";
    },
    saveAdd() {
        this.$v.$touch();
      if (
        this.nameAdd == "" ||
        this.editedItem.remain_stock == "" || 
        !/^[0-9]*$/.test(this.editedItem.remain_stock)
      ) {
          this.titleTip = "输入格式有错误哟！";
        this.snackbar = true;
        this.right = true;
        this.color = "error";
        return false;
      }
        this.$axios
          .post("/api/salaryStructure/addEmployee", {
            remain_stock: this.editedItem.remain_stock,
            _id: this.nameAdd
          })
          .then(res => {
            this.$axios
              .get("/api/salaryStructure/chooseEmployee", {})
              .then(res => {
                this.itemsName = res.data.result;
              });
            this.items = [];
            this.getEmployees();
            this.close();
            this.titleTip = "新增成功！";
            this.snackbar = true;
            this.right = true;
            this.color = "info";
          });
      // }
    },
    checkClick(item) {
      this.$router.push({
        path: "/xinzi/Salary_structure/checkStock",
        query: {
          nameCode: item.name,
          remain_stockCode: item.remain_stock,
          _idCode: item._id
        }
      });
    }
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.deleteTitle {
  padding: 40px;
  font-size: 20px;
  display: inline-block;
}
.search {
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerList p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
}
</style>
