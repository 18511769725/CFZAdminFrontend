<template>
  <div class="bi-page">
    <div class="bi-header">
      <div>
        <h1 class="bi-title">平台数据驾驶舱</h1>
        <p class="bi-subtitle">系统账户、产品与订单核心经营指标总览</p>
      </div>
      <div class="bi-actions">
        <div class="updated-at">最近更新：{{ updatedAtText }}</div>
        <el-button type="primary" :loading="loading" @click="fetchBiData"
          >刷新数据</el-button
        >
      </div>
    </div>

    <el-skeleton :rows="8" animated v-if="loading && !hasLoaded" />

    <template v-else>
      <div class="overview-strip">
        <div
          class="overview-card"
          v-for="item in overviewMetrics"
          :key="item.key"
          :class="item.tone"
        >
          <div class="overview-top">{{ item.label }}</div>
          <div class="overview-value">
            {{ formatMetric(item.value, item.type) }}
          </div>
          <div class="overview-note">{{ item.note }}</div>
        </div>
      </div>

      <div class="section section-account">
        <div class="section-head">
          <h2>系统账户开通情况</h2>
          <span>区分企业开通与账号开通两个维度</span>
        </div>
        <div class="duo-group-grid">
          <div
            class="duo-group"
            v-for="group in accountGroups"
            :key="group.key"
          >
            <div class="duo-title">{{ group.title }}</div>
            <div class="duo-metrics">
              <div
                class="metric-card"
                v-for="item in group.metrics"
                :key="item.key"
                :class="item.tone"
              >
                <div class="metric-label">{{ item.label }}</div>
                <div class="metric-value">
                  {{ formatMetric(item.value, item.type) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section section-product">
        <div class="section-head">
          <h2>平台产品数量</h2>
          <span>先看平台盘子，再看各产品线</span>
        </div>

        <div class="platform-metrics-grid">
          <div
            class="metric-card"
            v-for="item in productPlatformMetrics"
            :key="item.key"
            :class="item.tone"
          >
            <div class="metric-label">{{ item.label }}</div>
            <div class="metric-value">
              {{ formatMetric(item.value, item.type) }}
            </div>
          </div>
        </div>

        <div class="line-grid">
          <div
            class="line-card"
            v-for="line in productLineMetrics"
            :key="line.key"
          >
            <div class="line-head">{{ line.name }}</div>
            <div class="line-body">
              <div class="line-item">
                <span>产品总数</span>
                <strong>{{
                  formatMetric(line.total.value, line.total.type)
                }}</strong>
              </div>
              <div class="line-item" :class="line.newAdded.tone">
                <span>{{ line.newAdded.label }}</span>
                <strong>{{
                  formatMetric(line.newAdded.value, line.newAdded.type)
                }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section section-order">
        <div class="section-head">
          <h2>平台订单数量</h2>
          <span>分平台有效订单与产品线订单结构两层</span>
        </div>

        <div class="platform-metrics-grid platform-metrics-grid-3">
          <div
            class="metric-card"
            v-for="item in orderPlatformMetrics"
            :key="item.key"
            :class="item.tone"
          >
            <div class="metric-label">{{ item.label }}</div>
            <div class="metric-value">
              {{ formatMetric(item.value, item.type) }}
            </div>
          </div>
        </div>

        <div class="order-line-grid">
          <div
            class="order-line-card"
            v-for="line in orderLineMetrics"
            :key="line.key"
          >
            <div class="line-head">{{ line.name }}</div>
            <div class="order-line-body">
              <div
                class="order-item"
                v-for="item in line.metrics"
                :key="item.key"
              >
                <span>{{ item.label }}</span>
                <strong :class="item.tone">{{
                  formatMetric(item.value, item.type)
                }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";

const loading = ref(false);
const hasLoaded = ref(false);
const updatedAt = ref(0);
const biPayload = ref({});

const state = reactive({
  totalCompanies: 0,
  recentCompanies: 0,
  totalAccounts: 0,
  recentAccounts: 0,
  totalProducts: 0,
  recentProducts: 0,
  anjuProducts: 0,
  yuexiangProducts: 0,
  recentYuexiangProducts: 0,
  kanghuProducts: 0,
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
});

const updatedAtText = computed(() => {
  if (!updatedAt.value) {
    return "--";
  }
  return new Date(updatedAt.value).toLocaleString("zh-CN", {
    hour12: false,
  });
});

const getByPath = (obj, path) => {
  if (!obj || !path) {
    return undefined;
  }
  return path.split(".").reduce((acc, cur) => {
    if (acc === null || typeof acc === "undefined") {
      return undefined;
    }
    return acc[cur];
  }, obj);
};

const pickMetric = (...keys) => {
  for (const key of keys) {
    const val = getByPath(biPayload.value, key);
    if (val !== null && val !== "" && typeof val !== "undefined") {
      return val;
    }
  }
  return null;
};

const formatMetric = (value, type = "count") => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return "--";
  }
  if (type === "amount") {
    return `¥${num.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return num.toLocaleString("zh-CN");
};

const accountMetrics = computed(() => [
  {
    key: "account_company_total",
    label: "累计开通账户企业数量",
    value: state.totalCompanies,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "account_company_7d",
    label: "7日内开通账户企业数量",
    value: state.recentCompanies,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "account_total",
    label: "累计开通账号数量",
    value: state.totalAccounts,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "account_7d",
    label: "7日内开通账号数量",
    value: state.recentAccounts,
    type: "count",
    tone: "tone-rise",
  },
]);

const productMetrics = computed(() => [
  {
    key: "product_total",
    label: "平台总产品数量",
    value: state.totalProducts,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "product_7d",
    label: "7日内新增产品数",
    value: state.recentProducts,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "anjv_product_total",
    label: "安居产品总数",
    value: state.anjuProducts,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "yuexiang_product_total",
    label: "悦享产品总数",
    value: state.yuexiangProducts,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "yuexiang_product_7d",
    label: "悦享产品7日新增",
    value: state.recentYuexiangProducts,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "kanghu_product_total",
    label: "康护产品总数",
    value: state.kanghuProducts,
    type: "count",
    tone: "tone-sub",
  },
]);

const orderMetrics = computed(() => [
  {
    key: "order_total_valid",
    label: "订单总数（审批通过且有效）",
    value: state.totalOrders,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "order_7d_valid",
    label: "7日新增订单总数（审批通过且有效）",
    value: state.recentOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "order_total_valid_amount",
    label: "总有效订单额度",
    value: state.totalAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "order_7d_valid_amount",
    label: "7日新增有效订单额度",
    value: state.recentAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "anjv_order_total",
    label: "安居订单总数",
    value: state.anjuOrders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "anjv_order_total_amount",
    label: "安居订单总额度",
    value: state.anjuAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "anjv_order_7d",
    label: "7日新增安居订单总数",
    value: state.recentAnjuOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "anjv_order_7d_amount",
    label: "7日新增安居订单总额度",
    value: state.recentAnjuAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "yuexiang_order_total",
    label: "悦享订单总数",
    value: state.yuexiangOrders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "yuexiang_order_total_amount",
    label: "悦享订单总额度",
    value: state.yuexiangAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "yuexiang_order_7d",
    label: "7日新增悦享订单总数",
    value: state.recentYuexiangOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "yuexiang_order_7d_amount",
    label: "7日新增悦享订单总额度",
    value: state.recentYuexiangAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "kanghu_order_total",
    label: "康护订单总数",
    value: state.kanghuOrders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "kanghu_order_total_amount",
    label: "康护订单总额度",
    value: state.kanghuAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "kanghu_order_7d",
    label: "7日新增康护订单总数",
    value: state.recentKanghuOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "kanghu_order_7d_amount",
    label: "7日新增康护订单总额度",
    value: state.recentKanghuAmount,
    type: "amount",
    tone: "tone-amount",
  },
]);

const mapByKey = (arr) => {
  return arr.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});
};

const accountMetricMap = computed(() => mapByKey(accountMetrics.value));
const productMetricMap = computed(() => mapByKey(productMetrics.value));
const orderMetricMap = computed(() => mapByKey(orderMetrics.value));

const getMetric = (mapRef, key, fallbackLabel, type = "count") => {
  return (
    mapRef.value[key] || {
      key,
      label: fallbackLabel,
      value: null,
      type,
      tone: "tone-sub",
    }
  );
};

const overviewMetrics = computed(() => [
  {
    ...getMetric(accountMetricMap, "account_total", "累计开通账号数量"),
    note: "覆盖平台可用系统账号规模",
  },
  {
    ...getMetric(productMetricMap, "product_total", "平台总产品数量"),
    note: "全平台在售产品总量",
  },
  {
    ...getMetric(
      orderMetricMap,
      "order_total_valid_amount",
      "总有效订单额度",
      "amount",
    ),
    note: "主管审批通过且有效订单额度",
  },
]);

const accountGroups = computed(() => [
  {
    key: "company",
    title: "企业开通维度",
    metrics: [
      getMetric(
        accountMetricMap,
        "account_company_total",
        "累计开通账户企业数量",
      ),
      getMetric(
        accountMetricMap,
        "account_company_7d",
        "7日内开通账户企业数量",
      ),
    ],
  },
  {
    key: "user",
    title: "账号开通维度",
    metrics: [
      getMetric(accountMetricMap, "account_total", "累计开通账号数量"),
      getMetric(accountMetricMap, "account_7d", "7日内开通账号数量"),
    ],
  },
]);

const productPlatformMetrics = computed(() => [
  getMetric(productMetricMap, "product_total", "平台总产品数量"),
  getMetric(productMetricMap, "product_7d", "7日内新增产品数"),
]);

const productLineMetrics = computed(() => [
  {
    key: "anjv",
    name: "安居",
    total: getMetric(productMetricMap, "anjv_product_total", "安居产品总数"),
    newAdded: {
      key: "anjv_product_7d_placeholder",
      label: "7日新增",
      value: null,
      type: "count",
      tone: "tone-sub",
    },
  },
  {
    key: "yuexiang",
    name: "悦享",
    total: getMetric(
      productMetricMap,
      "yuexiang_product_total",
      "悦享产品总数",
    ),
    newAdded: getMetric(
      productMetricMap,
      "yuexiang_product_7d",
      "悦享产品7日新增",
    ),
  },
  {
    key: "kanghu",
    name: "康护",
    total: getMetric(productMetricMap, "kanghu_product_total", "康护产品总数"),
    newAdded: {
      key: "kanghu_product_7d_placeholder",
      label: "7日新增",
      value: null,
      type: "count",
      tone: "tone-sub",
    },
  },
]);

const orderPlatformMetrics = computed(() => [
  getMetric(orderMetricMap, "order_total_valid", "订单总数（审批通过且有效）"),
  getMetric(
    orderMetricMap,
    "order_7d_valid",
    "7日新增订单总数（审批通过且有效）",
  ),
  getMetric(
    orderMetricMap,
    "order_total_valid_amount",
    "总有效订单额度",
    "amount",
  ),
  getMetric(
    orderMetricMap,
    "order_7d_valid_amount",
    "7日新增有效订单额度",
    "amount",
  ),
]);

const orderLineMetrics = computed(() => [
  {
    key: "anjv",
    name: "安居",
    metrics: [
      getMetric(orderMetricMap, "anjv_order_total", "订单总数"),
      getMetric(
        orderMetricMap,
        "anjv_order_total_amount",
        "订单总额度",
        "amount",
      ),
      getMetric(orderMetricMap, "anjv_order_7d", "7日新增订单总数"),
      getMetric(
        orderMetricMap,
        "anjv_order_7d_amount",
        "7日新增订单总额度",
        "amount",
      ),
    ],
  },
  {
    key: "yuexiang",
    name: "悦享",
    metrics: [
      getMetric(orderMetricMap, "yuexiang_order_total", "订单总数"),
      getMetric(
        orderMetricMap,
        "yuexiang_order_total_amount",
        "订单总额度",
        "amount",
      ),
      getMetric(orderMetricMap, "yuexiang_order_7d", "7日新增订单总数"),
      getMetric(
        orderMetricMap,
        "yuexiang_order_7d_amount",
        "7日新增订单总额度",
        "amount",
      ),
    ],
  },
  {
    key: "kanghu",
    name: "康护",
    metrics: [
      getMetric(orderMetricMap, "kanghu_order_total", "订单总数"),
      getMetric(
        orderMetricMap,
        "kanghu_order_total_amount",
        "订单总额度",
        "amount",
      ),
      getMetric(orderMetricMap, "kanghu_order_7d", "7日新增订单总数"),
      getMetric(
        orderMetricMap,
        "kanghu_order_7d_amount",
        "7日新增订单总额度",
        "amount",
      ),
    ],
  },
]);

const normalizeBiPayload = (res) => {
  if (!res || (res.retcode !== 200 && res.retcode !== "200")) {
    return null;
  }
  let payload = res.data;
  if (Array.isArray(payload)) {
    payload = payload[0] || {};
  }
  if (payload && typeof payload === "object" && payload.data) {
    return payload.data;
  }
  return payload || {};
};

const fetchBiData = async () => {
  loading.value = true;
  try {
    getAccountData();
    getProductData();
    getOrderData();
    updatedAt.value = Date.now();
    hasLoaded.value = true;
  } catch (error) {
    ElMessage.error("获取驾驶舱数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const getAccountData = async () => {
  try {
    const res = await request.post("/getAccountDataForBI", {});
    if (res && res.retcode === "200") {
      state.totalCompanies = res.data.totalCompanies || 0;
      state.recentCompanies = res.data.recentCompanies || 0;
      state.totalAccounts = res.data.totalAccounts || 0;
      state.recentAccounts = res.data.recentAccounts || 0;
    } else {
      console.log("获取账户数据失败");
    }
  } catch (error) {
    console.log("获取账户数据异常：", error);
  }
};
const getProductData = async () => {
  try {
    const res = await request.post("/getProductDataForBI", {});
    if (res && res.retcode === "200") {
      state.totalProducts = res.data.totalProducts || 0;
      state.recentProducts = res.data.recentProducts || 0;
      state.anjuProducts = res.data.anjuProducts || 0;
      state.yuexiangProducts = res.data.yuexiangProducts || 0;
      state.recentYuexiangProducts = res.data.recentYuexiangProducts || 0;
      state.kanghuProducts = res.data.kanghuProducts || 0;
    } else {
      console.log("获取产品数据失败");
    }
  } catch (error) {
    console.log("获取产品数据异常：", error);
  }
};
const getOrderData = async () => {
  try {
    const res = await request.post("/getOrderDataForBI", {});
    if (res && res.retcode === "200") {
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
    } else {
      console.log("获取订单数据失败");
    }
  } catch (error) {
    console.log("获取订单数据异常：", error);
  }
};

onMounted(() => {
  fetchBiData();
});
</script>

<style scoped>
.bi-page {
  --bg-1: #e9f2ff;
  --bg-2: #f7f5ff;
  --line: #d7e1f4;
  --text-main: #13233f;
  --text-sub: #63738e;
  --primary: #0f5fd8;
  --rise: #008f6f;
  --amount: #b45309;
  --sub: #35435b;
  position: relative;
  min-height: 100%;
  box-sizing: border-box;
  padding: 24px 24px 30px;
  color: var(--text-main);
  background-color: var(--bg-2);
  background:
    radial-gradient(circle at 90% 0%, #d5f2ff 0%, transparent 42%),
    radial-gradient(circle at 0% 100%, #dfe7ff 0%, transparent 50%),
    linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
}

.bi-header,
.overview-strip,
.section,
.el-skeleton {
  position: relative;
}

.bi-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.bi-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.bi-subtitle {
  margin: 6px 0 0;
  color: var(--text-sub);
  font-size: 14px;
}

.bi-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.updated-at {
  font-size: 13px;
  color: var(--text-sub);
}

.overview-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.overview-card {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.94) 0%,
    #ffffff 100%
  );
  box-shadow: 0 8px 24px rgba(38, 56, 89, 0.08);
}

.overview-top {
  font-size: 13px;
  color: var(--text-sub);
}

.overview-value {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.overview-note {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-sub);
}

.section {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 26px rgba(27, 65, 124, 0.07);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.section-head span {
  font-size: 13px;
  color: var(--text-sub);
}

.duo-group-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.duo-group {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.75);
}

.duo-title {
  font-size: 13px;
  color: var(--text-sub);
  margin-bottom: 10px;
}

.duo-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.platform-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.platform-metrics-grid-3 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.line-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.line-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.line-head {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  background: linear-gradient(180deg, #f2f7ff 0%, #ffffff 100%);
  border-bottom: 1px solid var(--line);
}

.line-body {
  padding: 10px 12px;
  display: grid;
  gap: 8px;
}

.line-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: var(--text-sub);
}

.line-item strong {
  font-size: 16px;
  color: var(--text-main);
}

.order-line-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.order-line-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}

.order-line-body {
  padding: 10px 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.order-item {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: var(--text-sub);
}

.order-item strong {
  font-size: 16px;
  color: var(--text-main);
}

.metric-grid {
  display: grid;
  gap: 12px;
}

.metric-grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid;
  background: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
}

.metric-label {
  min-height: 34px;
  line-height: 1.3;
  font-size: 13px;
}

.metric-value {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.tone-primary {
  border-color: rgba(37, 99, 235, 0.35);
  color: var(--primary);
}

.tone-rise {
  border-color: rgba(5, 150, 105, 0.35);
  color: var(--rise);
}

.tone-amount {
  border-color: rgba(194, 65, 12, 0.35);
  color: var(--amount);
}

.tone-sub {
  border-color: rgba(51, 65, 85, 0.25);
  color: var(--sub);
}

@media (max-width: 1400px) {
  .overview-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .platform-metrics-grid-3,
  .line-grid,
  .order-line-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .bi-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .overview-strip,
  .duo-group-grid,
  .duo-metrics,
  .platform-metrics-grid,
  .platform-metrics-grid-3,
  .line-grid,
  .order-line-grid,
  .order-line-body {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .bi-page {
    padding: 14px;
  }

  .metric-value {
    font-size: 20px;
  }

  .overview-value {
    font-size: 24px;
  }
}
</style>
