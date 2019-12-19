<template>
    <div>
        <!-- 顶部 -->
        <v-container fluid grid-list-xl>
            <v-layout wrap align-center>
                <v-flex xs4 sm2 md2 d-flex>
                    <v-autocomplete
                    :items="categorysItem" 
                    item-text="name"
                    item-value="_id"
                    v-model="searchCategoryID"
                    label="请选择分类"
                    ></v-autocomplete>
                </v-flex>
                <v-flex xs4 sm2 md2 d-flex v-if="isAllCategory">
                    <v-autocomplete
                    :items="allGrade"
                    item-text="name"
                    item-value="_id"
                    v-model="searchGradeId"
                    label="请选择等级"
                    ></v-autocomplete>
                </v-flex>
                <v-flex xs4 sm2 md2 d-flex v-else>
                    <v-autocomplete
                    :items="allGrade"
                    item-text="name"
                    item-value="name"
                    v-model="searchGradeId"
                    label="请选择等级"
                    ></v-autocomplete>
                </v-flex>
                <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch"> <v-icon left>search</v-icon>搜索</v-btn>
                <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd"><v-icon left>add</v-icon>增加</v-btn>
        <!-- 点击增加出现的弹框 -->
                <!-- <v-form
                    ref="form"
                    v-model="valid"
                    lazy-validation
                > -->
                <v-dialog v-model="dialog" persistent max-width="600px">
                    <v-card v-show="addShow">
                        <v-card-title><span class="headline">{{formTitle}}</span></v-card-title>
                        <v-card-text>
                            <v-container grid-list-md>
                                <v-layout wrap v-if="addDisplay">
                                    <span class=baseTitle>类别名称</span>
                                    <v-flex xs12 sm6 md6>
                                        <v-select
                                        :items="addcategorysItem"
                                        item-text="name"
                                        item-value="_id"
                                        v-model="addCategoryID"
                                        label="请选择分类"
                                        required
                                          :error-messages="categoryErrors" 
                                      @blur="$v.addCategoryID.$touch()"
                                        ></v-select>
                                    </v-flex>
                                </v-layout>
                                <v-layout wrap v-if="addDisplay">
                                    <span class=baseTitle>类别等级</span>
                                    <v-flex xs12 sm6 md6>
                                        <v-select
                                        :items="addAllGrade"
                                        item-text="name"
                                        item-value="_id"
                                        v-model="editedGradeId"
                                        label="请选择等级"
                                        required
                                          :error-messages="gradeErrors" 
                                      @blur="$v.editedGradeId.$touch()"
                                        ></v-select>
                                    </v-flex>
                                </v-layout>
                                <v-layout>
                                    <span class=baseTitle>金　　额</span>
                                    <v-flex xs12 sm6 md4>
                                        <v-text-field   
                                            v-model="editedItem.amount"
                                            :rules="rules"
                                            required
                                             :error-messages="amountErrors" 
                                            @blur="$v.editedItem.amount.$touch()"
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
                            <v-btn  color="blue darken-1" flat @click="save" :disabled="!valid">确定</v-btn>
                        </v-card-actions>
                    </v-card>
                    <v-card v-show="delShow">
                        <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
                            <v-btn color="blue darken-1" flat @click="handleDelSave">确定</v-btn>
                        </v-card-actions>
                        <span class="delSpan" @click="close">X</span>
                    </v-card>
                </v-dialog>
                <!-- </v-form> -->
            </v-layout>
        </v-container>
        <!-- 表格 -->
        <div class="classifyBg">
            <v-flex xs12 class="classifyBgFlex">
                <p>每月加给</p>
                <p>每月加给列表</p>
            </v-flex>
            <v-data-table
                :headers="headers"
                :items="desserts"
                class="elevation-1"
            >
                <template v-slot:items="props">
                <td class="text-xs-left" >{{ props.item.categorysItem.name }}</td>
                <td class="text-xs-left" >{{ props.item.gradeItem.name }}</td>
                <td class="text-xs-left" >{{ props.item.amount }}</td>
                <td class="justify-center layout px-0">
                    <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
                    <v-btn color="info" @click="handleDelete(props.item,props.item._key)">删除</v-btn>
                </td>
                </template>
            </v-data-table>
        </div>
        <!-- 弹框 -->
      <v-snackbar
        :color="color"
        :top="top"
        :right="right"
        v-model="snackbar"
      >
      <v-icon
        color="white"
        class="mr-3"
        size="20"
      >
        add_alert
      </v-icon>
      <div>{{titleTip}}</div>
      <v-icon
        color="white"
        size="16"
        @click="snackbar = false"
      >
        clear
      </v-icon>
    </v-snackbar>
       
    </div>
