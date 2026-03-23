<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-button
          type="primary"
          style="margin-left: 15px"
          @click="createCreditPackage"
          >创建额度套餐</el-button
        >
      </div>
      <el-table
        :data="state.creditpackagelist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onPackageTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="20%" />
        <el-table-column
          prop="companytypename"
          label="企业类型"
          min-width="30%"
        />
        <el-table-column prop="packagename" label="套餐名称" min-width="30%" />
        <el-table-column
          prop="anjucontent"
          label="安居选项配置"
          min-width="30%"
        >
          <template #default="scope">
            {{ showanjutext(scope.row.anjucontent) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="yuexiangcredit"
          label="悦享选项配置"
          min-width="30%"
        />
        <el-table-column prop="kanghugrade" label="康护等级" min-width="20%">
          <template #default="scope">
            {{ showkanghutext(scope.row.kanghugrade) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="配置状态" min-width="30%">
          <template #default="scope">
            {{ showstatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button
              type="danger"
              v-if="scope.row.status === 1"
              @click="handleOnline(scope.row)"
              >生效套餐</el-button
            >
            <el-button
              type="success"
              v-if="scope.row.status === 0"
              @click="handleOffline(scope.row)"
              >下线套餐</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <!-- 套餐配置模态窗口 -->
  <el-dialog
    v-model="state.showPackageInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.packageInfoForm.id ? "修改套餐信息" : "创建套餐信息"
      }}</span>
    </div>
    <el-form :model="state.packageInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item
          label="企业类型"
          prop="companytypename"
          style="width: 90%"
        >
          <el-input
            v-model.trim="state.packageInfoForm.companytypename"
            placeholder="企业类型"
          />
        </el-form-item>
        <el-form-item label="套餐名称" prop="packagename" style="width: 90%">
          <el-input
            v-model.trim="state.packageInfoForm.packagename"
            placeholder="套餐名称"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="安居配置" prop="anjucontent" style="width: 90%">
          <div class="col-wrapper">
            <div class="line-wrapper" style="margin-bottom: 10px">
              <el-button type="primary" @click="addAnjuItem('deduction')"
                >新增减免额度</el-button
              >
              <el-button
                type="success"
                style="margin-left: 10px"
                @click="addAnjuItem('discount')"
                >新增折扣</el-button
              >
            </div>
            <div
              v-for="(item, index) in state.packageInfoForm.arranjucontent"
              :key="index"
              class="line-wrapper"
              style="margin-bottom: 10px; align-items: center"
            >
              <template v-if="item.type === 'deduction'">
                <div style="width: 120px">减免额度:</div>
                <el-input-number
                  v-model="item.quota"
                  :step="100"
                  :precision="0"
                  :min="1000"
                  :max="20000"
                  style="width: 220px; margin-right: 10px"
                />
                <div style="width: 80px">数量:</div>
                <el-input-number
                  v-model="item.count"
                  :step="1"
                  :precision="0"
                  :min="0"
                  :max="999"
                  style="width: 220px; margin-right: 10px"
                />
                <el-button type="danger" @click="removeAnjuItem(index)"
                  >删除</el-button
                >
              </template>
              <template v-else-if="item.type === 'discount'">
                <div style="width: 120px">折扣</div>
                <el-input-number
                  v-model="item.discount"
                  :step="0.01"
                  :precision="2"
                  :min="0"
                  :max="1"
                  style="width: 220px; margin-right: 10px"
                />
                <div style="width: 80px">数量:</div>
                <el-input-number
                  v-model="item.count"
                  :step="1"
                  :precision="0"
                  :min="0"
                  :max="10"
                  style="width: 220px; margin-right: 10px"
                />
                <div style="width: 80px">减免限额:</div>
                <el-input-number
                  v-model="item.limit"
                  :step="100"
                  :precision="0"
                  :min="0"
                  :max="50000"
                  style="width: 220px; margin-right: 10px"
                />
                <el-button type="danger" @click="removeAnjuItem(index)"
                  >删除</el-button
                >
              </template>
            </div>
          </div>
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="悦享额度" prop="yuexiangcredit" style="width: 90%">
          <el-input-number
            v-model="state.packageInfoForm.yuexiangcredit"
            :step="1000"
            :precision="0"
            :min="10000"
            :max="1000000"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="康护等级" prop="kanghugrade" style="width: 90%">
          <el-select
            v-model="state.packageInfoForm.kanghugrade"
            placeholder="请选择康护等级"
            style="width: 220px"
          >
            <el-option
              v-for="item in state.kanghuGrades"
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
          <el-button @click="abortSavePackageInfo">取消</el-button>
          <el-button type="primary" @click="savePackageInfo"> 保存 </el-button>
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
  showPackageInfoDialog: false,
  creditpackagelist: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
  },
  packageInfoForm: {
    id: "",
    anjucontent: "",
    companytypename: "",
    packagename: "",
    arranjucontent: [],
    yuexiangcredit: 0,
    kanghugrade: 0,
    status: 0,
  },
  kanghuGrades: [
    { label: "钻石", value: 1 },
    { label: "铂金", value: 2 },
    { label: "黄金", value: 3 },
    { label: "白银", value: 4 },
  ],
});

const showkanghutext = (grade) => {
  const gradeObj = state.kanghuGrades.find((item) => item.value === grade);
  return gradeObj ? gradeObj.label : "未知等级";
};

const getAllPackages = () => {
  let payload = {};
  request.post("/getallpackages", payload).then((res) => {
    console.log("getallpackages res:", res);
    //console.log("getallpackages res:", res.retcode);
    if (res && res.retcode === "200" && res.data) {
      state.creditpackagelist = res.data;
    } else {
      ElMessage.error("获取额度配置列表失败！");
    }
  });
};

const parseAnjuContent = (rawData) => {
  if (Array.isArray(rawData)) {
    return rawData;
  }
  try {
    const parsed = JSON.parse(rawData || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const addAnjuItem = (type) => {
  if (type === "deduction") {
    state.packageInfoForm.arranjucontent.push({
      type: "deduction",
      quota: 1000,
      count: 0,
    });
    return;
  }
  if (type === "discount") {
    state.packageInfoForm.arranjucontent.push({
      type: "discount",
      discount: 0,
      count: 0,
      limit: 0,
    });
  }
};

const removeAnjuItem = (index) => {
  state.packageInfoForm.arranjucontent.splice(index, 1);
};

const onPackageTableRowDBClicked = (row, column, event) => {
  state.packageInfoForm.id = row.id;
  state.packageInfoForm.companytypename = row.companytypename;
  state.packageInfoForm.packagename = row.packagename;
  state.packageInfoForm.yuexiangcredit = row.yuexiangcredit || 0;
  state.packageInfoForm.anjucontent = row.anjucontent || "";
  state.packageInfoForm.arranjucontent = parseAnjuContent(row.anjucontent);
  state.packageInfoForm.kanghugrade = row.kanghugrade || 0;
  state.packageInfoForm.status = row.status;

  state.showPackageInfoDialog = true;
};

const showstatus = (status) => {
  if (status === 0) {
    return "有效";
  } else {
    return "无效";
  }
};

const showanjutext = (anjucontent) => {
  const arr = parseAnjuContent(anjucontent);
  if (arr.length === 0) {
    return "无安居配置";
  }
  return arr
    .map((item) => {
      if (item.type === "deduction") {
        return `减免额度${item.quota}，数量${item.count}`;
      } else if (item.type === "discount") {
        return `折扣${item.discount * 100}%，数量${item.count}，减免限额${item.limit}`;
      } else {
        return "未知配置项";
      }
    })
    .join("；");
};

const handleOnline = (rowinfo) => {
  let tip_text = "确认要生效配置?";
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
      request.post("/changepackagestatus", payload).then((res) => {
        if (res) {
          getAllPackages();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOffline = (rowinfo) => {
  let tip_text = "确认要封禁配置?";
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
      request.post("/changepackagestatus", payload).then((res) => {
        if (res) {
          getAllPackages();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const createCreditPackage = () => {
  resetForm();
  state.showPackageInfoDialog = true;
};

// 清除企业信息窗体数据
const resetForm = () => {
  state.packageInfoForm.id = "";
  state.packageInfoForm.companytypename = "";
  state.packageInfoForm.packagename = "";
  state.packageInfoForm.yuexiangcredit = 0;
  state.packageInfoForm.anjucontent = "";
  state.packageInfoForm.arranjucontent = [];
  state.packageInfoForm.kanghugrade = 0;
  state.packageInfoForm.status = 0;
};

const abortSavePackageInfo = () => {
  resetForm();
  state.showPackageInfoDialog = false;
};

const savePackageInfo = () => {
  if (!state.packageInfoForm.companytypename) {
    ElMessageBox.alert("企业类型为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.packageInfoForm.packagename) {
    ElMessageBox.alert("套餐名称为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  // 检查state.packageInfoForm.arranjucontent中的每一项是否都符合要求
  for (let i = 0; i < state.packageInfoForm.arranjucontent.length; i++) {
    const item = state.packageInfoForm.arranjucontent[i];
    if (item.type === "deduction") {
      if (!item.quota || item.quota <= 0) {
        ElMessageBox.alert(`第${i + 1}行的减免额度必须大于0！`, "保存错误", {
          confirmButtonText: "OK",
        });
        return;
      }
      if (!item.count || item.count <= 0) {
        ElMessageBox.alert(`第${i + 1}行的减免次数必须大于0！`, "保存错误", {
          confirmButtonText: "OK",
        });
        return;
      }
    } else if (item.type === "discount") {
      if (
        item.discount === undefined ||
        item.discount < 0 ||
        item.discount > 1
      ) {
        ElMessageBox.alert(`第${i + 1}行的折扣必须在0到1之间！`, "保存错误", {
          confirmButtonText: "OK",
        });
        return;
      }
      if (!item.count || item.count <= 0) {
        ElMessageBox.alert(`第${i + 1}行的折扣次数必须大于0！`, "保存错误", {
          confirmButtonText: "OK",
        });
        return;
      }
      if (item.limit === undefined || item.limit < 0) {
        ElMessageBox.alert(
          `第${i + 1}行的折扣额度上限必须大于或等于0！`,
          "保存错误",
          {
            confirmButtonText: "OK",
          },
        );
        return;
      }
    }
  }
  // state.packageInfoForm.arranjucontent需要转换成JSON字符串存储到anjucontent字段中
  state.packageInfoForm.anjucontent = JSON.stringify(
    state.packageInfoForm.arranjucontent || [],
  );
  // state.packageInfoForm.yuexiangcredit合法性检查
  if (
    state.packageInfoForm.yuexiangcredit === undefined ||
    state.packageInfoForm.yuexiangcredit < 10000 ||
    state.packageInfoForm.yuexiangcredit > 1000000
  ) {
    ElMessageBox.alert("悦享额度必须在10000到1000000之间！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  // state.packageInfoForm.kanghugrade合法性检查
  if (
    state.packageInfoForm.kanghugrade === undefined ||
    state.packageInfoForm.kanghugrade < 1 ||
    state.packageInfoForm.kanghugrade > 4
  ) {
    ElMessageBox.alert("康护等级必须在钻石到白银之间！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.packageInfoForm.id
    ? "是否要更新套餐信息?"
    : "是否要创建新套餐?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      request
        .post("/updatepackage", state.packageInfoForm)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "用户数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getAllPackages();
            resetForm();
            state.showPackageInfoDialog = false;
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
      ElMessage.error("更新套餐数据失败！");
    });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getAllPackages();
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
