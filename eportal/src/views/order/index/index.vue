<template>
    <div>
<router-view ></router-view>
    </div>
</template>

<script>
    export default {
        computed: {
            key() {
                return new Date().getTime()
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>