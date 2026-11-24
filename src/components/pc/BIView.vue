<template>
  <div class="bi-page">
    <div class="bi-header">
      <div>
        <h1 class="bi-title">平台数据驾驶舱</h1>
        <p class="bi-subtitle">企业账号、服务资源与订单情况总览</p>
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
          <div class="overview-value-row">
            <div class="overview-value">
              {{ formatMetric(item.value, item.type) }}
            </div>
            <div class="overview-note">{{ item.note }}</div>
          </div>
        </div>
      </div>

      <div class="section section-account">
        <div class="section-head">
          <h2>企业账号开通情况</h2>
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
                <div class="metric-value-row">
                  <div class="metric-value">
                    {{ formatMetric(item.value, item.type) }}
                  </div>
                  <div v-if="item.note" class="metric-note">
                    {{ item.note }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="group.summaryMetrics?.length" class="summary-strip">
              <div
                v-for="item in group.summaryMetrics"
                :key="item.key"
                class="summary-pill"
                :class="item.tone"
              >
                <span class="summary-label">{{ item.label }}</span>
                <strong class="summary-value">
                  {{ formatMetric(item.value, item.type) }}
                  <em v-if="item.note">{{ item.note }}</em>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section section-order">
        <div class="section-head">
          <h2>平台订单数量</h2>
        </div>

        <div class="platform-metrics-grid platform-metrics-grid-3">
          <div
            class="metric-card"
            v-for="item in orderPlatformMetrics"
            :key="item.key"
            :class="item.tone"
          >
            <div class="metric-label">{{ item.label }}</div>
            <div class="metric-value-row">
              <div class="metric-value">
                {{ formatMetric(item.value, item.type) }}
              </div>
              <div v-if="item.note" class="metric-note">{{ item.note }}</div>
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

      <div class="section section-order-company">
        <div class="section-head">
          <h2>企业订单汇总</h2>
          <span>按企业统计各产品线订单与补贴情况</span>
        </div>
        <el-table
          :data="state.ccompanyorderdata"
          style="width: 100%"
          border
          stripe
          class="company-order-table"
        >
          <el-table-column label="序号" width="56">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            prop="ccompanyname"
            label="企业名称"
            min-width="180"
            class-name="col-company"
            label-class-name="col-company"
          />
          <el-table-column label="企业等级" min-width="88">
            <template #default="scope">
              {{ showcompanygrade(scope.row.ccompanygrade) }}
            </template>
          </el-table-column>
          <el-table-column label="订单总数" min-width="96">
            <template #default="scope">
              {{ formatMetric(scope.row.totalorders, "count") }}
            </template>
          </el-table-column>
          <el-table-column label="订单总额" min-width="150">
            <template #default="scope">
              {{ formatMetric(scope.row.totalamount, "amount") }}
            </template>
          </el-table-column>
          <el-table-column label="服务总额" min-width="150">
            <template #default="scope">
              {{ formatMetric(scope.row.totalsubsidy, "amount") }}
            </template>
          </el-table-column>
          <el-table-column label="安居订单总数" min-width="108">
            <template #default="scope">
              {{ formatMetric(scope.row.anjuorders, "count") }}
            </template>
          </el-table-column>
          <el-table-column label="安居订单总额" min-width="150">
            <template #default="scope">
              {{ formatMetric(scope.row.anjuamount, "amount") }}
            </template>
          </el-table-column>
          <el-table-column label="安居服务总额" min-width="150">
            <template #default="scope">
              {{ formatMetric(scope.row.anjusubsidy, "amount") }}
            </template>
          </el-table-column>
          <el-table-column label="悦享订单总数" min-width="108">
            <template #default="scope">
              {{ formatMetric(scope.row.yuexiangorders, "count") }}
            </template>
          </el-table-column>
          <el-table-column label="悦享服务总额" min-width="150">
            <template #default="scope">
              {{ formatMetric(scope.row.yuexiangsubsidy, "amount") }}
            </template>
          </el-table-column>
          <el-table-column label="康护订单总数" min-width="108">
            <template #default="scope">
              {{ formatMetric(scope.row.kanghuorders, "count") }}
            </template>
          </el-table-column>
          <el-table-column label="康护服务总额" min-width="150">
            <template #default="scope">
              {{ formatMetric(scope.row.kanghusubsidy, "amount") }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="section section-product">
        <div class="section-head">
          <h2>各板块服务资源</h2>
        </div>

        <div class="platform-metrics-grid">
          <div
            class="metric-card"
            v-for="item in productPlatformMetrics"
            :key="item.key"
            :class="item.tone"
          >
            <div class="metric-label">{{ item.label }}</div>
            <div class="metric-value-row">
              <div class="metric-value">
                {{ formatMetric(item.value, item.type) }}
              </div>
              <div v-if="item.note" class="metric-note">{{ item.note }}</div>
            </div>
          </div>
        </div>

        <div class="line-grid">
          <div
            class="line-card"
            v-for="line in bcompanyMetrics"
            :key="line.key"
          >
            <div class="line-head">{{ line.name }}</div>
            <div class="line-body">
              <div class="line-item">
                <span>供应商数</span>
                <div class="line-value-row">
                  <strong>{{
                    formatMetric(
                      line.supplierCount.value,
                      line.supplierCount.type,
                    )
                  }}</strong>
                  <span class="line-value-unit">家</span>
                </div>
              </div>
              <div class="line-item" :class="line.productCount.tone">
                <span>产品项目数</span>
                <div class="line-value-row">
                  <strong>{{
                    formatMetric(
                      line.productCount.value,
                      line.productCount.type,
                    )
                  }}</strong>
                  <span class="line-value-unit">项</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="line-grid">
        <!-- 在这里横向我要显示三个表格，分别是安居、悦享、康护的企业产品数据表格，数据来源分别是anjudata、yuexiangdata、kanghudata这三个数组。安居表格的列包括企业名称和对应的项目数量，及产品数量；其他表格为企业名称和对应的产品数量。 -->
        <div
          class="line-card"
          v-for="line in productLineMetrics"
          :key="line.key"
        >
          <div class="line-head">{{ line.name }}企业产品数据</div>
          <el-table
            :data="line.newAdded.data"
            style="width: 100%"
            :header-cell-class-name="'table-header'"
          >
            <el-table-column prop="bcompanyname" label="企业名称" />
            <el-table-column prop="productcount" label="产品数量" />
            <el-table-column
              v-if="line.key === 'anju'"
              prop="packageproductcount"
              label="户型数量"
            />
          </el-table>
        </div>
      </div>

      <div class="section section-usage-statistics">
        <div class="section-head">
          <h2>权益使用量统计分析</h2>
        </div>
        <el-table
          :data="state.usageStatistics"
          style="width: 100%"
          border
          stripe
          class="usage-statistics-table"
        >
          <el-table-column label="序号" width="64" fixed="left">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            prop="ccompanyname"
            label="企业名称"
            min-width="160"
            fixed="left"
          />
          <el-table-column label="安居权益">
            <el-table-column label="免费房源套数" min-width="140">
              <template #default="scope">
                {{ usageNumber(scope.row.freetotalcount) }}套
              </template>
            </el-table-column>
            <el-table-column label="已使用套数" min-width="150">
              <template #default="scope">
                {{ usageNumber(scope.row.freeusedcount) }}套
              </template>
            </el-table-column>
            <el-table-column label="五折房源套数" min-width="140">
              <template #default="scope">
                {{ usageNumber(scope.row.halftotalcount) }}套
              </template>
            </el-table-column>
            <el-table-column label="已使用套数" min-width="150">
              <template #default="scope">
                {{ usageNumber(scope.row.halfusedcount) }}套
              </template>
            </el-table-column>
            <el-table-column label="七折房源套数" min-width="140">
              <template #default="scope">
                {{ usageNumber(scope.row.lesstotalcount) }}套
              </template>
            </el-table-column>
            <el-table-column label="已使用套数" min-width="150">
              <template #default="scope">
                {{ usageNumber(scope.row.lessusedcount) }}套
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="悦享权益">
            <el-table-column label="总授予额度" min-width="130">
              <template #default="scope">
                {{ usageNumber(scope.row.yuexiangtotalcredit) }}积分
              </template>
            </el-table-column>
            <el-table-column label="已使用额度" min-width="130">
              <template #default="scope">
                {{ usageNumber(scope.row.yuexiangusedcredit) }}积分
              </template>
            </el-table-column>
            <el-table-column label="额度使用占比" min-width="130">
              <template #default="scope">
                {{ usageCreditRate(scope.row) }}%
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="康护权益">
            <el-table-column
              prop="kanghuproducttitle"
              label="康护服务名称"
              min-width="160"
            />
            <el-table-column label="康护服务总价" min-width="140">
              <template #default="scope">
                {{ usageNumber(scope.row.kanghutotalprice) }}积分
              </template>
            </el-table-column>
            <el-table-column label="康护服务人数" min-width="120">
              <template #default="scope">
                {{ usageNumber(scope.row.kanghuusepersons) }}人
              </template>
            </el-table-column>
            <el-table-column label="康护服务使用状态" min-width="150">
              <template #default="scope">
                {{ usageStatus(scope.row.kanghuusestatus) }}
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";
import { useRangePicker } from "element-plus/es/components/date-picker/src/composables/use-range-picker.mjs";

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
  totalSuppliers: 0,
  usageStatistics: [],
});

