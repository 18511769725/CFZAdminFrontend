<template>
  <div class="m-bi-page">
    <div class="bi-header">
      <h1 class="bi-title">移动端数据驾驶舱</h1>
      <div class="header-actions">
        <el-button
          type="primary"
          size="small"
          :loading="loading"
          @click="refreshData"
          >刷新</el-button
        >
      </div>
    </div>

    <!-- 核心指标条 -->
    <div class="kpi-strip" v-if="!loading || hasLoaded">
      <div class="kpi-card">
        <div class="kpi-label">总账户</div>
        <div class="kpi-value">{{ formatNumber(state.totalAccounts) }}</div>
        <div class="kpi-hint">个</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总产品</div>
        <div class="kpi-value">{{ formatNumber(state.totalProducts) }}</div>
        <div class="kpi-hint">个</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">总订单额</div>
        <div class="kpi-value">{{ formatAmount(state.totalAmount) }}</div>
        <div class="kpi-hint">元</div>
      </div>
    </div>

    <el-skeleton :rows="12" animated v-if="loading && !hasLoaded" />

    <template v-else>
      <!-- 账户开通概览 -->
      <div class="section">
        <div class="section-title">账户开通概览</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">开通企业</div>
            <div class="stat-value primary">
              {{ formatNumber(state.totalCompanies) }}
            </div>
            <div class="stat-change" v-if="state.recentCompanies > 0">
              ↑{{ formatNumber(state.recentCompanies) }}
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-label">开通账号</div>
            <div class="stat-value primary">
              {{ formatNumber(state.totalAccounts) }}
            </div>
            <div class="stat-change" v-if="state.recentAccounts > 0">
              ↑{{ formatNumber(state.recentAccounts) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 产品线统计 -->
      <div class="section">
        <div class="section-title">产品线统计</div>
        <div class="product-list">
          <div
            class="product-item"
            v-for="line in productLines"
            :key="line.key"
          >
            <div class="product-head">
              <span class="product-name">{{ line.name }}</span>
              <span class="product-count">{{ formatNumber(line.total) }}</span>
            </div>
            <div class="product-bar">
              <div
                class="product-bar-fill"
                :style="{ width: getProductPercent(line.total) + '%' }"
              ></div>
            </div>
            <div class="product-sub" v-if="line.recent > 0">
              新增: {{ formatNumber(line.recent) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 订单核心指标 -->
      <div class="section">
        <div class="section-title">订单核心指标</div>
        <div class="order-grid">
          <div class="order-metric">
            <div class="metric-label">有效订单</div>
            <div class="metric-value">
              {{ formatNumber(state.totalOrders) }}
            </div>
          </div>
          <div class="order-metric">
            <div class="metric-label">订单总额</div>
            <div class="metric-value amount">
              {{ formatAmount(state.totalAmount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 订单分类统计 -->
      <div class="section">
        <div class="section-title">订单分类</div>
        <div class="category-list">
          <div
            class="category-item"
            v-for="cat in orderCategories"
            :key="cat.key"
          >
            <div class="category-head">
              <span class="category-name">{{ cat.name }}</span>
              <span class="category-value">{{ formatNumber(cat.orders) }}</span>
            </div>
            <div class="category-sub">
              <span>额度: {{ formatAmount(cat.amount) }}</span>
              <span>补贴: {{ formatAmount(cat.subsidy) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 企业订单TOP10 -->
      <div class="section">
        <div class="section-title">企业订单TOP 10</div>
        <div v-if="state.ccompanyorderdata.length === 0" class="empty-tip">
          暂无企业订单数据
        </div>
        <div v-else class="company-list">
          <div
            class="company-item"
            v-for="(item, idx) in topCompanies"
            :key="idx"
          >
            <div class="rank">{{ idx + 1 }}</div>
            <div class="company-info">
              <div class="company-name">{{ item.ccompanyname }}</div>
              <div class="company-stats">
                <span>订单: {{ formatNumber(item.totalorders) }}</span>
                <span>额: {{ formatAmount(item.totalamount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 产品线企业统计 -->
      <div class="section">
        <div class="section-title">安居企业产品统计</div>
        <div v-if="state.anjudata.length === 0" class="empty-tip">暂无数据</div>
        <div v-else class="product-company-list">
          <div
            class="company-row"
            v-for="(item, idx) in state.anjudata.slice(0, 5)"
            :key="idx"
          >
            <span class="company-name-short">{{ item.bcompanyname }}</span>
            <span class="product-num">{{ item.productcount }} 产品</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";

const loading = ref(false);
const hasLoaded = ref(false);

const state = reactive({
  totalCompanies: 0,
  recentCompanies: 0,
  totalAccounts: 0,
  recentAccounts: 0,
  totalProducts: 0,
  recentProducts: 0,
  anjuProducts: 0,
  recentAnjuProducts: 0,
  yuexiangProducts: 0,
  recentYuexiangProducts: 0,
  kanghuProducts: 0,
  recentKanghuProducts: 0,
  totalOrders: 0,
  recentOrders: 0,
  totalAmount: 0,
  recentAmount: 0,
  anjuOrders: 0,
  recentAnjuOrders: 0,
  anjuAmount: 0,
  recentAnjuAmount: 0,
  yuexiangOrders: 0,
  recentYuexiangOrders: 0,
  yuexiangAmount: 0,
  recentYuexiangAmount: 0,
  kanghuOrders: 0,
  recentKanghuOrders: 0,
  kanghuAmount: 0,
  recentKanghuAmount: 0,
  anjudata: [],
  yuexiangdata: [],
  kanghudata: [],
  ccompanyorderdata: [],
});

const formatNumber = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num.toLocaleString("zh-CN") : "--";
};

const formatAmount = (val) => {
  const num = Number(val);
  if (!Number.isFinite(num)) return "--";
  return `¥${(num / 10000).toFixed(2)}万`;
};

const productLines = computed(() => [
  {
    key: "anju",
    name: "安居",
    total: state.anjuProducts,
    recent: state.recentAnjuProducts,
  },
  {
    key: "yuexiang",
    name: "悦享",
    total: state.yuexiangProducts,
    recent: state.recentYuexiangProducts,
  },
  {
    key: "kanghu",
    name: "康护",
    total: state.kanghuProducts,
    recent: state.recentKanghuProducts,
  },
]);

const orderCategories = computed(() => [
  {
    key: "anju",
    name: "安居",
    orders: state.anjuOrders,
    amount: state.anjuAmount,
    subsidy: state.anjuAmount - state.anjuAmount * 0.8, // 简化计算
  },
  {
    key: "yuexiang",
    name: "悦享",
    orders: state.yuexiangOrders,
    amount: state.yuexiangAmount,
    subsidy: state.yuexiangAmount - state.yuexiangAmount * 0.8,
  },
  {
    key: "kanghu",
    name: "康护",
    orders: state.kanghuOrders,
    amount: state.kanghuAmount,
    subsidy: state.kanghuAmount - state.kanghuAmount * 0.8,
  },
]);

const topCompanies = computed(() => {
  return state.ccompanyorderdata
    .sort((a, b) => (Number(b.totalamount) || 0) - (Number(a.totalamount) || 0))
    .slice(0, 10);
});

const getProductPercent = (val) => {
  const maxProduct = Math.max(...productLines.value.map((p) => p.total), 1);
  return (val / maxProduct) * 100;
};

const getAccountData = async () => {
  try {
    const res = await request.post("/getAccountDataForBI", {});
    if (res?.retcode === "200") {
      state.totalCompanies = res.data.totalCompanies || 0;
      state.recentCompanies = res.data.recentCompanies || 0;
      state.totalAccounts = res.data.totalAccounts || 0;
      state.recentAccounts = res.data.recentAccounts || 0;
    }
  } catch (error) {
    console.error("获取账户数据异常：", error);
  }
};

const getProductData = async () => {
  try {
    const res = await request.post("/getProductDataForBI", {});
    if (res?.retcode === "200") {
      state.totalProducts = res.data.totalProducts || 0;
      state.recentProducts = res.data.recentProducts || 0;
      state.anjuProducts = res.data.anjuProducts || 0;
      state.recentAnjuProducts = res.data.recentAnjuProducts || 0;
      state.yuexiangProducts = res.data.yuexiangProducts || 0;
      state.recentYuexiangProducts = res.data.recentYuexiangProducts || 0;
      state.kanghuProducts = res.data.kanghuProducts || 0;
      state.recentKanghuProducts = res.data.recentKanghuProducts || 0;
    }
  } catch (error) {
    console.error("获取产品数据异常：", error);
  }
};

const getOrderData = async () => {
  try {
    const res = await request.post("/getOrderDataForBI", {});
    if (res?.retcode === "200") {
      state.totalOrders = res.data.totalOrders || 0;
      state.recentOrders = res.data.recentOrders || 0;
      state.totalAmount = res.data.totalAmount || 0;
      state.recentAmount = res.data.recentAmount || 0;
      state.anjuOrders = res.data.anjuOrders || 0;
      state.recentAnjuOrders = res.data.recentAnjuOrders || 0;
      state.anjuAmount = res.data.anjuAmount || 0;
      state.recentAnjuAmount = res.data.recentAnjuAmount || 0;
      state.yuexiangOrders = res.data.yuexiangOrders || 0;
      state.recentYuexiangOrders = res.data.recentYuexiangOrders || 0;
      state.yuexiangAmount = res.data.yuexiangAmount || 0;
      state.recentYuexiangAmount = res.data.recentYuexiangAmount || 0;
      state.kanghuOrders = res.data.kanghuOrders || 0;
      state.recentKanghuOrders = res.data.recentKanghuOrders || 0;
      state.kanghuAmount = res.data.kanghuAmount || 0;
      state.recentKanghuAmount = res.data.recentKanghuAmount || 0;
    }
  } catch (error) {
    console.error("获取订单数据异常：", error);
  }
};

const getCompanyProductData = async (categoryid) => {
  try {
    const res = await request.post("/getCompanyProductDataForBI", {
      categoryid,
    });
    if (res?.code === "200" || res?.retcode === "200") {
      if (categoryid === "0") {
        state.anjudata = res.data || [];
      } else if (categoryid === "1") {
        state.yuexiangdata = res.data || [];
      } else if (categoryid === "2") {
        state.kanghudata = res.data || [];
      }
    }
  } catch (error) {
    console.error("获取产品数据异常：", error);
  }
};

const getCompanyOrderData = async () => {
  try {
    const res = await request.post("/getCCompanyOrderDataForBI", {});
    const retcode = res?.retcode ?? res?.code;
    if (retcode === "200" || retcode === 200) {
      if (Array.isArray(res?.data)) {
        state.ccompanyorderdata = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        state.ccompanyorderdata = res.data.data;
      } else {
        state.ccompanyorderdata = [];
      }
    }
  } catch (error) {
    console.error("获取企业订单数据异常：", error);
    state.ccompanyorderdata = [];
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      getAccountData(),
      getProductData(),
      getOrderData(),
      getCompanyProductData("0"),
      getCompanyProductData("1"),
      getCompanyProductData("2"),
      getCompanyOrderData(),
    ]);
    hasLoaded.value = true;
  } catch (error) {
    ElMessage.error("数据加载失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  refreshData();
});
</script>

<style lang="scss" scoped>
.m-bi-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f8ff 0%, #ffffff 100%);
  padding: 12px;
  padding-bottom: 80px; // 预留tabbar空间
}

.bi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;

  .bi-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #13233f;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

// KPI指标条
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.kpi-card {
  background: linear-gradient(135deg, #0f5fd8 0%, #1875f5 100%);
  color: white;
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(15, 95, 216, 0.2);

  .kpi-label {
    font-size: 11px;
    opacity: 0.9;
    margin-bottom: 6px;
  }

  .kpi-value {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .kpi-hint {
    font-size: 10px;
    opacity: 0.8;
  }
}

// 章节
.section {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #13233f;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f3f8;
}

// 统计网格
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-box {
  background: linear-gradient(135deg, #f5f8ff 0%, #fafbff 100%);
  border: 1px solid #e8ecf5;
  border-radius: 10px;
  padding: 12px;
  text-align: center;

  .stat-label {
    font-size: 12px;
    color: #63738e;
    margin-bottom: 6px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;

    &.primary {
      color: #0f5fd8;
    }
  }

  .stat-change {
    font-size: 11px;
    color: #008f6f;
    font-weight: 600;
  }
}

// 产品线列表
.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  background: #fafbff;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #0f5fd8;

  .product-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .product-name {
      font-size: 13px;
      font-weight: 600;
      color: #13233f;
    }

    .product-count {
      font-size: 16px;
      font-weight: 700;
      color: #0f5fd8;
    }
  }

  .product-bar {
    height: 6px;
    background: #e8ecf5;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;

    .product-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #0f5fd8, #1875f5);
      border-radius: 3px;
    }
  }

  .product-sub {
    font-size: 11px;
    color: #63738e;
  }
}

// 订单指标网格
.order-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.order-metric {
  background: linear-gradient(135deg, #fafbff 0%, #f5f8ff 100%);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #e8ecf5;

  .metric-label {
    font-size: 12px;
    color: #63738e;
    margin-bottom: 6px;
  }

  .metric-value {
    font-size: 18px;
    font-weight: 700;
    color: #13233f;

    &.amount {
      color: #b45309;
    }
  }
}

// 分类列表
.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  background: #fafbff;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #008f6f;

  .category-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;

    .category-name {
      font-size: 13px;
      font-weight: 600;
      color: #13233f;
    }

    .category-value {
      font-size: 14px;
      font-weight: 700;
      color: #008f6f;
    }
  }

  .category-sub {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #63738e;

    span {
      flex: 1;
    }
  }
}

// 企业TOP列表
.company-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d7e1f4;
    border-radius: 2px;
  }
}

.company-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafbff;
  border-radius: 8px;
  padding: 10px;
  border-left: 3px solid #b45309;

  .rank {
    min-width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #b45309, #d97706);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
  }

  .company-info {
    flex: 1;
    min-width: 0;

    .company-name {
      font-size: 13px;
      font-weight: 600;
      color: #13233f;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .company-stats {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #63738e;
      margin-top: 4px;

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// 产品企业列表
.product-company-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.company-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafbff;
  padding: 10px;
  border-radius: 6px;
  border-left: 2px solid #0f5fd8;
  font-size: 12px;

  .company-name-short {
    flex: 1;
    font-weight: 600;
    color: #13233f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-num {
    color: #0f5fd8;
    font-weight: 600;
    min-width: fit-content;
    margin-left: 8px;
  }
}

// 空状态
.empty-tip {
  text-align: center;
  padding: 20px;
  color: #63738e;
  font-size: 12px;
}

// 骨架屏适配
:deep(.el-skeleton) {
  padding: 0;
}
</style>
