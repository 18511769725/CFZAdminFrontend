<template>
  <div class="content-wrapper">
    <div class="table-wrapper">
      <div class="workzonehead-wrapper">
        <el-input
          v-model.trim="state.getInfoParams.name"
          clearable
          placeholder="企业名称"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-input
          v-model.trim="state.getInfoParams.creditcode"
          clearable
          placeholder="统一社会信用编码"
          style="width: 180px; height: 32px; margin-left: 25px"
        />
        <el-button
          type="primary"
          @click="getCompanies"
          style="margin-left: 25px"
          >点击查询</el-button
        >
        <el-button
          type="primary"
          @click="createCompany"
          style="margin-left: 25px"
          >新建企业信息</el-button
        >
        <!-- <el-button
          type="primary"
          @click="patchcreatcompany"
          style="margin-left: 25px"
          >批量插入企业</el-button
        > -->
      </div>
      <el-table
        :data="state.companylist"
        style="width: 100%; height: calc(100vh - 240px)"
        @row-dblclick="onCompanyTableRowDBClicked"
      >
        <el-table-column fixed prop="id" label="序号" min-width="20%" />
        <el-table-column prop="name" label="企业名称" min-width="30%" />
        <el-table-column
          prop="creditcode"
          label="统一社会编码"
          min-width="30%"
        />
        <el-table-column
          prop="availablecredit"
          label="当前可用额度"
          min-width="30%"
        />
        <el-table-column prop="status" label="企业状态" min-width="30%">
          <template #default="scope">
            {{ showstatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" min-width="40%">
          <template #default="scope">
            <el-button
              type="danger"
              v-if="scope.row.status === 0"
              @click="handleOnline(scope.row)"
              >授权采购</el-button
            >
            <el-button
              type="success"
              v-if="scope.row.status === 1"
              @click="handleOffline(scope.row)"
              >取消授权</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="state.getInfoParams.currentPage"
        :page-size="state.getInfoParams.pageSize"
        layout="total, prev, pager, next"
        :total="state.getInfoParams.totalCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <!-- 企业信息模态窗口 -->
  <el-dialog
    v-model="state.showCompanyInfoDialog"
    width="80%"
    :show-close="false"
    @close="resetForm"
  >
    <div class="dialog-title-wrapper" style="padding-bottom: 15px">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        state.companyInfoForm.id ? "修改重点企业信息" : "创建重点企业信息"
      }}</span>
    </div>
    <el-form :model="state.companyInfoForm" status-icon label-width="120px">
      <div class="line-wrapper">
        <el-form-item label="重点企业名称" prop="name" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.name"
            placeholder="重点企业名称"
          />
        </el-form-item>
        <el-form-item label="统一社会编码" prop="creditcode" style="width: 90%">
          <el-input
            v-model.trim="state.companyInfoForm.creditcode"
            placeholder="统一社会编码"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper">
        <el-form-item label="企业评级" prop="" style="width: 90%">
          <el-select
            v-model="state.companyInfoForm.packageid"
            placeholder="请选择企业评级"
          >
            <el-option
              v-for="item in state.creditpackagelist"
              :key="item.id"
              :label="item.packagename"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="line-wrapper" v-if="state.companyInfoForm.id">
        <el-form-item label="额度操作历史" style="width: 120px"> </el-form-item>
        <el-button
          type="primary"
          size="small"
          @click="addRewardItem"
          style="margin-top: 5px; width: 100px"
          ><el-icon><Plus /></el-icon>授予新额度</el-button
        >
      </div>
      <div
        class="line-wrapper"
        style="width: 90%"
        v-if="state.companyInfoForm.id"
      >
        <el-table :data="state.creditoperatelist" style="width: 100%">
          <el-table-column fixed prop="id" label="序号" min-width="20%" />
          <el-table-column prop="cusername" label="操作人" min-width="30%">
            <template #default="scope">
              {{ showcuserinfo(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="cuserphone" label="联系方式" min-width="30%" />
          <el-table-column prop="type" label="操作类型" min-width="30%">
            <template #default="scope">
              {{ showtypes(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" min-width="30%" />
          <el-table-column prop="validfrom" label="起始日期" min-width="30%">
            <template #default="scope">
              {{ timestamp2date(scope.row.validfrom) }}
            </template>
          </el-table-column>
          <el-table-column prop="validend" label="截至日期" min-width="30%">
            <template #default="scope">
              {{ timestamp2date(scope.row.validend) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="数据状态" min-width="30%">
            <template #default="scope">
              {{ showsopertatus(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column prop="createtime" label="记录时间" min-width="30%">
            <template #default="scope">
              {{ timestamp2datetime(scope.row.createtime) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="Operations" min-width="40%">
            <template #default="scope">
              <el-button
                type="danger"
                v-if="scope.row.status === 0"
                @click="handleOfflineData(scope.row)"
                >数据作废</el-button
              >
              <el-button
                type="success"
                v-if="scope.row.status === 1"
                @click="handleOnlineData(scope.row)"
                >恢复数据</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer-wrapper">
        <span class="dialog-footer">
          <el-button @click="getCreditInfob">dianjiceshi</el-button>
          <el-button @click="abortSaveCompanyInfo">取消</el-button>
          <el-button type="primary" @click="saveCompanyInfo"> 保存 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
  <!-- 项目文件管理模态窗口 -->
  <el-dialog
    v-model="state.showUploadFileDialog"
    width="50%"
    :show-close="true"
    @close="resetProjFileForm"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        "项目相关文件管理"
      }}</span>
    </div>
  </el-dialog>
  <!-- 额度创建模态窗口 -->
  <el-dialog
    v-model="state.showAddCreditDialog"
    width="500px"
    :show-close="true"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title">{{
        "创建额度"
      }}</span>
    </div>
    <div class="col-wrapper" style="width: 100%">
      <el-form-item
        label="奖励额度"
        prop="amount"
        style="width: 100%; margin-top: 15px; text-align: center"
      >
        <el-input-number
          v-model="state.addCreditInfoForm.amount"
          :precision="2"
          :step="0.01"
          :max="9999999999"
          :min="0"
          style="width: 100%"
          placeholder="请输入奖励额度"
        />
      </el-form-item>
      <el-form-item
        label="授予说明"
        prop="year"
        style="width: 100%; margin-top: 15px"
      >
        <el-input
          v-model.trim="state.addCreditInfoForm.desc"
          placeholder="请输入奖励额度授予说明"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="生效日期范围"
        prop="daterange"
        style="width: 100%; margin-top: 15px"
      >
        <el-date-picker
          v-model="state.addCreditInfoForm.daterange"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          :size="default"
        />
      </el-form-item>
      <el-button
        style="width: 100%; margin-top: 15px"
        type="success"
        size="big"
        @click="submitCreateCredit()"
        ><el-icon><Plus /></el-icon>创建额度</el-button
      >
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from "vue";
import request from "../../utils/request";
import { onMounted } from "vue";
import store from "../../store";
import { timestamp2date, timestamp2datetime } from "../../utils";
import { ElMessage, ElMessageBox } from "element-plus";

import { download } from "../../utils/request";

const state = reactive({
  fileTempList: [],
  companylist: [],
  creditoperatelist: [],
  showCompanyInfoDialog: false,
  showUploadFileDialog: false,
  showAddCreditDialog: false,
  creditpackagelist: [],
  getInfoParams: {
    totalCount: 0,
    currentPage: 1,
    pageSize: 30,
    name: "",
    creditcode: "",
  },
  companyInfoForm: {
    id: "",
    name: "",
    creditcode: "",
    rewardrecords: [],
    consumerecords: [],
    approvername: "",
    phone: "",
    status: 0,
    packageid: 0,
  },
  addCreditInfoForm: {
    amount: "",
    desc: "",
    daterange: "",
  },
});

const getAllPackages = () => {
  let payload = {};
  request.post("/getallpackages", payload).then((res) => {
    if (res && res.retcode === "200" && res.data) {
      state.creditpackagelist = res.data;
    } else {
      ElMessage.error("获取额度配置列表失败！");
    }
  });
};

// 添加奖励历史记录
const addRewardItem = () => {
  state.addCreditInfoForm.amount = "";
  state.addCreditInfoForm.desc = "";
  state.addCreditInfoForm.daterange = "";
  state.showAddCreditDialog = true;
};

// 提交创建额度
const submitCreateCredit = () => {
  if (
    !state.addCreditInfoForm.amount ||
    !state.addCreditInfoForm.desc ||
    !state.addCreditInfoForm.daterange ||
    state.addCreditInfoForm.daterange.length < 2
  ) {
    ElMessageBox.alert("请填写必要信息！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  let tip_text = "确认要为企业授予额度?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        ccompanyid: state.companyInfoForm.id,
        amount: state.addCreditInfoForm.amount,
        desc: state.addCreditInfoForm.desc,
        daterange: state.addCreditInfoForm.daterange,
        packageid: state.companyInfoForm.packageid,
      };
      request.post("/submitcreatecredit", payload).then((res) => {
        if (res && res.retcode === "200") {
          ElMessage({
            message: "额度创建成功！",
            type: "success",
          });
          getCreditInfo(state.companyInfoForm.id);
          state.showAddCreditDialog = false;
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const onCompanyTableRowDBClicked = (row, column, event) => {
  state.companyInfoForm.id = row.id;
  state.companyInfoForm.name = row.name;
  state.companyInfoForm.creditcode = row.creditcode;
  state.companyInfoForm.approvername = row.approvername;
  state.companyInfoForm.phone = row.phone;
  state.companyInfoForm.packageid = row.packageid;

  getCreditInfo(state.companyInfoForm.id);

  state.showCompanyInfoDialog = true;
};

const getCreditInfo = (ccompanyid) => {
  let payload = {
    ccompanyid: ccompanyid,
  };
  request.post("/getcreditinfobyccompanyid", payload).then((res) => {
    if (res && res.retcode === "200") {
      state.creditoperatelist = res.data;
    } else {
      ElMessage.error("更新失败！");
    }
  });
};
const getCreditInfob = (ccompanyid) => {
  let payload = {
    ccompanyid: 1,
  };
  request.post("/getcreditinfobyccompanyid", payload).then((res) => {
    if (res && res.retcode === "200") {
      console.info("res", res);
    } else {
      ElMessage.error("更新失败！");
    }
  });
};

const showcuserinfo = (rowinfo) => {
  if (rowinfo.cuserid === "0" || rowinfo.cuserid === 0) {
    return "后台";
  } else {
    return rowinfo.cusername;
  }
};

const showstatus = (status) => {
  if (status === 1) {
    return "在线";
  } else {
    return "已下线";
  }
};
const showsopertatus = (status) => {
  if (status === 1) {
    return "失效";
  } else {
    return "有效";
  }
};
const showtypes = (type) => {
  if (type === "GRANT_CREDIT") {
    return "授予额度";
  } else if (type === "DEDUCT_CREDIT") {
    return "扣减额度";
  } else if (type === "RESTORE_CREDIT") {
    return "恢复额度";
  }
};

const handleOnline = (rowinfo) => {
  let tip_text = "确认要授权采购?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 1,
      };
      request.post("/changeccompanystatus", payload).then((res) => {
        if (res) {
          getCompanies();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOffline = (rowinfo) => {
  let tip_text = "确认要回收授权?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 0,
      };
      request.post("/changeccompanystatus", payload).then((res) => {
        if (res) {
          getCompanies();
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOnlineData = (rowinfo) => {
  let tip_text = "确认要恢复数据?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 0,
      };
      request.post("/changecreditdatastatus", payload).then((res) => {
        if (res) {
          getCreditInfo(state.companyInfoForm.id);
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};
const handleOfflineData = (rowinfo) => {
  let tip_text = "确认要作废数据?";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      let payload = {
        id: rowinfo.id,
        status: 1,
      };
      request.post("/changecreditdatastatus", payload).then((res) => {
        if (res) {
          getCreditInfo(state.companyInfoForm.id);
        } else {
          ElMessage.error("更新失败！");
        }
      });
    })
    .catch(() => {});
};

const createCompany = () => {
  resetForm();
  state.showCompanyInfoDialog = true;
};

// 清除企业信息窗体数据
const resetForm = () => {
  state.companyInfoForm.id = "";
  state.companyInfoForm.name = "";
  state.companyInfoForm.creditcode = "";
  state.companyInfoForm.rewardrecords = [];
  state.companyInfoForm.consumerecords = [];
  state.companyInfoForm.approvername = "";
  state.companyInfoForm.phone = "";
  state.companyInfoForm.status = 0;
  state.companyInfoForm.packageid = 0;
};

const abortSaveCompanyInfo = () => {
  resetForm();
  state.showCompanyInfoDialog = false;
};

const saveCompanyInfo = () => {
  if (!state.companyInfoForm.name) {
    ElMessageBox.alert("企业名称为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.companyInfoForm.creditcode) {
    ElMessageBox.alert("企业信用代码为必填项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }
  if (!state.companyInfoForm.packageid) {
    ElMessageBox.alert("企业评级为必选项！", "保存错误", {
      confirmButtonText: "OK",
    });
    return;
  }

  let tip_text = state.companyInfoForm.id
    ? "是否要更新重点企业信息?"
    : "是否要创建新重点企业?";
  ElMessageBox.confirm(tip_text)
    .then(() => {
      // 发起更新请求
      let payload = {
        id: state.companyInfoForm.id,
        name: state.companyInfoForm.name,
        creditcode: state.companyInfoForm.creditcode,
        approvername: state.companyInfoForm.approvername,
        phone: state.companyInfoForm.phone,
        packageid: state.companyInfoForm.packageid,
      };
      request
        .post("/updateccompany", payload)
        .then((res) => {
          if (res && res.retcode === "200") {
            ElMessage({
              message: "重点企业数据更新成功",
              type: "success",
            });
            // 重新获取数据列表
            getCompanies();
            resetForm();
            state.showCompanyInfoDialog = false;
          } else {
            ElMessage.error("更新商户数据失败！");
          }
        })
        .catch((error) => {
          // 捕获请求失败（如 404、网络错误等）
          console.error("请求失败：", error);
          ElMessage.error(`请求失败：${error.message}`); // 提示具体错误（如 404 Not Found）
        });
    })
    .catch(() => {
      ElMessage.error("更新企业数据失败！");
    });
};

// pageination选择页码时加载项目数据
const handleCurrentChange = (pagenum) => {
  state.getInfoParams.currentPage = pagenum;
  getCompanies();
};

const getCompanies = () => {
  request.post("/getccompanies", state.getInfoParams).then((res) => {
    if (res) {
      state.companylist = res.data;
      state.getInfoParams.totalCount = res.pageination.total_count;
      state.getInfoParams.currentPage = res.pageination.currentPage;
    } else {
      ElMessage.error("获取文件数据失败！");
    }
  });
};

//将以下数据成立成一个对象数组赋值给companiesData，三列分别为name、creditcode、packageid，packageid的值总部型1，领军型2，领跑型3，潜力型4
// 中国中信集团有限公司  9110000010168558XU  总部型
// 中国石油化工集团有限公司  9111000010169286X1  总部型
// 中国中煤能源股份有限公司  91110000710934289T  总部型
// 中国交通建设股份有限公司  91110000710934369E  总部型
// 中粮集团有限公司  91110000101100414N  总部型
// 中国建筑科学研究院有限公司 911100004000011410  总部型
// 中国国际技术智力合作集团有限公司  91110000100006194G  总部型
// 新兴际华集团有限公司  911100001055722912  总部型
// 中国煤炭科工集团有限公司  91110000710935636A  总部型
// 中国能源建设股份有限公司  911100007178398156  总部型
// 中国航空工业集团有限公司  91110000710935732K  总部型
// 中国检验认证（集团）有限公司  91110000101699383Q  总部型
// 招商局集团有限公司 91110000100005220B  总部型
// 国家石油天然气管网集团有限公司 91110000MA01P657XY  总部型
// 中信银行股份有限公司  91110000101690725E  总部型
// 梅赛德斯-奔驰（中国）汽车销售有限公司 9111000071785912X9  总部型
// 天赋动力（北京）科技有限公司  91110108MA01FL55XW  总部型
// 北京泡泡玛特文化创意有限公司  911101055636846881  总部型
// 丰田汽车（中国）投资有限公司  91110000710938183F  总部型
// 中信建投证券股份有限公司  91110000781703453H  总部型
// 阿里巴巴（北京）软件服务有限公司  91110105351646081K  总部型
// 西门子（中国）有限公司 91110000625907585K  总部型
// 日产（中国）投资有限公司  91110000717850555P  总部型
// 壳牌（中国）有限公司  911100006259119981  总部型
// 中国国际金融股份有限公司  91110000625909986U  总部型
// 梅赛德斯一奔驰（北京）零部件贸易服务有限公司  91110000673805372T  总部型
// 北京三快网络科技有限公司  91110105MA001LTR54  总部型
// 中国寰球工程有限公司  91110000101726636L  总部型
// 中信百信银行股份有限公司  91110105MA017C8U57  总部型
// 北京华品博睿网络技术有限公司  911101050896860603  总部型
// 北京华联（SKP）百货有限公司 91110000717865677H  总部型
// 兴业银行股份有限公司北京分行  91110105801124468H  总部型
// 施耐德电气（中国）有限公司 91110105625910426D  总部型
// 书行科技（北京）有限公司  91110105099823161Y  总部型
// 索尼（中国）有限公司  911100006259119201  总部型
// 大众汽车（中国）投资有限公司  911100007109204855  总部型
// 北京高德云图科技有限公司  91110105MA00AURU09  总部型
// 电装（中国）投资有限公司  9111000071093617XG  总部型
// 首创证券股份有限公司  91110000710925892P  总部型
// 雀巢（中国）有限公司  9111000062591083XY  总部型
// 江苏银行股份有限公司北京分行  91110102553079564C  总部型
// 葛兰素史克（中国）投资有限公司 91110000710920274M  总部型
// 北京外企人力资源服务有限公司  9111010574470043X2  总部型
// 中智项目外包服务有限公司  91110105327128452B  总部型
// ABB（中国）有限公司 91110000625910856R  总部型
// 北京陌陌信息技术有限公司  91110105590642547A  总部型
// 佳能（中国）有限公司  91110000625912210F  总部型
// 特斯拉汽车（北京）有限公司 911101050555837099  总部型
// 北京猿力未来科技有限公司  91110108051439371M  总部型
// 艺龙网信息技术（北京）有限公司 91110000717740639D  总部型
// 正大投资股份有限公司  911100006259106535  总部型
// 三星（中国）投资有限公司  91110000625911349W  总部型
// 爱立信（中国）通信有限公司 911100007693505528  总部型
// 康明斯（中国）投资有限公司 91110000625912157K  总部型
// 奥迪（中国）企业管理有限公司  911101056869035025  总部型
// 中国冶金科工集团有限公司  91110000100000948R  总部型
// 国家管网集团北京管道有限公司  911100001011299382  总部型
// 中信信托有限责任公司  91110000101730993Y  总部型
// 中国人民人寿保险股份有限公司  911100007109337022  总部型
// 北京ABB电气传动系统有限公司 91110105600039013J  领军型
// 三星数据系统（中国）有限公司  91110000717740495U  领军型
// 卡特彼勒（中国）投资有限公司  91110000625910602W  领军型
// 中石化石油销售有限责任公司 91110105MA01UQ651A  领军型
// 中国石化销售股份有限公司  91110000100003102B  领军型
// 北京焕然数字科技有限公司  91110105MA0037RD04  领军型
// 中粮糖业有限公司  91110105599645445U  领军型
// 爱尔康（中国）眼科产品有限公司 911101051017710313  领军型
// 北京巨量引擎信息技术有限公司  91110105MA7HJR6W2B  领军型
// NVIDIA技术服务（北京）有限公司  91110105MA017LUR5T  领军型
// 默沙东研发（中国）有限公司 91110000592358144L  领军型
// 元气森林（北京）食品科技集团有限公司  91110108MA004LW69T  领军型
// 爱慕股份有限公司  91110105101756720B  领军型
// 北京陌陌科技有限公司  911101055790551576  领军型
// 北京市金杜律师事务所  31110000E00017891P  领军型
// 利洁时（中国）投资有限公司 9111000008550926X7  领军型
// 北京象鲜科技有限公司  91110105MA0052U868  领军型
// 北京双鹤药业经营有限责任公司  91110108102092858E  领军型
// 安捷伦科技（中国）有限公司 911101056876019446  领军型
// 华润双鹤药业股份有限公司  91110000633796475U  领军型
// 北京正东电子动力集团有限公司  91110000101101150L  领军型
// 中信金属股份有限公司  911100001000071709  领军型
// 日立（中国）有限公司  91110000600041252F  领军型
// 北京梅赛德斯一奔驰销售服务有限公司 91110000057368383N  领军型
// 北京市中伦律师事务所  31110000E00018675X  领军型
// 北京易行出行旅游有限公司  91110108735575307R  领军型
// 北京凯通物资有限公司  91110105101700030J  领军型
// 北京微财科技有限公司  911101080573384678  领军型
// 北京链家置地房地产经纪有限公司 91110105778630759T  领军型
// 中国国际贸易中心股份有限公司  91110000100027884X  领军型
// 北京北辰实业股份有限公司  91110000633791930G  领军型
// 梅赛德斯-奔驰汽车金融有限公司 911100006349463595  领军型
// 瑞士再保险股份有限公司北京分公司  91110000710931918J  领军型
// 慕尼黑再保险公司北京分公司 91110000710931790N  领军型
// 宝马汽车金融（中国）有限公司  91110000717884675K  领军型
// 中粮信托有限责任公司  91110000717825237P  领军型
// 国寿投资保险资产管理有限公司  911100001020321266  领军型
// 新华资产管理股份有限公司  91110000789957546R  领军型
// 大家人寿保险股份有限公司  91110000556828452N  领军型
// 中国石化财务有限责任公司  91110000101692907C  领军型
// 中煤财务有限责任公司  91110000093080969N  领军型
// 阿里健康科技（中国）有限公司  91110105336420260L  领军型
// 北京盒马网络科技有限公司  91110000MA005C760W  领军型
// 苹果研发（北京）有限公司  91110105MA008QM87F  领军型
// 北京城市网邻信息技术有限公司  91110000551350971K  领军型
// 日立能源（中国）有限公司  91110000MA01KAY94F  领军型
// 北京屈臣氏个人用品连锁商店有限公司 91110000717860868T  领军型
// 阿尔卑斯阿尔派（中国）有限公司 91110000625910012U  领军型
// 京东方科技集团股份有限公司 911100001011016602  领军型
// 中国石化集团石油商业储备有限公司  91110000710934860Y  领军型
// 中国石化工程建设有限公司  91110000101692827Q  领军型
// 中粮京华贸易（北京）有限公司  91110105MA01RNX08F  领军型
// 阿里云（北京）科技有限公司 91110105783951338G  领军型
// 梅赛德斯一奔驰（中国）投资有限公司 911100007109397686  领军型
// 正东音乐娱乐咨询（北京）有限公司  91110105681950086F  领军型
// 赛诺菲（中国）投资有限公司 91110000625910733Q  领军型
// 北京东方慧博人力资源顾问股份有限公司  911101056631322078  领军型
// 北京奇元科技有限公司  91110105306401296U  领军型
// 中国电建集团北京勘测设计研究院有限公司 91110000101115237J  领跑型
// 中石化炼化工程（集团）股份有限公司 911100007109349087  领跑型
// 华润紫竹药业有限公司  91110000101939631P  领跑型
// 中视前卫影视传媒有限公司  911101053482731061  领跑型
// 中建一局集团建设发展有限公司  91110000101715726A  领跑型
// 中海油（北京）贸易有限责任公司 91110105573188469Q  领跑型
// 中国石化集团百川经济贸易有限公司  911100001000128930  领跑型
// 北京星光灿烂科技服务有限公司  91110105791605777C  领跑型
// 亚洲华纳（北京）音乐娱乐咨询有限公司  91110105779501836Q  领跑型
// 元保科创（北京）科技有限公司  91110105MA01Q9BC2D  领跑型
// 朴道征信有限公司  91110105MA01YFE547  领跑型
// 宝马（中国）服务有限公司  91110105562078969J  领跑型
// 北京万东医疗科技股份有限公司  9111000063379674X4  领跑型
// 致同会计师事务所（特殊普通合伙）  91110105592343655N  领跑型
// 北京经纬恒润科技股份有限公司  91110105754668875A  领跑型
// 北京住总集团有限责任公司  91110000101110751A  领跑型
// 中国环球广播电视有限公司  91110000MA00CF9L2Q  领跑型
// 途游世界（北京）科技有限公司  91110105MA01AEHA0Y  领跑型
// 京东方现代（北京）显示技术有限公司 91110105737650243U  领跑型
// 环球国际视频通讯社有限公司 91110000717828550T  领跑型
// 中建宏达建筑有限公司  91110000101732075E  领跑型
// 三井物产（中国）有限公司  91110000625910274K  领跑型
// 北京大豪科技股份有限公司  91110000802204910U  领跑型
// 中国石化化工销售有限公司  91110000684353535Y  领跑型
// 中国石油集团长城钻探工程有限公司  91110000678200786A  领跑型
// 中信国际合作有限责任公司  911100001000162889  领跑型
// 北京嘉林药业股份有限公司  911101051016610948  领跑型
// NBA体育文化发展（北京）有限责任公司 91110105670552023U  领跑型
// 中建一局集团第五建筑有限公司  91110000101638302P  领跑型
// 北京世纪卓越快递服务有限公司  91110105738237530H  领跑型
// 北京同程华鼎国际旅行社有限公司 91110102567421682J  领跑型
// 中石化（北京）化工研究院有限公司  91110105MA04DD6F86  领跑型
// 北京市第五建筑工程集团有限公司 9111000010111455XJ  领跑型
// 北京石油化工工程有限公司  911101051016586378  领跑型
// 中国外运股份有限公司  911100007109305601  领跑型
// 中铁十六局集团有限公司 911100001016367613  领跑型
// 北京寻声觅物科技有限公司  91110105MAC360E038  领跑型
// 融通地产（北京）有限责任公司  91110105MA01M79L61  领跑型
// 中智（北京）经济技术合作有限公司  91110000MA01WP7H4Q  领跑型
// 西门子交通技术（北京）有限公司 91110105MA01BMG93U  领跑型
// 北京华贸水世界商城发展有限公司 911100007839531575  领跑型
// 中交一公局集团有限公司 911100001017004524  领跑型
// 北京京东方松彩创新有限公司 91110000600000143M  领跑型
// 北京白龙马云行科技有限公司 91110116MA01JN450M  领跑型
// 联发博动科技（北京）有限公司  91110105795101074A  领跑型
// 华润赛科药业有限责任公司  91110000101208804Q  领跑型
// 北京东方国信科技股份有限公司  91110000633027609B  领跑型
// 北京北辰会展投资有限公司  91110105MA01FERH96  领跑型
// 东风汽车金融有限公司  91110000634988516G  领跑型
// 沃尔沃（中国）投资有限公司 911100007109391192  领跑型
// 北京化学工业集团有限责任公司  91110000101115050K  领跑型
// 北京星巴克咖啡有限公司 91110000600043354R  领跑型
// 中信证券股份有限公司北京分公司 91110101563676514L  领跑型
// 中国民生银行股份有限公司北京国贸支行  9111010580170215X2  领跑型
// 北京儒意景秀网络科技有限公司  91440300708409928Q  领跑型
// 京能集团财务有限公司  91110000117662892G  领跑型
// 中英人寿保险有限公司  91110000710930624Y  领跑型
// 苏伊士环境科技（北京）有限公司 911101087376503668  领跑型
// 中国工商银行股份有限公司北京朝阳支行  911101058016511619  领跑型
// 北京世界星辉科技有限责任公司  911101076949576311  领跑型
// 北京神州汽车租赁有限公司  91110105667530069X  潜力型
// 北京华鲲振宇智能科技有限责任公司  91110113MA02MJWB42  潜力型
// 北京中冶设备研究设计总院有限公司  91110000400835103T  潜力型
// 北京万邦达环保技术股份有限公司 91110000634358477D  潜力型
// 安东石油技术（集团）有限公司  9111000073555037XQ  潜力型
// 北京中国网球公开赛体育推广有限公司 91110105756701026Q  潜力型
// 北京华乐非凡文化传播有限公司  91110101MA01D24Y89  潜力型
// 中信和业投资有限公司  91110000573166702J  潜力型
// 爱马仕（上海）贸易有限公司北京第一分公司  91110105MA020XTQ6L  潜力型
// 中关村科技租赁股份有限公司 91110000057334159N  潜力型
// 央视频融媒体发展有限公司  91110105MA01KG1X7H  潜力型
// 京鼎工程建设有限公司  91110101101692704B  潜力型
// 泰康养老保险股份有限公司  91110000665605848U  潜力型
// 默克雪兰诺（北京）医药经营有限公司 91110101700160523A  潜力型
// 泰康人寿保险有限责任公司北京分公司 91110105801447099X  潜力型
// 宝马（中国）投资有限公司  91110000MA01PG550B  潜力型
// 北京农村商业银行股份有限公司朝阳支行  91110105801657360W  潜力型
// 北京香江兴利房地产开发有限公司 91110000710939856L  潜力型
// 蓝色港湾有限公司  9111000076010040XD  潜力型
// 北京国际信托有限公司  91110000101649941R  潜力型
// 北京七星华电科技集团有限责任公司  91110000700224152G  潜力型
// 康乐保（中国）医疗用品有限公司 91110105660501337A  潜力型
// 欧瑞康纺织技术（北京）有限公司 911101056000075139  潜力型
// 北京大成律师事务所 311100004005689575  潜力型
// 赛特集团有限公司  9111000010169198XH  潜力型
// 星展银行（中国）有限公司北京分行  91110105X00018411H  潜力型
// 北京现代汽车金融有限公司  9111000071788515XN  潜力型
// 北京市盈科律师事务所  311100007263734044  潜力型
// 北京电子控股有限责任公司  91110000633647998H  潜力型
// 普华永道中天会计师事务所（特殊普通合伙）北京分所  91110000067311102Q  潜力型
// 北京瑞普北光电子有限公司  91110105101512996F  潜力型
// 德勤华永会计师事务所（特殊普通合伙）北京分所  911100000573115396  潜力型
// 中国惠普有限公司  91110105329591029H  潜力型
// 安斯泰来（中国）投资有限公司  91110105MA04C7DH7R  潜力型
// 北京晨晶电子有限公司  911101057226119464  潜力型
// 北控水务（中国）投资有限公司  91110105690802464Y  潜力型
// 蒂森克虏伯（中国）投资有限公司 91110000717857343P  潜力型
// 北京十月初五影视传媒有限公司  91110105MA002F6H61  潜力型
// 中电科金仓（北京）科技股份有限公司 911101087177121015  潜力型
// 方正富邦基金管理有限公司  91110000717884915E  潜力型
// 盛世长城国际广告有限公司  91110105625909708U  潜力型
// 西门子财务服务有限责任公司 9111000071092112XF  潜力型
// 太古地产（中国）投资有限公司  91110000690804216M  潜力型
// 锐仕方达人才科技集团有限公司  91110105675054779U  潜力型
// 镁佳（北京）科技有限公司  91110105MA01E50E2N  潜力型
// 北京国遥新天地信息技术股份有限公司 9111010576143898XE  潜力型
// 中信保诚人寿保险有限公司  91110000725010871G  潜力型
// 丰田汽车金融（中国）有限公司  911100007178536250  潜力型
// 中国银行股份有限公司北京朝阳支行  91110105101719508D  潜力型
// 中国光大银行股份有限公司北京新源支行  911101058016874040  潜力型
// 法国再保险公司北京分公司  911100006728006683  潜力型
// 中国农业银行股份有限公司北京朝阳支行  91110105801651962R  潜力型
// 北京银行股份有限公司九龙山支行 91110105801661220F  潜力型
// 北京奇梦岛科技有限公司 91110105MA0212TL65  潜力型
// 丽都饭店有限公司  91110000625906662N  潜力型
// 汇丰银行（中国）有限公司北京分行  91110000X26001175L  潜力型
// 精进电动科技股份有限公司  9111010567235045XY  潜力型
// 北京玻色量子科技有限公司  91110105MA01X9AC4L  潜力型
// 中国建设银行股份有限公司北京朝阳支行  91110105801653677P  潜力型
// 北京华大九天科技股份有限公司  91110105690013756F  潜力型

// const companiesData = [
//   {
//     name: "中国中信集团有限公司",
//     creditcode: "9110000010168558XU",
//     grade: 1,
//   },
//   {
//     name: "中国石油化工集团有限公司",
//     creditcode: "9111000010169286X1",
//     grade: 1,
//   },
//   {
//     name: "中国中煤能源股份有限公司",
//     creditcode: "91110000710934289T",
//     grade: 1,
//   },
//   {
//     name: "中国交通建设股份有限公司",
//     creditcode: "91110000710934369E",
//     grade: 1,
//   },
//   {
//     name: "中粮集团有限公司",
//     creditcode: "91110000101100414N",
//     grade: 1,
//   },
//   {
//     name: "中国建筑科学研究院有限公司",
//     creditcode: "911100004000011410",
//     grade: 1,
//   },
//   {
//     name: "中国国际技术智力合作集团有限公司",
//     creditcode: "91110000100006194G",
//     grade: 1,
//   },
//   {
//     name: "新兴际华集团有限公司",
//     creditcode: "911100001055722912",
//     grade: 1,
//   },
//   {
//     name: "中国煤炭科工集团有限公司",
//     creditcode: "91110000710935636A",
//     grade: 1,
//   },
//   {
//     name: "中国能源建设股份有限公司",
//     creditcode: "911100007178398156",
//     grade: 1,
//   },
//   {
//     name: "中国航空工业集团有限公司",
//     creditcode: "91110000710935732K",
//     grade: 1,
//   },
//   {
//     name: "中国检验认证（集团）有限公司",
//     creditcode: "91110000101699383Q",
//     grade: 1,
//   },
//   {
//     name: "招商局集团有限公司",
//     creditcode: "91110000100005220B",
//     grade: 1,
//   },
//   {
//     name: "国家石油天然气管网集团有限公司",
//     creditcode: "91110000MA01P657XY",
//     grade: 1,
//   },
//   {
//     name: "中信银行股份有限公司",
//     creditcode: "91110000101690725E",
//     grade: 1,
//   },
//   {
//     name: "梅赛德斯-奔驰（中国）汽车销售有限公司",
//     creditcode: "9111000071785912X9",
//     grade: 1,
//   },
//   {
//     name: "天赋动力（北京）科技有限公司",
//     creditcode: "91110108MA01FL55XW",
//     grade: 1,
//   },
//   {
//     name: "北京泡泡玛特文化创意有限公司",
//     creditcode: "911101055636846881",
//     grade: 1,
//   },
//   {
//     name: "丰田汽车（中国）投资有限公司",
//     creditcode: "91110000710938183F",
//     grade: 1,
//   },
//   {
//     name: "中信建投证券股份有限公司",
//     creditcode: "91110000781703453H",
//     grade: 1,
//   },
//   {
//     name: "阿里巴巴（北京）软件服务有限公司",
//     creditcode: "91110105351646081K",
//     grade: 1,
//   },
//   {
//     name: "西门子（中国）有限公司",
//     creditcode: "91110000625907585K",
//     grade: 1,
//   },
//   {
//     name: "日产（中国）投资有限公司",
//     creditcode: "91110000717850555P",
//     grade: 1,
//   },
//   {
//     name: "壳牌（中国）有限公司",
//     creditcode: "911100006259119981",
//     grade: 1,
//   },
//   {
//     name: "中国国际金融股份有限公司",
//     creditcode: "91110000625909986U",
//     grade: 1,
//   },
//   {
//     name: "梅赛德斯一奔驰（北京）零部件贸易服务有限公司",
//     creditcode: "91110000673805372T",
//     grade: 1,
//   },
//   {
//     name: "北京三快网络科技有限公司",
//     creditcode: "91110105MA001LTR54",
//     grade: 1,
//   },
//   {
//     name: "中国寰球工程有限公司",
//     creditcode: "91110000101726636L",
//     grade: 1,
//   },
//   {
//     name: "中信百信银行股份有限公司",
//     creditcode: "91110105MA017C8U57",
//     grade: 1,
//   },
//   {
//     name: "北京华品博睿网络技术有限公司",
//     creditcode: "911101050896860603",
//     grade: 1,
//   },
//   {
//     name: "北京华联（SKP）百货有限公司",
//     creditcode: "91110000717865677H",
//     grade: 1,
//   },
//   {
//     name: "兴业银行股份有限公司北京分行",
//     creditcode: "91110105801124468H",
//     grade: 1,
//   },
//   {
//     name: "施耐德电气（中国）有限公司",
//     creditcode: "91110105625910426D",
//     grade: 1,
//   },
//   {
//     name: "书行科技（北京）有限公司",
//     creditcode: "91110105099823161Y",
//     grade: 1,
//   },
//   {
//     name: "索尼（中国）有限公司",
//     creditcode: "911100006259119201",
//     grade: 1,
//   },
//   {
//     name: "大众汽车（中国）投资有限公司",
//     creditcode: "911100007109204855",
//     grade: 1,
//   },
//   {
//     name: "北京高德云图科技有限公司",
//     creditcode: "91110105MA00AURU09",
//     grade: 1,
//   },
//   {
//     name: "电装（中国）投资有限公司",
//     creditcode: "9111000071093617XG",
//     grade: 1,
//   },
//   {
//     name: "首创证券股份有限公司",
//     creditcode: "91110000710925892P",
//     grade: 1,
//   },
//   {
//     name: "雀巢（中国）有限公司",
//     creditcode: "9111000062591083XY",
//     grade: 1,
//   },
//   {
//     name: "江苏银行股份有限公司北京分行",
//     creditcode: "91110102553079564C",
//     grade: 1,
//   },
//   {
//     name: "葛兰素史克（中国）投资有限公司",
//     creditcode: "91110000710920274M",
//     grade: 1,
//   },
//   {
//     name: "北京外企人力资源服务有限公司",
//     creditcode: "9111010574470043X2",
//     grade: 1,
//   },
//   {
//     name: "中智项目外包服务有限公司",
//     creditcode: "91110105327128452B",
//     grade: 1,
//   },
//   {
//     name: "ABB（中国）有限公司",
//     creditcode: "91110000625910856R",
//     grade: 1,
//   },
//   {
//     name: "北京陌陌信息技术有限公司",
//     creditcode: "91110105590642547A",
//     grade: 1,
//   },
//   {
//     name: "佳能（中国）有限公司",
//     creditcode: "91110000625912210F",
//     grade: 1,
//   },
//   {
//     name: "特斯拉汽车（北京）有限公司",
//     creditcode: "911101050555837099",
//     grade: 1,
//   },
//   {
//     name: "北京猿力未来科技有限公司",
//     creditcode: "91110108051439371M",
//     grade: 1,
//   },
//   {
//     name: "艺龙网信息技术（北京）有限公司",
//     creditcode: "91110000717740639D",
//     grade: 1,
//   },
//   {
//     name: "正大投资股份有限公司",
//     creditcode: "911100006259106535",
//     grade: 1,
//   },
//   {
//     name: "三星（中国）投资有限公司",
//     creditcode: "91110000625911349W",
//     grade: 1,
//   },
//   {
//     name: "爱立信（中国）通信有限公司",
//     creditcode: "911100007693505528",
//     grade: 1,
//   },
//   {
//     name: "康明斯（中国）投资有限公司",
//     creditcode: "91110000625912157K",
//     grade: 1,
//   },
//   {
//     name: "奥迪（中国）企业管理有限公司",
//     creditcode: "911101056869035025",
//     grade: 1,
//   },
//   {
//     name: "中国冶金科工集团有限公司",
//     creditcode: "91110000100000948R",
//     grade: 1,
//   },
//   {
//     name: "国家管网集团北京管道有限公司",
//     creditcode: "911100001011299382",
//     grade: 1,
//   },
//   {
//     name: "中信信托有限责任公司",
//     creditcode: "91110000101730993Y",
//     grade: 1,
//   },
//   {
//     name: "中国人民人寿保险股份有限公司",
//     creditcode: "911100007109337022",
//     grade: 1,
//   },
//   {
//     name: "北京ABB电气传动系统有限公司",
//     creditcode: "91110105600039013J",
//     grade: 2,
//   },
//   {
//     name: "三星数据系统（中国）有限公司",
//     creditcode: "91110000717740495U",
//     grade: 2,
//   },
//   {
//     name: "卡特彼勒（中国）投资有限公司",
//     creditcode: "91110000625910602W",
//     grade: 2,
//   },
//   {
//     name: "中石化石油销售有限责任公司",
//     creditcode: "91110105MA01UQ651A",
//     grade: 2,
//   },
//   {
//     name: "中国石化销售股份有限公司",
//     creditcode: "91110000100003102B",
//     grade: 2,
//   },
//   {
//     name: "北京焕然数字科技有限公司",
//     creditcode: "91110105MA0037RD04",
//     grade: 2,
//   },
//   {
//     name: "中粮糖业有限公司",
//     creditcode: "91110105599645445U",
//     grade: 2,
//   },
//   {
//     name: "爱尔康（中国）眼科产品有限公司",
//     creditcode: "911101051017710313",
//     grade: 2,
//   },
//   {
//     name: "北京巨量引擎信息技术有限公司",
//     creditcode: "91110105MA7HJR6W2B",
//     grade: 2,
//   },
//   {
//     name: "NVIDIA技术服务（北京）有限公司",
//     creditcode: "91110105MA017LUR5T",
//     grade: 2,
//   },
//   {
//     name: "默沙东研发（中国）有限公司",
//     creditcode: "91110000592358144L",
//     grade: 2,
//   },
//   {
//     name: "元气森林（北京）食品科技集团有限公司",
//     creditcode: "91110108MA004LW69T",
//     grade: 2,
//   },
//   {
//     name: "爱慕股份有限公司",
//     creditcode: "91110105101756720B",
//     grade: 2,
//   },
//   {
//     name: "北京陌陌科技有限公司",
//     creditcode: "911101055790551576",
//     grade: 2,
//   },
//   {
//     name: "北京市金杜律师事务所",
//     creditcode: "31110000E00017891P",
//     grade: 2,
//   },
//   {
//     name: "利洁时（中国）投资有限公司",
//     creditcode: "9111000008550926X7",
//     grade: 2,
//   },
//   {
//     name: "北京象鲜科技有限公司",
//     creditcode: "91110105MA0052U868",
//     grade: 2,
//   },
//   {
//     name: "北京双鹤药业经营有限责任公司",
//     creditcode: "91110108102092858E",
//     grade: 2,
//   },
//   {
//     name: "安捷伦科技（中国）有限公司",
//     creditcode: "911101056876019446",
//     grade: 2,
//   },
//   {
//     name: "华润双鹤药业股份有限公司",
//     creditcode: "91110000633796475U",
//     grade: 2,
//   },
//   {
//     name: "北京正东电子动力集团有限公司",
//     creditcode: "91110000101101150L",
//     grade: 2,
//   },
//   {
//     name: "中信金属股份有限公司",
//     creditcode: "911100001000071709",
//     grade: 2,
//   },
//   {
//     name: "日立（中国）有限公司",
//     creditcode: "91110000600041252F",
//     grade: 2,
//   },
//   {
//     name: "北京梅赛德斯一奔驰销售服务有限公司",
//     creditcode: "91110000057368383N",
//     grade: 2,
//   },
//   {
//     name: "北京市中伦律师事务所",
//     creditcode: "31110000E00018675X",
//     grade: 2,
//   },
//   {
//     name: "北京易行出行旅游有限公司",
//     creditcode: "91110108735575307R",
//     grade: 2,
//   },
//   {
//     name: "北京凯通物资有限公司",
//     creditcode: "91110105101700030J",
//     grade: 2,
//   },
//   {
//     name: "北京微财科技有限公司",
//     creditcode: "911101080573384678",
//     grade: 2,
//   },
//   {
//     name: "北京链家置地房地产经纪有限公司",
//     creditcode: "91110105778630759T",
//     grade: 2,
//   },
//   {
//     name: "中国国际贸易中心股份有限公司",
//     creditcode: "91110000100027884X",
//     grade: 2,
//   },
//   {
//     name: "北京北辰实业股份有限公司",
//     creditcode: "91110000633791930G",
//     grade: 2,
//   },
//   {
//     name: "梅赛德斯-奔驰汽车金融有限公司",
//     creditcode: "911100006349463595",
//     grade: 2,
//   },
//   {
//     name: "瑞士再保险股份有限公司北京分公司",
//     creditcode: "91110000710931918J",
//     grade: 2,
//   },
//   {
//     name: "慕尼黑再保险公司北京分公司",
//     creditcode: "91110000710931790N",
//     grade: 2,
//   },
//   {
//     name: "宝马汽车金融（中国）有限公司",
//     creditcode: "91110000717884675K",
//     grade: 2,
//   },
//   {
//     name: "中粮信托有限责任公司",
//     creditcode: "91110000717825237P",
//     grade: 2,
//   },
//   {
//     name: "国寿投资保险资产管理有限公司",
//     creditcode: "911100001020321266",
//     grade: 2,
//   },
//   {
//     name: "新华资产管理股份有限公司",
//     creditcode: "91110000789957546R",
//     grade: 2,
//   },
//   {
//     name: "大家人寿保险股份有限公司",
//     creditcode: "91110000556828452N",
//     grade: 2,
//   },
//   {
//     name: "中国石化财务有限责任公司",
//     creditcode: "91110000101692907C",
//     grade: 2,
//   },
//   {
//     name: "中煤财务有限责任公司",
//     creditcode: "91110000093080969N",
//     grade: 2,
//   },
//   {
//     name: "阿里健康科技（中国）有限公司",
//     creditcode: "91110105336420260L",
//     grade: 2,
//   },
//   {
//     name: "北京盒马网络科技有限公司",
//     creditcode: "91110000MA005C760W",
//     grade: 2,
//   },
//   {
//     name: "苹果研发（北京）有限公司",
//     creditcode: "91110105MA008QM87F",
//     grade: 2,
//   },
//   {
//     name: "北京城市网邻信息技术有限公司",
//     creditcode: "91110000551350971K",
//     grade: 2,
//   },
//   {
//     name: "日立能源（中国）有限公司",
//     creditcode: "91110000MA01KAY94F",
//     grade: 2,
//   },
//   {
//     name: "北京屈臣氏个人用品连锁商店有限公司",
//     creditcode: "91110000717860868T",
//     grade: 2,
//   },
//   {
//     name: "阿尔卑斯阿尔派（中国）有限公司",
//     creditcode: "91110000625910012U",
//     grade: 2,
//   },
//   {
//     name: "京东方科技集团股份有限公司",
//     creditcode: "911100001011016602",
//     grade: 2,
//   },
//   {
//     name: "中国石化集团石油商业储备有限公司",
//     creditcode: "91110000710934860Y",
//     grade: 2,
//   },
//   {
//     name: "中国石化工程建设有限公司",
//     creditcode: "91110000101692827Q",
//     grade: 2,
//   },
//   {
//     name: "中粮京华贸易（北京）有限公司",
//     creditcode: "91110105MA01RNX08F",
//     grade: 2,
//   },
//   {
//     name: "阿里云（北京）科技有限公司",
//     creditcode: "91110105783951338G",
//     grade: 2,
//   },
//   {
//     name: "梅赛德斯一奔驰（中国）投资有限公司",
//     creditcode: "911100007109397686",
//     grade: 2,
//   },
//   {
//     name: "正东音乐娱乐咨询（北京）有限公司",
//     creditcode: "91110105681950086F",
//     grade: 2,
//   },
//   {
//     name: "赛诺菲（中国）投资有限公司",
//     creditcode: "91110000625910733Q",
//     grade: 2,
//   },
//   {
//     name: "北京东方慧博人力资源顾问股份有限公司",
//     creditcode: "911101056631322078",
//     grade: 2,
//   },
//   {
//     name: "北京奇元科技有限公司",
//     creditcode: "91110105306401296U",
//     grade: 2,
//   },
//   {
//     name: "中国电建集团北京勘测设计研究院有限公司",
//     creditcode: "91110000101115237J",
//     grade: 3,
//   },
//   {
//     name: "中石化炼化工程（集团）股份有限公司",
//     creditcode: "911100007109349087",
//     grade: 3,
//   },
//   {
//     name: "华润紫竹药业有限公司",
//     creditcode: "91110000101939631P",
//     grade: 3,
//   },
//   {
//     name: "中视前卫影视传媒有限公司",
//     creditcode: "911101053482731061",
//     grade: 3,
//   },
//   {
//     name: "中建一局集团建设发展有限公司",
//     creditcode: "91110000101715726A",
//     grade: 3,
//   },
//   {
//     name: "中海油（北京）贸易有限责任公司",
//     creditcode: "91110105573188469Q",
//     grade: 3,
//   },
//   {
//     name: "中国石化集团百川经济贸易有限公司",
//     creditcode: "911100001000128930",
//     grade: 3,
//   },
//   {
//     name: "北京星光灿烂科技服务有限公司",
//     creditcode: "91110105791605777C",
//     grade: 3,
//   },
//   {
//     name: "亚洲华纳（北京）音乐娱乐咨询有限公司",
//     creditcode: "91110105779501836Q",
//     grade: 3,
//   },
//   {
//     name: "元保科创（北京）科技有限公司",
//     creditcode: "91110105MA01Q9BC2D",
//     grade: 3,
//   },
//   {
//     name: "朴道征信有限公司",
//     creditcode: "91110105MA01YFE547",
//     grade: 3,
//   },
//   {
//     name: "宝马（中国）服务有限公司",
//     creditcode: "91110105562078969J",
//     grade: 3,
//   },
//   {
//     name: "北京万东医疗科技股份有限公司",
//     creditcode: "9111000063379674X4",
//     grade: 3,
//   },
//   {
//     name: "致同会计师事务所（特殊普通合伙）",
//     creditcode: "91110105592343655N",
//     grade: 3,
//   },
//   {
//     name: "北京经纬恒润科技股份有限公司",
//     creditcode: "91110105754668875A",
//     grade: 3,
//   },
//   {
//     name: "北京住总集团有限责任公司",
//     creditcode: "91110000101110751A",
//     grade: 3,
//   },
//   {
//     name: "中国环球广播电视有限公司",
//     creditcode: "91110000MA00CF9L2Q",
//     grade: 3,
//   },
//   {
//     name: "途游世界（北京）科技有限公司",
//     creditcode: "91110105MA01AEHA0Y",
//     grade: 3,
//   },
//   {
//     name: "京东方现代（北京）显示技术有限公司",
//     creditcode: "91110105737650243U",
//     grade: 3,
//   },
//   {
//     name: "环球国际视频通讯社有限公司",
//     creditcode: "91110000717828550T",
//     grade: 3,
//   },
//   {
//     name: "中建宏达建筑有限公司",
//     creditcode: "91110000101732075E",
//     grade: 3,
//   },
//   {
//     name: "三井物产（中国）有限公司",
//     creditcode: "91110000625910274K",
//     grade: 3,
//   },
//   {
//     name: "北京大豪科技股份有限公司",
//     creditcode: "91110000802204910U",
//     grade: 3,
//   },
//   {
//     name: "中国石化化工销售有限公司",
//     creditcode: "91110000684353535Y",
//     grade: 3,
//   },
//   {
//     name: "中国石油集团长城钻探工程有限公司",
//     creditcode: "91110000678200786A",
//     grade: 3,
//   },
//   {
//     name: "中信国际合作有限责任公司",
//     creditcode: "911100001000162889",
//     grade: 3,
//   },
//   {
//     name: "北京嘉林药业股份有限公司",
//     creditcode: "911101051016610948",
//     grade: 3,
//   },
//   {
//     name: "NBA体育文化发展（北京）有限责任公司",
//     creditcode: "91110105670552023U",
//     grade: 3,
//   },
//   {
//     name: "中建一局集团第五建筑有限公司",
//     creditcode: "91110000101638302P",
//     grade: 3,
//   },
//   {
//     name: "北京世纪卓越快递服务有限公司",
//     creditcode: "91110105738237530H",
//     grade: 3,
//   },
//   {
//     name: "北京同程华鼎国际旅行社有限公司",
//     creditcode: "91110102567421682J",
//     grade: 3,
//   },
//   {
//     name: "中石化（北京）化工研究院有限公司",
//     creditcode: "91110105MA04DD6F86",
//     grade: 3,
//   },
//   {
//     name: "北京市第五建筑工程集团有限公司",
//     creditcode: "9111000010111455XJ",
//     grade: 3,
//   },
//   {
//     name: "北京石油化工工程有限公司",
//     creditcode: "911101051016586378",
//     grade: 3,
//   },
//   {
//     name: "中国外运股份有限公司",
//     creditcode: "911100007109305601",
//     grade: 3,
//   },
//   {
//     name: "中铁十六局集团有限公司",
//     creditcode: "911100001016367613",
//     grade: 3,
//   },
//   {
//     name: "北京寻声觅物科技有限公司",
//     creditcode: "91110105MAC360E038",
//     grade: 3,
//   },
//   {
//     name: "融通地产（北京）有限责任公司",
//     creditcode: "91110105MA01M79L61",
//     grade: 3,
//   },
//   {
//     name: "中智（北京）经济技术合作有限公司",
//     creditcode: "91110000MA01WP7H4Q",
//     grade: 3,
//   },
//   {
//     name: "西门子交通技术（北京）有限公司",
//     creditcode: "91110105MA01BMG93U",
//     grade: 3,
//   },
//   {
//     name: "北京华贸水世界商城发展有限公司",
//     creditcode: "911100007839531575",
//     grade: 3,
//   },
//   {
//     name: "中交一公局集团有限公司",
//     creditcode: "911100001017004524",
//     grade: 3,
//   },
//   {
//     name: "北京京东方松彩创新有限公司",
//     creditcode: "91110000600000143M",
//     grade: 3,
//   },
//   {
//     name: "北京白龙马云行科技有限公司",
//     creditcode: "91110116MA01JN450M",
//     grade: 3,
//   },
//   {
//     name: "联发博动科技（北京）有限公司",
//     creditcode: "91110105795101074A",
//     grade: 3,
//   },
//   {
//     name: "华润赛科药业有限责任公司",
//     creditcode: "91110000101208804Q",
//     grade: 3,
//   },
//   {
//     name: "北京东方国信科技股份有限公司",
//     creditcode: "91110000633027609B",
//     grade: 3,
//   },
//   {
//     name: "北京北辰会展投资有限公司",
//     creditcode: "91110105MA01FERH96",
//     grade: 3,
//   },
//   {
//     name: "东风汽车金融有限公司",
//     creditcode: "91110000634988516G",
//     grade: 3,
//   },
//   {
//     name: "沃尔沃（中国）投资有限公司",
//     creditcode: "911100007109391192",
//     grade: 3,
//   },
//   {
//     name: "北京化学工业集团有限责任公司",
//     creditcode: "91110000101115050K",
//     grade: 3,
//   },
//   {
//     name: "北京星巴克咖啡有限公司",
//     creditcode: "91110000600043354R",
//     grade: 3,
//   },
//   {
//     name: "中信证券股份有限公司北京分公司",
//     creditcode: "91110101563676514L",
//     grade: 3,
//   },
//   {
//     name: "中国民生银行股份有限公司北京国贸支行",
//     creditcode: "9111010580170215X2",
//     grade: 3,
//   },
//   {
//     name: "北京儒意景秀网络科技有限公司",
//     creditcode: "91440300708409928Q",
//     grade: 3,
//   },
//   {
//     name: "京能集团财务有限公司",
//     creditcode: "91110000117662892G",
//     grade: 3,
//   },
//   {
//     name: "中英人寿保险有限公司",
//     creditcode: "91110000710930624Y",
//     grade: 3,
//   },
//   {
//     name: "苏伊士环境科技（北京）有限公司",
//     creditcode: "911101087376503668",
//     grade: 3,
//   },
//   {
//     name: "中国工商银行股份有限公司北京朝阳支行",
//     creditcode: "911101058016511619",
//     grade: 3,
//   },
//   {
//     name: "北京世界星辉科技有限责任公司",
//     creditcode: "911101076949576311",
//     grade: 3,
//   },
//   {
//     name: "北京神州汽车租赁有限公司",
//     creditcode: "91110105667530069X",
//     grade: 4,
//   },
//   {
//     name: "北京华鲲振宇智能科技有限责任公司",
//     creditcode: "91110113MA02MJWB42",
//     grade: 4,
//   },
//   {
//     name: "北京中冶设备研究设计总院有限公司",
//     creditcode: "91110000400835103T",
//     grade: 4,
//   },
//   {
//     name: "北京万邦达环保技术股份有限公司",
//     creditcode: "91110000634358477D",
//     grade: 4,
//   },
//   {
//     name: "安东石油技术（集团）有限公司",
//     creditcode: "9111000073555037XQ",
//     grade: 4,
//   },
//   {
//     name: "北京中国网球公开赛体育推广有限公司",
//     creditcode: "91110105756701026Q",
//     grade: 4,
//   },
//   {
//     name: "北京华乐非凡文化传播有限公司",
//     creditcode: "91110101MA01D24Y89",
//     grade: 4,
//   },
//   {
//     name: "中信和业投资有限公司",
//     creditcode: "91110000573166702J",
//     grade: 4,
//   },
//   {
//     name: "爱马仕（上海）贸易有限公司北京第一分公司",
//     creditcode: "91110105MA020XTQ6L",
//     grade: 4,
//   },
//   {
//     name: "中关村科技租赁股份有限公司",
//     creditcode: "91110000057334159N",
//     grade: 4,
//   },
//   {
//     name: "央视频融媒体发展有限公司",
//     creditcode: "91110105MA01KG1X7H",
//     grade: 4,
//   },
//   {
//     name: "京鼎工程建设有限公司",
//     creditcode: "91110101101692704B",
//     grade: 4,
//   },
//   {
//     name: "泰康养老保险股份有限公司",
//     creditcode: "91110000665605848U",
//     grade: 4,
//   },
//   {
//     name: "默克雪兰诺（北京）医药经营有限公司",
//     creditcode: "91110101700160523A",
//     grade: 4,
//   },
//   {
//     name: "泰康人寿保险有限责任公司北京分公司",
//     creditcode: "91110105801447099X",
//     grade: 4,
//   },
//   {
//     name: "宝马（中国）投资有限公司",
//     creditcode: "91110000MA01PG550B",
//     grade: 4,
//   },
//   {
//     name: "北京农村商业银行股份有限公司朝阳支行",
//     creditcode: "91110105801657360W",
//     grade: 4,
//   },
//   {
//     name: "北京香江兴利房地产开发有限公司",
//     creditcode: "91110000710939856L",
//     grade: 4,
//   },
//   {
//     name: "蓝色港湾有限公司",
//     creditcode: "9111000076010040XD",
//     grade: 4,
//   },
//   {
//     name: "北京国际信托有限公司",
//     creditcode: "91110000101649941R",
//     grade: 4,
//   },
//   {
//     name: "北京七星华电科技集团有限责任公司",
//     creditcode: "91110000700224152G",
//     grade: 4,
//   },
//   {
//     name: "康乐保（中国）医疗用品有限公司",
//     creditcode: "91110105660501337A",
//     grade: 4,
//   },
//   {
//     name: "欧瑞康纺织技术（北京）有限公司",
//     creditcode: "911101056000075139",
//     grade: 4,
//   },
//   {
//     name: "北京大成律师事务所",
//     creditcode: "311100004005689575",
//     grade: 4,
//   },
//   {
//     name: "赛特集团有限公司",
//     creditcode: "9111000010169198XH",
//     grade: 4,
//   },
//   {
//     name: "星展银行（中国）有限公司北京分行",
//     creditcode: "91110105X00018411H",
//     grade: 4,
//   },
//   {
//     name: "北京现代汽车金融有限公司",
//     creditcode: "9111000071788515XN",
//     grade: 4,
//   },
//   {
//     name: "北京市盈科律师事务所",
//     creditcode: "311100007263734044",
//     grade: 4,
//   },
//   {
//     name: "北京电子控股有限责任公司",
//     creditcode: "91110000633647998H",
//     grade: 4,
//   },
//   {
//     name: "普华永道中天会计师事务所（特殊普通合伙）北京分所",
//     creditcode: "91110000067311102Q",
//     grade: 4,
//   },
//   {
//     name: "北京瑞普北光电子有限公司",
//     creditcode: "91110105101512996F",
//     grade: 4,
//   },
//   {
//     name: "德勤华永会计师事务所（特殊普通合伙）北京分所",
//     creditcode: "911100000573115396",
//     grade: 4,
//   },
//   {
//     name: "中国惠普有限公司",
//     creditcode: "91110105329591029H",
//     grade: 4,
//   },
//   {
//     name: "安斯泰来（中国）投资有限公司",
//     creditcode: "91110105MA04C7DH7R",
//     grade: 4,
//   },
//   {
//     name: "北京晨晶电子有限公司",
//     creditcode: "911101057226119464",
//     grade: 4,
//   },
//   {
//     name: "北控水务（中国）投资有限公司",
//     creditcode: "91110105690802464Y",
//     grade: 4,
//   },
//   {
//     name: "蒂森克虏伯（中国）投资有限公司",
//     creditcode: "91110000717857343P",
//     grade: 4,
//   },
//   {
//     name: "北京十月初五影视传媒有限公司",
//     creditcode: "91110105MA002F6H61",
//     grade: 4,
//   },
//   {
//     name: "中电科金仓（北京）科技股份有限公司",
//     creditcode: "911101087177121015",
//     grade: 4,
//   },
//   {
//     name: "方正富邦基金管理有限公司",
//     creditcode: "91110000717884915E",
//     grade: 4,
//   },
//   {
//     name: "盛世长城国际广告有限公司",
//     creditcode: "91110105625909708U",
//     grade: 4,
//   },
//   {
//     name: "西门子财务服务有限责任公司",
//     creditcode: "9111000071092112XF",
//     grade: 4,
//   },
//   {
//     name: "太古地产（中国）投资有限公司",
//     creditcode: "91110000690804216M",
//     grade: 4,
//   },
//   {
//     name: "锐仕方达人才科技集团有限公司",
//     creditcode: "91110105675054779U",
//     grade: 4,
//   },
//   {
//     name: "镁佳（北京）科技有限公司",
//     creditcode: "91110105MA01E50E2N",
//     grade: 4,
//   },
//   {
//     name: "北京国遥新天地信息技术股份有限公司",
//     creditcode: "9111010576143898XE",
//     grade: 4,
//   },
//   {
//     name: "中信保诚人寿保险有限公司",
//     creditcode: "91110000725010871G",
//     grade: 4,
//   },
//   {
//     name: "丰田汽车金融（中国）有限公司",
//     creditcode: "911100007178536250",
//     grade: 4,
//   },
//   {
//     name: "中国银行股份有限公司北京朝阳支行",
//     creditcode: "91110105101719508D",
//     grade: 4,
//   },
//   {
//     name: "中国光大银行股份有限公司北京新源支行",
//     creditcode: "911101058016874040",
//     grade: 4,
//   },
//   {
//     name: "法国再保险公司北京分公司",
//     creditcode: "911100006728006683",
//     grade: 4,
//   },
//   {
//     name: "中国农业银行股份有限公司北京朝阳支行",
//     creditcode: "91110105801651962R",
//     grade: 4,
//   },
//   {
//     name: "北京银行股份有限公司九龙山支行",
//     creditcode: "91110105801661220F",
//     grade: 4,
//   },
//   {
//     name: "北京奇梦岛科技有限公司",
//     creditcode: "91110105MA0212TL65",
//     grade: 4,
//   },
//   {
//     name: "丽都饭店有限公司",
//     creditcode: "91110000625906662N",
//     grade: 4,
//   },
//   {
//     name: "汇丰银行（中国）有限公司北京分行",
//     creditcode: "91110000X26001175L",
//     grade: 4,
//   },
//   {
//     name: "精进电动科技股份有限公司",
//     creditcode: "9111010567235045XY",
//     grade: 4,
//   },
//   {
//     name: "北京玻色量子科技有限公司",
//     creditcode: "91110105MA01X9AC4L",
//     grade: 4,
//   },
//   {
//     name: "中国建设银行股份有限公司北京朝阳支行",
//     creditcode: "91110105801653677P",
//     grade: 4,
//   },
//   {
//     name: "北京华大九天科技股份有限公司",
//     creditcode: "91110105690013756F",
//     grade: 4,
//   },
// ];

// 临时用，不上线
// const patchcreatcompany = () => {
//   // 遍历companiesData数组，每条调用一次接口
//   for (let i = 0; i < companiesData.length; i++) {
//     let arrtemp = [];
//     arrtemp.push(companiesData[i]);
//     let payload = {
//       companiesData: JSON.stringify(arrtemp),
//     };
//     request
//       .post("/patchcreateccompaniesandgrantcoupons", payload)
//       .then((res) => {
//         if (res) {
//           console.log("插入企业数据成功");
//         } else {
//           console.log("插入企业数据失败！");
//         }
//       });
//   }
// };

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  getCompanies();
  getAllPackages();
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  margin-top: 15px;
  height: 64px;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.ml-4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-left: 5px;
}

.content-wrapper {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.table-wrapper {
  width: 100%;
}

.pagination-wrapper {
  width: 90%;
  padding: 0 0 15px 15px;
}

.table-fold-wrapper {
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 0 0 15px;
}

.fold-line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.line-wrapper-center {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.upload-demo {
  width: 160px;
}

.col-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
