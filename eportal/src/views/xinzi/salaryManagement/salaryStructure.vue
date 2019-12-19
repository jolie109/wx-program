<template>
    <div>
        <!-- 表格 -->
        <div class="classifyBg">
            <v-flex xs12 class="classifyBgFlex">
                <p>员工薪资结构</p>
                <p>员工薪资结构</p>
            </v-flex>
            <h3>基本薪资</h3>
            <v-data-table
                :headers="headers"
                :items="desserts"
                >
                <template v-slot:items="props">
                    <tr>
                        <td>{{ props.item.name }}</td>
                        <td class="text-xs-right">
                            <v-switch v-model="props.item.is_use" @change="send(props.item)"></v-switch>
                        </td>
                    </tr>
                </template>
                <template v-slot:expand="props">
                    <v-card flat>
                    <v-card-text>Peek-a-boo!</v-card-text>
                    </v-card>
                </template>
            </v-data-table>

            <!-- 每月加给 -->
            <h3>每月加给</h3>
            <v-data-table
                :headers="headers"
                :items="dessertsSupply"
                hide-actions
                >
                <template v-slot:items="props">
                    <tr>
                        <td>{{ props.item.name }}</td>
                        <td class="text-xs-right">
                            <v-switch v-model="props.item.is_use" @change="send(props.item)"></v-switch>
                        </td>
                    </tr>
                </template>
                <template v-slot:expand="props">
                    <v-card flat>
                    <v-card-text>Peek-a-boo!</v-card-text>
                    </v-card>
                </template>
            </v-data-table>
        </div>     
    </div>
</template>
<script>
export default {
   
    data() {
        return {
            headers: [
            {
                text: '薪资组成',align: 'left',sortable: false,value: 'name'
            },
            { text: '是否使用', value: 'isUse',sortable: false, },
            ],
            desserts: [],
            dessertsSupply:[]
        }
    },
    methods:{
        send(value){
            // console.log(value._id,value.is_use);
            this.$axios.post('/api/salaryManagement/salary_Structure',{
                    category_id : value._id,
                    is_use : value.is_use
            }).then(res=>{
                if(res.data.status == '200'){
                    // this.desserts = res.data.result
                }              
            })
        },
        //渲染前端页面
        getSalaryStruct(){
            // console.log("123");
            this.$axios.get('/api/classify/searchCategoryAccount',{
                params:{
                    category_type : "基本薪资"
                }
            }).then(res=>{
                // if(res.data.status == '200'){
                    // console.log(res.data.result);
                    this.desserts = res.data.result
                // }              
            })
            this.$axios.get('/api/classify/searchCategoryAccount',{
                params:{
                    category_type : "每月加给"
                }
            }).then(res=>{
                // if(res.data.status == '200'){
                    this.dessertsSupply = res.data.result
                // }              
            })
        }
    },
    mounted(){
        this.getSalaryStruct();
    },
    
    
}
</script>
<style scoped>
   @import "../../../assets/css/classify.css";
   .classifyBg{
       background: #fff;
       margin-top: 35px;
   }
   .classifyBg /deep/ .theme--light.v-table thead th{
       color: rgb(32, 32, 32)!important;
       font-size: 14px!important;
   }
   .classifyBg /deep/ .v-input--selection-controls:not(.v-input--hide-details) .v-input__slot{
       margin-top: 12px!important;
       margin-bottom: 0px!important;
   }
   .classifyBg /deep/ .accent--text{
       color: rgb(37, 72, 226)!important;
   }
</style>
