<template>
  <div class="bi-page">
    <div class="bi-header">
      <div>
        <h1 class="bi-title">{{ state.departmentname }}</h1>
        <p class="bi-subtitle">账户开通及经营指标总览</p>
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
      <div class="section section-account">
        <div class="section-head">
          <h2>企业账号开通情况</h2>
        </div>
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
        <div class="line-wrapper" v-if="!showDetailTable">
          <button
            class="detail-link-btn"
            type="button"
            @click="openDetailTable"
          >
            查看详细
          </button>
        </div>

        <template v-else>
          <div class="detail-card-header">
            <span class="detail-card-title">账户明细</span>
            <el-button type="text" size="small" @click="closeDetailTable"
              >关闭</el-button
            >
          </div>
          <el-table
            :data="accountTableData"
            style="width: 100%"
            border
            stripe
            row-key="key"
            :span-method="accountTableSpanMethod"
            size="small"
          >
            <el-table-column prop="index" label="序号" width="80">
              <template #default="{ row }">
                {{ row.index || "" }}
              </template>
            </el-table-column>
            <el-table-column
              prop="companyName"
              label="企业名称"
              min-width="180"
            />
            <el-table-column label="姓名" min-width="140">
              <template #default="{ row }">
                {{ row.user?.name || "--" }}
              </template>
            </el-table-column>
            <el-table-column label="联系方式" min-width="140">
              <template #default="{ row }">
                {{ row.user?.phone || "--" }}
              </template>
            </el-table-column>
            <el-table-column label="审核员" min-width="100">
              <template #default="{ row }">
                {{ row.user?.isadmin === 1 ? "是" : row.user ? "否" : "--" }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>

      <div class="section section-order">
        <div class="section-head">
          <h2>重点企业享受服务汇总</h2>
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
              <span v-if="item.note" class="metric-unit">{{ item.note }}</span>
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
                <strong :class="item.tone">
                  {{ formatMetric(item.value, item.type) }}
                  <span v-if="item.note" class="order-item-unit">{{
                    item.note
                  }}</span>
                </strong>
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
          :data="orderTableRows"
          style="width: 100%"
          border
          stripe
          row-key="key"
          :span-method="orderTableSpanMethod"
          class="company-order-table"
        >
          <el-table-column prop="index" label="序号" width="72">
            <template #default="scope">
              {{ scope.row.index || "" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="ccompanyname"
            label="企业名称"
            min-width="180"
          />
          <el-table-column
            prop="ccompanygrade"
            label="企业类型"
            min-width="100"
          />
          <el-table-column
            prop="categoryName"
            label="资源类型"
            min-width="120"
          />
          <el-table-column prop="bcompanyname" label="供应商" min-width="180" />
          <el-table-column
            prop="producttitle"
            label="产品名称"
            min-width="200"
          />
          <el-table-column
            prop="servicetype"
            label="服务方式"
            min-width="200"
          />
          <el-table-column label="服务金额" min-width="140">
            <template #default="scope">
              {{
                scope.row.subsidyamount !== null &&
                scope.row.subsidyamount !== undefined &&
                scope.row.subsidyamount !== ""
                  ? formatMetric(scope.row.subsidyamount, "amount")
                  : "--"
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="companySubsidy"
            label="总服务金额"
            min-width="140"
          >
            <template #default="scope">
              {{
                scope.row.companySubsidy !== null &&
                scope.row.companySubsidy !== undefined &&
                scope.row.companySubsidy !== ""
                  ? formatMetric(scope.row.companySubsidy, "amount")
                  : ""
              }}
            </template>
          </el-table-column>
        </el-table>
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
import store from "../../store";

const loading = ref(false);
const hasLoaded = ref(false);
const updatedAt = ref(0);
const biPayload = ref({});

const state = reactive({
  totalorders: 0,
  totalcontractprice: 0,
  totalsubsidyprice: 0,
  anjuorders: 0,
  yuexiangorders: 0,
  kanghuorders: 0,
  anjutotalcontractprice: 0,
  anjutotalsubsidyprice: 0,
  yuexiangtotalsubsidyprice: 0,
  kanghutotalsubsidyprice: 0,
  ccompanyorderdata: [],
  departmentid: "",
  departmentname: "",
  companies: [],
  accounts: [],
  usageStatistics: [],
});

// orders数组以state.ccompanyorderdata为基础，先按公司聚合，再按分类聚合，保留categories数组结构,最后计算每家公司的所有分类下面的订单补贴额（subsidyamount）之和，作为新的字段与ccompanyname同级
const orders = computed(() => {
  const data = Array.isArray(state.ccompanyorderdata)
    ? state.ccompanyorderdata
    : [];

  const companyMap = new Map();

  data.forEach((item) => {
    const companyName = item.ccompanyname || "";
    const categoryId = item.categoryaid ?? "";

    if (!companyMap.has(companyName)) {
      companyMap.set(companyName, {
        ccompanyname: companyName,
        ccompanygrade: item.ccompanygrade,
        categories: new Map(),
      });
    }

    const company = companyMap.get(companyName);
    if (!company.categories.has(categoryId)) {
      company.categories.set(categoryId, {
        categoryaid: categoryId,
        items: [],
      });
    }

    company.categories.get(categoryId).items.push(item);
  });

  const sortById = (a, b) => {
    const ida = Number(a.id);
    const idb = Number(b.id);
    if (Number.isFinite(ida) && Number.isFinite(idb)) {
      return ida - idb;
    }
    return 0;
  };

  const parseCategory = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  return Array.from(companyMap.values()).map((company) => {
    const totalSubsidy = Array.from(company.categories.values()).reduce(
      (companySum, category) => {
        return (
          companySum +
          category.items.reduce((categorySum, item) => {
            const subsidy = Number(item.subsidyamount);
            return categorySum + (Number.isFinite(subsidy) ? subsidy : 0);
          }, 0)
        );
      },
      0,
    );

    return {
      ccompanyname: company.ccompanyname,
      ccompanygrade: company.ccompanygrade,
      subsidyamount: totalSubsidy,
      categories: Array.from(company.categories.values())
        .map((category) => ({
          categoryaid: category.categoryaid,
          items: category.items.slice().sort(sortById),
        }))
        .sort(
          (a, b) => parseCategory(a.categoryaid) - parseCategory(b.categoryaid),
        ),
    };
  });
});

const orderTableRows = computed(() => {
  const categoryNameMap = {
    0: "安居",
    1: "悦享",
    2: "康护",
  };

  const companyRowCounts = new Map();
  orders.value.forEach((order) => {
    const categoryCount = Array.isArray(order.categories)
      ? order.categories.reduce((sum, category) => {
          return (
            sum +
            Math.max(
              Array.isArray(category.items) ? category.items.length : 1,
              1,
            )
          );
        }, 0)
      : 1;
    companyRowCounts.set(order.ccompanyname, categoryCount);
  });

  const firstCompanySeen = new Set();
  return orders.value.flatMap((order, orderIndex) => {
    const categories = Array.isArray(order.categories) ? order.categories : [];
    const companyRowCount = companyRowCounts.get(order.ccompanyname) || 1;
    const isCompanyFirst = !firstCompanySeen.has(order.ccompanyname);
    if (isCompanyFirst) {
      firstCompanySeen.add(order.ccompanyname);
    }

    if (categories.length === 0) {
      return [
        {
          key: `${order.ccompanyname || orderIndex}-empty`,
          ccompanyname: order.ccompanyname,
          ccompanygrade: order.ccompanygrade,
          companySubsidy: isCompanyFirst ? order.subsidyamount : "",
          categoryName: "",
          bcompanyname: "",
          producttitle: "",
          servicetype: "",
          subsidyamount: "",
          index: isCompanyFirst ? orderIndex + 1 : null,
          companyRowCount,
          categoryRowCount: 1,
          isCompanyFirst,
          isCategoryFirst: true,
          order,
          category: null,
          item: null,
        },
      ];
    }

    return categories.flatMap((category, categoryIndex) => {
      const categoryItems = Array.isArray(category.items) ? category.items : [];
      const categoryRowCount = Math.max(categoryItems.length, 1);
      const isFirstCategory = categoryIndex === 0;

      if (categoryItems.length === 0) {
        return [
          {
            key: `${order.ccompanyname || orderIndex}-${category.categoryaid}-empty`,
            ccompanyname: order.ccompanyname,
            ccompanygrade: order.ccompanygrade,
            companySubsidy:
              isCompanyFirst && isFirstCategory ? order.subsidyamount : "",
            categoryName:
              categoryNameMap[category.categoryaid] ?? category.categoryaid,
            bcompanyname: "",
            producttitle: "",
            servicetype: "",
            subsidyamount: "",
            index: isCompanyFirst && isFirstCategory ? orderIndex + 1 : null,
            companyRowCount,
            categoryRowCount,
            isCompanyFirst: isCompanyFirst && isFirstCategory,
            isCategoryFirst: true,
            order,
            category,
            item: null,
          },
        ];
      }

      return categoryItems.map((item, itemIndex) => ({
        key: `${order.ccompanyname || orderIndex}-${category.categoryaid}-${itemIndex}`,
        ccompanyname: order.ccompanyname,
        ccompanygrade: order.ccompanygrade,
        companySubsidy:
          isCompanyFirst && isFirstCategory && itemIndex === 0
            ? order.subsidyamount
            : "",
        categoryName:
          itemIndex === 0
            ? (categoryNameMap[category.categoryaid] ?? category.categoryaid)
            : "",
        bcompanyname: item.bcompanyname ?? "",
        producttitle: item.producttitle ?? "",
        servicetype: item.servicetype ?? "",
        subsidyamount: item.subsidyamount ?? "",
        index:
          isCompanyFirst && isFirstCategory && itemIndex === 0
            ? orderIndex + 1
            : null,
        companyRowCount,
        categoryRowCount,
        isCompanyFirst: isCompanyFirst && isFirstCategory && itemIndex === 0,
        isCategoryFirst: itemIndex === 0,
        order,
        category,
        item,
      }));
    });
  });
});

const orderTableSpanMethod = ({ row, column }) => {
  if (!row) {
    return [1, 1];
  }
  if (
    column.property === "index" ||
    column.property === "ccompanyname" ||
    column.property === "ccompanygrade" ||
    column.property === "companySubsidy"
  ) {
    return row.isCompanyFirst ? [row.companyRowCount, 1] : [0, 0];
  }
  if (column.property === "categoryName") {
    return row.isCategoryFirst ? [row.categoryRowCount, 1] : [0, 0];
  }
  return [1, 1];
};

// 申报企业数
const companycount = computed(() => state.companies.length);
// 开通账号企业数,state.accounts中users数组不过为空的数量
const hasaccountcompanies = computed(() => {
  return state.accounts.filter((account) => account.users.length > 0).length;
});
// 开通账号数
const accountcount = computed(() => {
  return state.accounts.reduce((total, account) => {
    return total + (Array.isArray(account.users) ? account.users.length : 0);
  }, 0);
});

const showDetailTable = ref(false);

const getCompanyName = (companyId) => {
  const company = state.companies.find((item) => item.id === companyId);
  return company ? company.name || "" : "";
};

const accountTableData = computed(() => {
  if (!Array.isArray(state.accounts)) {
    return [];
  }
  return state.accounts.flatMap((account, index) => {
    const users = Array.isArray(account.users) ? account.users : [];
    const rowCount = Math.max(users.length, 1);

    if (users.length === 0) {
      return [
        {
          key: `${account.id}-0`,
          companyName: getCompanyName(account.id),
          index: index + 1,
          user: null,
          rowCount,
          isFirst: true,
        },
      ];
    }

    return users.map((user, userIndex) => ({
      key: `${account.id}-${userIndex}`,
      companyName: userIndex === 0 ? getCompanyName(account.id) : "",
      index: userIndex === 0 ? index + 1 : null,
      user,
      rowCount,
      isFirst: userIndex === 0,
    }));
  });
});

const accountTableSpanMethod = ({ row, column }) => {
  if (!row || row.rowCount <= 1) {
    return [1, 1];
  }
  if (column.property === "index" || column.property === "companyName") {
    return row.isFirst ? [row.rowCount, 1] : [0, 0];
  }
  return [1, 1];
};

const openDetailTable = () => {
  showDetailTable.value = true;
};

const closeDetailTable = () => {
  showDetailTable.value = false;
};

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
    key: "company_count",
    label: "申报企业数",
    value: companycount.value,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "has_account_companies",
    label: "累计开通账号企业数量",
    value: hasaccountcompanies.value,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "account_count",
    label: "配套开通企业操作账号",
    value: accountcount.value,
    type: "count",
    tone: "tone-primary",
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
    key: "anju_product_total",
    label: "安居产品总数",
    value: state.anjuProducts,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "anju_product_7d",
    label: "安居产品7日新增",
    value: state.recentAnjuProducts,
    type: "count",
    tone: "tone-rise",
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
    key: "total_orders",
    label: "订单总数（审批通过且有效）",
    value: state.totalorders,
    type: "count",
    tone: "tone-primary",
  },
  {
    key: "total_contract_price",
    label: "总有效合同金额",
    value: state.totalcontractprice,
    type: "amount",
    tone: "tone-primary",
  },
  {
    key: "total_subsidy_price",
    label: "总有效服务金额",
    value: state.totalsubsidyprice,
    type: "amount",
    tone: "tone-primary",
  },
  {
    key: "anju_orders",
    label: "安居订单总数",
    value: state.anjuorders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "yuexiang_orders",
    label: "悦享订单总数",
    value: state.yuexiangorders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "kanghu_orders",
    label: "康护订单总数",
    value: state.kanghuorders,
    type: "count",
    tone: "tone-sub",
  },
  {
    key: "anju_total_subsidy_price",
    label: "安居总服务金额",
    value: state.anjutotalsubsidyprice,
    type: "amount",
    tone: "tone-rise",
  },
  {
    key: "yuexiang_total_subsidy_price",
    label: "悦享总服务金额",
    value: state.yuexiangtotalsubsidyprice,
    type: "amount",
    tone: "tone-amount",
  },
  {
    key: "kanghu_total_subsidy_price",
    label: "康护总服务金额",
    value: state.kanghutotalsubsidyprice,
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
    ...getMetric(accountMetricMap, "company_count", "累计开通账号数量"),
    note: "家",
  },
  {
    ...getMetric(accountMetricMap, "has_account_companies", "平台总产品数量"),
    note: "家",
  },
  {
    ...getMetric(accountMetricMap, "account_count", "平台总产品数量"),
    note: "个",
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
  {
    ...getMetric(orderMetricMap, "total_orders", "订单总数（审批通过且有效）"),
    note: "件",
  },
  {
    ...getMetric(
      orderMetricMap,
      "total_contract_price",
      "总有效订单额度",
      "amount",
    ),
    note: "元",
  },
  {
    ...getMetric(
      orderMetricMap,
      "total_subsidy_price",
      "总有效服务金额",
      "amount",
    ),
    note: "元",
  },
]);

const orderLineMetrics = computed(() => [
  {
    key: "anju",
    name: "安居",
    metrics: [
      {
        ...getMetric(orderMetricMap, "anju_orders", "安居订单总数"),
        note: "件",
      },
      {
        ...getMetric(
          orderMetricMap,
          "anju_total_subsidy_price",
          "订单总额度",
          "amount",
        ),
        note: "元",
      },
    ],
  },
  {
    key: "yuexiang",
    name: "悦享",
    metrics: [
      {
        ...getMetric(orderMetricMap, "yuexiang_orders", "订单总数"),
        note: "件",
      },
      {
        ...getMetric(
          orderMetricMap,
          "yuexiang_total_subsidy_price",
          "订单总额度",
          "amount",
        ),
        note: "元",
      },
    ],
  },
  {
    key: "kanghu",
    name: "康护",
    metrics: [
      {
        ...getMetric(orderMetricMap, "kanghu_orders", "订单总数"),
        note: "件",
      },
      {
        ...getMetric(
          orderMetricMap,
          "kanghu_total_subsidy_price",
          "订单总额度",
          "amount",
        ),
        note: "元",
      },
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
    // getAccountData();
    // getProductData();
    // getOrderData();
    getadmindepartmentinfo();
    getaccountdatabydepartment();
    getorderdatabydepartment();
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
    // const res = await request.post("/getProductDataForBI", {});
    // if (res && res.retcode === "200") {
    //   state.totalProducts = res.data.totalProducts || 0;
    //   state.recentProducts = res.data.recentProducts || 0;
    //   state.anjuProducts = res.data.anjuProducts || 0;
    //   state.recentAnjuProducts = res.data.recentAnjuProducts || 0;
    //   state.yuexiangProducts = res.data.yuexiangProducts || 0;
    //   state.recentYuexiangProducts = res.data.recentYuexiangProducts || 0;
    //   state.kanghuProducts = res.data.kanghuProducts || 0;
    //   state.recentKanghuProducts = res.data.recentKanghuProducts || 0;
    // } else {
    //   console.log("获取产品数据失败");
    // }
  } catch (error) {
    console.log("获取产品数据异常：", error);
  }
};

const getcompanyproductsdata = (categoryaid) => {
  // let payload = {
  //   categoryid: categoryaid,
  // };
  // request
  //   .post("/getCompanyProductDataForBI", payload)
  //   .then((res) => {
  //     console.log("获取企业产品数据接口返回：", res);
  //     if (res && res.code === "200") {
  //       if (categoryaid === "0") {
  //         state.anjudata = res.data || [];
  //       } else if (categoryaid === "1") {
  //         state.yuexiangdata = res.data || [];
  //       } else if (categoryaid === "2") {
  //         state.kanghudata = res.data || [];
  //       }
  //       console.log("获取企业产品数据成功：", res.data);
  //     } else {
  //       console.log("获取企业产品数据失败");
  //     }
  //   })
  //   .catch((error) => {
  //     console.log("获取企业产品数据异常：", error);
  //   });
};
const getOrderData = async () => {
  // try {
  //   const res = await request.post("/getOrderDataForBI", {});
  //   if (res && res.retcode === "200") {
  //     state.totalOrders = res.data.totalOrders || 0;
  //     state.recentOrders = res.data.recentOrders || 0;
  //     state.totalSubsidy = res.data.totalSubsidy || 0;
  //     state.totalAmount = res.data.totalAmount || 0;
  //     state.recentAmount = res.data.recentAmount || 0;
  //     state.anjuOrders = res.data.anjuOrders || 0;
  //     state.recentAnjuOrders = res.data.recentAnjuOrders || 0;
  //     state.anjuAmount = res.data.anjuAmount || 0;
  //     state.recentAnjuAmount = res.data.recentAnjuAmount || 0;
  //     state.yuexiangOrders = res.data.yuexiangOrders || 0;
  //     state.recentYuexiangOrders = res.data.recentYuexiangOrders || 0;
  //     state.yuexiangAmount = res.data.yuexiangAmount || 0;
  //     state.recentYuexiangAmount = res.data.recentYuexiangAmount || 0;
  //     state.kanghuOrders = res.data.kanghuOrders || 0;
  //     state.recentKanghuOrders = res.data.recentKanghuOrders || 0;
  //     state.kanghuAmount = res.data.kanghuAmount || 0;
  //     state.recentKanghuAmount = res.data.recentKanghuAmount || 0;
  //   } else {
  //     console.log("获取订单数据失败");
  //   }
  // } catch (error) {
  //   console.log("获取订单数据异常：", error);
  // }
};

const getccompanyorderdata = () => {
  // let payload = {};
  // request
  //   .post("/getCCompanyOrderDataForBI", payload)
  //   .then((res) => {
  //     console.log("获取企业订单数据接口返回：", res);
  //     const retcode = res?.retcode ?? res?.code;
  //     if (retcode === "200" || retcode === 200) {
  //       if (Array.isArray(res?.data)) {
  //         state.ccompanyorderdata = res.data;
  //       } else if (Array.isArray(res?.data?.data)) {
  //         state.ccompanyorderdata = res.data.data;
  //       } else {
  //         state.ccompanyorderdata = [];
  //       }
  //       console.log("获取企业订单数据成功：", state.ccompanyorderdata);
  //     } else {
  //       console.log("获取企业订单数据失败");
  //       state.ccompanyorderdata = [];
  //     }
  //   })
  //   .catch((error) => {
  //     console.log("获取企业订单数据异常：", error);
  //     state.ccompanyorderdata = [];
  //   });
};

const getadmindepartmentinfo = () => {
  let departmentid = store.state.userinfo.department;
  let level = store.state.userinfo.level;
  console.log("当前用户部门ID：", departmentid);
  console.log("当前用户level：", level);
  let payload = {
    department: store.state.userinfo.department,
  };
  request
    .post("/getadmindepartmentinfo", payload)
    .then((res) => {
      console.log("获取管理员信息接口返回：", res);
      if (res && res.code === "200") {
        state.departmentid = res.data.id || "";
        state.departmentname = res.data.departmentname || "";
        getuseagestatistics();
      } else {
        console.log("获取管理员信息失败");
      }
    })
    .catch((error) => {
      console.log("获取管理员信息异常：", error);
    });
};

const getorderdatabydepartment = () => {
  let payload = {
    department: store.state.userinfo.department,
  };
  request
    .post("/getorderdatabydepartment", payload)
    .then((res) => {
      if (res && res.retcode === "200") {
        state.totalorders = res.data.totalorders || 0;
        state.totalcontractprice = res.data.totalcontractprice || 0;
        state.totalsubsidyprice = res.data.totalsubsidyprice || 0;
        state.anjuorders = res.data.anjuorders || 0;
        state.yuexiangorders = res.data.yuexiangorders || 0;
        state.kanghuorders = res.data.kanghuorders || 0;
        state.anjutotalcontractprice = res.data.anjutotalcontractprice || 0;
        state.anjutotalsubsidyprice = res.data.anjutotalsubsidyprice || 0;
        state.yuexiangtotalsubsidyprice =
          res.data.yuexiangtotalsubsidyprice || 0;
        state.kanghutotalsubsidyprice = res.data.kanghutotalsubsidyprice || 0;
        state.ccompanyorderdata = Array.isArray(res.data.orders)
          ? res.data.orders
          : [];
      } else {
        console.log("获取部门订单数据失败");
      }
    })
    .catch((error) => {
      console.log("获取部门订单数据异常：", error);
    });
};

const getaccountdatabydepartment = () => {
  let payload = {
    department: store.state.userinfo.department,
  };
  request
    .post("/getaccountdatabydepartment", payload)
    .then((res) => {
      if (res && res.retcode === "200") {
        state.companies = Array.isArray(res.data.companies)
          ? res.data.companies
          : [];
        state.accounts = Array.isArray(res.data.accounts)
          ? res.data.accounts
          : [];
      } else {
        console.log("获取部门账户数据失败");
      }
    })
    .catch((error) => {
      console.log("获取部门账户数据异常：", error);
    });
};

const getuseagestatistics = () => {
  let payload = {
    departmentid: state.departmentid,
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
  // getcompanyproductsdata("0");
  // getcompanyproductsdata("1");
  // getcompanyproductsdata("2");
  // getccompanyorderdata();
  // getadmindepartmentinfo();
  // getaccountdatabydepartment();
  // getorderdatabydepartment();
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

.detail-card {
  grid-column: span 3;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.detail-card.expanded {
  min-height: auto;
}

.detail-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 14px 12px;
  border: 1px dashed rgba(37, 99, 235, 0.45);
  border-radius: 12px;
  color: rgba(37, 99, 235, 0.95);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.detail-toggle:hover {
  background-color: rgba(37, 99, 235, 0.06);
}

.detail-line {
  flex: 1;
  height: 1px;
  background-color: rgba(37, 99, 235, 0.35);
}

.detail-text {
  white-space: nowrap;
  font-weight: 600;
}

.detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 700;
}

.detail-card-title {
  flex: 1;
  text-align: center;
}

.el-table {
  width: 100%;
}

.el-table .el-table__body-wrapper {
  max-height: 320px;
}

.el-table .el-table__expand-icon {
  margin-right: 4px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.order-item-unit {
  margin-left: 4px;
  font-size: 16px;
  font-weight: 700;
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
  position: relative;
  padding: 14px 14px 28px;
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

.metric-unit {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-sub);
  line-height: 1.2;
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

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.detail-link-btn {
  position: relative;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  border: none;
  background: transparent;
  color: #1677ff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
</style>
