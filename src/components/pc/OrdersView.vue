<template>
  <div class="content-wrapper">
    <!-- 搜索区域 -->
    <div class="table-wrapper">
      <div class="search-card">
        <div class="search-title">订单查询</div>
        <div class="search-form">
          <el-input
            v-model.trim="state.getInfoParams.contractid"
            clearable
            placeholder="合同编号"
            size="default"
            class="search-input"
          />
          <el-input
            v-model.trim="state.getInfoParams.bcompanyname"
            clearable
            placeholder="供应商名称"
            size="default"
            class="search-input"
          />
          <el-input
            v-model.trim="state.getInfoParams.ccompanyname"
            clearable
            placeholder="采购方企业名称"
            size="default"
            class="search-input"
          />
          <el-input
            v-model.trim="state.getInfoParams.cusername"
            clearable
            placeholder="采购人姓名"
            size="default"
            class="search-input"
          />
          <el-button type="primary" @click="getOrders" class="search-btn">
            <el-icon><Search /></el-icon>
            点击查询
          </el-button>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="table-card">
        <el-table
          :data="state.orderList"
          style="width: 100%"
          @row-dblclick="onCompanyTableRowDBClicked"
          stripe
          border
          :header-cell-style="{
            background: '#f8f9fa',
            color: '#333',
            fontWeight: '500',
          }"
          :empty-text="emptyTableText"
          size="default"
        >
          <el-table-column
            prop="id"
            label="ID"
            min-width="60px"
            align="center"
          />
          <el-table-column
            prop="contractid"
            label="合同编号"
            min-width="100px"
            show-overflow-tooltip
          />
          <el-table-column
            prop="totalprice"
            label="订单价格"
            min-width="70px"
            align="right"
          >
            <template #default="scope">
              <span class="price-text">¥{{ scope.row.totalprice }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="bcompanyname"
            label="供应商"
            min-width="150px"
            show-overflow-tooltip
          />
          <el-table-column
            prop="ccompanyname"
            label="采购方"
            min-width="150px"
            show-overflow-tooltip
          />
          <el-table-column
            prop="cusername"
            label="采购人"
            min-width="60px"
            align="center"
          />
          <el-table-column
            prop="status"
            label="订单状态"
            min-width="80px"
            align="center"
          >
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">{{
                showstatus(scope.row.status)
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createtime" label="订单时间" min-width="180px">
            <template #default="scope">
              {{ timestamp2datetime(scope.row.createtime) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="state.getInfoParams.currentPage"
          :page-size="state.getInfoParams.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="state.getInfoParams.totalCount"
          @current-change="handleCurrentChange"
          background
          size="default"
        />
      </div>
    </div>

    <!-- 订单信息模态窗口 -->
    <el-dialog
      v-model="state.showOrderInfoDialog"
      width="90%"
      :show-close="false"
      @close="resetOrderForm"
      class="order-detail-dialog"
      draggable
    >
      <div class="dialog-header">
        <h2 class="dialog-title">
          <el-icon><Document /></el-icon>
          订单详情
          <span class="contract-id-tag">{{
            state.orderInfoForm.contractid
          }}</span>
        </h2>
      </div>

      <el-scrollbar height="70vh" class="dialog-scrollbar">
        <el-form
          :model="state.orderInfoForm"
          label-width="100px"
          class="detail-form"
        >
          <!-- 第一区域：采购商信息 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><UserFilled /></el-icon>
              <h3>采购商信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="采购企业名称">
                <el-input
                  v-model="state.orderInfoForm.ccompanyname"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="有效额度">
                <el-input
                  v-model="state.orderInfoForm.ccompanyAvailableCredit"
                  readonly
                  class="read-only-input"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="接口人姓名">
                <el-input
                  v-model="state.orderInfoForm.cusername"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="职位信息">
                <el-input
                  v-model="state.orderInfoForm.cusertitle"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="联系方式">
                <el-input
                  v-model="state.orderInfoForm.cuserphone"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 第二区域：供应商信息 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Shop /></el-icon>
              <h3>供应商信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="供应商名称">
                <el-input
                  v-model="state.orderInfoForm.bcompanyname"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="接口人姓名">
                <el-input
                  v-model="state.supplierInfo.bcompanycpname"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="接口人电话">
                <el-input
                  v-model="state.supplierInfo.bcompanycpphone"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="接口人邮件">
                <el-input
                  v-model="state.supplierInfo.bcompanycpmail"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 第三区域：商品信息 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Goods /></el-icon>
              <h3>商品信息</h3>
            </div>
            <div class="form-grid">
              <el-form-item label="订单总额">
                <el-input
                  v-model="state.orderInfoForm.totalprice"
                  :readonly="state.orderInfoForm.status !== 1"
                  class="read-only-input"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="合同总额">
                <el-input
                  v-model="state.orderInfoForm.contractprice"
                  :readonly="state.orderInfoForm.status !== 1"
                  class="read-only-input"
                >
                  <template #prefix>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="订单状态">
                <el-input
                  :value="showstatus(state.orderInfoForm.status)"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
              <el-form-item label="订单创建时间">
                <el-input
                  :value="timestamp2datetime(state.orderInfoForm.createtime)"
                  readonly
                  class="read-only-input"
                />
              </el-form-item>
            </div>

            <!-- 订单内容详情 -->
            <div class="order-content-section">
              <div class="section-subheader">
                <el-icon><List /></el-icon>
                <h4>订单内容</h4>
              </div>
              <div
                v-for="(item, index) in state.orderContentList"
                :key="index"
                class="order-content-item"
              >
                <el-divider content-position="left">
                  <span class="item-title">商品 {{ index + 1 }}</span>
                </el-divider>
                <div class="form-grid">
                  <el-form-item label="单品价格">
                    <el-input
                      v-model="item.singleprice"
                      readonly
                      class="read-only-input"
                    >
                      <template #prefix>¥</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="购买数量">
                    <el-input
                      v-model="item.buyamount"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="金额小计">
                    <el-input
                      v-model="item.singleamount"
                      readonly
                      class="read-only-input"
                    >
                      <template #prefix>¥</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="商品名称">
                    <el-input
                      v-model="item.producttitle"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="计价方式">
                    <el-input
                      v-model="item.pricetype"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item
                    label="套餐说明"
                    v-if="item.pricetype === '套餐计价'"
                    style="width: 600px"
                  >
                    <el-input
                      v-model="item.packagetitle"
                      readonly
                      class="read-only-input"
                    />
                  </el-form-item>
                  <el-form-item label="商品图片" class="image-form-item">
                    <div class="image-list">
                      <div
                        v-if="parseImageList(item.imagelist).length === 0"
                        class="img-placeholder"
                      >
                        <el-icon><Picture /></el-icon>
                        <span>暂无图片</span>
                      </div>
                      <img
                        v-for="(img, imgIndex) in parseImageList(
                          item.imagelist,
                        )"
                        :key="imgIndex"
                        :src="img.url"
                        alt="商品图片"
                        class="preview-img"
                        @click="previewImage(img.url)"
                        loading="lazy"
                      />
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>

          <!-- 第四区域：订单操作历史 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><Clock /></el-icon>
              <h3>订单操作历史</h3>
            </div>
            <el-table
              :data="state.orderActionList"
              border
              style="width: 100%; margin-bottom: 20px"
              stripe
              size="small"
              :empty-text="
                state.orderActionList.length === 0 ? '暂无操作记录' : ''
              "
            >
              <el-table-column
                label="序号"
                type="index"
                :index="(index) => index + 1"
                width="60px"
                align="center"
              />
              <el-table-column
                label="操作人姓名"
                prop="username"
                min-width="120px"
              />
              <el-table-column
                label="联系方式"
                prop="userphone"
                min-width="130px"
              />
              <el-table-column
                label="操作内容"
                prop="actionDesc"
                min-width="150px"
              >
                <template #default="scope">
                  <el-tag size="small">{{
                    getActionDesc(scope.row.action)
                  }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="操作时间"
                prop="timestamp"
                min-width="180px"
              >
                <template #default="scope">
                  {{ timestamp2datetime(scope.row.timestamp) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 第五区域：文件列表 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon><FolderOpened /></el-icon>
              <h3>文件列表</h3>
            </div>
            <div class="form-grid">
              <!-- 合同扫描件 -->
              <el-form-item label="合同扫描件" class="file-form-item">
                <div class="file-upload-wrapper">
                  <el-upload
                    :action="store.state.uploadApi"
                    :data="state.uploadContractFileForm"
                    :on-success="handleContractUploadSuccess"
                    :before-remove="handleRemoveContractFile"
                    :file-list="state.contractFileList"
                    :limit="1"
                    :on-exceed="handleFileExceed"
                    class="upload-component"
                  >
                    <el-button type="primary" size="default">
                      <el-icon><Upload /></el-icon>
                      上传合同扫描件
                    </el-button>
                  </el-upload>
                  <div
                    v-if="state.orderInfoForm.contractfile"
                    class="file-link-wrapper"
                  >
                    <el-button
                      type="primary"
                      text
                      @click="downloadFileOuter(state.contractFileList)"
                      class="file-link-btn"
                    >
                      <el-icon><Download /></el-icon>
                      下载合同扫描件
                    </el-button>
                  </div>
                  <div v-else class="no-file-tip">
                    <el-icon><Document /></el-icon>
                    暂无文件
                  </div>
                </div>
              </el-form-item>

              <!-- 项目结项证明文件 handleRemoveFinishFile-->
              <el-form-item label="结项证明文件" class="file-form-item">
                <div class="file-upload-wrapper">
                  <el-upload
                    :action="store.state.uploadApi"
                    :data="state.uploadOrderCompliteFileForm"
                    :on-success="handleFinishFileUploadSuccess"
                    :before-remove="handleRemoveFinishFile"
                    :file-list="state.finishFileList"
                    :limit="1"
                    :on-exceed="handleFileExceed"
                    class="upload-component"
                  >
                    <el-button type="primary" size="default">
                      <el-icon><Upload /></el-icon>
                      上传结项证明文件
                    </el-button>
                  </el-upload>
                  <div
                    v-if="state.orderInfoForm.finishfiles"
                    class="file-link-wrapper"
                  >
                    <el-button
                      type="primary"
                      text
                      @click="downloadFileOuter(state.finishFileList)"
                      class="file-link-btn"
                    >
                      <el-icon><Download /></el-icon>
                      下载结项证明文件
                    </el-button>
                  </div>
                  <div v-else class="no-file-tip">
                    <el-icon><Document /></el-icon>
                    暂无文件
                  </div>
                </div>
              </el-form-item>

              <!-- 订单终止说明 -->
              <el-form-item label="订单终止说明" class="full-width-item">
                <el-input
                  v-model="state.orderInfoForm.terminatedesc"
                  type="textarea"
                  :disabled="!(state.orderInfoForm.status > -1)"
                  placeholder="请输入终止说明（仅终止订单时填写）"
                  :rows="4"
                  class="terminate-textarea"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </el-scrollbar>

      <!-- 操作按钮区域 -->
      <template #footer>
        <div class="dialog-footer-wrapper">
          <!-- 审核通过：status=0 -->
          <el-button
            type="success"
            @click="updateOrderStatus(1)"
            v-if="state.orderInfoForm.status === 4"
            icon="Check"
          >
            审核通过
          </el-button>
          <!-- 审核不通过：status=0 -->
          <el-button
            type="danger"
            @click="updateOrderStatus(-2)"
            v-if="state.orderInfoForm.status === 4"
            icon="Close"
          >
            审核不通过
          </el-button>
          <!-- 签约完成：status=1 -->
          <el-button
            type="primary"
            @click="updateOrderStatus(2)"
            v-if="state.orderInfoForm.status === 1"
            icon="EditPen"
          >
            签约完成
          </el-button>
          <!-- 订单结项：status=2 -->
          <el-button
            type="success"
            @click="updateOrderStatus(3)"
            v-if="state.orderInfoForm.status === 2"
            icon="CircleCheck"
          >
            订单结项
          </el-button>
          <!-- 服务终止：status>-1 -->
          <el-button
            type="danger"
            @click="updateOrderStatus(-3)"
            v-if="state.orderInfoForm.status > -1"
            icon="SwitchButton"
          >
            服务终止
          </el-button>
          <!-- 关闭按钮 -->
          <el-button @click="state.showOrderInfoDialog = false" icon="Close">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看图片窗体 -->
    <el-dialog
      v-model="state.dialogViewPicVisible"
      class="dialog-preview"
      title="图片预览"
      :close-on-click-modal="true"
      width="80%"
      top="5vh"
    >
      <div class="preview-container">
        <img
          :src="state.curDialogImageUrl"
          alt="Preview Image"
          class="preview-image"
          loading="lazy"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import {
  Plus,
  Delete,
  Search,
  Document,
  UserFilled,
  Shop,
  Goods,
  List,
  Clock,
  FolderOpened,
  Upload,
  Download,
  WarningFilled,
  InfoFilled,
  Picture,
  Check,
  Close,
  EditPen,
  CircleCheck,
  SwitchButton,
  // Stop,
} from "@element-plus/icons-vue";
import { download } from "../../utils/request";

const state = reactive({
  fileTempList: [],
  orderList: [],
  showOrderInfoDialog: false,
  showUploadFileDialog: false,
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    contractid: "",
    bcompanyname: "",
    ccompanyname: "",
    cusername: "",
  },
  dialogViewPicVisible: false,
  curDialogImageUrl: "",
  orderInfoForm: {
    id: "",
    contractid: "",
    bcompanyid: "",
    bcompanyname: "",
    ccompanyid: "",
    ccompanyname: "",
    ccompanyAvailableCredit: "", // 有效额度
    cuserid: "",
    cusername: "",
    ordercontent: "",
    totalprice: "",
    contractprice: "",
    status: "",
    finishfiles: "",
    terminatedesc: "",
    useractionrecords: "",
    contractfile: "",
    createtime: "",
    updatetime: "",
    cusertitle: "",
    cuserphone: "",
  },
  uploadContractFileForm: {
    fileid: "110",
    orderid: "",
    cuserid: "",
    filetype: "ORDER_CONTRACT_FILE",
  },
  uploadOrderCompliteFileForm: {
    fileid: "110",
    orderid: "",
    cuserid: "",
    filetype: "ORDER_COMPLETE_FILE",
  },
  uploadFileList: "",
  category_a_info: {
    id: "",
    title: "",
  },
  category_b_info: {
    id: "",
    title: "",
  },
  // 供应商扩展信息
  supplierInfo: {
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  },
  // 解析后的订单内容列表
  orderContentList: [],
  // 解析后的操作历史列表
  orderActionList: [],
  // 合同文件上传列表
  contractFileList: [],
  // 结项文件上传列表
  finishFileList: [],
});

// 空表格提示文本
const emptyTableText = computed(() => {
  return "暂无订单数据，请调整查询条件后重试";
});

// 根据状态获取标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    // 0-4(主管审核)-1-2-3
    0: "warning", // 待主管审核
    1: "primary", // 待签约
    2: "info", // 服务中
    3: "success", // 已结项
    4: "primary", // 待后台签约
    "-1": "danger", // 用户取消订单
    "-2": "danger", // 审核未通过
    "-3": "danger", // 后台终止
    "-4": "danger", // 主管审核拒绝
  };
  return statusMap[status] || "default";
};

// 解析图片列表字符串
const parseImageList = (imagelistStr) => {
  if (!imagelistStr) return [];
  try {
    return JSON.parse(imagelistStr);
  } catch (e) {
    console.warn("解析图片列表失败:", e);
    return [];
  }
};

// 预览图片
const previewImage = (url) => {
  state.curDialogImageUrl = url;
  state.dialogViewPicVisible = true;
};

// 获取供应商信息
const getSupplierInfo = (bcompanyid) => {
  if (!bcompanyid) return;
  let payload = {
    bcompanyid: bcompanyid,
  };
  request.post("/getbcompanyuserinfobyid", payload).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      console.info("res", res);
      state.supplierInfo.bcompanycpname = res.data[0].bcompanycpname || "";
      state.supplierInfo.bcompanycpphone = res.data[0].bcompanycpphone || "";
      state.supplierInfo.bcompanycpmail = res.data[0].bcompanycpmail || "";
    }
  });
};