const showcompanygrade = (grade) => {
  if (grade === null || grade === undefined) {
    return "--";
  } else if (grade === 1) {
    return "总部型";
  } else if (grade === 2) {
    return "领军型";
  } else if (grade === 3) {
    return "领跑型";
  } else if (grade === 4) {
    return "潜力型";
  }
};

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

const usageNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  return value;
};

const usageCreditRate = (row) => {
  const total = Number(row?.yuexiangtotalcredit || 0);
  const used = Number(row?.yuexiangusedcredit || 0);
  if (!Number.isFinite(total) || !Number.isFinite(used) || total === 0) {
    return 0;
  }
  return ((used / total) * 100).toFixed(2);
};

const usageStatus = (status) => {
  if (status === "USED") {
    return "已使用";
  }
  if (status === "UNUSED") {
    return "未使用";
  }
  return usageNumber(status);
};

const accountMetrics = computed(() => [
  {
    key: "account_company_total",
    label: "累计开通账户企业数量",
    value: state.totalCompanies,
    type: "count",
    tone: "tone-primary",
    note: "家",
  },
  {
    key: "account_company_7d",
    label: "7日内开通账户企业数量",
    value: state.recentCompanies,
    type: "count",
    tone: "tone-rise",
    note: "家",
  },
  {
    key: "account_company_zongbu",
    label: "总部企业",
    value: state.zongbuCompanies,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "account_company_lingjun",
    label: "领军企业",
    value: state.lingjunCompanies,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "account_company_lingpao",
    label: "领跑企业",
    value: state.lingpaoCompanies,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "account_company_qianli",
    label: "潜力企业",
    value: state.qianliCompanies,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "account_total",
    label: "配套开通企业操作账号",
    value: state.totalAccounts,
    type: "count",
    tone: "tone-primary",
    note: "个",
  },
  {
    key: "account_7d",
    label: "7日内开通账号数量",
    value: state.recentAccounts,
    type: "count",
    tone: "tone-rise",
    note: "个",
  },
  {
    key: "account_zongbu",
    label: "总部企业账号",
    value: state.zongbuAccounts,
    type: "count",
    tone: "tone-sub",
    note: "个",
  },
  {
    key: "account_lingjun",
    label: "领军企业账号",
    value: state.lingjunAccounts,
    type: "count",
    tone: "tone-sub",
    note: "个",
  },
  {
    key: "account_lingpao",
    label: "领跑企业账号",
    value: state.lingpaoAccounts,
    type: "count",
    tone: "tone-sub",
    note: "个",
  },
  {
    key: "account_qianli",
    label: "潜力企业账号",
    value: state.qianliAccounts,
    type: "count",
    tone: "tone-sub",
    note: "个",
  },
]);

