<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-button
          type="primary"
          style="margin-left: 15px"
          @click="createCreditPackage"
          >创建安居额度配置管理记录</el-button
        >
      </div>
      <el-table
        :data="state.anjucreditlist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onPackageTableRowDBClicked"
      >
        <el-table-column
          fixed
          prop="ccompanyid"
          label="企业id"
          min-width="20%"
        />
        <el-table-column prop="ccompanyname" label="企业名称" min-width="30%" />
        <el-table-column
          prop="freehousecount"
          label="免费房源数量"
          min-width="30%"
        />
        <el-table-column
          prop="discounthousecount"
          label="折扣房源数量"
          min-width="30%"
        />
        <el-table-column prop="createtime" label="创建时间" min-width="20%">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatetime" label="更新时间" min-width="20%">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.updatetime) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <!-- 套餐配置模态窗口 -->
  <el-dialog
    v-model="state.showCreditInfoDialog"
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
      <div class="line-wrapper">
        <el-form-item label="企业名称" prop="companyname" style="width: 94%">
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
      <div class="line-wrapper">
        <el-form-item
          label="免费房源数量"
          prop="freehousecount"
          class="credit-count-item"
        >
          <el-input-number
            v-model="state.packageInfoForm.freehousecount"
            :min="0"
            :max="50"
            label="免费房源数量"
            class="credit-count-input"
          />
        </el-form-item>
        <el-form-item
          label="折扣房源数量"
          prop="discounthousecount"
          class="credit-count-item"
        >
          <el-input-number
            v-model="state.packageInfoForm.discounthousecount"
            :min="0"
            :max="50"
            label="折扣房源数量"
            class="credit-count-input"
          />
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
  showCreditInfoDialog: false,
  anjucreditlist: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
  },
  packageInfoForm: {
    id: "",
    ccompanyid: "",
    ccompanyname: "",
    freehousecount: "",
    discounthousecount: "",
  },
  companynames: [],
});

const getAnjuCreditList = () => {
  let payload = {};
  request.post("/getanjucreditconfig", payload).then((res) => {
    console.log("getanjucreditconfig res:", res);
    //console.log("getanjucreditconfig res:", res.retcode);
    if (res && res.retcode === "200" && res.data) {
      state.anjucreditlist = res.data;
    } else {
      ElMessage.error("获取额度配置列表失败！");
    }
  });
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
  state.packageInfoForm.freehousecount = row.freehousecount || 0;
  state.packageInfoForm.discounthousecount = row.discounthousecount || 0;

  state.showCreditInfoDialog = true;
};

const createCreditPackage = () => {
  resetForm();
  state.showCreditInfoDialog = true;
};

// 清除企业信息窗体数据
const resetForm = () => {
  state.packageInfoForm.id = "";
  state.packageInfoForm.ccompanyid = "";
  state.packageInfoForm.ccompanyname = "";
  state.packageInfoForm.freehousecount = 0;
  state.packageInfoForm.discounthousecount = 0;
};

const abortsaveCreditInfo = () => {
  resetForm();
  state.showCreditInfoDialog = false;
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

  let tip_text = state.packageInfoForm.id
    ? "是否要更新配置信息?"
    : "是否要创建新配置?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updateanjucreditconfig", state.packageInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "配置数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getAnjuCreditList();
            resetForm();
            state.showCreditInfoDialog = false;
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
  getAnjuCreditList();
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

.credit-count-item {
  width: 48%;
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
