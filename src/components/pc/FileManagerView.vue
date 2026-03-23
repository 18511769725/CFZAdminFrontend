<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-upload
          v-model:file-list="state.fileTempList"
          class="upload-demo"
          :action="store.state.uploadApi"
          :data="state.uploadFileListParams"
          :on-success="handleUploadFileOver"
          :limit="1"
          :on-exceed="handleExceed"
        >
          <el-button type="primary">点击上传文件</el-button>
        </el-upload>
        <el-button
          type="primary"
          @click="state.showUploadDialog = 1"
          style="display: none"
          >点击上传文件2</el-button
        >
        <!-- <el-select
          v-model="state.getFileListParams.sharetype"
          class="m-2"
          placeholder="授权范围"
          size="default"
          style="width: 160px;"
          @change="getFileData"
        >
          <el-option
            v-for="item in state.sharetypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
        <el-input
          v-model="state.getFileListParams.filename"
          clearable
          placeholder="检索匹配文件名"
          style="width: 240px; height: 32px; margin-left: 15px"
        />
        <el-button type="primary" @click="getFileData" style="margin-left: 15px"
          >点击查询</el-button
        >
        <el-checkbox-group
          v-model="state.getFileListParams.checkDoctypeList"
          style="margin-left: 15px"
          @change="handleDoctypeChange"
        >
          <el-checkbox label="word" value="1" />
          <el-checkbox label="excel" value="2" />
          <el-checkbox label="ppt" value="3" />
          <el-checkbox label="pdf" value="4" />
          <el-checkbox label="图片" value="5" />
          <el-checkbox label="压缩包" value="6" />
          <el-checkbox label="其它" value="101" />
        </el-checkbox-group>
      </div>
      <el-table :data="state.filelist" style="width: 100%">
        <el-table-column fixed prop="name" label="文件名" min-width="70%" />
        <el-table-column prop="uploader" label="发布人" min-width="20%">
          <template #default="scope">
            {{ getOwnerText(scope.row.uploader) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="state.showPics"
          prop="pics"
          label="缩略图"
          min-width="20%"
        >
          <template #default="scope">
            <img
              class="fixed-width-height"
              :src="scope.row.imgurl"
              alt="图片缩放"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column prop="sharetype" label="授权范围" min-width="35%">
          <template #default="scope">
            <el-select
              v-model="scope.row.sharetype"
              class="m-2"
              placeholder="授权范围"
              size="large"
              style="width: 160px"
              :loading="state.shareTypeLoading"
              @change="handleShareTypeChange(scope.row)"
            >
              <el-option
                v-for="item in state.sharetypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="last_modify_time"
          label="更新时间"
          min-width="30%"
        >
          <template #default="scope">
            {{ getTimeText(scope.row.last_modify_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button type="primary" @click="handelDeleteFile(scope.row)"
              >删除文件</el-button
            >
            <el-button type="primary" @click="handleDownload(scope.row)"
              >下载文件</el-button
            >
            <el-button type="primary" @click="handleShare(scope.row)"
              >分享转发</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="state.getFileListParams.currentPage"
        :page-size="state.getFileListParams.pageSize"
        layout="total, prev, pager, next"
        :total="state.getFileListParams.totalCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <!-- 上传文件模态窗口 -->
  <el-dialog v-model="state.showUploadDialog" width="60%" :show-close="false">
    <div class="line-wrapper">
      <el-upload
        ref="uploadRef"
        v-model:file-list="state.fileTempList"
        class="upload-component"
        :action="store.state.uploadApi"
        :data="state.uploadFileListParams"
        :on-success="handleUploadFileOver"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
      >
        <el-button
          type="primary"
          style="text-align: left"
          @click="clearSelectedFile"
          >浏览文件</el-button
        >
      </el-upload>
    </div>

    <template #footer>
      <span style="margin-top: 100px">
        <el-button @click="abortUpload">取消</el-button>
        <el-button type="primary" @click="doUpload"> 保存 </el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 配置转发模态窗口 -->
  <el-dialog
    v-model="state.showShareUsersDialog"
    width="600px"
    :show-close="false"
  >
    <div class="line-wrapper">
      <p>请选择要分享的用户：</p>
    </div>
    <div class="line-wrapper">
      <el-select
        v-model="state.arrSelectedData"
        multiple
        clearable
        collapse-tags
        placeholder="Select"
        popper-class="custom-header"
        :max-collapse-tags="1"
        style="width: 300px"
      >
        <template #header>
          <el-checkbox
            v-model="state.checkAll"
            :indeterminate="state.indeterminate"
            @change="handleCheckAll"
          >
            All
          </el-checkbox>
        </template>
        <el-option
          v-for="item in state.arrUserListOfFile"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          :disabled="item.disabled"
        />
      </el-select>
    </div>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortShare">取消</el-button>
          <el-button type="primary" @click="doShare"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";

const uploadRef = ref();

import { download } from "../../utils/request";

const state = reactive({
  fileTempList: [],
  filelist: [],
  showUploadDialog: 0,
  showShareUsersDialog: 0,
  arrUserListOfFile: [],
  arrSelectedData: [],
  currentFileId: 0,
  showPics: false,
  checkAll: false, // 转发人列表全选状态
  getFileListParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    fileid: "1", // 文件管理页面上fileid固定写死为1
    uploaderid: store.state.userinfo.userid, // 仅作为当前用户id使用
    department: store.state.userinfo.department,
    sharetype: 1, // 筛选分享类型默认为我上传的文件
    filename: "",
    checkDoctypeList: ["1", "2", "3", "4", "6", "101"], // 默认不显示图片
  },
  uploadFileListParams: {
    // 文件管理数据结构
    fileid: "1", // 非项目绑定文件fileid统一设置为1
    uploaderid: store.state.userinfo.userid,
    department: store.state.userinfo.department,
  },
  sharetypes: [
    {
      label: "上传者本人",
      value: 1,
    },
    {
      label: "部门共享",
      value: 2,
    },
    {
      label: "全员共享",
      value: 3,
    },
  ],
  shareTypeLoading: false,
});

const handleDoctypeChange = () => {
  console.info("checkDoctypeList", state.getFileListParams.checkDoctypeList);
  if (
    state.getFileListParams.checkDoctypeList[
      state.getFileListParams.checkDoctypeList.length - 1
    ] == "5"
  ) {
    // 点选的是图片，则把其他类型都去掉
    state.getFileListParams.checkDoctypeList = ["5"];
    state.showPics = true;
  } else if (state.getFileListParams.checkDoctypeList.includes("5")) {
    state.getFileListParams.checkDoctypeList.splice(0, 1);
    state.showPics = false;
  }
  console.info("checkDoctypeList", state.getFileListParams.checkDoctypeList);
  getFileData(); // 重新拉取数据
};

const handleShareTypeChange = (rowinfo) => {
  console.info("rowinfo", rowinfo);
  let tip_text = "确认要调整文件分享范围?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      state.shareTypeLoading = true;
      let payload = {
        id: rowinfo.id,
        sharetypevalue: rowinfo.sharetype,
      };
      request.post("/updatesharetype", payload).then((res) => {
        if (res) {
          state.shareTypeLoading = false;
          getFileData();
        } else {
          getFileData();
          state.shareTypeLoading = false;
          ElMessage.error("调整文件分享范围失败！");
        }
      });
    })
    .catch(() => {
      getFileData();
      state.shareTypeLoading = false;
      ElMessage.error("调整文件分享范围失败！");
    });
};

const handelDeleteFile = (rowinfo) => {
  //console.info("deletefile", rowinfo);
  //console.info("userinfo", store.state.userinfo)

  // 公司副总及以上级别可以执行非本人删除
  if (
    parseInt(store.state.userinfo.level) >= 2 &&
    parseInt(store.state.userinfo.userid) !== parseInt(rowinfo.uploader)
  ) {
    ElMessageBox.alert("权限不足！", "删除文件失败", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = "确认要删除文件《" + rowinfo.name + "》 ?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
      };
      request.post("/deletefile", payload).then((res) => {
        if (res) {
          getFileData();
        } else {
          ElMessage.error("获取文件数据失败！");
        }
      });
    })
    .catch(() => {});
};
// 列表上点击分享按钮，拉起分享对话框
const handleShare = (rowinfo) => {
  state.currentFileId = rowinfo.id;
  state.showShareUsersDialog = 1;
  getUserListOfFile(rowinfo);
};

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getFileListParams.currentPage = pagenum;
  getFileData();
};

