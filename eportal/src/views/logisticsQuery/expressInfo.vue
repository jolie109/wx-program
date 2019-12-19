<template>
  <v-container fluid grid-list-xl>
    <div class="afterSearch">
      <v-layout justify-center>
        <v-flex>
          <img :src="url2" alt class="img_icon" />
        </v-flex>
        <v-flex md9 class="input">
          <v-combobox
            v-model="chips"
            :items="chipstip"
            hide-selected
            label="输入运单号进行查询"
            chips
            clearable
            solo
            multiple
          >
            <template v-slot:selection="data">
              <v-chip small :selected="data.selected" close @input="remove(data.item)">
                <span>{{ data.item }}</span>
              </v-chip>
            </template>
          </v-combobox>
        </v-flex>
        <v-flex md2>
          <v-btn color="info" large @click="waitSearch()">查询</v-btn>
        </v-flex>
      </v-layout>
      <express-map v-show="isMap" v-for="(items,index) in item" :key="index" :items="items"></express-map>

      <v-layout justify-center>
        <v-btn
          round
          color="info"
          @click="goBack()"
          class="btn_back"
        >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;返回&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</v-btn>
      </v-layout>
    </div>
    <v-snackbar color="error" top right :timeout="timeout" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
      <div>{{error}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>
<script>
import qs from "qs";
import expressMap from "./expressMap";
export default {
  components: { expressMap },
  data() {
    return {
      isMap: true,
      isTipsShow: false,
      clearable: true,
      chips: [],
      chipstip: [{ header: "输入新的运单号请按回车键" }],
      numbers: "",
      numberData: [],
      item: [],
      url2: "",
      objectParams: "",
      startPoint: "",
      startLat: "",
      startLng: "",
      currentPoint: "",
      currentLat: "",
      currentLng: "",
      snackbar: false,
      timeout: 6000,
      error: ""
    };
  },
  mounted() {
    this.getQuery();
    this.getArr();
    this.getLogistics();
  },
  methods: {
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1);
      this.chips = [...this.chips];
      this.numbers = this.chips.join(",");
      localStorage.setItem("numbers", JSON.stringify(this.numbers));
    },
    getQuery() {
      this.url2 = JSON.parse(localStorage.getItem("url2"));
      this.objectParams = JSON.parse(localStorage.getItem("objectParams"));
      this.numbers = JSON.parse(localStorage.getItem("numbers"));
    },
    getArr() {
      this.chips = this.numbers.split(",");
    },
    getLogistics() {
      if (this.objectParams == "sf") {
        this.$axios({
          method: "post",
          url: "/api/logistics/sf",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: qs.stringify({
            mailNo: this.numbers
          })
        }).then(res => {
          if (Object.keys(res.data.result[0]).length == 0) {
            this.isMap = false;
            this.isTimeline = false;
            this.isTipsShow = true;
            return;
          }
          this.item = res.data.result[0].RouteResponse;
          this.numberData = this.numbers.split(",");
          this.item.forEach((element, index) => {
            element.id = "myMap" + index;
          });
        });
      } else if (this.objectParams == "jd") {
        this.$axios({
          method: "get",
          url: "/api/logistics/jd?mailNo=" + this.numbers,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }).then(res => {
          if (res.data.result.length == 0) {
            this.isMap = false;
            this.isTimeline = false;
            this.isTipsShow = true;
            return;
          }
          this.item = res.data.result;
          this.numberData = this.numbers.split(",");
          this.item.forEach((element, index) => {
            element.id = "myMap" + index;
            element.mailNo = this.numberData[index];
          });
        });
      } else if (this.objectParams == "ems") {
        this.$axios({
          method: "post",
          url: "/api/logistics/ems",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: qs.stringify({
            mailNo: this.numbers
          })
        }).then(res => {
          this.item = res.data.result;
          this.numberData = this.numbers.split(",");
          this.item.forEach((element, index) => {
            element.id = "myMap" + index;
            element.mailNo = this.numberData[index];
          });
        });
      } else if (this.objectParams == "zto") {
        this.$axios({
          method: "post",
          url: "/api/logistics/zto",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: qs.stringify({
            mailNo: this.numbers
          })
        }).then(res => {
          this.item = res.data.result;
          this.item.forEach((element, index) => {
            element.id = "myMap" + index;
          });
        });
      }
    },
    waitSearch() {
      setTimeout(() => {
        this.search();
      }, 100);
    },
    search() {
      this.numbers = this.chips.join(",");
      localStorage.setItem("numbers", JSON.stringify(this.numbers));
      this.isTipsShow = false;
      if (this.numbers == "") {
        this.error = "请输入快递单号后再点击查询～  ";
        this.isTipsShow = false;
        this.isTimeline = false;
        this.isMap = false;
        this.snackbar = true;
        return false;
      }
      this.getLogistics();
      this.isTimeline = true;
    },
    goBack() {
      this.$router.go(-2);
    }
  },
  computed: {
    timeline() {
      return this.item.slice().reverse();
    }
  }
};
</script>

<style scoped>
.afterSearch {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 2px 2px 0 rgba(0, 0, 0, 0.4);
  width: 100%;
  padding-bottom: 150px;
}
.img_icon {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 10%;
  margin: 8px 0 0 60px;
  box-shadow: 1px 2px 2px 0 rgba(0, 0, 0, 0.4);
}
.input {
  margin-top: 4px;
}
.timeline {
  width: 88%;
  margin-left: -20px;
}
.btn_back {
  margin-top: 100px;
}
.afterSearch /deep/ .anchorBL {
  display: none;
}
</style>