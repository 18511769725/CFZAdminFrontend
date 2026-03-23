<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.companyname"
          clearable
          placeholder="商户名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-button
          type="primary"
          @click="getCompanies"
          style="margin-left: 25px"
          >点击查询</el-button
        >
        <el-button
          type="primary"
          @click="createCompany"
          style="margin-left: 25px"
          >新建商户</el-button
        >
        <!-- <el-button type="primary" @click="getProjectList">
          获取房源项目列表
        </el-button>
        <el-button type="primary" @click="getProjectDetail">
          获取项目详情
        </el-button>
        <el-button type="primary" @click="getHouseDetail">
          获取房源详情
        </el-button> -->
      </div>
      <el-table
        :data="state.companylist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onCompanyTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="20%" />
        <el-table-column
          fixed
          prop="bcompanyname"
          label="企业名称"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="bcompanycpname"
          label="姓名"
          min-width="20%"
        />
        <el-table-column
          fixed
          prop="bcompanycpphone"
          label="手机号"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="bcompanycpmail"
          label="电子邮箱"
          min-width="30%"
        />
        <el-table-column fixed prop="status" label="商户状态" min-width="30%">
          <template #default="scope">
            {{ showstatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button
              type="danger"
              v-if="scope.row.status === 0"
              @click="handleOnline(scope.row)"
              >商户上线</el-button
            >
            <el-button
              type="success"
              v-if="scope.row.status === 1"
              @click="handleOffline(scope.row)"
              >商户下线</el-button
            >
          </template>
        </el-table-column>
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
  <!-- 企业信息模态窗口 -->
  <el-dialog
    v-model="state.showCompanyInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.companyInfoForm.id ? "修改企业信息" : "创建企业信息"
      }}</span>
    </div>
    <el-form :model="state.companyInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="商户名称" prop="companyname" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.companyname"
            placeholder="企业名称"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="姓名" prop="bcompanycpname" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.bcompanycpname"
            placeholder="姓名"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="手机号" prop="bcompanycpphone" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.bcompanycpphone"
            placeholder="手机号"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="电子邮箱" prop="bcompanycpmail" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.bcompanycpmail"
            placeholder="电子邮箱"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortSaveCompanyInfo">取消</el-button>
          <el-button type="primary" @click="saveCompanyInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <!-- 项目文件管理模态窗口 -->
  <el-dialog
    v-model="state.showUploadFileDialog"
    width="50%"
    :show-close="true"
    @close="resetProjFileForm"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        "项目相关文件管理"
      }}</span>
    </div>

    <div class="line-wrapper-center">
      <el-upload
        class="upload-demo"
        v-model:file-list="state.uploadFileList"
        drag
        :action="store.state.uploadApi"
        :data="state.uploadFileForm"
        :on-success="handleUploadFileOver"
        :on-preview="handleDownload"
        :before-remove="handleRemoveFile"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到线框内 或者 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">文件列表</div>
        </template>
      </el-upload>
    </div>
  </el-dialog>
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
  companylist: [],
  showCompanyInfoDialog: false,
  showUploadFileDialog: false,
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    companyname: "",
  },
  companyInfoForm: {
    id: "",
    companyname: "",
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  },
  uploadFileForm: {
    fileid: "110",
    department: "0",
    uploaderid: "",
  },
  uploadFileList: "",
});

const handleUploadFileOver = () => {
  getCompanies();
  resetFileUploadDialogForm();
  state.showUploadFileDialog = false;
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.companyInfoForm.id = row.id;
  state.companyInfoForm.companyname = row.bcompanyname;
  state.companyInfoForm.bcompanycpname = row.bcompanycpname;
  state.companyInfoForm.bcompanycpphone = row.bcompanycpphone;
  state.companyInfoForm.bcompanycpmail = row.bcompanycpmail;
  state.showCompanyInfoDialog = true;
};

