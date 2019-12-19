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
    <v-data-table :headers="headers" :items="orders" class="elevation-1">
      <template v-slot:items="props">
        <td>{{orders.indexOf(props.item)+1}}</td>
        <td>{{ props.item.orderId }}</td>
        <td>{{ props.item.orderCreateDate }}</td>
        <!-- <td>{{ props.item.userid }}</td> -->
        <td>{{props.item.orderStatus=="3"?"待收货":(props.item.orderStatus=="2"? "待发货":"已收货")}}</td>
        <td>{{ props.item.goodsList.length }}</td>
        <td>{{Number(props.item.orderTotal)+Number(props.item.freightPay) }}</td>

        <td>
          <v-btn color="primary" small @click="orderDetail(props.item.orderId,props.item.openId)">查看订单详情</v-btn>
        </td>
       <td style="display:flex;">
          <v-btn
            color="primary"
            small
            @click="seelog(props.item.shipCompany,props.item.shipNum)"
            v-if="props.item.orderStatus!=='2' && props.item.distributionType !=='自提'"
            width="700"
          >查看物流信息</v-btn>
            <v-btn
            color="green "
            style="color:white;"
            small
            @click="writelog(props.item.openId,props.item.orderId)"
            v-if="props.item.orderStatus=='2' && props.item.distributionType !=='自提'"
            width="700"

          >填写物流信息 </v-btn>
          <v-btn
            color="green "
            style="color:white;"
            small
            @click="sinceStatus(props.item.openId,props.item.orderId)"
            v-if="props.item.distributionType=='自提'&& props.item.orderStatus=='2' "
            width="700"

          >待提取 </v-btn>  
           <v-btn
            color="gray"
            style="color:white;"
            small
            @click="sinceStatus(props.item.openId,props.item.orderId)"
            v-if="props.item.distributionType=='自提'&& props.item.orderStatus=='4'"
            width="700"
            disabled
          >已提取 </v-btn>   
          <!-- 2-4 -->
        </td>
      </template>
    </v-data-table>
    <!-- 填写物流弹框详情 -->
    <v-dialog v-model="flag" max-width="300" max-height="500">
      <v-card>
        <v-card-title class="headline">请录入信息</v-card-title>
        <v-card-text>
          <v-text-field v-model="shipCompany" label="快递公司" required></v-text-field>
          <v-text-field v-model="shipNum" label="运单编号" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="handle()">确定</v-btn>
          <v-btn color="green darken-1" flat="flat" @click="flag = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        <!-- 查看物流弹框详情 -->
    <v-dialog v-model="catflag" max-width="300" max-height="500" >
      <v-card>
        <v-card-title class="headline">查看物流信息</v-card-title>
        <v-card-text>
          <v-text-field v-model="logcompany" label="快递公司" disabled></v-text-field>
          <v-text-field v-model="lognum" label="运单编号" disabled></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="catflag = false">取消</v-btn>
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
      orders: [],
      headers: [
        { text: "编号", value: "" },
        { text: "订单编号", value: "receiver" },
        { text: "下单时间", value: "addressInfo" },
        // { text: "客户id", value: "" },
        { text: "订单状态", value: "orderTotal" },
        { text: "商品数量", value: "" },
        { text: "订单金额", value: "" },
        { text: "查看详情", value: "" },
        { text: "物流信息", value: "" }
      ],
      flag: false,
      orderIds: [],
      orderId: "",
      orderSend: ["全部", "待收货", "待发货", "已收货"],
      orderidlist: [],
      statuscode: "0",
      dataorder: [],
      shipCompany: "",
      shipNum: "",
      openId: "",
      text: "",
      snackbar: false,
      color: "",
      top: true,
      right: true,
      seelogdata:false,
      catlog: false, //显示查看物流详情
      lognum:"",
      logcompany:"",
      catflag:false,
      orderStatus:''
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      let params = {
        hanopay: true
      };
      this.$axios
        .get("api/jiedanadmin/allorderlist", { params: params })
        .then(res => {
          if (res.data.status === "200") {
            this.orderStatus='待发货'
            res.data.result.forEach(orderitem=>{
              if(orderitem.orderStatus=='2'){
              this.orders.push(orderitem)
              }
                 this.orderidlist.push(orderitem.orderId);
            })
            this.dataorder = res.data.result;
          } else if (res.data.status === "404") {
            this.snackbar = true;
            this.text = "获取列表失败";
            this.color = "error";
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
        orderId: this.orderId,
        hasnopay: true
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

  writelog(k, v) {
      this.shipNum="";
      this.shipCompany="";
      this.flag = !this.flag;
      this.openId = k;
      this.orderId = v;
    },
    handle() {
      this.flag = !this.flag;
      if (this.shipNum && this.shipCompany != "") {
        this.$axios
          .post("api/jiedanadmin/unshippedOrderListdo", {
            shipNum: this.shipNum,
            shipCompany: this.shipCompany,
            orderId: this.orderId,
            openId: this.openId
          })
          .then(res => {
            if (res.data.status === "0") {
              this.snackbar = true;
              this.text = "发货成功！";
              this.flag = false;
              this.shipNum = "";
              this.shipCompany = "";
              this.color = "info";
              var index=this.orders.indexOf(res.data.result)
              this.orders.splice(index,1)
              this.catlog = true;
            }
          });
      } else {
        this.flag = true;
        this.snackbar = true;
        this.text = "填写内容不能为空";
        this.color = "error";
        this.shipNum = "";
        this.shipCompany = "";
        this.catlog = false;
      }
    },
    seelog(k,v){
      this.seelogdata=true
      this.catflag=true
      this.logcompany=k;
      this.lognum=v
  },
  sinceStatus(K,V){
      this.openId = K;
      this.orderId = V;
       this.$axios
          .post("api/jiedanadmin/sinceStatus", {
            shipNum: this.shipNum,
            shipCompany: this.shipCompany,
            orderId: this.orderId,
            openId: this.openId
          })
          .then(res => {
            if (res.data.status === "200") {
              this.snackbar = true;
              this.text = "发货成功！";
              this.flag = false;
              this.shipNum = "";
              this.shipCompany = "";
              this.color = "info";
              this.getList();
              this.catlog = true;
            }

          });
    },
   orderDetail(orderid,openid){
     this.$router.push({
          path: "/orderStystem/Order/orderDetail",
          query: {
            id:orderid,
            openId:openid,
            logenter:true
          }
        });
    }
  },
  
};
</script>
<style scoped>
 
</style>