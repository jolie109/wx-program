<template>
  <v-container class="container">
    <p class="tit">{{enter==true?"查看订单":"编辑订单"}}</p>
    <div class="box">
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>订单编号</v-subheader>
        </v-flex>
        <v-flex md6 lg6> 
          <v-text-field v-model="orderinfo.orderId" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>下单时间</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.orderCreateDate" disabled></v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>是否开票</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.hasInvo" disabled></v-text-field>
        </v-flex>
      </v-layout>
         <!-- -------------- -->
       <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>提取方式</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.distributionType" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <!-- -------- -->
      <v-layout row v-if="orderinfo.orderStatus ==='3'">
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>寄件快递</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.shipCompany" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row v-if="orderinfo.orderStatus ==='3'">
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>物流单号</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.shipNum" disabled></v-text-field>
        </v-flex>
      </v-layout>
   
      <v-layout row >
        <v-flex xs4 md4 lg2 class="row_lab_sty" >
          <v-subheader>收件人姓名</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderaddressInfo.userName" :disabled="orderinfo.orderStatus !=='1'"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row >
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            收件人电话号码
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6 >
          <v-text-field v-model="orderaddressInfo.tel" :disabled="orderinfo.orderStatus !=='1'"></v-text-field>
        </v-flex>
      </v-layout  >
      <!-- ---------- -->
      <v-layout row v-if="orderinfo.distributionType=='快递'"  :disabled="orderinfo.orderStatus !=='1'">
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>收件人地址</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderaddressInfo.address" :disabled="orderinfo.orderStatus !=='1'"></v-text-field>
        </v-flex>
      </v-layout>
    <!-- --------------------- -->
        <v-layout row v-else>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>自提地址</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.sinceAddress" :disabled="orderinfo.orderStatus !=='1'" ></v-text-field>
        </v-flex>
      </v-layout>
      <!-- ----------------------- -->
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>订单金额</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.orderTotal"  :disabled="orderinfo.orderStatus !=='1'"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>物流费用</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.freightPay" :disabled="orderinfo.orderStatus !=='1'" ></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>留言</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.message" :disabled="orderinfo.orderStatus !=='1'"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md12 lg2 class="row_lab_sty">
          <v-subheader>订单产品</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <!-- <v-text-field v-model="desserts.item.name"></v-text-field> -->
        </v-flex>
      </v-layout>
      <!-- 订单商品列表 -->

      <v-layout>
        <v-flex md12>
          <v-data-table :headers="headers" :items="orderinfo.goodsList" class="elevation-1">
            <template v-slot:items="props">
              <td>{{ props.item.productId}}</td>
              <td>{{ props.item.productName }}</td>
              <td>{{ props.item.metiralName}}</td>
              <td>{{ props.item.pageWeight}}</td>
              <td>{{ props.item.pageType }}</td>
              <td>{{ props.item.productNum }}</td>
             <td>{{ props.item.salePrice || props.item.singlePrice }}</td>
              <td>{{ props.item.singleTotal || props.item.totalPrice}}</td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
      <v-layout row class="btn_sty">
        <v-flex md4 lg2 btn>
          <v-btn color="info" dark @click="backToSave()" v-if="enter==false">确定</v-btn>
        </v-flex>
        <v-flex md4 lg2 btn>
          <v-btn color="info" dark @click="backToCancel()">返回</v-btn>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>

<script>
import { resolve } from "q";
export default {
  data() {
    return {
      orderinfo: {},
      headers: [
        { text: "商品id", value: "orderId" },
        { text: "商品名称", value: "receiver" },
        // { text: "商品图片", value: "addressInfo" },
        { text: "纸张名称", value: "length" },
        { text: "纸张克重", value: "length" },
        { text: "纸张类型", value: "length" },
        { text: "商品数量", value: "hasInvo" },
        { text: "商品单价", value: "productNum" },
        { text: "商品总价", value: "productNum" }
      ],
      orderaddressInfo: {},
      openId: "",
      enter: false,
      orderid:""
    };
  },
  activated() {
    this.orderdetailinfo();
  },
  mounted() {
    this.orderdetailinfo();
  },
  methods: {
    orderdetailinfo() {
      this.enter = this.$route.query.logenter;
      this.openId = this.$route.query.openId;
      this.orderid=this.$route.query.id
      let params = {
        orderid: this.orderid,
        openId: this.openId
      };
      this.$axios
        .get("api/jiedanadmin/getupdateOrder", { params: params })
        .then(doc => {
          if (doc) {
            this.orderinfo = doc.data.result;
            this.orderaddressInfo = Object.assign(
              {},
              this.orderinfo.addressInfo
            );
          }
        });
    },
    backToCancel() {
      if (this.enter == true) {
        this.$router.push("/orderStystem/Order/logisticsMange");
      } else {
        this.$router.push("/orderStystem/Order/allorders");
      }
    },
    backToSave() {
      //修改订单信息
      let params = {
        openId: this.openId,
        orderId: this.orderinfo.orderId,
        address: this.orderaddressInfo.address,
        message: this.orderinfo.message,
        tel: this.orderaddressInfo.tel,
        userName: this.orderaddressInfo.userName,
        ordertotal:this.orderinfo.orderTotal,
        freightPay:this.orderinfo.freightPay,
        sinceAddress:this.orderinfo.sinceAddress
      };
      this.$axios.post("api/jiedanadmin/updateOrderinfos", params).then(doc => {
        if (doc.data.status === "200") {
          this.$router.push("/orderStystem/Order/allorders");
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
.tit {
  width: 80%;
  position: absolute;
  top: 40px;
  text-align: center;
  font-size: 30px;
  color: #4d4d4d;
}
.box {
  margin: 81px 31px 68px 31px;
}
.row_lab_sty {
  padding: 14px 0 16px 50px;
}
.row_lab_sty span {
  color: red;
  margin-left: 4px;
}
.select_sty {
  margin-bottom: 230px;
}
.btn_sty {
  margin: 50px 0 228px 600px;
}
.show_sty {
  padding: 14px 0 16px;
}
.btn {
  margin-right: 50px;
}
</style>