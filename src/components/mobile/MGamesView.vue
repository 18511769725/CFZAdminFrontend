<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <h1>游戏版号查询</h1>
      </div>
      <el-table
        :data="state.gamelist"
        style="width: 100%; height: calc(100vh - 180px)"
        @cell-dblclick="handleCellDblClick"
        @cell-click="handleCellClick"
      >
        <el-table-column prop="id" label="序号" min-width="16%" />
        <el-table-column prop="gamename" label="游戏名称" min-width="22%" />
        <el-table-column prop="publisher" label="出版单位" min-width="22%" />
        <el-table-column prop="operator" label="运营单位" min-width="20%" />
        <el-table-column prop="approvepatch" label="审批批次" min-width="19%" />
        <!-- <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button type="success" v-if="scope.row.follow === 0" @click="handleFollow(scope.row)">标记关注</el-button>
            <el-button type="danger" v-if="scope.row.follow === 1" @click="handleUnFollow(scope.row)">取消关注</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="state.getInfoParams.currentPage"
        :page-size="state.getInfoParams.pageSize"
        layout="total, prev, pager, next"
        :total="state.getInfoParams.totalCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <van-action-sheet v-model:show="state.showsearch" title="搜索">
    <div class="line-wrapper">
      <div class="search-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.gamename"
          clearable
          placeholder="游戏名称"
          style="width: 100%; height: 32px; margin-top: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.publishername"
          clearable
          placeholder="检索出版单位"
          style="width: 100%; height: 32px; margin-top: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.operatorname"
          clearable
          placeholder="检索运营单位"
          style="width: 100%; height: 32px; margin-top: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.patchname"
          clearable
          placeholder="检索匹配批次"
          style="width: 100%; height: 32px; margin-top: 25px"
        />
        <el-button
          type="primary"
          @click="getGames"
          style="margin-top: 25px; line-height: 40px; width: 100%"
          >点击查询</el-button
        >
      </div>
    </div>
  </van-action-sheet>
</template>

<script setup>
import { ref, reactive } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import useClipboard from "vue-clipboard3";
import { ElMessage, ElMessageBox } from "element-plus";

const state = reactive({
  fileTempList: [],
  gamelist: [],
  showsearch: false,
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    gamename: "",
    patchname: "",
    publishername: "",
    operatorname: "",
  },
});

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getGames();
};

const getGames = () => {
  request.post("/getgames", state.getInfoParams).then((res) => {
    if (res) {
      state.gamelist = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
      state.showsearch = false;
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

let clickTimer = null;

const { toClipboard } = useClipboard();
const copyText = async (tetx_info) => {
  try {
    await toClipboard(tetx_info);
    ElMessage({
      message: "已复制 ’" + tetx_info + "‘ 到剪贴板!",
      type: "success",
    });
  } catch (error) {
    ElMessage.error("复制数据到剪贴板时出错:", error);
  }
};

const handleCellDblClick = (row, column, cell, event) => {
  // 若在 300 毫秒内发生了双击事件，清除单击定时器
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
  state.getInfoParams.gamename = "";
  state.getInfoParams.patchname = "";
  state.getInfoParams.publishername = "";
  state.getInfoParams.operatorname = "";
  state.showsearch = true;
};
const handleCellClick = (row, column, cell, event) => {
  // 设置一个 300 毫秒的定时器
  clickTimer = setTimeout(() => {
    // 若 300 毫秒内没有发生双击事件，则执行单击逻辑
    const rowDataString = cell.textContent.trim();
    copyText(rowDataString);
    clickTimer = null;
  }, 300);
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getGames();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  height: 64px;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.content-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.search-wrapper {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.table-wrapper {
  width: 100%;
}

.pagination-wrapper {
  width: 100%;
  padding: 0;
  background-color: aliceblue;
}

h1 {
  font-family: Arial, sans-serif; /* 字体 */
  font-size: 24px; /* 字体大小 */
  font-weight: bold; /* 字体粗细 */
  color: #333; /* 文字颜色 */
  text-align: center; /* 文字居中对齐 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* 文字阴影 */
  letter-spacing: 1px; /* 字符间距 */
  line-height: 1.2; /* 行高 */
}
</style>
