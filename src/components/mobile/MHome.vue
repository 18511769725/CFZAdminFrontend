<template>
  <div class="page-container">
    <div class="body-wrapper">
      <router-view />
    </div>
    <!-- 底部导航栏 -->
    <van-tabbar route v-model="active">
      <van-tabbar-item replace to="/mgames" icon="home-o"
        >游戏版号</van-tabbar-item
      >
      <van-tabbar-item replace to="/mpolicy" icon="search"
        >产业政策</van-tabbar-item
      >
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const state = reactive({
  activeTab: -1, // 底部导航栏激活项
});

const active = ref(0); // 默认激活第一个标签页
const router = useRouter();

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  router.push("/mgames");
});
</script>

<style scoped>
/* 全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%; /* 让html和body占满屏幕高度 */
}

/* 根容器（如 #app 或页面最外层div） */
.page-container {
  width: 100vw;
  height: 100vh; /* 占满视口高度 */
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  overflow: hidden; /* 避免整体滚动 */
}

.body-wrapper {
  flex: 1; /* 填充剩余高度 */
  overflow: hidden;
  /* 可选：避免内容被tabbar遮挡（如果tabbar用fixed定位） */
  padding-bottom: 50px;
}
</style>
