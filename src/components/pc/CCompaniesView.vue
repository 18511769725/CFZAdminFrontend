<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.name"
          clearable
          placeholder="企业名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.creditcode"
          clearable
          placeholder="统一社会信用编码"
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
          >新建企业信息</el-button
        >
      </div>
      <el-table
        :data="state.companylist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onCompanyTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="20%" />
        <el-table-column prop="name" label="企业名称" min-width="30%" />
        <el-table-column
          prop="creditcode"
          label="统一社会编码"
          min-width="30%"
        />
        <el-table-column
          prop="availablecredit"
          label="当前可用额度"
          min-width="30%"
        />
        <el-table-column prop="status" label="企业状态" min-width="30%">
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
              >授权采购</el-button
            >
            <el-button
              type="success"
              v-if="scope.row.status === 1"
              @click="handleOffline(scope.row)"
              >取消授权</el-button
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
        state.companyInfoForm.id ? "修改重点企业信息" : "创建重点企业信息"
      }}</span>
    </div>
    <el-form :model="state.companyInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="重点企业名称" prop="name" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.name"
            placeholder="重点企业名称"
          />
        </el-form-item>
        <el-form-item label="统一社会编码" prop="creditcode" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.creditcode"
            placeholder="统一社会编码"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="企业评级" prop="" style="width: 90%">
          <el-select
            v-model="state.companyInfoForm.packageid"
            placeholder="请选择企业评级"
          >
            <el-option
              v-for="item in state.creditpackagelist"
              :key="item.id"
              :label="item.packagename"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper" v-if="state.companyInfoForm.id">
        <el-form-item label="额度操作历史" style="width: 120px"> </el-form-item>
        <el-button
          type="primary"
          size="small"
          @click="addRewardItem"
          style="margin-top: 5px; width: 100px"
          ><el-icon><Plus /></el-icon>授予新额度</el-button
        >
      </div>
      <div
        class="line-wrapper"
        style="width: 90%"
        v-if="state.companyInfoForm.id"
      >
        <el-table :data="state.creditoperatelist" style="width: 100%">
          <el-table-column fixed prop="id" label="序号" min-width="20%" />
          <el-table-column prop="cusername" label="操作人" min-width="30%">
            <template #default="scope">
              {{ showcuserinfo(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="cuserphone" label="联系方式" min-width="30%" />
          <el-table-column prop="type" label="操作类型" min-width="30%">
            <template #default="scope">
              {{ showtypes(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" min-width="30%" />
          <el-table-column prop="validfrom" label="起始日期" min-width="30%">
            <template #default="scope">
              {{ timestamp2date(scope.row.validfrom) }}
            </template>
          </el-table-column>
          <el-table-column prop="validend" label="截至日期" min-width="30%">
            <template #default="scope">
              {{ timestamp2date(scope.row.validend) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="数据状态" min-width="30%">
            <template #default="scope">
              {{ showsopertatus(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column prop="createtime" label="记录时间" min-width="30%">
            <template #default="scope">
              {{ timestamp2datetime(scope.row.createtime) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="Operations" min-width="40%">
            <template #default="scope">
              <el-button
                type="danger"
                v-if="scope.row.status === 0"
                @click="handleOfflineData(scope.row)"
                >数据作废</el-button
              >
              <el-button
                type="success"
                v-if="scope.row.status === 1"
                @click="handleOnlineData(scope.row)"
                >恢复数据</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="getCreditInfob">dianjiceshi</el-button>
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
  </el-dialog>
  <!-- 额度创建模态窗口 -->
  <el-dialog
    v-model="state.showAddCreditDialog"
    width="500px"
    :show-close="true"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        "创建额度"
      }}</span>
    </div>
    <div class="col-wrapper" style="width: 100%">
      <el-form-item
        label="奖励额度"
        prop="amount"
        style="width: 100%; margin-top: 15px; text-align: center"
      >
        <el-input-number
          v-model="state.addCreditInfoForm.amount"
          :precision="2"
          :step="0.01"
          :max="9999999999"
          :min="0"
          style="width: 100%"
          placeholder="请输入奖励额度"
        />
      </el-form-item>
      <el-form-item
        label="授予说明"
        prop="year"
        style="width: 100%; margin-top: 15px"
      >
        <el-input
          v-model.trim="state.addCreditInfoForm.desc"
          placeholder="请输入奖励额度授予说明"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="生效日期范围"
        prop="daterange"
        style="width: 100%; margin-top: 15px"
      >
        <el-date-picker
          v-model="state.addCreditInfoForm.daterange"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          :size="default"
        />
      </el-form-item>
      <el-button
        style="width: 100%; margin-top: 15px"
        type="success"
        size="big"
        @click="submitCreateCredit()"
        ><el-icon><Plus /></el-icon>创建额度</el-button
      >
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
  creditoperatelist: [],
  showCompanyInfoDialog: false,
  showUploadFileDialog: false,
  showAddCreditDialog: false,
  creditpackagelist: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    name: "",
    creditcode: "",
  },
  companyInfoForm: {
    id: "",
    name: "",
    creditcode: "",
    rewardrecords: [],
    consumerecords: [],
    approvername: "",
    phone: "",
    status: 0,
    packageid: 0,
  },
  addCreditInfoForm: {
    amount: "",
    desc: "",
    daterange: "",
  },
});

const getAllPackages = () => {
  let payload = {};
  request.post("/getallpackages", payload).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      state.creditpackagelist = res.data;
    } else {
      ElMessage.error("获取额度配置列表失败！");
    }
  });
};

// 添加奖励历史记录
const addRewardItem = () => {
  state.addCreditInfoForm.amount = "";
  state.addCreditInfoForm.desc = "";
  state.addCreditInfoForm.daterange = "";
  state.showAddCreditDialog = true;
};

// 提交创建额度
const submitCreateCredit = () => {
  if (
    !state.addCreditInfoForm.amount ||
    !state.addCreditInfoForm.desc ||
    !state.addCreditInfoForm.daterange ||
    state.addCreditInfoForm.daterange.length < 2
  ) {
    ElMessageBox.alert("请填写必要信息！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = "确认要为企业授予额度?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        ccompanyid: state.companyInfoForm.id,
        amount: state.addCreditInfoForm.amount,
        desc: state.addCreditInfoForm.desc,
        daterange: state.addCreditInfoForm.daterange,
        packageid: state.companyInfoForm.packageid,
      };
      request.post("/submitcreatecredit", payload).then((res) => {
        if (res && res.retcode === "200") {
          ElMessage({
            message: "额度创建成功！",
            type: "success",
          });
          getCreditInfo(state.companyInfoForm.id);
          state.showAddCreditDialog = false;
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.companyInfoForm.id = row.id;
  state.companyInfoForm.name = row.name;
  state.companyInfoForm.creditcode = row.creditcode;
  state.companyInfoForm.approvername = row.approvername;
  state.companyInfoForm.phone = row.phone;
  state.companyInfoForm.packageid = row.packageid;

  getCreditInfo(state.companyInfoForm.id);

  state.showCompanyInfoDialog = true;
};

const getCreditInfo = (ccompanyid) => {
  let payload = {
    ccompanyid: ccompanyid,
  };
  request.post("/getcreditinfobyccompanyid", payload).then((res) => {
    if (res && res.retcode === "200") {
      state.creditoperatelist = res.data;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};
const getCreditInfob = (ccompanyid) => {
  let payload = {
    ccompanyid: 1,
  };
  request.post("/getcreditinfobyccompanyid", payload).then((res) => {
    if (res && res.retcode === "200") {
      console.info("res", res);
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

const showcuserinfo = (rowinfo) => {
  if (rowinfo.cuserid === "0" || rowinfo.cuserid === 0) {
    return "后台";
  } else {
    return rowinfo.cusername;
  }
};

const showstatus = (status) => {
  if (status === 1) {
    return "在线";
  } else {
    return "已下线";
  }
};
const showsopertatus = (status) => {
  if (status === 1) {
    return "失效";
  } else {
    return "有效";
  }
};
const showtypes = (type) => {
  if (type === "GRANT_CREDIT") {
    return "授予额度";
  } else if (type === "DEDUCT_CREDIT") {
    return "扣减额度";
  } else if (type === "RESTORE_CREDIT") {
    return "恢复额度";
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
        status: 1,
      };
      request.post("/changeccompanystatus", payload).then((res) => {
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
  let tip_text = "确认要回收授权?";
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
      request.post("/changeccompanystatus", payload).then((res) => {
        if (res) {
          getCompanies();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOnlineData = (rowinfo) => {
  let tip_text = "确认要恢复数据?";
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
      request.post("/changecreditdatastatus", payload).then((res) => {
        if (res) {
          getCreditInfo(state.companyInfoForm.id);
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOfflineData = (rowinfo) => {
  let tip_text = "确认要作废数据?";
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
      request.post("/changecreditdatastatus", payload).then((res) => {
        if (res) {
          getCreditInfo(state.companyInfoForm.id);
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

// 清除企业信息窗体数据
const resetForm = () => {
  state.companyInfoForm.id = "";
  state.companyInfoForm.name = "";
  state.companyInfoForm.creditcode = "";
  state.companyInfoForm.rewardrecords = [];
  state.companyInfoForm.consumerecords = [];
  state.companyInfoForm.approvername = "";
  state.companyInfoForm.phone = "";
  state.companyInfoForm.status = 0;
  state.companyInfoForm.packageid = 0;
};

const abortSaveCompanyInfo = () => {
  resetForm();
  state.showCompanyInfoDialog = false;
};

const saveCompanyInfo = () => {
  if (!state.companyInfoForm.name) {
    ElMessageBox.alert("企业名称为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.companyInfoForm.creditcode) {
    ElMessageBox.alert("企业信用代码为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.companyInfoForm.packageid) {
    ElMessageBox.alert("企业评级为必选项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.companyInfoForm.id
    ? "是否要更新重点企业信息?"
    : "是否要创建新重点企业?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      let payload = {
        id: state.companyInfoForm.id,
        name: state.companyInfoForm.name,
        creditcode: state.companyInfoForm.creditcode,
        approvername: state.companyInfoForm.approvername,
        phone: state.companyInfoForm.phone,
        packageid: state.companyInfoForm.packageid,
      };
      request
        .post("/updateccompany", payload)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "重点企业数据更新成功",
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
      ElMessage.error("更新企业数据失败！");
    });
};

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getCompanies();
};

const getCompanies = () => {
  request.post("/getccompanies", state.getInfoParams).then((res) => {
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
