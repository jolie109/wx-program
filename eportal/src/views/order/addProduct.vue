<template>
  <div class="addEmployee">
    <h1>增加商品</h1>
    <v-layout>
      商品编号 <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field
          label="请输入商品编号"
          v-model="productId"
          class="pleaseInput1"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      商品名称 <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field
          label="请输入商品名称"
          v-model="productName"
          class="pleaseInput1"
        ></v-text-field>
      </v-flex>
    </v-layout>
     <v-layout>
      商品图片 <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
      <input type="file" accept=".jpg, .jpeg, .png" @change="uploadAvatar">
      </v-flex>
    </v-layout>
    <!-- 商品类型 -->
    <v-layout class="salaryClass">
      商品类型<span class="star">*</span> <span @click="addProductType()" class="add star">+</span>
    </v-layout>
    
    <v-layout class="selectP"  style="display:flex;flex-direction:column">
         <v-layout v-for="(itemss,index) in productTypes" :key="index">
           <span @click="delProductType(index)" class=" del"></span> 产品物料名称
            <v-flex xs4 sm2 md2   d-flex class="pleaseInput">
                <v-text-field
                label="请输入物料名称"
                v-model="itemss.metiralName"
                class="pleaseInput1"
                ></v-text-field>
            </v-flex>
        </v-layout >
   </v-layout>
   <!-- 商品价格 -->
   <v-layout class="salaryClass">
      商品规格及定价<span class="star">*</span> <span @click="addsingledata()" class="add star">+</span>
    </v-layout>
   <v-layout class="selectP" v-for="(item, p) in salePrice" :key="p" >
       <span @click="delsingledata(p)" class=" del"></span> 
      <v-flex xs2 class="pleaseInput">
        <v-select
          label="请选择产品物料名称"
          :items="productTypes"
          item-text="metiralName"
          v-model="item.metiralName"
        ></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field  label="请输入克重" v-model="item.pageWeight" ></v-text-field>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field  label="请输入纸张类型" v-model="item.pageType" ></v-text-field>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入单价" v-model="item.price"  ></v-text-field>
      </v-flex>
    </v-layout>
    <!-- 商品描述 -->
    <v-layout>
      商品描述文字 <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field
          label="请输入描述内容"
          v-model="productdesctext"
          class="pleaseInput1"
        ></v-text-field>
      </v-flex>
    </v-layout>
      <v-layout class="salaryClass">
      商品描述图片 <span class="star">*</span>
    </v-layout>
    <v-layout class="selectP" >
       <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
      <input type="file" accept=".jpg, .jpeg, .png" @change="addDescImage">
      </v-flex>
          <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
      <input type="file" accept=".jpg, .jpeg, .png" @change="addDescImage">
      </v-flex>
          <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
      <input type="file" accept=".jpg, .jpeg, .png" @change="addDescImage">
      </v-flex>
      <span @click="delDescImage(s)" class="delBasicSalary"></span>
    </v-layout>
     <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="cancle()">取消</v-btn>
          <v-btn color="info" @click="handleAdd()">保存</v-btn>
        </v-card-actions>
  </div>
</template>