// 解析订单内容
const parseOrderContent = (contentStr) => {
  if (!contentStr) {
    state.orderContentList = [];
    return;
  }
  try {
    state.orderContentList = JSON.parse(contentStr);
  } catch (e) {
    console.warn("解析订单内容失败:", e);
    state.orderContentList = [];
  }
};

// 解析操作历史
const parseOrderActionRecords = (recordsStr) => {
  if (!recordsStr) {
    state.orderActionList = [];
    return;
  }
  try {
    state.orderActionList = JSON.parse(recordsStr);
  } catch (e) {
    console.warn("解析操作历史失败:", e);
    state.orderActionList = [];
  }
};

// 获取操作描述
const getActionDesc = (action) => {
  const actionMap = {
    create_order: "创建订单",
    cancel_order: "取消订单",
    approve_order: "审核通过",
    approve_denied: "审核未通过",
    contract_signed: "合同签署",
    order_accomplished: "服务结项",
    order_suspended: "服务后台终止",
  };
  return actionMap[action] || action;
};

// 下载文件的前端方法
const downloadFile = async (uuidname, filename) => {
  try {
    // 给请求头加上user和pass两个字段，值从store里取到
    const response = await axios.post(
      "https://mvpme82.cloud/api/cqtdownload",
      { uuidname, filename }, // 请求参数
      {
        // 关键配置：告诉 Axios 响应是二进制流，不解析 JSON
        responseType: "blob", // 必设！指定响应类型为二进制大对象
        headers: {
          "Content-Type": "application/json", // 后端接收 JSON 请求体，保持不变
          user: "mvpme82",
          pass: "chaoqitong",
        },
      },
    );

    // 处理文件下载（从响应中提取文件流并触发下载）
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });

    // 从响应头中解析文件名（后端已编码，前端自动解码）
    const contentDisposition = response.headers["content-disposition"];
    let fileName = filename;
    if (contentDisposition) {
      // 匹配 filename*=UTF-8'' 后的编码文件名并解码
      const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = decodeURIComponent(fileNameMatch[1]);
      }
    }

    // 创建下载链接并触发点击
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; // 设置下载文件名
    document.body.appendChild(link);
    link.click();

    // 清理资源
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载失败：", error);
    alert("文件下载失败，请重试");
  }
};

