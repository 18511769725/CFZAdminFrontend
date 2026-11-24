<template>
  <div class="mobile-cockpit">
    <header ref="stickyHeaderRef" class="sticky-header">
      <h1>朝阳企业服务平台服务企业情况</h1>
    </header>

    <section class="module-card">
      <div class="module-head">
        <h2>总体情况</h2>
      </div>
      <div class="overview-grid">
        <div class="metric-tile">
          <span class="metric-label">累计订单数</span>
          <strong class="metric-value">{{
            formatNumber(dashboardData.overview.totalOrders) + "件"
          }}</strong>
        </div>
        <div class="metric-tile">
          <span class="metric-label">服务企业数</span>
          <strong class="metric-value">{{
            formatNumber(dashboardData.overview.servedCompanies) + "家"
          }}</strong>
        </div>
        <div class="metric-tile">
          <span class="metric-label">累计合同金额</span>
          <strong class="metric-value">{{
            formatMoneyByLevel(dashboardData.overview.totalAmount)
          }}</strong>
        </div>
        <div class="metric-tile">
          <span class="metric-label">累计服务金额</span>
          <strong class="metric-value">{{
            formatMoneyByLevel(dashboardData.overview.totalSubsidy)
          }}</strong>
        </div>
      </div>
    </section>

    <section class="module-card">
      <div class="module-head">
        <h2>各板块资源使用情况</h2>
      </div>
      <div class="chart-block">
        <h3>服务金额分布</h3>
        <DonutChart
          :data="subsidyDistributionData"
          :center-text="formatMoneyShort(dashboardData.policy.subsidyAmount)"
          unit="补贴总额"
          :colors="['#1677FF', '#52C41A', '#FAAD14']"
        />
      </div>
      <div class="ranking-block">
        <!-- <h3>补贴分布分析</h3> -->
        <ul class="rank-list rank-list-business">
          <li
            v-for="(item, index) in businessSubsidyTop3"
            :key="item.name"
            class="rank-item"
          >
            <div class="vertical-wrapper">
              <div class="line-wrapper">
                <div class="rank-badge" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </div>
                <div class="business-rank-head" style="margin-left: 8px">
                  <div class="rank-title">{{ item.name }}</div>
                </div>
              </div>
              <div class="line-wrapper" style="margin-top: 8px">
                <div class="pair-group subsidy-group">
                  <!-- <div class="pair-group-title">补贴类</div> -->
                  <div class="pair-group-content">
                    <div class="pair-cell">
                      <span>服务金额</span>
                      <strong>{{ formatMoneyByLevel(item.subsidy) }}</strong>
                    </div>
                    <div class="pair-cell">
                      <span>金额占比</span>
                      <strong>{{ item.percent.toFixed(1) }}%</strong>
                    </div>
                  </div>
                </div>
                <div class="pair-group subsidy-group" style="margin-left: 8px">
                  <!-- <div class="pair-group-title">订单类</div> -->
                  <div class="pair-group-content">
                    <div class="pair-cell">
                      <span>订单数</span>
                      <strong>{{ formatNumber(item.orders) }}件</strong>
                    </div>
                    <div class="pair-cell">
                      <span>订单占比</span>
                      <strong>{{ item.orderPercent.toFixed(1) }}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="module-card">
      <div class="module-head">
        <h2>企业服务覆盖情况</h2>
      </div>
      <div class="hero-metric">
        <span>服务企业总数</span>
        <strong>{{
          formatNumber(dashboardData.enterprise.totalServed) + "家"
        }}</strong>
      </div>

      <div class="chart-block">
        <h3>企业类型分布</h3>
        <DonutChart
          :data="enterpriseLevelData"
          :center-text="formatNumber(dashboardData.enterprise.totalServed)"
          unit="服务企业"
          :colors="['#1677FF', '#52C41A', '#FAAD14', '#722ED1']"
        />
        <ul class="level-count-list">
          <li
            class="level-count-item"
            v-for="item in enterpriseLevelData"
            :key="item.name"
          >
            <span class="level-name">{{ item.name }}</span>
            <strong class="level-count"
              >{{ formatNumber(item.value) }}家</strong
            >
          </li>
        </ul>
      </div>

      <div class="ranking-block">
        <div class="section-title-row">
          <h3>TOP10享受补贴企业</h3>
          <button
            class="detail-link-btn"
            type="button"
            @click="scrollToOrderSection"
          >
            查看详细
          </button>
        </div>
        <ul class="rank-list">
          <li
            v-for="(item, index) in enterpriseTop10"
            :key="item.name"
            class="rank-item compact"
          >
            <div class="rank-index">{{ index + 1 }}</div>
            <div class="rank-main">
              <div class="rank-title">{{ item.name }}</div>
            </div>
            <div class="rank-value money">
              {{ formatMoneyByLevel(item.subsidy) }}
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="module-card">
      <div class="module-head">
        <h2>各板块供应商情况</h2>
      </div>
      <div class="hero-metric">
        <div class="line-wrapper">
          <div class="vertical-wrapper">
            <span>合作供应商总数</span>
            <strong>{{
              formatNumber(dashboardData.supplier.totalPartners) + "家"
            }}</strong>
          </div>
          <div class="vertical-wrapper" style="margin-left: 16px">
            <span>上线服务资源</span>
            <strong>{{ formatNumber(state.totalProducts) + "项" }}</strong>
          </div>
        </div>
      </div>

      <div class="chart-block">
        <h3>各板块资源统计</h3>
        <SupplierStatsChart :data="supplierPanelStats" />
      </div>

      <div class="ranking-block">
        <h3>TOP10供应商</h3>
        <ul class="rank-list">
          <li
            v-for="(item, index) in supplierTop10"
            :key="item.name"
            class="rank-item compact"
          >
            <div class="rank-index">{{ index + 1 }}</div>
            <div class="rank-main">
              <div class="rank-title">{{ item.name }}</div>
            </div>
            <div class="rank-value money">
              {{ formatMoneyByLevel(item.amount) }}
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section
      ref="orderDetailSectionRef"
      class="module-card"
      v-if="state.showorderdetails"
    >
      <div class="module-head">
        <h2>具体订单情况</h2>
      </div>
      <div class="order-table-wrap">
        <table class="order-table">
          <colgroup>
            <col class="col-index" />
            <col class="col-company" />
            <col class="col-type" />
            <col class="col-product" />
            <col class="col-quantity" />
            <col class="col-amount" />
            <col class="col-total" />
          </colgroup>
          <thead>
            <tr>
              <th class="order-sticky-index">序号</th>
              <th class="order-sticky-company">企业名称</th>
              <th>资源类型</th>
              <th>具体服务资源项目</th>
              <th>数量</th>
              <th>服务金额</th>
              <th>合计服务金额</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in orderDetailRows" :key="row.key">
              <tr>
                <td :rowspan="row.orderItems.length" class="order-sticky-index">
                  {{ row.index }}
                </td>
                <td
                  :rowspan="row.orderItems.length"
                  class="order-company-cell order-sticky-company"
                >
                  {{ row.ccompanyname }}
                </td>
                <td>{{ row.orderItems[0].categoryaid }}</td>
                <td>{{ row.orderItems[0].producttitle }}</td>
                <td>{{ formatNumber(row.orderItems[0].buyamount) }}</td>
                <td>
                  {{ formatMoneyByLevel(row.orderItems[0].ordersubsidy) }}
                </td>
                <td :rowspan="row.orderItems.length">
                  {{ formatMoneyByLevel(row.totalsubsidy) }}
                </td>
              </tr>
              <tr
                v-for="(orderItem, detailIndex) in row.orderItems.slice(1)"
                :key="`${row.key}-${detailIndex}`"
              >
                <td>{{ orderItem.categoryaid }}</td>
                <td>{{ orderItem.producttitle }}</td>
                <td>{{ formatNumber(orderItem.buyamount) }}</td>
                <td>{{ formatMoneyByLevel(orderItem.ordersubsidy) }}</td>
              </tr>
            </template>
            <tr v-if="orderDetailRows.length === 0">
              <td class="order-empty" colspan="7">暂无订单数据</td>
            </tr>
            <tr class="order-summary-row">
              <td colspan="5">合计</td>
              <td>{{ formatMoneyByLevel(state.totalSubsidy) }}</td>
              <td>{{ formatMoneyByLevel(state.totalSubsidy) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";
import DonutChart from "./charts/DonutChart.vue";
import SupplierStatsChart from "./charts/SupplierStatsChart.vue";

const loading = ref(false);
const stickyHeaderRef = ref(null);
const orderDetailSectionRef = ref(null);

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
  supplierdata: [],
  anjucompanies: 0,
  yuexiangcompanies: 0,
  kanghucompanies: 0,
  totalSubsidy: 0,
  showorderdetails: false,
});

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const sumBy = (list, key) => {
  return list.reduce((sum, item) => sum + toNumber(item?.[key]), 0);
};

