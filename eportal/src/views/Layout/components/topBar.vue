<template>
  <v-layout class="top_bar">
    <v-flex md9>Eportal · {{title}}</v-flex>
        <v-tabs centered id="tabs"  >
            <v-tabs-slider color="white"></v-tabs-slider>
          <v-flex md1>
            <span class="divided_line"></span>
          </v-flex>
          <v-tab href="#tab-4" id="tabs4" @click="showUserLogin" :style="{background:hasclickAvatar==true?'#deeafb':''}">
            <v-flex md2 offset-md8 class="topbar-avatar center">
              <div>
                <v-avatar color="grey lighten-4" :tile="false" size="26px">
                  <img
                    v-if="hasimg"
                    :src="headimgurl"
                    alt="avatar"
                  />
                  <span v-else>VJ</span>
                </v-avatar>
                <v-icon
                  x-small
                  :style="{transform:hasclickAvatar?'rotate(180deg)':'rotate(0deg)'}"
                  style="transition:all 0.5s;"
                  class="menu_down"
                >mdi-menu-down</v-icon>
              </div>
            </v-flex>
          </v-tab>
          <v-tab-item value="tab-1">
            <transition name="fade">
              <v-text-field
                v-if="hasSearch"
                v-model="searchText"
                label="Search"
                required
                class="search_side"
                clearable
              ></v-text-field>
            </transition>
          </v-tab-item>
          <v-tab-item value="tab-4">
            <transition name="fade">
              <v-card class="mx-auto" max-width="300" tile v-if="hasclickAvatar">
                <v-list>
                  <v-list-tile @click="mycenter">
                    <v-list-tile-content>
                      <v-list-tile-title>绑定微信</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile @click="loginOut" >
                    <v-list-tile-content>
                      <v-list-tile-title >注销</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
            </transition>
          </v-tab-item>
        </v-tabs>
  </v-layout>
  
</template>
<script>
import axios from 'axios'
import {removeAccessToken} from '@/utils/auth' 

export default {
  data() {
    return {
      tile: true,
      hasimg: true,
      searchText: "",
      hasSearch: false,
      hasclickAvatar: false,
      overlap: true,
      text: "1",
      aboutme:false,
      loginout:false,
      active:false,
      isShow:true,
      headimgurl:require('../../../assets/images/user.jpg')
    };
  },
  methods: {
    showSearch() {
      this.hasclickAvatar=false
      this.hasSearch = !this.hasSearch;
    },
    showUserLogin() {
      this.hasSearch=false
      this.hasclickAvatar = !this.hasclickAvatar;
    },
    mycenter(){
        let params={
      redirect_uri:'http://localhost/#/authredirect'
    }
    axios.get('api/getQrCode',{params}).then(res=>{
        var url = res.data.url;
        location.href=url;
      })
        this.hasclickAvatar=false
    },
      getUser(){
        if(this.$route.fullPath.indexOf("id") != -1){
           var id= this.$route.fullPath.split("?")[1].split('=')[0];
        }
        if(this.$route.fullPath.indexOf("auth") != -1){
          var auth= this.$route.fullPath.split("?")[1].split('=')[0];
        }
        if(this.$route.fullPath.indexOf("lock") != -1){
          var lock= this.$route.fullPath.split("?")[1].split('=')[0];
        }
        if(id=='id'&&localStorage.getItem('tel')){
          if(localStorage.getItem('headimgurl')){
          this.headimgurl=localStorage.getItem('headimgurl')
          }
          axios.get('api/userInfo',{params:{
        phone:localStorage.getItem('tel')
        }
        }).then(res=>{
        if(res.data.result.openid){
          this.isShow=false
          this.$store.dispatch('getUserInfo',res.data.result)
          localStorage.setItem("userInfo",res.data.result)
           this.userInfo=res.data.result;
        }
        })
        }else if(auth=='auth'){
          // this.userInfo=localStorage.getItem('userInfo')
          var openid=localStorage.getItem('openid');
          var headimgurl=localStorage.getItem('headimgurl');
          this.headimgurl=localStorage.getItem('headimgurl')
        var  userInfo={
            openid,
            headimgurl
          }
          this.userInfo=userInfo
          this.isShow=false

        }else if(lock=='lock'){
        var access_token= localStorage.getItem('wxaccess_token')
       var openid=localStorage.getItem('openid')
       var tel=localStorage.getItem('tel')
           this.headimgurl=localStorage.getItem('headimgurl')
      var  params={
            access_token :access_token ,
            openid :openid,
            tel:tel
          }
        axios.get('api/getUserInfo',{
          params
        }).then(res=>{
          this.userInfo=res.data.result;
           this.isShow=false;
        })
        }
      
      },
    loginOut(){
         removeAccessToken()
          localStorage.clear();
         location.reload();

    }
    
  },
  computed: {
    title() {
      return this.$route.name;
    }
  },
  mounted(){
    this.getUser()
  }
};
</script>
<style scoped>
.topbar-notice .v-badge__badge {
  width: 10px !important;
  height: 10px !important;
  display: inline-block;
}
.topbar-notice .v-badge--overlap .v-badge__badge {
  top: 4px;
  right: -5px;
}
.v-tabs__item{
width:60px!important;
}
</style>

<style  scoped>
.currclick-active{
background:red;
}
.center {
  display: flex;
  width: 60px;
  height: 40px;
  justify-content: center;
  border-radius: 5px;
}
.top_bar {
  background-color: #fff;
  height: 60px;
  padding: 10px;
  line-height: 35px;
  justify-content: space-between;
}
.topbar-notice {
  padding-top: 5px;
}
.divided_line {
  display: inline-block;
  width: 2px;
  height: 25px;
  background: #f4f4f4;
  margin: 9px 5px 0 10px;
}
.topbar-avatar {
  position: relative;
  align-items: center;
  display: flex;
}
.menu_down {
  position: absolute;
  bottom: 0px;
  left: 15px;
}
.mx-auto {
  position: absolute;
  left: 0px;
  top: 13px;
  z-index: 888;
}
#tabs {
  position: relative;
}
.search_side {
  position: absolute;
  top: -51px;
  left: -241px;
}
 .fade-enter, .fade-leave-to {
  transition: translateX(-100px);
  opacity: 0;
  transition:0.5s ease-in-out;
}
 .fade-enter-active,
.fade-leave-active {
  transition: 0.5s ease-in-out;
}
</style>