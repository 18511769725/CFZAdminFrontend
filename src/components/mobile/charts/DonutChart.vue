<template>
  <div ref="chartRef" class="donut-chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  colors: {
    type: Array,
    default: () => ["#1677FF", "#52C41A", "#FAAD14", "#722ED1"],
  },
  centerText: {
    type: String,
    default: "",
  },
  unit: {
    type: String,
    default: "",
  },
  legendTop: {
    type: Number,
    default: 8,
  },
  ringWidth: {
    type: Number,
    default: 16,
  },
});

const chartRef = ref(null);
let chart = null;

const renderChart = () => {
  if (!chartRef.value) {
    return;
  }

  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  const total = props.data.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0,
  );
  const safeTotal = total || 0;

  chart.setOption({
    color: props.colors,
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const val = Number(params.value) || 0;
        const percent =
          safeTotal > 0 ? ((val / safeTotal) * 100).toFixed(1) : "0.0";
        return `${params.name}<br/>${val.toLocaleString("zh-CN")} (${percent}%)`;
      },
    },
    legend: {
      bottom: 0,
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#51607A",
        fontSize: 11,
      },
    },
    series: [
      {
        type: "pie",
        radius: [`${72 - props.ringWidth}%`, "72%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        label: {
          show: false,
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
        },
        labelLine: {
          show: false,
        },
        data: props.data,
      },
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "35%",
        style: {
          text: props.centerText,
          fill: "#1C2E4A",
          fontWeight: 700,
          fontSize: 18,
          textAlign: "center",
        },
      },
      {
        type: "text",
        left: "center",
        top: "49%",
        style: {
          text: props.unit,
          fill: "#7888A4",
          fontSize: 12,
          textAlign: "center",
        },
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
  () => [props.data, props.colors, props.centerText, props.unit],
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
.donut-chart {
  width: 100%;
  height: 260px;
}
</style>
