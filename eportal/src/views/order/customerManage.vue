
<template>
  <div>
    <v-layout class="search">
      <v-flex d-flex md3>
        <v-autocomplete label="请输入客户姓名" :items="customerids" clearable v-model="cid"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="primary" @click="searchcustomer()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>

    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="list"
      item-key="_id"
      show-selected
      class="elevation-1"
    >
      <template v-slot:items="props">
        <td>{{props.item._id}}</td>
        <td>{{props.item.lasttel}}</td>
        <td>{{props.item.lastaddress}}</td>
        <td>{{props.item.ordersum}}</td>
        <td>
          <v-btn color="primary" @click="downloadToExcel(props.item)">导出</v-btn>
        </td>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar" :right="right" :top="top" :color="color">{{ text }}</v-snackbar>
  </div>
</template>
<script>
import XLSX from "xlsx";
export default {
  data() {
    return {
      snackbar: false,
      y: "top",
      x: "right",
      mode: "",
      timeout: 3000,
      text: "",
      headers: [
        { text: "客户id", value: "_id" },
        { text: "联系方式", value: "" },
        { text: "联系地址", value: "" },
        { text: "客户下单次数", value: "ordernum" },
        { text: "操作" }
      ],
      list: [],
      singleSelect: false,
      selected: [],
      goodsdata: [],
      downloaddata: [],
      customerids: [],
      top: true,
      right: true,
      color: "",
      cid: ""
    };
  },
  mounted() {
    this.getlist();
  },
  methods: {
    getlist(v) {
      //获取客户的信息
      let params = {
        cid: this.cid
      };
      this.$axios
        .get("/api/jiedanadmin/downloadcustomerdata", { params: params })
        .then(res => {
          if (res.data.status === "200") {
            this.list = res.data.result;
            this.list.forEach(item => {
              this.customerids.push(item._id);
              let k = {
                orderProductNum: 0, //  总量
                ordersum: 0, //下单次数
                lasttel: "", //最后一单的收件人的联系方式
                lastaddress: "" //最后一单的收件人的联系地址
              };
              let ids = item._id;
              k.lasttel =
                item.orderList[item.orderList.length - 1].addressInfo.tel;
              k.lastaddress =
                item.orderList[item.orderList.length - 1].addressInfo.address;
              this.ordersum = item.orderList.length;
              k.ordersum = item.orderList.length;
              item = Object.assign(item, k);
            });
         
          }
        });
    },
    searchcustomer() {
    
      this.getlist();
    },
    downloadToExcel(item) {
      require.ensure([], () => {
        this.allorderprice = 0;
        const { export_json_to_excel } = require("../../excel/Export2Exceljiedan");
        const { export_get_title_time } = require("../../excel/Export2Exceljiedan");
        const { format_json } = require("../../excel/Export2Exceljiedan");
        // 这是excel表中要显示的标题头，即最上面那一行，这是根据具体业务需求设置的
        const tHeader = [
          "客户id",
          "下单编号",
          "下单时间",
          // "类型",
          "物料1",
          "纸张类型",
          "克重",
          "商品数量",
          "订单总额"
        ];
        // 这是excel下面对应标题头要显示的具体内容，要与list中的相对应，比如简单版本中与id、title等对应
        const filterVal = [
          "id",
          "orderId",
          "orderCreateDate",
          "metiralName",
          "pageType",
          "pageWeight",
          "productNum",
          "orderTotal"
        ];
        const list = item; //要处理的数据
        var node_c = filterVal.indexOf("orderId"); //订单编号
        var cart_c = filterVal.indexOf("orderTotal"); //总价
        var time_c = filterVal.indexOf("orderCreateDate"); //创建时间

        var current_r = 1; //从第一行开始
        var current_s_r = 1; //每条数据开始行
        var node_s_r = 1; //订单编号的开始行
        var card_s_r = 1; //类型的开始行
        var time_s_r = 1; //下单时间的开始行
        //   要合并集合
        var merges = [];
        var newList = []; //重构后的数据
        //emlement为item
        //   var element = item;
        for (let j = 0; j < item.orderList.length; j++) {
          const node = item.orderList[j];
          this.allorderprice += Number(node.orderTotal);
          for (let k = 0; k < node.goodsList.length; k++) {
            const part = node.goodsList[k];
            current_r++;
            //制造重复数据，重新构建数据
            let obj = {
              id: item._id.toString(),
              orderId: node.orderId.toString(),
              orderCreateDate: node.orderCreateDate.toString(),
              metiralName: part.metiralName.toString(),
              pageType: part.pageType.toString(),
              pageWeight: part.pageWeight.toString(),
              productNum: part.productNum.toString(),
              orderTotal: node.orderTotal.toString()
            };
            newList.push(obj);
          }

          if (card_s_r != current_r - 1) {
            //类型的合并单元
            var cardmerge = {
              s: {
                c: cart_c,
                r: card_s_r
              },
              e: {
                c: cart_c,
                r: current_r - 1
              }
            };
            merges.push(cardmerge);
          }
          card_s_r = current_r;
          if (node_s_r != current_r - 1) {
            //类型的合并单元
            var nodemerge = {
              s: {
                c: node_c,
                r: node_s_r
              },
              e: {
                c: node_c,
                r: current_r - 1
              }
            };
            merges.push(nodemerge);
          }
          node_s_r = current_r;
          if (time_s_r != current_r - 1) {
            //时间的合并单元
            var timemerge = {
              s: {
                c: time_c,
                r: time_s_r
              },
              e: {
                c: time_c,
                r: current_r - 1
              }
            };
            merges.push(timemerge);
          }
          time_s_r = current_r;
        }
        var oneline = {
          s: {
            c: 0,
            r: 1
          },
          e: {
            c: 0,
            r: current_r - 1
          }
        };
        merges.push(oneline);
        let lastline = [
          {
            id: "总计",
            orderId: this.ordersum.toString(),
            orderTotal: this.allorderprice.toString()
          },
          {}
        ];
        newList = [...newList, ...lastline];
        // newList.push(lastline)
        const data = format_json(filterVal, newList);
        var currentdate = export_get_title_time();
        export_json_to_excel(tHeader, data, "客户数据下载", merges);
      });
    }
  }
};
</script>
<style scoped>

</style>