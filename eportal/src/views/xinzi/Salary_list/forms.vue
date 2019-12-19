<template>
  <v-container class="bg" fluid grid-list-xl>
    <v-layout md12>
      <v-flex class="headerList">
        <p>员工薪资构成</p>
        <p>力导向图</p>
      </v-flex>
    </v-layout>
    <v-layout md12>
      <div id="main">
        <!-- <p class="tipinfo" v-if="tipinfoflag">该月薪资还未生成</p> -->
        <p class="tipinfo" v-if="tipinfoflag==true" >当月薪资单暂未生成</p>
      </div>

    </v-layout>
  </v-container>
</template>
<script >
import echarts from "echarts";
export default {
  data() {
    return {
    
      resultdata: [],
      listdata: {},
      basicsum: 0,
      addsum: 0,
      adjustdata: 0,
      reward: 0,
      adjustamount: 0,
      othersum: 0,
      basicdata: [], //用来放力导向图中的基本薪资类别的数据
      addsidedata: [], //用来放力导向图中的每月加给的类别的数据
      adjustadddata: [], //用来放力导向图中的嘉奖类别的数据
      adjustrewarddata: [], //用来放力导向图中的嘉奖类别的数据
        bonusdata:[],//用来放力导向图中的奖金类别的数据
      lastdata: [], //最终合并的薪资结构数据,
      links: [],
      tipinfoflag:false
    };
  },
  methods: {
    resetdata() {
      let linkdata = [];
      if (this.listdata.structuredata.length != 0) {
        this.listdata.structuredata.forEach((item2, index) => {
          if ((item2.category_type == "基本薪资")) {
            this.basicsum += item2.amount;
            let p = {
              id: 7 + index,
              name: item2.categoryinfo.name+item2.amount,
              symbolSize: 20,
              category: "月度发放记录",
              draggable: "true",
              value: item2.amount
            };
            let linkp = {
              source: "3",
              target: p.id
            };
            this.basicdata.push(p);
            linkdata.push(linkp);
          } else if ((item2.category_type == "每月加给")) {
            this.addsum += item2.amount;
            let k = {
              id: 7 + index,
              name: item2.categoryinfo.name+ item2.amount,
              symbolSize: 20,
              category: "月度发放记录",
              draggable: "true",
              value: item2.amount
            };
            let link = {
              source: "4",
              target: k.id
            };
            linkdata.push(link);
            this.basicdata.push(k);
          }
        });
      }
      //年度发放的奖金部分的数据
      if (this.listdata.rewarddata.length > 0) {
        this.listdata.rewarddata.forEach((item0, index) => {
          this.othersum += item0.amount;
          let h={
            id:7+this.listdata.structuredata.length+index+this.listdata.specialadjust.length,
            name:item0.bonus_type+item0.amount,
            symbolSize: 20,
            category: "年度发放记录",
            draggable: "true",
            value: item0.amount
          }
           let v = {
              source: "5",
              target: h.id
            };
            linkdata.push(v)
            this.bonusdata.push(h)
        
        });
      }
      //特别调整的数据
      if (this.listdata.specialadjust.length != 0) {
        this.listdata.specialadjust.forEach((item1, i) => {
          if (item1.amount && item1.amount.indexOf("-") !== -1) {
            this.adjustdata += parseInt(item1.amount.substr(1, item1.amount.length - 1));
            let am=item1.amount.substr(1, item1.amount.length - 1)
            let a = {
              id: 7 + i + this.listdata.structuredata.length,
              name: item1.adjust_type+"-"+am,
              symbolSize: 20,
              category: "月度发放记录",
              draggable: "true",
              value: item1.amount
            };
            let linkc = {
              source: "2",
              target: a.id
            };
            linkdata.push(linkc);
            this.adjustadddata.push(a);
          } else  {
            this.reward += parseInt(item1.amount);
            let b = {
              id: 7 + i + this.listdata.structuredata.length,
              name: item1.adjust_type+ item1.amount,
              symbolSize: 20,
              category: "月度发放记录",
              draggable: "true",
              value: item1.amount
            };
            let linka = {
              source: "2",
              target: b.id
            };
            linkdata.push(linka);
            this.adjustrewarddata.push(b);
          }
          this.adjustamount = this.reward - this.adjustdata;
        });
      }
      this.resultdata = [
        {
          id: 0,
          name: "员工薪资单 "+(this.basicsum + this.addsum + this.othersum + this.adjustamount),
          symbolSize: 60,
          draggable: "false",
          category: "父节点",
          value: this.basicsum + this.addsum + this.othersum + this.adjustamount
        },
        {
          id: 1,
          name: "月度发放记录 "+(this.basicsum + this.addsum),
          symbolSize: 40,
          category: "月度发放记录",
          draggable: "true",
          value: this.basicsum + this.addsum
        },
        {
          id: 2,
          name: "特别调整"+this.adjustamount,
          symbolSize: 30,
          category: "月度发放记录",
          draggable: "true",
          value: this.adjustamount
        },
        {
          id: 3,
          name: "基本薪资 "+this.basicsum,
          symbolSize: 30,
          category: "月度发放记录",
          draggable: "true",
          value: this.basicsum
        },
        {
          id: 4,
          name: "每月加给 "+this.addsum,
          symbolSize: 30,
          category: "月度发放记录",
          draggable: "true",
          value: this.addsum
        },

        {
          id: 5,
          name: "年度发放记录 "+this.othersum,
          symbolSize: 30,
          category: "年度发放记录",
          draggable: "true",
          value: 0
        },
        {
          id: 6,
          name: "季度绩效试算"+0,
          symbolSize: 40,
          category: "季度绩效试算",
          draggable: "true",
          value: 0
        }
      ];
      this.links = [
        //第一层的链接
        {
          // 为父
          source: "0",
          //子一级
          target: "1"
        },
        {
          source: "0",
          target: "5"
        },
        {
          source: "0",
          target: "6"
        },
        //月度发放记录的连接
        {
          source: "1",
          target: "2"
        },
        {
          source: "1",
          target: "3"
        },
        {
          source: "1",
          target: "4"
        }
        //年度的发放记录连接

      ];
      this.lastdata = [
        ...this.resultdata,
        ...this.basicdata,
        ...this.addsidedata,
        ...this.adjustrewarddata,
        ...this.adjustadddata,
        ...this.bonusdata
      ];
      this.links = [...this.links, ...linkdata];
    },
    getdatalist() {
      this.$axios.get("/api/salaryList/graphytu").then(res => {
        if ((res.data.status == "200")) {
          this.listdata = res.data.result;
          this.resetdata();
          this.graphydata();
          this.tipinfoflag=false
        }else if(res.data.status == "404"){
          this.listdata=[]
          this.tipinfoflag=true
        }
      });
    },
    graphydata() {
      var myChart = echarts.init(document.getElementById("main"));
      var lastdata = this.lastdata;
      var links = this.links;
      // 指定图表的配置项和数据
      var option = {
        backgroundColor: "#f9f9f9",
        title: {
          text: "员工薪资构成",
          subtext: "payslip",
          top: "top",
          left: "center"
        },
        tooltip: {
        },
        legend: [
          {
            formatter: function(name) {
              return echarts.format.truncateText(
                name,
                40,
                "14px Microsoft Yahei",
                "…"
              );
            },
            tooltip: {
              show: true
            },
            selectedMode: "true",
            bottom: 800,
            data: [
              "员工薪资单",
              "月度发放记录",
              "季度绩效试算",
              "年度发放记录",
              "特别调整"
            ]
          }
        ],
        toolbox: {
          show: true,
          feature: {
            dataView: {
              show: true,
              readOnly: true
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        animationDuration: 1000,
        animationEasingUpdate: "quinticInOut",
        series: [
          {
            name: "员工薪资单",
            type: "graph",
            layout: "force",
            //正表的间距
            force: {
              repulsion: 400,
              //线的长度
              edgeLength: 120
            },
            data: lastdata,
            links: links,
            categories: [
              {
                name: "员工薪资单组成"
              },
              {
                name: "月度发放记录"
              },
              {
                name: "年度发放记录"
              },
              {
                name: "季度绩效试算"
              },
              {
                name: "特别调整"
              },
              {
                name: "父节点"
              }
            ],
            focusNodeAdjacency: true,
            roam: true,
            //字的设置
            label: {
              normal: {
                show: true,
                position: "top"
              }
            },
            lineStyle: {
              normal: {
                color: "source",
                curveness: 0,
                type: "solid"
              }
            }
          }
        ]
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    }
  },
  mounted() {
    this.getdatalist();
    // this.resetdata();
  }

};
// 基于准备好的dom，初始化echarts实例
</script>

<style  scoped>
#main {
  width: 100%;
  height: 600px;
  margin-top: 20px;
  position:relative;
}
.tipinfo{
  position:absolute;
  top:0;
  bottom:0;
  left:0;
  right:0;
  margin:auto;
  width:300px;
  height:40px;
  font-size:30px;
}
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  margin-top: -50px;
}
.headerList p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  margin-top: 50px;
  position: relative;
}
</style>