// 下载文件
const downloadFileOuter = (fileList) => {
  if (!fileList || fileList.length === 0) {
    ElMessage.warning("暂无文件可下载");
    return;
  }
  let fileName = fileList[0].name;
  let uuidName = fileList[0].url;

  console.info("fileName", fileName);
  console.info("uuidName", uuidName);

  downloadFile(uuidName, fileName);
};

// 文件超出数量限制
const handleFileExceed = () => {
  ElMessage.warning("最多只能上传一个文件");
};
// 删除合同文件
const handleRemoveContractFile = (file, uploadFiles) => {
  request
    .post("/deleteorderattatchfile", {
      orderid: state.orderInfoForm.id,
      doctype: "ORDER_CONTRACT_FILE",
    })
    .then((res) => {
      if (res.retcode === "200") {
        ElMessage.success(`操作成功，已删除文件！`);
        state.orderInfoForm.contractfile = "";
        state.contractFileList = [];
      } else {
        getattachfiles();
        ElMessage.error("操作失败，请重试");
      }
    });
};

// 删除结项文件
const handleRemoveFinishFile = (file, uploadFiles) => {
  request
    .post("/deleteorderattatchfile", {
      orderid: state.orderInfoForm.id,
      doctype: "ORDER_COMPLETE_FILE",
    })
    .then((res) => {
      if (res.retcode === "200") {
        ElMessage.success(`操作成功，已删除文件！`);
        state.orderInfoForm.finishfiles = "";
        state.finishFileList = [];
      } else {
        getattachfiles();
        ElMessage.error("操作失败，请重试");
      }
    });
};

