<!-- 商品管理-->
<template>
  <div>
    <v-layout>
      <v-flex md3 offset-md1>
        <v-select :items="items" label="商品名称" v-model="selected" ></v-select>
      </v-flex>
       <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="primary" @click="handleSearch">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex md2 style="margin:5px 0 0px 0px; ">
        <v-btn color="primary" @click="add()">
        添加商品
        </v-btn>
      </v-flex>
    </v-layout>
     <v-data-table :headers="headers" :items="products" >
        <template v-slot:items="props">
          <td>
            <img :src="'/api/'+props.item.productImage" width="80px" height="80px">
          </td>
          <td>{{ props.item.productName }}</td>
          <td class="text-xs-center">
            <v-btn
              color="primary"
              dark
              @click="handleUpdate(props.item)"
            >编辑
            </v-btn>
             <v-btn
              color="primary"
              dark
              @click="drop(props.item.productId)"
            >删除
            </v-btn>
          </td>
        </template>
      </v-data-table>
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
      items: ["全部"],
      temp: {
        reId: "",
        workPlace: "",
        recruitmentPosition: "",
        jobResponsibilities: []
      },
      data:{
        productName:"",
        productImage:"",
        productType1:"",
        productType2:"",
        pagesize1:'',
        pagesize2:'',
        productDesc:"",
        salePrice:0
      },
      addData:{},
      selected: "",
      recruit: [],
      headers: [
        { text: "产品图片", value: "image" },
        { text: "产品名称", value: "name" },
        {
          text: "操作",
          align: "center",
          value: "function",
          sortable: false,
          width: "260px"
        }
      ],
     color:"",
      top: true,
      right: true,
      mode: "",
      timeout: 3000,
       snackbar: false,
      text: "",
      flag: false,
      addOption: false,
      products: [],
    };
  },

  mounted(){
  this.getList()
  },
  methods: {
    getList() {
      this.$axios.get("/api/jiedanusers/wxGetProductList").then(res => {
        this.products = res.data.result;
        this.products.forEach(item => {
          this.items.push(item.productName);
        });
      });
    },
    drop(item) {
      let params={
         productId: item
      }
      this.$axios
        .delete("/api/jiedanadmin/deletepro", {data:params })
        .then(res => {
          if (res.data.status == "200") {
            this.snackbar = true;
            this.text = "删除成功！";
            this.getList();
          }
        });
    },
    handleUpdate(item) {
      this.$router.push({
        path:"/orderStystem/product/detailProduct",
        query:{item:item._id}
      })
    },
    add() {
      this.$router.push({
        path:"/orderStystem/product/addProduct",
      })
    },
    created() {
      this.flag=false;
      this.$axios
        .post("/api/jiedanadmin/addProductList", { data: this.addData })
        .then(res => {
          if(res.data.status==="200"){
             this.getList()
             this.snackbar=true;
             this.color="info";
             this.text="添加商品成功"
          }
         
        });
       
    },
    handleSearch() {
      let params = {
        productName: this.selected
      };
      this.$axios
        .get("/api/jiedanadmin/searchListData", { params: params })
        .then(res => {
          if (res.data.status == "200") {
            this.products = res.data.result;
             this.snackbar=true;
             this.color="info";
             this.text="搜索成功"
          }else{
             this.snackbar=true;
             this.color="error";
             this.text="搜索失败"
          }
        });
    }
  },
};
</script>
<style scoped>
.form-data span{
  display: inline-block;
  width:100px;
}
</style>