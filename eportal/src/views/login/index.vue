
<template>
  <v-container fluid>
      <v-layout>
       <v-flex  mt-5  offset-xs xs4 mb-5>
        <div class="logo" style="margin-left:135%"></div>
      </v-flex>
      </v-layout>
      <v-layout>
        <v-flex offset-xs4 xs4 mt-1>
          <v-card min-width="370" min-height="460">
              <v-card-text >
                <h2 class="text-sm-center">ePortal系统登录</h2>
                <v-layout >
                  <v-flex sm8 offset-sm2 mt-3>
                    <v-text-field
                      label="账号"
                      placeholder="请输入手机号码"
                      v-model="phone"
                      class="placeholder"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex sm5 offset-sm2 mt-3>
                    <v-text-field label="验证码" placeholder="请输入验证码"  v-model="captcha" @blur="checkCaptcha"></v-text-field>
                  </v-flex>
                  <v-flex sm3 mt-1>
                     <img  src="api/captcha" alt="captcha" @click="getCaptcha" ref="captcha" />
                  </v-flex>
                </v-layout>
               <v-layout>
                  <v-flex sm5 offset-sm2 mt-3>
                    <v-text-field label="短信验证码" placeholder="请输入短信验证码"  v-model="code"></v-text-field>
                  </v-flex>
                  <v-flex sm3 mt-1>
                    <button class="btn_message" v-bind:class="{gray:wait_timer>0}" @click.prevent="getCode()">
                  <span class="span_message" v-show="showNum" v-bind:class="{gray_span:wait_timer>0}">{{ this.wait_timer + " "}}</span>
                  <span
                    class="span_message"
                    v-bind:class="{gray_span:wait_timer>0}"
                  >{{ getCodeText }}</span>
                </button>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex sm5 offset-sm4 mt-3>
                     <button class="btn_login waves" @click="login()">登录</button>
                  </v-flex>           
              </v-layout>
              <v-layout class="wx">
                <v-flex sm5 offset-sm4 mt-2>
                  <a
                    v-on:mouseover="hoverWx"
                    v-on:mouseout="outWx"
                    @click="wechatHandleClick('wechat')"
                  >
                    <img :src="wx ? wx1 : wx0" alt="wxIcon" class="img" />
                    微信登录
                  </a>
                </v-flex>
              </v-layout>
                      <v-layout>
                <v-flex>
                   <v-alert type="error" :value='isalert'>{{tiptitle}}</v-alert>
                </v-flex>
              </v-layout>
              </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
  </v-container>
</template>

