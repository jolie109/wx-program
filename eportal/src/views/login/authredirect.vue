<template>
  <div>
    微信绑定
  </div>
</template>

<script>
import axios from 'axios'
  export default {
    name: 'authredirect',
    created() {
      // 锚点模式无法使用，须针对锚点改写
      // const hash = window.location.search.slice(1)
      // window.opener.location.href = window.location.origin + '/login' + hash
       const hash = window.location.hash.slice(14)
    //  window.opener.location.href ='http://localhost/#/personal' + hash
    if(location.href.indexOf("?")!=-1){
     var code=location.href.split("?")[1];
    code=code.split('=')[1];
    code=code.split("&")[0];
    }
    if(localStorage.getItem('code') && localStorage.getItem('code')==code){
      this.$router.replace('/')
    }else{
 localStorage.setItem('code',code);
   axios.get('api/getAccess',{
        params:{
          code:code
        }
      }).then(res=>{
        var data=res.data
        localStorage.setItem("wxaccess_token",data.access_token);
        localStorage.setItem('unionid',data.unionid)
        localStorage.setItem('openid',data.openid)
        alert('绑定微信成功')
        axios.get
        this.$router.replace('/?lock')
      })
    }
       window.close()
    }
  }
</script>