const companyOrderRows = computed(() => {
  return (state.ccompanyorderdata || []).filter(
    (item) => item && item.ccompanyname,
  );
});

const showCategory = (category) => {
  if (category === 0) {
    return "安居";
  } else if (category === 1) {
    return "悦享";
  } else if (category === 2) {
    return "康护";
  } else {
    return "-";
  }
};

const subsidyDistributionData = computed(() => {
  const anju =
    sumBy(companyOrderRows.value, "anjusubsidy") || toNumber(state.anjuAmount);
  const yuexiang =
    sumBy(companyOrderRows.value, "yuexiangsubsidy") ||
    toNumber(state.yuexiangAmount);
  const kanghu =
    sumBy(companyOrderRows.value, "kanghusubsidy") ||
    toNumber(state.kanghuAmount);

  return [
    { name: "安居板块", value: anju },
    { name: "悦享板块", value: yuexiang },
    { name: "康护板块", value: kanghu },
  ];
});

const businessAmountShareData = computed(() => {
  const anjuAmount = toNumber(state.anjuAmount);
  const yuexiangAmount = toNumber(state.yuexiangAmount);
  const kanghuAmount = toNumber(state.kanghuAmount);

  return [
    { name: "安居板块", value: anjuAmount },
    { name: "悦享板块", value: yuexiangAmount },
    { name: "康护板块", value: kanghuAmount },
  ];
});

