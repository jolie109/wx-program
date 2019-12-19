<template>
    <div>
       <p>all users can see</p> 
       <p>当前用户：{{myinfo.name}}</p>
       <p>手机号码：{{myinfo.tel}}</p>
    </div>
</template>

<script>
import axios from "axios";
    export default {
        data() {
            return {
                myinfo:''
            }
        },
        mounted () {
            this.getUserInfo();
        },
        methods:{
            getUserInfo(){
                axios.get('/api/myinfo')
                .then(res=>{
                    if(res.data.status==200){
                        this.myinfo=res.data.result
                    }
                })
            }
        }
    }

</script>

<style  scoped>

</style>