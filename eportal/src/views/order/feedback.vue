<template>
  <div>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-select :items="name" label="请输入客户姓名" v-model="customerName"></v-select>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="primary" @click="searchfun">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <v-data-table :headers="headers" :items="customerinfo">
      <template v-slot:items="props">
        <td>{{customerinfo.indexOf(props.item)+1}}</td>
        <td>{{ props.item.customerName }}</td>
        <td>{{ props.item.callType }}</td>
        <td>{{ props.item.feedBackText }}</td>
        <td style="text-align:left">
          <v-btn color="primary" small @click="customerDetail(props.item.callType)">查看反馈信息</v-btn>
        </td>
      </template>
    </v-data-table>
    <!-- 查看反馈信息 -->
    <v-dialog v-model="dialodflag" max-width="500" max-height="500">
      <v-card>
        <v-card-title class="headline">反馈信息</v-card-title>
        <!-- <v-row>
          <v-col>
            <v-textarea solo v-model="feedtext"></v-textarea>
          </v-col>
        </v-row> -->
        <v-textarea background-color="light-white" color="black"  v-model="feedtext" style="margin:30px;" disabled></v-textarea>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="dialodflag = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 弹框 -->
    <v-snackbar :color="color" :top="top" :right="right" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">add_alert</v-icon>
      <div>{{text}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </div>
</template>
<script>
export default {
  data() {
    return {
      headers: [
        { text: "编号", value: "" },
        { text: "客户姓名", value: "customerName" },
        { text: "联系方式", value: "callType" },
        { text: "反馈信息", value: "feedBackText" },
        { text: "操作", value: "" }
      ],
      customerName: "",
      customerinfo: [],
      color: "",
      top: true,
      right: true,
      snackbar: false,
      text: "",
      name: [],
      dialodflag: false,
      feedtext: "",
      dialogflag: false
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.$axios.get("api/jiedanfeedback/feedbacklist", {}).then(res => {
        if (res.data.status === "200") {
          this.customerinfo = res.data.result;
          this.customerinfo.forEach(item => {
            this.name.push(item.customerName);
          });
        } else if (res.data.status === "404") {
          this.snackbar = true;
          this.text = "获取列表失败";
          this.color = "error";
        }
      });
    },
    searchfun() {
      let params = {
        customerName: this.customerName
      };
      this.$axios.post("api/jiedanfeedback/feedSerach", params).then(res => {
        if (res.data.status === "200") {
          this.customerinfo = res.data.result;
          this.snackbar = true;
          this.text = "搜索成功";
          this.color = "info";
        } else if (res.data.status === "404") {
          this.snackbar = true;
          this.text = "搜索失败";
          this.color = "error";
        }
      });
    },
    customerDetail(call) {
      this.dialodflag = true;
      let params = {
        feedcall: call
      };
      this.$axios.post("api/jiedanfeedback/feedTextInfo", params).then(res => {
        if (res.data.status === "200") {
          this.feedtext = res.data.result;
        }
      });
    }
  }
};
</script>
<style scoped>
.table {
  width: 960px;
  height: 60px;
  text-align: left;
}
.table tr th {
  width: 50px;
  padding: 5px;
}
.table2 .scontainer td {
  width: 90px;
  text-align: left;
}
</style>