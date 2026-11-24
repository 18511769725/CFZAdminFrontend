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
          prop="creditcode"
          label="信用代码"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="bcompanycpname"
          label="企业联系人"
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
        <el-table-column fixed prop="status" label="签约状态" min-width="30%">
          <template #default="scope">
            {{ showcontractstatus(scope.row.contractsigned) }}
          </template>
        </el-table-column>
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
        <el-form-item label="商户名称" prop="companyname" style="width: 60%">
          <el-input
            v-model.trim="state.companyInfoForm.companyname"
            placeholder="企业名称"
          />
        </el-form-item>
        <el-form-item label="商户简称" prop="shortname" style="width: 30%">
          <el-input
            v-model.trim="state.companyInfoForm.shortname"
            placeholder="商户简称,2-5个字"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="信用编码" prop="creditcode" style="width: 60%">
          <el-input
            v-model.trim="state.companyInfoForm.creditcode"
            placeholder="信用编码"
          />
        </el-form-item>
        <el-form-item label="签约状态" prop="contractsigned" style="width: 30%">
          <el-select
            v-model="state.companyInfoForm.contractsigned"
            placeholder="签约状态"
          >
            <el-option label="推进中" value="0" />
            <el-option label="已签约" value="1" />
            <el-option label="已解约" value="-1" />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="联系人" prop="bcompanycpname" style="width: 30%">
          <el-input
            v-model.trim="state.companyInfoForm.bcompanycpname"
            placeholder="姓名"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="bcompanycpphone" style="width: 30%">
          <el-input
            v-model.trim="state.companyInfoForm.bcompanycpphone"
            placeholder="手机号"
          />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="bcompanycpmail" style="width: 30%">
          <el-input
            v-model.trim="state.companyInfoForm.bcompanycpmail"
            placeholder="电子邮箱"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="账户信息" prop="accountinfo" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.accountinfo"
            placeholder="账户信息"
            type="textarea"
            :rows="8"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="项目专员姓名" prop="agentname" style="width: 30%">
          <el-input
            v-model.trim="state.companyInfoForm.agentname"
            placeholder="项目专员姓名"
          />
        </el-form-item>
        <el-form-item
          label="项目专员手机号"
          prop="agentphone"
          style="width: 30%"
        >
          <el-input
            v-model.trim="state.companyInfoForm.agentphone"
            placeholder="项目专员手机号"
          />
        </el-form-item>
      </div>
      <div class="upload-layer-wrapper">
        <div class="upload-layer upload-layer-top">
          <div class="upload-layer-title">项目专员微信二维码</div>
          <el-upload
            v-model:file-list="state.agentweixinpicList"
            :action="store.state.getImgurlApi"
            list-type="picture-card"
            :limit="1"
            :on-exceed="handleImageExceed"
            :on-success="handleUploadFileOver"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemoveImg"
            :before-upload="beforeAvatarUpload"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
              "
            >
              <div class="line-wrapper" style="justify-content: center">
                <el-icon><Plus /></el-icon>
              </div>
              <p>点击上传专员微信二维码</p>
            </div>
          </el-upload>
        </div>
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
  <!-- <el-dialog
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
  </el-dialog> -->
  <!-- 查看图片窗体 -->
  <el-dialog
    v-model="state.dialogViewPicVisible"
    class="dialog-preview"
    title="图片预览"
    :close-on-click-modal="true"
  >
    <img
      style="width: 100%; height: 100%; object-fit: contain"
      :src="state.curDialogImageUrl"
      alt="Preview Image"
    />
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
  agentweixinpicList: [],
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
    creditcode: "",
    accountinfo: "",
    contractsigned: "0",
    agentname: "",
    agentphone: "",
    agentweixinpic: "",
    shortname: "",
  },
  uploadFileForm: {
    fileid: "110",
    department: "0",
    uploaderid: "",
  },
  uploadFileList: [],
  dialogViewPicVisible: false,
  curDialogImageUrl: "",
});

const handleUploadFileOver = (res) => {
  if (res.status === 200) {
    state.companyInfoForm.agentweixinpic = res.imgurl;
  } else {
    ElMessage.error("请选择1M以下的图片文件！");
  }
};
const handlePictureCardPreview = (uploadedFile) => {
  state.curDialogImageUrl = uploadedFile.url;
  state.dialogViewPicVisible = true;
};
const handleRemoveImg = (uploadFile, uploadFiles) => {
  state.companyInfoForm.agentweixinpic = "";
  state.agentweixinpicList = uploadFiles;
};

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("Picture size can not exceed 10MB!");
    return false;
  }
  return true;
};

