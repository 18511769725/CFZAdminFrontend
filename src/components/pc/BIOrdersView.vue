<template>
  <div class="bi-orders-page">
    <div class="filter-card">
      <div class="filter-row">
        <el-date-picker
          v-model="state.filters.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="起始日期"
          clearable
          class="filter-item"
        />
        <el-date-picker
          v-model="state.filters.endDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="截止日期"
          clearable
          class="filter-item"
        />
        <el-input
          v-model.trim="state.filters.supplierName"
          placeholder="供应商名称"
          clearable
          class="filter-item"
        />
        <el-input
          v-model.trim="state.filters.buyerName"
          placeholder="采购方名称"
          clearable
          class="filter-item"
        />
        <!-- <el-select
          v-model="state.filters.productCategory"
          placeholder="产品一级分类"
          class="filter-item"
        >
          <el-option
            v-for="item in state.productCategoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
        <el-button type="primary" @click="handleSearch">确定</el-button>
      </div>
    </div>

    <div class="summary-strip">
      <div class="summary-card">
        <div class="summary-label">订单总数</div>
        <div class="summary-value-row">
          <div class="summary-value">{{ state.summary.totalOrders }}</div>
          <div class="summary-unit">件</div>
        </div>
      </div>
      <div class="summary-card amount-card">
        <div class="summary-label">累计合同金额</div>
        <div class="summary-value-row">
          <div class="summary-value">
            {{ formatAmount(state.summary.totalAmount) }}
          </div>
          <div class="summary-unit">元</div>
        </div>
      </div>
      <div class="summary-card subsidy-card">
        <div class="summary-label">累计服务金额</div>
        <div class="summary-value-row">
          <div class="summary-value">
            {{ formatAmount(state.summary.totalSubsidy) }}
          </div>
          <div class="summary-unit">元</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="tabs-header-action">
        <el-button type="primary" plain @click="handleExport">
          导出数据
        </el-button>
      </div>
      <el-tabs
        v-model="state.activeTab"
        class="order-tabs"
        @tab-change="handleSearch"
      >
        <el-tab-pane label="全部订单" name="all">
          <el-table :data="state.allOrders" border stripe>
            <el-table-column
              type="index"
              label="序号"
              min-width="56"
              align="center"
            />
            <el-table-column
              prop="ccompanyname"
              label="企业名称"
              min-width="180"
              class-name="col-company"
              label-class-name="col-company"
            />
            <el-table-column prop="grade" label="企业类型" min-width="96">
              <template #default="scope">
                {{ showcompanygrade(scope.row.grade) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="资源类型" min-width="96" />
            <el-table-column
              prop="producttitle"
              label="服务资源项目"
              min-width="150"
            />
            <el-table-column
              prop="contractid"
              label="订单编号"
              min-width="160"
            />
            <el-table-column
              prop="bcompanyname"
              label="供应商名称"
              min-width="140"
              class-name="col-supplier"
              label-class-name="col-supplier"
            />
            <el-table-column
              prop="buyamount"
              label="数量"
              min-width="72"
              align="right"
            />
            <el-table-column
              prop="serviceMethod"
              label="补贴方式"
              min-width="90"
              align="right"
            >
              <template #default="scope">
                {{ showservicemethod(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalcontractprice"
              label="合同金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalcontractprice) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalsubsidy"
              label="服务金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalsubsidy) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="安居订单" name="anju">
          <el-table :data="state.anjuOrders" border stripe>
            <el-table-column
              type="index"
              label="序号"
              min-width="56"
              align="center"
            />
            <el-table-column
              prop="ccompanyname"
              label="企业名称"
              min-width="180"
              class-name="col-company"
              label-class-name="col-company"
            />
            <el-table-column prop="grade" label="企业类型" min-width="96">
              <template #default="scope">
                {{ showcompanygrade(scope.row.grade) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="资源类型" min-width="96" />
            <el-table-column
              prop="producttitle"
              label="服务资源项目"
              min-width="150"
            />
            <el-table-column
              prop="contractid"
              label="订单编号"
              min-width="160"
            />
            <el-table-column
              prop="bcompanyname"
              label="供应商名称"
              min-width="140"
              class-name="col-supplier"
              label-class-name="col-supplier"
            />

            <el-table-column
              prop="buyamount"
              label="数量"
              min-width="72"
              align="right"
            />
            <!-- <el-table-column
              prop="singleprice"
              label="月单价"
              min-width="110"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.singleprice) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="subsidytype"
              label="补贴方式"
              min-width="120"
            />
            <el-table-column
              prop="subsidyvalue"
              label="补贴折扣"
              min-width="110"
              align="right"
            >
              <template #default="scope">
                {{ formatPercent(scope.row.subsidyvalue) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="limitamount"
              label="补贴限额"
              min-width="110"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.limitamount) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="subsidyprice"
              label="月平台补贴"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.subsidyprice) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="tanentpay"
              label="月租户自付"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.tanentpay) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="tenancy"
              label="租期"
              min-width="90"
              align="right"
            >
              <template #default="scope">
                {{ scope.row.tenancy }}个月
              </template>
            </el-table-column>
            <el-table-column
              prop="totaltanentpay"
              label="租户自付总额"
              min-width="130"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totaltanentpay) }}
              </template>
            </el-table-column> -->
            <el-table-column
              prop="serviceMethod"
              label="补贴方式"
              min-width="90"
              align="right"
            >
              <template #default="scope">
                {{ showservicemethod(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalcontractprice"
              label="合同金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalcontractprice) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalsubsidy"
              label="服务金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalsubsidy) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="悦享订单" name="yuexiang">
          <el-table :data="state.yuexiangOrders" border stripe>
            <el-table-column
              type="index"
              label="序号"
              min-width="56"
              align="center"
            />
            <el-table-column
              prop="ccompanyname"
              label="企业名称"
              min-width="180"
              class-name="col-company"
              label-class-name="col-company"
            />
            <el-table-column prop="grade" label="企业类型" min-width="96">
              <template #default="scope">
                {{ showcompanygrade(scope.row.grade) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="资源类型" min-width="96" />
            <el-table-column
              prop="producttitle"
              label="服务资源项目"
              min-width="150"
            />
            <el-table-column
              prop="contractid"
              label="订单编号"
              min-width="160"
            />
            <el-table-column
              prop="bcompanyname"
              label="供应商名称"
              min-width="140"
              class-name="col-supplier"
              label-class-name="col-supplier"
            />

            <el-table-column
              prop="buyamount"
              label="数量"
              min-width="72"
              align="right"
            />
            <!-- <el-table-column
              prop="serviceMethod"
              label="补贴方式"
              min-width="90"
              align="right"
            >
              <template #default="scope">
                {{ showservicemethod(scope.row) }}
              </template>
            </el-table-column> -->
            <!-- <el-table-column
              prop="singleprice"
              label="单价"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.singleprice) }}
              </template>
            </el-table-column> -->
            <el-table-column
              prop="totalcontractprice"
              label="合同金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalcontractprice) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalsubsidy"
              label="服务金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalsubsidy) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="康护订单" name="kanghu">
          <el-table :data="state.kanghuOrders" border stripe>
            <el-table-column
              type="index"
              label="序号"
              min-width="56"
              align="center"
            />
            <el-table-column
              prop="ccompanyname"
              label="企业名称"
              min-width="180"
              class-name="col-company"
              label-class-name="col-company"
            />
            <el-table-column prop="grade" label="企业类型" min-width="96">
              <template #default="scope">
                {{ showcompanygrade(scope.row.grade) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="资源类型" min-width="96" />
            <el-table-column
              prop="producttitle"
              label="服务资源项目"
              min-width="150"
            />
            <el-table-column
              prop="contractid"
              label="订单编号"
              min-width="160"
            />
            <el-table-column
              prop="bcompanyname"
              label="供应商名称"
              min-width="140"
              class-name="col-supplier"
              label-class-name="col-supplier"
            />

            <el-table-column
              prop="buyamount"
              label="数量"
              min-width="72"
              align="right"
            />
            <!-- <el-table-column
              prop="singleprice"
              label="单价"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.singleprice) }}
              </template>
            </el-table-column> -->
            <!-- <el-table-column
              prop="serviceMethod"
              label="补贴方式"
              min-width="90"
              align="right"
            >
              <template #default="scope">
                {{ showservicemethod(scope.row) }}
              </template>
            </el-table-column> -->
            <el-table-column
              prop="totalcontractprice"
              label="合同金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalcontractprice) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalsubsidy"
              label="服务金额"
              min-width="120"
              align="right"
            >
              <template #default="scope">
                {{ formatAmount(scope.row.totalsubsidy) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import request, { download } from "../../utils/request";
import { onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import store from "../../store";

const state = reactive({
  activeTab: "all",
  filters: {
    startDate: "",
    endDate: "",
    supplierName: "",
    buyerName: "",
    productCategory: "all",
  },
  productCategoryOptions: [
    { label: "全部分类", value: "all" },
    { label: "安居", value: "anju" },
    { label: "悦享", value: "yuexiang" },
    { label: "康护", value: "kanghu" },
  ],
  summary: {
    totalOrders: 0,
    totalAmount: 0,
    totalSubsidy: 0,
  },
  allOrders: [],
  anjuOrders: [],
  yuexiangOrders: [],
  kanghuOrders: [],
});

const showservicemethod = (rowinfo) => {
  if (rowinfo.category === "悦享") {
    return "-";
  } else if (rowinfo.category === "康护") {
    return "-";
  } else if (rowinfo.category === "安居") {
    if (
      rowinfo.subsidyvalue &&
      (rowinfo.subsidyvalue === 1 || rowinfo.subsidyvalue === "1")
    ) {
      return "免费房源";
    } else if (rowinfo.subsidyvalue && rowinfo.subsidyvalue === 0.7) {
      return "七折房源";
    } else if (rowinfo.subsidyvalue && rowinfo.subsidyvalue === 0.5) {
      return "五折房源";
    }
  } else {
    return "--";
  }
};

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "--";
  }
  return `¥${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (value) => {
  const percent = Number(value);
  if (!Number.isFinite(percent)) {
    return "--";
  }
  return `${(percent * 100).toFixed(2)}%`;
};

const filterByDate = (orderDate) => {
  const { startDate, endDate } = state.filters;
  if (!startDate && !endDate) {
    return true;
  }
  const current = new Date(orderDate).getTime();
  const start = startDate ? new Date(startDate).getTime() : null;
  const end = endDate ? new Date(endDate).getTime() : null;
  if (start !== null && current < start) {
    return false;
  }
  if (end !== null && current > end) {
    return false;
  }
  return true;
};

const containsText = (source, keyword) => {
  if (!keyword) {
    return true;
  }
  return String(source || "")
    .toLowerCase()
    .includes(keyword.toLowerCase());
};

const showcompanygrade = (grade) => {
  if (grade === 1) {
    return "总部型";
  } else if (grade === 2) {
    return "领军型";
  } else if (grade === 3) {
    return "领跑型";
  } else if (grade === 4) {
    return "潜力型";
  } else {
    return "其他";
  }
};

const handleSearch = () => {
  let payload = {
    ...state.filters,
  };
  payload.productCategory = state.activeTab;

  // 分别检查startDate和endDate的有效性，如果只有startdate有效，则查询不晚于startDate的订单；如果只有endDate有效，则查询不早于endDate的订单；如果两者都有效，则查询在两者之间的订单
  if (payload.startDate && payload.endDate) {
    if (new Date(payload.startDate) > new Date(payload.endDate)) {
      ElMessage.warning("起始日期不能晚于截止日期");
      return;
    }
  }
  // 将startDate和endDate转换为毫秒级时间戳并更新到payload中
  payload.startDate = payload.startDate
    ? new Date(payload.startDate).getTime()
    : null;
  payload.endDate = payload.endDate
    ? new Date(payload.endDate).getTime()
    : null;

  request.post("/getOrderStatics", payload).then((res) => {
    if (res && res.code === "200") {
      if (payload.productCategory === "all") {
        state.allOrders = res.data;
        // 对state.allOrders进行排序，先按ccompanyname的中文拼音升序
        state.allOrders.sort((a, b) => {
          return a.ccompanyname.localeCompare(b.ccompanyname, "zh-CN");
        });
        // 对state.allOrders数据进行处理，如果category为“康护”,则buyamount字段直接置为1
        state.allOrders.forEach((order) => {
          if (order.category === "康护") {
            order.buyamount = 1;
          }
        });
      } else if (payload.productCategory === "anju") {
        state.anjuOrders = res.data;
        // 对state.anjuOrders进行排序，先按ccompanyname的中文拼音升序
        state.anjuOrders.sort((a, b) => {
          return a.ccompanyname.localeCompare(b.ccompanyname, "zh-CN");
        });
      } else if (payload.productCategory === "yuexiang") {
        state.yuexiangOrders = res.data;
        // 对state.yuexiangOrders进行排序，先按ccompanyname的中文拼音升序
        state.yuexiangOrders.sort((a, b) => {
          return a.ccompanyname.localeCompare(b.ccompanyname, "zh-CN");
        });
      } else if (payload.productCategory === "kanghu") {
        state.kanghuOrders = res.data;
        // 对state.allOrders进行排序，先按ccompanyname的中文拼音升序
        state.kanghuOrders.sort((a, b) => {
          return a.ccompanyname.localeCompare(b.ccompanyname, "zh-CN");
        });
        // 对state.allOrders数据进行处理，如果category为“康护”,则buyamount字段直接置为1
        state.allOrders.forEach((order) => {
          order.buyamount = 1;
        });
      }
      state.summary.totalOrders = res.pageination.totalOrders;
      state.summary.totalAmount = res.pageination.totalAmount;
      state.summary.totalSubsidy = res.pageination.totalSubsidy || 0;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

const handleExport = () => {
  let payload = {
    userid: store.state.userinfo.userid,
  };
  request.post("/downloadorderdata", payload).then((res) => {
    if (res && res.code === "200") {
      console.log("https://mvpme82.cloud/data/" + res.data.filename);
      // 调用浏览器下载文件
      const link = document.createElement("a");
      link.href = "https://mvpme82.cloud/data/" + res.data.filename;
      link.download = res.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      ElMessage.error("导出失败！");
    }
  });
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.bi-orders-page {
  min-height: 100%;
  padding: 20px;
  background: #f5f7fb;
}

.filter-card,
.table-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(15, 35, 95, 0.08);
}

.table-card {
  position: relative;
}

.tabs-header-action {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr)) auto;
  gap: 12px;
  align-items: center;
}

.filter-item {
  width: 100%;
}

.summary-strip {
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  background: linear-gradient(120deg, #ecf4ff, #f4f8ff);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #d5e4ff;
}

.amount-card {
  background: linear-gradient(120deg, #e9faf6, #f3fffc);
  border-color: #c7efe3;
}

.subsidy-card {
  background: linear-gradient(120deg, #fff5e9, #fffaf3);
  border-color: #f4ddbc;
}

.summary-label {
  font-size: 14px;
  color: #56627a;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #132d63;
}

.summary-value-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
}

.summary-unit {
  padding-bottom: 4px;
  font-size: 13px;
  color: #6f7f9b;
}

.order-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
  padding-right: 120px;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: #f8f9fd;
}

.table-card :deep(.el-table th.el-table__cell),
.table-card :deep(.el-table td.el-table__cell) {
  text-align: center;
}

.table-card :deep(.el-table th.el-table__cell .cell),
.table-card :deep(.el-table td.el-table__cell .cell) {
  text-align: inherit;
}

.table-card :deep(.el-table th.col-company),
.table-card :deep(.el-table td.col-company) {
  text-align: left;
}

.table-card :deep(.el-table th.col-supplier),
.table-card :deep(.el-table td.col-supplier) {
  text-align: left;
}

@media (max-width: 1366px) {
  .filter-row {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }
}
</style>
