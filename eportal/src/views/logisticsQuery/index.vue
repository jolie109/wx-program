
<template>
  <v-container fluid grid-list-xl>
    <v-layout fill-height align-center justify-center>
      <v-flex md2>
        <div class="box">
          <div class="img img_sf" @click="btn_sf"></div>
          <v-btn
            round
            large
            @click="btn_sf"
          >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;顺丰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</v-btn>
        </div>
      </v-flex>
      <v-flex md2>
        <div class="box">
          <div class="img img_jd" @click="btn_jd"></div>
          <v-btn
            round
            large
            @click="btn_jd"
          >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;京东&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</v-btn>
        </div>
      </v-flex>
      <v-flex md2>
        <div class="box">
          <div class="img img_ems" @click="btn_ems"></div>
          <v-btn
            round
            large
            @click="btn_ems"
          >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EMS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</v-btn>
        </div>
      </v-flex>
      <v-flex md2>
        <div class="box">
          <div class="img img_zto" @click="btn_zto"></div>
          <v-btn
            round
            large
            @click="btn_zto"
          >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;中通&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex class="more">请期待更多合作快递 ……</v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      url1: "",
      url2: "",
      callParams:''
    };
  },
  methods: {
    btn_sf() {
      // localStorage.clear();
      this.url1 = require("../../assets/images/sf.jpeg");
      this.url2 = require("../../assets/images/sf1.jpeg");
      this.objectParams = "sf";
      this.callParams="顺丰客服热线：95338";
      this.$router.push({
        path: "/logisticsQuery/express"
      });
      localStorage.setItem("url1", JSON.stringify(this.url1));
      localStorage.setItem("url2", JSON.stringify(this.url2));
      localStorage.setItem("objectParams", JSON.stringify(this.objectParams));
      localStorage.setItem("callParams", JSON.stringify(this.callParams));
    },
    btn_jd() {
      // localStorage.clear();
      this.url1 = require("../../assets/images/jd.jpeg");
      this.url2 = require("../../assets/images/jd1.jpeg");
      this.objectParams = "jd";
      this.callParams="京东客服热线：950616";
      this.$router.push({ path: "/logisticsQuery/express" });
      localStorage.setItem("url1", JSON.stringify(this.url1));
      localStorage.setItem("url2", JSON.stringify(this.url2));
      localStorage.setItem("objectParams", JSON.stringify(this.objectParams));
      localStorage.setItem("callParams", JSON.stringify(this.callParams));
    },
    btn_ems() {
      // localStorage.clear();
      this.url1 = require("../../assets/images/ems.jpeg");
      this.url2 = require("../../assets/images/ems1.jpeg");
      this.objectParams = "ems";
      this.callParams="EMS客服热线：11183";
      this.$router.push({ path: "/logisticsQuery/express" });
      localStorage.setItem("url1", JSON.stringify(this.url1));
      localStorage.setItem("url2", JSON.stringify(this.url2));
      localStorage.setItem("objectParams", JSON.stringify(this.objectParams));
      localStorage.setItem("callParams", JSON.stringify(this.callParams));
    },
    btn_zto() {
      // localStorage.clear();
      this.url1 = require("../../assets/images/zto.jpeg");
      this.url2 = require("../../assets/images/zto1.jpg");
      this.objectParams = "zto";
      this.callParams="中通客服热线：95311";
      this.$router.push({ path: "/logisticsQuery/express" });
      localStorage.setItem("url1", JSON.stringify(this.url1));
      localStorage.setItem("url2", JSON.stringify(this.url2));
      localStorage.setItem("objectParams", JSON.stringify(this.objectParams));
      localStorage.setItem("callParams", JSON.stringify(this.callParams));
    }
  }
};
</script>

<style scoped>
.container {
  height: 600px;
}
.box {
  /* border: 1px solid; */
  text-align: center;
}
.img {
  width: 150px;
  height: 55px;
  /* border: 1px solid; */
  border-radius: 10%;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
}
.img_sf {
  background: url(../../assets/images/sf.jpeg) no-repeat center;
  background-size: cover;
}
.img_jd {
  background: url(../../assets/images/jd.jpeg) no-repeat center;
  background-size: cover;
}
.img_ems {
  background: url(../../assets/images/ems.jpeg) no-repeat center;
  background-size: cover;
}
.img_zto {
  background: url(../../assets/images/zto.jpeg) no-repeat center;
  background-size: cover;
}
.more {
  font-family: serif;
  text-align: center;
}
</style>