const showstatus = (status) => {
  if (status === 1) {
    return "在线";
  } else {
    return "已下线";
  }
};

const handleOnline = (rowinfo) => {
  let tip_text = "确认要上线商户?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 1,
      };
      request.post("/changebcompanystatus", payload).then((res) => {
        if (res) {
          getCompanies();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOffline = (rowinfo) => {
  let tip_text = "确认要下线商户?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 0,
      };
      request.post("/changebcompanystatus", payload).then((res) => {
        if (res) {
          getCompanies();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const getProjectList = () => {
  // 设置header中的username和password参数
  request
    .post(
      "https://cyaj-web-server.bjjmdf.com/pc/dataSync/getProjectListInfo",
      {},
      {
        headers: {
          username: "allWin",
          password: "J@dcfm*",
        },
      },
    )
    .then((res) => {
      if (res) {
        console.log("房源列表：", res);
        ElMessage({
          message: "获取房源列表成功",
          type: "success",
        });
      } else {
        ElMessage.error("获取房源列表失败！");
      }
    });
};

const getProjectDetail = () => {
  const formData = new FormData();
  formData.append("dataId", 538022933372997);

  // 设置header中的username和password参数
  request
    .post(
      "https://cyaj-web-server.bjjmdf.com/pc/dataSync/getProjectDataInfo",
      formData,
      {
        headers: {
          username: "allWin",
          password: "J@dcfm*",
        },
      },
    )
    .then((res) => {
      if (res) {
        console.log("房源列表：", res);
        ElMessage({
          message: "获取房源列表成功",
          type: "success",
        });
      } else {
        ElMessage.error("获取房源列表失败！");
      }
    });
};

// getHouseDetail
const getHouseDetail = () => {
  const formData = new FormData();
  formData.append("houseTypeId", 705116717281349);
  // 设置header中的username和password参数
  request
    .post(
      "https://cyaj-web-server.bjjmdf.com/pc/dataSync/getHouseTypeDataInfo",
      formData,
      {
        headers: {
          username: "allWin",
          password: "J@dcfm*",
        },
      },
    )
    .then((res) => {
      if (res) {
        console.log("房源列表：", res);
        ElMessage({
          message: "获取房源列表成功",
          type: "success",
        });
      } else {
        ElMessage.error("获取房源列表失败！");
      }
    });
};
const createCompany = () => {
  resetForm();
  state.showCompanyInfoDialog = true;
};
const insertCompanies = () => {
  resetFileUploadDialogForm();
  state.uploadFileForm.fileid = "110";
  state.uploadFileForm.department = "0";
  state.uploadFileForm.uploaderid = store.state.userinfo.userid;
  state.showUploadFileDialog = true;
};
// 清除企业信息窗体数据
const resetForm = () => {
  state.companyInfoForm.id = "";
  state.companyInfoForm.companyname = "";
  state.companyInfoForm.bcompanycpname = "";
  state.companyInfoForm.bcompanycpphone = "";
  state.companyInfoForm.bcompanycpmail = "";
};
const resetFileUploadDialogForm = () => {
  state.uploadFileList = "";
};

const abortSaveCompanyInfo = () => {
  resetForm();
  state.showCompanyInfoDialog = false;
};

const saveCompanyInfo = () => {
  if (
    !state.companyInfoForm.companyname
    // !state.companyInfoForm.contact ||
    // !state.companyInfoForm.channel
  ) {
    ElMessageBox.alert("企业名称为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = state.companyInfoForm.id
    ? "是否要更新商户信息?"
    : "是否要创建新商户?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updatebcompany", state.companyInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "商户数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getCompanies();
            resetForm();
            state.showCompanyInfoDialog = false;
          } else {
            ElMessage.error("更新商户数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新商户数据失败！");
    });
};

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getCompanies();
};

const getCompanies = () => {
  request.post("/getbcompanies", state.getInfoParams).then((res) => {
    if (res) {
      state.companylist = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getCompanies();
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