<script>
export default {
  name: 'addEmployee',
  data() {
    return { 
        productId:"",
        productName:"",
        productImage:"",
        productTypes:[],
        pageWeight:"",
        pageType:"",
        price:0,
        productdesctext:"",
        productDescImages:[],
        salePrice:[],
        pageWeightarr:[],
        pageTypearr:[],
        productpricedata:[],
    };
  },
  created(){
    
   
  },
  mounted(){
    
  },
  methods: {
      //增加物料类型
    addProductType() {
      let typedata={
        metiralName:"",   
    }
    this.productTypes.push(typedata)
    },
     //del物料类型
    delProductType(index){
   this.productTypes.splice(index,1)
    },
    //
    //增加单价的组合方式
    addsingledata(){
        let pricedata={
          "metiralName":'',
           pageWeight:'',
           pageType:"",
           price:""
        }
        this.salePrice.push(pricedata)
    },
    //删除单价的组合方式
    delsingledata(index){
        this.salePrice.splice(index,1)
    },
    //add'描述的图片
    addDescImage(e) {
         this.productDescImages.push(e.target.files[0])
    },
    //del描述的图片
    delDescImage(index){
       this.productDescImages.splice(index, 1);
    },
    cancle(){
      this.$router.push('/orderStystem/product/subproduct')
    },
    handleAdd(){
    this.createProduct();
    },
    uploadAvatar(e) {
  this.productImage=e.target.files[0]
},
    //增加产品
    createProduct(){
      let params={
         productId:this.productId,
         productName:this.productName,
         productImage:this.productImage,
         productdesctext:this.productdesctext,
         productTypes:JSON.stringify(this.productTypes),
         salePrice:JSON.stringify(this.salePrice)
      }
      var formdata = new FormData();
      this.productDescImages.forEach((item,index)=>{
        formdata.append("productDescImages",item)
      })
   for (var key in params) {  //读取data中所要上传的内容循环append到fordata中
    if (key) {
     formdata.append(key, params[key])
    }
   }
      this.$axios.post("/api/jiedanadmin/addProductList",formdata,{
        headers: { 'content-type': 'multipart/form-data' }
    }).then(res => {
           if(res.data.status=="200"){
             this.$router.push("/orderStystem/product/subproduct")
                
           }
           this.productId=''
                this.productName=''
                this.productImage=''
                this.productdesctext=''
                this.productTypes=[]
                this.productDescImages=[]
                this.salePrice=[]
      })
    }
  }
};
</script>

<style scoped>
.addEmployee {
  box-shadow: 0 1px 2px 2px #ccc;
  padding: 40px 60px 160px;
  color: #333;
  width: 85%;
}
.addEmployee h1 {
  text-align: center;
  opacity: 0.8;
}
.addEmployee h2 {
  margin-bottom: 20px;
}
.addEmployee h2 span {
  color: red;
}
.star{
    color: red;
    display: inline-block;
    padding: 20px;
    font-size: 20px;
}
.add{
    font-size: 35px;
}
.pleaseInput {
  display: inline-block !important;
  margin-left: 50px;
}
.pleaseInput1 {
  width: 800px !important;
}
.addEmployee .selectP {
  position: relative;
}
.addEmployee .selectP .del {
    display: inline-block;
    width: 24px;
    padding: 10px;
    border-top: 2px solid red;
    margin-top: 4px;
    margin: 18px 15px 0 4px;
    cursor: pointer;

}
.delSupply{
  right: 30%!important;
}
.addEmployee /deep/ .theme--light.v-icon {
  color: #2886c8;
  font-size: 40px;
}
.layoutBtn {
  margin-right: 150px;
}
.layoutBtn button:nth-of-type(1) {
  margin-right: 40px;
}
/* 添加基本薪资按钮 */
.addBasicSalary {
  cursor: pointer;
}
/* 删除基本薪资当前行按钮 */
.delBasicSalary {
  cursor: pointer;
}
/* 增加后的预览效果 */
.theme--light.v-sheet{
  padding: 55px;
}
.layout {
    font-size: 18px!important;
    display: flex!important;
    align-items: center!important;
    margin-bottom: 20px!important;
}
.salaryClass{
  margin-bottom: 20px;
}
.theme--light.v-btn{
  margin-right: 60px!important;
}
.supplyLay{
  padding-left: 55px!important;
  color: rgb(88, 87, 87)!important;
  
}
.supplyLay .flex.xs6{
  font-size: 16px!important;
}
/* 日期 */
.datePosition{
  position: relative;
  margin-left: 48px;
}
.v-menu__content{
  position: absolute!important;
  top:298px!important;
  left: 538px!important;
}
</style>