// 合同文件上传成功回调
const handleContractUploadSuccess = (res) => {
  if (res.status === "200" || res.status === 200) {
    state.orderInfoForm.contractfile = res.imgurl;
    state.contractFileList = [];
    state.contractFileList.push({
      name: res.imgurl,
      url: res.timestamp,
    });
    ElMessage.success("合同扫描件上传成功");
  } else {
    ElMessage.error("合同扫描件上传失败");
  }
};

// 结项文件上传成功回调
const handleFinishFileUploadSuccess = (res) => {
  if (res.status === "200" || res.status === 200) {
    state.orderInfoForm.finishfiles = res.imgurl;
    state.finishFileList.push({
      name: res.imgurl,
      url: res.timestamp,
    });
    ElMessage.success("结项证明文件上传成功");
  } else {
    ElMessage.error("结项证明文件上传失败");
  }
};

// 更新订单状态
const updateOrderStatus = (newStatus) => {
  // 终止订单时校验终止说明
  if (newStatus === -3 && !state.orderInfoForm.terminatedesc) {
    ElMessage.warning("请填写订单终止说明！");
    return;
  }
  if (newStatus === 2 && !state.orderInfoForm.contractfile) {
    ElMessage.warning("请上传合同扫描件后再执行签约操作！");
    return;
  }
  if (newStatus === 2) {
    if (!state.orderInfoForm.totalprice || !state.orderInfoForm.contractprice) {
      ElMessage.warning("订单总价及平台合同价不能为空！");
      return;
    }
  }
  if (newStatus === 3 && !state.orderInfoForm.finishfiles) {
    ElMessage.warning("请上传结项证明文件后再执行结项操作！");
    return;
  }

  let payload = {
    orderid: state.orderInfoForm.id,
    newstatus: newStatus,
    userid: store.state.userinfo.userid,
    username: store.state.userinfo.username,
    terminatedesc: state.orderInfoForm.terminatedesc,
    totalpricefromfront: state.orderInfoForm.totalprice,
    contractpricefromfront: state.orderInfoForm.contractprice,
  };

  ElMessageBox.confirm(
    `确认要执行${showstatus(newStatus)}操作吗？`,
    "操作确认",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      request.post("/updateorderstatusfrombmanage", payload).then((res) => {
        if (res.retcode === 200 || res.retcode === "200") {
          ElMessage.success(
            `操作成功，订单状态已更新为${showstatus(newStatus)}`,
          );
          state.showOrderInfoDialog = false;
          // 刷新订单列表
          getOrders();
        } else {
          ElMessage.error("操作失败，请重试");
        }
      });
    })
    .catch(() => {
      ElMessage.info("已取消操作");
    });
};

