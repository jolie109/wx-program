<template>
  <div v-if="renderSideBar" class="menu-wrapper">
      <router-link v-if="hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow" @click.native="myDate"  :to="{path:'/'}"  >
        <v-list-tile :index="resolvePath(onlyOneChild.path)" :class="indexNeed==resolvePath(onlyOneChild.path)?'active':'default'">
          <v-list-tile-action>
          <v-icon v-if="onlyOneChild.meta&&onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon"></v-icon>
           </v-list-tile-action>
          <v-list-tile-title :title="myDate" v-if="onlyOneChild.meta&&onlyOneChild.meta.title" slot="title" >{{onlyOneChild.meta.title}}</v-list-tile-title>
        </v-list-tile>
      </router-link>
      <v-list-group v-else :index="item.name||item.path" no-action sub-group>
        <template v-slot:activator>
         <router-link :to="{path:resolvePath(item.path)}"  >
          <v-list-tile :class="indexNeed==resolvePath(item.path)?'active':'default'">
          <v-list-tile-title v-if="item.meta&&item.meta.title">
            {{item.meta.title}}
          </v-list-tile-title>
           </v-list-tile>
           </router-link>
        </template>
        <template v-for="child in item.children" v-if="!child.hidden"  >
          <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children&&child.children.length>0" :item="child" :key="child.path" :base-path="resolvePath(child.path)"></sidebar-item>
          <router-link v-else @click.native="myDate()" :to="{path:resolvePath(child.path)}" :key="child.name" >
            <v-list-tile :index="resolvePath(child.path)" :class="indexNeed==resolvePath(child.path)?'active':'default'">
              <v-list-tile-title v-if="child.meta&&child.meta.title" >{{child.meta.title}}</v-list-tile-title>
            </v-list-tile>
          </router-link>
        </template>
      </v-list-group>

  </div>
</template>

<script>
import path from 'path'
import { generateTitle } from '@/utils/i18n'

export default {
  active:-1,
  name: 'SidebarItem',
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      date: { t: +new Date() },
      onlyOneChild: null,
      indexNeed:""
    }
  },
  methods: {
    hasOneShowingChild(children) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // temp set(will be used if only has one showing child )
          this.onlyOneChild = item
          return true
        }
      })
      // this.onlyOneChild.meta.icon   -> 有icon的顯示 icon還是其他符號 待討論
      if (showingChildren.length === 1 && this.onlyOneChild.meta && this.onlyOneChild.meta.icon) {
        return true
      }
      return false
    },
    resolvePath(...paths) {
      return path.resolve(this.basePath, ...paths)
    },
    myDate(item) {
      this.date.t = +new Date()
    },
    generateTitle
  },
  computed: {
    renderSideBar() {
      if (!this.item.hidden && this.item.children && this.item.children.length > 0) {
        for (let i = 0; i < this.item.children.length; i++) {
          if (!this.item.children[i].hidden) {
            return true
          }
        }
      }
    }
  },

watch: {
 
    $route(to, from) {
         this.indexNeed=this.$route.path
    }
}
}
</script>
<style scoped>
  a {
    text-decoration: none !important;
    color:#333 !important;
  }
.active{
 color: aliceblue;
 background-color:#aaa;

 } 
 .default{
   background: f3f6fb
 }
</style>

