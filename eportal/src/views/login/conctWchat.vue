<template>
  <div>
    微信登录
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
            const APPID='wx3761a5c916a37844',
             SECRET='331af64db81e91104147434bc80157f5'
            var href=location.href;
             var arg= href.split('?')[1];
             var code=arg.split('&')[0].split("=")[1];
             this.code=code
             var url=`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APPID}&secret=${SECRET}&code=${code}&grant_type=authorization_code`
             var params={
                 url:url,
             }
            axios.post('api/isAuth',params).then(res=>{
              var userInfo=res.data.result
                //  this.$store.dispatch('getUserInfo',res.data.result)
                 if(res.data.status=="200"){
                   localStorage.setItem("headimgurl",res.data.result.headimgurl);
                    localStorage.setItem('openid',res.data.result.openid)
                    localStorage.setItem('tel',res.data.result.tel)
                    localStorage.setItem('access_token',res.data.data)
                    this.$router.replace('/?auth=1')
                    alert("欢迎登录！")
                 }else if(res.data.status=="201"){
                   alert("你还未绑定微信，请使用验证码登录或联系管理员")
                     this.$router.replace('/login')
                 }
                
                
             })
       window.close()
    }
  }
</script>