const productMetrics = computed(() => [
  {
    key: "product_total",
    label: "上线服务资源",
    value: state.totalProducts,
    type: "count",
    tone: "tone-primary",
    note: "项",
  },
  {
    key: "total_supplier_count",
    label: "合作供应商总数",
    value: state.totalSuppliers,
    type: "count",
    tone: "tone-primary",
    note: "家",
  },
  {
    key: "product_7d",
    label: "7日内新增产品数",
    value: state.recentProducts,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "anju_supplier_count",
    label: "安居供应商数",
    value: state.anjuSuppliers,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "anju_product_total",
    label: "安居产品总数",
    value: state.anjuProducts,
    type: "count",
    tone: "tone-sub",
    note: "项",
  },
  {
    key: "anju_product_7d",
    label: "安居产品7日新增",
    value: state.recentAnjuProducts,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "yuexiang_supplier_count",
    label: "悦享供应商数",
    value: state.yuexiangSuppliers,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "yuexiang_product_total",
    label: "悦享产品总数",
    value: state.yuexiangProducts,
    type: "count",
    tone: "tone-sub",
    note: "项",
  },
  {
    key: "yuexiang_product_7d",
    label: "悦享产品7日新增",
    value: state.recentYuexiangProducts,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "kanghu_supplier_count",
    label: "康护供应商数",
    value: state.kanghuSuppliers,
    type: "count",
    tone: "tone-sub",
    note: "家",
  },
  {
    key: "kanghu_product_total",
    label: "康护产品总数",
    value: state.kanghuProducts,
    type: "count",
    tone: "tone-sub",
    note: "项",
  },
  {
    key: "kanghu_product_7d",
    label: "康护产品7日新增",
    value: state.recentKanghuProducts,
    type: "count",
    tone: "tone-rise",
  },
]);

