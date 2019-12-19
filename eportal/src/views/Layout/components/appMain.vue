<template>
    <div class="app_main">
                <router-view :key="$route.fullpath">
                </router-view>
    </div>
</template>

<script>
    export default {
        data() {
            return {

            }
        }
    }
</script>

<style scoped>

.app_main {
    background-color:#f9f9f9;
    padding: 20px;
}
</style>