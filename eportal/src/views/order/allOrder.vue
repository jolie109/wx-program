<template>
  <div>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-select :items="orderSend" label="请选择订单状态" v-model="orderStatus" @change="changestatus"></v-select>
      </v-flex>
      <v-flex d-flex md2 style="margin-left:50px;">
        <v-autocomplete label="请输入订单编号" :items="orderidlist" clearable v-model="orderId"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="primary" @click="searchfun">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
      <v-data-table :headers="headers" :items="orders">
      <template v-slot:items="props">
        <td>{{orders.indexOf(props.item)+1}}</td>
        <td>{{ props.item.orderId }}</td>
        <td>{{ props.item.orderCreateDate }}</td>
        <!-- <td>{{ props.item.userid }}</td> -->
        <td>{{props.item.orderStatus=="3"?"待收货":(props.item.orderStatus=="2"? "待发货":(props.item.orderStatus=="1"? "待付款":"已收货"))}}</td>

        <td>{{ props.item.isInvoice==true?"是":'否'}}</td>
        <td>{{ props.item.goodsList.length }}</td>
        <td>{{ Number(props.item.orderTotal)+Number(props.item.freightPay) }}</td>

        <td style="text-align:left">
          <v-btn
            color="info"
            small
            @click="orderDetail(props.item.orderId,props.item.openId)"
            :disabled="props.item.orderStatus==0?true:false"
          >查看|编辑</v-btn>
        </td>
      </template>
    </v-data-table>
   
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
      orders: [],
      headers: [
        { text: "编号", value: "" },
        { text: "订单编号", value: "receiver" },
        { text: "下单时间", value: "addressInfo" },
        // { text: "客户id", value: "" },
        { text: "订单状态", value: "orderTotal" },
        { text: "是否开票", value: "createDate" },
        { text: "商品数量", value: "" },
        { text: "订单金额", value: "" },
        { text: "操作", value: "" }
      ],
      flag: false,
      orderIds: [],
      orderId: "",
      orderSend: ["全部", "待收货", "待发货", "待付款", "已收货"],
      orderStatus: "全部",
      orderidlist: [],
      statuscode: "0",
      dataorder: [],
      color: "",
      top: true,
      right: true,
      snackbar: false,
      text: ""
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.$axios.get("api/jiedanadmin/allorderlist", {}).then(res => {
        if (res.data.status === "200") {
          this.orders = res.data.result;
          this.dataorder = res.data.result;
          this.orders.forEach(item => {
            this.orderidlist.push(item.orderId);
          });
        } else if (res.data.status === "404") {
          this.snackbar = true;
          this.text = "获取列表失败";
          this.color = "error";
        }
      });
    },
    getOrderInfo() {
      let params = {
        orderId: this.orderId
      };
      this.$axios.post("api/jiedanadmin/getOrderIds", params).then(res => {
        if (res) {
          this.orders = res.data.result;
          this.dataorder = res.data.result;
          this.getList();
        }
      });
    },
    changestatus() {
      this.orderidlist = [];
      this.orderId = "";
      if (this.orderStatus === "全部") {
        this.dataorder.forEach(item => {
          this.orderidlist.push(item.orderId);
        });
        this.statuscode = "0";
      } else if (this.orderStatus === "待收货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "3") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "3";
      } else if (this.orderStatus === "待发货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "2") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "2";
      } else if (this.orderStatus === "待付款") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "1") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "1";
      } else if (this.orderStatus === "已收货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "4") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "4";
      }
    },
    searchfun() {
      // 0 全部订单 1 待付款 2待发货 3 待收货 4 已收货（交易成功）
      let params = {
        orderStatus: this.statuscode,
        orderId: this.orderId
      };
      this.$axios.post("api/jiedanadmin/statusidSearch", params).then(res => {
        if (res.data.status === "200") {
          this.orders = res.data.result;
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
    orderDetail(orderid, openid) {
      this.$router.push({
        path: "/orderStystem/Order/orderDetail",
        query: {
          id: orderid,
          openId: openid,
          logenter: false
        }
      });
    }
  }
};
</script>
<style scoped>

</style>