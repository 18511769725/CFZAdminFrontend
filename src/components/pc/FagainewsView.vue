<template>
  <div class="fagai-dynamic-container">
    <el-card shadow="hover" class="page-card">
      <template #header>
        <div class="card-header">
          <span>发改最新动态管理</span>
        </div>
      </template>

      <!-- 数据表格 -->

      <el-table
        :data="state.newsList"
        border
        stripe
        v-loading="loading"
        style="width: 100%; height: calc(100vh - 240px)"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <!-- ID列 -->
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <!-- 标题列 -->
        <el-table-column prop="title" label="标题" min-width="300">
          <template #default="scope">
            <el-link :href="scope.row.url" target="_blank">{{
              scope.row.title
            }}</el-link>
          </template>
        </el-table-column>

        <!-- 发布日期列 -->
        <el-table-column
          prop="createdate"
          label="发布日期"
          width="180"
          align="center"
        />

        <!-- 链接列 -->
        <el-table-column prop="url" label="链接" min-width="300">
          <template #default="scope">
            <el-link :href="scope.row.url" type="primary" target="_blank"
              >查看链接</el-link
            >
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{
                scope.row.status === 0 || scope.row.status === "0"
                  ? "有效"
                  : "无效"
              }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column label="创建时间" width="200" align="center">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>

        <!-- 更新时间列 -->
        <el-table-column label="更新时间" width="200" align="center">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.updatetime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button
              size="small"
              :type="scope.row.status === 0 ? 'warning' : 'success'"
              @click="handleStatusChange(scope.row)"
            >
              {{
                scope.row.status === 0 || scope.row.status === "0"
                  ? "下线"
                  : "生效"
              }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";

const state = reactive({
  newsList: [],
});

// 定义数据类型接口
interface DynamicItem {
  id: number;
  title: string;
  createdate: string;
  url: string;
  status: number; // 0=有效，其他=无效
  createtime: number; // 时间戳（秒级）
  updatetime: number; // 时间戳（秒级）
}

// 加载状态
const loading = ref(false);

const getNewsList = () => {
  let payload = {};
  request.post("/getnewslist", payload).then((res) => {
    if (res && res.retcode === "200") {
      state.newsList = res.data;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

// 处理状态切换（下线/生效）
const handleStatusChange = (row) => {
  const action = row.status === 0 ? "下线" : "生效";
  const newstatus = row.status === 0 ? 1 : 0;
  let tip_text = "确认要执行" + action + "操作吗？";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        newsid: row.id,
        status: newstatus,
      };
      request.post("/changenewsstatus", payload).then((res) => {
        if (res && res.retcode === "200") {
          getNewsList();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

// 页面初始化（实际项目中此处请求接口加载数据）
onMounted(() => {
  loading.value = true;
  // 模拟接口请求延迟
  getNewsList();
  loading.value = false;
});
</script>

<style scoped>
.fagai-dynamic-container {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 60px);
}

.page-card {
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.el-table {
  --el-table-row-hover-bg-color: #f8f9fa;
}
</style>
