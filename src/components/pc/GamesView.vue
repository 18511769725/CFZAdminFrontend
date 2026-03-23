<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.gamename"
          clearable
          placeholder="游戏名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.publishername"
          clearable
          placeholder="检索出版单位"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.operatorname"
          clearable
          placeholder="检索运营单位"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.patchname"
          clearable
          placeholder="检索匹配批次"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-button type="primary" @click="getGames" style="margin-left: 25px"
          >点击查询</el-button
        >
      </div>
      <el-table
        :data="state.gamelist"
        style="width: 100%; height: calc(100vh - 240px)"
      >
        <el-table-column fixed prop="id" label="序号" min-width="20%" />
        <el-table-column
          fixed
          prop="gamename"
          label="游戏名称"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="publisher"
          label="出版单位"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="operator"
          label="运营单位"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="approveid"
          label="批复文号"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="publishid"
          label="出版物号"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="approvedate"
          label="批准时间"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="approvepatch"
          label="审批批次"
          min-width="30%"
        />
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
</template>

<script setup>
import { ref, reactive } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";

import { download } from "../../utils/request";

const state = reactive({
  fileTempList: [],
  gamelist: [],
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

const handleFollow = (rowinfo) => {
  let payload = {
    id: rowinfo.id,
    followvalue: 1,
  };
  request.post("/updatefollow", payload).then((res) => {
    if (res) {
      getGames();
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};
const handleUnFollow = (rowinfo) => {
  let tip_text = "确认要取消关注 ?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        followvalue: 0,
      };
      request.post("/updatefollow", payload).then((res) => {
        if (res) {
          getGames();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

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
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getGames();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  margin-top: 15px;
  height: 64px;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.ml-4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-left: 5px;
}

.content-wrapper {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.table-wrapper {
  width: 100%;
}

.pagination-wrapper {
  width: 90%;
  padding: 0 0 15px 15px;
}

.table-fold-wrapper {
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 0 0 15px;
}

.fold-line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.line-wrapper-center {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.upload-demo {
  width: 160px;
}
</style>