const handleImageExceed = () => {
  ElMessage.warning("最多只能上传一张图片");
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.companyInfoForm.id = row.id;
  state.companyInfoForm.companyname = row.bcompanyname;
  state.companyInfoForm.bcompanycpname = row.bcompanycpname;
  state.companyInfoForm.bcompanycpphone = row.bcompanycpphone;
  state.companyInfoForm.bcompanycpmail = row.bcompanycpmail;
  state.companyInfoForm.creditcode = row.creditcode;
  state.companyInfoForm.contractsigned = String(row.contractsigned ?? "0");
  state.companyInfoForm.accountinfo = row.accountinfo;
  state.companyInfoForm.agentname = row.agentname;
  state.companyInfoForm.agentphone = row.agentphone;
  state.companyInfoForm.agentweixinpic = row.agentweixinpic;
  state.agentweixinpicList = row.agentweixinpic
    ? [{ name: "专员微信二维码", url: row.agentweixinpic }]
    : [];
  state.companyInfoForm.shortname = row.shortname;
  state.showCompanyInfoDialog = true;
};

const showstatus = (status) => {
  if (status === 1) {
    return "在线";
  } else {
    return "已下线";
  }
};

const showcontractstatus = (contractsigned) => {
  if (contractsigned === 0 || contractsigned === "0") {
    return "推进中";
  } else if (contractsigned === 1 || contractsigned === "1") {
    return "已签约";
  } else {
    return "已解约";
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
  state.companyInfoForm.contractsigned = "0";
  state.companyInfoForm.creditcode = "";
  state.companyInfoForm.accountinfo = "";
  state.companyInfoForm.agentname = "";
  state.companyInfoForm.agentphone = "";
  state.companyInfoForm.agentweixinpic = "";
  state.companyInfoForm.shortname = "";
  state.agentweixinpicList = [];
};
const resetFileUploadDialogForm = () => {
  state.uploadFileList = [];
};

const abortSaveCompanyInfo = () => {
  resetForm();
  state.showCompanyInfoDialog = false;
};

const saveCompanyInfo = () => {
  if (!state.companyInfoForm.companyname || !state.companyInfoForm.shortname) {
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

.upload-layer-wrapper {
  width: 95%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.upload-layer {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 14px 16px;
}

.upload-layer-top {
  background-color: #f8fbff;
}

.upload-layer-bottom {
  background-color: #f9fbf6;
}

.upload-layer-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.img-column {
  width: 100px; /* 宽度 */
  height: 80px; /* 高度 */
  object-fit: cover; /* 保持比例，裁剪多余部分 */
  border-radius: 4px; /* 可选：圆角 */
}
.el-input-number {
  width: 100%;
}
:deep(.el-textarea__inner) {
  min-height: 240px !important;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  color: #8c939d;
  width: 178px;
  height: 178px;
  background: #f4f4f5;
  /* text-align: center; */
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  font-size: 16px;
  border: 1px solid #d7d7dc;
}

:deep(.dialog-preview) {
  /* 1. 限制弹窗最大宽高为屏幕的 50% */
  max-width: 50vw !important; /* vw：视口宽度的 1%，50vw 即屏幕宽度 50% */
  max-height: 50vh !important; /* vh：视口高度的 1%，50vh 即屏幕高度 50% */
  width: fit-content; /* 宽度自适应内容，不超出 max-width */
  height: fit-content; /* 高度自适应内容，不超出 max-height */
}

/* 优化弹窗主体容器，避免内容溢出 */
:deep(.dialog-preview .el-dialog__body) {
  padding: 0; /* 移除默认内边距，让图片全屏展示 */
  max-height: calc(50vh - 60px); /* 扣除弹窗标题栏高度，避免超出整体最大高度 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 2. 实现弹窗垂直+水平居中（el-dialog 默认水平居中，补充垂直居中） */
:deep(.el-dialog__wrapper) {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中（兜底，确保兼容性） */
}

.img-placeholder {
  width: 100px;
  height: 80px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}
</style>
