<template>
  <div class="fagai-dynamic-container">
    <el-card shadow="hover" class="page-card">
      <!-- 搜索区域 -->
      <div class="line-wrapper">
        <div class="search-form">
          <el-input
            v-model.trim="state.searchParams.title"
            clearable
            placeholder="订单标题"
            size="default"
            class="search-input"
          />
          <el-select
            v-model="state.searchParams.categoryaid"
            placeholder="产品分类"
            class="search-select"
            clearable
          >
            <el-option label="全部" :value="null" />
            <el-option label="安居" :value="0" />
            <el-option label="悦享" :value="1" />
            <el-option label="康护" :value="2" />
          </el-select>
          <el-select
            v-model="state.searchParams.status"
            placeholder="是否有效"
            class="search-select"
            clearable
          >
            <el-option label="全部" :value="null" />
            <el-option label="有效" :value="1" />
            <el-option label="无效" :value="0" />
          </el-select>
          <el-date-picker
            v-model="state.searchParams.dateRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="search-date-picker"
          />
          <el-button type="primary" @click="searchOrders" class="search-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button type="success" @click="createNewOrder" class="search-btn">
            <el-icon><Plus /></el-icon>
            创建记录
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="state.orderList"
        style="width: 100%"
        @row-dblclick="onTableRowDoubleClick"
        stripe
        border
        :header-cell-style="{
          background: '#f8f9fa',
          color: '#333',
          fontWeight: '500',
        }"
        :empty-text="emptyTableText"
        size="default"
        class="full-table"
        table-layout="fixed"
      >
        <el-table-column prop="id" label="ID" min-width="60px" align="center" />
        <el-table-column
          prop="title"
          label="订单标题"
          min-width="150px"
          show-overflow-tooltip
        />
        <el-table-column
          prop="categoryaid"
          label="产品分类"
          min-width="80px"
          align="center"
        >
          <template #default="scope">
            {{ getCategoryName(scope.row.categoryaid) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="buyamount"
          label="购买数量"
          min-width="70px"
          align="right"
        />
        <el-table-column
          prop="contractprice"
          label="合同金额"
          min-width="100px"
          align="right"
        >
          <template #default="scope">
            <span class="price-text">
              ¥{{ Number(scope.row.contractprice).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          min-width="70px"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createtime"
          label="创建时间"
          min-width="170px"
          align="center"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updatetime"
          label="更新时间"
          min-width="170px"
          align="center"
        >
          <template #default="scope">
            {{ timestamp2datetime(scope.row.updatetime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="state.searchParams.currentPage"
          :page-size="state.searchParams.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="state.searchParams.totalCount"
          @current-change="handlePageChange"
          background
          size="default"
        />
      </div>
    </el-card>

    <!-- 编辑/创建模态窗口 -->
    <el-dialog
      v-model="state.showOrderDialog"
      :title="state.isNewRecord ? '创建线下订单' : '编辑线下订单'"
      width="85%"
      :show-close="true"
      @close="resetOrderForm"
      class="order-edit-dialog"
      draggable
    >
      <el-scrollbar height="60vh" class="dialog-scrollbar">
        <el-form
          :model="state.orderForm"
          label-width="120px"
          class="detail-form"
        >
          <!-- 基本信息区域 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Document /></el-icon>
              <h3>基本信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="订单ID">
                <el-input
                  v-model="state.orderForm.id"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="订单标题" required>
                <el-input
                  v-model.trim="state.orderForm.title"
                  placeholder="请输入订单标题"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="产品分类" required>
                <el-select
                  v-model="state.orderForm.categoryaid"
                  placeholder="请选择产品分类"
                >
                  <el-option label="安居" :value="0" />
                  <el-option label="悦享" :value="1" />
                  <el-option label="康护" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="购买数量" required>
                <el-input-number
                  v-model="state.orderForm.buyamount"
                  :min="1"
                  :step="1"
                  placeholder="请输入购买数量"
                />
              </el-form-item>
              <el-form-item label="合同金额" required>
                <el-input-number
                  v-model="state.orderForm.contractprice"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  placeholder="请输入合同金额"
                />
              </el-form-item>
              <el-form-item label="是否有效" required>
                <el-select
                  v-model="state.orderForm.status"
                  placeholder="请选择状态"
                >
                  <el-option label="有效" :value="1" />
                  <el-option label="无效" :value="0" />
                </el-select>
              </el-form-item>
            </div>
          </div>

          <!-- 操作记录区域 -->
          <div class="form-section" v-if="state.operationHistory.length > 0">
            <div class="section-header">
              <el-icon><Clock /></el-icon>
              <h3>操作记录</h3>
            </div>
            <el-table
              :data="state.operationHistory"
              style="width: 100%; margin-top: 15px"
              stripe
              border
              size="small"
              :header-cell-style="{
                background: '#f8f9fa',
                color: '#333',
                fontWeight: '500',
              }"
            >
              <el-table-column
                type="index"
                label="序号"
                width="60px"
                align="center"
              />
              <el-table-column
                width="100px"
                prop="operator"
                label="操作人"
                align="center"
              />
              <el-table-column
                prop="time"
                width="180px"
                label="操作时间"
                align="center"
              >
                <template #default="scope">
                  {{ timestamp2datetime(scope.row.time) }}
                </template>
              </el-table-column>
              <el-table-column
                flex="1"
                prop="opercontent"
                label="操作描述"
                min-width="200px"
                show-overflow-tooltip
              />
            </el-table>
          </div>
        </el-form>
      </el-scrollbar>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetOrderForm">取消</el-button>
          <el-button
            type="primary"
            @click="saveOrder"
            :loading="state.isSaving"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import request from "../../utils/request";
import { timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Document, Clock } from "@element-plus/icons-vue";
import { useStore } from "vuex";

const store = useStore();

// 状态管理
const state = reactive({
  orderList: [],
  operationHistory: [],
  showOrderDialog: false,
  isNewRecord: false,
  isSaving: false,
  searchParams: {
    title: "",
    categoryaid: "",
    status: "",
    dateRange: [],
    currentPage: 1,
    pageSize: 30,
    totalCount: 0,
  },
  orderForm: {
    id: 0,
    title: "",
    categoryaid: "",
    buyamount: 1,
    contractprice: 0,
    status: 1,
    createtime: 0,
    updatetime: 0,
    operatehistory: "",
  },
});

// 计算空表格提示文本
const emptyTableText = computed(() => {
  return "暂无订单数据，请调整查询条件后重试";
});

// 获取分类名称
const getCategoryName = (categoryaid) => {
  const categoryMap = {
    0: "安居",
    1: "悦享",
    2: "康护",
  };
  return categoryMap[categoryaid] || "未知";
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  return status === 1 ? "success" : "info";
};

// 获取状态文本
const getStatusText = (status) => {
  return status === 1 ? "有效" : "无效";
};

// 搜索订单
const searchOrders = () => {
  state.searchParams.currentPage = 1;
  getOrderList();
};

// 创建新订单
const createNewOrder = () => {
  state.isNewRecord = true;
  state.orderForm = {
    id: 0,
    title: "",
    categoryaid: "",
    buyamount: 1,
    contractprice: 0,
    status: 1,
    createtime: 0,
    updatetime: 0,
    operatehistory: "",
  };
  state.operationHistory = [];
  state.showOrderDialog = true;
};

// 获取订单列表
const getOrderList = () => {
  const params = {
    title: state.searchParams.title,
    categoryaid:
      state.searchParams.categoryaid !== ""
        ? state.searchParams.categoryaid
        : "",
    status: state.searchParams.status !== "" ? state.searchParams.status : "",
    startDate: state.searchParams.dateRange[0] || "",
    endDate: state.searchParams.dateRange[1] || "",
    currentPage: state.searchParams.currentPage,
    pageSize: state.searchParams.pageSize,
  };

  request
    .post("/getofflineorderlist", params)
    .then((res) => {
      if (res && res.code === "200" && res.data) {
        state.orderList = res.data || [];
        state.searchParams.totalCount = res.pagination.totalCount || 0;
      } else {
        ElMessage.error("获取订单列表失败");
      }
    })
    .catch((error) => {
      console.error("获取订单列表异常:", error);
      ElMessage.error("获取订单列表异常");
    });
};

// 表格行双击事件
const onTableRowDoubleClick = (row) => {
  state.isNewRecord = false;
  getOrderDetail(row);
};

// 获取订单详情
const getOrderDetail = (rowinfo) => {
  state.orderForm = {
    id: rowinfo.id,
    title: rowinfo.title,
    categoryaid: rowinfo.categoryaid,
    buyamount: rowinfo.buyamount,
    contractprice: rowinfo.contractprice,
    status: rowinfo.status,
    createtime: rowinfo.createtime,
    updatetime: rowinfo.updatetime,
    operatehistory: rowinfo.operatehistory || "",
  };
  // 解析操作历史
  parseOperationHistory(rowinfo.operatehistory);
  state.showOrderDialog = true;
};

// 解析操作历史
const parseOperationHistory = (operatehistoryStr) => {
  if (!operatehistoryStr) {
    state.operationHistory = [];
    return;
  }
  try {
    state.operationHistory = JSON.parse(operatehistoryStr);
  } catch (e) {
    console.warn("解析操作历史失败:", e);
    state.operationHistory = [];
  }
};

// 保存订单
const saveOrder = () => {
  // 验证必填字段
  if (!state.orderForm.title) {
    ElMessage.warning("请输入订单标题");
    return;
  }
  if (state.orderForm.categoryaid === "") {
    ElMessage.warning("请选择产品分类");
    return;
  }
  if (!state.orderForm.buyamount || state.orderForm.buyamount < 1) {
    ElMessage.warning("购买数量必须大于0");
    return;
  }
  if (!state.orderForm.contractprice || state.orderForm.contractprice < 0) {
    ElMessage.warning("合同金额不能为负数");
    return;
  }
  if (state.orderForm.status === "") {
    ElMessage.warning("请选择是否有效");
    return;
  }

  state.isSaving = true;
  const saveParams = {
    ...state.orderForm,
  };
  // 删除saveParams的operatehistory、createtime字段
  delete saveParams.operatehistory;
  delete saveParams.createtime;
  delete saveParams.updatetime;

  // 从本地缓存中获取用户姓名和用户id，并添加到saveParams中
  const username = localStorage.getItem("username");
  const userid = localStorage.getItem("userid");
  saveParams.operatorid = userid;
  saveParams.operatorname = username;

  request
    .post("/updateofflineorder", saveParams)
    .then((res) => {
      state.isSaving = false;
      if (res && res.retcode === "200") {
        ElMessage.success(state.isNewRecord ? "创建成功" : "更新成功");
        // 关闭对话框并重置
        state.showOrderDialog = false;
        state.orderForm = {
          id: 0,
          title: "",
          categoryaid: "",
          buyamount: 1,
          contractprice: 0,
          status: 1,
          createtime: 0,
          updatetime: 0,
          operatehistory: "",
        };
        state.operationHistory = [];
        // 刷新列表
        getOrderList();
      } else {
        ElMessage.error(res.retmsg || "保存失败");
      }
    })
    .catch((error) => {
      state.isSaving = false;
      console.error("保存订单异常:", error);
      ElMessage.error("保存订单异常");
    });
};

// 重置表单
const resetOrderForm = () => {
  state.showOrderDialog = false;
  state.orderForm = {
    id: 0,
    title: "",
    categoryaid: "",
    buyamount: 1,
    contractprice: 0,
    status: 1,
    createtime: 0,
    updatetime: 0,
    operatehistory: "",
  };
  state.operationHistory = [];
};

// 处理页码变更
const handlePageChange = () => {
  getOrderList();
};

// 页面挂载时获取初始数据
onMounted(() => {
  getOrderList();
});
</script>

<style scoped lang="scss">
.fagai-dynamic-container {
  padding: 20px;
  background-color: #f9f9f9;
  height: calc(100vh - 60px);
  box-sizing: border-box;
  overflow: hidden;
}

.page-card {
  border-radius: 8px;
  height: 100%;
}

:deep(.page-card .el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 20px;
}

.line-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
}

.search-input {
  flex: 2;
  min-width: 0;
}

.search-select {
  flex: 1;
  min-width: 0;
}

.search-date-picker {
  flex: 1.5;
  min-width: 0;
}

.search-date-picker :deep(.el-date-editor) {
  width: 100% !important;
}

.search-btn {
  height: 32px;
  padding: 0 15px;
  flex-shrink: 0;

  &:last-child {
    margin-left: auto;
  }
}

.full-table {
  flex: 1;
  min-height: 0;
  --el-table-row-hover-bg-color: #f8f9fa;
}

.pagination-wrapper {
  padding: 15px 0 0 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 15px;
}

.price-text {
  color: #f56c6c;
  font-weight: 600;
}

.read-only-input {
  :deep(.el-input__inner) {
    background-color: #f5f7fa;
    cursor: not-allowed;
  }
}

.order-edit-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-scrollbar {
  padding: 20px;
}

.detail-form {
  .form-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;

    :deep(.el-icon) {
      color: #409eff;
    }

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 15px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    :deep(.el-input__wrapper),
    :deep(.el-input-number),
    :deep(.el-select) {
      width: 100%;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
}
</style>
