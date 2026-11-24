<template>
  <div ref="chartRef" class="supplier-stats-chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const chartRef = ref(null);
let chart = null;

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const renderChart = () => {
  if (!chartRef.value) {
    return;
  }

  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  const source = Array.isArray(props.data) ? props.data : [];
  const names = source.map((item) => item.name || "-");
  const suppliers = source.map((item) => toNumber(item.suppliers));
  const products = source.map((item) => toNumber(item.products));

  chart.setOption({
    color: ["#1677FF", "#52C41A"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#4F6484",
        fontSize: 11,
      },
      data: ["供应商数", "产品数"],
    },
    grid: {
      top: 28,
      left: 64,
      right: 14,
      bottom: 8,
      containLabel: false,
    },
    xAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          color: "#EAF0FA",
        },
      },
      axisLabel: {
        color: "#7A8AA6",
        fontSize: 10,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: names,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#3A5378",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "供应商数",
        type: "bar",
        barWidth: 8,
        barGap: "35%",
        label: {
          show: true,
          position: "right",
          color: "#3168BF",
          fontSize: 10,
          formatter: (params) => `${toNumber(params.value)}家`,
        },
        data: suppliers,
      },
      {
        name: "产品数",
        type: "bar",
        barWidth: 8,
        label: {
          show: true,
          position: "right",
          color: "#2D8F4C",
          fontSize: 10,
          formatter: (params) => `${toNumber(params.value)}项`,
        },
        data: products,
      },
    ],
  });
};

const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style scoped>
.supplier-stats-chart {
  width: 100%;
  height: 190px;
}
</style>
