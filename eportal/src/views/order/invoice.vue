<template>
<div>
<v-layout class="search">
      <v-flex d-flex md3>
        <v-autocomplete label="请输入订单编号" :items="orderidlist" clearable v-model="orderId" ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="primary" @click="searchOrder">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
</v-layout>
     <v-data-table :headers="headers" :items="orders" class="elevation-1">
      <template v-slot:items="props">
        <td class="text-xs-left">{{orders.indexOf(props.item)+1}}</td>
        <td class="text-xs-left">{{ props.item.orderId }}</td>
        <td class="text-xs-left">{{ props.item.orderCreateDate }}</td>
        <!-- <td>{{ props.item.userid}}</td> -->
        <td>{{props.item.orderStatus=="3"?"待收货":(props.item.orderStatus=="2"? "待发货":(props.item.orderStatus=="1"? "待付款":"已收货"))}}</td>  
        <td>{{ props.item.isInvoice==true?"是":'否'}}</td>
        <td>{{ props.item.orderTotal }}</td>  
        <td >
          <v-btn
           :disabled="!props.item.isInvoice"
            color='info'
            @click="viewInvoice(props.item.orderId,props.item.openId ,props.item.invoiceNumber)"
           
          >查看发票信息</v-btn>
        </td>
        <td id="td">
          <v-btn 
          v-if="props.item.hasInvo==='2'&& props.item.isInvoice"
            color="success"
            dark
            @click="createInvoice(props.item.orderId,props.item.openId )"
          >开票</v-btn>
           <v-btn 
            v-else-if="!props.item.isInvoice"
            disabled
            color="success"
            @click="createInvoice(props.item.orderId,props.item.openId )"
          >开票</v-btn>
           <v-btn
           v-if="props.item.hasInvo==='1' && props.item.invoiceNumber===