</template>
<script>
import { required, numeric } from "vuelidate/lib/validators";
export default {
    name:'supply',
     validations: {
   
      addCategoryID: { required, numeric },
      editedGradeId: { required , numeric },
      editedItem:{
        amount:{required,numeric}
      }
  },
    data() {
        return {
            dialog:false,
            editedIndex: -1,
            isAble:false,
            addShow:false,
            delShow:false,
            addDisplay:true,
            searchCategoryID:'',
            addCategoryID:'',
            editedGradeId:'',
            titleTip:'',
            // 弹框信息
            top: true,
            right: false,
            snackbar: false,
            color:'',
            //编辑弹框绑定数据
            editedItem:{
                categorysItem_name:'',
                grade_name:'',
                amount:'',
                category_id:'',
                grade_id:''
            },
            defaultItem:{
                categorysItem_name:'',
                grade_name:''
            },
            itemsClassify: ['学历', '新进员工工作经验', '新进员工特殊人才补贴', '新进员工其他加项', '在职员工管理加给', '新进员工其他补贴'],
            headers: [
                {text: '类别名称',sortable: false,value: 'name'},
                {text: '等级',sortable: false,value: 'name'},
                {text: '金额',sortable: false,value: 'name'},
                {text: '操作',align: 'center', value: '操作' , sortable: false,},
            ],
            desserts: [],
            // categorysItem_name:'',
            // grade_name:'',
            searchCategoryID:[],  //绑定了category 的 ID
            searchGradeId:[],
            categorysItem:['全部'],
            addcategorysItem:[],
            gradesItem:{
                name:'全部'
            },
            allGradeName:[],
            deleteItem:{
                _id:""
            },
            allGrade:[], //所有等级
            // dessertsAdd:[]
            isAllCategory:true,
            addAllGrade:[],
            rules: [
                value => !!value ,//首字母不能为空
                value => {
                const pattern = /^[0-9]*$/;
                return pattern.test(value) || '请输入正确的薪资.'
                },
            ],
            valid: true,
        }
    },
    computed: {
        //增加、编辑弹框标题
      formTitle () {
        return this.editedIndex === -1 ? '增加薪资' : '编辑内容'
      },
    //v-select中v-model中绑定的值
    //   handleRank(){
    //       return this.editedItem.rank
    //   },
      handleGrade(){
          return this.editedItem.grade
      },
      categoryErrors() {
      const errors = [];
      if (!this.$v.addCategoryID.$dirty) return errors;
      !this.$v.addCategoryID.required &&
        errors.push("不能为空。");
      !this.$v.addCategoryID.numeric ;
      return errors;
    },
    gradeErrors() {
      const errors = [];
      if (!this.$v.editedGradeId.$dirty) return errors;
      !this.$v.editedGradeId.required &&
        errors.push("不能为空。");
      !this.$v.editedGradeId.numeric ;
      return errors;
    },
    amountErrors() {
      const errors = [];
      if (!this.$v.editedItem.amount.$dirty) return errors;
      !this.$v.editedItem.amount.required &&
        errors.push("不能为空。");
      !this.$v.editedItem.amount.numeric ;
      return errors;
    },
    },
    methods:{
        handleAdd(){
            this.dialog=true;
            this.isAble=false;
            this.addShow=true;
            this.delShow=false;
            this.addDisplay=true;
        },
        handleSearch(){
        if (this.searchCategoryID && this.searchGradeId) {
            if (this.searchCategoryID == '全部' && this.searchGradeId=='全部') {
                this.allGrade.length=0;
                this.getAllSalary();
            }else if(this.searchCategoryID == '全部' && !(this.searchGradeId=='全部')){
                this.$axios.get('/api/salaryManagement/getCategoryByGrade',{
                    params:{
                        grade_id:this.searchGradeId,
                        // name:"",
                        category_type : "每月加给"
                    }
                }).then(res=>{

                    this.desserts = res.data.result
                    })
                }else if(!(this.searchCategoryID == '全部') && this.searchGradeId=='全部'){
                    // console.log("第二个是全部");
                    
                    this.$axios.get('/api/salaryManagement/getGradeByCategory',{
                        params:{
                            category_id:this.searchCategoryID,
                            // name:"",
                            category_type : "每月加给"
                        }
                    }).then(res=>{
                        // console.log(res.data.result);
                        this.desserts = res.data.result
                        })
                    }
            else{
            this.$axios
                .get("/api/salaryManagement/perMonthSalary_list", {
                    params: {
                        category_type : "每月加给",
                        category_id: this.searchCategoryID, 
                        grade_id: this.searchGradeId
                    }
                })
                .then(res => {
                if ((res.data.status = "200")) {
                    
                    this.desserts = res.data.result
                    // console.log(res.data.result);

                    // this.titleTip = "搜索成功！";
                    // this.snackbar=true;
                    // this.right=true;
                    // this.color='info';
                }
                });
            }
        } else {
            // this.snackbar = true;
            // this.titleTip = "搜索失败！";
            // this.color = "error";
            // this.right = true;
            }
        },
        handleEdit(item){
            this.dialog=true;
            this.isAble=true;
            this.addShow=true;
            this.delShow=false;
            this.addDisplay=false;
            this.editedIndex = this.desserts.indexOf(item);
            //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
            this.editedItem = Object.assign({}, item);
            this.editedItem = {
                category_id  : item.categorysItem._id,
                grade_id : item.gradeItem._id,
                amount : item.amount
            }
        },
        handleDelete(value){
            
            // console.log(value._id);
            this.deleteItem._id=value._id;
            this.dialog=true;
            this.addShow=false;
            this.delShow=true;
        },
        handleDelSave(value){
            let index=this.desserts.indexOf(value);
            this.desserts.splice(index,1);
            this.close();

            // console.log(this.deleteItem._id);
            this.$axios.delete("/api/salaryManagement/deleteSalary", {
                data: {
                    _id: this.deleteItem._id
                }
                })
                .then(res => {
                if (res.data.status !== "200") {
                    this.snackbar = true;
                    this.titleTip = "删除失败！";
                    this.color = "error"
                    this.right=true;
                } else {
                    this.getAllSalary();
                    this.snackbar = true;
                    this.titleTip = "删除成功！";
                    this.color = "info"
                    this.right=true;
                }
            });
        },
        //增、改
        save(item){
             this.$v.$touch();
            if(this.editedIndex>-1){
                Object.assign(this.desserts[this.editedIndex], this.editedItem);

                // console.log(this.editedItem.category_id,this.editedItem.grade_id,this.editedItem.amount);
                this.$axios.post('/api/salaryManagement/editPerMonthSalary',{                   
                    category_id:this.editedItem.category_id,
                    grade_id:this.editedItem.grade_id,
                    amount:this.editedItem.amount                   
                }).then(res=>{
                    // console.log(res.data.result);  
                        if(res.data.status=="200"){
                            //弹框提示
                            this.close()
                            this.titleTip='编辑成功！'
                            this.snackbar=true;
                            this.right=true;
                            this.color = "info";
                            this.getAllSalary(); 
                        }                    
                })
            }else{
                     if(this.editedItem.amount==''||this.addCategoryID==""||this.editedGradeId==""){
        return false
      }else{
                this.$axios.post('/api/salaryManagement/addPerMonthSalary',{
                    category_id:this.addCategoryID,
                    grade_id:this.editedGradeId,
                    amount:this.editedItem.amount,
                    category_type:"每月加给"
                }).then(res=>{
                    if(res.data.status == '400'){
                        //弹框提示
                        this.titleTip='增加失败！'
                        this.snackbar=true;
                        this.color="error";
                        this.right=true;  
                        // this.desserts = res.data.result;   
                        this.getAllSalary(); 
                        this.addCategoryID = null;
                        this.editedGradeId = null;
                        this.editedItem.amount=null;
                    }else if(res.data.status == "200"){
                        //弹框提示
                        this.titleTip='增加成功！'
                        this.snackbar=true;
                        this.right=true;  
                        this.color="info";
                        this.addCategoryID = null;
                        this.editedGradeId = null;
                        this.editedItem.amount=null;
                        // this.desserts = res.data.result;   
                        this.getAllSalary();
                         this.close();
                    }                     
                })
            }
           

      }
          
        },
        close(){
            this.dialog = false;
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            }, 300)
        },
        //渲染前端页面
        getAllSalary(){
            this.$axios.get('/api/salaryManagement/PermonthSalary',{
                params:{
                    category_type:"每月加给"
                }
            }).then(res=>{
                // this.allGrade.length=0;
                if(res.data.status=="200"){
                //  this.addAllGrade.length = 0;
                this.desserts = res.data.result;
                
                //第二个select去重
                const gradeArr=[];
                for (const iterator of res.data.result) {                 
                    if(gradeArr.indexOf(iterator.gradeItem.name)===-1){
                        gradeArr.push(iterator.gradeItem.name)
                        this.allGrade.push(iterator.gradeItem)
                        this.addAllGrade.push(iterator.gradeItem)
                    }              
                }      
                this.allGrade.unshift(this.gradesItem)

                }
                
            })

            // 第二个select渲染
            
            // this.$axios.get('/api/salaryManagement/getGradeAccount',{
            //     params:{
            //         category_type:"每月加给"
            //     }
            // }).then(res => {
            //     if(res.data.status == "200"){
            //         console.log(res.data.result);
            //         const gradeArr=[];
            //         for (const iterator of res.data.result) {
            //             if(gradeArr.indexOf(iterator.gradeItem.name) === -1){     
            //                 this.allGrade.push(iterator.gradeItem)
            //             }
            //         } 

            //     this.allGrade.unshift(this.gradesItem)
            //     }
            // })
            //增加时每个select的值
            this.$axios.get('/api/salaryManagement/getSalaryAccount',{
                params:{
                    category_type:"每月加给"
                }
            }).then(res => {
                if(res.data.status == "200"){
                    // console.log(res.data.result);
                    for (const iterator of res.data.result) {
                        this.addcategorysItem.push(iterator)
                        this.categorysItem.push(iterator)
                    } 
                }
            })
        },
        // 监听时绑定的id
        // 增加全部
        watchCategoryAdd(newVal){
            this.$axios
            .get("/api/salaryManagement/ListengetCategoryByGrade", {
                params: {
                    category_id: newVal //分类的id
                }
            })
            .then(res => {
                 this.allGrade.length=0;
                for (const iterator of res.data.result) {  
                    this.allGrade.push(iterator)                   
                }      
                this.allGrade.unshift(this.gradesItem)
            });
        },
        //设置增加弹框里面的联动效果，去掉全部
        watchCategoryAdd2(newVal){
            this.$axios
            .get("/api/salaryManagement/ListengetCategoryByGrade", {
                params: {
                    category_id: newVal //分类的id
                }
            })
            .then(res => {
                this.addAllGrade=res.data.result;
            });
        },
        // validate () {
        // if (this.$refs.form.validate()) {
        //   this.snackbar = true
        // }
    //   },
      //清空重置
      resetValidation () {
        // this.$refs.form.resetValidation()
      },
    //   save () {
        // if (this.$refs.form.save()) {
        //   this.snackbar = true
        // }
    //   },
    },
    mounted(){
        this.getAllSalary();
    },
    watch:{
        // 搜索时监听v-model绑定的值传给后端
        searchCategoryID: function(newVal, oldVal) {
            if (newVal == "全部") {
                // this.getAllSalary();
                this.isAllCategory = false;
            } else {
                this.watchCategoryAdd(newVal);
                this.isAllCategory = true;
            }
        },
        //监听弹框中分类的ID
        addCategoryID:function(newVal,oldVal){
            // console.log(newVal);
            if (newVal == "全部") {
                this.getAllSalary();
            } else {
                this.watchCategoryAdd2(newVal);
            }
        },
        searchGradeId:function(newVal,oldVal){
        },
        //监听等级ID
        editedGradeId:function(newVal,oldVal){
            // console.log(newVal,oldVal);
        },
        editedCategoryId:function(newVal, oldVal){
            // console.log(newVal,oldVal);
            if (newVal == "全部") {
                this.getAllSalary();
            } else {
                this.watchCategoryAdd(newVal);
            }
        }
    },
}
</script>
<style scoped>
   @import "../../../assets/css/classify.css";
   .baseTitle{
       margin-right: 35px;
       margin-left: 65px;
       display: inline-block;
       font-size:18px;
   }
   .layout{
       align-items: center!important;
   }
   .delcontainer{
       padding: 30px;
       font-size: 20px;
       position: relative;
   }
   .delSpan{
       position: absolute;
       top:15px;
       right:25px;
       cursor: pointer;
   }
</style>