// 根据状态获取操作key
const getActionKeyByStatus = (status) => {
  const statusMap = {
    1: "approve_order",
    "-1": "order_cancelled",
    "-2": "approve_denied",
    2: "contract_signed",
    3: "order_accomplished",
    "-3": "order_suspended",
  };
  return statusMap[status] || "";
};

const getFirstImageUrl = (imagelistStr) => {
  if (!imagelistStr || typeof imagelistStr !== "string") return "";
  try {
    const imagelist = JSON.parse(imagelistStr);
    if (Array.isArray(imagelist) && imagelist.length > 0 && imagelist[0].url) {
      return imagelist[0].url;
    }
    return "";
  } catch (e) {
    console.warn("解析imagelist失败:", e);
    return "";
  }
};

const handleRemoveImg = (uploadFile, uploadFiles) => {
  state.orderInfoForm.imagelistreal = [];
  state.orderInfoForm.imagelist = [];
  uploadFiles.forEach((item, index) => {
    let curobj = {
      name: item.name,
      url: item.url,
    };
    state.orderInfoForm.imagelistreal.push(curobj);
  });
  state.orderInfoForm.imagelist = state.orderInfoForm.imagelistreal;
};

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 1) {
    ElMessage.error("Picture size can not exceed 1MB!");
    return false;
  }
  return true;
};

