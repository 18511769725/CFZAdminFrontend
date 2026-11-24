<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.name"
          clearable
          placeholder="姓名"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.phone"
          clearable
          placeholder="手机号"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.companyname"
          clearable
          placeholder="企业名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.companycreditcode"
          clearable
          placeholder="统一社会信用编码"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-button type="primary" @click="getUsers" style="margin-left: 25px"
          >点击查询</el-button
        >
        <el-button type="primary" @click="createUser" style="margin-left: 25px"
          >创建用户信息</el-button
        >
      </div>
      <el-table
        :data="state.userlist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onUserTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="10%" />
        <el-table-column prop="name" label="姓名" min-width="20%" />
        <el-table-column prop="phone" label="手机号" min-width="20%" />
        <el-table-column prop="email" label="电子邮箱" min-width="20%" />
        <el-table-column prop="ccompanyname" label="企业名称" min-width="20%" />
        <el-table-column
          prop="companycreditcode"
          label="企业统一社会信用编码"
          min-width="30%"
        />
        <el-table-column prop="isadmin" label="身份角色" min-width="20%">
          <template #default="scope">
            {{ showcharactor(scope.row.isadmin) }}
          </template>
        </el-table-column>
        <el-table-column prop="createtime" label="创建时间" min-width="30%">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="账户状态" min-width="30%">
          <template #default="scope">
            {{ showstatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="20%">
          <template #default="scope">
            <el-button
              type="danger"
              v-if="scope.row.status === 1 || scope.row.status === -1"
              @click="handleOnline(scope.row)"
              >激活账户</el-button
            >
            <el-button
              type="success"
              v-if="scope.row.status === 2"
              @click="handleOffline(scope.row)"
              >封禁账户</el-button
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
    v-model="state.showUserInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.userInfoForm.id ? "修改账号信息" : "创建账号信息"
      }}</span>
    </div>
    <el-form :model="state.userInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="姓名" prop="name" style="width: 90%">
          <el-input v-model.trim="state.userInfoForm.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" style="width: 90%">
          <el-input
            v-model.trim="state.userInfoForm.phone"
            placeholder="手机号"
          />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email" style="width: 90%">
          <el-input
            v-model.trim="state.userInfoForm.email"
            placeholder="电子邮箱"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="企业名称" prop="companyname" style="width: 90%">
          <el-select
            v-model="state.userInfoForm.ccompanyid"
            placeholder="请选择企业名称"
            filterable
          >
            <el-option
              v-for="item in state.companynames"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职务" prop="title" style="width: 90%">
          <el-input
            v-model.trim="state.userInfoForm.title"
            placeholder="职务"
          />
        </el-form-item>
        <el-form-item label="身份角色" prop="isadmin" style="width: 90%">
          <el-select
            v-model="state.userInfoForm.isadmin"
            placeholder="请选择身份角色"
          >
            <el-option
              v-for="item in state.charactors"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortSaveUserInfo">取消</el-button>
          <el-button type="primary" @click="saveUserInfo"> 保存 </el-button>
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
  userlist: [],
  showUserInfoDialog: false,
  companynames: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    name: "",
    phone: "",
    companyname: "",
    companycreditcode: "",
  },
  userInfoForm: {
    id: "",
    name: "",
    phone: "",
    title: "",
    email: "",
    ccompanyid: "",
    ccompanyname: "",
    consumerecords: [],
    cargorecords: [],
    status: 0,
    isadmin: 0,
  },
  charactors: [
    { label: "普通用户", value: 0 },
    { label: "审核员", value: 1 },
  ],
});

const getAllCCompanynames = () => {
  let payload = {};
  request.post("/getccompaniesnames", payload).then((res) => {
    if (res) {
      state.companynames = res.data;
    } else {
      ElMessage.error("获取企业名称列表失败！");
    }
  });
};

const onUserTableRowDBClicked = (row, column, event) => {
  state.userInfoForm.id = row.id;
  state.userInfoForm.name = row.name;
  state.userInfoForm.phone = row.phone;
  state.userInfoForm.email = row.email;
  state.userInfoForm.title = row.title;
  state.userInfoForm.ccompanyid = row.ccompanyid;
  state.userInfoForm.ccompanyname = row.ccompanyname;
  state.userInfoForm.status = row.status;
  state.userInfoForm.isadmin = row.isadmin;
  // let arr_rewardrecords = JSON.parse(row.rewardrecords || "[]");

  state.showUserInfoDialog = true;
};

const showstatus = (status) => {
  if (status === 0) {
    return "信息不全";
  } else if (status === 1) {
    return "待审批";
  } else if (status === 2) {
    return "已授权";
  } else if (status === -1) {
    return "已驳回/封禁";
  }
};

const showcharactor = (isadmin) => {
  if (isadmin === 0) {
    return "普通用户";
  } else if (isadmin === 1) {
    return "审核员";
  }
};

const handleOnline = (rowinfo) => {
  let tip_text = "确认要授权采购?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 2,
      };
      request.post("/changecuserstatus", payload).then((res) => {
        if (res && res.retcode === "200") {
          getUsers();
        } else if ((res && res.retcode === "1002") || res.retcode === "1001") {
          ElMessage.error("用户填写企业信用编码异常，状态变更失败！");
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOffline = (rowinfo) => {
  let tip_text = "确认要封禁用户?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: -1,
      };
      request.post("/changecuserstatus", payload).then((res) => {
        if (res) {
          getUsers();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const createUser = () => {
  resetForm();
  state.showUserInfoDialog = true;
};

// 清除企业信息窗体数据
const resetForm = () => {
  state.userInfoForm.id = "";
  state.userInfoForm.name = "";
  state.userInfoForm.phone = "";
  state.userInfoForm.title = "";
  state.userInfoForm.email = "";
  state.userInfoForm.ccompanyid = "";
  state.userInfoForm.ccompanyname = "";
  state.userInfoForm.consumerecords = [];
  state.userInfoForm.cargorecords = [];
  state.userInfoForm.status = 0;
  state.userInfoForm.isadmin = 0;
};

const abortSaveUserInfo = () => {
  resetForm();
  state.showUserInfoDialog = false;
};

const saveUserInfo = () => {
  if (!state.userInfoForm.name) {
    ElMessageBox.alert("姓名为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.userInfoForm.phone) {
    ElMessageBox.alert("手机号为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.userInfoForm.email) {
    ElMessageBox.alert("邮箱为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.userInfoForm.ccompanyid) {
    ElMessageBox.alert("请绑定企业信息！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.userInfoForm.title) {
    ElMessageBox.alert("职位为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.userInfoForm.id
    ? "是否要更新用户信息?"
    : "是否要创建新用户?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updatecusers", state.userInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "用户数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getUsers();
            resetForm();
            state.showUserInfoDialog = false;
          } else {
            ElMessage.error("更新用户数据失败！");
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
  getUsers();
};

const getUsers = () => {
  request.post("/getcusers", state.getInfoParams).then((res) => {
    if (res) {
      state.userlist = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getUsers();
  getAllCCompanynames();
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

.col-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
