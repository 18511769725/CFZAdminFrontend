<template>
  <div class="fagai-dynamic-container">
    <el-card shadow="hover" class="page-card">
      <!-- 表格顶栏操作按钮区域，左侧对齐 -->
      <div class="line-wrapper">
        <el-button type="primary" :icon="Plus" @click="showDetailDialog('')"
          >创建付款计划</el-button
        >
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="state.planlist"
        border
        stripe
        v-loading="loading"
        class="full-table"
        table-layout="fixed"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        @row-dblclick="showDetailDialog"
      >
        <!-- ID列 -->
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <!-- 标题列 -->
        <el-table-column
          prop="plantitle"
          label="付款计划标识"
          min-width="240"
        />

        <!-- 付款金额列，人民币羊角符号 + 两位小数 + ·元 -->
        <el-table-column prop="payamount" label="付款金额" min-width="150">
          <template #default="scope">
            {{ `¥${scope.row.payamount.toFixed(2)} 元` }}
          </template>
        </el-table-column>

        <!-- 订单总数 -->
        <el-table-column prop="ordercount" label="订单总数" min-width="120" />

        <!-- 操作人列 -->
        <el-table-column prop="opername" label="操作人" min-width="140" />

        <!-- 状态列 0：待标记打款；1：已标记打款；2：放弃计划-->
        <el-table-column label="状态" min-width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.planstatus === 0
                  ? 'warning'
                  : scope.row.planstatus === 1
                    ? 'success'
                    : 'danger'
              "
            >
              {{
                scope.row.planstatus === 0
                  ? "待标记打款"
                  : scope.row.planstatus === 1
                    ? "已标记打款"
                    : "放弃计划"
              }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column label="创建时间" min-width="180" align="center">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.createtime) }}
          </template>
        </el-table-column>

        <!-- 更新时间列 -->
        <el-table-column label="更新时间" min-width="180" align="center">
          <template #default="scope">
            {{ timestamp2datetime(scope.row.updatetime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="showPlanDetailsDialog"
      :title="state.plandetails.id ? '付款计划详情' : '创建付款计划'"
      width="95%"
      top="5vh"
      class="plan-details-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-content">
        <section class="dialog-section summary-section">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">ID</span>
              <el-input :model-value="state.plandetails.id" readonly />
            </div>
            <div class="summary-item">
              <span class="summary-label">付款计划标识</span>
              <el-input v-model="state.plandetails.plantitle" />
            </div>
            <div class="summary-item">
              <span class="summary-label">付款金额</span>
              <el-input
                :model-value="`¥${state.plandetails.paycontractprice.toFixed(2)} 元`"
                readonly
              />
            </div>
            <div class="summary-item">
              <span class="summary-label">订单总数</span>
              <el-input
                :model-value="String(state.plandetails.ordercount)"
                readonly
              />
            </div>
            <div class="summary-item">
              <span class="summary-label">操作人</span>
              <el-input :model-value="state.plandetails.opername" readonly />
            </div>
            <div class="summary-item">
              <span class="summary-label">计划状态</span>
              <el-input :model-value="planStatusText" readonly />
            </div>
            <div class="summary-item">
              <span class="summary-label">创建时间</span>
              <el-input
                :model-value="timestamp2datetime(state.plandetails.createtime)"
                readonly
              />
            </div>
            <div class="summary-item">
              <span class="summary-label">更新时间</span>
              <el-input
                :model-value="timestamp2datetime(state.plandetails.updatetime)"
                readonly
              />
            </div>
          </div>
        </section>

        <section class="dialog-section order-section">
          <div class="section-header">订单列表</div>
          <div class="order-filter-bar">
            <el-input
              v-model="orderSearchForm.contractid"
              clearable
              placeholder="订单号"
              class="filter-item"
            />
            <el-select
              v-model="orderSearchForm.categoryaid"
              class="filter-item"
              placeholder="产品分类"
            >
              <el-option
                v-for="item in categoryaidOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="orderSearchForm.bcompanyname"
              clearable
              placeholder="供应商名称"
              class="filter-item"
            />
            <el-input
              v-model="orderSearchForm.ccompanyname"
              clearable
              placeholder="采购商名称"
              class="filter-item"
            />
            <!-- <el-button type="primary" :icon="Search" @click="handleOrderSearch"
              >搜索</el-button
            > -->
            <el-button @click="resetOrderSearch">重置</el-button>
          </div>
          <div class="order-table-wrap">
            <el-table
              ref="orderTableRef"
              :data="filteredOrders"
              border
              stripe
              class="dialog-order-table"
              table-layout="fixed"
              style="width: 100%"
              row-key="id"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                :selectable="isOrderSelectable"
                :reserve-selection="true"
                width="55"
              />
              <el-table-column prop="id" label="orderid" v-if="false" />
              <el-table-column
                prop="contractid"
                label="订单号"
                min-width="140"
              />
              <el-table-column label="产品分类" min-width="80" align="center">
                <template #default="scope">
                  {{ categoryaidText(scope.row.categoryaid) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="bcompanyname"
                label="供应商名称"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="ccompanyname"
                label="采购商名称"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="contractprice"
                label="付款金额"
                min-width="120"
                align="right"
              >
                <template #default="scope">
                  {{ `¥${scope.row.contractprice.toFixed(2)}` }}
                </template>
              </el-table-column>
              <el-table-column label="结项时间" min-width="180" align="center">
                <template #default="scope">
                  {{ timestamp2datetime(scope.row.completetime) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>

        <section class="dialog-section record-section">
          <div class="section-header">操作记录</div>
          <el-table
            :data="state.plandetails.showoperrecords"
            border
            stripe
            class="record-table"
            table-layout="fixed"
            style="width: 100%"
          >
            <el-table-column
              prop="操作时间"
              label="操作时间"
              width="180"
              align="center"
            />
            <el-table-column prop="content" label="操作内容" min-width="300" />
          </el-table>
        </section>

        <section class="dialog-section footer-section">
          <el-button
            type="danger"
            size="large"
            class="important-pay-btn"
            @click="markAsPaid"
            v-if="state.plandetails.id && state.plandetails.planstatus === 0"
            >标记已打款</el-button
          >
          <div class="footer-right-actions">
            <el-button @click="closePlanDetailsDialog">退出</el-button>
            <el-button
              v-if="!state.plandetails.id || state.plandetails.planstatus === 0"
              type="primary"
              @click="savePlanDetails"
              >保存</el-button
            >
          </div>
        </section>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Delete,
  Edit,
  Search,
  Share,
  Upload,
  Plus,
} from "@element-plus/icons-vue";

const state = reactive({
  planlist: [],
  getInfoParams: {
    page: 1,
    pageSize: 30,
  },
  showorderidcol: false,
  plandetails: {
    id: "",
    plantitle: "",
    plandesc: "",
    paycontractprice: 0,
    ordercount: 0,
    operid: "",
    opername: "",
    operrecord: "",
    planstatus: 0,
    createtime: 0,
    updatetime: 0,
    orderlist: [],
    selectedtable: [],
  },
});

const showPlanDetailsDialog = ref(false);
const orderTableRef = ref<any>(null);
const isSyncingSelection = ref(false);
const orderSearchForm = reactive({
  contractid: "",
  categoryaid: -1,
  bcompanyname: "",
  ccompanyname: "",
});

const categoryaidOptions = [
  { value: -1, label: "全部" },
  { value: 0, label: "安居" },
  { value: 1, label: "悦享" },
  { value: 2, label: "康护" },
];

const markAsPaid = () => {
  // 首先检查当前计划状态是否为待标记打款（0），如果不是，则提示用户“当前计划状态不允许标记已打款”，并返回
  if (state.plandetails.planstatus !== 0) {
    ElMessage.error("当前计划状态不允许标记已打款");
    return;
  }
  // 检查当前计划勾选的订单总数是否大于0，如果不大于0，则提示用户“当前计划未勾选任何订单，无法标记已打款”，并返回
  if (state.plandetails.selectedtable.length <= 0) {
    ElMessage.error("当前计划未勾选任何订单，无法标记已打款");
    return;
  }
  // 弹出提示框，醒目提示，提示用户将标记多少个订单，总额多少，为确认打款状态，标记后，系统将进行结算统计展示，该操作不可撤销，标记后相关订单将无法在其他打款计划中展示，确认要标记已打款吗？
  let tip_text = `即将标记已打款，包含订单 ${state.plandetails.selectedtable.length} 个，订单金额总计 ¥${state.plandetails.paycontractprice.toFixed(2)} 元。确认要标记已打款吗？`;
  ElMessageBox.confirm(tip_text, "确认打款", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 调用接口markaspaid，传入参数为state.plandetails.id和state.plandetails.selectedtable，接口返回成功的标准是res.retcode === "200"，失败则提示“标记已打款失败”
      let payload = {
        id: state.plandetails.id,
        selectedtable: state.plandetails.selectedtable,
        operid: store.state.userinfo.userid,
        opername: store.state.userinfo.username,
      };
      request.post("/markaspaid", payload).then((res) => {
        if (res && res.retcode === "200") {
          ElMessage.success("标记已打款成功！");
          getBillingPlanList(); // 更新主列表
          // 标记已打款后，回调获取最新信息状态，更新基础信息、订单列表及操作记录区域
          updatebillplandetailinfo(state.plandetails.id);
        } else {
          ElMessage.error(res.message || "标记已打款失败！");
        }
      });
    })
    .catch(() => {
      ElMessage.info("已取消标记已打款");
    });
};

const showDetailDialog = (rowinfo) => {
  console.log("showDetailDialog rowinfo:", rowinfo);
  state.plandetails = {
    id: rowinfo?.id || "",
    plantitle: rowinfo?.plantitle || "",
    plandesc: rowinfo?.plandesc || "",
    paycontractprice: rowinfo?.payamount || 0,
    ordercount: rowinfo?.ordercount || 0,
    operid: rowinfo?.operid || store.state.userinfo.userid,
    opername: rowinfo?.opername || store.state.userinfo.username,
    operrecord: rowinfo?.operrecord || "",
    planstatus: rowinfo?.planstatus || 0,
    createtime: rowinfo?.createtime || 0,
    updatetime: rowinfo?.updatetime || 0,
    orderlist: [],
    selectedtable: [],
    showoperrecords: [],
  };

  // 加工showoperrecords数据，将state.plandetails.operrecord字符串解析为JSON数组，如果解析失败，则赋值为null;否则保留每个数组对象中的操作时间列，剩下其他的键值对，整合成一个字符串放到content列中，操作时间列的键名为operateTime，content列的键名为content
  try {
    const operrecordArray = JSON.parse(state.plandetails.operrecord);
    state.plandetails.showoperrecords = operrecordArray.map((item) => {
      const { 操作时间, ...rest } = item;
      const content = Object.entries(rest)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      return { 操作时间, content };
    });
  } catch (error) {
    state.plandetails.showoperrecords = null;
  }
  let payload = { id: state.plandetails.id };

  // 访问接口getorderlistforbillplan获取订单列表数据
  request.post("/getorderlistforbillplan", payload).then((res) => {
    if (res && res.retcode === "200") {
      state.plandetails.orderlist = res.data;
      // 遍历state.plandetails.orderlist，将所有订单的settleplanid值等于state.plandetails.id的订单的id值加入state.plandetails.selectedtable数组中，表示这些订单在付款计划详情中默认被选中。
      state.plandetails.selectedtable = state.plandetails.orderlist
        .filter((order) => order.settleplanid === state.plandetails.id)
        .map((order) => order.id);

      showPlanDetailsDialog.value = true;
    } else {
      ElMessage.error("获取订单列表数据失败！");
    }
  });
};

const handleSelectionChange = (selectedRows) => {
  if (isSyncingSelection.value) return;

  const visibleIds = new Set(filteredOrders.value.map((row) => row.id));
  const selectedIds = new Set(selectedRows.map((row) => row.id));
  const nextSelected = new Set(state.plandetails.selectedtable);

  // 只覆盖当前可见数据的勾选状态，筛选隐藏的数据保持原勾选。
  visibleIds.forEach((id) => nextSelected.delete(id));
  selectedIds.forEach((id) => nextSelected.add(id));

  state.plandetails.selectedtable = Array.from(nextSelected);
  console.log("当前选中订单号列表：", state.plandetails.selectedtable);

  // 计算并显示当前选中订单的总金额
  const selectedOrders = state.plandetails.orderlist.filter((order) =>
    state.plandetails.selectedtable.includes(order.id),
  );
  state.plandetails.paycontractprice = selectedOrders.reduce(
    (sum, order) => sum + order.contractprice,
    0,
  );
  state.plandetails.ordercount = selectedOrders.length;
  ElMessage.info(
    `已选中 ${selectedOrders.length} 个订单，订单金额总计：¥${state.plandetails.paycontractprice.toFixed(2)}`,
  );
};

const isOrderSelectable = () => true;

const operationRecords = ref([
  { index: 1, operateTime: 1750000000, content: "创建付款计划" },
  { index: 2, operateTime: 1750001800, content: "补充订单备注" },
  { index: 3, operateTime: 1750003600, content: "标记计划为已打款" },
]);

const planStatusText = computed(() => {
  if (state.plandetails.planstatus === 0) return "待标记打款";
  if (state.plandetails.planstatus === 1) return "已标记打款";
  return "放弃计划";
});

const filteredOrders = computed(() => {
  const contractid = orderSearchForm.contractid.trim().toLowerCase();
  const bcompanyname = orderSearchForm.bcompanyname.trim().toLowerCase();
  const ccompanyname = orderSearchForm.ccompanyname.trim().toLowerCase();

  return state.plandetails.orderlist.filter((item) => {
    return (
      (!contractid || item.contractid.toLowerCase().includes(contractid)) &&
      (orderSearchForm.categoryaid === -1 ||
        item.categoryaid === orderSearchForm.categoryaid) &&
      (!bcompanyname ||
        item.bcompanyname.toLowerCase().includes(bcompanyname)) &&
      (!ccompanyname || item.ccompanyname.toLowerCase().includes(ccompanyname))
    );
  });
});

watch(
  filteredOrders,
  async (rows) => {
    await nextTick();
    if (!orderTableRef.value) return;

    const selectedSnapshot = [...state.plandetails.selectedtable];
    const selectedSet = new Set(selectedSnapshot);
    isSyncingSelection.value = true;
    orderTableRef.value.clearSelection();
    rows.forEach((row) => {
      if (selectedSet.has(row.id)) {
        orderTableRef.value.toggleRowSelection(row, true);
      }
    });
    await nextTick();
    isSyncingSelection.value = false;
  },
  { flush: "post" },
);

const handleOrderSearch = () => {
  ElMessage.success(`筛选后共 ${filteredOrders.value.length} 条订单`);
};

const resetOrderSearch = () => {
  orderSearchForm.contractid = "";
  orderSearchForm.categoryaid = -1;
  orderSearchForm.bcompanyname = "";
  orderSearchForm.ccompanyname = "";
};

const categoryaidText = (value: number) => {
  const target = categoryaidOptions.find((item) => item.value === value);
  return target ? target.label : "未知";
};

const closePlanDetailsDialog = () => {
  showPlanDetailsDialog.value = false;
};

// 保存行为策略，不关闭窗体，但是提示保存结果；
const savePlanDetails = async () => {
  // 仅编辑已有计划时校验权限，并统一为字符串比较，避免 number/string 误判。
  const currentUserId = String(store.state.userinfo?.userid ?? "");
  const operatorId = String(state.plandetails.operid ?? "");
  if (!currentUserId) {
    ElMessage.error("用户信息缺失，请重新登录后再试！");
    return;
  }

  if (state.plandetails.id && currentUserId !== operatorId) {
    console.log(
      "当前操作人userid:",
      currentUserId,
      "，当前记录的operid:",
      operatorId,
    );
    ElMessage.error("无权限修改非本人操作的记录！");
    return;
  }
  // 1. 先验证付款标识计划是否填写，如果填写了，则请求checksettleplantitle接口，查一下当前数据库里是否有重名的付款计划标识，如果有，则提示用户修改；如果没有，则继续下一步
  if (!state.plandetails.plantitle) {
    ElMessage.error("付款计划标识不能为空！");
    return;
  }
  // 调用异步函数验证付款计划标识是否重复：true=重复，false=不重复。
  const isDuplicate = await checksettleplantitle(
    state.plandetails.plantitle,
    state.plandetails.id,
  );
  if (isDuplicate) {
    ElMessage.error("付款计划标识已存在，请修改！");
    return;
  }

  // 开始提示将要保存的付款计划中包含的订单数以及总金额，确认后再执行保存操作
  let tip_text = `即将保存付款计划，包含订单 ${state.plandetails.ordercount} 个，订单金额总计 ¥${state.plandetails.paycontractprice.toFixed(2)} 元。确认要保存吗？`;
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      // 2. 保存行为策略，调用接口savebillplan，传入state.plandetails中的数据，接口返回成功后提示“保存成功”，失败则提示“保存失败”，接口地址：/savebillplan，传入参数为state.plandetails对象中的字段id、plantitle、plandesc、paycontractprice、ordercount、operid、opername、operrecord、planstatus，以及selectedtable（订单号列表）字段，接口返回成功的标准是res.retcode === "200"，失败则提示“保存失败”
      let payload = {
        id: state.plandetails.id,
        plantitle: state.plandetails.plantitle,
        plandesc: state.plandetails.plandesc,
        paycontractprice: state.plandetails.paycontractprice,
        ordercount: state.plandetails.ordercount,
        operid: state.plandetails.operid,
        opername: state.plandetails.opername,
        operrecord: state.plandetails.operrecord,
        planstatus: state.plandetails.planstatus,
        selectedtable: state.plandetails.selectedtable,
      };
      request.post("/savebillplan", payload).then((res) => {
        if (res && res.retcode === "200") {
          ElMessage.success("保存成功！");
          getBillingPlanList(); // 更新主列表
          // 保存成功后，回调获取最新信息状态，更新基础信息、订单列表及操作记录区域
          updatebillplandetailinfo(res.data.id);
        } else {
          ElMessage.error(res.message || "保存失败！");
        }
      });
    })
    .catch(() => {
      ElMessage.info("已取消保存");
    });
};

const updatebillplandetailinfo = (planid) => {
  let payload = { id: planid };
  request.post("/getbillingplandetails", payload).then((res) => {
    if (res && res.code === "200") {
      const data = res.data;
      state.plandetails.id = data.id;
      state.plandetails.plantitle = data.plantitle;
      state.plandetails.plandesc = data.plandesc;
      state.plandetails.paycontractprice = data.payamount;
      state.plandetails.ordercount = data.ordercount;
      state.plandetails.operid = data.operid;
      state.plandetails.opername = data.opername;
      state.plandetails.operrecord = data.operrecord;
      state.plandetails.planstatus = data.planstatus;
      state.plandetails.createtime = data.createtime;
      state.plandetails.updatetime = data.updatetime;
      state.plandetails.orderlist = data.orderList;
      state.plandetails.selectedtable = state.plandetails.orderlist
        .filter((order) => order.settleplanid === state.plandetails.id)
        .map((order) => order.id);

      // 更新操作记录区域
      try {
        const operrecordArray = JSON.parse(data.operrecord);
        state.plandetails.showoperrecords = operrecordArray.map((item) => {
          const { 操作时间, ...rest } = item;
          const content = Object.entries(rest)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          return { 操作时间, content };
        });
      } catch (error) {
        state.plandetails.showoperrecords = null;
      }
    } else {
      ElMessage.error("获取付款计划详情失败！");
    }
  });
};

// 一个异步函数，checksettleplantitle，返回true表示重复，false表示不重复
const checksettleplantitle = async (
  plantitle: string,
  id?: string,
): Promise<boolean> => {
  let payload = { plantitle, id };
  try {
    const res = await request.post("/checksettleplantitle", payload);
    const successCode = String(res?.code ?? res?.retcode ?? "");
    if (res && successCode === "200") {
      console.log("checksettleplantitle接口返回1：", res);
      return Boolean(res.data);
    } else {
      console.log("checksettleplantitle接口返回2：", res);
      ElMessage.error("验证付款计划标识失败！");
      return true; // 出错时默认认为重复，阻止保存
    }
  } catch (error) {
    console.log("checksettleplantitle接口返回3：", error);
    ElMessage.error("验证付款计划标识异常！");
    return true; // 异常时默认认为重复，阻止保存
  }
};

// 加载状态
const loading = ref(false);

const getBillingPlanList = () => {
  let payload = { ...state.getInfoParams };
  request.post("/getbillingplanlist", payload).then((res) => {
    if (res && res.code === "200") {
      state.planlist = res.data;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

// 处理状态切换（下线/生效）
const handleStatusChange = (row) => {
  const action = row.status === 0 ? "下线" : "生效";
  const newstatus = row.status === 0 ? 1 : 0;
  let tip_text = "确认要执行" + action + "操作吗？";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        newsid: row.id,
        status: newstatus,
      };
      request.post("/changenewsstatus", payload).then((res) => {
        if (res && res.retcode === "200") {
          getBillingPlanList();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

// 页面初始化（实际项目中此处请求接口加载数据）
onMounted(() => {
  loading.value = true;
  // 模拟接口请求延迟
  getBillingPlanList();
  loading.value = false;
});
</script>

<style scoped>
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
}

.line-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 5px;
  flex-shrink: 0;
}

.full-table {
  flex: 1;
  min-height: 0;
  --el-table-row-hover-bg-color: #f8f9fa;
}

:deep(.el-dialog.plan-details-dialog),
:deep(.plan-details-dialog .el-dialog) {
  height: 90vh;
  margin-top: 5vh !important;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.plan-details-dialog .el-dialog__header) {
  padding: 14px 18px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.plan-details-dialog .el-dialog__body) {
  flex: 1;
  min-height: 0;
  padding: 14px 18px 16px;
}

.dialog-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: linear-gradient(180deg, #fafcff 0%, #f6f8fc 100%);
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.dialog-section {
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 12px;
}

.summary-section {
  height: 100px;
  flex-shrink: 0;
  background-color: #fcfdff;
}

.summary-grid {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.summary-label {
  width: 82px;
  flex-shrink: 0;
  font-size: 12px;
  color: #606266;
  text-align: right;
}

.order-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.section-header {
  height: 28px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  flex-shrink: 0;
}

.order-table-wrap {
  flex: 1;
  min-height: 0;
}

.order-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 4px 0 10px;
  border-bottom: 1px dashed #ebeef5;
  margin-bottom: 8px;
}

.filter-item {
  width: 180px;
}

:deep(.dialog-order-table.el-table) {
  height: 100%;
}

.record-section {
  height: 150px;
  flex-shrink: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

:deep(.record-table.el-table) {
  flex: 1;
  min-height: 0;
}

.footer-section {
  height: 56px;
  flex-shrink: 0;
  border-bottom: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #fff;
}

.footer-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

:deep(.important-pay-btn) {
  min-width: 150px;
  height: 44px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background-color: #cf1322;
  border-color: #cf1322;
  box-shadow: 0 6px 14px rgba(207, 19, 34, 0.35);
}

:deep(.important-pay-btn:hover),
:deep(.important-pay-btn:focus) {
  background-color: #e1192a;
  border-color: #e1192a;
}
</style>
