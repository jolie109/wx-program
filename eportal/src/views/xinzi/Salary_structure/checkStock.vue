<template>
  <v-container fluid grid-list-xl>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-show="addCard">
        <v-card-title>
          <v-flex class="headline" md4 offset-md1>{{title}}</v-flex>
        </v-card-title>
        <v-card-text>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>员工姓名</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>{{tableName}}</v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股票交易类型</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-select
                :items="itemsType"
                :disabled="disabled"
                v-model="editedItem.transaction_type"
                :error-messages="transaction_typeErrors"
                required
                @change="$v.editedItem.transaction_type.$touch()"
                @blur="$v.editedItem.transaction_type.$touch()"
              ></v-select>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股票交易时间</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <!-- 日期选择器 -->
              <v-menu
                v-model="menu1"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="100px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field v-model="date" label="请选择" prepend-icon="event" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="date" @input="menu1 = false"></v-date-picker>
              </v-menu>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>交易股票数</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field
                placeholder="请输入数字"
                v-model="editedItem.qty"
                :error-messages="qtyErrors"
                required
                :counter="10"
                @input="$v.editedItem.qty.$touch()"
                @blur="$v.editedItem.qty.$touch()"
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
      <v-card v-show="editCard">
        <v-card-title>
          <v-flex class="headline" md4 offset-md1>{{title}}</v-flex>
        </v-card-title>
        <v-card-text>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>员工姓名</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>{{tableName}}</v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股票交易类型</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-select :items="itemsType" v-model="editedItem.transaction_type" placeholder="请选择"></v-select>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股票交易时间</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <!-- 日期选择器 -->
              <v-menu
                v-model="menu2"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="100px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field v-model="date" label="请选择" prepend-icon="event" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="date" @input="menu2 = false"></v-date-picker>
              </v-menu>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>交易股票数</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field placeholder="请输入数字" type="number" v-model="editedItem.qty"></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveEdit()">确定</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-show="deleteCard">
        <span class="deleteTitle">你确定要删除吗？</span>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveDelete">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-flex class="headerList" md12>
      <p>{{tableName}}的股票管理数</p>
    </v-flex>
    <div class="bg">
      <v-flex xs12 sm6 md1 class="search" v-if="is_show">
        <v-btn color="info" @click="addItem()">
          <v-icon>add</v-icon>新增交易记录
        </v-btn>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="desserts" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.transaction_type}}</td>
            <td class="text-xs-center">{{ props.item.transaction_time}}</td>
            <td
              class="text-xs-center"
            >{{(props.item.transaction_type=="购买"||props.item.transaction_type=="发放")?props.item.qty:-props.item.qty}}</td>
            <td class="text-xs-center">{{props.item.remain_qty}}</td>
            <td class="text-xs-center">
              <v-btn v-if="is_show"  small color="info" @click="editItem(props.item)">编辑</v-btn>
              <v-btn v-if="is_show" small color="info" @click="deleteItem(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <!-- 弹框 -->
      <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
        <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
        <div>{{titleTip}}</div>
        <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
      </v-snackbar>
    </div>
    <v-layout>
      <v-flex md12 class="headerTitle">
        <span @click="returnback()">
          <v-btn small color="info">返回</v-btn>
        </span>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { required, numeric, maxLength } from "vuelidate/lib/validators";
