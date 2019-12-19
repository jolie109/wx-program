<template>
  <v-container fluid grid-list-xl>
    <v-layout class="search" >
      <v-flex xs12 sm6 md2>
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker type="month" v-model="date" @input="menu = false" locale="zh-cn"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="primary" @click="searchPayslipByMonth">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="primary" @click="publishAll">批量发布</v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="primary" @click="initData">批量下载</v-btn>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="primary" >
        <input type="file" ref="upload" accept=".xls, .xlsx" background="none"/>
        </v-btn>
      </v-flex>
    </v-layout>

    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>查看薪资单</p>
      </v-flex>
      <v-flex md12>
        <v-data-table
          v-model="selected"
          select-all
          item-key="name"
          :headers="headers"
          :items="desserts"
          class="elevation-1"
          no-data-text="本月暂无薪资单"
        >
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" primary hide-details  v-show="props.item.monthly_payslip.status=='草稿'"></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department.name }}</td>
            <td>{{ props.item.entry_time }}</td>
            <td>{{ props.item.salarySum.basicSum }}</td>
            <td>{{ props.item.salarySum.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td>
              <v-btn
                small
                color="primary"
                @click="editItem(props.item)"
              >{{props.item.monthly_payslip.status=="草稿"?"编辑":"查看"}}</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
    <!-- 弹框 -->
    <v-snackbar :color="color" top right v-model="snackbar">
      <v-icon color="white" mr-3 size="20">add_alert</v-icon>
      {{ info }}
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>
<script>
import XLSX from "xlsx";
export default {
  name: "employees",
  data: () => ({
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    selected: [],
    download_all: [],
    download_content: [],
    employeeIds: [],
    special_adjust: [],
    afterData: [],
    headers: [
      {
        text: "员工姓名",
        sortable: false,
        width: 100,
        value: "name"
      },
      { text: "所在部门", value: "department", sortable: false },
      { text: "入职日期", value: "date", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", width: "100px", sortable: false }
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      department: "",
      month: "",
      status: ""
    },
    defaultItem: {
      name: "",
      department: "",
      month: "",
      status: ""
    },
    snackbar:false,
     color: "",
    info: "",
  }),
  created() {
    this.getEmployeePayslip();
  },
  mounted() {
    this.$refs.upload.addEventListener("change", e => {
      // 绑定监听表格导入事件
      this.readExcel(e);
    });
  },
  methods: {
    getEmployeePayslip() {
      this.$axios
        .get("/api/salaryList/allEmployeePayslip", {
          params: {
            create_date: this.date
          }
        })
        .then(res => {
          this.desserts = res.data.result;
        });
    },
// 下载
    initData() {
       this.employeeIds=[]
      this.selected.forEach(itt => {
        if(itt.monthly_payslip.status=="草稿"){
            this.employeeIds.push(itt._id);
        }
      });
      if(this.employeeIds.length==0){
          this.snackbar = true;
          this.color = "error";
          this.info = "下载失败，请选择符合要求的数据";
      }
      this.$axios
        .get("/api/salaryList/downloadAll", {
          params: {
            create_date: this.date,
            employeeId: this.employeeIds
          }
        })
        .then(res => {
          if (res.data.result.length>0) {
           
            res.data.result.forEach(i => {
              // 当monthly_payslip中 有 special_adjust的内容时
              if (i.monthly_payslip.special_adjust.length > 0) {
                i.monthly_payslip.special_adjust.forEach(j => {
                  this.download_all = {
                    monthly_payslip_id: i.monthly_payslip._id,
                    name: i.name,
                    create_date: i.monthly_payslip.create_date,
                    dapartment: i.depart.name,
                    adjust_type: j.adjust_type,
                    adjust_content: j.memo,
                    adjust_amount: j.amount
                  };
                  this.download_content.push(this.download_all);
                });
              } else {
               
                // 当monthly_payslip中 没有 special_adjust的内容时
                this.download_all = {
                  monthly_payslip_id: i.monthly_payslip._id,
                  name: i.name,
                  create_date: i.monthly_payslip.create_date,
                  dapartment: i.depart.name,
                  adjust_type: "",
                  adjust_content: "",
                  adjust_amount: ""
                };
                this.download_content.push(this.download_all);
              }
            });
            require.ensure([], () => {
              const {
                export_json_to_excel
              } = require("@/excel/Export2Excel");
              // 这是excel表中要显示的标题头，即最上面那一行，这是根据具体业务需求设置的
              const tHeader = [
                "薪资单id",
                "部门",
                "姓名",
                "调整类型",
                "内容",
                "金额"
              ];
              // 这是excel下面对应标题头要显示的具体内容，要与list中的相对应
              const filterVal = [
                "monthly_payslip_id",
                "dapartment",
                "name",
                "adjust_type",
                "adjust_content",
                "adjust_amount"
              ];
              let list = this.download_content;
              let data = this.formatJson(filterVal, list);
              export_json_to_excel(tHeader, data, "员工薪资单的调整项部分");
               this.snackbar = true;
              this.color = "info";
              this.info = "下载成功";
            });
          }
        });
      this.employeeIds = [];
      this.download_content = [];
    },
    formatJson(filterVal, list) {
      return list.map(v => filterVal.map(j => v[j]));
    },
    // 上传
    readExcel(e) {
      // 表格导入
      const that = this;
      const { files } = e.target;
      if (files.length <= 0) {
        // 如果没有文件名
        return false;
      }
      if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$Message.error("上传格式不正确，请上传xls或者xlsx格式");
        return false;
      }
      const fileReader = new FileReader();
      fileReader.onload = ev => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
          });
          const wsname = workbook.SheetNames[0]; // 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // 生成json表格内容

          let tempArr = [];
          let a = {};
          for (let i = 0; i < ws.length; i++) {
            a = {
              adjust_type: ws[i].调整类型,
              memo: ws[i].内容,
              amount: (ws[i].金额).toString()
            };
            if (tempArr.indexOf(ws[i].薪资单id) === -1) {
              this.afterData.push({
                _id: ws[i].薪资单id,
                special_adjust: [a]
              });
              tempArr.push(ws[i].薪资单id);
            } else {
              for (let j = 0; j < this.afterData.length; j++) {
                if (this.afterData[j]._id == ws[i].薪资单id) {
                  this.afterData[j].special_adjust.push(a);
                  break;
                }
              }
            }
          }
          this.$axios
            .put("/api/salaryList/uploadAll", {
              params: {
                uploadData: this.afterData
              }
            })
            .then(res => {});
          that.outputs = []; // 清空接收数据
          // 编辑数据
          ws.map(i => {
            const sheetData = {
              address: ws[i].addr,
              value: ws[i].value
            };
            that.outputs.push(sheetData);
            return "";
          });
          this.$refs.upload.value = "";
        } catch (e) {
          return false;
        }
      };
      fileReader.readAsBinaryString(files[0]);
      this.snackbar = true;
              this.color = "info";
              this.info = "上传成功";
    },
    // 批量发布
    publishAll() {
      var selected_status = this.selected.filter(function(element) {
        return element.monthly_payslip.status == "草稿";
      });
      selected_status.forEach(i => {
        this.$axios
          .post("/api/salaryList/updateMonthlyStatus_All", {
            _id: i.monthly_payslip._id
          })
          .then(res => {
            this.getEmployeePayslip();
            this.snackbar = true;
              this.color = "info";
              this.info = "发布成功";
          });
      });
    },
    searchPayslipByMonth() {
      this.getEmployeePayslip();
    },
    editItem(item) {
      this.$router.push({
        path: "/xinzi/Salary_list/checkList",
        query: {
          nameCode: item.name,
          departmentCode: item.department.name,
          monthCode: item.monthly_payslip.create_date,
          statusCode: item.monthly_payslip.status,
          employeeId: item._id,
          employee_salary_structure_ids: item.employee_salary_structure_ids
        }
      });
    }
  }
};
</script>
<style scoped>
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