const dashboardData = computed(() => {
  const servedCompanies =
    new Set(
      companyOrderRows.value
        .filter((item) => toNumber(item.totalorders) > 0)
        .map((item) => item.ccompanyname),
    ).size || toNumber(state.totalCompanies);

  const coveredCompanies = new Set(
    companyOrderRows.value
      .filter((item) => toNumber(item.totalsubsidy) > 0)
      .map((item) => item.ccompanyname),
  ).size;

  const subsidyOrders = companyOrderRows.value.reduce((sum, item) => {
    if (toNumber(item.totalsubsidy) > 0) {
      return sum + toNumber(item.totalorders);
    }
    return sum;
  }, 0);

  const totalSubsidy =
    sumBy(companyOrderRows.value, "totalsubsidy") ||
    sumBy(subsidyDistributionData.value, "value");

  const business = [
    {
      name: "安居板块",
      orders: toNumber(state.anjuOrders),
      amount: toNumber(state.anjuAmount),
      subsidy: toNumber(state.anjuAmount),
    },
    {
      name: "悦享板块",
      orders: toNumber(state.yuexiangOrders),
      amount: toNumber(state.yuexiangAmount),
      subsidy: toNumber(state.yuexiangAmount),
    },
    {
      name: "康护板块",
      orders: toNumber(state.kanghuOrders),
      amount: toNumber(state.kanghuAmount),
      subsidy: toNumber(state.kanghuAmount),
    },
  ];

  const enterpriseTop = [...companyOrderRows.value]
    .map((item) => ({
      name: item.ccompanyname,
      amount: toNumber(item.totalamount),
      subsidy: toNumber(item.totalsubsidy),
    }))
    .sort((a, b) => b.subsidy - a.subsidy)
    .slice(0, 10);

  const sortedCompanies = [...companyOrderRows.value]
    .map((item) => ({
      name: item.ccompanyname,
      amount: toNumber(item.totalamount),
      grade: item.ccompanygrade,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 重写levelBuckets的计算逻辑，确保每个层级的企业数量正确, 遍历companyOrderRows,按照grade字段（1-4）统计四个等级的数量
  const levelBuckets = [0, 0, 0, 0];
  if (sortedCompanies.length > 0) {
    console.log("sortedCompanies", sortedCompanies);
    sortedCompanies.forEach((item) => {
      const grade = parseInt(item.grade, 10);
      if (grade >= 1 && grade <= 4) {
        levelBuckets[grade - 1]++;
      }
    });
  }

  const supplierPool = [
    ...state.anjudata,
    ...state.yuexiangdata,
    ...state.kanghudata,
  ]
    .filter((item) => item && item.bcompanyname)
    .reduce((acc, item) => {
      const name = item.bcompanyname;
      if (!acc[name]) {
        acc[name] = { name, amount: 0 };
      }
      acc[name].amount += toNumber(item.productcount);
      return acc;
    }, {});

  const supplierList = Object.values(state.supplierdata)
    .sort((a, b) => b.totalsubsidy - a.totalsubsidy)
    .slice(0, 10)
    .map((item) => ({
      name: item.bcompanyname,
      amount: item.totalsubsidy,
    }));

  return {
    overview: {
      totalOrders: toNumber(state.totalOrders),
      totalAmount: toNumber(state.totalAmount),
      totalSubsidy: toNumber(state.totalSubsidy),
      servedCompanies,
    },
    policy: {
      subsidyOrders,
      subsidyAmount: toNumber(state.totalSubsidy),
      coveredCompanies,
      distribution: subsidyDistributionData.value,
    },
    business,
    enterprise: {
      totalServed: servedCompanies,
      levels: [
        { name: "总部型企业", value: levelBuckets[0] },
        { name: "领军型企业", value: levelBuckets[1] },
        { name: "领跑型企业", value: levelBuckets[2] },
        { name: "潜力型企业", value: Math.max(0, levelBuckets[3]) },
      ],
      top10: enterpriseTop,
    },
    supplier: {
      totalPartners: Object.keys(supplierPool).length,
      top10: supplierList,
    },
  };
});

const totalBusinessAmount = computed(() => {
  return dashboardData.value.business.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
});
const totalSubsidyAmount = computed(() => {
  return dashboardData.value.business.reduce(
    (sum, item) => sum + item.subsidy,
    0,
  );
});
const totalBusinessOrders = computed(() => {
  return dashboardData.value.business.reduce(
    (sum, item) => sum + item.orders,
    0,
  );
});

const parseOrderList = (rawOrderList) => {
  if (Array.isArray(rawOrderList)) {
    return rawOrderList;
  }

  if (typeof rawOrderList === "string") {
    const trimmed = rawOrderList.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (Array.isArray(parsed?.data)) {
        return parsed.data;
      }
    } catch {
      return [];
    }
  }

  if (rawOrderList && Array.isArray(rawOrderList.data)) {
    return rawOrderList.data;
  }

  return [];
};

const orderDetailRows = computed(() => {
  return (state.ccompanyorderdata || []).map((item, index) => {
    const parsedOrderList = parseOrderList(item?.orderlist ?? item?.orderList)
      .filter((orderItem) => orderItem)
      .map((orderItem) => ({
        categoryaid: orderItem.categoryaid || 0,
        producttitle: orderItem.producttitle || "-",
        buyamount: toNumber(orderItem.buyamount),
        ordersubsidy: toNumber(orderItem.ordersubsidy),
      }));

    const orderItems =
      parsedOrderList.length > 0
        ? parsedOrderList
        : [
            {
              categoryaid: 0,
              producttitle: "-",
              buyamount: 0,
              ordersubsidy: 0,
            },
          ];

    return {
      key: `${item?.ccompanyname || "unknown"}-${index}`,
      index: index + 1,
      ccompanyname: item?.ccompanyname || "-",
      totalsubsidy: toNumber(item?.totalsubsidy),
      orderItems,
    };
  });
});

// 供应商数量先写死，产品数量使用接口返回值并保持响应式更新。
const supplierPanelStats = computed(() => [
  {
    key: "anju",
    name: "安居板块",
    suppliers: state.anjucompanies,
    products: toNumber(state.anjuProducts),
  },
  {
    key: "yuexiang",
    name: "悦享板块",
    suppliers: state.yuexiangcompanies,
    products: toNumber(state.yuexiangProducts),
  },
  {
    key: "kanghu",
    name: "康护板块",
    suppliers: state.kanghucompanies,
    products: toNumber(state.kanghuProducts),
  },
]);

const businessSubsidyTop3 = computed(() => {
  return [...dashboardData.value.business]
    .sort((a, b) => b.subsidy - a.subsidy)
    .slice(0, 3)
    .map((item) => ({
      ...item,
      percent:
        totalSubsidyAmount.value > 0
          ? (item.subsidy / totalSubsidyAmount.value) * 100
          : 0,
      orderPercent:
        totalBusinessOrders.value > 0
          ? (item.orders / totalBusinessOrders.value) * 100
          : 0,
    }));
});

const businessTop3 = computed(() => {
  return [...dashboardData.value.business]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((item) => ({
      ...item,
      percent:
        totalBusinessAmount.value > 0
          ? (item.amount / totalBusinessAmount.value) * 100
          : 0,
      orderPercent:
        totalBusinessOrders.value > 0
          ? (item.orders / totalBusinessOrders.value) * 100
          : 0,
    }));
});

const enterpriseLevelData = computed(() => {
  return dashboardData.value.enterprise.levels;
});

const enterpriseTop10 = computed(() => {
  return [...dashboardData.value.enterprise.top10]
    .sort((a, b) => b.subsidy - a.subsidy)
    .slice(0, 10);
});

const supplierTop10 = computed(() => {
  return [...dashboardData.value.supplier.top10]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
});

const scrollToOrderSection = async () => {
  if (!state.showorderdetails) {
    state.showorderdetails = true;
    await nextTick();
  }

  if (!orderDetailSectionRef.value) {
    return;
  }

  const doScroll = () => {
    const headerHeight = stickyHeaderRef.value?.offsetHeight || 0;
    const scrollContainer =
      orderDetailSectionRef.value.closest(".body-wrapper");

    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = orderDetailSectionRef.value.getBoundingClientRect();
      const top =
        targetRect.top -
        containerRect.top +
        scrollContainer.scrollTop -
        headerHeight -
        2;

      scrollContainer.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
      return;
    }

    const top =
      orderDetailSectionRef.value.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      2;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  };

  requestAnimationFrame(doScroll);
};

const getAccountData = async () => {
  const res = await request.post("/getAccountDataForBI", {});
  if (res && res.retcode === "200") {
    state.totalCompanies = toNumber(res.data?.totalCompanies);
    state.recentCompanies = toNumber(res.data?.recentCompanies);
    state.totalAccounts = toNumber(res.data?.totalAccounts);
    state.recentAccounts = toNumber(res.data?.recentAccounts);
  }
};

const getProductData = async () => {
  const res = await request.post("/getProductDataForBI", {});
  if (res && res.retcode === "200") {
    state.totalProducts = toNumber(res.data?.totalProducts);
    state.recentProducts = toNumber(res.data?.recentProducts);
    state.anjuProducts = toNumber(res.data?.anjuProducts);
    state.recentAnjuProducts = toNumber(res.data?.recentAnjuProducts);
    state.yuexiangProducts = toNumber(res.data?.yuexiangProducts);
    state.recentYuexiangProducts = toNumber(res.data?.recentYuexiangProducts);
    state.kanghuProducts = toNumber(res.data?.kanghuProducts);
    state.recentKanghuProducts = toNumber(res.data?.recentKanghuProducts);
    state.anjucompanies = toNumber(res.data?.anjucompanies);
    state.yuexiangcompanies = toNumber(res.data?.yuexiangcompanies);
    state.kanghucompanies = toNumber(res.data?.kanghucompanies);
  }
};

const getOrderData = async () => {
  const res = await request.post("/getOrderDataForBI", {});
  if (res && res.retcode === "200") {
    state.totalOrders = toNumber(res.data?.totalOrders);
    state.recentOrders = toNumber(res.data?.recentOrders);
    state.totalAmount = toNumber(res.data?.totalAmount);
    state.totalSubsidy = toNumber(res.data?.totalSubsidy);
    state.recentAmount = toNumber(res.data?.recentAmount);
    state.anjuOrders = toNumber(res.data?.anjuOrders);
    state.recentAnjuOrders = toNumber(res.data?.recentAnjuOrders);
    state.anjuAmount = toNumber(res.data?.anjuAmount);
    state.recentAnjuAmount = toNumber(res.data?.recentAnjuAmount);
    state.yuexiangOrders = toNumber(res.data?.yuexiangOrders);
    state.recentYuexiangOrders = toNumber(res.data?.recentYuexiangOrders);
    state.yuexiangAmount = toNumber(res.data?.yuexiangAmount);
    state.recentYuexiangAmount = toNumber(res.data?.recentYuexiangAmount);
    state.kanghuOrders = toNumber(res.data?.kanghuOrders);
    state.recentKanghuOrders = toNumber(res.data?.recentKanghuOrders);
    state.kanghuAmount = toNumber(res.data?.kanghuAmount);
    state.recentKanghuAmount = toNumber(res.data?.recentKanghuAmount);
  }
};

const getCompanyProductData = async (categoryid) => {
  const res = await request.post("/getCompanyProductDataForBI", { categoryid });
  const retcode = res?.retcode ?? res?.code;
  if (retcode === "200" || retcode === 200) {
    if (categoryid === "0") {
      state.anjudata = Array.isArray(res?.data) ? res.data : [];
    } else if (categoryid === "1") {
      state.yuexiangdata = Array.isArray(res?.data) ? res.data : [];
    } else if (categoryid === "2") {
      state.kanghudata = Array.isArray(res?.data) ? res.data : [];
    }
  }
};

const getCompanyOrderData = async () => {
  const res = await request.post("/getCCompanyOrderDataForBI", {});
  const retcode = res?.retcode ?? res?.code;
  if (retcode === "200" || retcode === 200) {
    if (Array.isArray(res?.data)) {
      state.ccompanyorderdata = res.data;
      // 将state.ccompanyorderdata数组按照totalsubsidy字段降序排序
      state.ccompanyorderdata.sort((a, b) => {
        return toNumber(b.totalsubsidy) - toNumber(a.totalsubsidy);
      });
    } else if (Array.isArray(res?.data?.data)) {
      state.ccompanyorderdata = res.data.data;
    } else {
      state.ccompanyorderdata = [];
    }
  }
};
const getsupplierDate = async () => {
  const res = await request.post("/getSupplierOrderDataForBI", {});
  if (res && res.code === "200") {
    state.supplierdata = Array.isArray(res.data) ? res.data : [];
  }
};

const fetchDashboardData = async () => {
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
      getsupplierDate(),
    ]);
  } catch (error) {
    ElMessage.error("获取驾驶舱数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

const formatNumber = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString("zh-CN");
};

const formatMoneyByLevel = (value) => {
  const num = Number(value) || 0;
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}亿元`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(2)}万元`;
  }
  return `${num.toLocaleString("zh-CN")}元`;
};

