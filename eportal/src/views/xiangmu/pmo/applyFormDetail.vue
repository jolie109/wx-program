<template>
  <div>
    <div class="header">
      <span>结案申请单</span>
    </div>
    <div class="cont">
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">项目编号</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row_detail_sty">{{this.desserts.number}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">项目名称</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row_detail_sty">{{this.desserts.name}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">项目说明</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row_detail_sty">{{this.desserts.desc}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">预计结案时间</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row_detail_sty">{{this.desserts.expect_close_date}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">项目经理</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row_detail_sty">{{this.desserts.product.name}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">项目等级</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row_detail_sty">{{this.desserts.level}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">
            结案分数
            <span style="color:red">&nbsp;*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg3>
          <v-text-field class="row_detail_sty" v-model="score"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row_title_sty">
            结案结果
            <span style="color:red">&nbsp;*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg3>
          <v-select :items="items" class="row_detail_sty" v-model="status"></v-select>
        </v-flex>
      </v-layout>
      <v-layout class="btn_sty">
        <v-flex xs8 md6 lg4 btn>
          <v-btn color="info" dark @click="agree()">同意</v-btn>
          <v-btn color="info" dark @click="disagree()">驳回</v-btn>
          <v-btn color="info" dark @click="goback()">返回</v-btn>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      desserts: { product: "" },
      score: "",
      status: "",
      items: ["已结案（成功）", "已结案（失败）"]
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.getApplyDetail();
    }
  },
  methods: {
    getApplyDetail() {
      this.$axios
        .get("/api/pmo/applyComplete", {
          params: {
            id: this.$route.query.id
          }
        })
        .then(res => {
          if (res.data.status == "200") {
            this.desserts = res.data.result[0];
          }
        });
    },
    agree() {
      let data = {
        _id: this.$route.query.id,
        score: this.score,
        status: this.status
      };
      this.$axios.put("/api/pmo/applyComplete", { data: data }).then(res => {});
      this.$router.push({ name: "结案申请单", query: {} });
    },
    disagree() {
      let data = {
        _id: this.$route.query.id,
        status: "项目执行中"
      };
      this.$axios.put("/api/pmo/applyComplete", { data: data }).then(res => {});
      this.$router.push({ name: "结案申请单", query: {} });
    },

    goback() {
      this.$router.push({
        name: "结案申请单",
        query: {}
      });
    }
  }
};
</script>

<style scoped>
.header {
  margin: 43.9px 25.8px 0 36.2px;
  background: #e0e1e2;
  height: 64.6px;
  text-align: center;
  padding-top: 13.5px;
}
.header span {
  font-family: PingFangSC-Regular;
  font-size: 27px;
  color: #333300;
}
.cont {
  background: #ffffff;
  margin: 0 25.8px 0 36.2px;
}
.row {
  margin-left: 38px;
  margin-right: 79px;
}
.row_title_sty {
  font-family: PingFangSC-Semibold;
  font-size: 17px;
  color: #4d4d4d;
  letter-spacing: 0;
  line-height: 24px;
}
.row_detail_sty {
  font-family: PingFangSC-Regular;
  font-size: 17px;
  color: #333333;
}
.btn_sty {
  margin: 162px 0px 46px 500px;
  padding-bottom: 200px;
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #f1e9e9;
  position: relative;
}
.btn {
  position: absolute;
  right: 300px;
  display: flex;
}
</style>