<template>
  <div class="logistics">
    <div class="mapBox">
      <div :id="item.id" class="myMap" v-show="isMap"></div>
      <div class="mapInfo" v-show="isMap">运单号：{{mapNumber}}</div>
    </div>
    <div v-show="isTimeline" class="timeline">
      <v-timeline>
        <v-timeline-item
          v-for="(item,index) in timeline"
          :key="index"
          right
          small
          :color="index==0?'error':'primary'"
        >
          <span slot="opposite">{{item.acceptTime}}</span>
          <span>{{item.remark}}</span>
        </v-timeline-item>
      </v-timeline>
    </div>
    <v-layout justify-start>
      <v-flex>
        <div
          class="tips"
          v-show="isTipsShow"
        >抱歉！未查到 {{this.numbers}} 运单的信息，请确认运单号码是否正确，或致电{{this.callParams}}。</div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  props: ["items"],
  data() {
    return {
      item: this.items,
      isTimeline: true,
      isMap: true,
      mapNumber: "",
      isTipsShow: false,
      numbers: "",
      callParams: ""
    };
  },
  created() {
    this.objectParams = JSON.parse(localStorage.getItem("objectParams"));
    this.callParams = JSON.parse(localStorage.getItem("callParams"));
  },
  mounted() {
    this.getUpdateField();
  },
  methods: {
    // 根据页面跳转传参判断执行相应的方法
    getUpdateField() {
      if (this.objectParams == "sf") {
        this.updateFieldSF();
      } else if (this.objectParams == "jd") {
        this.updateFieldJD();
      } else if (this.objectParams == "ems") {
        this.getPointEMS();
      } else if (this.objectParams == "zto") {
        this.updateFieldZTO();
      }
    },
    // 顺丰修改字段
    updateFieldSF() {
      this.item.Route = this.item.Route.map(iterator => {
        return {
          acceptAddress: iterator.accept_address,
          acceptTime: iterator.accept_time,
          remark: iterator.remark
        };
      });
      this.getPointSF();
    },
    // ZTO修改字段
    updateFieldZTO() {
      this.item.traces = this.item.traces.map(iterator => {
        return {
          acceptAddress: iterator.scanCity,
          acceptTime: iterator.scanDate,
          remark: iterator.desc
        };
      });
      this.getPointZTO();
    },
    // JD修改字段
    updateFieldJD() {
      this.item.data = this.item.data.map(iterator => {
        return {
          opeTitle: iterator.opeTitle,
          acceptTime: iterator.opeTime,
          remark: iterator.opeRemark,
          opeName: iterator.opeName,
          opeRemark: iterator.opeRemark
        };
      });
      this.getPointJD();
    },
    // 顺丰获取起点和终点
    getPointSF() {
      if (!this.item.Route.length == 0) {
        this.currentPoint = this.item.Route[
          this.item.Route.length - 1
        ].acceptAddress;
        this.startPoint = this.item.Route[0].acceptAddress;
        this.getCoord();
        var timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTipsShow = false;
          this.isTimeline = true;
          this.mapNumber = this.item.mailno;
        }, 500);
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        if (this.isTipsShow == true) {
          this.numbers = this.item.mailno;
        }
      }
    },
    // 中通获取起点和终点
    getPointZTO() {
      if (!this.item.traces.length == 0) {
        this.currentPoint = this.item.traces[
          this.item.traces.length - 1
        ].acceptAddress;
        this.startPoint = this.item.traces[0].acceptAddress;
        this.getCoord();
        var timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTipsShow = false;
          this.isTimeline = true;
          this.mapNumber = this.item.billCode;
        }, 500);
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        if (this.isTipsShow == true) {
          this.numbers = this.item.billCode;
        }
      }
    },
    // EMS获取起点和终点
    getPointEMS() {
      if (this.item.success == "T" && !this.item.traces.length == 0) {
        this.currentPoint = this.item.traces[
          this.item.traces.length - 1
        ].acceptAddress;
        this.startPoint = this.item.traces[0].acceptAddress;
        this.getCoord();
        var timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTimeline = true;
        }, 500);
        this.isTipsShow = false;
        this.mapNumber = this.item.mailNo;
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        if (this.isTipsShow == true) {
          this.numbers = this.item.mailNo;
        }
      }
    },
    getPointJD() {
      // 地图
      if (!this.item.data.length == 0) {
        const startPoint = this.item.data.find((value, index, arr) => {
          return value.opeRemark.startsWith("货物已到达");
        });
        this.startPoint = startPoint.opeRemark.substring(
          6,
          startPoint.opeRemark.length - 1
        );
        const currentPoint = this.item.data
          .reverse()
          .find((value, index, arr) => {
            return value.opeRemark.startsWith("货物已到达");
          });
        this.currentPoint = currentPoint.opeRemark.substring(
          6,
          currentPoint.opeRemark.length - 1
        );
        this.getCoord();
        var timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTipsShow = false;
          this.isTimeline = true;
          this.mapNumber = this.item.mailNo;
        }, 1000);
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        if (this.isTipsShow == true) {
          this.numbers = this.item.mailNo;
        }
      }
    },
    // 地名转换为经纬度
    getCoord() {
      this.$axios
        .get(
          `/mapCoord/geocoding/v3/?address=${this.startPoint}&output=json&ak=iybSMvqfTMHZlgVySASC6donCu3daCEF`,
          {}
        )
        .then(res => {
          this.startLng = res.data.result.location.lng;
          this.startLat = res.data.result.location.lat;
        });
      this.$axios
        .get(
          `/mapCoord/geocoding/v3/?address=${this.currentPoint}&output=json&ak=iybSMvqfTMHZlgVySASC6donCu3daCEF`,
          {}
        )
        .then(res => {
          this.currentLng = res.data.result.location.lng;
          this.currentLat = res.data.result.location.lat;
        });
    },
    // 地图绘制
    getMap() {
      var map = new BMap.Map(this.item.id, { enableMapClick: false });
      map.enableScrollWheelZoom(true);
      var start = new BMap.Point(this.startLng, this.startLat);
      var end = new BMap.Point(this.currentLng, this.currentLat);
      var p1 = new BMap.Point(this.currentLng, this.currentLat);
      //自定义图标
      var startIcon = new BMap.Icon(
        require("../../assets/images/point.png"),
        new BMap.Size(25, 25)
      );
      var currentIcon = new BMap.Icon(
        require("../../assets/images/car.png"),
        new BMap.Size(25, 25)
      );
      var endIcon = new BMap.Icon(
        require("../../assets/images/point.png"),
        new BMap.Size(25, 25)
      );
      var driving = new BMap.DrivingRoute(map, {
        renderOptions: { map: map, autoViewport: true },
        onMarkersSet: function(routes) {
          //标注点完成回调
          map.clearOverlays(); //删除点
          var myStart = new BMap.Marker(start, { icon: startIcon });
          map.addOverlay(myStart);
          var myEnd = new BMap.Marker(end, { icon: endIcon });
          map.addOverlay(myEnd);
          var myP1 = new BMap.Marker(p1, { icon: currentIcon });
          map.addOverlay(myP1);
        }
      });
      driving.search(start, end, { waypoints: [p1] });
    }
  },
  watch: {
    items(newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.item = newVal;
        this.getUpdateField();
      }
      this.item = newVal;
    }
  },
  computed: {
    timeline() {
      if (this.objectParams == "sf") {
        if (this.item.Route instanceof Array == true) {
          return this.item.Route.slice().reverse();
        }
      } else if (this.objectParams == "jd") {
        if (this.item.data instanceof Array == true) {
          return this.item.data.slice().reverse();
        }
      } else if (this.objectParams == "ems") {
        if (this.item.traces instanceof Array == true) {
          return this.item.traces.slice().reverse();
        }
      } else if (this.objectParams == "zto") {
        if (this.item.traces instanceof Array == true) {
          return this.item.traces.slice().reverse();
        }
      }
    }
  }
};
</script>