const formatMoneyShort = (value) => {
  const num = Number(value) || 0;
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}亿`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(2)}万`;
  }
  return `${num}`;
};
</script>

<style scoped>
.mobile-cockpit {
  min-height: 100%;
  padding: 4px 12px 16px;
  box-sizing: border-box;
  background: transparent;
  color: #1c2e4a;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 10px 2px 10px;
  margin: 0 0 12px;
  background: linear-gradient(
    180deg,
    rgba(243, 247, 255, 0.92),
    rgba(243, 247, 255, 0.76)
  );
  backdrop-filter: blur(6px);
  border-bottom: none;
}

.sticky-header h1 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
  font-weight: 700;
  color: #103a75;
}

.sticky-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #587090;
}

.scene-tags {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scene-tags :deep(.van-tag) {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.4;
}

.module-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(17, 63, 130, 0.08);
  padding: 14px;
  margin-bottom: 12px;
}

.module-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #12345f;
}

.overview-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-tile {
  border-radius: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f4f8ff 0%, #ffffff 100%);
  border: 1px solid #dbe8ff;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #5b7396;
}

.metric-value {
  margin-top: 8px;
  display: block;
  font-size: 20px;
  line-height: 1.2;
  color: #1677ff;
  letter-spacing: 0.2px;
}