undefined"
            color="purple"
            dark
             @click="createLogistic(props.item.orderId,props.item.openId )"
          >填写物流信息</v-btn>
            <v-btn
           v-if="props.item.invoiceCompany&&props.item.invoiceCompany!==''"
            color="info"
            dark
             @click="viewLogistic(props.item.orderId,props.item.openId,props.item.invoiceCompany,props.item.invoiceNumber)"
          >查看物流信息</v-btn>
        </td>
      </template>
    </v-data-table>
    <!-- 填写物流信息弹框 -->
        <v-dialog v-model="flag" max-width="290">
      <v-card >
        <v-card-title class="headline">请录入信息</v-card-title>
        <v-card-text>
          <v-text-field v-model="invoiceCompany" label="快递公司" required></v-text-field>
          <v-text-field v-model="invoiceNumber" label="运单编号" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" flat="flat" @click="handle()">确定</v-btn>

          <v-btn color="green darken-1" flat="flat" @click="flag = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
         <!-- 查看物流弹框详情 -->
    <v-dialog v-model="viewflag" max-width="300" max-height="500" v-if="invoiceNumber">
      <v-card>
        <v-card-title class="headline">物流信息</v-card-title>
        <v-card-text>
          <v-text-field v-model="invoiceCompany" label="快递公司" required disabled></v-text-field>
          <v-text-field v-model="invoiceNumber" label="运单编号" required disabled></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="viewflag = false;invoiceCompany='';
     invoiceNumber='';">确定</v-btn>
          <v-btn color="green darken-1" flat="flat" @click="viewflag = false;invoiceCompany='';
     invoiceNumber='';">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        <!-- 查看发票信息 -->
    <v-dialog v-model="invoiceflag" max-width="500" max-height="500" >
      <v-card>
        <v-card-title class="headline">发票信息</v-card-title>
        <v-card-text v-for="(invoice,index) in invoiceList" :key="index">
          <v-text-field v-model="invoice.titleInvoice" label="公司名称" required disabled></v-text-field>
          <v-text-field v-model="invoice.identyInvoice" label="税号" required disabled></v-text-field>
          <v-text-field v-model="invoice.buyAdderssInvoice" label="单位地址" required disabled></v-text-field>
          <v-text-field v-model="invoice.telInvoice" label="电话号码" required disabled></v-text-field>
          <v-text-field v-model="invoice.emailInvoice" label="收票人邮箱" required disabled></v-text-field>
          <v-text-field v-model="invoice.buyBackInput" label="开户银行" required disabled></v-text-field>
          <v-text-field v-model="invoice.buyCountInvoice" label="银行账户" required disabled></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click="invoiceflag=false">确定</v-btn>
          <v-btn color="green darken-1" flat="flat" @click="invoiceflag=false;">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
     <v-snackbar
      v-model="snackbar"
      :bottom="y === 'bottom'"
      :left="x === 'left'"
      :multi-line="mode === 'multi-line'"
      :right="x === 'right'"
      :timeout="timeout"
      :top="y === 'top'"
      color="green"
      :vertical="mode === 'vertical'"
    >
      {{ text }}
    </v-snackbar>
 </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
      invoiceList:[],
      viewflag:false,
      invoiceflag:false,
      invoiceCompany:'',
      invoiceNumber:'',
      flag:false,
      snackbar: false,
        y: 'top',
        x: 'right',
        mode: '',
        timeout: 3000,
        text:'',
        orders: [],
        orderIds: [],
        orderId: "",
        orderSend: ["全部", "待付款", "待发货", "待收货","已收货"],
        orderStatus: "全部",
        orderidlist: [],
        statuscode:"0",
        dataorder:[],
        headers: [
        { text: "编号", value: "" },
        { text: "订单编号", value: "receiver" },
        { text: "下单时间", value: "addressInfo" },
        // { text: "客户id", value: "" },
        { text: "订单状态", value: "orderTotal" },
        { text: "是否需要开票", value: "createDate" },
        { text: "订单/发票金额", value: "" },
        { text: "查看" ,value:"",align: 'center'},
        { text: "功能" ,value:"",align: 'center',},
      ],
    }
  },
  watch:{},
  computed:{},
  methods:{
     getList() {
      this.$axios.get("api/jiedanadmin/allorderlist", {}).then(res => {
        if (res.data.status === "200") {
          let orders = res.data.result;
           orders=orders.filter(order=>{
            return order.orderStatus !=="1" && order.isInvoice
          })
          this.orders=orders
          //获取所有订单id
          this.orders.forEach(item => {
            this.orderidlist.push(item.orderId);
          });
        }else if(res.data.status==="404"){

        }
      });
    },
    searchOrder(){
        let params={
        orderId:this.orderId
      }
      this.$axios.post("api/jiedanadmin/findOrderbyId",params).then(res=>{
        if(res.data.status==="200"){
          this.orders=res.data.result
        }else if(res.data.status==="404"){
        }
      })
    },
    createInvoice(orderid,openid){
       let  params={
        orderId:orderid,
        openId:openid
      }
       this.$axios.post('api/jiedanadmin/OrderIsInvoice',params)
      .then(res=>{
        if(res.data.status=='200'){
          this.snackbar=true;
         this.text='开票成功'
         this.getList()
        }
      })
      
    },
    createLogistic(orderid,openid){
      this.flag=true;
      this.orderid=orderid;
      this.openid = openid;
    },

    handle() {
      if (this.invoiceCompany!=='' && this.invoiceNumber!=='' ) {
        this.$axios
          .post("api/jiedanadmin/editInvoiceLogistic", {
            invoiceNumber: this.invoiceNumber,
           invoiceCompany: this.invoiceCompany,
            orderId: this.orderid,
            openId: this.openid
          })
          .then(res => {
            if (res.data.status === "0") {
              this.snackbar = true;
              this.text = res.data.msg;
              this.invoiceNumber = "";
              this.invoiceCompany = "";
              this.color="info";
              this.flag = false;
            }
            this.getList();
          });
      } else {
        this.flag = true;
        this.snackbar = true;
        this.text = "填写内容不能为空";
        this.color="error";
        this.shipNum='';
        this.shipCompany='';

      }
    },
    viewLogistic(orderid,openid,invoiceCompany,invoiceNumber){
      this.invoiceCompany=invoiceCompany;
      this.invoiceNumber=invoiceNumber;
      this.viewflag=true;

    },
    viewInvoice(orderid,openid,invoiceNumber){
      this.invoiceNumber = invoiceNumber
        this.$axios
          .get("api/jiedanadmin/getInvoiceByOrderId", {params:{
           openid: openid,
           orderid: orderid
          }})
          .then(res => {
            if (res.data.status === "0") {
              this.invoiceList=res.data.result;
               this.invoiceflag= true;
               this.invoiceList.forEach(el=>{
               })
              
            }
          });

    },
    viewHandle(){
      this.viewflag=false;
      this.invoiceCompany='';
      this.invoiceNumber='';
    }
  },
  
  created(){},
  mounted(){
    this.getList()
  }
}
</script>
<style  scoped>
#td{
  display: flex;
}
</style>