<script>
import jwt_decode from 'jwt-decode' //解析token
import axios from "axios";
import openWindow from "../../utils/openWindow";
import {setAccessToken} from '@/utils/auth' 
export default {
  data() {
    return {
      wx: "",
      wx0: require("../../assets/images/wx0.png"),
      wx1: require("../../assets/images/wx1.png"),
      showNum: false,
      wait_timer: false,
       userInfo: {},
      isShow: false,
      loginWay: true, // true为短信登陆，false为密码登陆
      codeTime: 0, // 验证码倒计时
      showPwd: false, // 是否显示密码
      phone: "", // 手机号
      code: "", // 短信验证码
      name: "", // 用户名
      pwd: "", // 密码
      captcha: "", // 图形验证码
      tiptitle: "",
      isalert:false,
      timer_interval:null,
      codeError:true,
      mytimer:null

    };
  },
  mounted() {
      this.getCaptcha();
  },
  computed: {
     getCodeText() {
      if (this.wait_timer > 0) {
        return "秒后重新发送";
      }
      if (this.wait_timer === 0) {
        this.showNum = false;
        return "重新获取验证码";
      }
      if (this.wait_timer === false) {
        return "获取验证码";
      }
    },
  },
  methods: {
    hoverWx: function(event) {
      this.wx = !this.wx;
    },
    outWx: function(event) {
      this.wx = !this.wx;
    },
    checkCaptcha() {
       var params = {
        captcha: this.captcha 
      };
      axios.post("/api/login_captcha", params).then(result => {
        if( result.data.msg=='验证码错误'){
          this.isalert=true
          this.tiptitle = "图形验证码错误";
           this.mytimer= setTimeout(()=>{
           this.isalert=false
          },5000)
        }else{
          this.isalert=false;
          this.tiptitle=''
          this.codeError=false
        }
           
      });
    },
    getCaptcha() {
      // 每次指定的src不同
      this.$refs.captcha.src = "api/captcha?time=" + Date.now();
    },

     getCode() {
       if (this.wait_timer > 0) {
        return false;
      }else if(this.codeError){
         this.mytimer=null
          this.isalert=true
          this.tiptitle ="图形验证码错误";
          this.mytimer= setTimeout(()=>{
           this.isalert=false
          },5000)
          return
      }
        // 发送ajax请求(向指定手机号发送验证码)
        axios
          .get("api/getCode", {
            params: {
              phone: this.phone
            }
          })
          .then(result => {
            const data = result.data;
            if (data.status=="400") {
              this.tiptitle=''
              this.isalert = true;
              this.tiptitle = "对不起，您不是当前用户";
              this.mytimer=null
              this.mytimer= setTimeout(()=>{
                  this.isalert=false
                 },5000)
            } else if (data.status=="200") {
                this.showNum = true;
                this.isalert=false;
                this.wait_timer = 60;
                var that = this;
                 this.timer_interval = setInterval(function() {
                  if (that.wait_timer > 0) {
                    that.wait_timer--;
                  } else {
                    clearInterval(this.timer_interval);
                  }
                }, 1000);
            }
          });
    },
    wechatHandleClick(thirdpart){
       let params={
      redirect_uri:'http://localhost/#/conctWchat'
    }
      axios.get('/api/getQrCode',{params}).then(res=>{
        var url = res.data.url;
        location.href=url;
      })
    },
   login() {
      if (this.phone == "" || this.code == "" || this.captcha == "") {
        this.tiptitle = "所有内容不能为空";
        this.isalert=true
        this.mytimer=null
        this.mytimer= setTimeout(()=>{
                  this.isalert=false
                 },5000)
      } else {
        var userInfo = {
          tel: this.phone
        };
        var params = {
          phone: this.phone,
          code: this.code,
          captcha: this.captcha
        };
        axios.post("api/login_code", params).then(res => {
          if (res.data.code == 0) {          
             const decode = jwt_decode(res.data.token);
             localStorage.setItem("tel",decode.phone)
            setAccessToken(res.data.token)
               //解析token
            //输入验证码成功跳转到首页；
            this.$router.replace('/?id=1')
          } else if (res.data.code == 1) {
            this.tiptitle = "短信验证码错误,请稍后重试";
            this.isalert=true
            this.mytimer=null
              this.mytimer= setTimeout(()=>{
                  this.isalert=false
                 },5000)
          }
        });
      }
   }
  }
};
</script>
<style scoped>
.container {
  background-color: #5896fa;
}
.logo {
  width: 150px;
  height: 40px;
  /* background: url(../../assets/images/belstar_logo.png) no-repeat center; */
  background-size: contain;
}
.card {
  margin-top: 30px;
  width: 400px;
}
.login {
  padding: 40px 24px;
}
h2 {
  text-align: center;
}
.input {
  padding: 40px 0 10px 0;
}
.placeholder {
  font-size: 14px;
}
.input_code {
  position: relative;
}
.code {
  background-color: rgba(245, 245, 245, 1);
  text-align: center;
  line-height: 40px;
  color: #999;
  font-family: Normal;
  font-size: 20px;
  width: 140px;
  height: 40px;
  z-index: 2;
  position: absolute;
  top: 185px;
  right: 25px;
}
.input_message {
  position: relative;
}
.btn_message {
  width: 140px;
  height: 55px;
  background-color: #e6eefe;
  border-radius: 4px;
  color: #5896fa;
  outline: none;
}
.btn_message:hover {
  background-color: #ccdffd;
}
.btn_message.gray {
  background: rgba(232, 232, 232, 1);
  border-radius: 4px;
}
.span_message.gray_span {
  color: #666666;
}
/* 
.v-btn:before {
  background-color: #5896fa; 
  background: rgba(88, 150, 250, 1);
  opacity: 1;
}
.card /deep/ .v-btn:hover {
  background-color: #79abfb; 
  background-color: #5896fa; 
  opacity: 0.8;
  z-index: 2;
}
.card /deep/ .v-btn__content {
  color: #ffffff;
} */
.btn_login {
  outline: none;
  background-color: #5896fa;
  color: #ffffff;
  letter-spacing:4px;
  font-size:16px;
  font-family: Medium;
  font-weight: 500;
  border-radius:4px;
  width:60%;
  height: 40px;
  box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.5);
}
.btn_login:hover {
  opacity: 0.8;
}
.waves {
    position: relative;
    overflow: hidden;
}
.waves:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #E4EEFE 10%, transparent 10%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: .3s, opacity .5s;
}
.waves:active:after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
}
.wx {
  margin-top: 20px;
  margin-left:20px;
}
.img {
  width: 15px;
  vertical-align: middle;
}
a {
  color: #666;
}
a:hover {
  color: #87dc4a;
}
</style>