.triplet-metrics {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.triplet-item {
  padding: 10px 8px;
  border-radius: 12px;
  background: #f7faff;
  border: 1px solid #dce8ff;
  text-align: center;
}

.triplet-item span {
  display: block;
  font-size: 11px;
  color: #5d7395;
}

.triplet-item strong {
  display: block;
  margin-top: 6px;
  font-size: 15px;
  color: #1a58b5;
}

.chart-block {
  margin-top: 12px;
}

.level-count-list {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.level-count-item {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e0ebff;
  background: #f8fbff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.level-name {
  font-size: 12px;
  color: #5d7395;
}

.level-count {
  font-size: 13px;
  color: #1d4f96;
}

.chart-block h3,
.ranking-block h3 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #24466f;
}

.section-title-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
}

.section-title-row h3 {
  margin-bottom: 0;
  text-align: center;
}

.detail-link-btn {
  position: absolute;
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

.hero-metric {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eaf3ff 0%, #f8fbff 100%);
  border: 1px solid #d2e4ff;
}

.hero-metric span {
  font-size: 12px;
  color: #5d7395;
}

.hero-metric strong {
  display: block;
  margin-top: 6px;
  font-size: 24px;
  line-height: 1.2;
  color: #1677ff;
}

.ranking-block {
  margin-top: 12px;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: #f7faff;
  border: 1px solid #e0ebff;
}

.rank-item.compact {
  padding: 8px 10px;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.rank-1 {
  background: linear-gradient(135deg, #faad14, #ffd666);
}

.rank-2 {
  background: linear-gradient(135deg, #1677ff, #69b1ff);
}

.rank-3 {
  background: linear-gradient(135deg, #722ed1, #b37feb);
}

.rank-index {
  width: 24px;
  text-align: center;
  color: #4f6484;
  font-size: 12px;
  font-weight: 700;
}

.rank-main {
  flex: 1;
  min-width: 0;
}

.rank-list-business .rank-item {
  align-items: flex-start;
}

.business-rank-head {
  display: flex;
  align-items: center;
  justify-content: center;
}

.business-rank-head .rank-title {
  width: 100%;
  text-align: center;
}

.business-rank-pairs {
  margin-top: 6px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.pair-group {
  width: 42%;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid #d7e7ff;
  background: #edf4ff;
}

.subsidy-group {
  background: linear-gradient(135deg, #eef5ff 0%, #f7fbff 100%);
}

.order-group {
  background: linear-gradient(135deg, #f1f8ff 0%, #f7fcff 100%);
}

.pair-group-title {
  font-size: 10px;
  color: #4f6e98;
  font-weight: 600;
}

.pair-group-content {
  margin-top: 4px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.pair-cell span {
  display: block;
  font-size: 10px;
  color: #6a82a6;
}

.pair-cell strong {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #17498f;
  white-space: nowrap;
}

.rank-title {
  font-size: 13px;
  color: #173964;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-sub {
  margin-top: 2px;
  font-size: 11px;
  color: #6380a7;
}

.rank-value {
  font-size: 12px;
  color: #245ec8;
  font-weight: 700;
}

.rank-value.money {
  color: #1252ab;
}

.vertical-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.order-table-wrap {
  margin-top: 12px;
  overflow-x: auto;
}

.order-table {
  width: 100%;
  min-width: 680px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.order-table .col-index {
  width: 40px;
}

.order-table .col-company {
  width: 120px;
}

.order-table .col-type {
  width: 60px;
}

.order-table .col-product {
  width: 120px;
}

.order-table .col-quantity {
  width: 60px;
}

.order-table .col-amount {
  width: 100px;
}

.order-table .col-total {
  width: 100px;
}

.order-table th,
.order-table td {
  border: 1px solid #e1eaf7;
  padding: 8px 6px;
  font-size: 12px;
  color: #24466f;
  text-align: center;
  vertical-align: middle;
  background: #fff;
}

.order-table thead th {
  background: #f3f8ff;
  color: #2f4f7c;
  font-weight: 700;
}

.order-sticky-index,
.order-sticky-company {
  position: sticky;
  background-clip: padding-box;
}

.order-sticky-index {
  left: 0;
  z-index: 4;
  background: #fff;
  box-shadow: 1px 0 0 #dbe5f3;
}

.order-sticky-company {
  left: 44px;
  z-index: 4;
  background: #fff;
  box-shadow:
    1px 0 0 #dbe5f3,
    6px 0 10px rgba(17, 63, 130, 0.05);
}

.order-table thead .order-sticky-index,
.order-table thead .order-sticky-company {
  z-index: 6;
  background: #f3f8ff;
}

.order-summary-row .order-sticky-index,
.order-summary-row .order-sticky-company {
  background: #f7fbff;
}

.order-summary-row td {
  background: #f7fbff;
  font-weight: 700;
  color: #1f4678;
}

.order-company-cell {
  text-align: left;
  padding-left: 8px;
}

.order-empty {
  color: #6f86a8;
  text-align: center;
  padding: 14px 0;
}

@media (max-width: 360px) {
  .metric-value {
    font-size: 17px;
  }

  .business-rank-head {
    align-items: center;
  }

  .business-rank-pairs {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .pair-group-content {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .level-count-list {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .triplet-metrics {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
