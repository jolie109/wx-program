<template>
  <v-navigation-drawer
    class="my_drawer"
    permanent
    :style="{width:needWidth+'px'}"
  >
    <v-toolbar flat class="transparent">
      <v-list class="pa-0">
        <v-list-tile avatar>
          <v-list-tile-content>
            <v-list-tile-title class="my_logo">
              <img src="../../../assets/images/belstar_logo.png" width="141" height="58"/>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-toolbar>

    <v-list class="pt-0" dense>
      <sidebar-item v-for="route in permission_routers" :key="route.name" :item="route" :base-path="route.path"></sidebar-item>
    </v-list>
    <div class="collaspe" :style="{'padding-left':needPadd+'px'}">
      <v-btn icon @click.stop="hs()">
        <v-icon style="color:#999">&lt;&lt;</v-icon>
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>
<script>
import SidebarItem from './SidebarItem'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      mini: false,
      needWidth:240,
      needPadd:180
    }
  },
 components: { SidebarItem },
    computed: {
    ...mapGetters([
      'permission_routers',
      'sidebar'
    ]),
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    hs() {
      this.needWidth=this.needWidth==240?65:240
       this.needPadd=this.needPadd==180?20:180
    }
  },
}
</script>

<style scoped>
.my_drawer {
  background-color: #f3f6fb !important;
}
.my_logo {
  padding: 10px;
  height: 52px !important;
}
.collaspe {
  position: fixed;
  bottom: 0;
  left: 0;
  border-top: 1px solid #999;
  color: #999 !important;
}
</style>