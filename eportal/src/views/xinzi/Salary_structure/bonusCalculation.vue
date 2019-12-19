<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <div class="search">
      <v-layout>
        <v-flex xs12 sm2 md2>
          <v-autocomplete :items="items" label="请选择/输入员工姓名" v-model="name_selected"></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm6 md1>
          <v-btn color="info" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs12 sm6 md2>
          <v-autocomplete 
          :items="itemsType" 
          label="请选择奖金类型" 
          v-model="type_selected" 
          required 
          :error-messages="typeErr" 
          @blur="$v.type_selected.$touch()"  
          @change="$v.type_selected.$touch()"></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm2 md3>
          <v-menu
            v-model="menu_start"
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="100px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="period_start"
                label="请选择开始日期"
                prepend-icon="event"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="period_start" locale="zh-cn" @input="menu_start = false"></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs12 sm2 md3>
          <v-menu
            v-model="menu_end"
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="100px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="period_end"
                label="请选择结束日期"
                prepend-icon="event"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="period_end" locale="zh-cn" @input="menu_end = false"></v-date-picker>
          </v-menu>
        </v-flex>

        <v-flex xs12 sm2 md2>
          <!-- 日期选择器 -->
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="100px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="date"
                label="请选择预计发放日期"
                prepend-icon="event"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="date" locale="zh-cn" @input="menu = false" type="month"></v-date-picker>
          </v-menu>
        </v-flex>
      </v-layout>
    </div>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>奖金计算</p>
      </v-flex>
      <v-flex md12>
        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="desserts"
          :pagination.sync="pagination"
          select-all
          item-key="name"
          class="elevation-1"
        >
          <template v-slot:headers="props">
            <tr>
              <th>
                <v-checkbox
                  :input-value="props.all"
                  :indeterminate="props.indeterminate"
                  primary
                  hide-details
                  @click.stop="toggleAll"
                ></v-checkbox>
              </th>
              <th v-for="header in props.headers" :key="header.text">{{ header.text }}</th>
            </tr>
          </template>
          <template v-slot:items="props">
            <tr :active="props.selected" @click="props.selected = !props.selected">
              <td class="text-xs-center">
                <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
              </td>
              <td class="text-xs-center">{{ props.item.name }}</td>
              <td class="text-xs-center">{{ props.item.department.name}}</td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout>
        <v-flex class="btnCalculate">
          <v-btn color="info" @click="calculate()">计算奖金</v-btn>
        </v-flex>
      </v-layout>
    </div>
    <!-- 弹框 -->
    <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>
<script>
import {required} from 'vuelidate/lib/validators'
export default {
  validations:{
    type_selected: {required}
  },
  data(){
    return{
        // 弹框
    top: true,
    right: false,
    snackbar: false,
    titleTip: "",
    color: "",
      // 周期开始
    period_start: new Date().toISOString().substr(0, 10),
    menu_start: false,
    // 周期结束
    period_end: new Date().toISOString().substr(0, 10),
    menu_end: false,
    // 预计发放日期
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    name_selected: "",
    type_selected: "",
    items: [],
    itemsType: ["一般分红", "股权分红", "绩效", "双薪"],
    pagination: {
      sortBy: "name"
    },
    selected: [],
    headers: [
      { text: "员工姓名", align: "center", value: "name" },
      { text: "所在部门", align: "center" }
    ],
    desserts: []
    }
  },
  
  computed: {
    typeErr(){
      const err = []
      if(!this.$v.type_selected.$dirty){
        return err
      }  
      !this.$v.type_selected.required && err.push("请输入奖金类型")
      return err
    }
  },
  created() {
    this.getBonusCalculate();
  },
  watch: {
    selected: function(newval, oldval) {}
  },
  methods: {
    getBonusCalculate() {
      this.$axios.get("/api/salaryStructure/calculateList", {}).then(res => {
        if(res.data.status=="400"){
            
        return false
        }else if(res.data.status=="200"){
           this.desserts = res.data.result;
        for (let index = 0; index < res.data.result.length; index++) {
          this.items.push(res.data.result[index].name);
        }
        this.items.unshift("全部");

        }
       
      });
    },
    search() {
    
      if (this.name_selected == "全部") {
        this.getBonusCalculate();
      } else {
        this.$axios
          .get("/api/salaryStructure/departmentSearch", {
            params: { name: this.name_selected }
          })
          .then(res => {
            this.desserts = res.data.result;
          });
      }
    },
    calculate() {
      this.$v.$touch()
      if(this.type_selected == ""){
        return false
      }
      if(this.selected == ""){
        this.snackbar = true,
        this.color = "error",
        this.right = true,
        this.titleTip = "请至少选择一个员工信息！！";
        return false
      }
      var All_id = [];
      for (const iterator of this.selected) {
        All_id.push({
          _id: iterator._id,
          department_id: iterator.department._id
        });
      }
      this.$axios
        .put("/api/salaryStructure/createRecord", {
          // 员工id 和 部门department_id
          _id: All_id,
          date: this.date,
          period: this.period_start + "~" + this.period_end,
          type: this.type_selected
        })
        .then(res => {
          if(res.data.status=="200"){
             this.snackbar = true,
        this.color = "info",
        this.right = true,
        this.titleTip = "奖金计算成功！！";

          }else if(res.data.status=="400"){
             this.snackbar = true,
              this.color = "error",
              this.right = true,
              this.titleTip = "请选择正确的奖金池日期";

          }
       
        });
          this.$v.$reset()
          this.type_selected = ""
          this.selected = []
          
        
    },
    toggleAll() {
      if (this.selected.length) {
        this.selected = [];
      } else {
        this.selected = this.desserts;
      }
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.btnCalculate {
  text-align: right;
}
.btnCalculate button {
  margin: 20px 80px 0 0;
}
.search {
  margin-top: -40px;
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