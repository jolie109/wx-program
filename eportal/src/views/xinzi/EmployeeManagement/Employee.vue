<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3>
          <v-autocomplete :items="selectDesserts" item-text="name" item-value="_id" v-model="employeeId" label="请选择/输入员工姓名"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="searchEmployee">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classifyBg">
      <v-flex xs12 class="classifyBgFlex">
        <p>员工信息管理</p>
        <p>员工信息</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-center">{{ props.item.entry_time }}</td>
          <td class="text-xs-center">{{ props.item.is_manager==true ? '是':'否'}}</td>
          <td class="text-xs-center">{{ props.item.itemEmployee[0].name}}</td>
          <td class="text-xs-center">{{ props.item.task_count}}</td>
          <td class="text-xs-center">{{ props.item.value_index}}</td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">查看详情</v-btn>
            <v-btn color="info" @click="handleDelete(props.item,props.item._key)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-container grid-list-md class="delcontainer">暂时无法删除员工</v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="handleSave">确定</v-btn>
        </v-card-actions>
        <span class="delSpan" @click="close">X</span>
      </v-card>
    </v-dialog>
    <!-- 弹框 -->
    <v-snackbar color="info" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{titleTip}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>
<script>
export default {
  name: "Employee",
  data() {
    return {
      dialog: false,
      titleTip: "",
      editedIndex: -1,
      selectDesserts:[],
      // 弹框信息
      top: true,
      right: false,
      snackbar: false,
      employeeId: "",
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "姓名", align: "center", sortable: false, value: "name" },
        { text: "入职日期", align: "center", sortable: false, value: "name" },
        { text: "是否为主管", align: "center", sortable: false, value: "name" },
        { text: "所在部门", align: "center", sortable: false, value: "name" },
        { text: "任务点数", align: "center", sortable: false, value: "name" },
        {
          text: "Value Index",
          align: "center",
          sortable: false,
          value: "name"
        },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      desserts: []
    };
  },
  mounted() {
    this.getEmployeeInfo();
  },
  methods: {
    //获取数据时员工信息表与部门表连接
    getEmployeeInfo() {
      this.$axios.get("/api/employee/getEmployee_department").then(res => {
        if (res.data.status == 200) {
          this.desserts = res.data.result;
          this.selectDesserts=['全部',...res.data.result];
        }else{
          this.titleTip=res.data.msg;
          this.color='error';
          this.snackbar=true;
          this.right=true;
        }
      });
    },
    handleAdd() {
      this.$router.push({
        name: "addEmployee",
        params: {
          desserts: this.desserts
        }
      });
    },
    handleEdit(item) {
      localStorage.setItem("item", JSON.stringify(item));
      this.$router.push({
        name: "detailEmployee"
      });
    },
    handleDelete(value) {
      this.dialog = true;
      // this.value = value;
    },
    handleSave(value) {
      this.close()
      // this.$axios
      //   .delete("/api/employee/deleteEmployee", {
      //     data: {
      //       _id: this.value._id
      //     }
      //   })
      //   .then(res => {
      //     var index = this.desserts.indexOf(this.value);
      //     this.desserts.splice(index, 1);
      //     this.close();
      //     //弹框提示
      //     this.titleTip = res.data.msg;
      //     this.snackbar = true;
      //     this.right = true;
      //     this.color = "info";
      //   });
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    searchEmployee() {
      if (this.employeeId == "全部") {
        this.getEmployeeInfo();
      } else {
        this.$axios
          .get("/api/employee/employeeInfoByName", {
            params: { _id: this.employeeId }
          })
          .then(res => {
            this.desserts = res.data.result;
          });
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/classify.css";
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
