<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-button
          type="primary"
          style="margin-left: 15px"
          @click="createClearConfigRecord"
          >创建配置记录</el-button
        >
      </div>
      <el-table
        :data="state.clearconfiglist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onPackageTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="10%" />
        <el-table-column prop="ccompanyname" label="企业名称" min-width="30%" />
        <el-table-column prop="anjustatus" label="安居权益状态" min-width="20%">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.anjustatus)">
              {{ showstatus(scope.row.anjustatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="yuexiangstatus"
          label="悦享权益状态"
          min-width="20%"
        >
          <template #default="scope">
            <span :class="getStatusClass(scope.row.yuexiangstatus)">
              {{ showstatus(scope.row.yuexiangstatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="kanghustatus"
          label="康护权益状态"
          min-width="20%"
        >
          <template #default="scope">
            <span :class="getStatusClass(scope.row.kanghustatus)">
              {{ showstatus(scope.row.kanghustatus) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <!-- 套餐配置模态窗口 -->
  <el-dialog
    v-model="state.showClearConfigInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.packageInfoForm.id ? "修改额度配置信息" : "创建额度配置信息"
      }}</span>
    </div>
    <el-form :model="state.packageInfoForm" status-icon label-width="120px">
      <div class="line-wrapper" style="width: 95%">
        <el-form-item label="企业名称" prop="companyname" style="width: 100%">
          <el-select
            v-model="state.packageInfoForm.ccompanyid"
            placeholder="请选择企业名称"
            filterable
            :disabled="
              state.packageInfoForm.id != null &&
              state.packageInfoForm.id !== ''
            "
            @change="handleCompanyChange"
          >
            <el-option
              v-for="item in state.companynames"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper" style="width: 95%">
        <el-form-item
          label="安居权益状态"
          prop="anjustatus"
          class="credit-count-item"
        >
          <el-select
            v-model="state.packageInfoForm.anjustatus"
            :class="getStatusClass(state.packageInfoForm.anjustatus)"
            placeholder="请选择安居权益状态"
          >
            <el-option
              label="权益清空"
              :value="0"
              class="clear-category-status-option--clear"
            />
            <el-option
              label="权益正常"
              :value="1"
              class="clear-category-status-option--normal"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="悦享权益状态"
          prop="yuexiangstatus"
          class="credit-count-item"
        >
          <el-select
            v-model="state.packageInfoForm.yuexiangstatus"
            :class="getStatusClass(state.packageInfoForm.yuexiangstatus)"
            placeholder="请选择悦享权益状态"
          >
            <el-option
              label="权益清空"
              :value="0"
              class="clear-category-status-option--clear"
            />
            <el-option
              label="权益正常"
              :value="1"
              class="clear-category-status-option--normal"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="康护权益状态"
          prop="kanghustatus"
          class="credit-count-item"
        >
          <el-select
            v-model="state.packageInfoForm.kanghustatus"
            :class="getStatusClass(state.packageInfoForm.kanghustatus)"
            placeholder="请选择康护权益状态"
          >
            <el-option
              label="权益清空"
              :value="0"
              class="clear-category-status-option--clear"
            />
            <el-option
              label="权益正常"
              :value="1"
              class="clear-category-status-option--normal"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="abortsaveCreditInfo">取消</el-button>
          <el-button type="primary" @click="saveCreditInfo"> 保存 </el-button>
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

import { download } from "../../utils/request";

const state = reactive({
  showClearConfigInfoDialog: false,
  clearconfiglist: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
  },
  packageInfoForm: {
    id: "",
    ccompanyid: "",
    ccompanyname: "",
    anjustatus: "",
    yuexiangstatus: "",
    kanghustatus: "",
  },
  companynames: [],
});

const getclearconfiglist = () => {
  let payload = {};
  request.post("/getclearcategoryconfig", payload).then((res) => {
    console.log("getclearcategoryconfig res:", res);
    //console.log("getclearcategoryconfig res:", res.retcode);
    if (res && res.retcode === "200" && res.data) {
      state.clearconfiglist = res.data;
    } else {
      ElMessage.error("获取分类权益清零配置列表失败！");
    }
  });
};

const showstatus = (status) => {
  if (status === 0 || status === "0") {
    return "权益清零";
  } else if (status === 1 || status === "1") {
    return "权益正常";
  } else {
    return "未知状态";
  }
};

const getStatusClass = (status) => {
  if (status === 0 || status === "0") {
    return "status-clear";
  } else if (status === 1 || status === "1") {
    return "status-normal";
  }
  return "";
};

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

const handleCompanyChange = (companyId) => {
  const company = state.companynames.find((item) => item.id === companyId);
  state.packageInfoForm.ccompanyname = company ? company.name : "";
};

const onPackageTableRowDBClicked = (row, column, event) => {
  state.packageInfoForm.id = row.id;
  state.packageInfoForm.ccompanyid = row.ccompanyid;
  state.packageInfoForm.ccompanyname = row.ccompanyname;
  state.packageInfoForm.anjustatus = toStatusValue(row.anjustatus);
  state.packageInfoForm.yuexiangstatus = toStatusValue(row.yuexiangstatus);
  state.packageInfoForm.kanghustatus = toStatusValue(row.kanghustatus);

  state.showClearConfigInfoDialog = true;
};

const toStatusValue = (status) => {
  if (status === 0 || status === "0") {
    return 0;
  } else if (status === 1 || status === "1") {
    return 1;
  }
  return "";
};

const createClearConfigRecord = () => {
  resetForm();
  state.showClearConfigInfoDialog = true;
};

// 清除企业信息窗体数据
const resetForm = () => {
  state.packageInfoForm.id = "";
  state.packageInfoForm.ccompanyid = "";
  state.packageInfoForm.ccompanyname = "";
  state.packageInfoForm.anjustatus = 1;
  state.packageInfoForm.yuexiangstatus = 1;
  state.packageInfoForm.kanghustatus = 1;
};

const abortsaveCreditInfo = () => {
  resetForm();
  state.showClearConfigInfoDialog = false;
};

const saveCreditInfo = () => {
  if (
    !state.packageInfoForm.ccompanyname ||
    !state.packageInfoForm.ccompanyid
  ) {
    ElMessageBox.alert("企业名称和企业ID为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  if (
    ![0, 1].includes(state.packageInfoForm.anjustatus) ||
    ![0, 1].includes(state.packageInfoForm.yuexiangstatus) ||
    ![0, 1].includes(state.packageInfoForm.kanghustatus)
  ) {
    ElMessageBox.alert("请选择安居、悦享和康护权益状态！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.packageInfoForm.id
    ? "是否要更新配置信息?"
    : "是否要创建新配置?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updateclearcategoryconfig", state.packageInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "配置数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getclearconfiglist();
            resetForm();
            state.showClearConfigInfoDialog = false;
          } else {
            ElMessage.error("更新配置数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新配置数据失败！");
    });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getclearconfiglist();
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

.status-clear {
  color: #f56c6c;
  font-weight: bold;
}

.status-normal {
  color: #67c23a;
  font-weight: bold;
}

:deep(.el-select.status-clear .el-select__selected-item) {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-select.status-normal .el-select__selected-item) {
  color: #67c23a;
  font-weight: bold;
}

:global(.el-select-dropdown__item.clear-category-status-option--clear) {
  color: #f56c6c;
  font-weight: bold;
}

:global(.el-select-dropdown__item.clear-category-status-option--normal) {
  color: #67c23a;
  font-weight: bold;
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

.credit-count-item {
  width: 33%;
  margin-right: 2%;
}

.credit-count-item:last-child {
  margin-right: 0;
}

:deep(.credit-count-input) {
  width: 220px;
}

:deep(.credit-count-input .el-input__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: box-shadow 0.2s ease;
}

:deep(.credit-count-input .el-input__wrapper:hover),
:deep(.credit-count-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

@media (max-width: 768px) {
  .credit-count-item {
    width: 100%;
    margin-right: 0;
  }

  :deep(.credit-count-input) {
    width: 100%;
  }
}
</style>
