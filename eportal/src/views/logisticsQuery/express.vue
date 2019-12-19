<template>
  <v-container fluid grid-list-xl>
    <div class="box">
      <v-layout align-center justify-center>
        <img :src="url1" class="img" />
      </v-layout>
      <v-layout align-center justify-center fill-height>
        <v-flex md2 class="select">
          <v-select :items="items" label="请选择查询方式" v-model="way" solo></v-select>
        </v-flex>
        <v-flex md7 class="input">
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
    </div>
    <v-snackbar color="error" top right :timeout="timeout" v-model="snackbar">
      <v-icon color="white" class="mr-3" size="20">remove_circle</v-icon>
      <div>{{error}}</div>
      <v-icon color="white" size="16" @click="snackbar = false">clear</v-icon>
    </v-snackbar>
  </v-container>
</template>
<script>
export default {
  name:"express",
  data() {
    return {
      items: ["按运单号查询", "按保单号查询"],
      way: "按运单号查询",
      clearable: true,
      chips: [],
      chipstip: [{ header: "输入新的运单号请按回车键" }],
      numbers: "",
      url1: "",
      url2: "",
      snackbar: false,
      timeout: 6000,
      error: ""
    };
  },
  mounted() {
    this.getQuery();
  },
  methods: {
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1);
      this.chips = [...this.chips];
    },
    getQuery() {
      this.url1 = JSON.parse(localStorage.getItem("url1"));
    },
    waitSearch() {
      setTimeout(()=>{
        this.search();
      },100)
    },
    search() {
      if (this.chips.length > 1) {
        this.numbers = this.chips.join(",");
      } else {
        this.numbers = this.chips[0];
      }
      if (this.way == "按运单号查询") {
        if (this.numbers == undefined) {
          this.error = "请输入快递单号后再点击查询～  ";
          this.snackbar = true;
          return false;
        }
        localStorage.setItem("numbers", JSON.stringify(this.numbers));
        this.$router.push({
         path: "/logisticsQuery/expressInfo"
        });
      } else {
        if (this.numbers == "") {
          this.error = "请输入保单号后再点击查询～  ";
          this.snackbar = true;
          return false;
        }
        alert("按保单号查询的方法还在实现中");
      }
    }
  }
};
</script>
<style scoped>
.box {
  height: 300px;
}
.img {
  display: inline-block;
  width: 150px;
  height: 55px;
  border-radius: 25%;
  margin-top: 200px;
  /* margin: 0 auto; */
}
.select {
  margin-top: 25px;
}
.input {
  margin-top: 25px;
}
</style>