const orderMetrics = computed(() => [
  {
    key: "order_total_valid",
    label: "累计订单总数",
    value: state.totalOrders,
    type: "count",
    tone: "tone-primary",
    note: "件",
  },
  {
    key: "served_company_total",
    label: "服务企业总数",
    value: state.ccompanyorderdata.length,
    type: "count",
    tone: "tone-primary",
    note: "家",
  },
  {
    key: "order_7d_valid",
    label: "7日新增订单总数",
    value: state.recentOrders,
    type: "count",
    tone: "tone-rise",
    note: "件",
  },
  {
    key: "order_total_valid_amount",
    label: "累计合同金额",
    value: toWanyuan(state.totalAmount),
    type: "amount",
    tone: "tone-amount",
    note: "万元",
  },
  {
    key: "order_total_subsidy_amount",
    label: "累计服务金额",
    value: toWanyuan(state.totalSubsidy),
    type: "amount",
    tone: "tone-amount",
    note: "万元",
  },
  {
    key: "order_7d_valid_amount",
    label: "7日新增有效合同金额",
    value: state.recentAmount,
    type: "amount",
    tone: "tone-amount",
    note: "元",
  },
  {
    key: "anju_order_total",
    label: "安居板块订单总数",
    value: state.anjuOrders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "anju_order_total_amount",
    label: "安居板块服务金额",
    value: state.anjuAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "anju_order_7d",
    label: "7日新增安居订单数",
    value: state.recentAnjuOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "anju_order_7d_amount",
    label: "7日新增安居服务金额",
    value: state.recentAnjuAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "yuexiang_order_total",
    label: "悦享板块订单总数",
    value: state.yuexiangOrders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "yuexiang_order_total_amount",
    label: "悦享板块服务金额",
    value: state.yuexiangAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "yuexiang_order_7d",
    label: "7日新增悦享订单数",
    value: state.recentYuexiangOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "yuexiang_order_7d_amount",
    label: "7日新增悦享服务金额",
    value: state.recentYuexiangAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "kanghu_order_total",
    label: "康护板块订单总数",
    value: state.kanghuOrders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "kanghu_order_total_amount",
    label: "康护板块服务金额",
    value: state.kanghuAmount,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "kanghu_order_7d",
    label: "7日新增康护板块订单总数",
    value: state.recentKanghuOrders,
    type: "count",
    tone: "tone-rise",
  },
  {
    key: "kanghu_order_7d_amount",
    label: "7日新增康护服务金额",
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

// 保留两位小数
const toWanyuan = (num) => {
  if (!Number.isFinite(num)) {
    return null;
  }
  return Number((num / 10000).toFixed(2));
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
    ...getMetric(orderMetricMap, "order_total_valid", "订单总数"),
    note: "件",
  },
  {
    ...getMetric(orderMetricMap, "served_company_total", "服务企业数"),
    note: "家",
  },
  {
    ...getMetric(
      orderMetricMap,
      "order_total_valid_amount",
      "累计合同金额",
      "amount",
    ),
    note: "万元",
  },
  {
    ...getMetric(
      orderMetricMap,
      "order_total_subsidy_amount",
      "累计服务金额",
      "amount",
    ),
    note: "万元",
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
    summaryMetrics: [
      getMetric(accountMetricMap, "account_company_zongbu", "总部企业"),
      getMetric(accountMetricMap, "account_company_lingjun", "领军企业"),
      getMetric(accountMetricMap, "account_company_lingpao", "领跑企业"),
      getMetric(accountMetricMap, "account_company_qianli", "潜力企业"),
    ],
  },
  {
    key: "user",
    title: "账号开通维度",
    metrics: [
      getMetric(accountMetricMap, "account_total", "配套开通企业操作账号"),
      getMetric(accountMetricMap, "account_7d", "7日内开通账号数量"),
    ],
    summaryMetrics: [
      getMetric(accountMetricMap, "account_zongbu", "总部企业账号"),
      getMetric(accountMetricMap, "account_lingjun", "领军企业账号"),
      getMetric(accountMetricMap, "account_lingpao", "领跑企业账号"),
      getMetric(accountMetricMap, "account_qianli", "潜力企业账号"),
    ],
  },
]);

const productPlatformMetrics = computed(() => [
  getMetric(productMetricMap, "total_supplier_count", "合作供应商总数"),
  getMetric(productMetricMap, "product_total", "平台总产品数量"),
]);

// 构造一个展示每个分类产品的供应商数和服务资源项目数的数组
const bcompanyMetrics = computed(() => [
  {
    key: "anju",
    name: "安居",
    supplierCount: getMetric(
      productMetricMap,
      "anju_supplier_count",
      "安居供应商总数",
    ),
    productCount: getMetric(
      productMetricMap,
      "anju_product_total",
      "安居产品总数",
    ),
  },
  {
    key: "yuexiang",
    name: "悦享",
    supplierCount: getMetric(
      productMetricMap,
      "yuexiang_supplier_count",
      "悦享供应商总数",
    ),
    productCount: getMetric(
      productMetricMap,
      "yuexiang_product_total",
      "悦享产品总数",
    ),
  },
  {
    key: "kanghu",
    name: "康护",
    supplierCount: getMetric(
      productMetricMap,
      "kanghu_supplier_count",
      "康护供应商总数",
    ),
    productCount: getMetric(
      productMetricMap,
      "kanghu_product_total",
      "康护产品总数",
    ),
  },
]);
// 需要给productLineMetrics中每个产品线底部增加一个表格，展示该产品线下的所有企业的产品数，对应的数组分别为anjudata、yuexiangdata、kanghudata
const productLineMetrics = computed(() => [
  {
    key: "anju",
    name: "安居",
    total: getMetric(productMetricMap, "anju_product_total", "安居产品总数"),
    newAdded: {
      key: "anju_product_7d_placeholder",
      label: "7日新增",
      value: state.recentAnjuProducts,
      type: "count",
      tone: "tone-sub",
      data: state.anjudata,
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
    newAdded: {
      key: "yuexiang_product_7d_placeholder",
      label: "7日新增",
      value: state.recentYuexiangProducts,
      type: "count",
      tone: "tone-sub",
      data: state.yuexiangdata,
    },
  },
  {
    key: "kanghu",
    name: "康护",
    total: getMetric(productMetricMap, "kanghu_product_total", "康护产品总数"),
    newAdded: {
      key: "kanghu_product_7d_placeholder",
      label: "7日新增",
      value: state.recentKanghuProducts,
      type: "count",
      tone: "tone-sub",
      data: state.kanghudata,
    },
  },
]);

const orderPlatformMetrics = computed(() => [
  getMetric(orderMetricMap, "order_total_valid", "累计订单总数"),
  getMetric(orderMetricMap, "order_7d_valid", "7日新增订单总数"),
  getMetric(
    orderMetricMap,
    "order_total_valid_amount",
    "累计合同金额",
    "amount",
  ),
  getMetric(
    orderMetricMap,
    "order_total_subsidy_amount",
    "累计服务金额",
    "amount",
  ),
]);

const orderLineMetrics = computed(() => [
  {
    key: "anju",
    name: "安居",
    metrics: [
      getMetric(orderMetricMap, "anju_order_total", "订单总数"),
      getMetric(
        orderMetricMap,
        "anju_order_total_amount",
        "订单总额度",
        "amount",
      ),
      getMetric(orderMetricMap, "anju_order_7d", "7日新增订单总数"),
      getMetric(
        orderMetricMap,
        "anju_order_7d_amount",
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
      state.zongbuCompanies = res.data.zongbuCompanies || 0;
      state.lingjunCompanies = res.data.lingjunCompanies || 0;
      state.lingpaoCompanies = res.data.lingpaoCompanies || 0;
      state.qianliCompanies = res.data.qianliCompanies || 0;
      state.zongbuAccounts = res.data.zongbuAccounts || 0;
      state.lingjunAccounts = res.data.lingjunAccounts || 0;
      state.lingpaoAccounts = res.data.lingpaoAccounts || 0;
      state.qianliAccounts = res.data.qianliAccounts || 0;
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
      state.recentAnjuProducts = res.data.recentAnjuProducts || 0;
      state.yuexiangProducts = res.data.yuexiangProducts || 0;
      state.recentYuexiangProducts = res.data.recentYuexiangProducts || 0;
      state.kanghuProducts = res.data.kanghuProducts || 0;
      state.recentKanghuProducts = res.data.recentKanghuProducts || 0;
      state.totalSuppliers = res.data.totalsuppliercount || 0;
      state.anjuSuppliers = res.data.anjucompanies || 0;
      state.yuexiangSuppliers = res.data.yuexiangcompanies || 0;
      state.kanghuSuppliers = res.data.kanghucompanies || 0;
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
      state.totalSubsidy = res.data.totalSubsidy || 0;
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

const getcompanyproductsdata = (categoryaid) => {
  let payload = {
    categoryid: categoryaid,
  };
  request
    .post("/getCompanyProductDataForBI", payload)
    .then((res) => {
      console.log("获取企业产品数据接口返回：", res);
      if (res && res.code === "200") {
        if (categoryaid === "0") {
          state.anjudata = res.data || [];
        } else if (categoryaid === "1") {
          state.yuexiangdata = res.data || [];
        } else if (categoryaid === "2") {
          state.kanghudata = res.data || [];
        }
        console.log("获取企业产品数据成功：", res.data);
      } else {
        console.log("获取企业产品数据失败");
      }
    })
    .catch((error) => {
      console.log("获取企业产品数据异常：", error);
    });
};

const getccompanyorderdata = () => {
  let payload = {};
  request
    .post("/getCCompanyOrderDataForBI", payload)
    .then((res) => {
      console.log("获取企业订单数据接口返回：", res);
      const retcode = res?.retcode ?? res?.code;
      if (retcode === "200" || retcode === 200) {
        if (Array.isArray(res?.data)) {
          state.ccompanyorderdata = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          state.ccompanyorderdata = res.data.data;
        } else {
          state.ccompanyorderdata = [];
        }
        console.log("获取企业订单数据成功：", state.ccompanyorderdata);
      } else {
        console.log("获取企业订单数据失败");
        state.ccompanyorderdata = [];
      }
    })
    .catch((error) => {
      console.log("获取企业订单数据异常：", error);
      state.ccompanyorderdata = [];
    });
};

const getuseagestatistics = () => {
  let payload = {
    departmentid: "0",
  };
  request
    .post("/getstatisticsofusage", payload)
    .then((res) => {
      if (res && res.code === "200") {
        // 处理使用统计数据
        state.usageStatistics = res.data.companies || [];
      } else {
        console.log("获取使用统计数据失败");
      }
    })
    .catch((error) => {
      console.log("获取使用统计数据异常：", error);
    });
};

onMounted(() => {
  fetchBiData();
  getcompanyproductsdata("0");
  getcompanyproductsdata("1");
  getcompanyproductsdata("2");
  getccompanyorderdata();
  getuseagestatistics();
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.overview-value-row {
  margin-top: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
}

.overview-note {
  padding-bottom: 4px;
  font-size: 14px;
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

.summary-strip {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  min-width: 0;
}

.summary-label {
  color: var(--text-sub);
}

.summary-value {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-size: 13px;
  font-weight: 700;
  color: inherit;
}

.summary-value em {
  font-style: normal;
  font-size: 11px;
  color: var(--text-sub);
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

.line-value-row {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
}

.line-value-unit {
  font-size: 12px;
  color: var(--text-sub);
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

.metric-value-row {
  margin-top: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
}

.metric-value-row .metric-value {
  margin-top: 0;
}

.metric-note {
  padding-bottom: 3px;
  font-size: 13px;
  color: var(--text-sub);
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

.company-order-table :deep(.el-table__cell .cell) {
  white-space: nowrap;
  text-align: inherit;
}

.company-order-table :deep(.el-table__cell) {
  text-align: center;
}

.company-order-table :deep(.col-company) {
  text-align: left;
}

.usage-statistics-table :deep(.el-table__cell),
.usage-statistics-table :deep(.el-table__cell .cell) {
  text-align: center;
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