const handlePictureCardPreview = (uploadedFile) => {
  state.curDialogImageUrl = uploadedFile.url;
  state.dialogViewPicVisible = true;
};

const handleUploadFileOver = (res) => {
  console.log(state.orderInfoForm.imagelist);
  if (res.status === 200) {
    let curObj = {
      name: state.orderInfoForm.imagelistreal.length + 1,
      url: res.imgurl,
    };
    state.orderInfoForm.imagelistreal.push(curObj);
  } else {
    ElMessage.error("请选择1M以下的图片文件！");
  }
  state.orderInfoForm.imagelist = state.orderInfoForm.imagelistreal;
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.uploadContractFileForm.orderid = row.id;
  state.uploadContractFileForm.cuserid = row.cuserid;

  state.uploadOrderCompliteFileForm.orderid = row.id;
  state.uploadOrderCompliteFileForm.cuserid = row.cuserid;
  // 重置表单
  state.supplierInfo = {
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  };
  state.orderContentList = [];
  state.orderActionList = [];
  state.contractFileList = [];
  state.finishFileList = [];

  // 赋值基础信息
  Object.keys(state.orderInfoForm).forEach((key) => {
    state.orderInfoForm[key] = row[key] || "";
  });

  state.orderInfoForm.status = row.status;

  // 获取采购商有效额度（模拟接口，实际需后端提供）
  // request.post("/getccompanycredit", { id: row.ccompanyid }).then((res) => {
  //   if (res.data) {
  //     state.orderInfoForm.ccompanyAvailableCredit = res.data.credit || "0.00";
  //   }
  // });

  // 获取供应商信息
  getSupplierInfo(row.bcompanyid);

  // 解析订单内容
  parseOrderContent(row.ordercontent);

  // 解析操作历史
  parseOrderActionRecords(row.useractionrecords);

  // 获取合同文件和结项证明文件
  request.post("/getorderattachfiles", { orderid: row.id }).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      // 遍历res.data.data数组，如果当前对象的doctype = "ORDER_CONTRACT_FILE",state.orderInfoForm.contractfile = 对象的filename，state.orderInfoForm.finishfiles = []
      res.data.forEach((item) => {
        console.info("item", item);
        if (item.doctype === "ORDER_CONTRACT_FILE") {
          state.orderInfoForm.contractfile = item.filename;
          state.contractFileList.push({
            name: item.filename,
            url: item.uuidname,
          });
        } else if (item.doctype === "ORDER_COMPLETE_FILE") {
          state.orderInfoForm.finishfiles = item.filename;
          state.finishFileList.push({
            name: item.filename,
            url: item.uuidname,
          });
        }
      });
    }
  });

  state.showOrderInfoDialog = true;
};

