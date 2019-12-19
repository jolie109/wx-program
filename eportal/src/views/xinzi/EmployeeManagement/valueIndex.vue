<template>
<v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <div class="search">
    <v-layout >
      <v-flex xs12 sm2 md2>
          <v-autocomplete :items="items" label="请输入员工姓名" item-text="name" item-value="_id"  v-model="name_selected"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1 >
        <v-btn color="primary"  @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      </v-layout>
      </div>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>valueIndex计算</p>
      </v-flex>
      <v-flex md12>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="desserts"
    :pagination.sync="pagination"
    select-all
    item-key="name"
    class="elevation-1"
  >
    <template v-slot:headers="props">
      <tr>
        <th>
          <v-checkbox
            :input-value="props.all"
            :indeterminate="props.indeterminate"
            primary
            hide-details
            @click.stop="toggleAll"
          ></v-checkbox>
        </th>
        <th
          v-for="header in props.headers"
          :key="header.text"
        >
          {{ header.text }}
        </th>
      </tr>
    </template>
    <template v-slot:items="props">
      <tr :active="props.selected" @click="props.selected = !props.selected">
        <td class="text-xs-center">
          <v-checkbox
            :input-value="props.selected"
            primary
            hide-details
          ></v-checkbox>
        </td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">{{ props.item.department.name }}</td>
        <td class="text-xs-center">{{ props.item.last_value_index_time}}</td>
      </tr>
    </template>
  </v-data-table>
   </v-flex>
      <v-layout><v-flex class="btnCalculate"><v-btn color="primary" @click="calculate()">
          计算    valueIndex
        </v-btn></v-flex></v-layout>
    </div>
  </v-container>
</template>
<script>
  export default {
    data: () => ({
      date: new Date().toISOString().substr(0, 10),
      pagination: {
        sortBy: 'name'
      },
      selected: [],
      items:[],
      name_selected: '',
      headers: [
        {text: '员工姓名',align: 'center',value: 'name'},
        { text: '所在部门',align: 'center', value: 'calories'},
        // { text: 'valueIndex',align: 'center', value: 'calories'},
        { text: '上次计算valueIndex时间',align: 'center', value: 'calories'},
      ],
      desserts: []
    }),
    created() {
      this.getValueCalculate();
  },
  mounted(){
  // this.getValueCalculate();
  },
    methods: {
      getValueCalculate() {
      this.$axios.get("/api/salaryStructure/allValueIndex",{
      }).then(res => {
        this.desserts = res.data.result;
        for (const iterator of this.desserts) {
            this.items.push(iterator);
          }
        this.items.unshift("全部");
      });
    },
    search() {
      if (this.name_selected == "全部") {
        this.getValueCalculate();
      } else {
        this.$axios
          .get("/api/salaryStructure/valueIndexSearch", {
            params: {_id:this.name_selected}
          })
          .then(res => {
            this.desserts = res.data.result;
          });
      }
    },
     calculate(){
       var allId = [];
      for (const iterator of this.selected) {

          allId.push(iterator._id)
      }


      this.$axios
          .get("/api/salaryStructure/employeeSumpoint",{
            params: {
              allId:allId,
              last_value_index_time:this.date,
            }
          })
          .then(res => {

            this.getValueCalculate();
          });
    },
      toggleAll () {
        if (this.selected.length) {
          this.selected = [];
          }
        else {
          this.selected = this.desserts;
          }
      },
      changeSort (column) {
        if (this.pagination.sortBy === column) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = column
          this.pagination.descending = false
        }
      }
    }
  }
</script>
<style scoped>
.btn_color {
background: rgb(148, 147, 147)!important;
color: black!important;
}
.btnCalculate{
    text-align: right;
    
}
.btnCalculate button{
margin: 20px 80px 0 0;
}
.search {
    margin-top: -40px;
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerList p:nth-of-type(2){
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
}
</style>