const getFileData = () => {
  request.post("/getfilelist", state.getFileListParams).then((res) => {
    if (res) {
      state.filelist = res.data;
      state.getFileListParams.totalCount = res.pageination.total_count;
      state.getFileListParams.currentPage = res.pageination.currentPage;

      // 扩展图片imgurl属性
      for (let i = 0; i < state.filelist.length; i++) {
        state.filelist[i].imgurl =
          "http://192.168.110.156/data/files/" + state.filelist[i].uuidname;
      }
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

// 文件上传完毕后刷新文件列表
const handleUploadFileOver = (res, file) => {
  if (res) {
    ElMessage.success({
      message: "上传成功!",
    });
    state.fileTempList = [];
    getFileData();
  } else {
    ElMessage.error({
      message: "上传失败，请重新上传",
    });
  }
};
// 下载文件
const handleDownload = (rowinfo) => {
  console.log(rowinfo.name);
  console.log(rowinfo.uuidname);
  let tip_text = "确认要下载文件《" + rowinfo.name + "》 ?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        uuidname: rowinfo.uuidname,
        filename: rowinfo.name,
      };
      // 发起下载请求
      download("/download", payload, rowinfo.name);
    })
    .catch(() => {});
};

// 渲染表格项目负责人列
const getOwnerText = (userid) => {
  for (let i = 0; i < store.state.userlist.length; i++) {
    if (userid === store.state.userlist[i].id) {
      return store.state.userlist[i].name;
    }
  }
  return "";
};

// 渲染表格子任务更新时间列
const getTimeText = (datetime) => {
  return timestamp2datetime(datetime);
};

const handleExceed = () => {
  return;
};
// 上传控制部分
const abortUpload = () => {
  state.fileTempList = [];
  state.showUploadDialog = 0;
};

const clearSelectedFile = () => {
  state.fileTempList = [];
};

const doUpload = () => {
  if (state.fileTempList.length === 0) {
    ElMessageBox.alert("您还没有选择要上传的文件！", "请选择文件", {
      confirmButtonText: "OK",
    });
    return;
  }
  uploadRef.value.submit();
};
// 分享控制部分
// 放弃分享
const abortShare = () => {
  let tip_text = "确认要取消分享？";
  const result = new Promise((resolve, reject) => {
    ElMessageBox.confirm(tip_text, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        state.arrSelectedData = [];
        state.showShareUsersDialog = 0;
        state.currentFileId = 0;
      })
      .catch(() => {
        //reject(false);
      });
  });
  return result;
};
// 确认分享
const doShare = () => {
  // 检测转发列表是否为空
  if (state.arrSelectedData.length === 0) {
    ElMessageBox.alert("您还没有选择要分享的用户！", "请选择用户", {
      confirmButtonText: "OK",
    });
    return;
  }
  // 执行转发
  console.info("state.arrSelectedData", state.arrSelectedData);

  let payload = {
    fileid: state.currentFileId,
    userlist: state.arrSelectedData,
  };
  request
    .post("/postshare", payload)
    .then((res) => {
      if (res && res.retcode === "200") {
        state.arrSelectedData = [];
        state.showShareUsersDialog = 0;
        state.currentFileId = 0;
        ElMessage.success({ message: "分享文件完成!" });
      } else {
      }
    })
    .catch(() => {});
};
// 页面加载时从全局变量获取简化用户信息
const getSimpleUserList = () => {
  // 首先获取人员信息列表
  state.arrUserListOfFile = store.state.userlist
    .map(({ id, name, status }) => ({ id, name, status }))
    .filter((item) => item.status === 0);

  // 初始化选择和已分享状态值
  for (let i = 0; i < state.arrUserListOfFile.length; i++) {
    let item = state.arrUserListOfFile[i];
    item.disabled = false;
    item.selected = false;
  }

  console.info("state.arrUserListOfFile", state.arrUserListOfFile);
};
const getUserListOfFile = (rowinfo) => {
  // 初始化选择和已分享状态值
  for (let i = 0; i < state.arrUserListOfFile.length; i++) {
    let item = state.arrUserListOfFile[i];
    item.disabled = false;
    item.selected = false;
  }

  let params = {
    fileid: rowinfo.id,
  };
  // 通过文件id获取文件uuid名字，进而获取全部该文件的有权限用户列表
  request.post("/getfileuserlist", params).then((res) => {
    if (res) {
      console.info("res", res);
      for (let i = 0; i < res.data.length; i++) {
        for (
          let userindex = 0;
          userindex < state.arrUserListOfFile.length;
          userindex++
        ) {
          if (res.data[i].receiver === state.arrUserListOfFile[userindex].id) {
            state.arrUserListOfFile[userindex].disabled = true;
            continue;
          }
        }
      }
    } else {
      state.arrUserListOfFile = [];
    }
  });
};

const handleCheckAll = (select) => {
  // arrUserListOfFile
  // arrSelectedData
  state.arrSelectedData = [];
  if (select) {
    for (let i = 0; i < state.arrUserListOfFile.length; i++) {
      if (!state.arrUserListOfFile[i].disabled) {
        state.arrSelectedData.push(state.arrUserListOfFile[i].id);
      }
    }
  }

  console.info("state.arrSelectedData", state.arrSelectedData);
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getFileData();
  getSimpleUserList();
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

.upload-component {
  width: 80%;
  text-align: left;
}
.dialog-footer-wrapper {
  width: 90;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.fixed-width-height {
  width: 150px; /* 设置固定宽度 */
  height: 100px; /* 设置固定高度 */
  object-fit: scale-down; /* 保持图片本身的宽高比 */
}
</style>