const getattachfiles = () => {
  // 获取合同文件和结项证明文件
  request
    .post("/getorderattachfiles", { orderid: state.orderInfoForm.id })
    .then((res) => {
      if (res && res.retcode === "200" && res.data) {
        // 遍历res.data.data数组，如果当前对象的doctype = "ORDER_CONTRACT_FILE",state.orderInfoForm.contractfile = 对象的filename，state.orderInfoForm.finishfiles = []
        res.data.forEach((item) => {
          console.info("item", item);
          if (item.doctype === "ORDER_CONTRACT_FILE") {
            state.orderInfoForm.contractfile = item.filename;
            state.contractFileList = [];
            state.contractFileList.push({
              name: item.filename,
              url: item.uuidname,
            });
          } else if (item.doctype === "ORDER_COMPLETE_FILE") {
            state.orderInfoForm.finishfiles = item.filename;
            state.finishFileList = [];
            state.finishFileList.push({
              name: item.filename,
              url: item.uuidname,
            });
          }
        });
      }
    });
};

const showstatus = (status) => {
  if (status === 0) return "待审核";
  else if (status === 1) return "待签约";
  else if (status === 2) return "服务中";
  else if (status === 3) return "已结项";
  else if (status === 4) return "主管审批通过";
  else if (status === -1) return "用户取消订单";
  else if (status === -2) return "审核未通过";
  else if (status === -3) return "后台终止";
  else if (status === -4) return "主管审批拒绝";
  else return "未知状态";
};

