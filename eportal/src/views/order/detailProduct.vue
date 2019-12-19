<template>
  <div class="addEmployee">
    <h1>编辑产品信息</h1>
    <v-layout>
      商品id
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field
          label="商品id"
          v-model="productinfo.productId"
          class="pleaseInput1"
          :disabled="true"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      商品名称
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入商品名称" v-model="productinfo.productName" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      商品图片
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput" v-model="productinfo.productImage">
        <input type="file" accept=".jpg, .jpeg, .png" @change="uploadAvatar" />
      </v-flex>
    </v-layout>
    <!-- 商品类型 -->
    <v-layout class="salaryClass">
      商品类型
      <span class="star">*</span>
      <span @click="addProductType()" class="add0 star">+</span>
    </v-layout>
    <!-- 原来的物料名称 -->
    <v-layout
      class="selectP"
      style="display:flex;flex-direction:column"
    >
      <v-layout  v-for="(items,i) in productinfo.metiralType"
      :key="i">
        <span @click="delProductType(items,i)" class="del"></span> 产品物料名称
        <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
          <v-text-field label="请输入物料名称" v-model="items.metiralName" class="pleaseInput1"></v-text-field>
        </v-flex>
      </v-layout>
    </v-layout>
    <v-layout class="salaryClass">
      商品规格及定价
      <span class="star">*</span>
      <span @click="addsingledata()" class="add star">+</span>
    </v-layout>
    <v-layout class="selectP" :key="p" v-for="(item, p) in salePrice">
      <span @click="delsingledata(p)" class="del"></span>
      <v-flex xs2 class="pleaseInput">
        <v-select 
          label="请选择产品物料名称"
          :items="isadd==true?productinfo.metiralType:salePrice"
          item-text="metiralName"
          v-model="item.metiralName"
        ></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入克重" v-model="item.pageWeight"></v-text-field>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入纸张类型" v-model="item.pageType"></v-text-field>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入单价" v-model="item.price"></v-text-field>
      </v-flex>
    </v-layout>

    <!-- 商品描述 -->
    <v-layout>
      商品描述文字
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入描述内容" v-model="productinfo.productDescText" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout class="salaryClass">商品描述图片
      <span class="star">*</span>
    </v-layout>
    <v-layout class="selectP">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <input type="file" accept=".jpg, .jpeg, .png" @change="addDescImage" />
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <input type="file" accept=".jpg, .jpeg, .png" @change="addDescImage" />
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <input type="file" accept=".jpg, .jpeg, .png" @change="addDescImage" />
      </v-flex>
      <span @click="delDescImage(s)" class="delBasicSalary"></span>
    </v-layout>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="info" @click="cancle()">取消</v-btn>
      <v-btn color="info" @click="handleAdd()">保存</v-btn>
    </v-card-actions>

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
  name: "detailProduct",
  data() {
    return {
      salePrice: [],
      productinfo: {},
      productDescImages: [],
      productImage: "",
      productTypes: [],
      metrailselectdata:[],//物料类型下拉框数据
      isadd:false,//用来判断是增加的还是修改的
      arr:[],
      color:"",
      top: true,
      right: true,
       snackbar: false,
      text: "", 
    
    };
  },
  mounted() {
    this.getproductinfo();
  },
  methods: {
    uploadAvatar(e) {
      this.productImage = e.target.files[0];
    },
    addDescImage(e) {
      this.productDescImages.push(e.target.files[0]);
    },
    getproductinfo() {
      let id = this.$route.query.item;
      var params = {
        id: id
      };
      this.salePrice=[]
      this.$axios
        .get("/api/jiedanadmin/singleProduct", { params: params })
        .then(res => {
          if(res.data.status===200){
              this.productinfo = res.data.result;
              this.productinfo.metiralType.forEach(item => {
              if (item.salePrice) {
              item.salePrice.forEach(item2 => {
                item2 = Object.assign({ metiralName: item.metiralName }, item2);
                this.salePrice.push(item2);
                this.arr.push(item2);
              });
            }
          });
          }
        });
    },
    //增加物料类型
    addProductType() {
      this.isadd=true
        let typedata={
          "metiralName":"",
      }
      this. productinfo.metiralType.push(typedata)
    },
    //del物料类型
    delProductType(pro,k) {
        this.productinfo.metiralType.splice(k, 1);
        for(let i=0;i<this.arr.length;i++){
           let k= this.arr[i]
          if(k.metiralName==pro.metiralName){
            if (this.salePrice.indexOf(k) != -1) {
            let n = this.salePrice.indexOf(k);
            this.salePrice.splice(n, 1);
          }
        }
        }
    },
    //增加类型及单价
      addsingledata(){
        this.isadd=true
        let pricedata={
          "metiralName":'',
           "pageWeight":'',
           "pageType":"",
           "price":""
        }
        this.salePrice.push(pricedata)
        this.arr.push(pricedata)
    },
    delsingledata(index) {
      this.salePrice.splice(index, 1);
    },
    cancle() {
      this.$router.push("/orderStystem/product/subproduct");
    },
    handleAdd() {
      this.updateProduct();
    },
    //修改产品
    updateProduct() {
      let mymetiralType = [];
      this.productinfo.metiralType.forEach(item => {
        mymetiralType.push({ metiralName: item.metiralName });
      });
      let params = {
        productId: this.productinfo.productId,
        productName: this.productinfo.productName,
        productImage: this.productImage,
        productdesctext: this.productinfo.productDescText,
        productTypes: JSON.stringify(mymetiralType),
        salePrice: JSON.stringify(this.salePrice)
      };
      var formdata = new FormData();
      this.productDescImages.forEach((item, index) => {
        formdata.append("productDescImages", item);
      });
      for (var n in params) {
        //读取data中所要上传的内容循环append到fordata中
        if (n) {
          formdata.append(n, params[n]);
        }
      }
      this.$axios
        .post("/api/jiedanadmin/updateProduct", formdata, {
          headers: { "content-type": "multipart/form-data" }
        })
        .then(res => {
          if (res.data.status == "200") {
           
            this.snackbar=true;
            this.text="编辑成功";
            this.color="info";
             this.$router.push("/orderStystem/product/subproduct");
          }else{
            //  this.snackbar=true;
            // this.text="编辑失败";
            // this.color="error";
          }
        });
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
.star {
  color: red;
  display: inline-block;
  padding: 20px;
  font-size: 20px;
}
.add0 {
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
.delSupply {
  right: 30% !important;
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
.theme--light.v-sheet {
  padding: 55px;
}
.layout {
  font-size: 18px !important;
  display: flex !important;
  align-items: center !important;
  margin-bottom: 20px !important;
}
.salaryClass {
  margin-bottom: 20px;
}
.theme--light.v-btn {
  margin-right: 60px !important;
}
.supplyLay {
  padding-left: 55px !important;
  color: rgb(88, 87, 87) !important;
}
.supplyLay .flex.xs6 {
  font-size: 16px !important;
}
/* 日期 */
.datePosition {
  position: relative;
  margin-left: 48px;
}
.v-menu__content {
  position: absolute !important;
  top: 298px !important;
  left: 538px !important;
}
</style>
