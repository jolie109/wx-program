<template>
  <v-app id="app">
    
    <router-view :key="$route.fullpath">
    </router-view>
  </v-app>
</template>
<script>
import { MP } from "./map";
export default {
  name: 'app',
  data() {
    return {
       ak: "iybSMvqfTMHZlgVySASC6donCu3daCEF"
    }
  },
  mounted(){
    this.$router.afterEach((to, from, next) => {
        window.scrollTo(0, 0)
      });
      MP(this.ak);
  }
}
</script>
<style scoped>
.transitionRouter-enter-active,
.transitionRouter-leave-active {
    transition: all 0.4s;
}

.transitionRouter-enter,
.transitionRouter-leave{
    transform: translate3d(100%, 0, 0);
}
</style>