// 清除企业信息窗体数据
const resetOrderForm = () => {
  state.orderInfoForm.id = "";
  state.orderInfoForm.producttitle = "";
  state.orderInfoForm.bcompanyid = "";
  state.orderInfoForm.categoryaid = "";
  state.orderInfoForm.categorybid = "";
  state.orderInfoForm.pricetype = "";
  state.orderInfoForm.originalprice = "";
  state.orderInfoForm.pricefactor = "";
  state.orderInfoForm.detail = "";
  state.orderInfoForm.extrainfo = "";
  state.orderInfoForm.imagelist = [];
  state.orderInfoForm.imagelistreal = [];
  state.orderInfoForm.packageprice = [];
  state.supplierInfo = {
    bcompanycpname: "",
    bcompanycpphone: "",
    bcompanycpmail: "",
  };
  state.orderContentList = [];
  state.orderActionList = [];
  state.contractFileList = [];
  state.finishFileList = [];
};

const resetFileUploadDialogForm = () => {
  state.uploadFileList = "";
};

// 分页切换
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getOrders();
};

// 获取订单列表
const getOrders = () => {
  request.post("/getorders", state.getInfoParams).then((res) => {
    if (res) {
      state.orderList = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error("获取订单数据失败！");
    }
  });
};

// 组件挂载时加载数据
onMounted(() => {
  getOrders();
  console.info("store.state.userinfo", store.state.userinfo);
});
</script>

<style lang="scss" scoped>
// 基础布局优化
.content-wrapper {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
}

// 搜索区域美化
.search-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .search-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 15px;
  }

  .search-input {
    width: 180px;
    flex-shrink: 0;
  }

  .search-btn {
    height: 32px;
    flex-shrink: 0;
  }
}

// 表格区域美化
.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.price-text {
  color: #e6a23c;
  font-weight: 500;
}

// 分页区域
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

// 详情弹窗美化
.order-detail-dialog {
  .dialog-header {
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;

    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      .contract-id-tag {
        font-size: 14px;
        color: #666;
        font-weight: normal;
        background: #f5f7fa;
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 10px;
      }
    }
  }

  .dialog-scrollbar {
    --el-scrollbar-background-color: transparent;
  }

  .detail-form {
    padding: 0 10px;
  }

  // 表单区域样式
  .form-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
        font-weight: 600;
      }
    }

    .section-subheader {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 15px 0;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width-item {
      grid-column: 1 / -1;
    }

    .disabled-input {
      background-color: #f8f9fa;
      color: #666;
    }

    .tips {
      margin-top: 5px;
      font-size: 12px;
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  // 订单内容样式
  .order-content-section {
    margin-top: 20px;

    .order-content-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      border: 1px solid #eee;

      .item-title {
        font-weight: 500;
        color: #333;
      }
    }

    .image-form-item {
      grid-column: 1 / -1;
    }

    .image-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 5px;
    }

    .preview-img {
      width: 100px;
      height: 80px;
      object-fit: cover;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid #eee;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .img-placeholder {
      width: 100px;
      height: 80px;
      border: 1px dashed #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 12px;
      border-radius: 4px;
      gap: 4px;
    }
  }

  // 文件上传区域样式
  .file-form-item {
    display: flex;
    flex-direction: column;
  }

  .file-upload-wrapper {
    margin-top: 5px;
  }

  .upload-component {
    width: 100%;
  }

  .file-link-wrapper {
    display: flex;
    align-items: center;
  }

  .file-link-btn {
    padding: 0;
    height: auto;
    color: #409eff;

    &:hover {
      color: #66b1ff;
    }
  }

  .no-file-tip {
    color: #999;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
  }

  .terminate-textarea {
    resize: vertical;
  }
}

// 弹窗底部按钮区域
.dialog-footer-wrapper {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 10px 0;

  .el-button {
    min-width: 100px;
  }
}

// 图片预览弹窗
.dialog-preview {
  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    max-height: 80vh;
    padding: 10px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr !important;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100% !important;
  }
}

.read-only-input :deep(.el-input__wrapper) {
  background: #f8f9fa; /* 浅背景，而非禁用的灰色 */
  border-color: #e4e7ed; /* 弱化边框 */
  cursor: text; /* 鼠标样式更友好 */
}

.read-only-input :deep(.el-input__inner) {
  color: #303133; /* 保持正常文本色，而非禁用的浅灰色 */
  background: transparent;
}
</style>