<style  scoped>
.logistics {
  width: 100%;
  border-top: 1px solid #ccc;
  padding-top: 30px;
}
.mapBox {
  position: relative;
  width: 88%;
  margin: 0 auto;
}
.myMap {
  width: 100%;
  height: 500px;
  margin: 0 auto;
  font-family: "微软雅黑";
  margin-bottom: 60px;
  margin-top: 20px;
}
.mapInfo {
  margin: 0 auto;
  width: 80%;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 2px 1px #c5c5c5;
  border-radius: 5px;
  text-align: center;
  line-height: 80px;
  position: absolute;
  top: 3%;
  left: 10%;
  font-size: 18px;
  font-weight: 600;
}
.timeline {
  width: 95%;
  margin-left: -20px;
  margin-bottom: 20px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}
/* //自动移滚动条样式 */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-thumb {
  border-radius: 1em;
  background-color: rgba(50, 50, 50, 0.3);
}
::-webkit-scrollbar-track {
  border-radius: 1em;
  background-color: rgba(50, 50, 50, 0.1);
}
/* 查询单号无数据时的提示信息样式 */
.tips {
  height: 80px;
  line-height: 80px;
  background-color: #f2f2f2;
  margin-left: 56px;
  margin-right: 54px;
  padding-left: 20px;
  color: #de162e;
  margin-bottom: 20px;
}
</style>