export default {
  validations: {
    editedItem: {
      transaction_type: { required },
      qty: { required, numeric, maxLength: maxLength(10) }
    }
  },

  name: "checkStock",
  data: () => ({
    date: new Date().toISOString().substr(0, 10),
    menu1: false,
    menu2: false,
    qty: "",
    itemsType: ["发放", "购买", "卖出", "转移"],
    dialog: false,
    addCard: false,
    editCard: false,
    deleteCard: false,
    // /弹框信息
    titleTip: "",
    color: "",
    top: true,
    right: false,
    snackbar: false,
    disabled: false,
    tableName: "",
    editedItem: {
      transaction_type: "",
      transaction_time: "",
      qty: "",
      remain_qty: ""
    },
    editedIndex: -1,
    defaultItem: {},
    headers: [
      {
        text: "股票交易类型",
        align: "center",
        value: "transaction_type",
        sortable: false
      },
      {
        text: "股票交易时间",
        align: "center",
        value: "transaction_time",
        sortable: false
      },
      { text: "交易股票数", align: "center", value: "qty", sortable: false },
      {
        text: "剩余总股数",
        align: "center",
        value: "remain_qty",
        sortable: false
      },
      { text: "功能", align: "center", sortable: false }
    ],
    desserts: [],
    is_show:"show"
  }),
  computed: {
    title() {
      return this.editedIndex === -1 ? "添加记录" : "编辑内容";
    },
    qtyErrors() {
      const errors = [];
      if (!this.$v.editedItem.qty.$dirty) return errors;
      !this.$v.editedItem.qty.maxLength && errors.push("最多输入10位！");
      !this.$v.editedItem.qty.required && errors.push("必填项！");
      !this.$v.editedItem.qty.numeric && errors.push("请输入数字！");
      return errors;
    },
    transaction_typeErrors() {
      const errors = [];
      if (!this.$v.editedItem.transaction_type.$dirty) return errors;
      !this.$v.editedItem.transaction_type.required &&
        errors.push("请选择一个！");
      return errors;
    }
  },
  mounted() {
    this.getStock();
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.remain_qty = this.$route.query.remain_stockCode;
      this.tableName = this.$route.query.nameCode;
      this._id = this.$route.query._idCode;
      if (this.$route.query.is_show == "show") {
        this.is_show = true;
      } else if (this.$route.query.is_show == "unshow") {
        this.is_show = false;
        this.headers[this.headers.length - 1].text = "";
      }
    },
    getStock() {
      this.$axios
        .get("/api/salaryStructure/managestock", {
          params: { _id: this._id }
        })
        .then(res => {
          this.desserts = res.data.result;
        });
    },
    returnback() {
      history.go(-1);
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
      this.$v.$reset();
    },
    addItem() {
      this.dialog = true;
      this.disabled = false;
      this.addCard = true;
      this.editCard = false;
      this.deleteCard = false;
    },
    editItem(item) {
      this.dialog = true;
      this.addCard = false;
      this.editCard = true;
      this.deleteCard = false;
      this.editedIndex = this.desserts.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      this.disabled = true;
    },
    deleteItem(item) {
      this.item_id = item._id;
      this.dialog = true;
      this.editCard = false;
      this.addCard = false;
      this.deleteCard = true;
    },
    saveDelete() {
      this.$axios
        .delete("/api/salaryStructure/deleteStock", {
          data: {
            _id: this.item_id,
            employee_id: this._id
          }
        })
        .then(res => {
          return;
        });
      this.getStock();
      this.close();
      this.titleTip = "删除成功！";
      this.snackbar = true;
      this.right = true;
      this.color = "info";
    },
    saveAdd() {
      this.$v.$touch();
      if (
        this.editedItem.qty == "" ||
        this.editedItem.transaction_type == "" ||
        !/^[0-9]*$/.test(this.editedItem.qty)
      ) {
        this.titleTip = "输入格式有错误！";
        this.snackbar = true;
        this.right = true;
        this.color = "error";
        return false;
      } else {
        if (
          this.editedItem.transaction_type == "发放" ||
          this.editedItem.transaction_type == "购买"
        ) {
          this.qty = "+" + this.editedItem.qty;
          this.$axios
            .post("/api/salaryStructure/addStock", {
              _id: this._id,
              transaction_type: this.editedItem.transaction_type,
              transaction_time: this.date,
              qty: this.qty,
              remain_qty: this.remain_qty
            })
            .then(res => {
              if(res){
              this.titleTip = "新增成功！";
              this.snackbar = true;
              this.right = true;
              this.color = "info";
                  this.getStock();
              }
             
            });
        } else if (
          this.editedItem.transaction_type == "转移" ||
          this.editedItem.transaction_type == "卖出"
        ) {
          this.qty = this.editedItem.qty;
          this.$axios
            .post("/api/salaryStructure/addStock", {
              transaction_type: this.editedItem.transaction_type,
              transaction_time: this.date,
              qty: this.qty,
              _id: this._id,
              remain_qty: this.remain_qty
            })
            .then(res => {
          
              if(res){
                 this.titleTip = "新增成功！";
              this.snackbar = true;
              this.right = true;
              this.color = "info";
                  this.getStock();
              }
            });
        }
        this.close();
      }
    },
    saveEdit() {
      this.$axios
        .put("/api/salaryStructure/updateStock", {
          _id: this.editedItem._id,
          transaction_time: this.date,
          qty: this.editedItem.qty,
          type: this.editedItem.transaction_type,
          employee_id: this._id
        })
        .then(res => {
          this.getStock();
        });
      this.close();
      this.titleTip = "编辑成功！";
      this.snackbar = true;
      this.right = true;
      this.color = "info";
    }
  }
};
</script>
<style scoped>
.headerTitle {
  text-align: right;
}
.headerTitle span {
  cursor: pointer;
  /* margin-right: -200px; */
  font-size: 15px;
}
.search {
  margin-top: -20px;
  margin-bottom: 20px;
}
.deleteTitle {
  padding: 40px;
  font-size: 20px;
  display: inline-block;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerList {
  background-color: #e0e1e2;
  padding: 10px 20px;
  text-align: center;
}
.headerList p {
  color: #333333;
  font-size: 15px;
  margin-top: 15px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
}
</style>
