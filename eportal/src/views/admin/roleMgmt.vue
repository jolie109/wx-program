<template>
    <div>
        <!-- 顶部 -->
        <v-container fluid grid-list-xl>
            <v-layout wrap align-center>
                <v-flex xs4 sm2 md2 d-flex>
                    <v-select
               
                    label="请选择"
                    ></v-select>
                </v-flex>
                <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch"> <v-icon left>search</v-icon>搜索</v-btn>
                <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd"><v-icon left>add</v-icon>增加</v-btn>
        <!-- 点击增加出现的弹框 -->
                <v-dialog v-model="dialog" persistent max-width="600px">
                    <v-card v-show="addShow">
                        <v-card-title><span class="headline">{{formTitle}}</span></v-card-title>
                        <v-card-text>
                            <v-container grid-list-md>
                                <v-layout>
                                    <span class=baseTitle>角色</span>
                                    <v-flex xs12 sm6 md4>
                                        <v-text-field label="输入用户名称" v-model="editedItem.name"></v-text-field>
                                    </v-flex>
                                </v-layout>
                                      <v-layout wrap>
                                    <span class=baseTitle>可访问路由</span>
                                    <v-flex xs12 sm6 md4>
                                        <v-select
                                         item-text="name"
                                        :items="roleList"
                                        item-value="_id"
                                        v-model="editedItem.item"
                                        label="请选择"
                                        required
                                        multiple
                                        ></v-select>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
                            <v-btn color="blue darken-1" flat @click="save">确定</v-btn>
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
            </v-layout>
        </v-container>
        <!-- 表格 -->
        <div class="classifyBg">
            <v-flex xs12 class="classifyBgFlex">
                <p>角色管理</p>
                <p>角色</p>
            </v-flex>
            <v-data-table
                :headers="headers"
                :items="desserts"
                class="elevation-1"
            >
                <template v-slot:items="props">
                <td class="text-xs-left" >{{ props.item.name }}</td>
                <td class="text-xs-left">
                  <template v-for="roles in props.item.item">
                  {{roles.name}} &nbsp;&nbsp;
                  </template>
                </td>
                <td class="justify-center layout px-0">
                    
                    <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
                    <v-btn color="info" @click="handleDelete(props.item)">删除</v-btn>
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
export default {
    data() {
        return {
          roleList:[],
            dialog:false,
            editedIndex: -1,
            isAble:false,
            addShow:false,
            delShow:false,
            categoryId:'',
            color:'info',
            titleTip:'',
            secrchSelect:'',
            // 弹框信息
            top: true,
            right: true,
            snackbar: false,
            //编辑弹框绑定数据
            editedItem:{
            },
            defaultItem:{
                name:''
            },
            headers: [
            {text: '角色',sortable: false,value: 'name'},
             {text: '可访问路由',sortable: false,value: 'name'},
            {text: '操作',align: 'center', value: '操作' , sortable: false,},
            ],
            desserts: [],
            newArr:['全部'],
        }
    },
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? '增加角色权限' : '编辑内容'
      }
    },
    mounted(){
        this.getList();
        
    },
    methods:{
        // 获取数据
        getList(){
            this.$axios.get('/api/admin/roles').then((res) => {
                this.desserts=res.data.result;
            })
            
        },
        getRoles(){
            this.$axios.get('/api/admin/acls').then((res) => {
                this.roleList=res.data.result;
            })
            
        },
        handleAdd(){
            
            this.dialog=true;
            this.isAble=false;
            this.addShow=true;
            this.delShow=false;
            this.getRoles()
        },
        handleEdit(item){
            this.getRoles()
            this.dialog=true;
            this.isAble=true;
            this.addShow=true;
            this.delShow=false;
            this.roleList=item.item
            this.editedIndex = this.desserts.indexOf(item);
            //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
            this.editedItem = Object.assign({}, item);
        },
        handleDelete(item){
            this.dialog=true;
            this.addShow=false;
            this.delShow=true;
            this.categoryId=item._id
        },
        handleDelSave(){
            this.$axios.delete('/api/admin/roles',{
                data:{
                    _id:this.categoryId 
                }
            }).then((res) => {
            this.getList()
                this.close();
                //弹框提示
                this.titleTip='删除成功！'
                this.snackbar=true;
                this.color='info'
            })
            
        },
        //增、改,
        save(){
           
            // if编辑else增加
            if(this.editedIndex>-1){
                this.$axios.post('/api/admin/updateRole',{
                   roleList:this.editedItem,
                   name:this.editedItem.name
                }).then(res=>{
                    if(res.data.status==200){
                        this.titleTip=res.data.msg;
                        this.color='info';
                        this.snackbar=true;
                        this.right=true;
                      this.getList()
                    }else{
                        this.titleTip='编辑失败！'
                        this.color='error';
                    }
                })
            }else{

                this.$axios.post('/api/admin/roles',{
                   roleList:this.editedItem
                }).then((res) => {
                    if(res.data.status==0){
                        this.titleTip=res.data.msg;
                        this.color='error';
                        this.snackbar=true;
                        this.getList()
                    }else if(res.data.status==200){
                        this.desserts.push(this.editedItem);
                        this.titleTip=res.data.msg;
                        this.snackbar=true;
                        this.color='info';
                        this.getList()
                    }
                })
            }
            this.close();
        },
        close(){
            this.dialog = false;
            setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            }, 300)
        },
        handleSearch(){
            return
            // if(this.secrchSelect=='全部'){
            //     this.getCategoryAccount();
            // }else{
            //     this.$axios.get("/api/sort/searchCategoryAccount",{
            //     params:{
            //         category_type:this.secrchSelect
            //     }
            // }).then(res=>{
            //     this.desserts=res.data.result;
                
            // })
            // }
            
        }
    }
}
</script>
<style scoped>
   .classifyBg{
       padding: 40px 20px 30px;
       box-shadow: 0px 0px 6px 1px #ccc;
       position: relative;
   }
   .classifyBgFlex{
       background: #E0E1E2;
       border-radius: 10px;
       padding: 10px 20px;
       margin: -65px 0 35px;
   }
   .classifyBgFlex p{
       margin-bottom: 0px;
   }
   .classifyBgFlex p:nth-of-type(1){
       color:#333300 ;
       font-size: 20px;
       margin-bottom: 5px;
   }
   .classifyBgFlex p:nth-of-type(1){
       color:#333333 ;
       font-size: 15px;
   }
   .baseTitle{
       margin-right: 35px;
       margin-left: 65px;
       display: inline-block;
       text-align: right;
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
