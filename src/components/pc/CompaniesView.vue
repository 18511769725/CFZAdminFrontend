<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.companyname"
          clearable
          placeholder="企业名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.contact"
          clearable
          placeholder="联系人"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.telnumber"
          clearable
          placeholder="联系方式"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.channel"
          clearable
          placeholder="入库渠道"
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
          >新建企业</el-button
        >
        <el-button
          type="primary"
          @click="insertCompanies"
          style="margin-left: 25px"
          >批量插入</el-button
        >
        <el-button type="primary" @click="testmd5" style="margin-left: 25px"
          >test</el-button
        >
      </div>
      <el-table
        :data="state.gamelist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onCompanyTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="20%" />
        <el-table-column
          fixed
          prop="companyname"
          label="企业名称"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="address"
          label="注册地址"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="registeredcapital"
          label="注册资本"
          min-width="30%"
        />
        <el-table-column fixed prop="contact" label="联系人" min-width="30%" />
        <el-table-column
          fixed
          prop="telnumber"
          label="联系方式"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="channel"
          label="入库渠道"
          min-width="30%"
        />
        <el-table-column
          fixed
          prop="createtime"
          label="入库时间"
          min-width="30%"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>
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
        <el-form-item label="企业名称" prop="companyname" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.companyname"
            placeholder="企业名称"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="注册地址" prop="address" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.address"
            placeholder="注册地址"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="注册资本" prop="registeredcapital">
          <el-input
            style="width: 300px"
            v-model.trim="state.companyInfoForm.registeredcapital"
            placeholder="注册资本"
          />
        </el-form-item>
        <el-form-item label="入库渠道" prop="channel">
          <el-input
            style="width: 300px"
            v-model.trim="state.companyInfoForm.channel"
            placeholder="入库渠道为统计指标项，必填"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="联系人" prop="contact">
          <el-input
            style="width: 300px"
            v-model.trim="state.companyInfoForm.contact"
            placeholder="联系人姓名"
          />
        </el-form-item>
        <el-form-item label="职位信息" prop="title">
          <el-input
            style="width: 300px"
            v-model.trim="state.companyInfoForm.title"
            placeholder="联系人职位"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="telnumber">
          <el-input
            style="width: 300px"
            v-model.trim="state.companyInfoForm.telnumber"
            placeholder="联系方式"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item
          label="企业简介"
          prop="companydesc"
          style="width: 90%; line-height: 50px"
        >
          <el-input
            v-model.trim="state.companyInfoForm.companydesc"
            placeholder="企业信息摘要"
            maxlength="300"
            show-word-limit
            type="textarea"
            style="height: 100px"
            input-style="height: 85px;"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item
          label="备注"
          prop="extrainfo"
          style="width: 90%; line-height: 50px"
        >
          <el-input
            v-model.trim="state.companyInfoForm.extrainfo"
            placeholder="备注信息"
            maxlength="300"
            show-word-limit
            type="textarea"
            style="height: 100px"
            input-style="height: 85px;"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer-wrapper">
        <!-- <el-button
          v-if="state.companyInfoForm.id"
          type="danger"
          @click="deleteProject"
          >删除项目</el-button
        >
        <div /> -->
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
  gamelist: [],
  showCompanyInfoDialog: false,
  showUploadFileDialog: false,
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    companyname: "",
    contact: "",
    telnumber: "",
    channel: "",
  },
  companyInfoForm: {
    id: "",
    companyname: "",
    address: "",
    registeredcapital: "",
    contact: "",
    title: "",
    telnumber: "",
    channel: "",
    companydesc: "",
    extrainfo: "",
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
  state.companyInfoForm.companyname = row.companyname;
  state.companyInfoForm.address = row.address;
  state.companyInfoForm.registeredcapital = row.registeredcapital;
  state.companyInfoForm.contact = row.contact;
  state.companyInfoForm.title = row.title;
  state.companyInfoForm.telnumber = row.telnumber;
  state.companyInfoForm.channel = row.channel;
  state.companyInfoForm.companydesc = row.companydesc;
  state.companyInfoForm.extrainfo = row.extrainfo;
  state.showCompanyInfoDialog = true;
};

const testmd5 = () => {
  let payload = {};
  request.post("/user/testmd5", payload).then((res) => {
    if (res) {
      console.log(res);
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

const handleFollow = (rowinfo) => {
  let payload = {
    id: rowinfo.id,
    followvalue: 1,
  };
  request.post("/updatefollow", payload).then((res) => {
    if (res) {
      getCompanies();
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
  state.companyInfoForm.address = "";
  state.companyInfoForm.registeredcapital = "";
  state.companyInfoForm.contact = "";
  state.companyInfoForm.title = "";
  state.companyInfoForm.telnumber = "";
  state.companyInfoForm.channel = "";
  state.companyInfoForm.companydesc = "";
  state.companyInfoForm.extrainfo = "";
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
    !state.companyInfoForm.companyname ||
    !state.companyInfoForm.contact ||
    !state.companyInfoForm.channel
  ) {
    ElMessageBox.alert("企业名称，联系人姓名及入库渠道为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = state.companyInfoForm.id
    ? "是否要更新项目信息?"
    : "是否要创建新项目?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updatecompany", state.companyInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "项目数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getCompanies();
            resetForm();
            state.showCompanyInfoDialog = false;
          } else {
            ElMessage.error("更新项目数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新项目数据失败！");
    });
};

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getCompanies();
};

const getCompanies = () => {
  request.post("/getcompanies", state.getInfoParams).then((res) => {
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
